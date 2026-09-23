// useHierarchy.js
import { useState, useCallback } from "react";
import { fetchHierarchy } from "../api/employees";

// Move cache outside the hook to share it across all TreeNode instances
const globalCache = {};

export const useHierarchy = () => {
  const [loading, setLoading] = useState(false);

  const loadNode = useCallback(async (designation, search = "") => {
    const cacheKey = `${designation}_${search}`;
    
    if (globalCache[cacheKey]) return globalCache[cacheKey];

    setLoading(true);
    try {
      const data = await fetchHierarchy(designation, 1, search);
      globalCache[cacheKey] = data;
      return data;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loadNode, loading };
};