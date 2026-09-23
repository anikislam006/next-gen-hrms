"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Users,
  Loader2,
  Edit3,
  Eye,
  Edit,
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import EditEmployeeSalaryDialog from "./EditEmployeeSalaryDialog";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const EmployeeSalaries = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    employees,
    empLoading,
    empPagination,
    loadEmployeePayroll,
    searchTerm,
    setSearchTerm,
  } = usePayroll();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const currentPageFromUrl = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    loadEmployeePayroll({
      page: currentPageFromUrl,
      search: searchTerm,
    });
  }, [currentPageFromUrl, searchTerm, loadEmployeePayroll]);

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > empPagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Search Bar */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardContent className="p-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search salary structures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Salaries Table Card */}
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Employee Salaries
          </CardTitle>
        </CardHeader>
        <CardContent>

          {/* Table */}
          <div className="border border-slate-100 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
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
                {empLoading && employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">
                        Loading salaries...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-500 font-semibold text-sm">
                        No employee salaries found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Start by assigning salary structures to employees
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow
                      key={emp._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-100">
                            {emp.fullName
                              ? emp.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "?"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {emp.fullName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {emp.designation || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-slate-700 text-sm">
                        {emp.department || "N/A"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
                          Grade {emp.matchedPayroll?.grade || "N/A"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-semibold text-slate-700 text-sm">
                        {formatCurrency(emp.basicSalary || 0)}
                      </TableCell>

                      <TableCell className="text-right font-bold text-blue-600 text-sm">
                        {formatCurrency(emp.grossSalary || 0)}
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              toast.info(
                                <div className="space-y-2">
                                  <p className="font-semibold">
                                    {emp.fullName} - Salary Details
                                  </p>
                                  <div className="text-sm space-y-1">
                                    <p>Basic: {formatCurrency(emp.basicSalary)}</p>
                                    <p>House Rent: {formatCurrency(emp.houseRent)}</p>
                                    <p>Medical: {formatCurrency(emp.medicalAllowance)}</p>
                                    <hr className="my-1" />
                                    <p className="font-semibold">
                                      Gross: {formatCurrency(emp.grossSalary)}
                                    </p>
                                  </div>
                                </div>,
                                { duration: 5000 }
                              );
                            }}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(emp)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {employees.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Page {empPagination.currentPage} of {empPagination.totalPages || 1}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={empPagination.currentPage === 1 || empLoading}
                  onClick={() => handlePageChange(empPagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    empPagination.currentPage === empPagination.totalPages || empLoading
                  }
                  onClick={() => handlePageChange(empPagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditEmployeeSalaryDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employee={selectedEmployee}
        onSuccess={() =>
          loadEmployeePayroll({
            page: empPagination.currentPage,
            search: searchTerm,
          })
        }
      />
    </div>
  );
};

export default EmployeeSalaries;