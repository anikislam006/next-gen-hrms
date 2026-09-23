"use client";
import React, { useEffect, useState } from "react";
import {
  Search, ChevronLeft, ChevronRight, Loader2, CheckSquare,
  Square, Loader, Calendar, Percent, Trash2, Users, Eye, Edit,
  PlayCircle,
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const LOCAL_STORAGE_KEY = "payroll_auto_buffer";

const ProcessPayroll = () => {
  const {
    employees,
    empLoading,
    empPagination,
    loadEmployeePayroll,
    searchTerm,
    setSearchTerm,
    handleBulkProcessPayroll,
    processedLoading,
  } = usePayroll();

  // --- 1. Global Settings ---
  const [globalSettings, setGlobalSettings] = useState({
    payrollPeriod: "2026-03",
    overtimeRate: 150,
    includeFestivalBonus: true,
    festivalBonusPercentage: 100,
    applyEpfDeductions: true,
    applyTaxDeductions: true,
  });

  // --- 2. Selection & Individual Data States ---
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferPage, setBufferPage] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedEmployees(parsed);
      } catch (e) {
        console.error("Storage error:", e);
      }
    }
    loadEmployeePayroll({ page: 1, limit: 10 });
  }, [loadEmployeePayroll]);

  const updateStorage = (data) => {
    setSelectedEmployees(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // --- 3. Handlers ---
  const handleClearSelection = () => {
    if (window.confirm("Are you sure you want to clear all selected employees?")) {
      updateStorage([]);
    }
  };

  const startAutoSelectAll = async () => {
    if (selectedEmployees.length > 0) {
      handleClearSelection();
      return;
    }

    setIsBuffering(true);
    const totalPages = empPagination.totalPages;
    let masterBuffer = [];

    try {
      for (let p = 1; p <= totalPages; p++) {
        setBufferPage(p);
        const result = await loadEmployeePayroll({ page: p, limit: 10 });
        const pageData = result?.data || [];

        if (pageData.length > 0) {
          const newBatch = pageData.map((emp) => ({
            ...emp,
            overtimeHours: 0,
            advanceDeduction: 0,
            otherDeductions: 0,
          }));
          const newIds = new Set(newBatch.map((emp) => emp._id));
          masterBuffer = [
            ...masterBuffer.filter((emp) => !newIds.has(emp._id)),
            ...newBatch,
          ];
          updateStorage([...masterBuffer]);
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Selection process interrupted:", error);
    } finally {
      setIsBuffering(false);
      setBufferPage(0);
    }
  };

  const toggleSingleSelect = (emp) => {
    const isAlreadySelected = selectedEmployees.some((s) => s._id === emp._id);
    let updated;
    if (isAlreadySelected) {
      updated = selectedEmployees.filter((i) => i._id !== emp._id);
    } else {
      updated = [
        ...selectedEmployees,
        { ...emp, overtimeHours: 0, advanceDeduction: 0, otherDeductions: 0 },
      ];
    }
    updateStorage(updated);
  };

  const updateIndividualValue = (empId, field, value) => {
    const updated = selectedEmployees.map((emp) =>
      emp._id === empId ? { ...emp, [field]: Number(value) } : emp
    );
    updateStorage(updated);
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) return;
    const finalPayrollData = selectedEmployees.map(({ _id, ...rest }) => ({
      ...rest,
      employeeRefId: _id,
      config: { ...globalSettings },
      status: "Processed",
      processedTimestamp: new Date().toISOString(),
    }));

    try {
      const result = await handleBulkProcessPayroll(finalPayrollData);
      if (result.success) {
        window.alert(`Success! ${selectedEmployees.length} records processed.`);
        updateStorage([]);
      }
    } catch (err) {
      window.alert("Critical server error.");
    }
  };

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* 1. GLOBAL SETTINGS */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardContent className="p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Payroll Period
              </label>
              <Input
                type="month"
                value={globalSettings.payrollPeriod}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, payrollPeriod: e.target.value })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Percent className="w-3 h-3" /> Overtime Rate (%)
              </label>
              <Input
                type="number"
                value={globalSettings.overtimeRate}
                onChange={(e) =>
                  setGlobalSettings({ ...globalSettings, overtimeRate: e.target.value })
                }
                className="h-10"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">
                Include Festival Bonus
              </span>
              <Switch
                checked={globalSettings.includeFestivalBonus}
                onCheckedChange={(val) =>
                  setGlobalSettings({ ...globalSettings, includeFestivalBonus: val })
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Switch
                checked={globalSettings.applyEpfDeductions}
                onCheckedChange={(val) =>
                  setGlobalSettings({ ...globalSettings, applyEpfDeductions: val })
                }
              />
              <span className="text-sm font-semibold text-slate-600">Apply EPF</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={globalSettings.applyTaxDeductions}
                onCheckedChange={(val) =>
                  setGlobalSettings({ ...globalSettings, applyTaxDeductions: val })
                }
              />
              <span className="text-sm font-semibold text-slate-600">Apply Tax</span>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 2. ACTION BAR (search + clear + process) */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedEmployees.length > 0 && (
              <Button
                onClick={handleClearSelection}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear ({selectedEmployees.length})
              </Button>
            )}

            <Button
              onClick={handleProcessPayroll}
              disabled={
                selectedEmployees.length === 0 || isBuffering || processedLoading
              }
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {processedLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Process Payroll
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. TABLE */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden">

        {/* Select all header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <button onClick={startAutoSelectAll} className="outline-none">
              {selectedEmployees.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-300" />
              )}
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Select All Employees
            </span>
          </div>
          {isBuffering && (
            <span className="flex items-center gap-2 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
              <Loader className="w-3 h-3 animate-spin" />
              Scanning Page {bufferPage}...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empLoading && !isBuffering ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8" />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold">
                      No employees found
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  const selectedData = selectedEmployees.find((s) => s._id === emp._id);
                  const isSelected = !!selectedData;

                  return (
                    <React.Fragment key={emp._id}>
                      <TableRow
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <TableCell>
                          <button
                            onClick={() => toggleSingleSelect(emp)}
                            className="outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-100">
                              {emp.fullName
                                ? emp.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                                : "?"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {emp.fullName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                {emp.designation}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-700 text-sm">
                          {emp.department || "General"}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
                            Grade {emp.matchedPayroll?.grade || "N/A"}
                          </span>
                        </TableCell>

                        <TableCell className="text-right font-semibold text-slate-700 text-sm">
                          {formatCurrency(emp.basicSalary)}
                        </TableCell>

                        <TableCell className="text-right font-bold text-blue-600 text-sm">
                          {formatCurrency(emp.grossSalary)}
                        </TableCell>

                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              emp.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-slate-50 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {emp.status || "active"}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSingleSelect(emp)}
                            className={isSelected ? "text-blue-600" : "text-slate-400"}
                          >
                            {isSelected ? (
                              <Edit className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Sub-row for individual adjustments */}
                      {isSelected && (
                        <TableRow className="bg-blue-50/20 hover:bg-blue-50/20">
                          <TableCell colSpan={8} className="p-4">
                            <div className="bg-white border border-blue-100 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  Overtime Hours
                                </label>
                                <Input
                                  type="number"
                                  value={selectedData.overtimeHours}
                                  onChange={(e) =>
                                    updateIndividualValue(emp._id, "overtimeHours", e.target.value)
                                  }
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  Advance Deduction
                                </label>
                                <Input
                                  type="number"
                                  value={selectedData.advanceDeduction}
                                  onChange={(e) =>
                                    updateIndividualValue(emp._id, "advanceDeduction", e.target.value)
                                  }
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                  Other Deductions
                                </label>
                                <Input
                                  type="number"
                                  value={selectedData.otherDeductions}
                                  onChange={(e) =>
                                    updateIndividualValue(emp._id, "otherDeductions", e.target.value)
                                  }
                                  className="h-10"
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50/40">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Page {empPagination.currentPage} of {empPagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={empPagination.currentPage === 1 || isBuffering}
              onClick={() =>
                loadEmployeePayroll({ page: empPagination.currentPage - 1, limit: 10 })
              }
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              disabled={
                empPagination.currentPage === empPagination.totalPages || isBuffering
              }
              onClick={() =>
                loadEmployeePayroll({ page: empPagination.currentPage + 1, limit: 10 })
              }
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProcessPayroll;