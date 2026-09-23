"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Loader2, 
  Star, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  RefreshCcw,
  Mail,
  MapPin,
  Briefcase,
  Clock
} from "lucide-react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Separate Dialog Components
import AppliedDialog from "./AppliedDialog";
import ScreeningDialog from "./ScreeningDialog";
import AssessmentDialog from "./AssessmentDialog";
import InterviewDialog from "./InterviewDialog";
import FinalReviewDialog from "./FinalReviewDialog";
import OfferDialog from "./OfferDialog";
import HiredDialog from "./HiredDialog";

const STAGES = [
  { key: "Applied", label: "Applied", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "Screening", label: "Screening", color: "bg-blue-500 text-white border-blue-600" },
  { key: "Assessment", label: "Assessment", color: "bg-purple-500 text-white border-purple-600" },
  { key: "Interview", label: "Interview", color: "bg-amber-500 text-white border-amber-600" },
  { key: "Final Review", label: "Final Review", color: "bg-orange-500 text-white border-orange-600" },
  { key: "Offer", label: "Offer", color: "bg-emerald-500 text-white border-emerald-600" },
  { key: "Hired", label: "Hired", color: "bg-teal-600 text-white border-teal-700" },
  { key: "Rejected", label: "Rejected", color: "bg-red-500 text-white border-red-600" },
  { key: "Inventory", label: "Inventory", color: "bg-indigo-500 text-white border-indigo-600" },
];

const SOURCE_OPTIONS = [
  { value: "Career Site", label: "Career Site" },
  { value: "Referral", label: "Referral" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Job Board", label: "Job Board" },
  { value: "Indeed", label: "Indeed" },
  { value: "Other", label: "Other" },
];

export default function ListedData() {
  const { fetchAllCandidates, candidates, pagination, loading, error } = useRecruitmentNextzen();
  const { fetchJobOptions } = useJobPostsNextzen();

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Dropdown options & real-time metadata metrics
  const [jobOptions, setJobOptions] = useState([]);
  const [metaCounts, setMetaCounts] = useState({ statuses: {}, jobRoles: {}, sources: {} });

  // 1. Fetch static job dropdown options
  useEffect(() => {
    fetchJobOptions().then((opts) => setJobOptions(opts || []));
  }, [fetchJobOptions]);

  // 2. Fetch candidates & dynamic aggregation counts based on active filters
  const handleFetchData = useCallback(async () => {
    try {
      const response = await fetchAllCandidates({
        page: currentPage,
        search,
        status: statusFilter,
        jobRoleName: jobRoleFilter,
        source: sourceFilter,
      });

      // Update local state with aggregated counts returned from hook response
      if (response && response.metaCounts) {
        setMetaCounts(response.metaCounts);
      }
    } catch (err) {
      console.error("Error reading updated counts:", err);
    }
  }, [currentPage, search, statusFilter, jobRoleFilter, sourceFilter, fetchAllCandidates]);

  useEffect(() => {
    handleFetchData();
  }, [handleFetchData]);

  const handleFilterChange = (type, value) => {
    setCurrentPage(1);
    if (type === "status") setStatusFilter(value);
    if (type === "jobRole") setJobRoleFilter(value);
    if (type === "source") setSourceFilter(value);
  };

  // Helper: Match Score Styles (from Image 2)
  const getMatchScoreStyle = (score) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50/50";
    if (score >= 80) return "text-blue-600 bg-blue-50/50";
    if (score >= 70) return "text-amber-600 bg-amber-50/50";
    return "text-red-500 bg-red-50/50";
  };

  // Helper: Flow/Pillar Status (from Image 2)
  const getProgressStatusStyle = (status) => {
    if (status === "Hired") {
      return { text: "hired", classes: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
    if (status === "Rejected") {
      return { text: "rejected", classes: "bg-zinc-100 text-zinc-600 border-zinc-200" };
    }
    if (status === "Offer" || status === "Final Review") {
      return { text: "ready to-share", classes: "bg-amber-50 text-amber-700 border-amber-100" };
    }
    return { text: "in progress", classes: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  // Dynamically resolve & show active status modal
  const renderStatusDialog = () => {
    if (!isViewOpen || !selectedCandidate) return null;

    const activeJob = {
      _id: selectedCandidate.jobRoleId || selectedCandidate.jobId || "",
      title: selectedCandidate.jobRoleName || "Job Position",
      skills: selectedCandidate.skills || []
    };

    const commonProps = {
      open: isViewOpen,
      onClose: () => {
        setIsViewOpen(false);
        setSelectedCandidate(null);
      },
      person: selectedCandidate,
      job: activeJob
    };

    switch (selectedCandidate.status) {
      case "Applied": return <AppliedDialog {...commonProps} />;
      case "Screening": return <ScreeningDialog {...commonProps} />;
      case "Assessment": return <AssessmentDialog {...commonProps} />;
      case "Interview": return <InterviewDialog {...commonProps} />;
      case "Final Review": return <FinalReviewDialog {...commonProps} />;
      case "Offer": return <OfferDialog {...commonProps} />;
      case "Hired": return <HiredDialog {...commonProps} />;
      default: return null; 
    }
  };

  return (
    <div className="w-full bg-[#f8f9fc] space-y-7 rounded-2xl border border-slate-100">
      
      {/* ── FILTER BAR ── */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 >Filter Applicants</h3>
            </div>
            <span >
              Total Candidates: {pagination.totalItems || 0}
            </span>
          </div>

          <div className="flex flex-row gap-5 w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <Input
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                
              />
            </div>

            {/* Status Selector with Aggregation Counts */}
            <Select  value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pipeline Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem  value="all">All Stages</SelectItem>
                {STAGES.map((s) => {
                  const count = metaCounts.statuses[s.key] || 0;
                  return (
                    <SelectItem  key={s.key} value={s.key}>
                      <div className="flex flex-row justify-between w-full gap-2">
                        <span>{s.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Job Role Selector with Aggregation Counts */}
            <Select value={jobRoleFilter} onValueChange={(val) => handleFilterChange("jobRole", val)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Job Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {jobOptions.map((opt) => {
                  // Fallback match to handle spacing discrepancies (e.g., "Full Stack" vs "Full-Stack")
                  const count = metaCounts.jobRoles[opt.title] || metaCounts.jobRoles[opt.title.trim()] || 0;
                  return (
                    <SelectItem key={opt._id} value={opt.title}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="truncate max-w-[120px]">{opt.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Source Selector with Aggregation Counts */}
            <Select value={sourceFilter} onValueChange={(val) => handleFilterChange("source", val)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {SOURCE_OPTIONS.map((opt) => {
                  const count = metaCounts.sources[opt.value] || 0;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center justify-between gap-10 w-full">
                        <span>{opt.label}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {count}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── DATA PANEL ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-xl">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Fetching candidates...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-xl text-center p-4">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button 
            onClick={handleFetchData} 
            className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition"
          >
            <RefreshCcw className="w-3 h-3" /> Retry Connection
          </button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white">
          <span className="text-3xl mb-2">📂</span>
          <p className="text-sm font-bold text-slate-700">No applicants found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting or widening your filter values.</p>
        </div>
      ) : (
<div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-x-auto">
          {/* Main Table Matching Image 2 */}
          <Table className="w-full text-left border-collapse min-w-[1000px]">
            <TableHeader>
              <TableRow className="border-b border-slate-100 text-xs text-slate-400 uppercase font-bold tracking-wider bg-slate-50/50 hover:bg-transparent">
                <TableHead className="py-4 px-5 text-slate-400 font-bold">Candidate</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Job Role</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Match</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Stage</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Status</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Source</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-bold">Applied</TableHead>
                <TableHead className="py-4 px-5 text-right text-slate-400 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
              {candidates.map((candidate) => {
                const name = candidate.fullName || candidate.name || "Unknown Candidate";
                const email = candidate.email || "—";
                const score = candidate.matchScore ?? 75;
                const statusMeta = getProgressStatusStyle(candidate.status);

                return (
                  <TableRow key={candidate._id} className="hover:bg-slate-50/40 transition-colors border-b border-slate-100">
                    {/* Candidate Identity block */}
                    <TableCell className="py-3 px-5">
                      <div>
                        <div className="font-bold text-slate-800 text-[13.5px]">{name}</div>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">{email}</div>
                      </div>
                    </TableCell>

                    {/* Job Role */}
                    <TableCell className="py-3 px-4 text-slate-500 font-medium">
                      {candidate.jobRoleName || "—"}
                    </TableCell>

                    {/* Score Star Indicator */}
                    <TableCell className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${getMatchScoreStyle(score)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        {score}%
                      </div>
                    </TableCell>

                    {/* Current Pipeline Stage */}
                    <TableCell className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                        STAGES.find((s) => s.key === candidate.status)?.color || "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {candidate.status || "Applied"}
                      </span>
                    </TableCell>

                    {/* Progress Value Status */}
                    <TableCell className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10.5px] rounded-full border font-semibold ${statusMeta.classes}`}>
                        {statusMeta.text}
                      </span>
                    </TableCell>

                    {/* Applicant Source */}
                    <TableCell className="py-3 px-4 text-slate-500">
                      {candidate.source || "—"}
                    </TableCell>

                    {/* Applied Date */}
                    <TableCell className="py-3 px-4 text-slate-400 font-normal">
                      {candidate.createdAt 
                        ? new Date(candidate.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "—"
                      }
                    </TableCell>

                    {/* Action Dialog Activator */}
                    <TableCell className="py-3 px-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setIsViewOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="View pipeline modal details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-700">{pagination.totalPages}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-slate-600 transition shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-slate-600 transition shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render the dynamically selected Dialog overlay modal */}
      {renderStatusDialog()}
    </div>
  );
}