const BASE_URL = "https://code360.pro";

/**
 * POST: Create a new interview
 */
export const createInterview = async (interviewData) => {
  try {
    const res = await fetch(`${BASE_URL}/add-interview-post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interviewData),
    });

    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to create interview schedule");
  } catch (error) {
    console.error("createInterview error:", error);
    throw error;
  }
};

/**
 * GET: Fetch all interviews with pagination
 */
export const getAllInterviews = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/get-all-interviews?${query}`);
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to fetch interviews");
  } catch (error) {
    console.error("getAllInterviews error:", error);
    throw error;
  }
};

/**
 * GET: Fetch specific interview by Job and Candidate ID
 */
export const getSpecificInterviewDetails = async (jobId, candidateId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/specific-interview-details?jobId=${jobId}&candidateId=${candidateId}`
    );
    
    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to fetch specific interview");
  } catch (error) {
    console.error("getSpecificInterviewDetails error:", error);
    throw error;
  }
};

/**
 * DELETE: Remove an interview by ID
 */
export const deleteInterview = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/delete-interview/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (res.ok && data.success) return data;
    throw new Error(data.message || "Failed to delete interview");
  } catch (error) {
    console.error("deleteInterview error:", error);
    throw error;
  }
};