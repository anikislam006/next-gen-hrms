"use client";
import React, { useEffect } from "react";
import {
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { usePerformance } from "@/app/hook/usePerformance";

// 4 workflow stages
const STATUS_LABELS = {
  pending: "Manager Review",
  in_review: "Dept Head Review",
  hr_review: "HR Review",
  ceo_review: "CEO Review",
};

// Status badge colors + labels
const getStatusInfo = (status) => {
  const map = {
    pending: {
      color: "bg-amber-100 text-amber-700",
      text: "Manager Review",
      icon: Clock,
    },
    in_review: {
      color: "bg-blue-100 text-blue-700",
      text: "Dept Head Review",
      icon: AlertCircle,
    },
    hr_review: {
      color: "bg-purple-100 text-purple-700",
      text: "HR Review",
      icon: AlertCircle,
    },
    ceo_review: {
      color: "bg-orange-100 text-orange-700",
      text: "CEO Review",
      icon: AlertCircle,
    },
    approved: {
      color: "bg-emerald-100 text-emerald-700",
      text: "Completed",
      icon: CheckCircle,
    },
    rejected: {
      color: "bg-red-100 text-red-700",
      text: "Rejected",
      icon: AlertCircle,
    },
    draft: {
      color: "bg-slate-100 text-slate-600",
      text: "Draft",
      icon: Clock,
    },
  };
  return (
    map[status] || {
      color: "bg-slate-100 text-slate-600",
      text: status || "Unknown",
      icon: Clock,
    }
  );
};

const ApprovalWorkflow = () => {
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  const {
    myReviews,
    myReviewsStats,
    loading,
    fetchMyReviews,
  } = usePerformance();

  // ── Fetch this user's reviews on mount ────────────────────────────────────
  useEffect(() => {
    if (userEmail) fetchMyReviews(userEmail);
  }, [userEmail, fetchMyReviews]);

  // ── Auto-refresh on global event (after submit/delete) ───────────────────
  useEffect(() => {
    const handleRefresh = () => {
      if (userEmail) fetchMyReviews(userEmail);
    };
    window.addEventListener("refresh-performance-list", handleRefresh);
    return () =>
      window.removeEventListener("refresh-performance-list", handleRefresh);
  }, [userEmail, fetchMyReviews]);

  // ── Format date helper ────────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-CA");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            My Performance Appraisal Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">

            {/* Workflow Explanation */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">4-Step Appraisal Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    1
                  </div>
                  <h4 className="font-medium text-sm">Reporting Manager</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Manager fills performance review and ratings
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                  <h4 className="font-medium text-sm">Department Head</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Department head reviews and adds feedback
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                  <h4 className="font-medium text-sm">HR Head</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    HR head finalizes and updates records
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    4
                  </div>
                  <h4 className="font-medium text-sm">CEO (Optional)</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    CEO reviews senior-level employees
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats from myReviewsStats */}
            {myReviewsStats?.totalReviews > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold tracking-wider text-amber-700">
                          Total Reviews
                        </p>
                        <p className="text-2xl font-bold text-amber-800 mt-1">
                          {myReviewsStats.totalReviews}
                        </p>
                      </div>
                      <Settings className="w-8 h-8 text-amber-600 opacity-60" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold tracking-wider text-yellow-700">
                          Avg Rating
                        </p>
                        <p className="text-2xl font-bold text-yellow-800 mt-1 flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          {Number(myReviewsStats.avgRating).toFixed(1)}/5
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase font-semibold tracking-wider text-blue-700">
                          Avg Score
                        </p>
                        <p className="text-2xl font-bold text-blue-800 mt-1">
                          {Number(myReviewsStats.avgScore).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pending Reviews by Stage — counts from MY reviews only */}
            <div>
              <h3 className="font-semibold mb-4">My Reviews by Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STATUS_LABELS).map(([status, label]) => {
                  // Use the API-computed statusBreakdown if available, else compute client-side
                  const count =
                    myReviewsStats?.statusBreakdown?.[status] ??
                    myReviews.filter((r) => r.status === status).length;

                  return (
                    <Card
                      key={status}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-sm">{label}</h4>
                          <p className="text-2xl font-bold text-yellow-600 mt-2">
                            {loading ? "..." : count}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Pending</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity — only my reviews */}
            <div>
              <h3 className="font-semibold mb-4">My Recent Appraisal Activity</h3>

              {loading && myReviews.length === 0 ? (
                <div className="py-8 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500 w-6 h-6 mb-2" />
                  <p className="text-sm text-slate-500">Loading recent activity...</p>
                </div>
              ) : myReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reviews for you yet
                </p>
              ) : (
                <div className="space-y-3">
                  {myReviews
                    .filter((r) => r.status !== "draft")
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5)
                    .map((review) => {
                      const statusInfo = getStatusInfo(review.status);
                      return (
                        <div
                          key={review._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">
                              {review.reviewee?.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Rating: {review.rating || 0}/5 • Score:{" "}
                              {review.score ?? 0} • {statusInfo.text}
                            </p>
                            {review.feedback && (
                              <p className="text-xs text-gray-500 mt-1 italic truncate max-w-md">
                                "{review.feedback}"
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xs text-gray-500">
                              Created: {formatDate(review.createdAt)}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              By {review.reviewer?.name || "—"}
                            </p>
                            <Badge className={`${statusInfo.color} mt-1`}>
                              {statusInfo.text}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalWorkflow;