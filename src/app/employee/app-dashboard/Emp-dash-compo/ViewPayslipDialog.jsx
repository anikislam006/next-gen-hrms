"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, Receipt, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePayroll } from "@/app/hook/usePayroll";

const ViewPayslipDialog = ({ isOpen, onClose }) => {
  const { UserAllDetails } = useAuth();
  const { getRecordsByEmail } = usePayroll();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ── Fetch all salary records for this user when dialog opens ──────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !UserAllDetails?.email) return;

      setLoading(true);
      try {
        const result = await getRecordsByEmail(UserAllDetails.email);
        if (result.success) {
          const sorted = (result.data || []).sort(
            (a, b) =>
              new Date(b.processedTimestamp).getTime() -
              new Date(a.processedTimestamp).getTime()
          );
          setRecords(sorted);
          // Auto-select the most recent month
          if (sorted.length > 0) setSelectedRecord(sorted[0]);
        }
      } catch (err) {
        console.error("Error loading payslips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, UserAllDetails?.email, getRecordsByEmail]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const formatPeriod = (record) =>
    record?.config?.payrollPeriod ||
    new Date(record?.processedTimestamp).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  // ── Calculations for the active record ────────────────────────────────────
  const grossSalary = selectedRecord?.grossSalary || 0;
  const basicSalary = selectedRecord?.basicSalary || 0;
  const houseRent = selectedRecord?.houseRent || 0;
  const medical = selectedRecord?.medicalAllowance || 0;
  const transport = selectedRecord?.transportAllowance || 0;
  const epf = selectedRecord?.epfContribution || 0;
  const tax = selectedRecord?.taxDeduction || 0;
  const advanceDeduction = selectedRecord?.advanceDeduction || 0;
  const otherDeductions = selectedRecord?.otherDeductions || 0;
  const totalDeductions = epf + tax + advanceDeduction + otherDeductions;
  const netSalary = selectedRecord?.netSalary ?? grossSalary - totalDeductions;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            Payslip Details {selectedRecord && `- ${formatPeriod(selectedRecord)}`}
          </DialogTitle>
          <DialogDescription>
            View detailed salary breakdown and download your payslip
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-slate-500">Loading payslips...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-semibold">
              No payslip records found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your payslips will appear here once payroll is processed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Month selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                Select Month:
              </span>
              <Select
                value={selectedRecord?._id || ""}
                onValueChange={(id) => {
                  const found = records.find((r) => r._id === id);
                  setSelectedRecord(found || null);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select payslip" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {formatPeriod(r)} —{" "}
                      {formatCurrency(r.netSalary || r.grossSalary)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRecord && (
              <>
                {/* Employee info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Employee Name:</span>
                    <div className="font-medium">
                      {UserAllDetails?.fullName || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Employee ID:</span>
                    <div className="font-medium">
                      {UserAllDetails?.employeeId || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <div className="font-medium">
                      {UserAllDetails?.department || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Designation:</span>
                    <div className="font-medium">
                      {UserAllDetails?.designation?.replace(/_/g, " ") || "—"}
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Earnings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Basic Salary:</span>
                      <span>{formatCurrency(basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>House Rent Allowance:</span>
                      <span>{formatCurrency(houseRent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medical Allowance:</span>
                      <span>{formatCurrency(medical)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Allowance:</span>
                      <span>{formatCurrency(transport)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Gross Salary:</span>
                      <span>{formatCurrency(grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>EPF Contribution:</span>
                      <span>{formatCurrency(epf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Deduction:</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    {advanceDeduction > 0 && (
                      <div className="flex justify-between">
                        <span>Advance Deduction:</span>
                        <span>{formatCurrency(advanceDeduction)}</span>
                      </div>
                    )}
                    {otherDeductions > 0 && (
                      <div className="flex justify-between">
                        <span>Other Deductions:</span>
                        <span>{formatCurrency(otherDeductions)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net salary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Salary:</span>
                    <span className="text-green-600">
                      {formatCurrency(netSalary)}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                    {selectedRecord.status || "Processed"}
                  </Badge>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download Payslip
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPayslipDialog;