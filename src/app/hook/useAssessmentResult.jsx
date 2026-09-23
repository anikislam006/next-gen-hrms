"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  saveAssessmentResult, 
  getSpecificAssessmentResult,
  saveInterviewResult, 
  getSpecificInterview 
} from "../api/assessment-result";

/* ================= SHARED STATE ================= */
// Using shared variables outside the hook to persist data between component mounts
let sharedResults = [];
let sharedResultLoading = false;
let sharedResultError = null;
let resultListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyResults = () => {
  resultListeners.forEach((listener) => listener());
};

export function useAssessmentResult() {
  const [results, setResults] = useState(sharedResults);
  const [loading, setLoading] = useState(sharedResultLoading);
  const [error, setError] = useState(sharedResultError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setResults([...sharedResults]);
      setLoading(sharedResultLoading);
      setError(sharedResultError); 
    };

    resultListeners.push(listener);
    listener(); // Initial sync

    return () => {
      resultListeners = resultListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= HELPER: UPDATE SHARED STATE ================= */
  const updateSharedState = (newData) => {
    if (!newData) return;
    const index = sharedResults.findIndex(r => 
      r.jobRoleId === newData.jobRoleId && r.candidateId === newData.candidateId
    );

    if (index > -1) {
      // Update existing entry
      sharedResults[index] = { ...sharedResults[index], ...newData };
    } else {
      // Add new entry to the top
      sharedResults = [newData, ...sharedResults];
    }
  };

  /* ================= SUBMIT ASSESSMENT RESULT ================= */
  const submitAssessmentResult = useCallback(async (payload) => {
    try {
      sharedResultLoading = true;
      sharedResultError = null;
      notifyResults();

      const response = await saveAssessmentResult(payload);
      
      if (response.success) {
        updateSharedState(response.data);
        window.dispatchEvent(new CustomEvent("assessment-result-updated", { 
          detail: response.data 
        }));
      }
      
      return response;
    } catch (err) {
      sharedResultError = err.message || "Failed to save candidate marks";
      throw err;
    } finally {
      sharedResultLoading = false;
      notifyResults();
    }
  }, []);

  /* ================= FETCH SPECIFIC ASSESSMENT ================= */
  const fetchSpecificResult = useCallback(async (jobRoleId, candidateId) => {
    try {
      sharedResultLoading = true;
      sharedResultError = null;
      notifyResults();

      const data = await getSpecificAssessmentResult(jobRoleId, candidateId);
      if (data) updateSharedState(data);
      
      return data;
    } catch (err) {
      sharedResultError = err.message || "Failed to fetch assessment";
      return null;
    } finally {
      sharedResultLoading = false;
      notifyResults();
    }
  }, []);

  /* ================= SUBMIT INTERVIEW RESULT ================= */
  const submitInterviewResult = useCallback(async (payload) => {
    try {
      sharedResultLoading = true;
      sharedResultError = null;
      notifyResults();

      const response = await saveInterviewResult(payload);
      
      if (response.success) {
        updateSharedState(response.data);
        // Dispatch event so other parts of the UI know the scorecard changed
        window.dispatchEvent(new CustomEvent("interview-result-updated", { 
          detail: response.data 
        }));
      }
      
      return response;
    } catch (err) {
      sharedResultError = err.message || "Failed to sync interview results";
      throw err;
    } finally {
      sharedResultLoading = false;
      notifyResults();
    }
  }, []);

  /* ================= FETCH SPECIFIC INTERVIEW ================= */
  const fetchInterviewDetails = useCallback(async (jobRoleId, candidateId) => {
    try {
      sharedResultLoading = true;
      sharedResultError = null;
      notifyResults();

      const data = await getSpecificInterview(jobRoleId, candidateId);
      if (data) updateSharedState(data);
      
      return data;
    } catch (err) {
      sharedResultError = err.message || "Failed to fetch interview details";
      return null;
    } finally {
      sharedResultLoading = false;
      notifyResults();
    }
  }, []);

  /* ================= CLEAR ERRORS ================= */
  const clearResultError = useCallback(() => {
    sharedResultError = null;
    notifyResults();
  }, []);

  return {
    results,
    loading,
    error,
    submitAssessmentResult,
    fetchSpecificResult,
    submitInterviewResult,   // New
    fetchInterviewDetails,   // New
    clearResultError
  };
}