"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  createLeaveType, 
  getAllLeaveTypes, 
  deleteLeaveType, 
  updateLeaveType,
  addLeavePolicyDetail,
  getLeavePoliciesDetails,
  updateLeavePolicyDetail,
  getLeavePoliciesByParentId,
  deleteLeavePolicyDetail,
  updateLeaveTypeSettings,
  // New API imports
  submitLeaveRequest, 
  getAllLeaveRequests, 
  getMyLeaveRequests,
  updateLeaveStatus,
  getAllLeaveRequestsByDepartment,
  getLeaveSettingsKPI
} from "../api/leavePolicy";
import { useAuth } from "@/context/AuthContext";

/* ================= SHARED STATE (For Cross-Component Sync) ================= */
let sharedLeavePolicies = [];
let sharedDetailedPolicies = []; 
let sharedFilteredPolicies = []; 
let sharedLeaveRequests = []; 
let sharedMyRequests = [];

let sharedDeptRequests = []; // Add this
let sharedDeptPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };

let sharedLeavePagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedRequestPagination = { totalItems: 0, totalPages: 1, currentPage: 1 }; 

let sharedLeaveLoading = false;
let sharedRequestLoading = false;
let sharedLeaveError = null;
let leaveListeners = [];
let sharedKPI = null; 
/* ================= NOTIFY SYSTEM ================= */
const notifyLeave = () => {
  leaveListeners.forEach((listener) => listener());
};

export function useLeavePolicy() {
  const [leavePolicies, setLeavePolicies] = useState(sharedLeavePolicies);
  const [detailedPolicies, setDetailedPolicies] = useState(sharedDetailedPolicies);
  const [filteredPolicies, setFilteredPolicies] = useState(sharedFilteredPolicies);
  const [leaveRequests, setLeaveRequests] = useState(sharedLeaveRequests);
  const [myRequests, setMyRequests] = useState(sharedMyRequests); // New local state
  const [pagination, setPagination] = useState(sharedLeavePagination);
  const [requestPagination, setRequestPagination] = useState(sharedRequestPagination);
  const [loading, setLoading] = useState(sharedLeaveLoading);
  const [requestLoading, setRequestLoading] = useState(sharedRequestLoading);
  const [error, setError] = useState(sharedLeaveError);
  const [kpiData, setKpiData] = useState(sharedKPI); // 3. Local state for KPI
  const { UserAllDetails } = useAuth();

  const [deptRequests, setDeptRequests] = useState(sharedDeptRequests);
  const [deptPagination, setDeptPagination] = useState(sharedDeptPagination);
  
  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setLeavePolicies([...sharedLeavePolicies]);
      setDetailedPolicies([...sharedDetailedPolicies]);
      setFilteredPolicies([...sharedFilteredPolicies]);
      setLeaveRequests([...sharedLeaveRequests]);
      setMyRequests([...sharedMyRequests]); // Keep sync
      setPagination({ ...sharedLeavePagination });
      setRequestPagination({ ...sharedRequestPagination });
      setLoading(sharedLeaveLoading);
      setRequestLoading(sharedRequestLoading);
      setError(sharedLeaveError);
      setKpiData(sharedKPI);
      setDeptRequests([...sharedDeptRequests]); // Sync dept requests
      setDeptPagination({ ...sharedDeptPagination }); // Sync dept pagination
    };

    leaveListeners.push(listener);
    listener(); // Initial sync

    return () => {
      leaveListeners = leaveListeners.filter((l) => l !== listener);
    };
  }, []);

