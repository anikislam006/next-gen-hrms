"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePayroll } from "@/app/hook/usePayroll";

const Salary = () => {
  const { UserAllDetails } = useAuth();
  const { getRecordsByEmail } = usePayroll();
  const userEmail = UserAllDetails?.email;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch salary history ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchSalary = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await getRecordsByEmail(userEmail);
        if (result.success) {
          // Sort newest first so [0] is the most recent
          const sorted = (result.data || []).sort(
            (a, b) =>
              new Date(b.processedTimestamp).getTime() -
              new Date(a.processedTimestamp).getTime()
          );
          setRecords(sorted);
        } else {
          setError(result.message || "Failed to load salary data");
        }
      } catch (err) {
        setError(err.message || "Failed to load salary data");
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, [userEmail, getRecordsByEmail]);

  // ── Pick the current month's record (or most recent if no current-month) ──
  const currentRecord = (() => {
    if (!records.length) return null;
    const now = new Date();
    const thisMonth = records.find((r) => {
      const d = new Date(r.processedTimestamp);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    return thisMonth || records[0];
  })();

  // ── Format helpers ────────────────────────────────────────────────────────
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const periodLabel =
    currentRecord?.config?.payrollPeriod ||
    (currentRecord?.processedTimestamp
      ? new Date(currentRecord.processedTimestamp).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Current month");

  // ── Pull values from record (with fallbacks) ──────────────────────────────
  const grossSalary = currentRecord?.grossSalary || 0;
  const basicSalary = currentRecord?.basicSalary || 0;
  const houseRent = currentRecord?.houseRent || 0;
  const medical = currentRecord?.medicalAllowance || 0;
  const transport = currentRecord?.transportAllowance || 0;
  const epf = currentRecord?.epfContribution || 0;
  const tax = currentRecord?.taxDeduction || 0;
  const advance = currentRecord?.advanceDeduction || 0;
  const otherDeductions = currentRecord?.otherDeductions || 0;
  const totalDeductions = epf + tax + advance + otherDeductions;
  const netSalary =
    currentRecord?.netSalary ?? grossSalary - totalDeductions;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading salary data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 w-full">

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* No payroll yet */}
      {!loading && !currentRecord && !error && (
        <div className="py-16 text-center">
          <Wallet className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base text-slate-600 font-semibold">
            No payroll records yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Your salary breakdown will appear here once payroll is processed.
          </p>
        </div>
      )}

      {currentRecord && (
        <>
          {/* Period indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Showing data for</span>
            <span className="font-semibold text-slate-900">{periodLabel}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Current Salary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Current Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Salary:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(grossSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary:</span>
                    <span className="text-slate-700">
                      {formatCurrency(basicSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-slate-600">Net Salary:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(netSalary)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allowances & Deductions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Allowances & Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {/* Allowances */}
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent:</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(houseRent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical:</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(medical)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transport:</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(transport)}
                    </span>
                  </div>

                  <hr className="my-3" />

                  {/* Deductions */}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax:</span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">EPF:</span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(epf)}
                    </span>
                  </div>

                  {advance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Advance:</span>
                      <span className="text-red-600 font-medium">
                        -{formatCurrency(advance)}
                      </span>
                    </div>
                  )}
                  {otherDeductions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Other Deductions:</span>
                      <span className="text-red-600 font-medium">
                        -{formatCurrency(otherDeductions)}
                      </span>
                    </div>
                  )}

                  {/* Totals */}
                  <hr className="my-3" />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Allowances:</span>
                    <span className="text-green-600 font-semibold">
                      +{formatCurrency(houseRent + medical + transport)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Deductions:</span>
                    <span className="text-red-600 font-semibold">
                      -{formatCurrency(totalDeductions)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Salary;