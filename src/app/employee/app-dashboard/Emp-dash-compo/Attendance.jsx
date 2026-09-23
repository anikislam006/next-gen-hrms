"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  TrendingUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

const Attendance = () => {
  // ── Auth + employee context ──────────────────────────────────────────────
  const { UserAllDetails } = useAuth();
  const employeeId = UserAllDetails?.employeeId;
  const API = "https://code360.pro";

  // ── State ─────────────────────────────────────────────────────────────────
  const [allAttendance, setAllAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  // ── ✅ Defensive normalizer — handles every shape your API might return ──
  const normalizeAttendanceData = (responseData) => {
    if (!responseData) return { records: [], today: null };

    // Case 1: response.data is an array of attendance records directly
    if (Array.isArray(responseData)) {
      return {
        records: responseData,
        today: responseData.find((r) => isToday(r.attendanceDate)) || null,
      };
    }

    // Case 2: response.data.attendance is the array (most common)
    if (Array.isArray(responseData.attendance)) {
      return {
        records: responseData.attendance,
        today:
          responseData.attendance.find((r) => isToday(r.attendanceDate)) ||
          null,
      };
    }

    // Case 3: response.data.attendance is a single object (today-only endpoint)
    if (
      responseData.attendance &&
      typeof responseData.attendance === "object" &&
      !Array.isArray(responseData.attendance)
    ) {
      const single = responseData.attendance;
      return {
        records: [single],
        today: isToday(single.attendanceDate) ? single : null,
      };
    }

    // Case 4: response.data IS the single attendance record
    if (responseData.attendanceDate || responseData.clockInDate) {
      return {
        records: [responseData],
        today: isToday(responseData.attendanceDate) ? responseData : null,
      };
    }

    // Nothing usable
    return { records: [], today: null };
  };

  // ── Fetch full attendance history ─────────────────────────────────────────
  const loadAttendanceData = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try today's endpoint first
      let records = [];
      let today = null;

      const res = await fetch(`${API}/attendance/today/${employeeId}`);
      const data = await res.json();

      if (data.success && data.data) {
        const norm = normalizeAttendanceData(data.data);
        records = norm.records;
        today = norm.today;
      }

      // If today endpoint didn't give us a full history, fetch the full list
      if (records.length <= 1) {
        try {
          const fallbackRes = await fetch(`${API}/attendance/${employeeId}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && fallbackData.data) {
            const norm = normalizeAttendanceData(fallbackData.data);
            if (norm.records.length > records.length) {
              records = norm.records;
              today = norm.today || today;
            }
          }
        } catch (fallbackErr) {
          // Silent — primary endpoint already gave us something
          console.warn("Full history fallback failed:", fallbackErr);
        }
      }

      setAllAttendance(records);
      setTodayAttendance(today);
    } catch (err) {
      console.error("Error loading attendance:", err);
      setError(err.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [employeeId]);

  // ── Live working hours for today (if still clocked in) ───────────────────
  const calculateCurrentWorkingHours = () => {
    if (!todayAttendance) return 0;
    if (todayAttendance.clockOutDate)
      return Number(todayAttendance.workingHours || 0);
    if (!todayAttendance.clockInDate) return 0;

    const now = currentTime;
    const clockIn = new Date(todayAttendance.clockInDate);
    let totalMinutes = (now - clockIn) / (1000 * 60);

    if (Array.isArray(todayAttendance.breaks)) {
      todayAttendance.breaks.forEach((b) => {
        if (b.startDate && b.endDate) {
          totalMinutes -=
            (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60);
        } else if (b.startDate && !b.endDate) {
          totalMinutes -= (now - new Date(b.startDate)) / (1000 * 60);
        }
      });
    }
    return Number(Math.max(0, totalMinutes / 60).toFixed(2));
  };

  const todayHours = calculateCurrentWorkingHours();

  // ── Compute weekly and monthly totals (defensive) ─────────────────────────
  const { weeklyHours, monthlyHours, regularHours, overtimeHours } = (() => {
    // Always work with an array
    const records = Array.isArray(allAttendance) ? allAttendance : [];

    if (records.length === 0) {
      return {
        weeklyHours: todayHours,
        monthlyHours: todayHours,
        regularHours: todayHours <= 8 ? todayHours : 8,
        overtimeHours: todayHours > 8 ? todayHours - 8 : 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Sunday-based week start
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    let weekly = 0;
    let monthly = 0;
    let regular = 0;
    let overtime = 0;

    records.forEach((record) => {
      if (!record || !record.attendanceDate) return;

      const recordDate = new Date(record.attendanceDate);
      if (isNaN(recordDate.getTime())) return;

      const hours = Number(record.workingHours || 0);

      // Skip in-progress today record from history sum
      if (isToday(recordDate) && !record.clockOutDate) return;

      // Weekly window
      if (recordDate >= weekStart && recordDate <= now) {
        weekly += hours;
      }

      // Monthly window + regular/overtime split
      if (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      ) {
        monthly += hours;
        if (hours > 8) {
          regular += 8;
          overtime += hours - 8;
        } else {
          regular += hours;
        }
      }
    });

    // Add live today hours
    if (todayAttendance && !todayAttendance.clockOutDate) {
      weekly += todayHours;
      monthly += todayHours;
      if (todayHours > 8) {
        regular += 8;
        overtime += todayHours - 8;
      } else {
        regular += todayHours;
      }
    }

    return {
      weeklyHours: Number(weekly.toFixed(2)),
      monthlyHours: Number(monthly.toFixed(2)),
      regularHours: Number(regular.toFixed(2)),
      overtimeHours: Number(overtime.toFixed(2)),
    };
  })();

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 w-full">

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Today's Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Today's Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {todayHours.toFixed(2)}h
            </div>
            <p className="text-sm text-gray-600">Total worked today</p>

            {todayAttendance?.clockInDate && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Clock In:</span>
                  <span className="font-medium">
                    {formatDateTime(todayAttendance.clockInDate)}
                  </span>
                </div>
                {todayAttendance.clockOutDate && (
                  <div className="flex justify-between">
                    <span>Clock Out:</span>
                    <span className="font-medium">
                      {formatDateTime(todayAttendance.clockOutDate)}
                    </span>
                  </div>
                )}
                {Array.isArray(todayAttendance.breaks) &&
                  todayAttendance.breaks.length > 0 && (
                    <div className="flex justify-between">
                      <span>Breaks:</span>
                      <span className="font-medium">
                        {todayAttendance.breaks.length} taken
                      </span>
                    </div>
                  )}
                {!todayAttendance.clockOutDate && (
                  <div className="flex items-center gap-2 mt-3 text-emerald-700 text-xs font-medium">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Currently working
                  </div>
                )}
              </div>
            )}

            {!todayAttendance && (
              <p className="text-xs text-gray-500 mt-4 italic">
                Not clocked in today.
              </p>
            )}
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {weeklyHours.toFixed(2)}h
            </div>
            <p className="text-sm text-gray-600">Weekly total</p>

            <div className="mt-4">
              <Progress
                value={Math.min((weeklyHours / 40) * 100, 100)}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Target: 40h per week</span>
                <span className="font-medium">
                  {Math.min(Math.round((weeklyHours / 40) * 100), 100)}%
                </span>
              </div>
            </div>

            {weeklyHours >= 40 && (
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-xs text-emerald-700 font-semibold text-center">
                  🎉 Weekly target reached!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {monthlyHours.toFixed(2)}h
            </div>
            <p className="text-sm text-gray-600">Monthly total</p>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Regular:</span>
                <span className="font-medium">{regularHours.toFixed(2)}h</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime:</span>
                <span className="font-medium text-orange-600">
                  {overtimeHours.toFixed(2)}h
                </span>
              </div>
            </div>

            {overtimeHours > 0 && (
              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-xs text-orange-700 font-semibold text-center">
                  ⏰ {overtimeHours.toFixed(2)}h overtime this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;