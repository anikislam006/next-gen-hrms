"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CheckCircle, Clock, Users, XCircle, Search, Filter, RefreshCw,
  AlertCircle, Loader2, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const departments = [
  "All Departments",
  "Human Resources",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
];

const AttendanceAllEmployee = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "attendanceDate",
    direction: "desc",
  });

  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    present: 0,
    onTime: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
  });

  const statusOptions = [
    { value: "all",      label: "All",      color: "text-slate-600",   iconColor: "text-slate-500" },
    { value: "present",  label: "Present",  color: "text-emerald-600", iconColor: "text-emerald-500" },
    { value: "onTime",   label: "On Time",  color: "text-emerald-600", iconColor: "text-emerald-500" },
    { value: "late",     label: "Late",     color: "text-amber-600",   iconColor: "text-amber-500" },
    { value: "absent",   label: "Absent",   color: "text-red-600",     iconColor: "text-red-500" },
    { value: "halfDay",  label: "Half Day", color: "text-blue-600",    iconColor: "text-blue-500" },
    { value: "leave",    label: "Leave",    color: "text-purple-600",  iconColor: "text-purple-500" },
  ];

  const getStatusBadgeClass = (status) => {
    const map = {
      Present:     "bg-emerald-50 text-emerald-600 border-emerald-200",
      "On Time":   "bg-emerald-50 text-emerald-600 border-emerald-200",
      "On-time":   "bg-emerald-50 text-emerald-600 border-emerald-200",
      Late:        "bg-amber-50 text-amber-600 border-amber-200",
      Absent:      "bg-red-50 text-red-600 border-red-200",
      "Half Day":  "bg-blue-50 text-blue-600 border-blue-200",
      "Half-day":  "bg-blue-50 text-blue-600 border-blue-200",
      Leave:       "bg-purple-50 text-purple-600 border-purple-200",
      "Not Marked":"bg-slate-50 text-slate-500 border-slate-200",
    };
    return map[status] || "bg-slate-50 text-slate-500 border-slate-200";
  };

  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getWorkingHours = (hours) => {
    if (!hours) return "0h";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Fetch status counts
  const fetchStatusCounts = useCallback(async () => {
    setStatusLoading(true);
    try {
      const params = {
        date: selectedDate,
        department:
          selectedDepartment !== "All Departments" ? selectedDepartment : undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axios.get(
        "https://code360.pro/attendance-summary",
        { params, timeout: 10000 }
      );

      if (response.data.success && response.data.data) {
        setStatusCounts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching status counts:", err);
      try {
        const params = {
          date: selectedDate,
          department:
            selectedDepartment !== "All Departments" ? selectedDepartment : undefined,
          limit: 1000,
          page: 1,
        };
        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );
        const response = await axios.get("https://code360.pro/attendance", { params });
        if (response.data.success && response.data.data) {
          const allData = response.data.data;
          const counts = {
            all: allData.length,
            present: allData.filter((d) =>
              ["Present", "On Time", "On-time", "Late", "Half Day", "Half-day"].includes(
                d.attendance[0]?.status
              )
            ).length,
            onTime: allData.filter((d) =>
              ["On Time", "On-time"].includes(d.attendance[0]?.status)
            ).length,
            late: allData.filter((d) => d.attendance[0]?.status === "Late").length,
            absent: allData.filter((d) => d.attendance[0]?.status === "Absent").length,
            halfDay: allData.filter((d) =>
              ["Half Day", "Half-day"].includes(d.attendance[0]?.status)
            ).length,
            leave: allData.filter((d) => d.attendance[0]?.status === "Leave").length,
          };
          setStatusCounts(counts);
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
      }
    } finally {
      setStatusLoading(false);
    }
  }, [selectedDate, selectedDepartment]);

  // Fetch filtered attendance data
  const fetchAttendanceData = useCallback(
    async (shouldResetPage = false) => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: shouldResetPage ? 1 : pagination.page,
          limit: pagination.limit,
          date: selectedDate,
          department:
            selectedDepartment !== "All Departments" ? selectedDepartment : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
        };

        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );

        const response = await axios.get("https://code360.pro/attendance", { params });

        if (response.data.success) {
          let filteredData = response.data.data;

          if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter(
              (item) =>
                item.user.fullName?.toLowerCase().includes(term) ||
                item.user.email?.toLowerCase().includes(term) ||
                item.employeeId?.toLowerCase().includes(term) ||
                item.user.employeeId?.toLowerCase().includes(term)
            );
          }

          const sortedData = [...filteredData].sort((a, b) => {
            if (sortConfig.key === "name") {
              const nameA = a.user.fullName?.toLowerCase() || "";
              const nameB = b.user.fullName?.toLowerCase() || "";
              return sortConfig.direction === "asc"
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
            }
            if (sortConfig.key === "attendanceDate") {
              const dateA = a.attendance[0]?.attendanceDate || new Date(0);
              const dateB = b.attendance[0]?.attendanceDate || new Date(0);
              return sortConfig.direction === "asc"
                ? new Date(dateA) - new Date(dateB)
                : new Date(dateB) - new Date(dateA);
            }
            if (sortConfig.key === "status") {
              const statusA = a.attendance[0]?.status || "";
              const statusB = b.attendance[0]?.status || "";
              return sortConfig.direction === "asc"
                ? statusA.localeCompare(statusB)
                : statusB.localeCompare(statusA);
            }
            if (sortConfig.key === "employeeId") {
              const idA = a.employeeId || "";
              const idB = b.employeeId || "";
              return sortConfig.direction === "asc"
                ? idA.localeCompare(idB)
                : idB.localeCompare(idA);
            }
            return 0;
          });

          setAttendanceData(sortedData);
          setPagination(response.data.pagination);
        } else {
          setError("Failed to fetch attendance data");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching attendance data");
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedDepartment, selectedStatus, selectedDate, pagination.page, pagination.limit, sortConfig]
  );

  useEffect(() => {
    fetchStatusCounts();
  }, [selectedDate, selectedDepartment, fetchStatusCounts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendanceData(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAttendanceData(true);
  }, [selectedDepartment, selectedStatus, selectedDate]);

  useEffect(() => {
    if (pagination.page > 1) {
      fetchAttendanceData(false);
    }
  }, [pagination.page]);

  const handleSort = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction: newDirection });

    const sortedData = [...attendanceData].sort((a, b) => {
      let aValue, bValue;
      if (key === "name") {
        aValue = a.user.fullName?.toLowerCase() || "";
        bValue = b.user.fullName?.toLowerCase() || "";
      } else if (key === "attendanceDate") {
        aValue = a.attendance[0]?.attendanceDate || new Date(0);
        bValue = b.attendance[0]?.attendanceDate || new Date(0);
        return newDirection === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      } else if (key === "status") {
        aValue = a.attendance[0]?.status || "";
        bValue = b.attendance[0]?.status || "";
      } else if (key === "employeeId") {
        aValue = a.employeeId || "";
        bValue = b.employeeId || "";
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return newDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    setAttendanceData(sortedData);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    fetchStatusCounts();
    fetchAttendanceData(true);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const SortIndicator = ({ column }) =>
    sortConfig.key === column ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp className="inline w-3 h-3 ml-1" />
      ) : (
        <ChevronDown className="inline w-3 h-3 ml-1" />
      )
    ) : null;

  const statusIcons = {
    all: Users,
    present: CheckCircle,
    onTime: CheckCircle,
    late: Clock,
    absent: XCircle,
    halfDay: Clock,
    leave: Clock,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Employee Attendance
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          View and manage employee attendance records
        </p>
      </div>

      {/* Status Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statusOptions.map((status) => {
          const count = statusCounts[status.value] || 0;
          const isActive = selectedStatus === status.value;
          const Icon = statusIcons[status.value] || Users;

          return (
            <Card
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={`border shadow-sm rounded-xl bg-white cursor-pointer transition-all ${
                isActive
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-slate-100 hover:border-blue-200"
              } ${statusLoading ? "opacity-70 pointer-events-none" : ""}`}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {status.label}
                  </p>
                  <h4 className={`text-2xl font-black ${status.color}`}>
                    {statusLoading ? "..." : count}
                  </h4>
                </div>
                <Icon className={`w-7 h-7 ${status.iconColor}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardContent className="p-4">
          <div className="flex flex-row md:flex-row items-stretch md:items-center gap-3">
                <Input
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 "
              />

            {/* Department */}
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date */}
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-44"
            />

            {/* Refresh */}
            <Button
              onClick={handleRefresh}
              disabled={loading || statusLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading || statusLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border border-red-200 bg-red-50 shadow-sm rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden">

        {/* Table info */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/40">
          <p className="text-xs font-semibold text-slate-500">
            Showing {attendanceData.length} of {pagination.total} records
            {selectedStatus !== "all" && (
              <span className="ml-2 text-blue-600 font-bold">
                • Filtered by {statusOptions.find((s) => s.value === selectedStatus)?.label}
              </span>
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead onClick={() => handleSort("employeeId")} className="cursor-pointer">
                  Employee ID <SortIndicator column="employeeId" />
                </TableHead>
                <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                  Name <SortIndicator column="name" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead onClick={() => handleSort("attendanceDate")} className="cursor-pointer">
                  Date <SortIndicator column="attendanceDate" />
                </TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer text-center">
                  Status <SortIndicator column="status" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && attendanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">
                      Loading attendance data...
                    </p>
                  </TableCell>
                </TableRow>
              ) : attendanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-16 text-center">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 font-semibold">
                      {loading
                        ? "Loading..."
                        : `No ${
                            selectedStatus !== "all"
                              ? statusOptions.find((s) => s.value === selectedStatus)?.label
                              : ""
                          } attendance records for ${formatDate(selectedDate)}`}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData.map((employee) => {
                  const latestAttendance = employee.attendance[0] || {};
                  const statusClass = getStatusBadgeClass(latestAttendance.status);

                  return (
                    <TableRow
                      key={employee.employeeId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-semibold text-slate-700 text-sm">
                        {employee.employeeId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-100">
                            {employee.user.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <p className="font-bold text-slate-900 text-sm">
                            {employee.user.fullName || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {employee.user.email || "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
                          {employee.user.department || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {employee.user.role || "N/A"}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {formatDate(latestAttendance.attendanceDate)}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-semibold text-sm">
                        {formatTime(latestAttendance.clockInDate)}
                      </TableCell>
                      <TableCell className="text-red-500 font-semibold text-sm">
                        {formatTime(latestAttendance.clockOutDate)}
                      </TableCell>
                      <TableCell className="text-slate-700 font-semibold text-sm">
                        {getWorkingHours(latestAttendance.workingHours)}
                        {latestAttendance.workingHours > 8 && (
                          <span className="ml-1 text-amber-600 font-bold text-[10px]">OT</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusClass}`}
                        >
                          {latestAttendance.status || "Not Marked"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {attendanceData.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages} • {pagination.total} total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Inline update indicator */}
      {loading && attendanceData.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating...
        </div>
      )}
    </div>
  );
};

export default AttendanceAllEmployee;