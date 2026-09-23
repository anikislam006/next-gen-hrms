"use client";

import { useState, useEffect, useCallback } from "react";
// FIXED: Ensure the path matches your actual file name (double 'ss' in assessment)
import { 
  createAssessment, 
  getAllAssessments, 
  getJobBasedAssessments, 
  deleteAssessment 
} from "../api/assesment";

/* ================= SHARED STATE ================= */
let sharedAssessments = [];
let sharedAssessmentPagination = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
};
let sharedAssessmentLoading = false;
let sharedAssessmentError = null;
let assessmentListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyAssessment = () => {
  assessmentListeners.forEach((listener) => listener());
};

export function useAssessment() {
  const [assessments, setAssessments] = useState(sharedAssessments);
  const [pagination, setPagination] = useState(sharedAssessmentPagination);
  const [loading, setLoading] = useState(sharedAssessmentLoading);
  const [error, setError] = useState(sharedAssessmentError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setAssessments([...sharedAssessments]);
      setPagination({ ...sharedAssessmentPagination });
      setLoading(sharedAssessmentLoading);
      setError(sharedAssessmentError);
    };

    assessmentListeners.push(listener);
    // Initial sync
    listener();

    return () => {
      assessmentListeners = assessmentListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL ASSESSMENTS ================= */
  const fetchAllAssessments = useCallback(async (params = {}) => {
    try {
      sharedAssessmentLoading = true;
      notifyAssessment();

      const result = await getAllAssessments(params);
      
      // Ensure we map the correct data key from your backend response
      sharedAssessments = result?.assessments || [];
      sharedAssessmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedAssessmentError = null;
    } catch (err) {
      sharedAssessmentError = err.message || "Failed to fetch assessments";
    } finally {
      sharedAssessmentLoading = false;
      notifyAssessment();
    }
  }, []);

  /* ================= FETCH ASSESSMENTS BY JOB ID ================= */
  const fetchAssessmentsByJob = useCallback(async (jobId, params = {}) => {
    if (!jobId) return;

    try {
      sharedAssessmentLoading = true;
      notifyAssessment();

      const result = await getJobBasedAssessments(jobId, params);
      
      sharedAssessments = result?.assessments || [];
      sharedAssessmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedAssessmentError = null;
      return result; 
    } catch (err) {
      sharedAssessmentError = err.message;
      throw err;
    } finally {
      sharedAssessmentLoading = false;
      notifyAssessment();
    }
  }, []);

  /* ================= SUBMIT ASSESSMENT ================= */
  const submitAssessment = useCallback(async (assessmentData) => {
    try {
      sharedAssessmentLoading = true;
      notifyAssessment();

      const response = await createAssessment(assessmentData);
      
      if (response.success) {
        // Refresh based on active context if needed, 
        // or just fetch the first page of all assessments
        await fetchAllAssessments({ page: 1 });
        window.dispatchEvent(new CustomEvent("refresh-assessment-list"));
      }
      
      return response;
    } catch (err) {
      sharedAssessmentError = err.message || "Failed to add assessment";
      throw err;
    } finally {
      sharedAssessmentLoading = false;
      notifyAssessment();
    }
  }, [fetchAllAssessments]);

  /* ================= DELETE ASSESSMENT ================= */
  const removeAssessment = useCallback(async (id) => {
    // Keep reference for rollback
    const previousAssessments = [...sharedAssessments];
    
    try {
      // Optimistic Update
      sharedAssessments = sharedAssessments.filter(a => a._id !== id);
      notifyAssessment(); 

      const response = await deleteAssessment(id);

      if (response.success) {
        if (sharedAssessmentPagination.totalItems > 0) {
          sharedAssessmentPagination.totalItems -= 1;
        }
        window.dispatchEvent(new CustomEvent("refresh-assessment-list"));
      }
    } catch (err) {
      // Rollback on error
      sharedAssessments = previousAssessments;
      sharedAssessmentError = err.message || "Failed to delete assessment";
      notifyAssessment();
    }
  }, []);

  return {
    assessments,
    pagination,
    loading,
    error,
    fetchAllAssessments,
    fetchAssessmentsByJob,
    submitAssessment,
    removeAssessment
  };
}