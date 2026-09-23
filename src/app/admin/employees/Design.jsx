"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Download, Search } from "lucide-react";

import HeaderSections from "../../../components/employee/Components/HeaderSections";
import StateCardSections from "../../../components/employee/Components/StateCardSections";
import EmployeeCard from "../../../components/employee/Components/EmployeeCard";
import EmployeeOnboarding from "@/components/employee/EmployeeOnboarding/EmployeeOnboarding";

// Mock employee data
const demoEmployees = [
  { id: 1, full_name: "John Doe", designation: "Software Engineer", department: "IT", employee_id: "EMP001", employment_type: "Permanent", role: "Developer", hr_level: "Level 2", joining_date: "2020-01-15", last_profile_update: "2023-09-01", profile_locked: false, email: "john.doe@example.com" },
  { id: 2, full_name: "Jane Smith", designation: "HR Manager", department: "HR", employee_id: "EMP002", employment_type: "Permanent", role: "Manager", hr_level: "Level 3", joining_date: "2018-05-10", last_profile_update: "2023-08-15", profile_locked: false, email: "jane.smith@example.com" },
  // ...more employees
];

const departments = ["Engineering", "Marketing", "HR", "Finance", "Operations"];

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
const [onboardingRequests, setOnboardingRequests] = useState([]);

useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const res = await fetch("https://code360.pro/api/get-employee");
      const data = await res.json();
      if (data.success && data.data) {
        setOnboardingRequests(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  // Fetch data initially
  fetchEmployees();

  // Auto-refresh every 5 seconds (you can change this)
  const intervalId = setInterval(fetchEmployees, 5000);

  // Cleanup on unmount
  return () => clearInterval(intervalId);
}, []);



  // Initialize tab based on query param
  const initialTab = searchParams.get("tab") === "onboarding" ? "onboarding" : "employees";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Sync tab change to URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.replace(`/super-admin/employees?tab=${tab}`);
  };

  return (
    <div className="space-y-8 p-5">
      <HeaderSections />
      <StateCardSections />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white/80 backdrop-blur-sm border border-white/20">
            <TabsTrigger 
              value="employees" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Employee Directory
            </TabsTrigger>
            <TabsTrigger 
              value="onboarding" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Onboarding
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee Directory
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    variant="outline"
                    size="sm"
                  >
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                  <Button 
                    onClick={() => console.log("Export CSV")}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => console.log("Add employee")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employee Cards */}
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "grid grid-cols-1 gap-4"}>
                {onboardingRequests.map(emp => (
                  <EmployeeCard key={emp._id} employee={emp} viewMode={viewMode} demoMode={true} onView={() => console.log("View employee", emp)} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          <EmployeeOnboarding onboardingRequests={onboardingRequests} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
