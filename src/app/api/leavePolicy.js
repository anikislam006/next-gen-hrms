/* ================= API BASE URL ================= */
const BASE_URL = "https://code360.pro";

/* ================= LEAVE TYPE SERVICES (Categories) ================= */

/**
 * Create a new leave type category (e.g., Annual, Sick)
 */
export const createLeaveType = async (leaveForm) => {
  try {
    const res = await fetch(`${BASE_URL}/add-leave-type`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leaveForm),
    });

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to create leave type");
  } catch (error) {
    console.error("createLeaveType error:", error);
    throw error;
  }
};

/**
 * Fetch all leave types
 */
export const getAllLeaveTypes = async (params = {}) => {
  try {
    // Construct query parameters including search, page, and limit
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-all-leave-types?${query}`);

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch leave types");
  } catch (error) {
    console.error("getAllLeaveTypes error:", error);
    throw error;
  }
};

/**
 * Update a leave type category
 */
export const updateLeaveType = async (id, updateData) => {
  try {
    const res = await fetch(`${BASE_URL}/update-leave-type/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to update leave policy");
  } catch (error) {
    console.error("updateLeaveType error:", error);
    throw error;
  }
};

/**
 * Delete a leave type
 */
export const deleteLeaveType = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/delete-leave-type/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to delete leave policy");
  } catch (error) {
    console.error("deleteLeaveType error:", error);
    throw error;
  }
};

/* ================= LEAVE POLICY SERVICES (Specific Rules) ================= */

/**
 * Add a specific leave policy/ruleset
 * Corresponds to: app.post("/add-leave-policies")
 */
export const addLeavePolicyDetail = async (policyData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-leave-policies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policyData),
    });

    const data = await res.json();
    if (res.ok || data.success) return data;
    throw new Error(data.error || "Failed to add leave policy details");
  } catch (error) {
    console.error("addLeavePolicyDetail error:", error);
    throw error;
  }
};

/**
 * Get all leave policies (detailed rules)
 * Corresponds to: app.get("/leave-policies")
 */
export const getLeavePoliciesDetails = async () => {
  try {
    const res = await fetch(`${BASE_URL}/leave-policies`);
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.error || "Failed to fetch detailed policies");
  } catch (error) {
    console.error("getLeavePoliciesDetails error:", error);
    throw error;
  }
};

/**
 * Update specific leave policy rules
 * Corresponds to: app.put("/update-leave-policy/:id")
 */
export const updateLeavePolicyDetail = async (id, updateData) => {
  try {
    const res = await fetch(`${BASE_URL}/update-leave-policy/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || data.error || "Failed to update policy detail");
  } catch (error) {
    console.error("updateLeavePolicyDetail error:", error);
    throw error;
  }
};

/**
 * Get leave policies filtered by a specific parentPolicyTypeId
 * Corresponds to: app.get("/leave-policies-grouped/:id")
 */
export const getLeavePoliciesByParentId = async (parentId) => {
  try {
    const res = await fetch(`${BASE_URL}/leave-policies-grouped/${parentId}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    
    throw new Error(data.error || data.message || "Failed to fetch policies for this category");
  } catch (error) {
    console.error("getLeavePoliciesByParentId error:", error);
    throw error;
  }
};

/**
 * Delete a specific leave policy rule (detailed rule)
 * Corresponds to: app.delete("/delete-leave-policy/:id")
 */
export const deleteLeavePolicyDetail = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/delete-leave-policy/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to delete policy rule");
  } catch (error) {
    console.error("deleteLeavePolicyDetail error:", error);
    throw error;
  }
};

export const updateLeaveTypeSettings = async (id, settings) => {
  const res = await fetch(`${BASE_URL}/update-leave-type/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return await res.json();
};

/* ================= LEAVE REQUEST SERVICES (Submissions & History) ================= */

/**
 * Submit a new leave request (The full bundle)
 */
export const submitLeaveRequest = async (requestData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-leave-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to submit leave request");
  } catch (error) {
    console.error("submitLeaveRequest error:", error);
    throw error;
  }
};

/**
 * Get all leave requests (Admin View) with filters and pagination
 */
export const getAllLeaveRequests = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-all-leave-requests?${query}`);
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch all leave requests");
  } catch (error) {
    console.error("getAllLeaveRequests error:", error);
    throw error;
  }
};

export const getAllLeaveRequestsByDepartment = async (department, params = {}) => {
  try {
    // 1. Convert additional filters (page, status, etc.) to a query string
    const query = new URLSearchParams(params).toString();
    
    // 2. Encode the department name to handle spaces and special characters like '&'
    const encodedDepartment = encodeURIComponent(department);

    // 3. Construct the URL with the department in the path and filters in the query
    const url = `${BASE_URL}/get-all-leave-requests-department/${encodedDepartment}?${query}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch department leave requests");
  } catch (error) {
    console.error("getAllLeaveRequestsByDepartment error:", error);
    throw error;
  }
};

/**
 * Get personal leave requests by email with pagination/filters
 */
export const getMyLeaveRequests = async (email, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-my-leave-requests/${email}?${query}`);
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch your leave requests");
  } catch (error) {
    console.error("getMyLeaveRequests error:", error);
    throw error;
  }
};

// src/app/api/leavePolicy.js

// src/app/api/leavePolicy.js
export const updateLeaveStatus = async (id, status, hrRemarks, adminEmail) => {
  try {
    const res = await fetch(`${BASE_URL}/update-leave-status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status, 
        hrRemarks, 
        adminEmail // Pass the email here instead of a token
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to update");
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch KPI statistics for leave settings
 * Corresponds to: app.get("/leave-advance-settings-kpi")
 */
export const getLeaveSettingsKPI = async () => {
  try {
    const res = await fetch(`${BASE_URL}/leave-advance-settings-kpi`);
    const data = await res.json();
    
    if (data.success) return data;
    throw new Error(data.message || "Failed to fetch KPI data");
  } catch (error) {
    console.error("getLeaveSettingsKPI error:", error);
    throw error;
  }
};