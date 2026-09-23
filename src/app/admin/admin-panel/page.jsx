"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Users, Contact, Lock, History, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminPanelHeader from "./AdminPanelCompo/AdminPanelHeader";
import UserManagementNew from "./AdminPanelCompo/UserManagementNew";
import PasswordManagement from "./AdminPanelCompo/PasswordManagement";
import EmployeeManagement from "./AdminPanelCompo/EmployeeManagement";
import ActivityLog from "./AdminPanelCompo/ActivityLog";
import SystemOverview from "./AdminPanelCompo/SystemOverview";
import Settings from "./AdminPanelCompo/Settings";

const AdminPanelContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") || "users";

  const handleTabChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.set("page", "1"); // Reset pagination on tab switch
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="p-6 space-y-6">
      <AdminPanelHeader />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 min-w-[700px]">
            <TabsTrigger value="users" ><Users className="w-4 h-4 mr-2" /> Users</TabsTrigger>
            {/* <TabsTrigger value="employees" ><Contact className="w-4 h-4 mr-2" /> Employees</TabsTrigger> */}
            <TabsTrigger value="security" ><Lock className="w-4 h-4 mr-2" /> Security</TabsTrigger>
            {/* <TabsTrigger value="logs" ><History className="w-4 h-4 mr-2" /> Logs</TabsTrigger>
            <TabsTrigger value="overview" ><LayoutDashboard className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="settings" ><SettingsIcon className="w-4 h-4 mr-2" /> Settings</TabsTrigger> */}
          </TabsList>
        </div>

        <TabsContent value="users"><UserManagementNew /></TabsContent>
        <TabsContent value="employees"><EmployeeManagement /></TabsContent>
        <TabsContent value="security"><PasswordManagement /></TabsContent>
        <TabsContent value="logs"><ActivityLog /></TabsContent>
        <TabsContent value="overview"><SystemOverview /></TabsContent>
        <TabsContent value="settings"><Settings /></TabsContent>
      </Tabs>
    </div>
  );
};

export default function AdminPanelPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Dashboard...</div>}>
      <AdminPanelContent />
    </Suspense>
  );
}