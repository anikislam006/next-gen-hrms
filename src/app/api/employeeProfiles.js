// Employee Management, backed by Supabase (profiles + departments + employee_history).
// Kept separate from api/employees.js, which still holds the older
// code360-backed fetchEmployees()/fetchHierarchy() helpers used by the
// Teams/Org-Hierarchy/Recruitment pickers elsewhere in the app — those are
// out of scope for this pass and must keep working unchanged.
import { supabase } from "@/utils/supabaseClient";

// Falls back to 6 months when an employee's probation length hasn't been
// set explicitly (matches the same 6-month assumption Payroll's Festival
// Bonus calculation already uses for probationers).
export const DEFAULT_PROBATION_MONTHS = 6;

// How many days before an employee's probation ends the "Need Update" card
// should start flagging them, per the "at least 15/20 days" business note.
const PROBATION_NOTICE_WINDOW_DAYS = 20;

// Shapes a Supabase `profiles` row into the field names the existing
// Employee Management UI components already expect (fullName, employeeId,
// joiningDate, etc.) so those components didn't need a full rewrite.
function toLegacyShape(row) {
  return {
    _id: row.id,
    id: row.id,
    employeeId: row.employee_id || row.id.slice(0, 8).toUpperCase(),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    department: row.departments?.name || "",
    departmentId: row.department_id || "",
    designation: row.designation || "",
    role: row.role,
    employmentType: row.employment_type || "Probation",
    status: row.status,
    leftDate: row.left_date,
    joiningDate: row.joining_date,
    probationMonths: row.probation_months,
    createdAt: row.created_at,
    photoUrl: row.photo_url,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    maritalStatus: row.marital_status,
    nationality: row.nationality,
    bloodGroup: row.blood_group,
    presentAddress: row.present_address,
    permanentAddress: row.permanent_address,
    passportNumber: row.passport_number,
    nidNumber: row.nid_number,
    tinNumber: row.tin_number,
    emergencyContact: row.emergency_contact || { name: "", phone: "", relation: "" },
  };
}

const SELECT_COLUMNS = `
  id, employee_id, full_name, email, phone, role, status, left_date, employment_type,
  designation, joining_date, probation_months, photo_url, department_id, created_at,
  date_of_birth, gender, marital_status, nationality, blood_group,
  present_address, permanent_address, passport_number, nid_number, tin_number,
  emergency_contact,
  departments:department_id ( name )
`;

// For an employee on Probation, works out whether they're due for
// evaluation/confirmation and returns a badge to show, or null if not yet
// due. Shared by the "Need Update" count and the Probation & Confirmation
// card's list view so both agree on the same logic.
export function getProbationMilestone(employee) {
  if (employee.employmentType !== "Probation" || !employee.joiningDate) return null;

  const months = employee.probationMonths || DEFAULT_PROBATION_MONTHS;
  const endDate = new Date(employee.joiningDate);
  endDate.setMonth(endDate.getMonth() + months);

  const daysUntilEnd = Math.round((endDate - new Date()) / (1000 * 60 * 60 * 24));

  if (daysUntilEnd < 0) {
    return { badge: "Evaluation Pending", endDate, daysUntilEnd };
  }
  if (daysUntilEnd <= PROBATION_NOTICE_WINDOW_DAYS) {
    return { badge: "Confirmation Pending", endDate, daysUntilEnd };
  }
  return null;
}

// Fetches the full employee list plus lifecycle counts. Client-side
// filter/paginate for now — fine at this headcount; revisit with real
// server-side pagination once the directory is larger.
export async function fetchEmployeesFromSupabase() {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const employees = (data || []).map(toLegacyShape);

  // Card labels match the rebuilt Employee Management dashboard exactly —
  // see "Basic - employee things" doc.
  const employmentCounts = {
    "Active Employee": 0,
    Permanent: 0,
    "Semi Permanent": 0,
    Contract: 0,
    "Probation & Confirmation": 0,
    "Need Update": 0,
    "Inactive employees": 0,
    Left: 0,
  };
  for (const e of employees) {
    if (e.status === "active") employmentCounts["Active Employee"] += 1;
    if (e.status === "locked") employmentCounts["Inactive employees"] += 1;
    if (e.status === "left") employmentCounts.Left += 1;
    if (e.employmentType === "Permanent") employmentCounts.Permanent += 1;
    if (e.employmentType === "Semi Permanent") employmentCounts["Semi Permanent"] += 1;
    if (e.employmentType === "Contract") employmentCounts.Contract += 1;
    if (e.employmentType === "Probation") employmentCounts["Probation & Confirmation"] += 1;
    // "Need Update" combines the old inProgress flag with anyone whose
    // probation confirmation is due or coming up within the notice window.
    if (e.status === "inProgress" || getProbationMilestone(e)) {
      employmentCounts["Need Update"] += 1;
    }
  }

  return {
    success: true,
    data: employees,
    counts: { employmentTypeCounts: employmentCounts, totalEmployees: employees.length },
  };
}

// BIZ-EMP: locking/unlocking an account, replacing the old
// /api/add-locked, /api/add-unlocked endpoints.
export async function setEmployeeLocked(profileId, locked) {
  const { error } = await supabase
    .from("profiles")
    .update({ status: locked ? "locked" : "active" })
    .eq("id", profileId);
  if (error) throw error;
}

// BIZ-EMP-01/05/06: updates a profile and, when designation or joining date
// actually changed, logs a dated history entry with the mandatory remark.
// Also handles the leaver flow (status -> "left" + left_date) for the
// Monthly Left-Employee and Turnover reports.
export async function updateEmployeeProfile({ profileId, updates, previous, remark }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", profileId);
  if (updateError) throw updateError;

  const historyRows = [];
  if (updates.designation !== undefined && updates.designation !== previous.designation) {
    historyRows.push({
      profile_id: profileId,
      change_type: "designation",
      old_value: previous.designation || null,
      new_value: updates.designation || null,
      remark,
      changed_by: user?.id || null,
    });
  }
  if (updates.joining_date !== undefined && updates.joining_date !== previous.joining_date) {
    historyRows.push({
      profile_id: profileId,
      change_type: "joining_date",
      old_value: previous.joining_date || null,
      new_value: updates.joining_date || null,
      remark,
      changed_by: user?.id || null,
    });
  }
  if (updates.status === "left" && previous.status !== "left") {
    historyRows.push({
      profile_id: profileId,
      change_type: "status",
      old_value: previous.status || null,
      new_value: `left (${updates.left_date || "date not set"})`,
      remark: remark || "Marked as left",
      changed_by: user?.id || null,
    });
  }

  if (historyRows.length > 0) {
    const { error: historyError } = await supabase.from("employee_history").insert(historyRows);
    if (historyError) throw historyError;
  }
}

export async function fetchEmployeeHistory(profileId) {
  const { data, error } = await supabase
    .from("employee_history")
    .select("id, change_type, old_value, new_value, remark, effective_date, created_at")
    .eq("profile_id", profileId)
    .order("effective_date", { ascending: false });
  if (error) throw error;
  return data || [];
}
