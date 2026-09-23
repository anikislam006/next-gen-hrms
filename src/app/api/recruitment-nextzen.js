// lib/api/recruitment-nextzen.js

const BASE_URL = "https://code360.pro";

// ─────────────────────────────────────────────────────────────────────────────
// Create a new Nextzen job post
// ─────────────────────────────────────────────────────────────────────────────
export async function createJobPostNextzen(jobData) {
  try {
    const response = await fetch(`${BASE_URL}/add-job-post-nextzen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create Nextzen job post");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (createJobPost):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch all Nextzen jobs with pagination + filters
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllJobsNextzen({
  page = 1,
  title,
  startDate,
  endDate,
} = {}) {
  try {
    const query = new URLSearchParams({ page });
    if (title) query.append("title", title);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const response = await fetch(
      `${BASE_URL}/all-job-post-nextzen?${query.toString()}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Nextzen jobs");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (getAllJobs):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete a Nextzen job post by ID
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteJobPostNextzen(jobId) {
  try {
    const response = await fetch(`${BASE_URL}/delete-job-nextzen/${jobId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete Nextzen job post");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (deleteJobPost):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get a single Nextzen job's details by ID
// ─────────────────────────────────────────────────────────────────────────────
export async function getJobDetailsNextzen(jobId) {
  try {
    const response = await fetch(`${BASE_URL}/all-job-post-nextzen/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Nextzen job details");
    }

    return data;
  } catch (error) {
    console.error("Nextzen API Error (getJobDetails):", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get lightweight Nextzen job options (id + title only, for dropdowns)
// ─────────────────────────────────────────────────────────────────────────────
export async function getJobOptionsNextzen(page = 1) {
  try {
    const response = await fetch(
      `${BASE_URL}/all-job-post-option-nextzen?page=${page}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch Nextzen job options");
    }

    return data; // { success, jobs, totalJobs, totalPages, page }
  } catch (error) {
    console.error("Nextzen API Error (getJobOptions):", error);
    throw error;
  }
}