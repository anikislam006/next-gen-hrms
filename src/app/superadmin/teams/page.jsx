"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  GitBranch,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DepartmentSection from "@/components/teams/Components/DepartmentSection";
import TeamsSection from "@/components/teams/Components/TeamsSection";
import TeamMembersSection from "@/components/teams/Components/TeamMembersSection";
import SynchronizedSection from "@/components/teams/Components/SynchronizedSection";

/* Import all section components */


/* ---------------------------------------------
   Fake Data
--------------------------------------------- */
const fakeDepartments = [
  { id: "1", name: "Finance & Accounting" },
  { id: "2", name: "Human Resources" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "IT" },
];

const fakeTeams = [
  { id: "t1", name: "Finance Ops" },
  { id: "t2", name: "Recruitment Team" },
  { id: "t3", name: "Creative Team" },
];

const fakeTeamMembers = [
  { id: "tm1", name: "John Doe", has_employee_record: true },
  { id: "tm2", name: "Sarah Lee", has_employee_record: true },
  { id: "tm3", name: "Mark Taylor", has_employee_record: false },
  { id: "tm4", name: "Alice Brown", has_employee_record: true },
  { id: "tm5", name: "Bob Green", has_employee_record: true },
  { id: "tm6", name: "Tom Smith", has_employee_record: false },
  { id: "tm7", name: "Jane Doe", has_employee_record: true },
  { id: "tm8", name: "Adam Roy", has_employee_record: true },
  { id: "tm9", name: "Steve Jobs", has_employee_record: true },
  { id: "tm10", name: "Chris Paul", has_employee_record: false },
];

export default function TeamManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departments] = useState(fakeDepartments);
  const [teams] = useState(fakeTeams);
  const [teamMembers] = useState(fakeTeamMembers);

  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "departments"
  );

  // ✅ Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    router.push(`/teams?tab=${value}`);
  };

  // ✅ Keep tab in sync on URL change
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const synchronizedCount = teamMembers.filter((t) => t.has_employee_record).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Team Management & Organization Hierarchy
          </h1>
          <p className="text-gray-600 mt-1">
            Manage departments, teams, and synchronization with employee data.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 w-full bg-gray-50 rounded-lg p-1">
          <TabsTrigger value="departments">
            Departments
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {departments.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="teams">
            Teams
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {teams.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="team-members">
            Team Members
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {teamMembers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="synchronized">
            Synchronized
            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {synchronizedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ✅ Department Tab */}
        <TabsContent value="departments" className="mt-6">
          <DepartmentSection departments={departments} />
        </TabsContent>

        {/* ✅ Teams Tab */}
        <TabsContent value="teams" className="mt-6">
          <TeamsSection teams={teams} />
        </TabsContent>

        {/* ✅ Team Members Tab */}
        <TabsContent value="team-members" className="mt-6">
          <TeamMembersSection teamMembers={teamMembers} />
        </TabsContent>

        {/* ✅ Synchronized Tab */}
        <TabsContent value="synchronized" className="mt-6">
          <SynchronizedSection teamMembers={teamMembers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
