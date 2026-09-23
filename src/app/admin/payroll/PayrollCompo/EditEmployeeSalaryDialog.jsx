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

const EditEmployeeSalaryDialog = ({ open, onOpenChange, employee: selectedEmployee, onSuccess }) => {
  const { handleCreateSalarySetting, getSalaryByEmail } = usePayroll();
  
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
            epf_applicable: !!dbData.epf_applicable,
            tax_applicable: !!dbData.tax_applicable,
            status: dbData.status || "active",
          });
        } else {
          // Fallback to calculation
          setDisplayedGross(selectedEmployee.grossSalary || 0);
          const gross = selectedEmployee.grossSalary || 0;
          const basic = Math.floor(gross * 0.6);
          setSalaryForm({
            salary_grade: selectedEmployee.matchedPayroll?.grade || "",
            basic_salary: basic.toString(),
            house_rent: Math.floor(basic * 0.25).toString(),
            medical_allowance: "0",
            transport_allowance: "0",
            mobile_allowance: "0",
            other_allowances: "0",
            advance_installment: "0",
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

  const calculateGross = () => {
    return (
      (parseInt(salaryForm.basic_salary) || 0) +
      (parseInt(salaryForm.house_rent) || 0) +
      (parseInt(salaryForm.medical_allowance) || 0) +
      (parseInt(salaryForm.transport_allowance) || 0) +
      (parseInt(salaryForm.mobile_allowance) || 0) +
      (parseInt(salaryForm.other_allowances) || 0)
    );
  };

  const currentGross = calculateGross();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee Salary</DialogTitle>
          <DialogDescription>
            Update salary details for {selectedEmployee.fullName || selectedEmployee.employee_name}. Basic salary should be approximately 60% of gross salary.
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
          <div>
            <Label htmlFor="edit_salary_grade">Salary Grade</Label>
            <Input
              id="edit_salary_grade"
              value={salaryForm.salary_grade}
              onChange={(e) => setSalaryForm(prev => ({ ...prev, salary_grade: e.target.value }))}
              placeholder="e.g., A1, B2, C1"
            />
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
                onChange={(e) => {
                  const basic = parseInt(e.target.value) || 0;
                  setSalaryForm(prev => ({ 
                    ...prev, 
                    basic_salary: e.target.value,
                    house_rent: Math.floor(basic * 0.25).toString()
                  }));
                }}
                placeholder="60000"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">Should be ~60% of gross</p>
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
                placeholder="15000"
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">Typically 25% of basic</p>
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
            </div>
            <div>
              <Label htmlFor="edit_transport">Transport Allowance</Label>
              <Input
                id="edit_transport"
                type="number"
                min="0"
                value={salaryForm.transport_allowance}
                onChange={(e) => setSalaryForm(prev => ({ ...prev, transport_allowance: e.target.value }))}
                placeholder="3000"
              />
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
            </div>
          </div>

          {/* Deductions */}
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
            <p className="text-xs text-gray-500 mt-1">Monthly advance deduction amount</p>
          </div>

          {/* Applicability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_epf"
                checked={salaryForm.epf_applicable}
                onCheckedChange={(checked) => setSalaryForm(prev => ({ ...prev, epf_applicable: checked }))}
              />
              <Label htmlFor="edit_epf">EPF Applicable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_tax"
                checked={salaryForm.tax_applicable}
                onCheckedChange={(checked) => setSalaryForm(prev => ({ ...prev, tax_applicable: checked }))}
              />
              <Label htmlFor="edit_tax">Tax Applicable</Label>
            </div>
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
                <p className="text-sm font-medium text-green-700">New Gross Salary</p>
                <p className="text-xs text-green-600 mt-1 uppercase">
                  Based on sum of all components
                </p>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(currentGross)}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-green-300">
              <p className="text-sm text-green-700">
                Basic Salary Percentage: {
                  (currentGross > 0 ? (parseInt(salaryForm.basic_salary) / currentGross) * 100 : 0).toFixed(1)
                }% 
                {((parseInt(salaryForm.basic_salary) / currentGross) * 100 < 55 || (parseInt(salaryForm.basic_salary) / currentGross) * 100 > 65) && (
                  <span className="text-orange-600 ml-2">⚠️ Should be ~60%</span>
                )}
              </p>
            </div>
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