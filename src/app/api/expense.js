const BASE_URL = "https://code360.pro";

// --- CATEGORY APIS (Existing) ---

export const createExpenseCategory = async (categoryData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-expense-category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to create expense category");
  } catch (error) {
    console.error("createExpenseCategory error:", error);
    throw error;
  }
};

export const getAllExpenseCategories = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-expense-categories?${query}`);
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to fetch expense categories");
  } catch (error) {
    console.error("getAllExpenseCategories error:", error);
    throw error;
  }
};

// --- EXPENSE REQUEST APIS (New) ---

/**
 * POST: Submit a new expense request with receipt (File upload)
 * Uses FormData to handle the binary file and text fields together.
 */
export const submitExpenseRequest = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-expense-post`, {
      method: "POST",
      // NOTE: Do NOT set Content-Type header when sending FormData. 
      // The browser will automatically set it with the correct boundary.
      body: formData, 
    });

    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to submit expense request");
  } catch (error) {
    console.error("submitExpenseRequest error:", error);
    throw error;
  }
};

/**
 * GET: Fetch all expense requests with pagination and status counts
 */
export const getAllExpenses = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-all-expenses?${query}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to fetch expenses");
  } catch (error) {
    console.error("getAllExpenses error:", error);
    throw error;
  }
};

export const getAllExpensesByDepartment = async (department = "all", params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const encodedDept = encodeURIComponent(department);
    const res = await fetch(`${BASE_URL}/get-all-expenses/${encodedDept}?${query}`);
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch expenses");
  } catch (error) {
    console.error("getAllExpensesByDepartment error:", error);
    throw error;
  }
};

// 1. Fetch expenses above 15,000
export const getHighTierExpenses = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-all-expenses-above-15k?${query}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch high-tier expenses");
  } catch (error) {
    console.error("getHighTierExpenses error:", error);
    throw error;
  }
};

// 2. Fetch expenses between 7,501 and 15,000
export const getMidTierExpenses = async (department = "all", params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const encodedDept = encodeURIComponent(department);
    const res = await fetch(`${BASE_URL}/get-all-expenses-7501-to-15k/${encodedDept}?${query}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch mid-tier expenses");
  } catch (error) {
    console.error("getMidTierExpenses error:", error);
    throw error;
  }
};

// 3. Fetch expenses up to 7,500
export const getLowTierExpenses = async (department = "all", params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const encodedDept = encodeURIComponent(department);
    const res = await fetch(`${BASE_URL}/get-all-expenses-upto-7500/${encodedDept}?${query}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch low-tier expenses");
  } catch (error) {
    console.error("getLowTierExpenses error:", error);
    throw error;
  }
};

/**
 * Fetch expenses for a specific user by email
 * @param {string} email - The user's email address
 * @param {object} params - Optional filters: { page, limit, search, status, dateRange }
 */
export const getMyExpenses = async (email, params = {}) => {
  try {
    // 1. Convert params object to a query string (e.g., ?page=1&limit=10)
    const query = new URLSearchParams(params).toString();
    
    // 2. Call the new email-specific endpoint
    const res = await fetch(`${BASE_URL}/get-my-expenses/${email}?${query}`);
    
    const data = await res.json();

    // 3. Handle response and errors
    if (res.ok && data.success) {
      return data;
    }
    
    throw new Error(data.message || "Failed to fetch your expenses");
  } catch (error) {
    console.error("getMyExpenses error:", error);
    throw error;
  }
};

/**
 * DELETE: Remove an expense category by ID
 */
export const deleteExpenseCategory = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/delete-expense-category/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to delete expense category");
  } catch (error) {
    console.error("deleteExpenseCategory error:", error);
    throw error;
  }
};

export const updateExpenseStatus = async (id, status, actorDetails = {}) => {
  try {
    const res = await fetch(`${BASE_URL}/update-expense-status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        actorName: actorDetails.name || "",
        actorEmail: actorDetails.email || "",
        actorEmployeeId: actorDetails.employeeId || "",
        actorDesignation: actorDetails.designation || "",
        actorDepartment: actorDetails.department || "",
        note: actorDetails.note || "",
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to update status");
  } catch (error) {
    console.error("updateExpenseStatus error:", error);
    throw error;
  }
};

// GET: Fetch all expenses with status = sent_to_hr (HR Inbox)
export const getExpensesSentToHr = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-expenses-sent-to-hr?${query}`);
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch HR inbox expenses");
  } catch (error) {
    console.error("getExpensesSentToHr error:", error);
    throw error;
  }
};

// GET: Fetch all expenses with status = approved (Finance Inbox)
export const getExpensesApproved = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-expenses-approved?${query}`);
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.error || "Failed to fetch Finance inbox expenses");
  } catch (error) {
    console.error("getExpensesApproved error:", error);
    throw error;
  }
};