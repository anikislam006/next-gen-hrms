"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import {
  Users,
  CheckCircle,
  Award,
  FileText,
  Clock,
  Bell,
  Unlock,
  XCircle,
  Loader,
  UserPlus,
} from "lucide-react";
import HeaderSections from "@/components/employee/Components/HeaderSections";
import StateCardSections from "@/components/employee/Components/StateCardSections";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import OnboardingTab from "@/components/employee/EmployeeOnboarding/OnboardingTab";
import EmployeeTab from "@/components/employee/EmployeeOnboarding/EmployeeTab";
import { fetchEmployeesFromSupabase } from "@/app/api/employeeProfiles";

const departments = [
  "All",
  "Engineering",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
];

const employmentTypes = [
  {
    label: "Total",
    icon: Users,
    color: "text-blue-600",
    textColor: "text-blue-900",
  },
  {
    label: "Active",
    icon: CheckCircle,
    color: "text-green-600",
    textColor: "text-green-900",
  },
  {
    label: "Permanent",
    icon: Award,
    color: "text-purple-600",
    textColor: "text-purple-900",
  },
  {
    label: "Contract",
    icon: FileText,
    color: "text-orange-600",
    textColor: "text-orange-900",
  },
  {
    label: "Probation",
    icon: Clock,
    color: "text-yellow-600",
    textColor: "text-yellow-900",
  },
  {
    label: "Need Update",
    icon: Bell,
    color: "text-red-600",
    textColor: "text-red-900",
  },
  {
    label: "Locked",
    value: 79,
    icon: Unlock,
    color: "text-indigo-600",
    textColor: "text-indigo-900",
  },
];

const statuses = [
  {
    label: "Total",
    icon: FileText,
    color: "text-blue-600",
    textColor: "text-blue-900",
  },
  {
    label: "pending",
    icon: Clock,
    color: "text-yellow-600",
    textColor: "text-yellow-900",
  },
  {
    label: "InProgress",
    icon: Loader,
    color: "text-orange-600",
    textColor: "text-orange-900",
  },
  {
    label: "completed",
    icon: CheckCircle,
    color: "text-green-600",
    textColor: "text-green-900",
  },
  {
    label: "expired",
    icon: XCircle,
    color: "text-red-600",
    textColor: "text-red-900",
  },
];

const directories = ["onboarding", "employee"];

const EmployeePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [department, setDepartment] = useState(
    searchParams.get("department") || "All"
  );
  const [employmentType, setEmploymentType] = useState(
    searchParams.get("employmentType") || "Total"
  );
  const [status, setStatus] = useState(searchParams.get("status") || "Total");
  const [directory, setDirectory] = useState(
    searchParams.get("directory") || "employee"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const PAGE_SIZE = 12;

  const [employmentCounts, setEmploymentCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);
  // "Onboarding requests" (HR-initiated invite links) is a separate,
  // not-yet-built feature — kept empty here rather than showing the real
  // employee list mislabeled as pending requests.
  const [onboardingRequests] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch employees and counts from Supabase
  const fetchEmployees = async () => {
    try {
      const data = await fetchEmployeesFromSupabase();
      if (data.success) {
        setAllEmployees(data.data);
        setEmploymentCounts(data.counts.employmentTypeCounts || {});
        setTotalEmployeesCount(data.counts.totalEmployees || 0);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Client-side search/department filter + pagination over the fetched list
  useEffect(() => {
    let filtered = allEmployees;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term) ||
          e.phone?.toLowerCase().includes(term) ||
          e.employeeId?.toLowerCase().includes(term)
      );
    }
    if (department && department !== "All") {
      filtered = filtered.filter((e) => e.department === department);
    }
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    setEmployees(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
  }, [allEmployees, search, department, page]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department !== "All") params.set("department", department);
    if (employmentType !== "Total")
      params.set("employmentType", employmentType);
    if (status !== "Total") params.set("status", status);
    if (directory) params.set("directory", directory);
    params.set("page", String(page));

    router.replace(`/super-admin/employees?${params.toString()}`);
  }, [search, department, employmentType, status, directory, page]);

  // Fetch once on mount; search/department/page filtering happens client-side
  // over the already-fetched list (see the effect above), and a 30s refresh
  // catches changes made elsewhere without hammering the database every 5s
  // the way the old polling did.
  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-5">
      <HeaderSections totalEmployees={totalEmployeesCount} />
      <StateCardSections
        employmentTypes={employmentTypes}
        employmentType={employmentType}
        employmentCounts={employmentCounts}
        setEmploymentType={setEmploymentType}
      />

      {/* Directory toggle */}
      <Tabs
        value={directory}
        onValueChange={(val) => {
          setDirectory(val);
          setPage(1);
          setStatus(val === "employee" ? "completed" : "Total");
        }}
      >
        <div className="flex flex-col text-sm sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg">
            {directories.map((dir) => {
              const Icon = dir === "employee" ? Users : UserPlus;
              const gradientFrom =
                dir === "employee" ? "from-blue-500" : "from-green-500";
              const gradientTo =
                dir === "employee" ? "to-purple-600" : "to-teal-600";

              return (
                <TabsTrigger
                  key={dir}
                  value={dir}
                  className={`flex items-center py-1 px-2 justify-center cursor-pointer
            data-[state=active]:bg-gradient-to-r data-[state=active]:${gradientFrom} data-[state=active]:${gradientTo} data-[state=active]:text-white
            rounded-lg transition`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>

      {/* Employment Type Cards */}
      {/* 💼 Employment Type Cards */}

      {/* Status Cards + Employee List */}
      {directory === "onboarding" ? (
        <>
          <OnboardingTab
            statuses={statuses}
            setStatus={setStatus}
            setPage={setPage}
            employees={employees}
            statusCounts={statusCounts}
            onboardingRequests={onboardingRequests}
          ></OnboardingTab>
        </>
      ) : (
        <>
          <EmployeeTab
            statuses={statuses}
            search={search}
            setSearch={setSearch}
            setDepartment={setDepartment}
            department={department}
            departments={departments}
            employees={employees}
            refreshEmployees={fetchEmployees}
          ></EmployeeTab>
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {/* Prev Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={`flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border shadow-md transition-all duration-200
      ${
        page === 1
          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:shadow-lg"
      }`}
        >
          ◀ Prev
        </motion.button>

        {/* Page Indicator */}
        <div className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm">
          Page {page} of {totalPages}
        </div>

        {/* Next Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border shadow-md transition-all duration-200
      ${
        page === totalPages
          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700 hover:shadow-lg"
      }`}
        >
          Next ▶
        </motion.button>
      </div>
    </div>
  );
};

export default EmployeePage;
