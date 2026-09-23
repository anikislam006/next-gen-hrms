"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePerformance } from "@/app/hook/usePerformance";
import {
  Search, Users, Loader2, Star, Eye, ChevronRight,
  Clock, AlertCircle, CheckCircle, TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ReviewDialog from "./ReviewDialog";

const PerformanceAppraisals = () => {
  const { UserAllDetails } = useAuth();
  
  const {
    employees,
    pagination,
    loading,
    filters,            
    fetchEmployeePerformance,
  } = usePerformance();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");      // ✅ NEW
  const [designationFilter, setDesignationFilter] = useState("all");    // ✅ NEW
  const [currentPage, setCurrentPage] = useState(1);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // ── data load ──────────────────────────────────────────────────────────────
  const loadEmployees = useCallback(() => {
    fetchEmployeePerformance({
      page: currentPage,
      search: searchTerm,
      status: statusFilter === "all" ? "" : statusFilter,
      department: departmentFilter === "all" ? "" : departmentFilter,
      designation: designationFilter === "all" ? "" : designationFilter,
    });
  }, [currentPage, searchTerm, statusFilter, departmentFilter, designationFilter, fetchEmployeePerformance]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const handleRefresh = () => loadEmployees();
    window.addEventListener("refresh-performance-list", handleRefresh);
    return () => window.removeEventListener("refresh-performance-list", handleRefresh);
  }, [loadEmployees]);

  const handleOpenReview = (emp) => {
    setSelectedEmp(emp);
    setIsReviewOpen(true);
  };

  // ── status badge helper ───────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const map = {
      pending:    { cls: "bg-amber-50 text-amber-700",    icon: Clock,         text: "Manager Review" },
      in_review:  { cls: "bg-blue-50 text-blue-700",      icon: AlertCircle,   text: "Dept Head Review" },
      hr_review:  { cls: "bg-purple-50 text-purple-700",  icon: AlertCircle,   text: "HR Review" },
      ceo_review: { cls: "bg-orange-50 text-orange-700",  icon: AlertCircle,   text: "CEO Review" },
      approved:   { cls: "bg-emerald-50 text-emerald-700",icon: CheckCircle,   text: "Approved" },
      rejected:   { cls: "bg-red-50 text-red-700",        icon: AlertCircle,   text: "Rejected" },
    };
    return map[status] || { cls: "bg-slate-50 text-slate-600", icon: Clock, text: status || "—" };
  };

  // ── workflow strip ────────────────────────────────────────────────────────
  const WorkflowStrip = ({ latestReview }) => {
    const stages = [
      { key: "manager",   label: "Manager",   reviewerName: latestReview?.reviewer?.name || "—" },
      { key: "dept_head", label: "Dept. Head",reviewerName: "—" },
      { key: "hr_head",   label: "HR Head",   reviewerName: "—" },
    ];

    const status = latestReview?.status;
    const currentIndex =
      status === "approved"   ? 3 :
      status === "ceo_review" ? 3 :
      status === "hr_review"  ? 2 :
      status === "in_review"  ? 1 :
      status === "pending"    ? 0 :
      -1;

    return (
      <div className="flex items-start gap-3">
        {stages.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <React.Fragment key={stage.key}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="mb-1.5">
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  )}
                </div>
                <p className={`text-xs font-medium ${
                  isDone ? "text-emerald-600" :
                  isCurrent ? "text-blue-600" :
                  "text-slate-400"
                }`}>
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[80px]">
                  {stage.reviewerName?.length > 12
                    ? stage.reviewerName.slice(0, 10) + "..."
                    : stage.reviewerName}
                </p>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mt-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* MAIN CARD */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Users className="w-5 h-5" />
              Performance Appraisals
              <Badge variant="outline" className="ml-2">
                Management Authority
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>

          {/* Filters — same row layout, just added 2 more dropdowns */}
          <div className="flex items-center flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search appraisals..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="max-w-sm"
              />
            </div>

            <Select
              value={departmentFilter}
              onValueChange={(v) => { setDepartmentFilter(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {filters?.departments?.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={designationFilter}
              onValueChange={(v) => { setDesignationFilter(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Designations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {filters?.designations?.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Manager Review</SelectItem>
                <SelectItem value="in_review">Dept Head Review</SelectItem>
                <SelectItem value="hr_review">HR Review</SelectItem>
                <SelectItem value="ceo_review">CEO Review</SelectItem>
                <SelectItem value="approved">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appraisals List */}
          <div className="space-y-4">
            {loading && employees.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8 mb-2" />
                <p className="text-gray-500">Loading appraisals...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No performance appraisals found</p>
              </div>
            ) : (
              employees.map((emp) => {
                const reviewCount = emp.totalReviews || 0;
                const avgRating = emp.averageRating
                  ? Number(emp.averageRating).toFixed(1)
                  : "0.0";
                const latestReview = emp.latestReview;
                const statusBadge = getStatusBadge(latestReview?.status);
                const StatusIcon = statusBadge.icon;
                const createdDate = latestReview?.createdAt
                  ? new Date(latestReview.createdAt).toLocaleDateString("en-CA")
                  : "—";
                const period = latestReview?.appraisalPeriod || "2024-Annual";
                const apprType = latestReview?.appraisalType || "Annual";

                const managerComments  = latestReview?.feedback || latestReview?.managerComments;
                const deptHeadComments = latestReview?.deptHeadComments;
                const hrComments       = latestReview?.hrComments;
                const ceoComments      = latestReview?.ceoComments;

                return (
                  <Card key={emp._id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">

                        {/* LEFT SECTION */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-slate-600 text-sm">
                              {emp.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "U"}
                            </div>
                            <div>
                              <h3 className="font-semibold">{emp.fullName}</h3>
                              <p className="text-sm text-gray-600">
                                {emp.designation?.replace(/_/g, " ") || "—"} • {emp.department || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <label className="text-xs text-gray-500">Period</label>
                              <p className="text-sm font-medium mt-1">{period}</p>
                              <p className="text-xs text-gray-600 capitalize">{apprType}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Current Rating</label>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">{avgRating}/5.0</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Created</label>
                              <p className="text-sm font-medium mt-1">{createdDate}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Status</label>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge className={statusBadge.cls}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusBadge.text}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="text-xs text-gray-500">Workflow Progress</label>
                            <div className="mt-2">
                              <WorkflowStrip latestReview={latestReview} />
                            </div>
                          </div>

                          {managerComments && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                              <label className="text-xs text-green-700">Manager Assessment</label>
                              <p className="text-sm text-green-800 mt-1">{managerComments}</p>
                            </div>
                          )}

                          {deptHeadComments && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <label className="text-xs text-blue-700">Department Head Review</label>
                              <p className="text-sm text-blue-800 mt-1">{deptHeadComments}</p>
                            </div>
                          )}

                          {hrComments && (
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                              <label className="text-xs text-purple-700">HR Review</label>
                              <p className="text-sm text-purple-800 mt-1">{hrComments}</p>
                            </div>
                          )}

                          {ceoComments && (
                            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                              <label className="text-xs text-orange-700">CEO Review</label>
                              <p className="text-sm text-orange-800 mt-1">{ceoComments}</p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT SECTION — Action Buttons */}
                        <div className="flex flex-row gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReview(emp)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenReview(emp)}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Add Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {employees.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-slate-500">
                Page {pagination?.page || 1} of {pagination?.totalPages || 1} • {pagination?.totalEmployees || 0} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination?.totalPages || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        open={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        selectedEmployee={selectedEmp}
        reviewerData={UserAllDetails}
        refreshEmployees={loadEmployees}
      />
    </div>
  );
};

export default PerformanceAppraisals;