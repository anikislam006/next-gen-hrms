"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createAssessmentNextzen,
  getAllAssessmentsNextzen,
  getJobBasedAssessmentsNextzen,
  deleteAssessmentNextzen,
  createCTOAssessmentNextzen
} from "../api/assessment-nextzen";

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

export function useAssessmentNextzen() {
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

      const result = await getAllAssessmentsNextzen(params);

      sharedAssessments = result?.assessments || [];
      sharedAssessmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedAssessmentError = null;
    } catch (err) {
      sharedAssessmentError = err.message || "Failed to fetch Nextzen assessments";
    } finally {
      sharedAssessmentLoading = false;
      notifyAssessment();
    }
  }, []);

  /* ================= FETCH ASSESSMENTS BY JOB ================= */
  const fetchAssessmentsByJob = useCallback(async (jobId, params = {}) => {
    if (!jobId) return;

    try {
      sharedAssessmentLoading = true;
      notifyAssessment();

      const result = await getJobBasedAssessmentsNextzen(jobId, params);

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
  const submitAssessment = useCallback(
    async (assessmentData) => {
      try {
        sharedAssessmentLoading = true;
        notifyAssessment();

        const response = await createAssessmentNextzen(assessmentData);

        if (response.success) {
          await fetchAllAssessments({ page: 1 });
          window.dispatchEvent(new CustomEvent("refresh-assessment-list"));
        }

        return response;
      } catch (err) {
        sharedAssessmentError = err.message || "Failed to add Nextzen assessment";
        throw err;
      } finally {
        sharedAssessmentLoading = false;
        notifyAssessment();
      }
    },
    [fetchAllAssessments]
  );

  /* ================= DELETE ASSESSMENT ================= */
  const removeAssessment = useCallback(async (id) => {
    const previousAssessments = [...sharedAssessments];

    try {
      sharedAssessments = sharedAssessments.filter((a) => a._id !== id);
      notifyAssessment();

      const response = await deleteAssessmentNextzen(id);

      if (response.success) {
        if (sharedAssessmentPagination.totalItems > 0) {
          sharedAssessmentPagination.totalItems -= 1;
        }
        window.dispatchEvent(new CustomEvent("refresh-assessment-list"));
      }
    } catch (err) {
      sharedAssessments = previousAssessments;
      sharedAssessmentError = err.message || "Failed to delete Nextzen assessment";
      notifyAssessment();
    }
  }, []);

const submitCTOAssessment = useCallback(async (ctoData) => {
  try {
    sharedAssessmentLoading = true;
    notifyAssessment();

    // This now calls the PUT method under the hood
    const response = await createCTOAssessmentNextzen(ctoData);

    if (response.success) {
      // Re-fetch all assessments so the 'sharedAssessments' state 
      // contains the updated object with the new 'ctoAssessmentTypesList' field
      const result = await getAllAssessmentsNextzen({ page: 1 });
      sharedAssessments = result?.assessments || [];
      
      window.dispatchEvent(new CustomEvent("refresh-assessment-list"));
    }

    return response;
  } catch (err) {
    sharedAssessmentError = err.message || "Failed to update CTO assessment";
    throw err;
  } finally {
    sharedAssessmentLoading = false;
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
    removeAssessment,
    submitCTOAssessment
  };
}