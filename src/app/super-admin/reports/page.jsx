"use client";

import React from 'react';
import { motion } from "framer-motion";
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Download, 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ReportsPage = () => {
    // Mock user for the design context
    const demoMode = true;

    return (
        <div className="p-6 space-y-8 min-h-screen bg-gray-50/50">
            {/* Header Section with Gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg"
            >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart className="w-8 h-8 text-white" />
                            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        </div>
                        <p className="text-yellow-100 opacity-90">Generate comprehensive HR reports and insights</p>
                        {demoMode && (
                            <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 mt-3 font-medium">
                                🎭 Demo Mode Active
                            </Badge>
                        )}
                    </div>
                    {/* <Button 
                        variant="outline" 
                        className="border-white/30 text-white hover:bg-white/10 rounded-xl font-bold transition-all"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                    </Button> */}
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Attendance Reports */}
                <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <BarChart className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Attendance Reports</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Detailed daily attendance analytics, punch-in trends, and late-coming reports.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Leave Analysis */}
                <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                                <PieChart className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Leave Analysis</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Monitor leave utilization, department-wise balance, and upcoming holiday schedules.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                                <TrendingUp className="w-10 h-10 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Performance Metrics</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Real-time employee performance insights, appraisal scores, and KPI tracking.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Additional Status Section (Using your icons) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <Shield className="text-blue-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-slate-700">Secure Data</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <FileCheck className="text-emerald-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-slate-700">Verified Logs</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <AlertTriangle className="text-amber-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-slate-700">Pending Reviews</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <CheckCircle className="text-indigo-500 w-5 h-5" />
                    <span className="text-sm font-semibold text-slate-700">All Systems Normal</span>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;