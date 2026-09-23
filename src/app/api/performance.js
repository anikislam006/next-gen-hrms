/* ================= PERFORMANCE APPRAISAL API SERVICES ================= */

/**
 * Add a new performance review
 * Sends both Reviewer and Reviewee data to the backend
 */
export const addEmployeeReview = async (reviewData) => {
  try {
    const res = await fetch("https://code360.pro/add-employee-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to submit performance review");
  } catch (error) {
    console.error("addEmployeeReview error:", error);
    throw error;
  }
};

/**
 * Fetch all performance reviews (Global list)
 */
export const getAllPerformanceReviews = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`https://code360.pro/all-performance-reviews?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch performance reviews");
  } catch (error) {
    console.error("getAllPerformanceReviews error:", error);
    throw error;
  }
};

/**
 * Fetch performance reviews for a specific employee
 */
export const getEmployeePerformanceHistory = async (employeeId, params = {}) => {
  try {
    const query = new URLSearchParams({ employeeId, ...params }).toString();
    const res = await fetch(`https://code360.pro/employee-performance-history?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch employee performance history");
  } catch (error) {
    console.error("getEmployeePerformanceHistory error:", error);
    throw error;
  }
};

/**
 * Delete a performance review record by ID
 */
export const deletePerformanceReview = async (id) => {
  try {
    const res = await fetch(`https://code360.pro/delete-performance-review/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to delete performance review");
  } catch (error) {
    console.error("deletePerformanceReview error:", error);
    throw error;
  }
};

/**
 * Fetch employees joined with their performance reviews
 * Backend route: /get-employee-performance
 * Supports: page, search, department, employmentType, status (review status)
 */
export const getEmployeePerformance = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`https://code360.pro/get-employee-performance?${query}`);

    const data = await res.json();
    if (data.success) return data;

    throw new Error(data.message || "Failed to fetch employee performance");
  } catch (error) {
    console.error("getEmployeePerformance error:", error);
    throw error;
  }
};

// Fetch single employee's performance by email
export const getEmployeePerformanceByEmail = async (email, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `https://code360.pro/get-employee-performance-by-email/${encodeURIComponent(
    email
  )}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch employee performance");
  return res.json();
};

// Fetch this user's reviews only (by email)
export const getAllPerformanceReviewsByEmail = async (email, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `https://code360.pro/all-performance-reviews-by-email/${encodeURIComponent(
    email
  )}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch user reviews");
  return res.json();
};