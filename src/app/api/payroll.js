// Payroll, backed by Supabase (payroll_structures, salary_settings, payroll_records, tax_slabs)
// instead of the old code360.pro/MongoDB backend. Function names and return
// shapes are kept identical to the previous version so hook/usePayroll.js and
// every payroll UI component work unchanged.
import { supabase } from "@/utils/supabaseClient";

const PAGE_SIZE = 10;

// BIZ-PAY-01, confirmed with the business (2026-09-24): "Basic Salary +
// House Rent + Medical Allowance + Conveyance = Gross Salary" — split
// Basic 60% / House Rent 30% / Medical 5% / Conveyance 5% of Gross.
// Mobile Allowance and Other Allowance are explicitly listed as ADDITIONAL
// components on top of Gross, not part of it — they still get paid (see
// createPayrollRecords), they just don't count toward "Gross Salary" or the
// Festival Bonus base (Gross x 60%). Used everywhere Gross is computed so
// there's exactly one definition instead of three that can drift apart.
function computeGrossSalary({ basic_salary, house_rent, medical_allowance, transport_allowance } = {}) {
  return (
    Number(basic_salary || 0) +
    Number(house_rent || 0) +
    Number(medical_allowance || 0) +
    Number(transport_allowance || 0)
  );
}

/* ============================== STRUCTURES ============================== */

export const fetchPayrollStructures = async (page = 1, search = "") => {
  try {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("payroll_structures")
      .select("*", { count: "exact" })
      .order("grade")
      .order("level");
    if (search) query = query.or(`title.ilike.%${search}%,grade.ilike.%${search}%`);
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return {
      success: true,
      data: (data || []).map((s) => ({
        _id: s.id,
        grade: s.grade,
        level: s.level,
        title: s.title,
        basic_min: s.basic_min,
        basic_max: s.basic_max,
        epf_applicable: s.epf_applicable,
        status: s.status,
        // BIZ-PAY-01: default allowances for this grade/level band, so
        // assigning a grade to an employee can pre-fill their individual
        // salary components instead of HR retyping every figure.
        default_house_rent: Number(s.default_house_rent || 0),
        default_medical_allowance: Number(s.default_medical_allowance || 0),
        default_transport_allowance: Number(s.default_transport_allowance || 0),
        default_mobile_allowance: Number(s.default_mobile_allowance || 0),
        default_other_allowances: Number(s.default_other_allowances || 0),
      })),
      pagination: {
        totalItems: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("fetchPayrollStructures error:", error);
    throw error;
  }
};

export const createPayrollStructure = async (structureData) => {
  try {
    const payload = {
      grade: structureData.grade,
      level: String(structureData.level),
      title: structureData.title,
      basic_min: Number(structureData.basic_min) || 0,
      basic_max: Number(structureData.basic_max) || 0,
      epf_applicable: structureData.epf_applicable !== false,
      default_house_rent: Number(structureData.default_house_rent) || 0,
      default_medical_allowance: Number(structureData.default_medical_allowance) || 0,
      default_transport_allowance: Number(structureData.default_transport_allowance) || 0,
      default_mobile_allowance: Number(structureData.default_mobile_allowance) || 0,
      default_other_allowances: Number(structureData.default_other_allowances) || 0,
    };
    const { data, error } = await supabase.from("payroll_structures").insert(payload).select().single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("createPayrollStructure error:", error);
    return { success: false, message: error.message };
  }
};

export const deletePayrollStructure = async (id) => {
  try {
    const { error } = await supabase.from("payroll_structures").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("deletePayrollStructure error:", error);
    return { success: false, message: error.message };
  }
};

/* ========================== EMPLOYEE SALARIES ============================ */

function toEmployeePayrollShape(row) {
  // salary_settings.profile_id is UNIQUE, so PostgREST embeds this as a
  // single object (or null), never an array — indexing [0] here always
  // came back undefined and silently zeroed out every employee's salary.
  const salary = row.salary_settings || {};
  const basicSalary = Number(salary.basic_salary || 0);
  const houseRent = Number(salary.house_rent || 0);
  const medicalAllowance = Number(salary.medical_allowance || 0);
  const transportAllowance = Number(salary.transport_allowance || 0);
  const mobileAllowance = Number(salary.mobile_allowance || 0);
  const otherAllowances = Number(salary.other_allowances || 0);
  const grossSalary = computeGrossSalary(salary);

  return {
    _id: row.id,
    employeeId: row.employee_id,
    fullName: row.full_name,
    email: row.email,
    designation: row.designation || "",
    department: row.departments?.name || "",
    departmentId: row.department_id || "",
    employmentType: row.employment_type || "Probation",
    joiningDate: row.joining_date,
    status: row.status,
    // BIZ-PAY-08 AIT: picks the male/female nil-income band. Unset on the
    // profile falls back to the 'male' band in createPayrollRecords.
    gender: row.gender || null,
    matchedPayroll: salary.grade ? { grade: salary.grade } : null,
    basicSalary,
    houseRent,
    medicalAllowance,
    transportAllowance,
    mobileAllowance,
    otherAllowances,
    grossSalary,
    // Standing (monthly, per-employee) components from BIZ-PAY-01's component list.
    advanceInstallment: Number(salary.advance_installment || 0),
    arrear: Number(salary.arrear || 0),
    ta: Number(salary.ta || 0),
    da: Number(salary.da || 0),
    loanDeduction: Number(salary.loan_deduction || 0),
    otherDeduction: Number(salary.other_deduction || 0),
    // Provident Fund (PF) override — 0/blank means "use the automatic 10% of
    // Basic" (see createPayrollRecords); a positive value here overrides it.
    providentFund: Number(salary.provident_fund || 0),
    loanStartPeriod: salary.loan_start_period || null,
    loanDurationMonths: salary.loan_duration_months != null ? Number(salary.loan_duration_months) : null,
    epfApplicable: !!salary.epf_applicable,
    taxApplicable: !!salary.tax_applicable,
    salaryStatus: salary.status || "active",
  };
}

const EMPLOYEE_PAYROLL_SELECT = `
  id, employee_id, full_name, email, designation, employment_type, joining_date, status, department_id, gender,
  departments:department_id ( name ),
  salary_settings ( * )
`;

export const fetchEmployeePayroll = async ({
  page = 1,
  limit = PAGE_SIZE,
  search = "",
  department = "All",
  employmentType = "Total",
} = {}) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("profiles")
      .select(EMPLOYEE_PAYROLL_SELECT, { count: "exact" })
      .order("full_name");
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }
    if (employmentType && employmentType !== "Total") query = query.eq("employment_type", employmentType);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    let rows = (data || []).map(toEmployeePayrollShape);
    // Department is a joined display name, filtered client-side like the rest
    // of the app does at this headcount (see api/employees.js).
    if (department && department !== "All") rows = rows.filter((r) => r.department === department);

    return {
      success: true,
      data: rows,
      counts: {},
      totalEmployees: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      page,
    };
  } catch (error) {
    console.error("fetchEmployeePayroll error:", error);
    throw error;
  }
};

