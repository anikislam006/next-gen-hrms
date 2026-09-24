"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  fetchPayrollStructures, 
  createPayrollStructure, 
  deletePayrollStructure,
  fetchEmployeePayroll,
  // --- Existing Salary Setting Imports ---
  fetchSettingSalaries,
  createSettingSalary,
  fetchSettingByEmail,
  // --- New Payroll Record Imports ---
  createPayrollRecords,
  fetchProcessedPayrollRecords,
  fetchPayrollRecordsByEmail,
  deletePayrollRecord,
  updatePayrollStatus,
  fetchPayrollManagementStats
} from "../api/payroll";

/* ================= SHARED STATE (For Cross-Component Sync) ================= */
// Structures State
let sharedStructures = [];
let sharedPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedLoading = false;
let sharedSearchTerm = "";

// Employee State
let sharedEmployees = [];
let sharedEmpPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedEmpLoading = false;
let sharedCounts = { employmentTypeCounts: {}, statusCounts: {}, roleCounts: {} };

// Salary Settings Shared State
let sharedSalarySettings = [];
let sharedSettingsPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedSettingsLoading = false;

// --- New: Processed Payroll Records Shared State ---
let sharedProcessedRecords = [];
let sharedProcessedPagination = { totalItems: 0, totalPages: 1, currentPage: 1 };
let sharedProcessedLoading = false;

// 1. Add to Shared State (Top of file)
let sharedMgmtStats = {
  totalStructures: 0,
  totalEmployees: 0,
  totalSalaryDisbursed: 0,
  averageGrossSalary: 0
};
let sharedStatsLoading = false;

let payrollListeners = [];

/* ================= NOTIFY SYSTEM ================= */
const notifyPayroll = () => {
  payrollListeners.forEach((listener) => listener());
};

export const usePayroll = (initialPage = 1) => {
  // Local state for Structures
  const [structures, setStructures] = useState(sharedStructures);
  const [loading, setLoading] = useState(sharedLoading);
  const [searchTerm, setSearchTerm] = useState(sharedSearchTerm);
  const [currentPage, setCurrentPage] = useState(sharedPagination.currentPage);
  const [totalPages, setTotalPages] = useState(sharedPagination.totalPages);
  const [totalItems, setTotalItems] = useState(sharedPagination.totalItems);

  // Local state for Employees
  const [employees, setEmployees] = useState(sharedEmployees);
  const [empLoading, setEmpLoading] = useState(sharedEmpLoading);
  const [empPagination, setEmpPagination] = useState(sharedEmpPagination);
  const [counts, setCounts] = useState(sharedCounts);

  // Local state for Salary Settings
  const [salarySettings, setSalarySettings] = useState(sharedSalarySettings);
  const [settingsLoading, setSettingsLoading] = useState(sharedSettingsLoading);
  const [settingsPagination, setSettingsPagination] = useState(sharedSettingsPagination);

  // --- New: Local state for Processed Records ---
  const [processedRecords, setProcessedRecords] = useState(sharedProcessedRecords);
  const [processedLoading, setProcessedLoading] = useState(sharedProcessedLoading);
  const [processedPagination, setProcessedPagination] = useState(sharedProcessedPagination);

  const [mgmtStats, setMgmtStats] = useState(sharedMgmtStats);
  const [statsLoading, setStatsLoading] = useState(sharedStatsLoading);
  /* ================= REGISTER LISTENER ================= */
  useEffect(() => {
    const listener = () => {
      // Sync Structures
      setStructures([...sharedStructures]);
      setLoading(sharedLoading);
      setSearchTerm(sharedSearchTerm);
      setCurrentPage(sharedPagination.currentPage);
      setTotalPages(sharedPagination.totalPages);
      setTotalItems(sharedPagination.totalItems);

      // Sync Employees
      setEmployees([...sharedEmployees]);
      setEmpLoading(sharedEmpLoading);
      setEmpPagination({ ...sharedEmpPagination });
      setCounts({ ...sharedCounts });

      // Sync Salary Settings
      setSalarySettings([...sharedSalarySettings]);
      setSettingsLoading(sharedSettingsLoading);
      setSettingsPagination({ ...sharedSettingsPagination });

      // Sync Processed Records
      setProcessedRecords([...sharedProcessedRecords]);
      setProcessedLoading(sharedProcessedLoading);
      setProcessedPagination({ ...sharedProcessedPagination });

      setMgmtStats({ ...sharedMgmtStats });
      setStatsLoading(sharedStatsLoading);
    };

    payrollListeners.push(listener);
    listener(); 

    return () => {
      payrollListeners = payrollListeners.filter((l) => l !== listener);
    };
  }, []);

  /* ================= LOAD STRUCTURES (Original Logic) ================= */
  const loadStructures = useCallback(async (page = sharedPagination.currentPage, search = sharedSearchTerm) => {
    try {
      sharedLoading = true;
      sharedSearchTerm = search;
      notifyPayroll();
      const result = await fetchPayrollStructures(page, search);
      if (result.success) {
        sharedStructures = result.data || [];
        sharedPagination = {
          totalItems: result.pagination?.totalItems || 0,
          totalPages: result.pagination?.totalPages || 1,
          currentPage: result.pagination?.currentPage || page,
        };
      }
    } catch (error) {
      console.error("Payroll Load Error:", error.message);
    } finally {
      sharedLoading = false;
      notifyPayroll();
    }
  }, []);

  /* ================= LOAD EMPLOYEE PAYROLL (Original Logic) ================= */
  const loadEmployeePayroll = useCallback(async (params = {}) => {
    try {
      sharedEmpLoading = true;
      notifyPayroll();
      const result = await fetchEmployeePayroll({
        page: params.page || 1,
        limit: params.limit || 3, 
        search: params.search || sharedSearchTerm,
        department: params.department || "All",
        employmentType: params.employmentType || "Total"
      });
      if (result.success) {
        sharedEmployees = result.data || [];
        sharedCounts = result.counts || sharedCounts;
        sharedEmpPagination = {
          totalItems: result.totalEmployees || 0,
          totalPages: result.totalPages || 1,
          currentPage: result.page || 1,
        };
        notifyPayroll();
        return result; 
      }
      return result;
    } catch (error) {
      console.error("Error:", error);
      return { success: false };
    } finally {
      sharedEmpLoading = false;
      notifyPayroll();
    }
  }, []);

  /* ================= LOAD SALARY SETTINGS ================= */
  const loadSalarySettings = useCallback(async (page = 1) => {
    try {
      sharedSettingsLoading = true;
      notifyPayroll();
      const result = await fetchSettingSalaries(page);
      sharedSalarySettings = result.data || result; 
      sharedSettingsPagination = {
        totalItems: result.totalItems || 0,
        totalPages: result.totalPages || 1,
        currentPage: page,
      };
    } catch (error) {
      console.error("Salary Settings Load Error:", error);
    } finally {
      sharedSettingsLoading = false;
      notifyPayroll();
    }
  }, []);

  /* ================= NEW: LOAD PROCESSED PAYROLL RECORDS ================= */
  /* ================= LOAD PROCESSED PAYROLL RECORDS ================= */
const loadProcessedRecords = useCallback(async (params = {}) => {
  try {
    sharedProcessedLoading = true;
    notifyPayroll();

    const result = await fetchProcessedPayrollRecords({
      page: params.page || 1,
      limit: params.limit || 10,
      email: params.email || "",
      status: params.status || "",
      date: params.date || "",
      department: params.department || "All"
    });

    if (result.success) {
      sharedProcessedRecords = result.data || [];
      sharedProcessedPagination = {
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
        currentPage: result.pagination?.currentPage || params.page || 1,
      };
    }
  } catch (error) {
    console.error("Processed Records Load Error:", error);
  } finally {
    sharedProcessedLoading = false;
    notifyPayroll();
  }
}, []);

  /* ================= ACTIONS ================= */

  const handleAddStructure = useCallback(async (formData) => {
    try {
      sharedLoading = true;
      notifyPayroll();
      const res = await createPayrollStructure(formData);
      if (res.success) {
        await loadStructures(1, sharedSearchTerm);
        await loadEmployeePayroll({ page: 1 });
        return { success: true };
      }
      return res;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      sharedLoading = false;
      notifyPayroll();
    }
  }, [loadStructures, loadEmployeePayroll]);

  const handleDeleteStructure = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this structure?")) return;
    const previousStructures = [...sharedStructures];
    sharedStructures = sharedStructures.filter(s => s._id !== id);
    notifyPayroll();
    try {
      const res = await deletePayrollStructure(id);
      if (res.success) {
        await loadStructures(sharedPagination.currentPage, sharedSearchTerm);
        await loadEmployeePayroll({ page: sharedEmpPagination.currentPage });
        return { success: true };
      }
    } catch (error) {
      sharedStructures = previousStructures;
      notifyPayroll();
      alert(error.message);
      return { success: false };
    }
  }, [loadStructures, loadEmployeePayroll]);

  const handleCreateSalarySetting = useCallback(async (salaryData) => {
    try {
      sharedSettingsLoading = true;
      notifyPayroll();
      const res = await createSettingSalary(salaryData);
      await loadSalarySettings(1);
      return { success: true, data: res };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      sharedSettingsLoading = false;
      notifyPayroll();
    }
  }, [loadSalarySettings]);

  /* ================= NEW: PAYROLL RECORD ACTIONS ================= */
  
  const handleBulkProcessPayroll = useCallback(async (payrollData) => {
    try {
      sharedProcessedLoading = true;
      notifyPayroll();
      const res = await createPayrollRecords(payrollData);
      if (res.success) {
        await loadProcessedRecords(1); // Refresh history table
      }
      return res;
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      sharedProcessedLoading = false;
      notifyPayroll();
    }
  }, [loadProcessedRecords]);

  const handleDeletePayrollRecord = useCallback(async (id) => {
    if (!window.confirm("Delete this processed record?")) return;
    try {
      const res = await deletePayrollRecord(id);
      if (res.success) {
        await loadProcessedRecords(sharedProcessedPagination.currentPage);
      }
      return res;
    } catch (error) {
      alert(error.message);
      return { success: false };
    }
  }, [loadProcessedRecords]);


  // 4. The Stats Loader
  const loadMgmtStats = useCallback(async () => {
    try {
      sharedStatsLoading = true;
      notifyPayroll();
      const result = await fetchPayrollManagementStats();
      if (result.success) {
        sharedMgmtStats = result.data;
      }
    } catch (error) {
      console.error("Load Stats Error:", error);
    } finally {
      sharedStatsLoading = false;
      notifyPayroll();
    }
  }, []);

  // 5. Initial Fetch Trigger
  useEffect(() => {
    loadMgmtStats();
  }, [loadMgmtStats]);

  /* ================= ACTIONS ================= */

  const handleUpdatePayrollStatus = useCallback(async (id, newStatus) => {
    // Optimistic Update: Change status in UI immediately
    const previousRecords = [...sharedProcessedRecords];
    sharedProcessedRecords = sharedProcessedRecords.map(record => 
      record._id === id ? { ...record, status: newStatus } : record
    );
    notifyPayroll();

    try {
      const res = await updatePayrollStatus(id, newStatus);
      if (!res.success) throw new Error(res.message);
      return res;
    } catch (error) {
      // Revert if API fails
      sharedProcessedRecords = previousRecords;
      notifyPayroll();
      return { success: false, message: error.message };
    }
  }, []);

  /* ================= SETTERS ================= */
  const changePage = (page) => {
    sharedPagination.currentPage = page;
    loadStructures(page, sharedSearchTerm);
  };

  const changeSearch = (term) => {
    sharedSearchTerm = term;
    loadStructures(1, term);
    loadEmployeePayroll({ page: 1, search: term });
  };

  /* ================= INITIAL FETCH ================= */
  useEffect(() => {
    if (sharedStructures.length === 0) loadStructures(initialPage, sharedSearchTerm);
    if (sharedEmployees.length === 0) loadEmployeePayroll({ page: 1 });
    if (sharedSalarySettings.length === 0) loadSalarySettings(1);
    if (sharedProcessedRecords.length === 0) loadProcessedRecords(1);
  }, [loadStructures, loadEmployeePayroll, loadSalarySettings, loadProcessedRecords, initialPage]);

  return {
    // Structure Outputs
    structures,
    loading,
    searchTerm,
    setSearchTerm: changeSearch,
    currentPage,
    setCurrentPage: changePage,
    totalPages,
    totalItems,
    
    // Employee Outputs
    employees,
    empLoading,
    empPagination,
    counts,
    loadEmployeePayroll,

    // Salary Settings Outputs
    salarySettings,
    settingsLoading,
    settingsPagination,
    handleCreateSalarySetting,
    handleUpdatePayrollStatus,
    getSalaryByEmail: fetchSettingByEmail, 
    loadSalarySettings,

    // --- New: Processed Payroll Records Outputs ---
    processedRecords,
    processedLoading,
    processedPagination,
    handleBulkProcessPayroll,
    handleDeletePayrollRecord,
    getRecordsByEmail: fetchPayrollRecordsByEmail,
    loadProcessedRecords,

    // Actions
    handleAddStructure,
    handleDeleteStructure,
    refetch: loadStructures,

    mgmtStats,
    statsLoading,
    refreshStats: loadMgmtStats, // Call this after deletions/updates
  };
};