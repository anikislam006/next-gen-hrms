/**
 * Saves the marks and feedback for a specific assessment component
 */
export const saveAssessmentResult = async (assessmentResult) => {
  try {
    const res = await fetch("https://code360.pro/add-assessment-result-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentResult),
    });
    
    const data = await res.json();
    
    if (data.success) {
      return data;
    }
    
    throw new Error(data.message || "Failed to save assessment result");
  } catch (error) {
    console.error("saveAssessmentResult error:", error);
    throw error;
  }
};

/**
 * Fetches a specific assessment result using Job ID and Candidate ID
 * Also handles the matching logic between 'componentId' and 'id'
 */
export const getSpecificAssessmentResult = async (jobRoleId, candidateId) => {
  try {
    const url = `https://code360.pro/specific-assessment-result?jobRoleId=${jobRoleId}&candidateId=${candidateId}`;
    
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      // Return null or handle 404 specifically if the candidate hasn't been graded yet
      if (res.status === 404) return null;
      throw new Error(data.message || "Failed to fetch assessment result");
    }

    return data.data; // Returns the single assessment result document
  } catch (error) {
    console.error("getSpecificAssessmentResult error:", error);
    throw error;
  }
};

/**
 * Updates or creates interview results for a specific candidate and job role.
 * Maps to the app.put("/add-interview-result-put") endpoint.
 */
export const saveInterviewResult = async (interviewData) => {
  try {
    const res = await fetch("https://code360.pro/add-interview-result-put", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interviewData),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to update interview results");
  } catch (error) {
    console.error("saveInterviewResult error:", error);
    throw error;
  }
};

/**
 * Fetches the specific interview/assessment record, including normalized IDs.
 * Maps to the app.get("/specific-interview") endpoint.
 */
export const getSpecificInterview = async (jobRoleId, candidateId) => {
  try {
    const url = `https://code360.pro/specific-interview?jobRoleId=${jobRoleId}&candidateId=${candidateId}`;
    
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 404) return null; // Handle missing records gracefully
      throw new Error(data.message || "Failed to fetch interview details");
    }

    return data.data; // Contains the merged assessment and interview list
  } catch (error) {
    console.error("getSpecificInterview error:", error);
    throw error;
  }
};