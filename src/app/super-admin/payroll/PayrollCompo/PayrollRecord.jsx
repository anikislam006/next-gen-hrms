"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight, Loader2, Trash2,
  History, Download,
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import { useAuth } from "@/context/AuthContext";
import { useMyTeam } from "@/app/hook/useMyTeam";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportRowsToCsv } from "@/components/reports/csvExport";

const PayrollRecord = () => {
  const {
    processedRecords,
    processedLoading,
    processedPagination,
    loadProcessedRecords,
    handleDeletePayrollRecord,
    handleUpdatePayrollStatus,
  } = usePayroll();
  const { user } = useAuth();
  const { departments } = useMyTeam();
  // BIZ-PAY-04: only a SuperAdmin login (the CEO account) can give final
  // sign-off as Approved — the database enforces this too, this just avoids
  // offering an option that would be rejected.
  const canApprove = user?.role === "SuperAdmin";
  // BIZ-PAY-05: department-wise preparation and approval — an Admin
  // (department/HR manager) or the SuperAdmin can give the department-level
  // sign-off that has to happen before the CEO's final approval above.
  const canDeptApprove = user?.role === "SuperAdmin" || user?.role === "Admin";

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  // 1. Fetch data when filters or page change
  const fetchFilteredData = useCallback(
    (page = 1) => {
      loadProcessedRecords({
        page,
        limit: 10,
        email: searchTerm,
        status: statusFilter === "all" ? "" : statusFilter,
        date: dateFilter,
        department: departmentFilter,
      });
    },
    [searchTerm, statusFilter, dateFilter, departmentFilter, loadProcessedRecords]
  );

  const handleExportCsv = () => {
    if (!processedRecords.length) {
      toast.error("Nothing to export on this page yet.");
      return;
    }
    exportRowsToCsv(
      "payroll-records",
      [
        { key: "fullName", label: "Name" },
        { key: "department", label: "Department" },
        { key: "period", label: "Period" },
        { key: "grossSalary", label: "Gross Salary" },
        { key: "netSalary", label: "Net Salary" },
        { key: "status", label: "Status" },
      ],
      processedRecords.map((r) => ({ ...r, period: formatPeriod(r.config?.payrollPeriod) }))
    );
  };

  // 2. Initial Load & Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredData(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, dateFilter, fetchFilteredData]);

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
    })}`;
  };

  const formatPeriod = (period) => {
    if (!period) return "N/A";
    const [year, month] = period.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6 bg-white p-5 rounded-xl">

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">Payroll History</h2>
            </div>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Dept Approved">Dept Approved</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            {/* BIZ-PAY-05: department-wise payroll preparation — filter the
                history down to one department at a time */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {(departments || []).map((dept) => (
                  <SelectItem key={dept._id || dept.name} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExportCsv}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Card List */}
      <div className="space-y-4">
        {processedLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8" />
          </div>
        ) : processedRecords.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 font-medium">
            No records found.
          </div>
        ) : (
          processedRecords.map((record) => (
            <div
              key={record._id}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {record.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatPeriod(record.config?.payrollPeriod)} •{" "}
                    {record.department || "General"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Status Dropdown — CEO approval gate is enforced by the database */}
                  <select
                    value={record.status || "Processed"}
                    onChange={async (e) => {
                      const result = await handleUpdatePayrollStatus(record._id, e.target.value);
                      if (result && result.success === false) {
                        toast.error(result.message || "Could not update status");
                      }
                    }}
                    className="text-xs font-bold border-none bg-transparent cursor-pointer focus:ring-0 outline-none text-slate-500"
                  >
                    <option value="Processed">Processed</option>
                    <option
                      value="Dept Approved"
                      disabled={!canDeptApprove || record.status === "Approved" || record.status === "Paid"}
                    >
                      Dept Approved{!canDeptApprove ? " (Admin/SuperAdmin only)" : ""}
                    </option>
                    <option
                      value="Approved"
                      disabled={!canApprove || record.status !== "Dept Approved"}
                    >
                      Approved
                      {!canApprove
                        ? " (SuperAdmin only)"
                        : record.status !== "Dept Approved" && record.status !== "Approved"
                        ? " (needs dept approval first)"
                        : ""}
                    </option>
                    <option value="Paid" disabled={record.status !== "Approved" && record.status !== "Paid"}>
                      Paid{record.status !== "Approved" && record.status !== "Paid" ? " (needs approval first)" : ""}
                    </option>
                  </select>

                  <div className="text-right min-w-[120px]">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(record.netSalary)}
                    </p>
                    <p className="text-sm text-gray-600">Net Salary</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        record.status === "Paid" ? "default" : "secondary"
                      }
                      className={
                        record.status === "Paid" ? "bg-emerald-500" : ""
                      }
                    >
                      {record.status || "Processed"}
                    </Badge>

                    <button
                      onClick={() => handleDeletePayrollRecord(record._id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Page {processedPagination.currentPage} of {processedPagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={processedPagination.currentPage === 1 || processedLoading}
            onClick={() => fetchFilteredData(processedPagination.currentPage - 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            disabled={
              processedPagination.currentPage === processedPagination.totalPages ||
              processedLoading
            }
            onClick={() => fetchFilteredData(processedPagination.currentPage + 1)}
            className="p-2 border rounded-lg bg-white disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollRecord;