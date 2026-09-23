"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Users,
  CheckCircle,
  Award,
  FileText,
  Clock,
  Bell,
  Unlock,
} from "lucide-react";

const departments = [
  "All",
  "Engineering",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
];
const employmentTypes = [
  "Total",
  "Permanent",
  "Contract",
  "Probation",
  "Need Update",
  "Unlocked",
];
const statuses = ["Total", "pending", "InProgress", "completed", "expired"];
const directories = ["onboarding", "employee"];

const Page = () => {
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
    searchParams.get("directory") || "onboarding"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);

  const [employmentCounts, setEmploymentCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);

  // Map icons for employment type cards (example)
  const baseStatsData = [
    {
      label: "Total",
      icon: Users,
      color: "text-blue-600",
      textColor: "text-blue-900",
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
      label: "Unlocked",
      icon: Unlock,
      color: "text-indigo-600",
      textColor: "text-indigo-900",
    },
  ];

  // Fetch employees and counts
  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(search ? { search } : {}),
        ...(department && department !== "All" ? { department } : {}),
        ...(employmentType && employmentType !== "Total"
          ? { employmentType }
          : {}),
        ...(status && status !== "Total" ? { status } : {}),
        ...(directory ? { directory } : {}),
      });

      const res = await fetch(
        `https://code360.pro/api/get-employee?${params.toString()}`
      );
      const data = await res.json();

      if (data.success) {
        setEmployees(data.data);
        setTotalPages(data.totalPages);
        setEmploymentCounts(data.counts.employmentTypeCounts || {});
        setStatusCounts(data.counts.statusCounts || {});
        setTotalEmployeesCount(
          data.counts.totalEmployees || data.totalEmployees || 0
        );
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

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

  // Fetch data when filters change
  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000);
    return () => clearInterval(interval);
  }, [search, department, employmentType, status, directory, page]);

  return (
    <div className="p-6 space-y-6">
      {/* Directory toggle */}
      <div className="flex gap-4">
        {directories.map((dir) => (
          <button
            key={dir}
            onClick={() => {
              setDirectory(dir);
              setPage(1);
              setStatus(dir === "employee" ? "completed" : "Total");
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              directory === dir
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {dir.charAt(0).toUpperCase() + dir.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={search}
        placeholder="Search by ID, Name, Email or Phone"
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full"
      />

      {/* Department filter */}
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="border rounded-lg px-4 py-2"
      >
        {departments.map((dep) => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      {/* Employment Type Cards */}
      {/* 💼 Employment Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {employmentTypes.map((type) => {
          const count =
            type === "Total"
              ? Object.values(employmentCounts).reduce(
                  (acc, val) => acc + val,
                  0
                )
              : employmentCounts[type] || 0;

          return (
            <div
              key={type}
              onClick={() => {
                setEmploymentType(type);
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg border p-4 text-center transition ${
                employmentType === type
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold">{type}</p>
              <p className="text-sm text-gray-500">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statuses.map((s) => {
          const count =
            s === "Total"
              ? Object.values(statusCounts).reduce((acc, val) => acc + val, 0)
              : statusCounts[s] || 0;

          return (
            <div
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg border p-4 text-center transition ${
                status === s
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold">{s}</p>
              <p className="text-sm text-gray-500">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div
              key={emp._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">{emp.fullName}</h3>
              <p>ID: {emp.employeeId}</p>
              <p>Email: {emp.email}</p>
              <p>Phone: {emp.phone}</p>
              <p>Dept: {emp.department}</p>
              <p>Type: {emp.employmentType}</p>
              <p>Status: {emp.status}</p>
            </div>
          ))
        ) : (
          <p>No employees found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Page;
