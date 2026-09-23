/* ================= ASSESSMENT API SERVICES ================= */

/**
 * Create a new assessment
 */
export const createAssessment = async (assessmentForm) => {
  try {
    const res = await fetch("https://code360.pro/add-assessment-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentForm),
    });
    
    const data = await res.json();
    if (data.success) return data;
    
    throw new Error(data.message || "Failed to create assessment");
  } catch (error) {
    console.error("createAssessment error:", error);
    throw error;
  }
};


/**
 * Fetch all assessments (Global list)
 */
export const getAllAssessments = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`https://code360.pro/all-assessments?${query}`);
    
    const data = await res.json();
    if (data.success) return data;
    
    throw new Error(data.message || "Failed to fetch assessments");
  } catch (error) {
    console.error("getAllAssessments error:", error);
    throw error;
  }
};

/**
 * Fetch assessments for a specific job role
 */
export const getJobBasedAssessments = async (jobId, params = {}) => {
  try {
    const query = new URLSearchParams({ jobId, ...params }).toString();
    const res = await fetch(`https://code360.pro/job-based-assessments?${query}`);
    
    const data = await res.json();
    if (data.success) return data;
    
    throw new Error(data.message || "Failed to fetch job assessments");
  } catch (error) {
    console.error("getJobBasedAssessments error:", error);
    throw error;
  }
};

/**
 * Delete an assessment by ID
 */
export const deleteAssessment = async (id) => {
  try {
    const res = await fetch(`https://code360.pro/delete-assessment/${id}`, {
      method: "DELETE",
    });
    
    const data = await res.json();
    if (data.success) return data;
    
    throw new Error(data.message || "Failed to delete assessment");
  } catch (error) {
    console.error("deleteAssessment error:", error);
    throw error;
  }
};