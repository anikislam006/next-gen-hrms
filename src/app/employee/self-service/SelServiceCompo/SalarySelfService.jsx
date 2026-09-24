"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  Shield,
  Calculator,
  History,
  Receipt,
  Eye,
  Download,
  BarChart3,
  Loader2,
  AlertCircle,
  Calendar,
  Wallet,
  Landmark
} from 'lucide-react';
import { usePayroll } from '@/app/hook/usePayroll';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const currentYear = new Date().getFullYear();
// Last 4 years including the current one, so the filter never goes stale.
const RECENT_YEARS = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

const SalarySelfService = () => {
    const { UserAllDetails } = useAuth();
    const { getRecordsByEmail, getSalaryByEmail } = usePayroll();

    const [userRecords, setUserRecords] = useState([]);
    const [mySalary, setMySalary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState(String(currentYear));

    useEffect(() => {
        const fetchMySalary = async () => {
            if (!UserAllDetails?.email) return;
            try {
                setLoading(true);
                const [recordsResult, salaryResult] = await Promise.all([
                    getRecordsByEmail(UserAllDetails.email),
                    getSalaryByEmail(UserAllDetails.email),
                ]);
                if (recordsResult.success) {
                    setUserRecords(recordsResult.data);
                }
                // No salary_settings row yet is a normal state for a brand-new
                // employee, not an error — mySalary just stays null and the
                // card below shows a friendly "not set up yet" message.
                if (salaryResult?.success) {
                    setMySalary(salaryResult.data);
                }
            } catch (err) {
                setError(err.message || "Failed to load salary history");
            } finally {
                setLoading(false);
            }
        };
        fetchMySalary();
    }, [UserAllDetails?.email, getRecordsByEmail, getSalaryByEmail]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Records viewable year-wise (BIZ-EMP-04) — filtered by the period each
    // payroll record was actually processed for, not by when it was created.
    const recordsForSelectedYear = userRecords.filter((r) => {
        const period = r.config?.payrollPeriod;
        if (!period) return false;
        return period.startsWith(selectedYear);
    });

    // Calculate Dynamic Summaries (Employee PF only — this is the
    // Provident Fund line on the employee's own payslip, not an employer
    // match; NexGen doesn't track an employer-side PF contribution).
    const epfSummary = {
        totalBalance: userRecords.reduce((acc, curr) => acc + (curr.epfContribution || 0), 0),
        thisYearContribution: recordsForSelectedYear.reduce((acc, curr) => acc + (curr.epfContribution || 0), 0),
    };

    // Current standing salary structure — what HR has configured for this
    // employee right now, independent of whether a payroll run has happened
    // yet this month. This is what "creating/applying a salary structure
    // reflects on the employee's dashboard" means in practice.
    const salaryCard = () => {
        if (loading) return null;
        if (!mySalary) {
            return (
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="py-10 text-center text-gray-400">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                        Your salary hasn&apos;t been set up yet — contact HR.
                    </CardContent>
                </Card>
            );
        }

        const gross =
            Number(mySalary.basicSalary || 0) +
            Number(mySalary.houseRent || 0) +
            Number(mySalary.medicalAllowance || 0) +
            Number(mySalary.transportAllowance || 0);
        const mobileAndOther = Number(mySalary.mobileAllowance || 0) + Number(mySalary.otherAllowances || 0);
        const pfOverride = Number(mySalary.provident_fund || 0);
        const pf = pfOverride > 0 ? pfOverride : mySalary.epf_applicable ? Number(mySalary.basicSalary || 0) * 0.1 : 0;

        const hasLoan = Number(mySalary.loan_deduction || 0) > 0;
        let loanMonthsRemaining = null;
        if (hasLoan && mySalary.loan_start_period && mySalary.loan_duration_months) {
            const [sy, sm] = mySalary.loan_start_period.split("-").map(Number);
            const now = new Date();
            const elapsed = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1;
            loanMonthsRemaining = Math.max(0, Number(mySalary.loan_duration_months) - Math.max(0, elapsed - 1));
        }

        return (
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800 font-bold">
                        <Wallet className="w-5 h-5 text-blue-600" />
                        My Current Salary Structure
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Basic Salary</p>
                            <p className="font-bold text-gray-800">{formatCurrency(mySalary.basicSalary)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">House Rent</p>
                            <p className="font-bold text-gray-800">{formatCurrency(mySalary.houseRent)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Medical Allowance</p>
                            <p className="font-bold text-gray-800">{formatCurrency(mySalary.medicalAllowance)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Conveyance</p>
                            <p className="font-bold text-gray-800">{formatCurrency(mySalary.transportAllowance)}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <span className="text-sm font-semibold text-blue-800">Gross Salary</span>
                        <span className="text-lg font-bold text-blue-900">{formatCurrency(gross)}</span>
                    </div>

                    {mobileAndOther > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400">Mobile Allowance</p>
                                <p className="font-bold text-gray-700">{formatCurrency(mySalary.mobileAllowance)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400">Other Allowance</p>
                                <p className="font-bold text-gray-700">{formatCurrency(mySalary.otherAllowances)}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Standing Deductions</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-red-50 rounded-lg p-3">
                                <p className="text-xs text-red-400">Provident Fund (PF)</p>
                                <p className="font-bold text-red-700">{formatCurrency(pf)}</p>
                            </div>
                            {Number(mySalary.advance_installment || 0) > 0 && (
                                <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-xs text-red-400">Advance Installment</p>
                                    <p className="font-bold text-red-700">{formatCurrency(mySalary.advance_installment)}</p>
                                </div>
                            )}
                            {Number(mySalary.other_deduction || 0) > 0 && (
                                <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-xs text-red-400">Other Deduction</p>
                                    <p className="font-bold text-red-700">{formatCurrency(mySalary.other_deduction)}</p>
                                </div>
                            )}
                            {hasLoan && (
                                <div className="bg-red-50 rounded-lg p-3 col-span-2 md:col-span-1">
                                    <p className="text-xs text-red-400">Loan Deduction</p>
                                    <p className="font-bold text-red-700">{formatCurrency(mySalary.loan_deduction)}</p>
                                    {loanMonthsRemaining != null && (
                                        <p className="text-[10px] text-red-400 mt-0.5">
                                            {loanMonthsRemaining} of {mySalary.loan_duration_months} month(s) remaining
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Syncing payroll data...</p>
        </div>
    );

    return (
        <div className="space-y-6 ">
            {/* 1. Current Salary Structure — reflects whatever HR has set up
                (including a structure's defaults, once applied), without
                waiting for a payroll run to see it. */}
            {salaryCard()}

            {/* 2. Monthly Salary History */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-800 font-bold">
                            <History className="w-5 h-5 text-blue-600" />
                            Salary History
                        </CardTitle>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32 bg-gray-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RECENT_YEARS.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recordsForSelectedYear.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No records found for {selectedYear}.</div>
                        ) : (
                            recordsForSelectedYear.map((record) => (
                                <div key={record._id} className="border border-gray-100 rounded-xl p-5 hover:bg-gray-50/80 transition-all duration-300 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <Receipt className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{record.config?.payrollPeriod || "Period N/A"}</h4>
                                                <p className="text-xs text-gray-500">Processed: {new Date(record.processedTimestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-extrabold text-green-600">
                                                {formatCurrency(record.netSalary || (record.grossSalary - record.advanceDeduction))}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Salary</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-5 bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-1">Gross Salary</span>
                                            <div className="font-bold text-gray-700">{formatCurrency(record.grossSalary)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-1">Provident Fund (PF)</span>
                                            <div className="font-bold text-emerald-600">{formatCurrency(record.epfContribution)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-1">Deduction</span>
                                            <div className="font-bold text-red-500">{formatCurrency(record.advanceDeduction + (record.otherDeductions || 0))}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-xs block mb-1">Status</span>
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-2 py-0">Paid</Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-xs font-semibold h-8 rounded-lg hover:bg-blue-50">
                                            <Eye className="w-3 h-3 mr-1.5" /> View Details
                                        </Button>
                                        <Button size="sm" className="text-xs font-semibold h-8 rounded-lg bg-gray-900 hover:bg-black">
                                            <Download className="w-3 h-3 mr-1.5" /> Download
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Annual Summary Card */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800 font-bold">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Annual Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/30">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-bold text-gray-800">Year {selectedYear}</h4>
                            <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                                {recordsForSelectedYear.length} Payrolls Processed
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="font-black text-green-700 text-xl">
                                    {formatCurrency(recordsForSelectedYear.reduce((acc, curr) => acc + curr.grossSalary, 0))}
                                </div>
                                <div className="text-[10px] font-bold text-green-600 uppercase mt-1">Total Gross</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="font-black text-blue-700 text-xl">
                                    {formatCurrency(recordsForSelectedYear.reduce((acc, curr) => acc + (curr.netSalary || curr.grossSalary - curr.advanceDeduction), 0))}
                                </div>
                                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Total Net</div>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <div className="font-black text-purple-700 text-xl">
                                    {formatCurrency(epfSummary.thisYearContribution)}
                                </div>
                                <div className="text-[10px] font-bold text-purple-600 uppercase mt-1">Total PF</div>
                            </div>

                            <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="font-black text-orange-700 text-xl">
                                    {formatCurrency(recordsForSelectedYear.reduce((acc, curr) => acc + (curr.taxAmount || 0), 0))}
                                </div>
                                <div className="text-[10px] font-bold text-orange-600 uppercase mt-1">Total Tax (AIT)</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalarySelfService;
