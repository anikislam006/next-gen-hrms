/**
 * Fetches management dashboard counts including:
 * total structures, total employees, pending leaves, and salary stats.
 */
export const fetchDashboardStats = async () => {
  try {
    const res = await fetch("https://code360.pro/super-admin-dashboard-count");
    
    // Check if the response is actually okay (200-299)
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Server responded with ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      return data.data; // Returning the nested data object for easier use
    } else {
      throw new Error(data.message || "Failed to fetch dashboard statistics");
    }
  } catch (error) {
    console.error("fetchDashboardStats error:", error);
    // Re-throwing so the UI component can catch it and show an error state
    throw error;
  }
};

/**
 * Fetches specific user dashboard statistics including:
 * leave breakdowns, policy totals, request history, and payroll.
 * @param {string} email - The user's email to fetch personal stats for.
 */
export const fetchUserDashboardStats = async (email) => {
  try {
    // Note: Using a template literal to pass the email as a query parameter
    const res = await fetch(`https://code360.pro/user-dashboard-stats?email=${email}`);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Server error: ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      return data.stats; // Returning the 'stats' object directly
    } else {
      throw new Error(data.message || "Failed to fetch user statistics");
    }
  } catch (error) {
    console.error("fetchUserDashboardStats error:", error);
    throw error;
  }
};
