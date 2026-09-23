"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  createRecruitmentPost, 
  getAllRecruitments, 
  getJobBasedRecruitments, 
  deleteRecruitment,
  updateRecruitmentStatus,
  // Ensure these are exported from your api file
  
  fetchCandidatesByStatus, 
  moveToInventory,
} from "../api/recruitment-jobs";
import { useAuth } from "@/context/AuthContext";


/* ================= SHARED STATE ================= */
// These variables stay outside the hook to sync data across multiple components
let sharedCandidates = [];
let sharedRecruitmentPagination = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
};
let sharedRecruitmentLoading = false;
let sharedRecruitmentError = null;
let recruitmentListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyRecruitment = () => {
  // Triggers a re-render in every component using this hook
  recruitmentListeners.forEach((listener) => listener());
};

export function useRecruitment() {
  const [candidates, setCandidates] = useState(sharedCandidates);
  const [pagination, setPagination] = useState(sharedRecruitmentPagination);
  const [loading, setLoading] = useState(sharedRecruitmentLoading);
  const [error, setError] = useState(sharedRecruitmentError);
  const { user, UserAllDetails } = useAuth();
  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setCandidates([...sharedCandidates]);
      setPagination({ ...sharedRecruitmentPagination });
      setLoading(sharedRecruitmentLoading);
      setError(sharedRecruitmentError);
    };

    recruitmentListeners.push(listener);
    return () => {
      recruitmentListeners = recruitmentListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= FETCH ALL CANDIDATES ================= */
  const fetchAllCandidates = useCallback(async (params = {}) => {
    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      const result = await getAllRecruitments(params);
      
      sharedCandidates = result?.candidates || [];
      sharedRecruitmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedRecruitmentError = null;
    } catch (err) {
      sharedRecruitmentError = err.message || "Failed to fetch candidates";
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, []);

  /* ================= FETCH CANDIDATES BY JOB ID ================= */
  const fetchCandidatesByJob = useCallback(async (jobId, params = {}) => {
    if (!jobId) return { candidates: [] };

    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      const result = await getJobBasedRecruitments(jobId, params);
      
      sharedCandidates = result?.candidates || [];
      sharedRecruitmentPagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedRecruitmentError = null;
      
      return result; 
    } catch (err) {
      sharedRecruitmentError = err.message;
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, []);

  /* ================= NEW: STATUS-WISE PAGINATION FETCH ================= */
  /**
   * Used by individual Kanban columns. 
   * Returns data directly to the column to maintain independent scroll/pages.
   */


  /* ================= SUBMIT CANDIDATE ================= */
  const submitCandidate = useCallback(async (recruitmentData) => {
    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();
      const response = await createRecruitmentPost(recruitmentData);
      await fetchAllCandidates({ page: 1 }); 
      return response;
    } catch (err) {
      sharedRecruitmentError = err.message || "Failed to add candidate";
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
  }, [fetchAllCandidates]);

  /* ================= DELETE CANDIDATE ================= */
  const removeCandidate = useCallback(async (id) => {
    try {
      // Optimistic Update
      sharedCandidates = sharedCandidates.filter(c => c._id !== id);
      notifyRecruitment(); 

      await deleteRecruitment(id);
      // Refresh global count
      if (sharedRecruitmentPagination.totalItems > 0) {
        sharedRecruitmentPagination.totalItems -= 1;
        notifyRecruitment();
      }
    } catch (err) {
      sharedRecruitmentError = err.message || "Failed to delete candidate";
      await fetchAllCandidates(); 
    }
  }, [fetchAllCandidates]);

  /* ================= UPGRADED: CHANGE STATUS ================= */
  /**
   * Now accepts metadata for rejection reasons/notes.
   */
// Inside your useRecruitment hook
// Inside your useRecruitment hook
const fetchByStatus = useCallback(async (jobId, status, page = 1, limit = 10, search = "") => {
    try {
        // Pass the search term down to the API utility
        const result = await fetchCandidatesByStatus(jobId, status, page, limit, search);
        
        return {
            candidates: result.candidates || [],
            hasNextPage: result.hasNextPage || false,
            total: result.total || 0
        };
    } catch (err) {
        console.error(`Error fetching stage ${status}:`, err);
        // Return empty state so the UI doesn't crash on error
        return { candidates: [], hasNextPage: false, total: 0 }; 
    }
}, []);


const changeCandidateStatus = useCallback(async (id, newStatus, jobId = null, metadata = {}) => {
    
    // 2. CONSTRUCT THE ACTION LOG
    // This captures WHO is doing WHAT and WHEN
    const actionLog = {
      updatedBy: {
        name: user?.displayName || user?.name || "System User",
        email: user?.email,
        role: user?.role,
        designation: UserAllDetails?.designation || "N/A"
      },
      updatedAt: new Date().toISOString(),
      previousMetadata: metadata // Includes rejection reasons, etc.
    };

    try {
      sharedRecruitmentLoading = true;
      notifyRecruitment();

      // 3. SEND TO API
      // We spread the actionLog into the request so the backend can save it
      await updateRecruitmentStatus(id, newStatus, { ...metadata, ...actionLog });

      // 4. UPDATE SHARED STATE (Optimistic UI)
      sharedCandidates = sharedCandidates.map(candidate => 
        candidate._id === id 
          ? { 
              ...candidate, 
              status: newStatus, 
              lastAction: actionLog, // Store the info locally too
              ...metadata 
            } 
          : candidate
      );
      
      window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
      notifyRecruitment(); 
      
      return { success: true };
    } catch (err) {
      sharedRecruitmentError = err.message || "Failed to update status";
      notifyRecruitment();
      throw err;
    } finally {
      sharedRecruitmentLoading = false;
      notifyRecruitment();
    }
    // 5. ADD USER TO DEPENDENCY ARRAY
  }, [user, UserAllDetails]);


/* ================= NEW: SEND TO INVENTORY ================= */
/**
 * Moves a candidate to the "Inventory" status and saves the reason metadata.
 */
const sendToInventory = useCallback(async (id, inventoryData) => {
  try {
    sharedRecruitmentLoading = true;
    notifyRecruitment();

    // 1. API Call using the specialized inventory endpoint
    // Assuming you added moveToInventory to your api file
    await moveToInventory(id, inventoryData);

    // 2. Update Shared State locally for instant UI feedback
    sharedCandidates = sharedCandidates.map(candidate => 
      candidate._id === id 
        ? { 
            ...candidate, 
            status: "Inventory", 
            inventoryDetails: {
              category: inventoryData.reasonCategory,
              reason: inventoryData.detailedReason,
              movedAt: new Date()
            }
          } 
        : candidate
    );

    // 3. Trigger Kanban and UI updates
    window.dispatchEvent(new CustomEvent("refresh-kanban-board"));
    notifyRecruitment();

    return { success: true };
  } catch (err) {
    sharedRecruitmentError = err.message || "Failed to move to inventory";
    notifyRecruitment();
    throw err;
  } finally {
    sharedRecruitmentLoading = false;
    notifyRecruitment();
  }
}, []);

  return {
    candidates,
    pagination,
    loading,
    error,
    fetchAllCandidates,
    fetchCandidatesByJob,
    fetchByStatus,        // New: For column pagination
    submitCandidate,
    removeCandidate,
    changeCandidateStatus, // Upgraded: Supports Rejection Metadata
    sendToInventory
  };
}