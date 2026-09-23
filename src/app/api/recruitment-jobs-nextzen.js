// lib/api/recruitment-jobs-nextzen.js

const BASE_URL = "https://code360.pro";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Create a new recruitment/candidate post (Nextzen)
// ─────────────────────────────────────────────────────────────────────────────
export async function createRecruitmentPostNextzen(recruitmentData) {
  try {
    const response = await fetch(`${BASE_URL}/add-recruitment-post-nextzen`, {
      method: "POST",
      // IMPORTANT: Don't set Content-Type — let the browser handle multipart boundary
      body: recruitmentData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create Nextzen recruitment");
    }
    return data;
  } catch (error) {
    console.error("Nextzen API Error (createRecruitmentPost):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Get all Nextzen recruitments
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllRecruitmentsNextzen({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  status = "all",
  jobRoleName = "all",
  source = "all",
} = {}) {
  try {
    const query = new URLSearchParams({ page });
    
    if (search) query.append("search", search);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    if (status && status !== "all") query.append("status", status);
    if (jobRoleName && jobRoleName !== "all") query.append("jobRoleName", jobRoleName);
    if (source && source !== "all") query.append("source", source);

    const response = await fetch(
      `${BASE_URL}/all-recruitment-post-nextzen?${query.toString()}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Nextzen recruitments");
    }
    return data;
  } catch (error) {
    console.error("Nextzen API Error (getAllRecruitments):", error);
    throw error;
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// 3. Get Nextzen candidates filtered by Job ID
// ─────────────────────────────────────────────────────────────────────────────
export async function getJobBasedRecruitmentsNextzen(
  jobId,
  { page = 1, search = "", startDate = "", endDate = "" } = {}
) {
  try {
    if (!jobId) {
      throw new Error("Job ID is required to fetch specific recruitment posts.");
    }

    const query = new URLSearchParams({
      jobId,
      page: page.toString(),
    });

    if (search) query.append("search", search);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const response = await fetch(
      `${BASE_URL}/job-based-recruitment-post-nextzen?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `Error ${response.status}: Failed to fetch candidates`
      );
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (getJobBasedRecruitments):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Delete a Nextzen candidate by ID
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteRecruitmentNextzen(id) {
  try {
    const response = await fetch(
      `${BASE_URL}/delete-recruitment-nextzen/${id}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete Nextzen recruitment");
    }
    return data;
  } catch (error) {
    console.error("Nextzen API Error (deleteRecruitment):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Update Nextzen candidate status (with optional metadata)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateRecruitmentStatusNextzen(
  id,
  newStatus,
  metadata = {}
) {
  try {
    if (!id || !newStatus) {
      throw new Error("Both Candidate ID and New Status are required.");
    }

    const response = await fetch(
      `${BASE_URL}/update-candidate-status-nextzen/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          ...metadata,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update Nextzen status");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (updateRecruitmentStatus):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Fetch paginated Nextzen candidates by status (Kanban columns)
// ─────────────────────────────────────────────────────────────────────────────


// Fetch paginated Nextzen candidates by status (Kanban columns)
export async function fetchCandidatesByStatusNextzen(
  status,
  { page = 1, limit = 10, search = "", jobRoleName = "", source = "" } = {}
) {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) query.append("search", search);
    if (jobRoleName && jobRoleName !== "all") query.append("jobRoleName", jobRoleName);
    if (source && source !== "all") query.append("source", source);

    const response = await fetch(
      `${BASE_URL}/candidates-by-status-nextzen/${encodeURIComponent(status)}?${query}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch");
    }

    return await response.json();
  } catch (error) {
    console.error("Nextzen Fetch Error (fetchCandidatesByStatus):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Fetch Nextzen candidates filtered by Status and Department
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchCandidatesByDepartmentByStatusNextzen(
  status,
  jobDepartment,
  { page = 1, limit = 10, search = "", jobRoleName = "", source = "" } = {}
) {
  try {
    // Validate required parameters
    if (!status || !jobDepartment) {
      throw new Error("Both Status and Department are required for this fetch.");
    }

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) query.append("search", search);
    if (jobRoleName && jobRoleName !== "all") query.append("jobRoleName", jobRoleName);
    if (source && source !== "all") query.append("source", source);

    // Matches the backend route: /candidates-by-status-nextzen/:status/:jobDepartment
    const response = await fetch(
      `${BASE_URL}/candidates-by-status-nextzen/${encodeURIComponent(status)}/${encodeURIComponent(jobDepartment)}?${query.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch candidates by department and status");
    }

    return await response.json();
  } catch (error) {
    console.error("Nextzen API Error (fetchCandidatesByDepartmentByStatus):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Move Nextzen candidate to Inventory with reason metadata
// ─────────────────────────────────────────────────────────────────────────────
export async function moveToInventoryNextzen(id, { reasonCategory, detailedReason }) {
  try {
    if (!id) throw new Error("Candidate ID is required.");

    const response = await fetch(`${BASE_URL}/move-to-inventory-nextzen/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reasonCategory,
        detailedReason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to move candidate to inventory");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (moveToInventory):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Send for HOD Review (Nextzen)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendToHODReviewNextzen(id, reviewData) {
  try {
    if (!id) throw new Error("Candidate ID is required.");

    const response = await fetch(`${BASE_URL}/send-to-hod-review-nextzen/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData), // This contains the assessmentFlow array
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send to HOD for review");
    }
    return data;
  } catch (error) {
    console.error("Nextzen API Error (sendToHODReview):", error);
    throw error;
  }
}



// PUT: Update the specific candidate's flow status and questions
export async function updateApprovedToHODNextzen(id, payload) {
  try {
    const response = await fetch(`${BASE_URL}/approved-to-hod-cto-review-nextzen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update approval status");
    return data;
  } catch (error) {
    console.error("API Error (updateApprovedToHOD):", error);
    throw error;
  }
}