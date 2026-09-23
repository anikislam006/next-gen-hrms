// lib/api/jobs.js
export async function createJobPost(jobData) {
  try {
    const response = await fetch("https://code360.pro/add-job-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create job post");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function getAllJobs({ page = 1, title, startDate, endDate } = {}) {
  try {
    const query = new URLSearchParams({ page });
    if (title) query.append("title", title);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const response = await fetch(`https://code360.pro/all-job-post?${query.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch jobs");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function deleteJobPost(jobId) {
  try {
    const response = await fetch(`https://code360.pro/delete-job/${jobId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete job post");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Add this to your existing recruitment.js file
export async function getJobDetails(jobId) {
  try {
    const response = await fetch(`https://code360.pro/all-job-post/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch job details");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Add this to your existing recruitment.js or jobs.js
export async function getJobOptions(page = 1) {
  try {
    const response = await fetch(`https://code360.pro/all-job-post-option?page=${page}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch job options");
    }

    return data; // Returns { success, jobs, totalJobs, etc. }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}