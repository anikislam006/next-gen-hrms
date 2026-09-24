// Reports module, backed directly by Supabase.
//
// Business Logic Requirements doc, Section I, asks for two SEPARATE
// reporting areas — Employee Information Reports (I.1) and
// Financial/Payroll Reports (I.2) — so the functions below are grouped the
// same way and the Reports screens keep them in separate tabs.
//
// Every function returns { success, columns, rows } where `columns` is
// [{ key, label }] describing how to render/export `rows` generically, so
// one table + CSV-export component in the UI can drive all of these.
//
// Note on scope: the "Employee advance, expense, loans and provident fund
// report" is built here as a PAYROLL-ONLY partial version
// (getAdvanceLoanPfReport) — the Expense module itself is still on the old
// MongoDB backend and has no Supabase data yet, so expense claims can't be
// included until that module is migrated.
import { supabase } from "@/utils/supabaseClient";

const PROFILE_WITH_DEPT = `
  id, employee_id, full_name, email, designation, employment_type, status,
  joining_date, left_date, department_id,
  departments:department_id ( name )
`;

function deptName(row) {
  return row?.departments?.name || "Unassigned";
}

// Same "real employee_id column, else first 8 chars of the profile UUID"
// fallback used everywhere else in the app (employeeProfiles.js) — the
// employee_id column is null for every profile in practice, so without this
// fallback these reports showed a blank Employee ID column.
function employeeIdOf(profileRow) {
  if (!profileRow) return "";
  return profileRow.employee_id || (profileRow.id ? profileRow.id.slice(0, 8).toUpperCase() : "");
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// "YYYY-MM" for a given month/year, defaulting to the current month.
function periodString(month, year) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;
  return `${y}-${pad2(m)}`;
}

function monthRange(month, year) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;
  const start = `${y}-${pad2(m)}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const end = `${nextY}-${pad2(nextM)}-01`;
  return { start, end };
}

/* ============================================================
   I.1 — Employee Information Reports
   ============================================================ */

// 1. Department-wise employee information
export async function getDepartmentWiseEmployeeReport() {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_DEPT)
    .order("department_id", { ascending: true });
  if (error) throw error;

  const rows = (data || [])
    .map((r) => ({
      department: deptName(r),
      employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
      fullName: r.full_name,
      designation: r.designation || "",
      employmentType: r.employment_type || "",
      status: r.status,
    }))
    .sort((a, b) => a.department.localeCompare(b.department) || a.fullName.localeCompare(b.fullName));

  return {
    success: true,
    columns: [
      { key: "department", label: "Department" },
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "designation", label: "Designation" },
      { key: "employmentType", label: "Employment Type" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// 2. Designation-wise employee information
export async function getDesignationWiseEmployeeReport() {
  const { data, error } = await supabase.from("profiles").select(PROFILE_WITH_DEPT);
  if (error) throw error;

  const rows = (data || [])
    .map((r) => ({
      designation: r.designation || "Unassigned",
      employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
      fullName: r.full_name,
      department: deptName(r),
      employmentType: r.employment_type || "",
      status: r.status,
    }))
    .sort((a, b) => a.designation.localeCompare(b.designation) || a.fullName.localeCompare(b.fullName));

  return {
    success: true,
    columns: [
      { key: "designation", label: "Designation" },
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "employmentType", label: "Employment Type" },
      { key: "status", label: "Status" },
    ],
    rows,
  };
}

// 3. 6-month confirmation notification (list) — employees whose 6-month
// mark from joining_date falls in the given month (default: this month).
export async function getSixMonthConfirmationReport({ month, year } = {}) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_DEPT)
    .neq("status", "left")
    .not("joining_date", "is", null);
  if (error) throw error;

  const now = new Date();
  const targetM = month || now.getMonth() + 1;
  const targetY = year || now.getFullYear();

  const rows = (data || [])
    .map((r) => {
      const jd = new Date(r.joining_date);
      const sixMonth = new Date(jd);
      sixMonth.setMonth(sixMonth.getMonth() + 6);
      return { r, sixMonth };
    })
    .filter(({ sixMonth }) => sixMonth.getFullYear() === targetY && sixMonth.getMonth() + 1 === targetM)
    .map(({ r, sixMonth }) => ({
      employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
      fullName: r.full_name,
      department: deptName(r),
      designation: r.designation || "",
      joiningDate: r.joining_date,
      sixMonthDate: sixMonth.toISOString().split("T")[0],
      employmentType: r.employment_type || "",
    }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "joiningDate", label: "Joining Date" },
      { key: "sixMonthDate", label: "6-Month Mark" },
      { key: "employmentType", label: "Employment Type" },
    ],
    rows,
  };
}

// 4. 1-year completion notification (list)
export async function getOneYearCompletionReport({ month, year } = {}) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_DEPT)
    .neq("status", "left")
    .not("joining_date", "is", null);
  if (error) throw error;

  const now = new Date();
  const targetM = month || now.getMonth() + 1;
  const targetY = year || now.getFullYear();

  const rows = (data || [])
    .map((r) => {
      const jd = new Date(r.joining_date);
      const oneYear = new Date(jd);
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      return { r, oneYear };
    })
    .filter(({ oneYear }) => oneYear.getFullYear() === targetY && oneYear.getMonth() + 1 === targetM)
    .map(({ r, oneYear }) => ({
      employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
      fullName: r.full_name,
      department: deptName(r),
      designation: r.designation || "",
      joiningDate: r.joining_date,
      oneYearDate: oneYear.toISOString().split("T")[0],
      employmentType: r.employment_type || "",
    }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "joiningDate", label: "Joining Date" },
      { key: "oneYearDate", label: "1-Year Mark" },
      { key: "employmentType", label: "Employment Type" },
    ],
    rows,
  };
}

// 5. All employee details report
export async function getAllEmployeeDetailsReport() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, employee_id, full_name, email, phone, role, status, left_date,
      employment_type, designation, joining_date, date_of_birth, gender,
      department_id, departments:department_id ( name )
    `)
    .order("full_name", { ascending: true });
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
    fullName: r.full_name,
    email: r.email,
    phone: r.phone || "",
    department: deptName(r),
    designation: r.designation || "",
    role: r.role,
    employmentType: r.employment_type || "",
    status: r.status,
    joiningDate: r.joining_date || "",
    leftDate: r.left_date || "",
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "role", label: "Role" },
      { key: "employmentType", label: "Employment Type" },
      { key: "status", label: "Status" },
      { key: "joiningDate", label: "Joining Date" },
      { key: "leftDate", label: "Leaving Date" },
    ],
    rows,
  };
}

// 6. Monthly new-joiner report
export async function getMonthlyNewJoinersReport({ month, year } = {}) {
  const { start, end } = monthRange(month, year);
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_DEPT)
    .gte("joining_date", start)
    .lt("joining_date", end)
    .order("joining_date", { ascending: true });
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
    fullName: r.full_name,
    department: deptName(r),
    designation: r.designation || "",
    joiningDate: r.joining_date,
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "joiningDate", label: "Joining Date" },
    ],
    rows,
  };
}

// 7. Monthly left-employee report
export async function getMonthlyLeftEmployeesReport({ month, year } = {}) {
  const { start, end } = monthRange(month, year);
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_WITH_DEPT)
    .eq("status", "left")
    .gte("left_date", start)
    .lt("left_date", end)
    .order("left_date", { ascending: true });
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
    fullName: r.full_name,
    department: deptName(r),
    designation: r.designation || "",
    joiningDate: r.joining_date || "",
    leftDate: r.left_date,
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "joiningDate", label: "Joining Date" },
      { key: "leftDate", label: "Leaving Date" },
    ],
    rows,
  };
}

// 8. Monthly turnover report — joiners, leavers, headcount and a turnover %
// for the selected month.
export async function getMonthlyTurnoverReport({ month, year } = {}) {
  const { start, end } = monthRange(month, year);

  const [{ data: allProfiles, error: allErr }, { data: joiners, error: jErr }, { data: leavers, error: lErr }] =
    await Promise.all([
      supabase.from("profiles").select("id, joining_date, left_date, status"),
      supabase.from("profiles").select("id").gte("joining_date", start).lt("joining_date", end),
      supabase.from("profiles").select("id").eq("status", "left").gte("left_date", start).lt("left_date", end),
    ]);
  if (allErr) throw allErr;
  if (jErr) throw jErr;
  if (lErr) throw lErr;

  // Headcount at the start of the month: joined before `start` and (not left, or left on/after `start`).
  const headcountStart = (allProfiles || []).filter((p) => {
    const joined = p.joining_date && p.joining_date < start;
    const notYetLeftAtStart = !p.left_date || p.left_date >= start;
    return joined && notYetLeftAtStart;
  }).length;

  const joinersCount = joiners?.length || 0;
  const leaversCount = leavers?.length || 0;
  const headcountEnd = headcountStart + joinersCount - leaversCount;
  const avgHeadcount = (headcountStart + headcountEnd) / 2 || 1;
  const turnoverRate = ((leaversCount / avgHeadcount) * 100).toFixed(2);

  return {
    success: true,
    columns: [
      { key: "period", label: "Period" },
      { key: "headcountStart", label: "Headcount (Start)" },
      { key: "joiners", label: "New Joiners" },
      { key: "leavers", label: "Employees Left" },
      { key: "headcountEnd", label: "Headcount (End)" },
      { key: "turnoverRate", label: "Turnover Rate (%)" },
    ],
    rows: [
      {
        period: periodString(month, year),
        headcountStart,
        joiners: joinersCount,
        leavers: leaversCount,
        headcountEnd,
        turnoverRate,
      },
    ],
  };
}

