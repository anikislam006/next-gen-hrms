"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePerformance } from "@/app/hook/usePerformance";
import {
  Users, Loader2, Star, Eye, ChevronRight,
  Clock, AlertCircle, CheckCircle, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ReviewDialog from "./ReviewDialog";

const PerformanceAppraisals = () => {
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  const {
    myPerformance,         // ✅ single-employee data from fetchByEmail
    loading,
    fetchByEmail,
  } = usePerformance();

  const [statusFilter, setStatusFilter] = useState("all");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // ── Load this user's performance ──────────────────────────────────────────
  const loadMyPerformance = useCallback(() => {
    if (!userEmail) return;
    fetchByEmail(userEmail, {
      status: statusFilter === "all" ? "" : statusFilter,
    });
  }, [userEmail, statusFilter, fetchByEmail]);

  useEffect(() => {
    loadMyPerformance();
  }, [loadMyPerformance]);

  // ── Refresh when reviews are added/deleted elsewhere ─────────────────────
  useEffect(() => {
    const handleRefresh = () => loadMyPerformance();
    window.addEventListener("refresh-performance-list", handleRefresh);
    return () =>
      window.removeEventListener("refresh-performance-list", handleRefresh);
  }, [loadMyPerformance]);

  const handleOpenReview = (emp) => {
    setSelectedEmp(emp);
    setIsReviewOpen(true);
  };

  // ── Status badge helper ───────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      pending:    { cls: "bg-amber-50 text-amber-700",     icon: Clock,       text: "Manager Review" },
      in_review:  { cls: "bg-blue-50 text-blue-700",       icon: AlertCircle, text: "Dept Head Review" },
      hr_review:  { cls: "bg-purple-50 text-purple-700",   icon: AlertCircle, text: "HR Review" },
      ceo_review: { cls: "bg-orange-50 text-orange-700",   icon: AlertCircle, text: "CEO Review" },
      approved:   { cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle, text: "Approved" },
      rejected:   { cls: "bg-red-50 text-red-700",         icon: AlertCircle, text: "Rejected" },
    };
    return map[status] || { cls: "bg-slate-50 text-slate-600", icon: Clock, text: status || "—" };
  };

  // ── Workflow strip ────────────────────────────────────────────────────────
  const WorkflowStrip = ({ latestReview }) => {
    const stages = [
      { key: "manager",   label: "Manager",    reviewerName: latestReview?.reviewer?.name || "—" },
      { key: "dept_head", label: "Dept. Head", reviewerName: "—" },
      { key: "hr_head",   label: "HR Head",    reviewerName: "—" },
    ];

    const status = latestReview?.status;
    const currentIndex =
      status === "approved"   ? 3 :
      status === "ceo_review" ? 3 :
      status === "hr_review"  ? 2 :
      status === "in_review"  ? 1 :
      status === "pending"    ? 0 :
      -1;

    return (
      <div className="flex items-start gap-3">
        {stages.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="mb-1.5">
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  )}
                </div>
                <p className={`text-xs font-medium ${
                  isDone ? "text-emerald-600" :
                  isCurrent ? "text-blue-600" :
                  "text-slate-400"
                }`}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {stage.reviewerName?.length > 12
                    ? stage.reviewerName.slice(0, 10) + "..."
                    : stage.reviewerName}
                </p>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mt-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Build a list of "appraisal entries" — one card per review ─────────────
  // myPerformance has performanceReviews[]; we render a card per review using the user's identity.
  const reviews = myPerformance?.performanceReviews || [];

  return (
    <div className="space-y-6">

      {/* MAIN CARD */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Users className="w-5 h-5" />
              My Performance Appraisals
              <Badge variant="outline" className="ml-2">
                Self View
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>

          {/* Filters — only status remains, since we're viewing just our own data */}
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Manager Review</SelectItem>
                <SelectItem value="in_review">Dept Head Review</SelectItem>
                <SelectItem value="hr_review">HR Review</SelectItem>
                <SelectItem value="ceo_review">CEO Review</SelectItem>
                <SelectItem value="approved">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Summary stats from myPerformance */}
            {myPerformance && (
              <div className="flex items-center gap-4 ml-auto text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                  <span className="font-semibold text-slate-700">
                    {Number(myPerformance.averageRating || 0).toFixed(1)}/5.0
                  </span>
                  <span className="text-slate-500 text-xs">avg</span>
                </div>
                <div className="text-slate-300">|</div>
                <div className="text-slate-700">
                  <span className="font-semibold">{myPerformance.totalReviews || 0}</span>{" "}
                  <span className="text-xs text-slate-500">reviews</span>
                </div>
                {myPerformance.achievements > 0 && (
                  <>
                    <div className="text-slate-300">|</div>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      🏆 {myPerformance.achievements} achievement
                      {myPerformance.achievements !== 1 ? "s" : ""}
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Appraisals List */}
          <div className="space-y-4">
            {loading && reviews.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8 mb-2" />
                <p className="text-gray-500">Loading appraisals...</p>
              </div>
            ) : !myPerformance || reviews.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">
                  No performance appraisals found
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {statusFilter === "all"
                    ? "Your reviews will appear here once managers add them."
                    : "No reviews match the selected status."}
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const statusBadge = getStatusBadge(review.status);
                const StatusIcon = statusBadge.icon;
                const createdDate = review?.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-CA")
                  : "—";
                const period = review?.appraisalPeriod || "2024-Annual";
                const apprType = review?.appraisalType || "Annual";

                const managerComments  = review?.feedback || review?.managerComments;
                const deptHeadComments = review?.deptHeadComments;
                const hrComments       = review?.hrComments;
                const ceoComments      = review?.ceoComments;

                return (
                  <Card key={review._id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">

                        {/* LEFT SECTION */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-slate-600 text-sm">
                              {myPerformance.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "U"}
                            </div>
                            <div>
                              <h3 className="font-semibold">{myPerformance.fullName}</h3>
                              <p className="text-sm text-gray-600">
                                {myPerformance.designation?.replace(/_/g, " ") || "—"} •{" "}
                                {myPerformance.department || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <label className="text-xs text-gray-500">Period</label>
                              <p className="text-sm font-medium mt-1">{period}</p>
                              <p className="text-xs text-gray-600 capitalize">{apprType}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Rating</label>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                                <span className="text-sm font-medium">
                                  {review.rating || 0}/5.0
                                </span>
                              </div>
                              {review.score !== undefined && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Score: {review.score}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Created</label>
                              <p className="text-sm font-medium mt-1">{createdDate}</p>
                              <p className="text-xs text-gray-600 truncate max-w-[140px]">
                                By {review.reviewer?.name || "—"}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Status</label>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge className={statusBadge.cls}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusBadge.text}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="text-xs text-gray-500">Workflow Progress</label>
                            <div className="mt-2">
                              <WorkflowStrip latestReview={review} />
                            </div>
                          </div>

                          {managerComments && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <label className="text-xs text-green-700">Manager Assessment</label>
                              <p className="text-sm text-green-800 mt-1">{managerComments}</p>
                            </div>
                          )}

                          {deptHeadComments && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <label className="text-xs text-blue-700">Department Head Review</label>
                              <p className="text-sm text-blue-800 mt-1">{deptHeadComments}</p>
                            </div>
                          )}

                          {hrComments && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                              <label className="text-xs text-purple-700">HR Review</label>
                              <p className="text-sm text-purple-800 mt-1">{hrComments}</p>
                            </div>
                          )}

                          {ceoComments && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                              <label className="text-xs text-orange-700">CEO Review</label>
                              <p className="text-sm text-orange-800 mt-1">{ceoComments}</p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT SECTION — single Details button (Add Review removed for self-view) */}
                        <div className="flex flex-row gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(myPerformance)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ReviewDialog
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        selectedEmployee={selectedEmp}
        reviewerData={UserAllDetails}
        refreshEmployees={loadMyPerformance}
      />
    </div>
  );
};

export default PerformanceAppraisals;