export const fetchSettingSalaries = async (page = 1) => {
  try {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from("salary_settings")
      .select("*, profiles:profile_id ( full_name, email )", { count: "exact" })
      .range(from, to);
    if (error) throw error;
    return {
      success: true,
      data: data || [],
      totalItems: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
    };
  } catch (error) {
    console.error("fetchSettingSalaries error:", error);
    throw error;
  }
};

// Looks the employee up by email (that's the key the UI has on hand) and
// upserts their salary_settings row. Throws on failure so the caller
// (usePayroll's handleCreateSalarySetting) reports success/failure correctly.
//
// BIZ-EMP-01 / Salary Increment & Previous Salary reports: whenever an
// existing salary row's basic/gross actually changes, we also write a row to
// employee_history (change_type = 'salary') so the change is auditable and
// reportable later. A brand-new salary setting (no prior row) is not logged
// as a "change" — there is nothing to compare it against yet.
export const createSettingSalary = async (salaryData) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", salaryData.email)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new Error(`No employee found for email ${salaryData.email}`);

  // Look up the existing row (if any) BEFORE we overwrite it, so we can
  // compare old vs new for history logging.
  const { data: previous, error: previousError } = await supabase
    .from("salary_settings")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (previousError) throw previousError;

  const payload = {
    profile_id: profile.id,
    grade: salaryData.grade || null,
    level: Number(salaryData.level) || 1,
    basic_salary: Number(salaryData.basicSalary) || 0,
    house_rent: Number(salaryData.houseRent) || 0,
    medical_allowance: Number(salaryData.medicalAllowance) || 0,
    transport_allowance: Number(salaryData.transportAllowance) || 0,
    mobile_allowance: Number(salaryData.mobileAllowance) || 0,
    other_allowances: Number(salaryData.otherAllowances) || 0,
    advance_installment: Number(salaryData.advance_installment) || 0,
    // BIZ-PAY-01: the rest of the component set the business asked for —
    // previously present as unused database columns, now real, editable,
    // and factored into the net-salary calculation below.
    arrear: Number(salaryData.arrear) || 0,
    ta: Number(salaryData.ta) || 0,
    da: Number(salaryData.da) || 0,
    loan_deduction: Number(salaryData.loan_deduction) || 0,
    other_deduction: Number(salaryData.other_deduction) || 0,
    // Provident Fund (PF) — 10% of Basic is computed automatically at
    // processing time (see createPayrollRecords); this column is only a
    // manual per-employee override for when a different figure is needed.
    // Renamed from the confusing "EPF" naming to match what the business
    // actually calls it.
    provident_fund: Number(salaryData.provident_fund) || 0,
    // Loan Duration: how many payroll periods, starting from
    // loan_start_period, the Loan Deduction above auto-applies for. NULL on
    // either = indefinite (legacy behavior, unaffected).
    loan_start_period: salaryData.loan_start_period || null,
    loan_duration_months: salaryData.loan_duration_months ? Number(salaryData.loan_duration_months) : null,
    epf_applicable: !!salaryData.epf_applicable,
    tax_applicable: !!salaryData.tax_applicable,
    status: salaryData.status || "active",
  };

  const { data, error } = await supabase
    .from("salary_settings")
    .upsert(payload, { onConflict: "profile_id" })
    .select()
    .single();
  if (error) throw error;

  const grossOf = (row) => computeGrossSalary(row);

  if (previous) {
    const oldGross = grossOf(previous);
    const newGross = grossOf(payload);
    const basicChanged = Number(previous.basic_salary || 0) !== payload.basic_salary;
    const grossChanged = oldGross !== newGross;

    if (basicChanged || grossChanged) {
      // Matches the pattern in api/employeeProfiles.js's updateEmployeeProfile:
      // read the signed-in Supabase Auth user rather than relying on the
      // client passing an id in.
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const { error: historyError } = await supabase.from("employee_history").insert({
        profile_id: profile.id,
        change_type: "salary",
        old_value: `Basic: ${Number(previous.basic_salary || 0)}, Gross: ${oldGross}`,
        new_value: `Basic: ${payload.basic_salary}, Gross: ${newGross}`,
        remark: salaryData.remark || "Salary updated via Payroll module",
        changed_by: authUser?.id || null,
      });
      // Don't fail the whole salary save if history logging has a hiccup —
      // the salary itself is already saved correctly at this point.
      if (historyError) console.error("employee_history insert error:", historyError);
    }
  }

  return { success: true, data };
};