// 9. Salary increment report — every logged salary change, most recent first.
export async function getSalaryIncrementReport({ from, to } = {}) {
  let query = supabase
    .from("employee_history")
    .select(`
      id, old_value, new_value, remark, effective_date, created_at,
      profiles:profile_id ( id, employee_id, full_name, department_id, departments:department_id ( name ) )
    `)
    .eq("change_type", "salary")
    .order("effective_date", { ascending: false });

  if (from) query = query.gte("effective_date", from);
  if (to) query = query.lte("effective_date", to);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: employeeIdOf(r.profiles),
    fullName: r.profiles?.full_name || "",
    department: deptName(r.profiles),
    effectiveDate: r.effective_date,
    previousSalary: r.old_value,
    newSalary: r.new_value,
    remark: r.remark,
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "effectiveDate", label: "Effective Date" },
      { key: "previousSalary", label: "Previous Salary" },
      { key: "newSalary", label: "New Salary" },
      { key: "remark", label: "Remark" },
    ],
    rows,
  };
}

/* ============================================================
   I.2 — Financial / Payroll Reports (kept separate, per the business)
   ============================================================ */

const PAYROLL_WITH_PROFILE = `
  id, payroll_period, gross_salary, net_salary, deductions, epf_amount,
  tax_amount, bonus_amount, status,
  profiles:profile_id ( id, employee_id, full_name, department_id, departments:department_id ( name ) )
`;

// 10. Department-wise payroll report (for one period, default current month)
export async function getDepartmentWisePayrollReport({ month, year } = {}) {
  const period = periodString(month, year);
  const { data, error } = await supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_PROFILE)
    .eq("payroll_period", period);
  if (error) throw error;

  const byDept = new Map();
  for (const r of data || []) {
    const dept = deptName(r.profiles);
    const entry = byDept.get(dept) || { department: dept, employeeCount: 0, totalGross: 0, totalNet: 0, totalEpf: 0, totalTax: 0 };
    entry.employeeCount += 1;
    entry.totalGross += Number(r.gross_salary || 0);
    entry.totalNet += Number(r.net_salary || 0);
    entry.totalEpf += Number(r.epf_amount || 0);
    entry.totalTax += Number(r.tax_amount || 0);
    byDept.set(dept, entry);
  }

  return {
    success: true,
    columns: [
      { key: "department", label: "Department" },
      { key: "employeeCount", label: "Employees" },
      { key: "totalGross", label: "Total Gross" },
      { key: "totalNet", label: "Total Net" },
      { key: "totalEpf", label: "Total EPF" },
      { key: "totalTax", label: "Total Tax" },
    ],
    rows: Array.from(byDept.values()).sort((a, b) => a.department.localeCompare(b.department)),
    period,
  };
}

// 11. All-employee payroll report (for one period)
export async function getAllEmployeePayrollReport({ month, year } = {}) {
  const period = periodString(month, year);
  const { data, error } = await supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_PROFILE)
    .eq("payroll_period", period)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: employeeIdOf(r.profiles),
    fullName: r.profiles?.full_name || "",
    department: deptName(r.profiles),
    grossSalary: Number(r.gross_salary || 0),
    deductions: Number(r.deductions || 0),
    netSalary: Number(r.net_salary || 0),
    status: r.status,
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "grossSalary", label: "Gross Salary" },
      { key: "deductions", label: "Deductions" },
      { key: "netSalary", label: "Net Salary" },
      { key: "status", label: "Status" },
    ],
    rows,
    period,
  };
}

