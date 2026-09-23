"use client";
import React, { useState } from "react";
import {
  Users,
  Download,
  UserPlus,
  Search,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EmployeeCard from "@/components/employee/Components/EmployeeCard"; 
import { useMyTeam } from "@/app/hook/useMyTeam";
// Import your hook to get the dynamic department data

const EmployeeTab = ({
  search,
  setSearch,
  department,
  setDepartment,
  employees,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch departments dynamically from the hook
  const { departments } = useMyTeam();

  return (
    <div className="space-y-6 mt-6">
      <Card>
        {/* 🔹 Header Section */}
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Employee Directory
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                variant="outline"
                size="sm"
              >
                {viewMode === "grid" ? "List View" : "Grid View"}
              </Button>

              <Button
                onClick={() => console.log("Export CSV")}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              {/* <Button
                onClick={() => console.log("Add Employee")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button> */}
            </div>
          </div>
        </CardHeader>

        {/* 🔹 Content Section */}
        <CardContent>
          {/* Search + Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ID, Name, Email or Phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {/* Mapping through dynamic departments from hook */}
                  {departments?.map((dep) => (
                    <SelectItem key={dep._id} value={dep.name}>
                      {dep.name}
                    </SelectItem>
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

          {/* 👥 Employee Cards */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                : "grid grid-cols-1 gap-4"
            }
          >
            {employees.length > 0 ? (
              employees.map((emp) => (
                <EmployeeCard
                  key={emp._id}
                  employee={emp}
                  viewMode={viewMode}
                  demoMode={true}
                  onView={() => console.log("View employee", emp)}
                  departments={departments} // Passing dynamic depts for internal card logic
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl border-slate-100">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No employees found in directory.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTab;