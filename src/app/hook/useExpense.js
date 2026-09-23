"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  createExpenseCategory, 
  getAllExpenseCategories, 
  deleteExpenseCategory,
  submitExpenseRequest, 
  getAllExpenses,        
  updateExpenseStatus,
  getMyExpenses,
  getHighTierExpenses,
  getMidTierExpenses,
  getLowTierExpenses,
  getAllExpensesByDepartment,
  getExpensesSentToHr,
  getExpensesApproved, 
} from "../api/expense";
import { useAuth } from "@/context/AuthContext";

/* ================= SHARED STATE (Cross-Component Sync) ================= */
let sharedExpenseCategories = [];
let sharedExpenses = []; 
let sharedStats = { pending: 0, approved: 0, reimbursed: 0, total: 0 }; 

let sharedGlobalSummary = { 
  allTimeTotal: 0, 
  thisMonthTotal: 0, 
  lastMonthTotal: 0, 
  totalCount: 0 
};
let sharedFilterSummary = { 
  totalAmount: 0, 
  averagePerExpense: 0, 
  filteredCount: 0 
};

let sharedPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedLoading = false;
let sharedError = null;
let expenseListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyExpense = () => {
  expenseListeners.forEach((listener) => listener());
};

export function useExpense() {
  const [categories, setCategories] = useState(sharedExpenseCategories);
  const [expenses, setExpenses] = useState(sharedExpenses);
  const [stats, setStats] = useState(sharedStats);
  const { UserAllDetails } = useAuth();

  const designation = UserAllDetails?.designation;
  const department = UserAllDetails?.department;
  
  const [globalSummary, setGlobalSummary] = useState(sharedGlobalSummary);
  const [filterSummary, setFilterSummary] = useState(sharedFilterSummary);

  const [pagination, setPagination] = useState(sharedPagination);
  const [loading, setLoading] = useState(sharedLoading);
  const [error, setError] = useState(sharedError);

  /* ================= HELPERS ================= */
  const updateSharedStateFromResponse = useCallback((result) => {
    sharedExpenses = result?.data || [];
    sharedPagination = result?.pagination || sharedPagination;
    sharedStats = result?.stats || sharedStats; 
    sharedGlobalSummary = result?.globalSummary || sharedGlobalSummary;
    sharedFilterSummary = result?.filterSummary || sharedFilterSummary;
    sharedError = null;
  }, []);

  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      setCategories([...sharedExpenseCategories]);
      setExpenses([...sharedExpenses]);
      setStats({ ...sharedStats });
      
      setGlobalSummary({ ...sharedGlobalSummary });
      setFilterSummary({ ...sharedFilterSummary });

      setPagination({ ...sharedPagination });
      setLoading(sharedLoading);
      setError(sharedError);
    };

    expenseListeners.push(listener);
    listener(); 

    return () => {
      expenseListeners = expenseListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= CATEGORY METHODS ================= */

  const fetchAllCategories = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getAllExpenseCategories(params);
      sharedExpenseCategories = result?.data || [];
      sharedPagination = result?.pagination || sharedPagination;
      sharedError = null;
    } catch (err) {
      sharedError = err.message || "Failed to fetch categories";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, []);

  const submitCategory = useCallback(async (categoryData) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const response = await createExpenseCategory(categoryData);
      if (response.success) await fetchAllCategories();
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [fetchAllCategories]);

  const removeCategory = useCallback(async (id) => {
    const previous = [...sharedExpenseCategories];
    try {
      sharedExpenseCategories = sharedExpenseCategories.filter(c => c._id !== id);
      notifyExpense();
      return await deleteExpenseCategory(id);
    } catch (err) {
      sharedExpenseCategories = previous;
      sharedError = err.message;
      notifyExpense();
      throw err;
    }
  }, []);

  /* ================= EXPENSE (REQUESTS) METHODS ================= */

  const fetchAllExpenses = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getAllExpenses(params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse]);

  const fetchExpensesSentToHr = useCallback(async (params = { page: 1, limit: 10 }) => {
  try {
    sharedLoading = true;
    notifyExpense();
    const result = await getExpensesSentToHr(params);
    updateSharedStateFromResponse(result);
  } catch (err) {
    sharedError = err.message || "Failed to fetch HR inbox expenses";
  } finally {
    sharedLoading = false;
    notifyExpense();
  }
}, [updateSharedStateFromResponse]);

