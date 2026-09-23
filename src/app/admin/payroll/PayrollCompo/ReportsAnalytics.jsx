"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  Loader2,
  Calendar
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { toast } from "sonner";

const ReportsAnalytics = () => {
    // State for Year and Month
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedMonth, setSelectedMonth] = useState("all"); // "all" for full year, or "01"-"12"
    
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        monthlyTrends: [],
        departmentData: [],
        gradeData: [],
        costBreakdown: [],
        stats: {
            totalPayroll: 0,
            totalEmployees: 0,
            totalEPF: 0,
            pendingIncrements: 0
        }
    });

    // Helper to generate months
    const months = [
        { label: "Full Year", value: "all" },
        { label: "January", value: "01" },
        { label: "February", value: "02" },
        { label: "March", value: "03" },
        { label: "April", value: "04" },
        { label: "May", value: "05" },
        { label: "June", value: "06" },
        { label: "July", value: "07" },
        { label: "August", value: "08" },
        { label: "September", value: "09" },
        { label: "October", value: "10" },
        { label: "November", value: "11" },
        { label: "December", value: "12" },
    ];

    // Helper to generate last 3 years
    const currentYear = new Date().getFullYear();
    const years = [currentYear.toString(), (currentYear - 1).toString(), (currentYear - 2).toString()];

    const fetchAnalytics = async (year, month) => {
        setLoading(true);
        try {
            // Construct URL based on whether a specific month is selected
            let url = `https://code360.pro/payroll-analytics-stats?year=${year}`;
            if (month !== "all") {
                url += `&month=${month}`;
            }

            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success) {
                setAnalyticsData(result.data);
            } else {
                toast.error("Failed to fetch analytics data");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Server connection failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const stats = analyticsData.stats;

    return (
        <div className="space-y-6">
            <Card className="shadow-lg border-none">
                <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <BarChart3 className="w-6 h-6 text-emerald-600" />
                            Payroll Reports & Analytics
                        </CardTitle>
                        
                        <div className="flex flex-wrap gap-3">
                            {/* Year Selector */}
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-32 bg-white">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Month Selector */}
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-40 bg-white">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => toast.success('Report exported successfully!')}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-12">
                    {loading ? (
                        <div className="flex h-80 items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <>
                            {/* Monthly Payroll Trends */}
                            <section>
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Payroll Trends ({selectedMonth === 'all' ? selectedYear : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`})
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analyticsData.monthlyTrends}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                                            <Tooltip 
                                                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="totalGross" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Gross Salary" />
                                            <Line type="monotone" dataKey="totalNet" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Net Salary" />
                                            <Line type="monotone" dataKey="totalDeductions" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Total Deductions" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            {/* Department & Grade Analysis */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-lg font-semibold mb-6">Department-wise Salary Distribution</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analyticsData.departmentData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip formatter={(value, name) => [name === "average" ? formatCurrency(value) : value, name === "average" ? "Avg Salary" : "Employee Count"]} />
                                                <Bar dataKey="count" fill="#3b82f6" name="Employee Count" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="average" fill="#10b981" name="Average Salary" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-6">Salary Grade Distribution</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={analyticsData.gradeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {analyticsData.gradeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 4]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <section>
                                <h3 className="text-lg font-semibold mb-6">Payroll Cost Breakdown</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie
                                                    data={analyticsData.costBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={110}
                                                    dataKey="value"
                                                >
                                                    {analyticsData.costBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {analyticsData.costBreakdown.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                                </div>
                                                <span className="font-bold">{formatCurrency(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* KPIs */}
                            <section>
                                <h3 className="text-lg font-semibold mb-6">Key Performance Indicators</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { 
                                            label: "Budget Utilization", 
                                            value: stats.totalEmployees > 0 
                                                ? `${((stats.totalPayroll / (stats.totalEmployees * 50000)) * 100).toFixed(1)}%` 
                                                : "0%", 
                                            color: "text-emerald-600", 
                                            bg: "bg-emerald-50" 
                                        },
                                        { 
                                            label: "EPF Contribution Rate", 
                                            value: stats.totalPayroll > 0 
                                                ? `${((stats.totalEPF / stats.totalPayroll) * 100).toFixed(1)}%` 
                                                : "0%", 
                                            color: "text-blue-600", 
                                            bg: "bg-blue-50" 
                                        },
                                        { 
                                            label: "Due for Increment", 
                                            value: stats.pendingIncrements, 
                                            color: "text-purple-600", 
                                            bg: "bg-purple-50" 
                                        }
                                    ].map((kpi, i) => (
                                        <Card key={i} className={`${kpi.bg} border-none`}>
                                            <CardContent className="p-6 text-center">
                                                <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                                <p className="text-sm font-medium text-gray-600 mt-1">{kpi.label}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsAnalytics;