import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Clock, Calendar, Users, CheckCircle, FilterIcon, Loader2, AlertCircle,
} from "lucide-react";

// ---------------------------
// Reusable Stat Card
// ---------------------------
const StatCard = ({ title, value, icon: Icon, iconColor = "text-blue-600", isActive = false, onClick }) => (
  <Card
    onClick={onClick}
    className={`border shadow-sm rounded-xl bg-white cursor-pointer transition-all ${
      isActive
        ? "border-blue-500 ring-2 ring-blue-100"
        : "border-slate-100 hover:border-blue-200"
    }`}
  >
    <CardContent className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
          {title}
        </p>
        <h4 className={`text-2xl font-black ${iconColor}`}>{value}</h4>
      </div>
      {Icon && <Icon className={`w-7 h-7 ${iconColor}`} />}
    </CardContent>
  </Card>
);

// ---------------------------
// Reusable Attendance Row
// ---------------------------
const AttendanceRow = ({ record }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadgeClass = (status) => {
    const map = {
      "On-time": "bg-emerald-50 text-emerald-600 border-emerald-200",
      Late: "bg-red-50 text-red-600 border-red-200",
      Absent: "bg-amber-50 text-amber-600 border-amber-200",
    };
    return map[status] || "bg-slate-50 text-slate-500 border-slate-200";
  };

  return (
    <TableRow className="hover:bg-slate-50 transition-colors">
      <TableCell className="text-slate-700 text-sm">
        {formatDate(record.attendanceDate)}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">
        {new Date(record.attendanceDate).toLocaleDateString("en-US", {
          weekday: "short",
        })}
      </TableCell>
      <TableCell className="text-emerald-600 font-semibold text-sm">
        {record.clockInDate ? formatTime(record.clockInDate) : "N/A"}
      </TableCell>
      <TableCell className="text-red-500 font-semibold text-sm">
        {record.clockOutDate ? formatTime(record.clockOutDate) : "N/A"}
      </TableCell>
      <TableCell className="text-slate-700 font-semibold text-sm">
        {record.workingHours ? `${record.workingHours.toFixed(2)}h` : "N/A"}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">
        {record.breaks?.length ? `${record.breaks.length} break(s)` : "No breaks"}
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusBadgeClass(
            record.status
          )}`}
        >
          {record.status}
        </span>
      </TableCell>
    </TableRow>
  );
};

// ---------------------------
// Main Component
// ---------------------------
const ParticularAttendance = ({ employeeId }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [limit, setLimit] = useState(30);
  const [activeTab, setActiveTab] = useState("all");

  // Calculate absent days (excluding Sundays)
  const calculateAbsentDays = (attendanceRecords, startDate, endDate) => {
    if (!attendanceRecords || !attendanceRecords.length) return [];

    const absentDays = [];
    const attendedDates = new Set(
      attendanceRecords.map((record) =>
        new Date(record.attendanceDate).toDateString()
      )
    );

    let currentDate = startDate
      ? new Date(startDate)
      : new Date(attendanceRecords[attendanceRecords.length - 1].attendanceDate);
    let endDateObj = endDate
      ? new Date(endDate)
      : new Date(attendanceRecords[0].attendanceDate);

    if (currentDate > endDateObj) {
      [currentDate, endDateObj] = [endDateObj, currentDate];
    }

    let loopDate = new Date(currentDate);

    while (loopDate <= endDateObj) {
      if (loopDate.getDay() !== 0) {
        const dateStr = loopDate.toDateString();
        if (!attendedDates.has(dateStr)) {
          absentDays.push({
            attendanceDate: new Date(loopDate),
            status: "Absent",
            clockInDate: null,
            clockOutDate: null,
            workingHours: 0,
            day: loopDate.toLocaleDateString("en-US", { weekday: "long" }),
          });
        }
      }
      loopDate.setDate(loopDate.getDate() + 1);
    }

    return absentDays;
  };

  // ---------------------------
  // Fetch Attendance
  // ---------------------------
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `https://code360.pro/attendance/${employeeId}?limit=${limit}`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        const data = response.data.data;
        setOriginalData(data);

        const startDate =
          dateRange.startDate ||
          (data.attendance.length > 0
            ? data.attendance[data.attendance.length - 1].attendanceDate
            : null);
        const endDate =
          dateRange.endDate ||
          (data.attendance.length > 0 ? data.attendance[0].attendanceDate : null);

        const absentDays = calculateAbsentDays(data.attendance, startDate, endDate);

        const allRecords = [...data.attendance, ...absentDays].sort(
          (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate)
        );

        setAttendanceData({
          ...data,
          attendance: allRecords,
        });
      } else {
        setError(response.data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) fetchAttendanceData();
  }, [employeeId]);

  // ---------------------------
  // Filter handlers
  // ---------------------------
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    if (
      dateRange.startDate &&
      dateRange.endDate &&
      new Date(dateRange.startDate) > new Date(dateRange.endDate)
    ) {
      setError("Start date cannot be after end date");
      return;
    }
    fetchAttendanceData();
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    setLimit(30);
    setActiveTab("all");
    fetchAttendanceData();
  };

  // ---------------------------
  // Stats
  // ---------------------------
  const calculateStats = () => {
    if (!attendanceData?.attendance?.length) return null;

    const stats = {
      totalRecords: 0,
      onTimeCount: 0,
      lateCount: 0,
      absentCount: 0,
      totalWorkingHours: 0,
      averageWorkingHours: 0,
      presentCount: 0,
    };

    attendanceData.attendance.forEach((r) => {
      if (r.status === "On-time") {
        stats.onTimeCount++;
        stats.presentCount++;
        stats.totalWorkingHours += r.workingHours || 0;
      } else if (r.status === "Late") {
        stats.lateCount++;
        stats.presentCount++;
        stats.totalWorkingHours += r.workingHours || 0;
      } else if (r.status === "Absent") {
        stats.absentCount++;
      }
    });

    stats.totalRecords = attendanceData.attendance.length;
    stats.averageWorkingHours =
      stats.presentCount > 0
        ? (stats.totalWorkingHours / stats.presentCount).toFixed(2)
        : 0;
    stats.totalWorkingHours = stats.totalWorkingHours.toFixed(2);

    return stats;
  };

  const stats = calculateStats();

  const getFilteredRecords = () => {
    if (!attendanceData?.attendance?.length) return [];

    switch (activeTab) {
      case "onTime":
        return attendanceData.attendance.filter((record) => record.status === "On-time");
      case "late":
        return attendanceData.attendance.filter((record) => record.status === "Late");
      case "absent":
        return attendanceData.attendance.filter((record) => record.status === "Absent");
      default:
        return attendanceData.attendance;
    }
  };

  const filteredRecords = getFilteredRecords();

  // ---------------------------
  // Loading / Error / Empty
  // ---------------------------
  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8 mb-2" />
        <p className="text-sm text-slate-500 font-medium">
          Loading attendance data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50 shadow-sm rounded-xl">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </div>
          <Button
            onClick={fetchAttendanceData}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData?.attendance?.length) {
    return (
      <div className="py-16 text-center">
        <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-slate-500 font-semibold text-sm">
          No attendance records found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          My Attendance
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Personal attendance history and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Records"
            value={stats.totalRecords}
            icon={Users}
            iconColor="text-blue-600"
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <StatCard
            title="On Time"
            value={stats.onTimeCount}
            icon={CheckCircle}
            iconColor="text-emerald-600"
            isActive={activeTab === "onTime"}
            onClick={() => setActiveTab("onTime")}
          />
          <StatCard
            title="Late Arrivals"
            value={stats.lateCount}
            icon={Clock}
            iconColor="text-red-600"
            isActive={activeTab === "late"}
            onClick={() => setActiveTab("late")}
          />
          <StatCard
            title="Absent Days"
            value={stats.absentCount}
            icon={Calendar}
            iconColor="text-amber-600"
            isActive={activeTab === "absent"}
            onClick={() => setActiveTab("absent")}
          />
          <StatCard
            title="Avg Working Hours"
            value={`${stats.averageWorkingHours}h`}
            icon={Clock}
            iconColor="text-purple-600"
          />
        </div>
      )}

      {/* Filters */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-blue-600" />
            Filter Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                End Date
              </label>
              <Input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Records Limit
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(v) => setLimit(parseInt(v))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="0">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleFilter}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply
              </Button>
              <Button
                onClick={handleClearFilter}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/40">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-blue-600" />
            {activeTab === "all" && "All Attendance Records"}
            {activeTab === "onTime" && "On Time Records"}
            {activeTab === "late" && "Late Records"}
            {activeTab === "absent" && "Absent Records"}
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold ml-2">
              {filteredRecords.length} of {attendanceData.attendance.length}
            </span>
          </h3>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-semibold">
              No {activeTab !== "all" ? activeTab : ""} records found for the selected filter
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead>Breaks</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, i) => (
                  <AttendanceRow key={`${activeTab}-${i}`} record={record} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ParticularAttendance;