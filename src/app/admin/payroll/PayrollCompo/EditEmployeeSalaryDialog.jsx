"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Loader2 } from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import { toast } from "sonner";

// BIZ-PAY-01, confirmed with Anik (2026-09-24): "Basic Salary + House Rent +
// Medical Allowance + Conveyance = Gross Salary", split Basic 60% / House
// Rent 30% / Medical 5% / Conveyance 5% of GROSS (matches the salary
// calculator he shared: DEFAULT_SALARY_CALCULATION_CONFIG). Mobile Allowance
// and Other Allowance are explicitly ADDITIONAL components on top of Gross,
// not part of the 60/30/5/5 split — they're set freely, not derived.
const SALARY_SPLIT = {
  basicPercent: 60,
  houseRentPercent: 30,
  medicalPercent: 5,
  conveyancePercent: 5,
};

function componentsFromGross(gross) {
  const g = Math.max(0, Number(gross) || 0);
  return {
    basic: Math.round(g * (SALARY_SPLIT.basicPercent / 100)),
    houseRent: Math.round(g * (SALARY_SPLIT.houseRentPercent / 100)),
    medical: Math.round(g * (SALARY_SPLIT.medicalPercent / 100)),
    transport: Math.round(g * (SALARY_SPLIT.conveyancePercent / 100)),
  };
}

// Basic is usually the number HR actually knows (an offer letter figure), so
// typing it derives Gross backward, then the rest forward from that Gross —
// same formula, just entered from the other end.
function componentsFromBasic(basic) {
  const b = Math.max(0, Number(basic) || 0);
  const gross = SALARY_SPLIT.basicPercent > 0 ? b / (SALARY_SPLIT.basicPercent / 100) : 0;
  return { gross: Math.round(gross), ...componentsFromGross(gross) };
}