export const fetchSettingByEmail = async (email) => {
  try {
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) return { success: false, message: "Employee not found" };

    const { data, error } = await supabase
      .from("salary_settings")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: false, message: "No salary setting yet" };

    const grossSalary = computeGrossSalary(data);

    return {
      success: true,
      data: {
        grade: data.grade,
        basicSalary: data.basic_salary,
        houseRent: data.house_rent,
        medicalAllowance: data.medical_allowance,
        transportAllowance: data.transport_allowance,
        mobileAllowance: data.mobile_allowance,
        otherAllowances: data.other_allowances,
        advance_installment: data.advance_installment,
        arrear: data.arrear,
        ta: data.ta,
        da: data.da,
        loan_deduction: data.loan_deduction,
        other_deduction: data.other_deduction,
        provident_fund: data.provident_fund,
        loan_start_period: data.loan_start_period,
        loan_duration_months: data.loan_duration_months,
        epf_applicable: data.epf_applicable,
        tax_applicable: data.tax_applicable,
        status: data.status,
        grossSalary,
      },
    };
  } catch (error) {
    console.error("fetchSettingByEmail error:", error);
    return { success: false, message: error.message };
  }
};

/* ======================= PROCESS PAYROLL (the engine) ===================== */
// BIZ-PAY-06 Festival Bonus, BIZ-PAY-07 Provident Fund and BIZ-PAY-08 AIT are
// computed here, once, so every screen (admin records, self-service payslip)
// sees the same real numbers instead of a manually-typed placeholder.