/* ================= FETCH KPI DATA ================= */
  const fetchLeaveKPI = useCallback(async () => {
    try {
      // Don't set loading to true if we already have data (optional, for smoother UX)
      if (!sharedKPI) sharedLeaveLoading = true; 
      notifyLeave();

      const result = await getLeaveSettingsKPI();
      if (result.success) {
        sharedKPI = result.kpi;
      }
    } catch (err) {
      console.error("Failed to fetch KPI:", err);
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, []);


  /* ================= AUTO-FETCH ON MOUNT ================= */
  useEffect(() => {
    // Only fetch if we don't have data yet to prevent infinite loops
    if (sharedKPI === null) {
      fetchLeaveKPI();
    }
  }, [fetchLeaveKPI]);

  /* ================= FETCH ALL LEAVE TYPES ================= */
  const fetchAllLeavePolicies = useCallback(async (params = {}) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();

      const result = await getAllLeaveTypes(params);

      sharedLeavePolicies = result?.leaveTypes || [];
      sharedLeavePagination = {
        totalItems: result?.pagination?.totalItems || 0,
        totalPages: result?.pagination?.totalPages || 1,
        currentPage: result?.pagination?.currentPage || 1,
      };
      sharedLeaveError = null;
    } catch (err) {
      sharedLeaveError = err.message || "Failed to fetch leave policies";
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, []);

  /* ================= FETCH DETAILED POLICIES ================= */
  const fetchDetailedPolicies = useCallback(async () => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const result = await getLeavePoliciesDetails();
      sharedDetailedPolicies = result?.data || [];
    } catch (err) {
      sharedLeaveError = err.message;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, []);

  /* ================= FETCH POLICIES BY PARENT ID ================= */
  const fetchPoliciesByParentId = useCallback(async (parentId) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const result = await getLeavePoliciesByParentId(parentId);
      sharedFilteredPolicies = result?.data || [];
    } catch (err) {
      sharedLeaveError = err.message;
      sharedFilteredPolicies = [];
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, []);

  /* ================= SUBMIT NEW LEAVE TYPE ================= */
  const submitLeavePolicy = useCallback(async (leaveData) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const response = await createLeaveType(leaveData);
      if (response.success) {
        await fetchAllLeavePolicies({ page: 1 });
      }
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, [fetchAllLeavePolicies]);

  /* ================= UPDATE LEAVE TYPE ================= */
  const updateLeavePolicy = useCallback(async (id, updateData) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const response = await updateLeaveType(id, updateData);
      if (response.success) {
        await fetchAllLeavePolicies({ page: sharedLeavePagination.currentPage });
      }
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, [fetchAllLeavePolicies]);

  /* ================= REMOVE LEAVE TYPE ================= */
  const removeLeavePolicy = useCallback(async (id) => {
    const previousPolicies = [...sharedLeavePolicies];
    try {
      sharedLeavePolicies = sharedLeavePolicies.filter(p => p._id !== id);
      notifyLeave(); 

      const response = await deleteLeaveType(id);
      if (response.success && sharedLeavePagination.totalItems > 0) {
        sharedLeavePagination.totalItems -= 1;
      }
      return response;
    } catch (err) {
      sharedLeavePolicies = previousPolicies;
      sharedLeaveError = err.message;
      notifyLeave();
      throw err;
    }
  }, []);

  /* ================= DETAILED POLICY ACTIONS ================= */
  const addDetailedPolicy = useCallback(async (policyData) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const response = await addLeavePolicyDetail(policyData);
      await fetchDetailedPolicies();
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, [fetchDetailedPolicies]);

  const updateDetailedPolicy = useCallback(async (id, updateData) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const response = await updateLeavePolicyDetail(id, updateData);
      await fetchDetailedPolicies();
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, [fetchDetailedPolicies]);

  const removeDetailedPolicy = useCallback(async (id) => {
    try {
      sharedLeaveLoading = true;
      notifyLeave();
      const response = await deleteLeavePolicyDetail(id);
      if (response.success) {
        await fetchDetailedPolicies();
      }
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedLeaveLoading = false;
      notifyLeave();
    }
  }, [fetchDetailedPolicies]);

  /* ================= LEAVE REQUEST ACTIONS (SUBMISSIONS) ================= */
/* ================= LEAVE REQUEST ACTIONS ================= */
/* ================= LEAVE REQUEST ACTIONS ================= */

  // 1. Move fetchAllRequests UP
const fetchAllRequests = useCallback(async (params = {}) => {
    try {
      sharedRequestLoading = true;
      notifyLeave();
      const result = await getAllLeaveRequests(params);
      // Ensure we are setting an array even if result is empty
      sharedLeaveRequests = result?.data || [];
      sharedRequestPagination = result?.pagination || sharedRequestPagination;
    } catch (err) {
      console.error("Fetch All Error:", err);
      sharedLeaveRequests = []; 
    } finally {
      sharedRequestLoading = false;
      notifyLeave();
    }
  }, []);

 const fetchMyRequests = useCallback(async (email, params = {}) => {
    try {
      sharedRequestLoading = true;
      notifyLeave();
      const result = await getMyLeaveRequests(email, params);
      sharedMyRequests = result?.data || []; // Store in separate shared variable
    } catch (err) {
      console.error("Fetch My Error:", err);
      sharedMyRequests = [];
    } finally {
      sharedRequestLoading = false;
      notifyLeave();
    }
  }, []);

  /* ================= FETCH BY DEPARTMENT ================= */

  const fetchAllRequestsByDepartment = useCallback(async (department, params = {}) => {
    if (!department) return;
    
    try {
      sharedRequestLoading = true;
      notifyLeave();

      // Ensure we import getAllLeaveRequestsByDepartment from your api file
      const result = await getAllLeaveRequestsByDepartment(department, params);

      sharedDeptRequests = result?.data || [];
      sharedDeptPagination = result?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1 };
      sharedLeaveError = null;
    } catch (err) {
      console.error("Fetch Dept Error:", err);
      sharedDeptRequests = [];
      sharedLeaveError = err.message || "Failed to fetch department requests";
    } finally {
      sharedRequestLoading = false;
      notifyLeave();
    }
  }, []);

  // 3. Now createRequest can safely reference fetchAllRequests
  const createRequest = useCallback(async (requestData) => {
    try {
      sharedRequestLoading = true;
      notifyLeave();
      
      const response = await submitLeaveRequest(requestData);
      
      if (response.success) {
        // Now fetchAllRequests is initialized and available!
        await fetchAllRequests({ page: 1, limit: 10 });
      }
      
      return response;
    } catch (err) {
      sharedLeaveError = err.message;
      throw err;
    } finally {
      sharedRequestLoading = false;
      notifyLeave();
    }
  }, [fetchAllRequests]);

  /* ================= SETTINGS ACTIONS ================= */
  const updateTypeSettings = async (id, newSettings) => {
    try {
      const response = await updateLeaveTypeSettings(id, newSettings);
      if (response.success) {
        sharedLeavePolicies = sharedLeavePolicies.map(policy => 
          policy._id === id ? { ...policy, ...newSettings } : policy
        );
        await fetchLeaveKPI();

        notifyLeave();
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };


  /* ================= LEAVE REQUEST ACTIONS (UPDATED) ================= */

  // Add this function below your fetchMyRequests/createRequest functions
// src/app/hook/useLeavePolicy.js

const updateRequestStatus = useCallback(async (id, status, hrRemarks = "") => {
  try {
    sharedRequestLoading = true;
    notifyLeave();

    // Pass UserAllDetails.email as the 'adminEmail'
    const response = await updateLeaveStatus(id, status, hrRemarks, UserAllDetails?.email);

    if (response.success) {
      // Optimistic UI update
      sharedLeaveRequests = sharedLeaveRequests.map((req) =>
        req._id === id ? { ...req, status: status.toLowerCase(), hrRemarks } : req
      );
      
      await fetchAllRequests({ page: sharedRequestPagination.currentPage, limit: 10 });
    }
    return response;
  } catch (err) {
    sharedLeaveError = err.message;
    notifyLeave();
    throw err;
  } finally {
    sharedRequestLoading = false;
    notifyLeave();
  }
}, [fetchAllRequests, UserAllDetails?.email]);

  /* ================= SETTINGS ACTIONS ================= */
  // ... (keep your existing updateTypeSettings)

  return {
    // State
    leavePolicies,
    myRequests, // Return the separate array
    detailedPolicies,
    filteredPolicies,
    leaveRequests, 
    pagination, 
    requestPagination,
    loading,
    requestLoading,
    error,
    kpiData,
    fetchLeaveKPI,
    // Methods for Leave Types
    fetchAllLeavePolicies,
    submitLeavePolicy,
    removeLeavePolicy,
    updateLeavePolicy,
    // Methods for Detailed Rules
    fetchDetailedPolicies,
    fetchPoliciesByParentId,
    addDetailedPolicy,
    updateDetailedPolicy,
    removeDetailedPolicy,
    // Methods for Leave Applications
    createRequest,
    fetchAllRequests,
    fetchMyRequests,
    updateTypeSettings,
    updateRequestStatus,

    deptRequests,          // New state
    deptPagination,        // New pagination
    fetchAllRequestsByDepartment, // New method
  };
}