const EditEmployeeSalaryDialog = ({ open, onOpenChange, employee: selectedEmployee, onSuccess }) => {
  const { handleCreateSalarySetting, getSalaryByEmail, structures } = usePayroll();

  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedGross, setDisplayedGross] = useState(0);

  const [salaryForm, setSalaryForm] = useState({
    salary_grade: "",
    basic_salary: "0",
    house_rent: "0",
    medical_allowance: "0",
    transport_allowance: "0",
    mobile_allowance: "0",
    other_allowances: "0",
    advance_installment: "0",
    // BIZ-PAY-01: Arrear, TA, DA, Loan Deduction and Other Deduction — the
    // rest of the business's component list, previously unused DB columns.
    arrear: "0",
    ta: "0",
    da: "0",
    loan_deduction: "0",
    other_deduction: "0",
    // Loan Duration (Anik's request): the Loan Deduction above only applies
    // automatically for this many payroll periods starting at the start
    // period below, then stops on its own. Blank = applies indefinitely.
    loan_start_period: "",
    loan_duration_months: "",
    // Provident Fund (PF) — renamed/consolidated from the old separate,
    // confusing "EPF"-vs-"PF" fields. Auto = 10% of Basic; this override
    // field lets HR set a specific figure instead when needed.
    provident_fund: "0",
    epf_applicable: false,
    tax_applicable: false,
    status: "active",
  });

  // 1. Fetch Data on Open
  useEffect(() => {
    const initializeData = async () => {
      if (!selectedEmployee || !open) return;

      setIsFetching(true);
      try {
        const response = await getSalaryByEmail(selectedEmployee.email);

        if (response && response.success && response.data) {
          const dbData = response.data;
          setDisplayedGross(dbData.grossSalary || selectedEmployee.grossSalary);

          setSalaryForm({
            salary_grade: dbData.grade || "",
            basic_salary: dbData.basicSalary?.toString() || "0",
            house_rent: dbData.houseRent?.toString() || "0",
            medical_allowance: dbData.medicalAllowance?.toString() || "0",
            transport_allowance: dbData.transportAllowance?.toString() || "0",
            mobile_allowance: dbData.mobileAllowance?.toString() || "0",
            other_allowances: dbData.otherAllowances?.toString() || "0",
            advance_installment: dbData.advance_installment?.toString() || "0",
            arrear: dbData.arrear?.toString() || "0",
            ta: dbData.ta?.toString() || "0",
            da: dbData.da?.toString() || "0",
            loan_deduction: dbData.loan_deduction?.toString() || "0",
            other_deduction: dbData.other_deduction?.toString() || "0",
            loan_start_period: dbData.loan_start_period || "",
            loan_duration_months: dbData.loan_duration_months?.toString() || "",
            provident_fund: dbData.provident_fund?.toString() || "0",
            epf_applicable: !!dbData.epf_applicable,
            tax_applicable: !!dbData.tax_applicable,
            status: dbData.status || "active",
          });
        } else {
          // Fallback: no salary_settings row yet — start from the employee's
          // last-known gross and derive the full 60/30/5/5 split from it.
          const gross = selectedEmployee.grossSalary || 0;
          const c = componentsFromGross(gross);
          setDisplayedGross(gross);
          setSalaryForm({
            salary_grade: selectedEmployee.matchedPayroll?.grade || "",
            basic_salary: c.basic.toString(),
            house_rent: c.houseRent.toString(),
            medical_allowance: c.medical.toString(),
            transport_allowance: c.transport.toString(),
            mobile_allowance: "0",
            other_allowances: "0",
            advance_installment: "0",
            arrear: "0",
            ta: "0",
            da: "0",
            loan_deduction: "0",
            other_deduction: "0",
            loan_start_period: "",
            loan_duration_months: "",
            provident_fund: "0",
            epf_applicable: true,
            tax_applicable: true,
            status: selectedEmployee.status || "active",
          });
        }
      } catch (error) {
        console.error("Initialization Error:", error);
        setDisplayedGross(selectedEmployee.grossSalary || 0);
      } finally {
        setIsFetching(false);
      }
    };

    initializeData();
  }, [selectedEmployee, open, getSalaryByEmail]);

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
    })}`;
  };

  // BIZ-PAY-01: Gross Salary = Basic + House Rent + Medical + Conveyance
  // ONLY. Mobile Allowance and Other Allowance are additional components on
  // top of Gross (still paid, just not part of "Gross Salary" or the
  // Festival Bonus base) — confirmed against the calculation tool Anik
  // shared, which treats them as benefit allowances added to net pay only.
  const calculateGross = () => {
    return (
      (parseInt(salaryForm.basic_salary) || 0) +
      (parseInt(salaryForm.house_rent) || 0) +
      (parseInt(salaryForm.medical_allowance) || 0) +
      (parseInt(salaryForm.transport_allowance) || 0)
    );
  };

  const currentGross = calculateGross();
  const mobileAndOther = (parseInt(salaryForm.mobile_allowance) || 0) + (parseInt(salaryForm.other_allowances) || 0);

  // Typing Gross Salary derives Basic/House Rent/Medical/Conveyance forward
  // — this is the primary flow ("just input gross, everything is auto
  // calculated") from the calculator Anik shared.
  const handleGrossChange = (value) => {
    const c = componentsFromGross(value);
    setSalaryForm((prev) => ({
      ...prev,
      basic_salary: c.basic.toString(),
      house_rent: c.houseRent.toString(),
      medical_allowance: c.medical.toString(),
      transport_allowance: c.transport.toString(),
    }));
  };

  // Typing Basic Salary derives Gross backward, then the same forward split
  // — for when HR knows Basic instead (e.g. from an offer letter).
  const handleBasicChange = (value) => {
    const basic = parseInt(value) || 0;
    const c = componentsFromBasic(basic);
    setSalaryForm((prev) => ({
      ...prev,
      basic_salary: value,
      house_rent: c.houseRent.toString(),
      medical_allowance: c.medical.toString(),
      transport_allowance: c.transport.toString(),
    }));
  };

  // BIZ-PAY-01: applying a grade's defaults pre-fills Mobile/Other/EPF from
  // the structure band (House Rent/Medical/Conveyance are always derived
  // from Basic via the fixed 60/30/5/5 split above, so a stale flat default
  // for those three would just fight the formula) — still fully editable
  // afterward, this is a starting point, not a lock.
  const applyStructureDefaults = (structureId) => {
    const structure = structures.find((s) => s._id === structureId);
    if (!structure) return;
    setSalaryForm((prev) => ({
      ...prev,
      salary_grade: structure.grade,
      mobile_allowance: String(structure.default_mobile_allowance || 0),
      other_allowances: String(structure.default_other_allowances || 0),
      epf_applicable: !!structure.epf_applicable,
    }));
  };

  const handleUpdateSalary = async () => {
    setIsSubmitting(true);
    const submissionData = {
      employeeId: selectedEmployee.employeeId || selectedEmployee.employee_id,
      fullName: selectedEmployee.fullName || selectedEmployee.employee_name,
      email: selectedEmployee.email,
      grade: salaryForm.salary_grade,
      basicSalary: salaryForm.basic_salary,
      houseRent: salaryForm.house_rent,
      medicalAllowance: salaryForm.medical_allowance,
      transportAllowance: salaryForm.transport_allowance,
      mobileAllowance: salaryForm.mobile_allowance,
      otherAllowances: salaryForm.other_allowances,
      advance_installment: salaryForm.advance_installment,
      arrear: salaryForm.arrear,
      ta: salaryForm.ta,
      da: salaryForm.da,
      loan_deduction: salaryForm.loan_deduction,
      other_deduction: salaryForm.other_deduction,
      loan_start_period: salaryForm.loan_deduction && Number(salaryForm.loan_deduction) > 0 ? salaryForm.loan_start_period || null : null,
      loan_duration_months: salaryForm.loan_deduction && Number(salaryForm.loan_deduction) > 0 ? salaryForm.loan_duration_months || null : null,
      provident_fund: salaryForm.provident_fund,
      epf_applicable: salaryForm.epf_applicable,
      tax_applicable: salaryForm.tax_applicable,
      status: salaryForm.status,
      level: 1
    };

    try {
      const result = await handleCreateSalarySetting(submissionData);
      if (result.success) {
        toast.success("Salary updated successfully");
        onOpenChange(false);
        onSuccess();
      }

    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedEmployee) return null;

  const hasLoan = Number(salaryForm.loan_deduction || 0) > 0;
  let loanMonthsRemaining = null;
  if (hasLoan && salaryForm.loan_start_period && salaryForm.loan_duration_months) {
    const [sy, sm] = salaryForm.loan_start_period.split("-").map(Number);
    const now = new Date();
    const elapsed = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1;
    loanMonthsRemaining = Math.max(0, Number(salaryForm.loan_duration_months) - Math.max(0, elapsed - 1));
  }

  const pctOfGross = (n) => (currentGross > 0 ? ((parseInt(n) || 0) / currentGross) * 100 : 0);
  const componentWarning = (label, value, expectedPct) => {
    const pct = pctOfGross(value);
    if (currentGross <= 0) return null;
    if (Math.abs(pct - expectedPct) > 2) {
      return (
        <span className="text-orange-600 ml-1">
          ⚠️ {pct.toFixed(1)}% (should be ~{expectedPct}%)
        </span>
      );
    }
    return <span className="text-green-600 ml-1">✓ {pct.toFixed(1)}%</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee Salary</DialogTitle>
          <DialogDescription>
            Update salary details for {selectedEmployee.fullName || selectedEmployee.employee_name}. Company formula: Basic 60% / House Rent 30% / Medical 5% / Conveyance 5% of Gross Salary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(selectedEmployee.fullName || selectedEmployee.employee_name).split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedEmployee.fullName || selectedEmployee.employee_name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedEmployee.designation} • {selectedEmployee.department}
                </p>
                <p className="text-sm text-gray-500">
                  Employee ID: {selectedEmployee.employeeId || selectedEmployee.employee_id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{isFetching ? "Loading..." : "Current Gross"}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(displayedGross)}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="edit_salary_grade">Salary Grade</Label>
              <Input
                id="edit_salary_grade"
                value={salaryForm.salary_grade}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, salary_grade: e.target.value }))}
                placeholder="e.g., A1, B2, C1"
              />
            </div>
            <div>
              <Label htmlFor="edit_apply_structure">Apply a structure's defaults</Label>
              <Select onValueChange={applyStructureDefaults}>
                <SelectTrigger id="edit_apply_structure">
                  <SelectValue placeholder="Choose a salary structure..." />
                </SelectTrigger>
                <SelectContent>
                  {(structures || []).map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.title} (Grade {s.grade}{s.level ? `-${s.level}` : ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Fills Mobile/Other/EPF from that grade's band — House Rent/Medical/Conveyance always follow the formula below.
              </p>
            </div>
          </div>

          {/* Gross Salary — primary input: type this and everything below auto-fills */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Label htmlFor="edit_gross_salary" className="text-blue-900 font-semibold">
              Gross Salary <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_gross_salary"
              type="number"
              min="0"
              value={currentGross || ""}
              onChange={(e) => handleGrossChange(e.target.value)}
              placeholder="100000"
              className="text-lg font-semibold bg-white mt-1"
            />
            <p className="text-xs text-blue-700 mt-1">
              Type Gross here and Basic/House Rent/Medical/Conveyance below fill in automatically (60/30/5/5). Or type Basic below instead — either way works.
            </p>
          </div>

          {/* Basic Salary & House Rent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_basic_salary">
                Basic Salary <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_basic_salary"
                type="number"
                min="0"
                value={salaryForm.basic_salary}
                onChange={(e) => handleBasicChange(e.target.value)}
                placeholder="60000"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                60% of Gross{componentWarning("basic", salaryForm.basic_salary, 60)}
              </p>
            </div>
            <div>
              <Label htmlFor="edit_house_rent">
                House Rent <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_house_rent"
                type="number"
                min="0"
                value={salaryForm.house_rent}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, house_rent: e.target.value }))}
                placeholder="30000"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">
                30% of Gross{componentWarning("house rent", salaryForm.house_rent, 30)}
              </p>
            </div>
          </div>

          {/* Allowances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_medical">Medical Allowance</Label>
              <Input
                id="edit_medical"
                type="number"
                min="0"
                value={salaryForm.medical_allowance}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, medical_allowance: e.target.value }))}
                placeholder="5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                5% of Gross{componentWarning("medical", salaryForm.medical_allowance, 5)}
              </p>
            </div>
            <div>
              <Label htmlFor="edit_transport">Transport Allowance (Conveyance)</Label>
              <Input
                id="edit_transport"
                type="number"
                min="0"
                value={salaryForm.transport_allowance}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, transport_allowance: e.target.value }))}
                placeholder="5000"
              />
              <p className="text-xs text-gray-500 mt-1">
                5% of Gross{componentWarning("conveyance", salaryForm.transport_allowance, 5)}
              </p>
            </div>
            <div>
              <Label htmlFor="edit_mobile">Mobile Allowance</Label>
              <Input
                id="edit_mobile"
                type="number"
                min="0"
                value={salaryForm.mobile_allowance}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, mobile_allowance: e.target.value }))}
                placeholder="1500"
              />
              <p className="text-xs text-gray-500 mt-1">Additional — on top of Gross, not part of the 60/30/5/5 split</p>
            </div>
            <div>
              <Label htmlFor="edit_other">Other Allowances</Label>
              <Input
                id="edit_other"
                type="number"
                min="0"
                value={salaryForm.other_allowances}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, other_allowances: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Additional — on top of Gross, not part of the 60/30/5/5 split</p>
            </div>
          </div>

          {/* Arrear / TA / DA — additional standing components (BIZ-PAY-01) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit_arrear">Arrear</Label>
              <Input
                id="edit_arrear"
                type="number"
                min="0"
                value={salaryForm.arrear}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, arrear: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="edit_ta">TA (Travel Allowance)</Label>
              <Input
                id="edit_ta"
                type="number"
                min="0"
                value={salaryForm.ta}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, ta: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="edit_da">DA (Dearness Allowance)</Label>
              <Input
                id="edit_da"
                type="number"
                min="0"
                value={salaryForm.da}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, da: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit_advance">Advance Installment</Label>
              <Input
                id="edit_advance"
                type="number"
                min="0"
                value={salaryForm.advance_installment}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, advance_installment: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Monthly advance deduction</p>
            </div>
            <div>
              <Label htmlFor="edit_loan">Loan Deduction</Label>
              <Input
                id="edit_loan"
                type="number"
                min="0"
                value={salaryForm.loan_deduction}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, loan_deduction: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Monthly loan repayment deduction</p>
            </div>
            <div>
              <Label htmlFor="edit_other_deduction">Other Deduction</Label>
              <Input
                id="edit_other_deduction"
                type="number"
                min="0"
                value={salaryForm.other_deduction}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, other_deduction: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Any other monthly deduction</p>
            </div>
          </div>

          {/* Loan Duration — only relevant once a Loan Deduction is set */}
          {hasLoan && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div>
                <Label htmlFor="edit_loan_start">Loan Start Period</Label>
                <Input
                  id="edit_loan_start"
                  type="month"
                  value={salaryForm.loan_start_period}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, loan_start_period: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">First payroll period this deduction applies to</p>
              </div>
              <div>
                <Label htmlFor="edit_loan_duration">Duration (months)</Label>
                <Input
                  id="edit_loan_duration"
                  type="number"
                  min="1"
                  value={salaryForm.loan_duration_months}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, loan_duration_months: e.target.value }))}
                  placeholder="e.g., 12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {salaryForm.loan_start_period && salaryForm.loan_duration_months
                    ? loanMonthsRemaining != null
                      ? `${loanMonthsRemaining} of ${salaryForm.loan_duration_months} month(s) remaining — stops automatically after that.`
                      : "Stops automatically after this many payroll runs."
                    : "Leave blank to deduct indefinitely every month (old behavior)."}
                </p>
              </div>
            </div>
          )}

          {/* Provident Fund (PF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex items-center space-x-2 pb-1">
              <Switch
                id="edit_epf"
                checked={salaryForm.epf_applicable}
                onCheckedChange={(checked) => setSalaryForm(prev => ({ ...prev, epf_applicable: checked }))}
              />
              <div>
                <Label htmlFor="edit_epf">Provident Fund (PF) Applicable</Label>
                <p className="text-xs text-gray-500">Auto-calculated as 10% of Basic Salary</p>
              </div>
            </div>
            <div>
              <Label htmlFor="edit_pf_override">PF Override Amount (optional)</Label>
              <Input
                id="edit_pf_override"
                type="number"
                min="0"
                value={salaryForm.provident_fund}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, provident_fund: e.target.value }))}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Leave at 0 to use the automatic 10% of Basic — set a figure here only to override it for this employee.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit_tax"
              checked={salaryForm.tax_applicable}
              onCheckedChange={(checked) => setSalaryForm(prev => ({ ...prev, tax_applicable: checked }))}
            />
            <Label htmlFor="edit_tax">Tax (AIT) Applicable</Label>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="edit_status">Status</Label>
            <Select
              value={salaryForm.status}
              onValueChange={(value) => setSalaryForm(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger id="edit_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calculated Gross */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Gross Salary</p>
                <p className="text-xs text-green-600 mt-1 uppercase">
                  Basic + House Rent + Medical + Conveyance
                </p>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(currentGross)}
              </p>
            </div>
            {mobileAndOther > 0 && (
              <div className="mt-2 pt-2 border-t border-green-300 flex items-center justify-between">
                <p className="text-sm text-green-700">+ Mobile &amp; Other Allowance (paid on top, not part of Gross)</p>
                <p className="text-sm font-semibold text-green-800">{formatCurrency(mobileAndOther)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSalary}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={isSubmitting || !salaryForm.basic_salary || !salaryForm.house_rent}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeSalaryDialog;