function monthsWorkedInProbation(joiningDate, periodEnd) {
  if (!joiningDate) return 0;
  const joined = new Date(joiningDate);
  let months = (periodEnd.getFullYear() - joined.getFullYear()) * 12 + (periodEnd.getMonth() - joined.getMonth());
  if (periodEnd.getDate() < joined.getDate()) months -= 1;
  // Probation is a 6-month window in this business's plan (see "Probation Leave: 6").
  return Math.max(0, Math.min(6, months + 1));
}

// Progressive tax over the tax_slabs table (BIZ-PAY-08), gender-aware nil
// band, per the calculation tool Anik shared (2026-09-24). Returns 0 if no
// slabs are loaded for that year (e.g. a future year not seeded yet).
function makeTaxCalculator(slabs) {
  return (annualIncome) => {
    if (!slabs.length) return 0;
    let tax = 0;
    for (const slab of slabs) {
      const min = Number(slab.min_income);
      const max = slab.max_income == null ? Infinity : Number(slab.max_income);
      if (annualIncome > min) {
        const taxableInBand = Math.min(annualIncome, max) - min;
        tax += taxableInBand * (Number(slab.rate_percent) / 100);
      }
    }
    return tax / 12;
  };
}

// Loan Duration (Anik's request): a Loan Deduction only applies for
// `loanDurationMonths` consecutive payroll periods starting at
// `loanStartPeriod`, then stops automatically — no separate "months already
// paid" counter to keep in sync, it's derived from the period being
// processed. Either field unset = old behavior (applies every period).
function monthsElapsedInclusive(startPeriod, currentPeriod) {
  const [sy, sm] = startPeriod.split("-").map(Number);
  const [cy, cm] = currentPeriod.split("-").map(Number);
  return (cy - sy) * 12 + (cm - sm) + 1;
}

function loanMonthsRemaining(item, period) {
  if (!item.loanDurationMonths || !item.loanStartPeriod) return null;
  const elapsed = monthsElapsedInclusive(item.loanStartPeriod, period);
  return Math.max(0, Number(item.loanDurationMonths) - Math.max(0, elapsed - 1));
}

function isLoanActiveForPeriod(item, period) {
  if (Number(item.loanDeduction || 0) <= 0) return false;
  if (!item.loanDurationMonths || !item.loanStartPeriod) return true;
  const elapsed = monthsElapsedInclusive(item.loanStartPeriod, period);
  return elapsed >= 1 && elapsed <= Number(item.loanDurationMonths);
}

