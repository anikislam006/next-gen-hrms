import { useState, useEffect } from "react";
import { fetchEmployees } from "../api/employees";

export const useEmployees = (initialPage = 1) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completedTotal, setCompletedTotal] = useState(0);

  const loadEmployees = async (page = currentPage, search = searchTerm) => {
    setLoading(true);
    try {
      const data = await fetchEmployees(page, search);

      setEmployees(data.data);
      setTotalPages(data.totalPages || 1);

      // ✅ FIXED
      if (data?.counts?.statusCounts?.completed !== undefined) {
        setCompletedTotal(data.counts.statusCounts.completed);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchTerm]);

  return {
    employees,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    loadEmployees,
    completedTotal,
    loading,
  };
};
