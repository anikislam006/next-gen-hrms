"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createJobPostNextzen,
  getAllJobsNextzen,
  deleteJobPostNextzen,
  getJobDetailsNextzen,
  getJobOptionsNextzen,
} from "../api/recruitment-nextzen";

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
  // Loop through all attached components and trigger their local state updates
  sharedListeners.forEach((listener) => listener());
};

export function useJobPostsNextzen() {
  const [jobs, setJobs] = useState(sharedJobs);
  const [pagination, setPagination] = useState(sharedPagination);
  const [loading, setLoading] = useState(sharedLoading);
  const [error, setError] = useState(sharedError);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      // Spread copies force React to re-render
      setJobs([...sharedJobs]);
      setPagination({ ...sharedPagination });
      setLoading(sharedLoading);
      setError(sharedError);
    };

    sharedListeners.push(listener);
    listener(); // initial sync

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

      const result = await getAllJobsNextzen(queryParams);

      sharedJobs = result?.jobs || [];
      sharedPagination = {
        totalJobs: result?.totalJobs || 0,
        totalPages: result?.totalPages || 1,
        currentPage: result?.page || result?.currentPage || 1,
        limit: result?.limit || 10,
      };
      sharedError = null;
    } catch (err) {
      sharedError = err.message || "Failed to fetch Nextzen jobs";
    } finally {
      sharedLoading = false;
      notify();
    }
  }, []);

  /* ================= FETCH JOB OPTIONS (For Dropdowns) ================= */
  const fetchJobOptions = useCallback(async (page = 1) => {
    try {
      sharedLoading = true;
      notify();
      const result = await getJobOptionsNextzen(page);
      return result.jobs; // Returns array of { _id, title }
    } catch (err) {
      sharedError = err.message;
      notify();
      return [];
    } finally {
      sharedLoading = false;
      notify();
    }
  }, []);

  /* ================= SUBMIT JOB ================= */
  const submitJob = useCallback(
    async (jobData) => {
      try {
        sharedLoading = true;
        notify();
        const response = await createJobPostNextzen(jobData);

        // Refresh the job list with the new post
        await fetchJobs({ page: 1 });

        return response;
      } catch (err) {
        sharedError = err.message || "Failed to create Nextzen job post";
        notify();
        throw err;
      } finally {
        sharedLoading = false;
        notify();
      }
    },
    [fetchJobs]
  );

  /* ================= DELETE JOB ================= */
  const deleteJob = useCallback(
    async (jobId) => {
      const previousJobs = [...sharedJobs];

      try {
        // 1. Optimistic update — remove from UI immediately
        sharedJobs = sharedJobs.filter((job) => job._id !== jobId);
        notify();

        // 2. Perform actual deletion on server
        await deleteJobPostNextzen(jobId);

        // 3. Re-fetch to sync with database (corrects pagination counts)
        await fetchJobs({ page: sharedPagination.currentPage });
      } catch (err) {
        // Restore on failure
        sharedJobs = previousJobs;
        sharedError = err.message || "Failed to delete Nextzen job post";
        notify();
        throw err;
      }
    },
    [fetchJobs]
  );

  /* ================= FETCH SINGLE JOB ================= */
  const fetchSingleJob = useCallback(async (id) => {
    try {
      sharedLoading = true;
      notify();
      const result = await getJobDetailsNextzen(id);
      return result;
    } catch (err) {
      sharedError = err.message;
      notify();
      throw err;
    } finally {
      sharedLoading = false;
      notify();
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
    fetchJobOptions,
  };
}