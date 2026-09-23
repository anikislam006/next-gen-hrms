"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AttendanceToday from "./AttendanceComponent/AttendanceToday";
import AttendanceAllEmployee from "./AttendanceComponent/AttendanceAllEmployee";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import ParticularAttendance from "./AttendanceComponent/ParticularAttendance";

const AttendancePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { UserAllDetails } = useAuth();
  const employeeId = UserAllDetails?.employeeId;

  const urlTab = searchParams.get("tab") || "today";
  const [activeTab, setActiveTab] = useState(urlTab);

  // Keep tab synced with URL
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    router.push(`?tab=${value}&page=1`);
  };

  return (
    <div className="p-6 font-poppins space-y-6">

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Attendance Management</h1>
            <p className="text-orange-100">
              Track and manage employee attendance
            </p>
          </div>
        </div>
      </motion.div>

      {/* ================= TABS ================= */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">

        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="attendance">My Attendance</TabsTrigger>
          {/* <TabsTrigger value="allEmployees">All Employees Attendance</TabsTrigger> */}
          {/* <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger> */}
        </TabsList>

        {/* ================= TODAY TAB ================= */}
        <TabsContent value="today" className="space-y-6">
          <AttendanceToday UserAllDetails={UserAllDetails} />
        </TabsContent>

        {/* ================= ATTENDANCE TAB ================= */}
        <TabsContent value="attendance" className="space-y-6">
          <ParticularAttendance employeeId={employeeId}></ParticularAttendance>

        </TabsContent>

        {/* ================= ALL EMPLOYEES ================= */}
        <TabsContent value="allEmployees" className="space-y-6">
          <AttendanceAllEmployee />
        </TabsContent>

        {/* ================= LEAVE TAB ================= */}
        <TabsContent value="leave" className="space-y-6">
          <div className="p-6 text-center text-gray-500">
            Leave module coming soon...
          </div>
        </TabsContent>

        {/* ================= SALARY TAB ================= */}
        <TabsContent value="salary" className="space-y-6">
          <div className="p-6 text-center text-gray-500">
            Salary module coming soon...
          </div>
        </TabsContent>

        {/* ================= PERFORMANCE TAB ================= */}
        <TabsContent value="performance" className="space-y-6">
          <div className="p-6 text-center text-gray-500">
            Performance module coming soon...
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default AttendancePage;
