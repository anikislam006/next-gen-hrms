// lib/api/recruitment-jobs.js

const BASE_URL = "https://code360.pro";

export async function createRecruitmentPost(recruitmentData) {
  try {
    const response = await fetch(`${BASE_URL}/add-recruitment-post`, {
      method: "POST",
      // IMPORTANT: Remove "Content-Type" header. 
      // Do NOT use JSON.stringify(recruitmentData).
      body: recruitmentData, 
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create recruitment");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function getAllRecruitments({ page = 1, search = "", startDate = "", endDate = "" } = {}) {
  try {
    const query = new URLSearchParams({ page });
    if (search) query.append("search", search);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const response = await fetch(`${BASE_URL}/all-recruitment-post?${query.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch recruitments");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// lib/api/recruitment-jobs.js

/**
 * Fetches candidates filtered by a specific Job ID.
 * @param {string} jobId - The ID of the job post (Required)
 * @param {object} params - Optional filters (page, search, dates)
 */
export async function getJobBasedRecruitments(jobId, { page = 1, search = "", startDate = "", endDate = "" } = {}) {
  try {
    // 1. Validation: Ensure we don't call the API without a Job ID
    if (!jobId) {
      throw new Error("Job ID is required to fetch specific recruitment posts.");
    }

    // 2. Build Query String
    const query = new URLSearchParams({ 
      jobId, // Pass the ID to the backend filter
      page: page.toString() 
    });

    if (search) query.append("search", search);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    // 3. Execute Fetch
    const response = await fetch(
      `${BASE_URL}/job-based-recruitment-post?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache", // Ensures fresh data for recruitment status
        },
      },
    );

    const data = await response.json();

    // 4. Error Handling
    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: Failed to fetch candidates`);
    }

    return data;
  } catch (error) {
    console.error("API Error in getJobBasedRecruitments:", error);
    throw error;
  }
}

export async function deleteRecruitment(id) {
  try {
    const response = await fetch(`${BASE_URL}/delete-recruitment/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete recruitment");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Updates the recruitment status for a specific candidate.
 * @param {string} id - The unique ID of the recruitment/candidate record.
 * @param {string} newStatus - The target status (e.g., "Screening", "Interview", "Hired").
 */
/**
 * Upgraded Status Update: Now supports metadata (like rejection reasons)
 */
export async function updateRecruitmentStatus(id, newStatus, metadata = {}) {
  try {
    if (!id || !newStatus) {
      throw new Error("Both Candidate ID and New Status are required.");
    }

    const response = await fetch(`${BASE_URL}/update-candidate-status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      // Send the status plus any extra info like rejectionReason or rejectionNote
      body: JSON.stringify({ 
        status: newStatus,
        ...metadata 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update recruitment status");
    }

    return data;
  } catch (error) {
    console.error("API Error in updateRecruitmentStatus:", error);
    throw error;
  }
}

/**
 * NEW: Fetch paginated candidates for a specific column/status
 */
export async function fetchCandidatesByStatus(jobId, status, page = 1, limit = 10, search = "") {
  try {
    const query = new URLSearchParams({ 
      status, 
      page: page.toString(), 
      limit: limit.toString() 
    });

    // Add search to the query only if it has a value
    if (search) query.append("search", search);

    const response = await fetch(`${BASE_URL}/candidates-by-status/${jobId}?${query}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch Error in fetchCandidatesByStatus:", error);
    throw error;
  }
}

/**
 * Specialized update to move a candidate to the Inventory stage with reasons.
 * @param {string} id - The unique ID of the candidate record.
 * @param {object} inventoryData - Object containing { reasonCategory, detailedReason }.
 */
export async function moveToInventory(id, { reasonCategory, detailedReason }) {
  try {
    if (!id) throw new Error("Candidate ID is required.");

    const response = await fetch(`${BASE_URL}/move-to-inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        reasonCategory, 
        detailedReason 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to move candidate to inventory");
    }

    return data;
  } catch (error) {
    console.error("API Error in moveToInventory:", error);
    throw error;
  }
}