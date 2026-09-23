"use client";

import React from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useDashboardStats } from "@/app/hook/useDashboardState";

const Leave = () => {
  const { UserAllDetails } = useAuth();
  const router = useRouter();
  const userEmail = UserAllDetails?.email;

  const { userStats, loading, error } = useDashboardStats(userEmail);

  // ── Leave breakdown from live stats ───────────────────────────────────────
  const leaveBreakdown = userStats?.leaveTypesBreakdown || [];

  // Helper to find a leave type by partial name match (case-insensitive)
  const findLeave = (keyword) =>
    leaveBreakdown.find((l) =>
      l?.name?.toLowerCase().includes(keyword.toLowerCase())
    );

  // Color theme for known leave types
  const getColorConfig = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("annual"))
      return { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (n.includes("sick"))
      return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    if (n.includes("casual"))
      return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    if (n.includes("maternity") || n.includes("paternity"))
      return { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };
    if (n.includes("bereav") || n.includes("bareav"))
      return { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
    if (n.includes("emergency"))
      return { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
  };

  // ── Aggregate request counters from all leave types ──────────────────────
  const totalRequests = leaveBreakdown.reduce(
    (sum, l) => sum + (l.totalReq || 0),
    0
  );
  const totalApproved = leaveBreakdown.reduce(
    (sum, l) => sum + (l.totalApprovedReq || 0),
    0
  );
  const myRequests = leaveBreakdown.reduce(
    (sum, l) => sum + (l.myLeaveReq || 0),
    0
  );
  const totalDaysUsed = leaveBreakdown.reduce(
    (sum, l) => sum + (l.myLeaveReq || 0),
    0
  );
  const pendingRequests = Math.max(totalRequests - totalApproved, 0);

  // Filter out empty leave types (where everything is 0) for cleaner display
  const visibleLeaves = leaveBreakdown.filter(
    (l) =>
      l &&
      ((l.totalAnnualDays || 0) > 0 ||
        (l.myRemaining || 0) > 0 ||
        (l.myLeaveReq || 0) > 0)
  );

  return (
    <div className="space-y-6 p-1 w-full">

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Leave Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Leave Balance
              </span>
              <Button
                onClick={() => router.push("/super-admin/leave")}
                variant="outline"
                size="sm"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-slate-500">Loading balances...</p>
              </div>
            ) : visibleLeaves.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-semibold">
                  No leave policies assigned
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Your leave balances will show here once policies are set.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleLeaves.map((leave) => {
                  const { color } = getColorConfig(leave.name);
                  const remaining = leave.myRemaining ?? 0;
                  const total = leave.totalAnnualDays ?? 0;

                  return (
                    <div
                      key={leave.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-700 font-medium">
                        {leave.name}
                      </span>
                      <span className={`font-bold ${color}`}>
                        {remaining}
                        {total > 0 && (
                          <span className="text-sm text-slate-400 font-medium ml-1">
                            / {total}
                          </span>
                        )}{" "}
                        days
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-slate-500">Loading requests...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Pending</span>
                  <Badge variant="secondary">{pendingRequests}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Approved</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                    {totalApproved}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">My Requests</span>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {myRequests}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-slate-700 font-medium">Total Used</span>
                  <span className="font-medium text-slate-900">
                    {totalDaysUsed} day{totalDaysUsed !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optional: All leave types as small cards (mirrors your dashboard) */}
      {!loading && visibleLeaves.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 ml-1">
            All Leave Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleLeaves.map((leave) => {
              const { color, bg, border } = getColorConfig(leave.name);
              const used = leave.myLeaveReq ?? 0;
              const remaining = leave.myRemaining ?? 0;
              const total = leave.totalAnnualDays ?? 0;

              return (
                <Card
                  key={leave.id}
                  className={`${bg} ${border} hover:shadow-md transition-all`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {leave.name}
                        </p>
                        <p className={`text-3xl font-bold ${color} mt-1`}>
                          {remaining}
                        </p>
                      </div>
                      <Calendar className={`w-8 h-8 ${color} opacity-70`} />
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 pt-3 border-t border-slate-200/60">
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span className="font-semibold">{used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;