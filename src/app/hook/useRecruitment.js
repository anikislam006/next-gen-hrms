"use client";

import { useState, useEffect, useCallback } from "react";
import { createJobPost, getAllJobs, deleteJobPost, getJobDetails, getJobOptions } from "../api/recruitment";

/* ================= SHARED STATE ================= */
// These live outside the hook to keep all components in sync
let sharedJobs = [];
let sharedPagination = {
  totalJobs: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
};
let sharedLoading = false;
let sharedError = null;
let sharedListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notify = () => {
  // We loop through all attached components and trigger their local state updates
  sharedListeners.forEach((listener) => listener());
};

export function useJobPosts() {
  const [jobs, setJobs] = useState(sharedJobs);
  const [pagination, setPagination] = useState(sharedPagination);
  const [loading, setLoading] = useState(sharedLoading);
  const [error, setError] = useState(sharedError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      // IMPORTANT: [...array] creates a new reference which forces React to re-render
      setJobs([...sharedJobs]); 
      setPagination({ ...sharedPagination });
      setLoading(sharedLoading);
      setError(sharedError);
    };

    sharedListeners.push(listener);
    return () => {
      sharedListeners = sharedListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = useCallback(async (params = {}) => {
    try {
      sharedLoading = true;
      notify();

      const queryParams = {
        page: params.page || sharedPagination.currentPage,
        limit: params.limit || sharedPagination.limit,
        ...params,
      };

      const result = await getAllJobs(queryParams);
      
      // Update the global variables
      sharedJobs = result?.jobs || [];
      sharedPagination = {
        totalJobs: result?.totalJobs || 0,
        totalPages: result?.totalPages || 1,
        currentPage: result?.currentPage || 1,
        limit: result?.limit || 10,
      };
      sharedError = null;
    } catch (err) {
      sharedError = err.message || "Failed to fetch jobs";
    } finally {
      sharedLoading = false;
      notify(); // This tells all components "Hey, data is here, re-render now!"
    }
  }, []);

  // --- NEW: FETCH JOB OPTIONS (For Dropdowns) ---
  const fetchJobOptions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await getJobOptions(page);
      return result.jobs; // Returns the array of {_id, title}
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SUBMIT JOB ================= */
  const submitJob = useCallback(async (jobData) => {
    try {
      sharedLoading = true;
      notify();
      const response = await createJobPost(jobData);
      
      // Immediately fetch fresh data so the UI updates
      await fetchJobs({ page: 1 }); 
      return response;
    } catch (err) {
      sharedError = err.message || "Failed to create job post";
      notify();
      throw err;
    } finally {
      sharedLoading = false;
      notify();
    }
  }, [fetchJobs]);

  /* ================= DELETE JOB ================= */
  const deleteJob = useCallback(async (jobId) => {
    try {
      // 1. Optional: Optimistic Update (Remove from UI immediately)
      // This makes the app feel "Instant"
      sharedJobs = sharedJobs.filter(job => job._id !== jobId);
      notify(); 

      // 2. Perform actual deletion on server
      await deleteJobPost(jobId);

      // 3. Re-fetch to sync with database (corrects pagination counts)
      await fetchJobs({ page: sharedPagination.currentPage });

    } catch (err) {
      sharedError = err.message || "Failed to delete job post";
      // If server delete fails, re-fetch to bring the item back to the UI
      await fetchJobs(); 
      notify();
      throw err;
    }
  }, [fetchJobs]);

  // ... inside your useJobPosts hook function ...
const fetchSingleJob = useCallback(async (id) => {
  try {
    setLoading(true);
    const result = await getJobDetails(id);
    return result;
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);

  /* ================= AUTO LOAD ================= */
  useEffect(() => {
    if (sharedJobs.length === 0 && !sharedLoading) {
      fetchJobs();
    }
  }, [fetchJobs]);

  return {
    jobs,
    pagination,
    loading,
    error,
    fetchJobs,
    submitJob,
    deleteJob,
    fetchSingleJob,
    fetchJobOptions
  };
}