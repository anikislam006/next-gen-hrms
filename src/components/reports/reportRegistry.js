// Central list of every report the Reports screen can show, split into the
// two areas the business explicitly asked to be kept separate (Business
// Logic Requirements doc, Section I): Employee Information vs.
// Financial/Payroll.
import * as reportsApi from "@/app/api/reports";

// filters: "month" | "year" | "range" | null — which filter controls the
// Reports screen should show above this report's table.
export const EMPLOYEE_REPORTS = [
  {
    key: "dept-wise-employees",
    label: "Department-wise Employee Information",
    filters: null,
    run: () => reportsApi.getDepartmentWiseEmployeeReport(),
  },
  {
    key: "designation-wise-employees",
    label: "Designation-wise Employee Information",
    filters: null,
    run: () => reportsApi.getDesignationWiseEmployeeReport(),
  },
  {
    key: "six-month-confirmation",
    label: "6-Month Confirmation List",
    filters: "month",
    run: ({ month, year }) => reportsApi.getSixMonthConfirmationReport({ month, year }),
  },
  {
    key: "one-year-completion",
    label: "1-Year Completion List",
    filters: "month",
    run: ({ month, year }) => reportsApi.getOneYearCompletionReport({ month, year }),
  },
  {
    key: "all-employee-details",
    label: "All Employee Details",
    filters: null,
    run: () => reportsApi.getAllEmployeeDetailsReport(),
  },
  {
    key: "monthly-new-joiners",
    label: "Monthly New-Joiner Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getMonthlyNewJoinersReport({ month, year }),
  },
  {
    key: "monthly-left-employees",
    label: "Monthly Left-Employee Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getMonthlyLeftEmployeesReport({ month, year }),
  },
  {
    key: "monthly-turnover",
    label: "Monthly Turnover Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getMonthlyTurnoverReport({ month, year }),
  },
  {
    key: "salary-increment",
    label: "Salary Increment Report",
    filters: null,
    run: () => reportsApi.getSalaryIncrementReport({}),
  },
];

export const FINANCIAL_REPORTS = [
  {
    key: "dept-wise-payroll",
    label: "Department-wise Payroll Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getDepartmentWisePayrollReport({ month, year }),
  },
  {
    key: "all-employee-payroll",
    label: "All-Employee Payroll Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getAllEmployeePayrollReport({ month, year }),
  },
  {
    key: "provident-fund",
    label: "Employee Provident Fund Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getProvidentFundReport({ month, year }),
  },
  {
    key: "probation-completion",
    label: "Monthly/Yearly Probation Completion Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getProbationCompletionReport({ month, year }),
  },
  {
    key: "advance-loan-pf",
    label: "Advance / Loan / PF Report (partial — payroll data only)",
    filters: null,
    run: () => reportsApi.getAdvanceLoanPfReport(),
  },
  {
    key: "yearly-bonus",
    label: "Yearly Bonus Report",
    filters: "year",
    run: ({ year }) => reportsApi.getYearlyBonusReport({ year }),
  },
  {
    key: "previous-salary",
    label: "Previous Salary Report",
    filters: null,
    run: () => reportsApi.getPreviousSalaryReport(),
  },
  {
    key: "previous-bonus",
    label: "Previous Bonus Report",
    filters: "year",
    run: ({ year }) => reportsApi.getPreviousBonusReport({ year }),
  },
  {
    key: "bank-transfer",
    label: "Bank Transfer Report",
    filters: "month",
    run: ({ month, year }) => reportsApi.getBankTransferReport({ month, year }),
  },
];
