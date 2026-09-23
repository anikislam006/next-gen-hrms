"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Users,
  Search,
  Download,
  UserPlus,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Custom Components & Hooks
import EmployeeRowCard from "./EmployeeRowCard";
import { useMyTeam } from "@/app/hook/useMyTeam";

const UserManagementNew = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get departments dynamically from your existing hook
  const { departments } = useMyTeam();

  // State Management for Data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [totalPages, setTotalPages] = useState(1);

  // 1. EXTRACT values directly from URL to avoid state conflicts
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "All";
  const status = searchParams.get("status") || "all";

  // Fetch Logic for Employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        directory: "employee",
        ...(search ? { search } : {}),
        ...(department && department !== "All" ? { department } : {}),
        ...(status && status !== "all" ? { status } : {}),
      });

      const res = await fetch(
        `https://code360.pro/api/get-employee?${queryParams.toString()}`,
      );
      const data = await res.json();

      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, status]);

  // 2. TRIGGER fetch when URL parameters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // 3. HELPER function to update URL while preserving the ?tab parameter
  const updateUrl = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "All" && value !== "all") {
        params.set(key, value);
      } else if (value === "All" || value === "all") {
        params.delete(key); // Keep URL clean for default values
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6 min-h-screen bg-slate-50/50">
      <Card className="border-none shadow-sm">
        <CardHeader className=" bg-white rounded-t-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee Directory
                </CardTitle>
        
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                variant="outline"
               
              >
                {viewMode === "grid" ? "List View" : "Grid View"}
              </Button>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
  {/* Filters Bar Container */}
<div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between mb-8">
  
  {/* Search Bar - Flex-1 makes it take up remaining space */}
  <div className="flex-1 min-w-[200px] relative">
    {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /> */}
    <Input
      placeholder="Search by ID, Name, or Email..."
      defaultValue={search}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          updateUrl({ search: e.target.value, page: "1" });
        }
      }}
     
    />
  </div>

  {/* Select Controls Group */}
  <div className="flex gap-2">
    {/* Department Filter */}
    <Select
      value={department}
      onValueChange={(val) => updateUrl({ department: val, page: "1" })}
    >
      <SelectTrigger className="w-[180px] h-10 ">
        <SelectValue placeholder="Department" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="All">All Departments</SelectItem>
        {departments &&
          departments.map((dep) => (
            <SelectItem key={dep._id} value={dep.name}>
              {dep.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>

    {/* Status Filter */}
    <Select
      value={status}
      onValueChange={(val) => updateUrl({ status: val, page: "1" })}
    >
      <SelectTrigger className="w-[160px] h-10 ">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
        <SelectItem value="Locked" className="text-orange-600">
          Locked
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
          {/* Employee List Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            </div>
          ) : employees.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {employees.map((emp) => (
                <EmployeeRowCard
                  key={emp._id}
                  employee={emp}
                  departments={departments}
                  fetchEmployees={fetchEmployees}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">
                No employees found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or category filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => updateUrl({ page: String(page - 1) })}
                className="rounded-xl h-10 w-10 p-0 border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"}
                    onClick={() => updateUrl({ page: String(i + 1) })}
                    className={`h-10 w-10 rounded-xl font-bold transition-all ${
                      page === i + 1
                        ? "bg-slate-900 hover:bg-slate-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => updateUrl({ page: String(page + 1) })}
                className="rounded-xl h-10 w-10 p-0 border-slate-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementNew;