// 12. Employee Provident Fund report (for one period)
export async function getProvidentFundReport({ month, year } = {}) {
  const period = periodString(month, year);
  const { data, error } = await supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_PROFILE)
    .eq("payroll_period", period)
    .gt("epf_amount", 0);
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: employeeIdOf(r.profiles),
    fullName: r.profiles?.full_name || "",
    department: deptName(r.profiles),
    epfAmount: Number(r.epf_amount || 0),
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "epfAmount", label: "EPF Amount" },
    ],
    rows,
    period,
  };
}

// 13. Monthly/yearly probation-completion report (financial angle) —
// employees still on Probation whose 6-month or 1-year mark falls in the
// selected month, alongside their current salary so Finance can plan any
// confirmation-linked pay change.
export async function getProbationCompletionReport({ month, year } = {}) {
  const now = new Date();
  const targetM = month || now.getMonth() + 1;
  const targetY = year || now.getFullYear();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, employee_id, full_name, employment_type, joining_date, department_id,
      departments:department_id ( name ),
      salary_settings ( basic_salary, gross_salary )
    `)
    .eq("employment_type", "Probation")
    .neq("status", "left")
    .not("joining_date", "is", null);
  if (error) throw error;

  const rows = [];
  for (const r of data || []) {
    const jd = new Date(r.joining_date);
    const sixMonth = new Date(jd);
    sixMonth.setMonth(sixMonth.getMonth() + 6);
    const oneYear = new Date(jd);
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    const matches6 = sixMonth.getFullYear() === targetY && sixMonth.getMonth() + 1 === targetM;
    const matches12 = oneYear.getFullYear() === targetY && oneYear.getMonth() + 1 === targetM;
    if (!matches6 && !matches12) continue;

    const salary = r.salary_settings || {};
    rows.push({
      employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
      fullName: r.full_name,
      department: deptName(r),
      milestone: matches6 ? "6-Month" : "1-Year",
      joiningDate: r.joining_date,
      currentBasicSalary: Number(salary.basic_salary || 0),
      currentGrossSalary: Number(salary.gross_salary || 0),
    });
  }

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "milestone", label: "Milestone" },
      { key: "joiningDate", label: "Joining Date" },
      { key: "currentBasicSalary", label: "Current Basic Salary" },
      { key: "currentGrossSalary", label: "Current Gross Salary" },
    ],
    rows,
  };
}

// 14. Employee advance, expense, loans and provident fund report —
// PARTIAL VERSION: payroll-side data only (advance installment, loan
// deduction, EPF/provident fund from salary_settings + payroll_records).
// The Expense module is still on the old MongoDB backend with no Supabase
// data, so expense claims can't be included until that module is migrated.
export async function getAdvanceLoanPfReport() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, employee_id, full_name, department_id, departments:department_id ( name ),
      salary_settings ( advance_installment, loan_deduction, provident_fund, epf_applicable )
    `)
    .order("full_name", { ascending: true });
  if (error) throw error;

  const rows = (data || [])
    .filter((r) => {
      const s = r.salary_settings || {};
      return Number(s.advance_installment || 0) > 0 || Number(s.loan_deduction || 0) > 0 || s.epf_applicable;
    })
    .map((r) => {
      const s = r.salary_settings || {};
      return {
        employeeId: r.employee_id || r.id.slice(0, 8).toUpperCase(),
        fullName: r.full_name,
        department: deptName(r),
        advanceInstallment: Number(s.advance_installment || 0),
        loanDeduction: Number(s.loan_deduction || 0),
        providentFund: Number(s.provident_fund || 0),
        epfApplicable: s.epf_applicable ? "Yes" : "No",
      };
    });

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "advanceInstallment", label: "Advance Installment" },
      { key: "loanDeduction", label: "Loan Deduction" },
      { key: "providentFund", label: "Provident Fund" },
      { key: "epfApplicable", label: "EPF Applicable" },
    ],
    rows,
    note: "Partial report: payroll-side advance/loan/PF data only. Expense-module claims aren't included yet — that module hasn't been migrated off the old system.",
  };
}

