"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  Wallet, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";

// UI Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Today from "./Emp-dash-compo/Today";
import Attendance from "./Emp-dash-compo/Attendance";
import Leave from "./Emp-dash-compo/Leave";
import Salary from "./Emp-dash-compo/Salary";
import Performance from "./Emp-dash-compo/Performance";

const mockData = {
  user: {
    full_name: "Jubair Ahmed",
    designation: "Frontend Developer",
    department: "Engineering",
    employee_id: "EMP-1024",
  },
  attendance: {
    status: "in",
    clock_in_time: "09:30 AM",
    total_hours: 5,
    weekly_hours: 28,
  },
  leave: {
    annual_balance: 12,
    sick_balance: 5,
    pending_requests: 2,
  },
  salary: {
    net_salary: 50000,
    gross_salary: 60000,
  },
  performance: {
    rating: 4.5,
    goals_completed: 3,
    goals_total: 5,
  },
};

export default function AppDashboardMainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "today";

  const handleTabChange = (value) => {
    router.push(`?tab=${value}`, { scroll: false });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header - Restored to your original Green/Teal Gradient Design */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-xl flex justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {mockData.user.full_name}
          </h1>
          <p className="text-sm opacity-90">
            {mockData.user.designation} • {mockData.user.department}
          </p>
          <p className="text-xs mt-2 font-mono bg-white/10 w-fit px-2 py-1 rounded">
            ID: {mockData.user.employee_id}
          </p>
        </div>

        <div className="text-right flex flex-col justify-center">
          <h2 className="text-xl font-semibold flex items-center justify-end gap-2">
            <span className={`h-2 w-2 rounded-full ${mockData.attendance.status === "in" ? "bg-green-300 animate-pulse" : "bg-red-400"}`}></span>
            {mockData.attendance.status === "in" ? "Clocked In" : "Clocked Out"}
          </h2>
          <p className="text-sm opacity-80">
            Since {mockData.attendance.clock_in_time}
          </p>
        </div>
      </div>

      {/* Tabs Implementation using your components */}
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList  className="w-full">
          {["today", "attendance", "leave", "salary", "performance"].map((t) => (
            <TabsTrigger
            
              key={t}
              value={t}
        
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content Areas */}
        <div className="mt-6">
          <TabsContent value="today">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className=""
            >
              <Today></Today>
            </motion.div>
          </TabsContent>

          <TabsContent value="attendance">
            <Attendance></Attendance>
          </TabsContent>

          <TabsContent value="leave">
            <Leave></Leave>
          </TabsContent>

          <TabsContent value="salary">
            <Salary></Salary>
          </TabsContent>

          <TabsContent value="performance">
            <Performance></Performance>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Reusable Stat Card
function StatCard({ title, value, icon }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
          <ArrowUpRight className="w-4 h-4 text-gray-300" />
        </div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-xl font-bold text-gray-900 mt-1">{value}</h4>
      </CardContent>
    </Card>
  );
}