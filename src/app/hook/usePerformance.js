"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addEmployeeReview,
  getAllPerformanceReviews,
  getAllPerformanceReviewsByEmail,        // ✅ NEW
  getEmployeePerformanceHistory,
  deletePerformanceReview,
  getEmployeePerformance,
  getEmployeePerformanceByEmail,
} from "../api/performance";

/* ================= SHARED STATE ================= */
let sharedReviews = [];
let sharedMyReviews = [];                  // ✅ NEW — only the logged-in user's reviews
let sharedMyReviewsStats = {               // ✅ NEW — summary stats for the current user
  totalReviews: 0,
  avgRating: 0,
  avgScore: 0,
  statusBreakdown: {},
};
let sharedEmployees = [];
let sharedCounts = {
  employmentTypeCounts: {},
  statusCounts: {},
  roleCounts: {},
  designationCounts: {},
  departmentCounts: {},
};
let sharedFilters = {
  designations: [],
  departments: [],
  appliedFilters: {},
};
let sharedPagination = { page: 1, totalPages: 1, totalEmployees: 0 };
let sharedPerformanceStats = { avgRating: "0.0", totalReviews: 0 };
let sharedMyPerformance = null;
let sharedPerformanceLoading = false;
let sharedPerformanceError = null;
let performanceListeners = [];

const notifyPerformance = () => {
  performanceListeners.forEach((listener) => listener());
};