// 15. Yearly bonus report — total bonus paid per employee across a year.
export async function getYearlyBonusReport({ year } = {}) {
  const y = year || new Date().getFullYear();
  const { data, error } = await supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_PROFILE)
    .like("payroll_period", `${y}-%`)
    .gt("bonus_amount", 0);
  if (error) throw error;

  const byEmployee = new Map();
  for (const r of data || []) {
    const key = r.profiles?.id || r.id;
    const entry = byEmployee.get(key) || {
      employeeId: employeeIdOf(r.profiles),
      fullName: r.profiles?.full_name || "",
      department: deptName(r.profiles),
      totalBonus: 0,
    };
    entry.totalBonus += Number(r.bonus_amount || 0);
    byEmployee.set(key, entry);
  }

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "totalBonus", label: `Total Bonus (${y})` },
    ],
    rows: Array.from(byEmployee.values()),
    year: y,
  };
}

// 16. Previous salary report — each employee's most recent salary change
// (old value vs. current), one row per employee.
export async function getPreviousSalaryReport() {
  const { data, error } = await supabase
    .from("employee_history")
    .select(`
      old_value, new_value, effective_date, profile_id,
      profiles:profile_id ( id, employee_id, full_name, department_id, departments:department_id ( name ) )
    `)
    .eq("change_type", "salary")
    .order("effective_date", { ascending: false });
  if (error) throw error;

  const latestByProfile = new Map();
  for (const r of data || []) {
    if (!latestByProfile.has(r.profile_id)) latestByProfile.set(r.profile_id, r);
  }

  const rows = Array.from(latestByProfile.values()).map((r) => ({
    employeeId: employeeIdOf(r.profiles),
    fullName: r.profiles?.full_name || "",
    department: deptName(r.profiles),
    previousSalary: r.old_value,
    currentSalary: r.new_value,
    changedOn: r.effective_date,
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "previousSalary", label: "Previous Salary" },
      { key: "currentSalary", label: "Current Salary" },
      { key: "changedOn", label: "Changed On" },
    ],
    rows,
  };
}

// 17. Previous bonus report — bonus paid per employee, per period, most
// recent first (so "previous" bonuses are easy to look up per employee).
export async function getPreviousBonusReport({ year } = {}) {
  let query = supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_PROFILE)
    .gt("bonus_amount", 0)
    .order("payroll_period", { ascending: false });
  if (year) query = query.like("payroll_period", `${year}-%`);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data || []).map((r) => ({
    employeeId: employeeIdOf(r.profiles),
    fullName: r.profiles?.full_name || "",
    department: deptName(r.profiles),
    period: r.payroll_period,
    bonusAmount: Number(r.bonus_amount || 0),
  }));

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "period", label: "Period" },
      { key: "bonusAmount", label: "Bonus Amount" },
    ],
    rows,
  };
}

// 18. Bank transfer report (BIZ-PAY-02) — the file the bank needs to move
// everyone's net salary: one row per employee for the chosen month, with the
// bank details on their profile. Only "Approved" or "Paid" records are
// included, since a bank transfer should never be prepared off unapproved
// figures; rows missing bank details are still listed (so the gap is visible)
// but flagged in a "Bank Details" column instead of silently left out.
const PAYROLL_WITH_BANK_DETAILS = `
  id, payroll_period, net_salary, status,
  profiles:profile_id (
    id, employee_id, full_name, department_id,
    departments:department_id ( name ),
    bank_name, bank_account_number, bank_branch
  )
`;

export async function getBankTransferReport({ month, year } = {}) {
  const period = periodString(month, year);
  const { data, error } = await supabase
    .from("payroll_records")
    .select(PAYROLL_WITH_BANK_DETAILS)
    .eq("payroll_period", period)
    .in("status", ["Approved", "Paid"])
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data || []).map((r) => {
    const p = r.profiles;
    const hasBankDetails = !!(p?.bank_name && p?.bank_account_number);
    return {
      employeeId: employeeIdOf(p),
      fullName: p?.full_name || "",
      department: deptName(p),
      bankName: p?.bank_name || "",
      accountNumber: p?.bank_account_number || "",
      branch: p?.bank_branch || "",
      netSalary: Number(r.net_salary || 0),
      status: r.status,
      bankDetailsStatus: hasBankDetails ? "OK" : "Missing — cannot transfer",
    };
  });

  return {
    success: true,
    columns: [
      { key: "employeeId", label: "Employee ID" },
      { key: "fullName", label: "Name" },
      { key: "department", label: "Department" },
      { key: "bankName", label: "Bank Name" },
      { key: "accountNumber", label: "Account Number" },
      { key: "branch", label: "Branch" },
      { key: "netSalary", label: "Net Salary (Transfer Amount)" },
      { key: "status", label: "Payroll Status" },
      { key: "bankDetailsStatus", label: "Bank Details" },
    ],
    rows,
    period,
  };
}