const fetchExpensesApproved = useCallback(async (params = { page: 1, limit: 10 }) => {
  try {
    sharedLoading = true;
    notifyExpense();
    const result = await getExpensesApproved(params);
    updateSharedStateFromResponse(result);
  } catch (err) {
    sharedError = err.message || "Failed to fetch Finance inbox expenses";
  } finally {
    sharedLoading = false;
    notifyExpense();
  }
}, [updateSharedStateFromResponse]);

  const fetchExpensesByDepartment = useCallback(async (dept = null, params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      
      // Fallback logic: Priority given to passed dept, then user's dept, then "all" 
      const targetDept = dept ?? department ?? "all"; 
      
      const result = await getAllExpensesByDepartment(targetDept, params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch department expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse, department]);

  const fetchMyExpenses = useCallback(async (email, params = { page: 1, limit: 10 }) => {
    if (!email) return;
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getMyExpenses(email, params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch your expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse]);

  /* ================= TIERED EXPENSE METHODS ================= */

  const fetchHighTierExpenses = useCallback(async (params = { page: 1, limit: 10 }) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const result = await getHighTierExpenses(params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch high-tier expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse]);

  // Department is automatically pulled from logged-in user (UserAllDetails.department)
  // Pass "all" explicitly if you want to bypass department filtering
  const fetchMidTierExpenses = useCallback(async (params = { page: 1, limit: 10 }, dept = null) => {
    try {
      sharedLoading = true;
      notifyExpense();
      // Use explicitly passed dept, else fall back to user's own department, else "all"
      const targetDept = dept ?? department ?? "all";
      const result = await getMidTierExpenses(targetDept, params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch mid-tier expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse, department]);

  const fetchLowTierExpenses = useCallback(async (params = { page: 1, limit: 10 }, dept = null) => {
    try {
      sharedLoading = true;
      notifyExpense();
      // Use explicitly passed dept, else fall back to user's own department, else "all"
      const targetDept = dept ?? department ?? "all";
      const result = await getLowTierExpenses(targetDept, params);
      updateSharedStateFromResponse(result);
    } catch (err) {
      sharedError = err.message || "Failed to fetch low-tier expenses";
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [updateSharedStateFromResponse, department]);

  /* ================= STATUS & SUBMISSION ================= */

  const submitExpense = useCallback(async (formData, refreshFn = fetchAllExpenses) => {
    try {
      sharedLoading = true;
      notifyExpense();
      const response = await submitExpenseRequest(formData);
      if (response.success) {
        await refreshFn({ page: 1, limit: 10 });
      }
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  }, [fetchAllExpenses]);

 const updateStatus = useCallback(
  async (id, newStatus, actorDetails = {}, refreshFn = fetchAllExpenses) => {
    try {
      sharedLoading = true;
      notifyExpense();
      // ✅ Pass actorDetails to the API function
      const response = await updateExpenseStatus(id, newStatus, actorDetails);
      if (response.success) {
        await refreshFn();
      }
      return response;
    } catch (err) {
      sharedError = err.message;
      throw err;
    } finally {
      sharedLoading = false;
      notifyExpense();
    }
  },
  [fetchAllExpenses]
);

  return {
    // State
    categories,
    expenses,
    stats,
    globalSummary,
    filterSummary,
    pagination,
    loading,
    error,
    department,
    designation,
    
    // Category Actions
    fetchAllCategories,
    submitCategory,
    removeCategory,
    
    
    // Expense Actions
    fetchAllExpenses,
    fetchMyExpenses,
    fetchHighTierExpenses,
    fetchMidTierExpenses,
    fetchLowTierExpenses,
    fetchExpensesByDepartment,
    fetchExpensesSentToHr,
    fetchExpensesApproved,
    submitExpense,
    updateStatus
  };
}