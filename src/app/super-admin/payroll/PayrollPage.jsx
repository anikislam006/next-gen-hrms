"use client";
import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutGrid, 
  Users, 
  History, 
  BarChart3, 
  ShieldCheck,
  PlayCircle,
  TrendingUp,
  DollarSign,
  Shield,
  AlertCircle,
  RefreshCw,
  SearchX
} from "lucide-react";

// shadcn/ui Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Your Custom Components
import StructuresTab from "./PayrollCompo/StructuresTab";
import EmployeeSalaries from "./PayrollCompo/EmployeeSalaries";
import ProcessPayroll from "./PayrollCompo/ProcessPayroll";
import PayrollRecord from "./PayrollCompo/PayrollRecord";
import PayrollHeader from "./PayrollCompo/PayrollHeader";

// Custom Hook
import { usePayroll } from "@/app/hook/usePayroll";
import ReportsAnalytics from "./PayrollCompo/ReportsAnalytics";

/**
 * StatCard Component
 * Replicates the clean design with right-aligned icons.
 */
const StatCard = ({ label, value, icon: Icon, colorClass, loading, showReload, onReload }) => (
  <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden transition-all hover:shadow-md">
    <CardContent className="p-7">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-50 animate-pulse rounded-lg" />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
              {showReload && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReload} 
                  className="h-7 text-[10px] w-fit bg-red-50 text-red-600 border-red-100 hover:bg-red-100 font-bold"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> RELOAD DATA
                </Button>
              )}
            </div>
          )}
        </div>
        <Icon className={`w-9 h-9 opacity-80 ${colorClass}`} />
      </div>
    </CardContent>
  </Card>
);

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const { mgmtStats, statsLoading, refreshStats } = usePayroll();

  // URL-synced tab state
  const activeTab = searchParams.get("tab") || "Structures";

  const tabs = [
    { id: "Structures", name: "Structures", icon: LayoutGrid, color: "#3b82f6" },
    { id: "Employee Salaries", name: "Employee Salaries", icon: Users, color: "#8b5cf6" },
    { id: "Process Payroll", name: "Processing", icon: PlayCircle, color: "#10b981" },
    { id: "Payroll Records", name: "Payroll Records", icon: History, color: "#f59e0b" },
    { id: "Reports & Analytics", name: "Analytics", icon: BarChart3, color: "#6366f1" },
    { id: "Compliance", name: "Compliance", icon: ShieldCheck, color: "#ef4444" },
  ];

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="p-6 md:p-10 font-poppins space-y-8 bg-[#F8F9FA] min-h-screen">
      {/* Header Section */}
      <PayrollHeader />

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <StatCard 
          label="Total Employees" 
          value={mgmtStats.totalEmployees} 
          icon={Users} 
          colorClass="text-blue-500"
          loading={statsLoading}
          showReload={mgmtStats.totalEmployees === 0}
          onReload={refreshStats}
        />
        <StatCard 
          label="Total Payroll" 
          value={formatCurrency(mgmtStats.totalSalaryDisbursed)} 
          icon={DollarSign} 
          colorClass="text-emerald-500"
          loading={statsLoading}
        />
        <StatCard 
          label="Average Salary" 
          value={formatCurrency(mgmtStats.averageGrossSalary)} 
          icon={TrendingUp} 
          colorClass="text-purple-500"
          loading={statsLoading}
        />
      </motion.div>

      {/* Tabs Implementation - Exact Design match */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 ">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
             
            >
              
{tab.name}            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <TabsContent value="Structures">
            <StructuresTab />
          </TabsContent>
          
          <TabsContent value="Employee Salaries">
            <EmployeeSalaries />
          </TabsContent>
          
          <TabsContent value="Process Payroll">
            <ProcessPayroll />
          </TabsContent>
          
          <TabsContent value="Payroll Records">
            <PayrollRecord />
          </TabsContent>

          <TabsContent value="Reports & Analytics">
            <ReportsAnalytics/>
          </TabsContent>

      
        </div>
      </Tabs>

    </div>
  );
}