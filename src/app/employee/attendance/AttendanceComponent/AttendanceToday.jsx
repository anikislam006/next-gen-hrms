import React, { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Mail,
  Briefcase,
  Building2,
  Hash,
} from "lucide-react";

const AttendanceToday = ({ UserAllDetails }) => {
  const [employeeAttendance, setEmployeeAttendance] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const employeeId = UserAllDetails?.employeeId;
  const API = "https://code360.pro";

  // Format helpers
  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  // Load today's attendance
  const loadTodayAttendance = async () => {
    if (!employeeId) return;

    try {
      const res = await fetch(`${API}/attendance/today/${employeeId}`);
      const data = await res.json();

      if (data.success) {
        if (data.data && data.data.attendance) {
          setEmployeeAttendance(data.data);
          setTodayAttendance(data.data.attendance);
        } else if (data.data) {
          setEmployeeAttendance(data.data);
          const todayRecord = data.data.attendance?.find((record) =>
            isToday(record.attendanceDate)
          );
          setTodayAttendance(todayRecord || null);
        } else {
          setEmployeeAttendance(null);
          setTodayAttendance(null);
        }
      } else {
        setEmployeeAttendance(null);
        setTodayAttendance(null);
      }
    } catch (err) {
      console.error("Error loading attendance:", err);
      try {
        const res = await fetch(`${API}/attendance/${employeeId}`);
        const data = await res.json();

        if (data.success && data.data) {
          setEmployeeAttendance(data.data);
          const todayRecord = data.data.attendance?.find((record) =>
            isToday(record.attendanceDate)
          );
          setTodayAttendance(todayRecord || null);
        }
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    }
  };

  useEffect(() => {
    loadTodayAttendance();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, [employeeId]);

  // Clock In
  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/attendance/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: UserAllDetails }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find((record) =>
        isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Break
  const handleBreak = async (action) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, action }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find(
        (record) => isToday(record.attendanceDate) && !record.clockOutDate
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clock Out
  const handleClockOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/attendance/clockout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setEmployeeAttendance(data.data);
      const todayRecord = data.data.attendance?.find((record) =>
        isToday(record.attendanceDate)
      );
      setTodayAttendance(todayRecord);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Working hours calc
  const calculateCurrentWorkingHours = () => {
    if (!todayAttendance || todayAttendance.clockOutDate)
      return todayAttendance?.workingHours || 0;

    const now = currentTime;
    const clockIn = new Date(todayAttendance.clockInDate);
    let totalMinutes = (now - clockIn) / (1000 * 60);

    if (todayAttendance.breaks) {
      todayAttendance.breaks.forEach((b) => {
        if (b.startDate && b.endDate) {
          totalMinutes -=
            (new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60);
        } else if (b.startDate && !b.endDate) {
          totalMinutes -= (now - new Date(b.startDate)) / (1000 * 60);
        }
      });
    }
    return (totalMinutes / 60).toFixed(2);
  };

  const breakRunning = todayAttendance?.breaks?.some(
    (breakItem) => breakItem.startDate && !breakItem.endDate
  );

  const hasClockedInToday = todayAttendance && !todayAttendance.clockOutDate;

  const getAttendanceStatus = () => {
    if (!todayAttendance) return "out";
    if (breakRunning) return "break";
    if (todayAttendance.clockOutDate) return "completed";
    return "in";
  };

  const attendanceStatus = getAttendanceStatus();

  // Status pill config
  const statusConfig = {
    out: { label: "Not Clocked In", className: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertTriangle },
    in: { label: "Clocked In", className: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle },
    break: { label: "On Break", className: "bg-orange-50 text-orange-600 border-orange-200", icon: Coffee },
    completed: { label: "Completed", className: "bg-blue-50 text-blue-600 border-blue-200", icon: CheckCircle },
  };

  const StatusIcon = statusConfig[attendanceStatus].icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Error */}
      {error && (
        <Card className="border border-red-200 bg-red-50 shadow-sm rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex  md:flex-row lg:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Today's Attendance
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            {formatDate(currentTime)}
          </p>
        </div>

        <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Current Time
              </p>
              <p className="text-lg font-black text-slate-900">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Attendance Status Card */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-100 shadow-sm rounded-xl bg-white h-full">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Attendance Status
                </CardTitle>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${statusConfig[attendanceStatus].className}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[attendanceStatus].label}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">

              {/* Stat grid */}
              {todayAttendance && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Clock In
                    </p>
                    <p className="text-base font-black text-emerald-600">
                      {formatDateTime(todayAttendance.clockInDate)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Clock Out
                    </p>
                    <p className="text-base font-black text-red-500">
                      {todayAttendance.clockOutDate
                        ? formatDateTime(todayAttendance.clockOutDate)
                        : "—"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Working Hours
                    </p>
                    <p className="text-base font-black text-blue-600">
                      {hasClockedInToday
                        ? calculateCurrentWorkingHours()
                        : todayAttendance.workingHours || "0.00"}
                      <span className="text-xs text-slate-500 ml-1 font-semibold">hrs</span>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Breaks Taken
                    </p>
                    <p className="text-base font-black text-amber-600">
                      {todayAttendance.breaks?.length || 0}
                      <span className="text-xs text-slate-500 ml-1 font-semibold">today</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-3 max-w-md mx-auto pt-2">

                {attendanceStatus === "out" && (
                  <Button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Clock In Now
                      </>
                    )}
                  </Button>
                )}

                {attendanceStatus === "in" && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleClockOut}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-11 font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          Clock Out
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleBreak("start")}
                      variant="outline"
                      disabled={loading || breakRunning}
                      className="w-full h-11 font-bold flex items-center justify-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Coffee className="w-4 h-4" />
                      Take a Break
                    </Button>
                  </div>
                )}

                {attendanceStatus === "break" && (
                  <Button
                    onClick={() => handleBreak("end")}
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Ending Break...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        End Break & Resume Work
                      </>
                    )}
                  </Button>
                )}

                {attendanceStatus === "completed" && (
                  <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-base font-black text-emerald-700 mb-1">
                      Attendance Completed
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium mb-3">
                      Your attendance has been recorded for today.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-emerald-200">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Total Hours:
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {todayAttendance.workingHours || "0.00"}
                      </span>
                      <span className="text-xs font-bold text-slate-500">hrs</span>
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-6">

          {/* Breaks list */}
          {todayAttendance?.breaks?.length > 0 && (
            <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-600" />
                    Today's Breaks
                  </CardTitle>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
                    {todayAttendance.breaks?.length || 0} Total
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {todayAttendance.breaks.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      {b.endDate ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Coffee className="w-4 h-4 text-amber-600 animate-pulse" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          Break {i + 1}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {formatDateTime(b.startDate)} →{" "}
                          {b.endDate ? formatDateTime(b.endDate) : "Now"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        b.endDate
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}
                    >
                      {b.endDate ? "Done" : "Active"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Employee Profile */}
          <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Employee Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">

              {/* Avatar + name */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-100">
                  {UserAllDetails?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {UserAllDetails?.fullName || "—"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {UserAllDetails?.designation || UserAllDetails?.role || "—"}
                  </p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Employee ID
                  </p>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {employeeId || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Role
                  </p>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {UserAllDetails?.role || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Department
                  </p>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {UserAllDetails?.department || "—"}
                  </p>
                </div>
              </div>

              {/* Email */}
              {UserAllDetails?.email && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </p>
                  <p className="font-semibold text-slate-700 text-sm mt-0.5 truncate">
                    {UserAllDetails.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default AttendanceToday;