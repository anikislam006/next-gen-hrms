"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Target,
  Award,
  Loader2,
  AlertTriangle,
  Trophy,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { usePerformance } from "@/app/hook/usePerformance";

const Performance = () => {
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  const { fetchEmployeePerformance } = usePerformance();

  const [myData, setMyData] = useState({
    averageRating: 0,
    averageScore: 0,
    totalReviews: 0,
    latestReview: null,
    performanceReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch this user's performance ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchEmployeePerformance({ search: userEmail });
        const me = result?.data?.find(
          (emp) => emp?.email?.toLowerCase() === userEmail.toLowerCase()
        );

        if (me) {
          setMyData({
            averageRating: me.averageRating ?? 0,
            averageScore: me.averageScore ?? 0,
            totalReviews: me.totalReviews ?? 0,
            latestReview: me.latestReview ?? null,
            performanceReviews: me.performanceReviews || [],
          });
        } else {
          setMyData({
            averageRating: 0,
            averageScore: 0,
            totalReviews: 0,
            latestReview: null,
            performanceReviews: [],
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load performance data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userEmail, fetchEmployeePerformance]);

  // ── Listen for global refresh events (when reviews are added/deleted) ────
  useEffect(() => {
    const handleRefresh = async () => {
      if (!userEmail) return;
      try {
        const result = await fetchEmployeePerformance({ search: userEmail });
        const me = result?.data?.find(
          (emp) => emp?.email?.toLowerCase() === userEmail.toLowerCase()
        );
        if (me) {
          setMyData({
            averageRating: me.averageRating ?? 0,
            averageScore: me.averageScore ?? 0,
            totalReviews: me.totalReviews ?? 0,
            latestReview: me.latestReview ?? null,
            performanceReviews: me.performanceReviews || [],
          });
        }
      } catch (err) {
        console.error("Refresh error:", err);
      }
    };
    window.addEventListener("refresh-performance-list", handleRefresh);
    return () =>
      window.removeEventListener("refresh-performance-list", handleRefresh);
  }, [userEmail, fetchEmployeePerformance]);

  // ── Computed values ───────────────────────────────────────────────────────
  const currentRating = Number(myData.averageRating) || 0;
  const ratingPercent = (currentRating / 5) * 100;

  // "Goals" interpreted from real data: total reviews vs target of 4 reviews/year
  const reviewsTarget = 4;
  const goalsCompleted = myData.totalReviews;
  const goalsTotal = Math.max(reviewsTarget, myData.totalReviews);
  const goalsPercent = (goalsCompleted / goalsTotal) * 100;

  // Achievements: count of reviews where rating >= 4
  const achievements = myData.performanceReviews.filter(
    (r) => (r.rating || 0) >= 4
  ).length;

  // Next review estimate: latest review date + ~3 months
  const getNextReviewDate = () => {
    if (!myData.latestReview?.createdAt) return "Awaiting first review";
    const last = new Date(myData.latestReview.createdAt);
    const next = new Date(last);
    next.setMonth(next.getMonth() + 3);
    return next.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-2" />
        <p className="text-sm font-medium">Loading performance data...</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Performance Rating Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-600 fill-yellow-400 text-yellow-500" />
              Performance Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {myData.totalReviews > 0 ? (
                  <>
                    {currentRating.toFixed(1)}
                    <span className="text-2xl text-orange-400 font-medium">
                      /5.0
                    </span>
                  </>
                ) : (
                  <span className="text-3xl text-slate-400">—</span>
                )}
              </div>
              <p className="text-gray-600">
                {myData.totalReviews > 0
                  ? `Average across ${myData.totalReviews} review${
                      myData.totalReviews !== 1 ? "s" : ""
                    }`
                  : "No reviews yet"}
              </p>

              <div className="mt-4">
                <Progress value={ratingPercent} className="h-3" />
              </div>

              {myData.totalReviews > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      Avg Score
                    </p>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {Number(myData.averageScore).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      Latest
                    </p>
                    <p className="text-lg font-bold text-orange-600 mt-1 flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {myData.latestReview?.rating || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Goals & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Reviews Completed</span>
                <span className="font-bold text-slate-900">
                  {goalsCompleted}/{goalsTotal}
                </span>
              </div>
              <Progress value={goalsPercent} className="h-2" />

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-700 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  Achievements
                </span>
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                  {achievements}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 -mt-1">
                {achievements === 0
                  ? "Earn an achievement by getting a 4+ star review"
                  : `${achievements} review${
                      achievements !== 1 ? "s" : ""
                    } rated 4 stars or higher`}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Next Review:</span>
                <span className="font-medium text-slate-900">
                  {getNextReviewDate()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty state — only when there are no reviews at all */}
      {!loading && myData.totalReviews === 0 && !error && (
        <div className="py-10 text-center bg-white rounded-xl border border-slate-100">
          <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-base text-slate-600 font-semibold">
            No performance reviews yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Your ratings and achievements will appear here once managers add reviews.
          </p>
        </div>
      )}
    </div>
  );
};

export default Performance;