export const createPayrollRecords = async (payrollItems) => {
  try {
    if (!Array.isArray(payrollItems) || payrollItems.length === 0) {
      throw new Error("No employees selected");
    }
    const config = payrollItems[0]?.config || {};
    const period = config.payrollPeriod || new Date().toISOString().slice(0, 7);
    const [periodYear, periodMonth] = period.split("-").map(Number);
    const periodEnd = new Date(periodYear, periodMonth, 0);

    // BIZ-PAY-08: slabs are gender-specific (differing nil-income band), so
    // load both sets once and pick per employee below.
    let calcTaxByGender = { male: () => 0, female: () => 0 };
    if (config.applyTaxDeductions) {
      const { data } = await supabase
        .from("tax_slabs")
        .select("*")
        .eq("effective_year", periodYear)
        .order("min_income");
      const slabs = data || [];
      calcTaxByGender = {
        male: makeTaxCalculator(slabs.filter((s) => s.gender !== "female")),
        female: makeTaxCalculator(slabs.filter((s) => s.gender === "female")),
      };
    }

    const rows = payrollItems.map((item) => {
      const basic = Number(item.basicSalary || 0);
      const gross = Number(item.grossSalary || 0);
      // BIZ-PAY-01: Mobile Allowance and Other Allowance are explicitly
      // listed as ADDITIONAL components on top of Gross Salary, not part of
      // it — they still land in net pay, they just don't count toward Gross
      // or the Festival Bonus base below (confirmed against the calculation
      // tool Anik shared: these are "benefit allowances," added to net only).
      const mobile = Number(item.mobileAllowance || 0);
      const otherAllow = Number(item.otherAllowances || 0);
      const arrear = Number(item.arrear || 0);
      const ta = Number(item.ta || 0);
      const da = Number(item.da || 0);

      // BIZ-PAY-06: Full Bonus = Gross x 60%. Probation = (Gross x 60% / 6) x months worked.
      let bonus = 0;
      if (config.includeFestivalBonus) {
        const fullBonus = gross * 0.6;
        bonus =
          item.employmentType === "Probation"
            ? (fullBonus / 6) * monthsWorkedInProbation(item.joiningDate, periodEnd)
            : fullBonus;
      }

      // BIZ-PAY-07: Provident Fund (PF) = 10% of Basic Salary, a real
      // per-employee line — unless a manual override amount is set on the
      // employee's salary settings (renamed/consolidated from the old
      // separate, unused "EPF" vs "PF" fields into this one).
      const pfOverride = Number(item.providentFund || 0);
      const pf =
        pfOverride > 0 ? pfOverride : config.applyEpfDeductions && item.epfApplicable ? basic * 0.1 : 0;

      // BIZ-PAY-08: AIT — taxable annual income excludes PF, per the
      // confirmed formula ((Gross - PF) x 12), using the employee's own
      // gender for the nil-income band (defaults to the 'male' band if not
      // set on the profile yet).
      const calcTax = calcTaxByGender[item.gender === "female" ? "female" : "male"];
      const tax = config.applyTaxDeductions ? calcTax(Math.max(0, gross - pf) * 12) : 0;

      const advanceTotal = Number(item.advanceInstallment || 0) + Number(item.advanceDeduction || 0);
      const otherTotal = Number(item.otherDeduction || 0) + Number(item.otherDeductions || 0);
      const loanActive = isLoanActiveForPeriod(item, period);
      const loanTotal = loanActive ? Number(item.loanDeduction || 0) : 0;

      const deductions = pf + tax + advanceTotal + otherTotal + loanTotal;
      const netSalary = gross + mobile + otherAllow + arrear + ta + da + bonus - deductions;

      return {
        profile_id: item.employeeRefId || item._id,
        payroll_period: period,
        gross_salary: gross,
        deductions,
        epf_amount: pf,
        tax_amount: tax,
        bonus_amount: bonus,
        net_salary: netSalary,
        status: "Processed",
        breakdown: {
          basicSalary: basic,
          houseRent: item.houseRent,
          medicalAllowance: item.medicalAllowance,
          transportAllowance: item.transportAllowance,
          mobileAllowance: item.mobileAllowance,
          otherAllowances: item.otherAllowances,
          arrear,
          ta,
          da,
          providentFundOverride: pfOverride,
          loanActive,
          loanMonthsRemaining: loanMonthsRemaining(item, period),
          bonusAmount: bonus,
          epfAmount: pf,
          taxAmount: tax,
          advanceDeduction: advanceTotal,
          otherDeductions: otherTotal,
          loanDeduction: loanTotal,
          // Not part of any BIZ-PAY formula the business supplied — recorded
          // for reference only, does not affect net pay.
          overtimeHours: Number(item.overtimeHours || 0),
          employmentType: item.employmentType,
          monthsWorked:
            item.employmentType === "Probation" ? monthsWorkedInProbation(item.joiningDate, periodEnd) : null,
          fullName: item.fullName,
          email: item.email,
          department: item.department,
          designation: item.designation,
          config,
        },
      };
    });

    const { data, error } = await supabase
      .from("payroll_records")
      .upsert(rows, { onConflict: "profile_id,payroll_period" })
      .select();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("createPayrollRecords error:", error);
    return { success: false, message: error.message };
  }
};

/* ============================ PAYROLL RECORDS ============================= */

function toPayrollRecordShape(row) {
  const b = row.breakdown || {};
  return {
    _id: row.id,
    employeeRefId: row.profile_id,
    fullName: row.profiles?.full_name || b.fullName || "",
    email: row.profiles?.email || b.email || "",
    designation: row.profiles?.designation || b.designation || "",
    department: row.profiles?.departments?.name || b.department || "",
    config: { payrollPeriod: row.payroll_period, ...b.config },
    processedTimestamp: row.created_at,
    status: row.status,
    grossSalary: Number(row.gross_salary || 0),
    basicSalary: Number(b.basicSalary || 0),
    bonusAmount: Number(row.bonus_amount || 0),
    epfAmount: Number(row.epf_amount || 0),
    epfContribution: Number(row.epf_amount || 0),
    taxAmount: Number(row.tax_amount || 0),
    deductions: Number(row.deductions || 0),
    advanceDeduction: Number(b.advanceDeduction || 0),
    otherDeductions: Number(b.otherDeductions || 0),
    netSalary: Number(row.net_salary || 0),
    approvedAt: row.approved_at,
    // BIZ-PAY-05: department-wise preparation and approval — who/when signed
    // off at the department level, ahead of the CEO's final approval.
    deptApprovedAt: row.dept_approved_at,
    deptApprovedBy: row.dept_approved_by,
  };
}

const PAYROLL_RECORD_SELECT = `
  id, profile_id, payroll_period, gross_salary, deductions, epf_amount, tax_amount, bonus_amount,
  net_salary, status, breakdown, approved_at, dept_approved_at, dept_approved_by, created_at,
  profiles:profile_id ( full_name, email, designation, department_id, departments:department_id ( name ) )
`;

export const fetchProcessedPayrollRecords = async ({
  page = 1,
  limit = PAGE_SIZE,
  email = "",
  status = "",
  date = "",
  department = "All",
} = {}) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let query = supabase
      .from("payroll_records")
      .select(PAYROLL_RECORD_SELECT, { count: "exact" })
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (date) query = query.eq("payroll_period", date);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    let rows = (data || []).map(toPayrollRecordShape);
    if (email) {
      const term = email.toLowerCase();
      rows = rows.filter(
        (r) => r.email?.toLowerCase().includes(term) || r.fullName?.toLowerCase().includes(term)
      );
    }
    // Department is a joined display name, filtered client-side like the
    // rest of the app does at this headcount (see api/employees.js).
    if (department && department !== "All") {
      rows = rows.filter((r) => r.department === department);
    }

    return {
      success: true,
      data: rows,
      pagination: {
        totalItems: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("fetchProcessedPayrollRecords error:", error);
    throw error;
  }
};

export const fetchPayrollRecordsByEmail = async (email) => {
  try {
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (!profile) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("payroll_records")
      .select(PAYROLL_RECORD_SELECT)
      .eq("profile_id", profile.id)
      .order("payroll_period", { ascending: false });
    if (error) throw error;
    return { success: true, data: (data || []).map(toPayrollRecordShape) };
  } catch (error) {
    console.error("fetchPayrollRecordsByEmail error:", error);
    return { success: false, message: error.message };
  }
};

// BIZ-PAY-04: the database itself enforces this, via the payroll_approval_gate
// trigger — only a SuperAdmin login can move a record to "Approved", and
// nothing can become "Paid" without passing through "Approved" first. This
// function just surfaces whatever the trigger decides.
export const updatePayrollStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from("payroll_records")
      .update({ status })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("updatePayrollStatus error:", error);
    return { success: false, message: error.message };
  }
};

export const deletePayrollRecord = async (id) => {
  try {
    const { error } = await supabase.from("payroll_records").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("deletePayrollRecord error:", error);
    return { success: false, message: error.message };
  }
};

export const fetchPayrollManagementStats = async () => {
  try {
    const { count: totalEmployees } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    const { data: settings } = await supabase
      .from("salary_settings")
      .select("basic_salary, house_rent, medical_allowance, transport_allowance, mobile_allowance, other_allowances");

    const grossList = (settings || []).map(
      (s) =>
        Number(s.basic_salary || 0) +
        Number(s.house_rent || 0) +
        Number(s.medical_allowance || 0) +
        Number(s.transport_allowance || 0) +
        Number(s.mobile_allowance || 0) +
        Number(s.other_allowances || 0)
    );
    const totalSalaryDisbursed = grossList.reduce((a, b) => a + b, 0);
    const averageGrossSalary = grossList.length ? totalSalaryDisbursed / grossList.length : 0;

    const { count: totalStructures } = await supabase
      .from("payroll_structures")
      .select("id", { count: "exact", head: true });

    return {
      success: true,
      data: {
        totalStructures: totalStructures || 0,
        totalEmployees: totalEmployees || 0,
        totalSalaryDisbursed,
        averageGrossSalary,
      },
    };
  } catch (error) {
    console.error("fetchPayrollManagementStats error:", error);
    return { success: false, message: error.message };
  }
};