export function usePerformance() {
  const [reviews, setReviews] = useState(sharedReviews);
  const [myReviews, setMyReviews] = useState(sharedMyReviews);                    // ✅ NEW
  const [myReviewsStats, setMyReviewsStats] = useState(sharedMyReviewsStats);     // ✅ NEW
  const [employees, setEmployees] = useState(sharedEmployees);
  const [counts, setCounts] = useState(sharedCounts);
  const [filters, setFilters] = useState(sharedFilters);
  const [pagination, setPagination] = useState(sharedPagination);
  const [stats, setStats] = useState(sharedPerformanceStats);
  const [myPerformance, setMyPerformance] = useState(sharedMyPerformance);
  const [loading, setLoading] = useState(sharedPerformanceLoading);
  const [error, setError] = useState(sharedPerformanceError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setReviews([...sharedReviews]);
      setMyReviews([...sharedMyReviews]);                                  // ✅ NEW
      setMyReviewsStats({ ...sharedMyReviewsStats });                      // ✅ NEW
      setEmployees([...sharedEmployees]);
      setCounts({ ...sharedCounts });
      setFilters({ ...sharedFilters });
      setPagination({ ...sharedPagination });
      setStats({ ...sharedPerformanceStats });
      setMyPerformance(sharedMyPerformance ? { ...sharedMyPerformance } : null);
      setLoading(sharedPerformanceLoading);
      setError(sharedPerformanceError);
    };

    performanceListeners.push(listener);
    listener();

    return () => {
      performanceListeners = performanceListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL REVIEWS (global) ================= */
  const fetchAllReviews = useCallback(async (params = {}) => {
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();
      const result = await getAllPerformanceReviews(params);
      sharedReviews = result?.data || [];
      sharedPerformanceError = null;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch reviews";
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= ✅ NEW — FETCH MY REVIEWS (by email) ================= */
  const fetchMyReviews = useCallback(async (email, params = {}) => {
    if (!email) return null;
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();

      // Strip empty values from params
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const result = await getAllPerformanceReviewsByEmail(email, cleanParams);

      if (result?.success) {
        sharedMyReviews = result.data || [];
        sharedMyReviewsStats = result.stats || {
          totalReviews: 0,
          avgRating: 0,
          avgScore: 0,
          statusBreakdown: {},
        };
      } else {
        sharedMyReviews = [];
        sharedMyReviewsStats = {
          totalReviews: 0,
          avgRating: 0,
          avgScore: 0,
          statusBreakdown: {},
        };
      }
      sharedPerformanceError = null;

      return result;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch user reviews";
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= FETCH EMPLOYEE HISTORY ================= */
  const fetchEmployeeHistory = useCallback(async (employeeId, params = {}) => {
    if (!employeeId) return;
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();
      const result = await getEmployeePerformanceHistory(employeeId, params);
      sharedReviews = result?.data || [];
      sharedPerformanceError = null;
      return result;
    } catch (err) {
      sharedPerformanceError = err.message;
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= FETCH EMPLOYEES + REVIEWS (joined) ================= */
  const fetchEmployeePerformance = useCallback(async (params = {}) => {
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const result = await getEmployeePerformance(cleanParams);

      sharedEmployees = result?.data || [];
      sharedCounts = result?.counts || {
        employmentTypeCounts: {},
        statusCounts: {},
        roleCounts: {},
        designationCounts: {},
        departmentCounts: {},
      };
      sharedFilters = result?.filters || {
        designations: [],
        departments: [],
        appliedFilters: {},
      };
      sharedPagination = {
        page: result?.page || 1,
        totalPages: result?.totalPages || 1,
        totalEmployees: result?.totalEmployees || 0,
      };

      const allReviews = (result?.data || []).flatMap(
        (emp) => emp.performanceReviews || []
      );
      const totalReviews = allReviews.length;
      const avgRating =
        totalReviews > 0
          ? (
              allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              totalReviews
            ).toFixed(1)
          : "0.0";

      sharedPerformanceStats = { avgRating, totalReviews };
      sharedPerformanceError = null;

      return result;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch employees";
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= FETCH BY EMAIL (single employee with reviews joined) ================= */
  const fetchByEmail = useCallback(async (email, params = {}) => {
    if (!email) return null;
    try {
      sharedPerformanceLoading = true;
      notifyPerformance();

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined
        )
      );

      const result = await getEmployeePerformanceByEmail(email, cleanParams);

      if (result?.success) {
        sharedMyPerformance = result.data;
      } else {
        sharedMyPerformance = null;
      }
      sharedPerformanceError = null;

      return result;
    } catch (err) {
      sharedPerformanceError = err.message || "Failed to fetch performance";
      throw err;
    } finally {
      sharedPerformanceLoading = false;
      notifyPerformance();
    }
  }, []);

  /* ================= SUBMIT REVIEW ================= */
  const submitReview = useCallback(
    async (reviewData) => {
      try {
        sharedPerformanceLoading = true;
        notifyPerformance();

        const response = await addEmployeeReview(reviewData);

        if (response.success) {
          await fetchEmployeePerformance();
          window.dispatchEvent(new CustomEvent("refresh-performance-list"));
        }

        return response;
      } catch (err) {
        sharedPerformanceError = err.message || "Failed to submit review";
        throw err;
      } finally {
        sharedPerformanceLoading = false;
        notifyPerformance();
      }
    },
    [fetchEmployeePerformance]
  );

  /* ================= REMOVE REVIEW ================= */
  const removeReview = useCallback(async (id) => {
    const previousReviews = [...sharedReviews];

    try {
      sharedReviews = sharedReviews.filter((review) => review._id !== id);
      notifyPerformance();

      const response = await deletePerformanceReview(id);

      if (response.success) {
        window.dispatchEvent(new CustomEvent("refresh-performance-list"));
      }
    } catch (err) {
      sharedReviews = previousReviews;
      sharedPerformanceError = err.message || "Failed to delete review";
      notifyPerformance();
    }
  }, []);

  return {
    // State
    reviews,
    myReviews,            // ✅ NEW
    myReviewsStats,       // ✅ NEW
    employees,
    counts,
    filters,
    pagination,
    stats,
    myPerformance,
    loading,
    error,

    // Actions
    fetchAllReviews,
    fetchMyReviews,       // ✅ NEW
    fetchEmployeeHistory,
    fetchEmployeePerformance,
    fetchByEmail,
    submitReview,
    removeReview,
  };
}