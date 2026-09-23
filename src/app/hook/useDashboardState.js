import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardStats, fetchUserDashboardStats } from '../api/dashboardState'; // Adjust the import path as needed

/**
 * Custom hook to manage Dashboard Statistics state and fetching logic.
 * @param {string} email - The email used to fetch user-specific statistics.
 */
export const useDashboardStats = (email) => {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null); // New state for user-specific data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Execute both fetches in parallel for better performance
      const [globalData, userData] = await Promise.all([
        fetchDashboardStats(),
        email ? fetchUserDashboardStats(email) : Promise.resolve(null)
      ]);

      setStats(globalData);
      setUserStats(userData);
    } catch (err) {
      setError(err.message || "An error occurred while fetching dashboard data.");
      console.error("Dashboard Hook Error:", err);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Fetch data automatically when the component mounts or when the email changes
  useEffect(() => {
    getStats();
  }, [getStats]);

  return { 
    stats, 
    userStats, // Exporting the new user-specific stats
    loading, 
    error, 
    refresh: getStats // Export the function so you can manual refresh
  };
};