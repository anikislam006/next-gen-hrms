"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  createInterview, 
  getAllInterviews, 
  deleteInterview,
  getSpecificInterviewDetails // Added this
} from "../api/interview";

/* ================= SHARED STATE ================= */
let sharedInterviews = [];
let sharedInterviewPagination = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
};
let sharedInterviewLoading = false;
let sharedInterviewError = null;
let interviewListeners = [];

const notifyInterview = () => {
  interviewListeners.forEach((listener) => listener());
};

export function useInterview() {
  const [interviews, setInterviews] = useState(sharedInterviews);
  const [pagination, setPagination] = useState(sharedInterviewPagination);
  const [loading, setLoading] = useState(sharedInterviewLoading);
  const [error, setError] = useState(sharedInterviewError);

  useEffect(() => {
    const listener = () => {
      setInterviews([...sharedInterviews]);
      setPagination({ ...sharedInterviewPagination });
      setLoading(sharedInterviewLoading);
      setError(sharedInterviewError);
    };
    interviewListeners.push(listener);
    listener();
    return () => {
      interviewListeners = interviewListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL INTERVIEWS ================= */
  const fetchAllInterviews = useCallback(async (params = {}) => {
    try {
      sharedInterviewLoading = true;
      notifyInterview();
      const result = await getAllInterviews(params);
      sharedInterviews = result?.interviews || [];
      sharedInterviewPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedInterviewError = null;
    } catch (err) {
      sharedInterviewError = err.message || "Failed to fetch interviews";
    } finally {
      sharedInterviewLoading = false;
      notifyInterview();
    }
  }, []);

  /* ================= FETCH SPECIFIC INTERVIEW (New!) ================= */
  /**
   * Use this to get data for a specific candidate and job role.
   * It returns the data directly for local component use.
   */
  const fetchSpecificInterview = useCallback(async (jobId, candidateId) => {
    try {
      sharedInterviewLoading = true;
      notifyInterview();

      const result = await getSpecificInterviewDetails(jobId, candidateId);
      
      sharedInterviewError = null;
      return result.data; // This contains the normalized interviewRoundsList
    } catch (err) {
      sharedInterviewError = err.message || "Failed to fetch specific interview details";
      throw err;
    } finally {
      sharedInterviewLoading = false;
      notifyInterview();
    }
  }, []);

  /* ================= SUBMIT INTERVIEW ================= */
  const submitInterview = useCallback(async (interviewData) => {
    try {
      sharedInterviewLoading = true;
      notifyInterview();
      const response = await createInterview(interviewData);
      if (response.success) {
        await fetchAllInterviews({ page: 1 });
        window.dispatchEvent(new CustomEvent("refresh-interview-list"));
      }
      return response;
    } catch (err) {
      sharedInterviewError = err.message || "Failed to schedule interview";
      throw err;
    } finally {
      sharedInterviewLoading = false;
      notifyInterview();
    }
  }, [fetchAllInterviews]);

  /* ================= REMOVE INTERVIEW ================= */
  const removeInterview = useCallback(async (id) => {
    const previousInterviews = [...sharedInterviews];
    try {
      sharedInterviews = sharedInterviews.filter(i => i._id !== id);
      notifyInterview(); 
      const response = await deleteInterview(id);
      if (response.success) {
        if (sharedInterviewPagination.totalItems > 0) {
          sharedInterviewPagination.totalItems -= 1;
        }
      }
    } catch (err) {
      sharedInterviews = previousInterviews;
      sharedInterviewError = err.message || "Failed to delete interview";
      notifyInterview();
    }
  }, []);

  return {
    interviews,
    pagination,
    loading,
    error,
    fetchAllInterviews,
    fetchSpecificInterview, // Exported new function
    submitInterview,
    removeInterview
  };
}