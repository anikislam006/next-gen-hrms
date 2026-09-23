"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, Award, Target, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePerformance } from "@/app/hook/usePerformance";

const ViewGoalsDialog = ({ isOpen, onClose }) => {
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  const { fetchEmployeePerformance } = usePerformance();

  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    avgRating: "0.0",
    totalReviews: 0,
    avgScore: "0.0",
  });

  // ── Fetch this user's reviews when dialog opens ───────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!isOpen || !userEmail) return;
      setLoading(true);
      try {
        const result = await fetchEmployeePerformance({ search: userEmail });

        // Find this user in the returned employees
        const me = result?.data?.find(
          (emp) => emp?.email?.toLowerCase() === userEmail.toLowerCase()
        );

        if (me) {
          const reviews = me.performanceReviews || [];

          // Sort newest first
          const sorted = reviews
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );

          setMyReviews(sorted);

          // Computed stats from joined data
          const total = me.totalReviews ?? sorted.length;
          const avgR = me.averageRating ?? 0;
          const avgS = me.averageScore ?? 0;

          setStats({
            avgRating: Number(avgR).toFixed(1),
            totalReviews: total,
            avgScore: Number(avgS).toFixed(2),
          });
        } else {
          setMyReviews([]);
          setStats({ avgRating: "0.0", totalReviews: 0, avgScore: "0.0" });
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, userEmail, fetchEmployeePerformance]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-700",
      in_review: "bg-blue-100 text-blue-700",
      hr_review: "bg-purple-100 text-purple-700",
      ceo_review: "bg-orange-100 text-orange-700",
      approved: "bg-emerald-100 text-emerald-700",
      completed: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            My Performance & Reviews
          </DialogTitle>
          <DialogDescription>
            View your performance ratings, feedback, and review history
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600 mb-2" />
            <p className="text-sm text-slate-500">Loading your reviews...</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-700">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{stats.avgRating}</span>
                </div>
                <p className="text-[10px] uppercase font-semibold text-orange-600 mt-1 tracking-wide">
                  Avg Rating
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {stats.avgScore}
                </div>
                <p className="text-[10px] uppercase font-semibold text-orange-600 mt-1 tracking-wide">
                  Avg Score
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">
                  {stats.totalReviews}
                </div>
                <p className="text-[10px] uppercase font-semibold text-orange-600 mt-1 tracking-wide">
                  Reviews
                </p>
              </div>
            </div>

            {/* Reviews list */}
            {myReviews.length === 0 ? (
              <div className="py-10 text-center">
                <Target className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500 font-semibold">
                  No reviews yet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Your reviews will appear here once managers add them.
                </p>
              </div>
            ) : (
              myReviews.map((review) => {
                const ratingPercent = ((review.rating || 0) / 5) * 100;

                return (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 transition-colors"
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          Review by {review.reviewer?.name || "Unknown"}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <Badge className={getStatusBadge(review.status)}>
                        {(review.status || "pending").replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Feedback as the "title" */}
                    {review.feedback && (
                      <p className="text-sm text-gray-700 mb-3 italic">
                        "{review.feedback}"
                      </p>
                    )}

                    {/* Progress section — rating bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {review.rating || 0}/5
                        </span>
                      </div>
                      <Progress value={ratingPercent} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Score: {review.score ?? 0}</span>
                        <span>Out of 5</span>
                      </div>
                    </div>

                    {/* Footer badge */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <Badge
                        className={
                          (review.rating || 0) >= 4
                            ? "bg-emerald-100 text-emerald-700"
                            : (review.rating || 0) >= 3
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {(review.rating || 0) >= 4
                          ? "Excellent"
                          : (review.rating || 0) >= 3
                          ? "Good"
                          : "Needs Improvement"}
                      </Badge>
                      {review.reviewer?.email && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[180px]">
                          {review.reviewer.email}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewGoalsDialog;