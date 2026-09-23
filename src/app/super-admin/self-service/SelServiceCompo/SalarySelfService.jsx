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
  Calendar
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

const SalarySelfService = () => {
    const { UserAllDetails } = useAuth();
    const { getRecordsByEmail } = usePayroll();
    
    const [userRecords, setUserRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState("2024");

    useEffect(() => {
        const fetchMySalary = async () => {
            if (!UserAllDetails?.email) return;
            try {
                setLoading(true);
                const result = await getRecordsByEmail(UserAllDetails.email);
                if (result.success) {
                    setUserRecords(result.data);
                }
            } catch (err) {
                setError(err.message || "Failed to load salary history");
            } finally {
                setLoading(false);
            }
        };
        fetchMySalary();
    }, [UserAllDetails?.email, getRecordsByEmail]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Calculate Dynamic Summaries
    const epfSummary = {
        totalBalance: userRecords.reduce((acc, curr) => acc + (curr.epfContribution || 0), 0) * 2, // Emp + Employer
        thisYearContribution: userRecords
            .filter(r => new Date(r.processedTimestamp).getFullYear() === 2024)
            .reduce((acc, curr) => acc + (curr.epfContribution || 0), 0),
        interestRate: 8.5,
        estimatedInterest: 1250 // Mocked for design
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium">Syncing payroll data...</p>
        </div>
    );

    return (
        <div className="space-y-6 ">
            {/* 1. EPF Summary Card */}
            {/* <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 font-bold">
                            <Shield className="w-6 h-6" />
                            Provident Fund (EPF) Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/40">
                                <div className="text-2xl font-bold text-green-700 mb-2">
                                    {formatCurrency(epfSummary.totalBalance)}
                                </div>
                                <div className="text-sm text-green-600 font-medium">Total EPF Balance</div>
                                <div className="text-xs text-gray-500 mt-1">Employee + Employer</div>
                            </div>
                            
                            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/40">
                                <div className="text-2xl font-bold text-blue-700 mb-2">
                                    {formatCurrency(epfSummary.thisYearContribution)}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">2024 Contributions</div>
                                <div className="text-xs text-gray-500 mt-1">Accumulated</div>
                            </div>
                            
                            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/40">
                                <div className="text-2xl font-bold text-purple-700 mb-2">
                                    {epfSummary.interestRate}%
                                </div>
                                <div className="text-sm text-purple-600 font-medium">Interest Rate</div>
                                <div className="text-xs text-gray-500 mt-1">Current Annual</div>
                            </div>
                            
                            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/40">
                                <div className="text-2xl font-bold text-orange-700 mb-2">
                                    {formatCurrency(epfSummary.estimatedInterest)}
                                </div>
                                <div className="text-sm text-orange-600 font-medium">Est. Annual Interest</div>
                                <div className="text-xs text-gray-500 mt-1">Projected</div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md rounded-full px-6 transition-all">
                                <Calculator className="w-4 h-4 mr-2" />
                                View Detailed EPF Statement
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div> */}

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
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {userRecords.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No records found.</div>
                        ) : (
                            userRecords.map((record) => (
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
                                            <span className="text-gray-400 text-xs block mb-1">EPF Contribution</span>
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
                                {userRecords.length} Payrolls Processed
                            </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="font-black text-green-700 text-xl">
                                    {formatCurrency(userRecords.reduce((acc, curr) => acc + curr.grossSalary, 0))}
                                </div>
                                <div className="text-[10px] font-bold text-green-600 uppercase mt-1">Total Gross</div>
                            </div>
                            
                            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="font-black text-blue-700 text-xl">
                                    {formatCurrency(userRecords.reduce((acc, curr) => acc + (curr.netSalary || curr.grossSalary - curr.advanceDeduction), 0))}
                                </div>
                                <div className="text-[10px] font-bold text-blue-600 uppercase mt-1">Total Net</div>
                            </div>
                            
                            <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                <div className="font-black text-purple-700 text-xl">
                                    {formatCurrency(epfSummary.totalBalance)}
                                </div>
                                <div className="text-[10px] font-bold text-purple-600 uppercase mt-1">Total EPF</div>
                            </div>
                            
                            <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="font-black text-orange-700 text-xl">
                                    {formatCurrency(userRecords.reduce((acc, curr) => acc + (curr.taxDeduction || 0), 0))}
                                </div>
                                <div className="text-[10px] font-bold text-orange-600 uppercase mt-1">Total Tax</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalarySelfService;