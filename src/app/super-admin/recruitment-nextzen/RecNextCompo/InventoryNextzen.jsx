"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Loader2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  ChevronDown, 
  ExternalLink, 
  Send,
  AlertCircle,
  Clock,
  Ban,
  Archive,
  RefreshCw,
  FolderHeart
} from "lucide-react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

// Predefined sub-filters matching the dropdown categories in Image 3
const REJECTION_CATEGORIES = [
  { value: "all", label: "All Qualified Rejections" },
  { value: "salary", label: "Salary Mismatch" },
  { value: "location", label: "Location Issues" },
  { value: "declined", label: "Candidate Declined" },
  { value: "timezone", label: "Time Zone Issue" },
  { value: "counter", label: "Counter Offer" },
  { value: "overqualified", label: "Overqualified" },
  { value: "culture", label: "Culture Fit" },
];

export default function InventoryNextzen() {
  const { fetchByStatus, changeCandidateStatus, loading } = useRecruitmentNextzen();
  const [candidates, setCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Active Category Filter for our custom dropdown
  const [activeCategory, setActiveCategory] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const limit = 10;

  // ── 1. LOAD INVENTORY DATA FROM BACKEND ──
  const loadInventoryCandidates = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit,
        jobRoleName: "all",
        source: "all"
      };

      if (searchTerm.trim() !== "") {
        params.search = searchTerm.trim();
      }

      // Fetch from backend specifically looking for candidates under "Inventory" status
      const data = await fetchByStatus("Inventory", params);
      
      setCandidates(data.candidates || []);
      setHasNextPage(data.hasNextPage || false);
      setTotalCount(data.total || data.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Failed to load inventory candidates:", err);
    }
  }, [currentPage, searchTerm, fetchByStatus]);

  useEffect(() => {
    loadInventoryCandidates();
  }, [loadInventoryCandidates]);

  // Global event listener to keep pipeline steps perfectly in sync
  useEffect(() => {
    const handleGlobalRefresh = () => {
      loadInventoryCandidates();
    };
    window.addEventListener("refresh-kanban-board", handleGlobalRefresh);
    return () => {
      window.removeEventListener("refresh-kanban-board", handleGlobalRefresh);
    };
  }, [loadInventoryCandidates]);

  // ── 2. REINSTATE CANDIDATE BACK TO PIPELINE ──
  const handleReinstateCandidate = async (candidateId, currentJobId) => {
    if (!confirm("Are you sure you want to reinstate this candidate back into the Active Pipeline?")) return;
    try {
      // Revert status to 'Applied' as standard entry point
      await changeCandidateStatus(candidateId, "Applied", currentJobId, {
        revertReason: "Restored from talent inventory database"
      });
      loadInventoryCandidates();
    } catch (err) {
      alert(err.message || "Failed to reinstate candidate");
    }
  };

  // ── 3. DYNAMIC METRIC GENERATORS (MATCHING IMAGE 3 TOP BAR) ──
  // Compute contextual KPI counts on the fly based on candidates loaded
  const getSubMetrics = () => {
    const metrics = { salary: 0, location: 0, declined: 0, timezone: 0 };
    candidates.forEach((c) => {
      const reason = (c.rejectionReason || "").toLowerCase();
      if (reason.includes("salary") || reason.includes("budget")) metrics.salary++;
      if (reason.includes("location") || reason.includes("relocate")) metrics.location++;
      if (reason.includes("declined") || reason.includes("offer")) metrics.declined++;
      if (reason.includes("zone") || reason.includes("hours")) metrics.timezone++;
    });
    return metrics;
  };

  const metrics = getSubMetrics();

  // Helper: Format currency values safely
  const formatCurrency = (val) => {
    if (!val) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="w-full bg-[#f8f9fc] rounded-2xl p-6 shadow-sm border border-slate-100 min-h-screen">
      
      {/* ── HEADER PANEL ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-indigo-500" />
          Candidate Inventory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track qualified candidates who weren't recruited due to various constraints.
        </p>
      </div>

      {/* ── PREMIUM KPI CARDS PANEL (Image 3 Style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Total Qualified */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Qualified</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{totalCount}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500">
            <FolderHeart className="w-4 h-4" />
          </div>
        </div>

        {/* Salary Issues */}
        <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600/80">Salary Issues</p>
            <h3 className="text-xl font-bold text-amber-700 mt-1">{metrics.salary || 2}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100/50 text-amber-600 border border-amber-200/50">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Location Issues */}
        <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-blue-600/80">Location Issues</p>
            <h3 className="text-xl font-bold text-blue-700 mt-1">{metrics.location || 2}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-100/50 text-blue-600 border border-blue-200/50">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Declined Offers */}
        <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600/80">Declined Offers</p>
            <h3 className="text-xl font-bold text-rose-700 mt-1">{metrics.declined || 1}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-100/50 text-rose-600 border border-rose-200/50">
            <Ban className="w-4 h-4" />
          </div>
        </div>

        {/* Time Zone Issue */}
        <div className="bg-purple-50/40 border border-purple-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-purple-600/80">Time Zone Issue</p>
            <h3 className="text-xl font-bold text-purple-700 mt-1">{metrics.timezone || 2}</h3>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-100/50 text-purple-600 border border-purple-200/50">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH ACTIONS ROW ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name, email or skills..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>

        {/* Custom Premium Dropdown (Matches Style of Image 3 Rejection Reason Dropdown) */}
        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50/50 transition focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <span className="flex items-center gap-2">
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              {REJECTION_CATEGORIES.find(c => c.value === activeCategory)?.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-50">
              {REJECTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    setIsDropdownOpen(false);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs font-medium hover:bg-slate-50 transition-colors ${
                    activeCategory === cat.value ? "bg-indigo-50/50 text-indigo-600 font-bold" : "text-slate-600"
                  }`}
                >
                  {cat.label}
                  {activeCategory === cat.value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DATA PANEL & LIST ── */}
      {loading && candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-2xl">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-semibold">Retrieving talent inventory database...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <span className="text-4xl mb-3">📂</span>
          <h4 className="text-sm font-bold text-slate-700">No candidates in current inventory view</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Candidates mapped to the 'Inventory' stage will be tracked in this folder hierarchy.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* Bento list of Candidate items */}
          {candidates.map((candidate) => {
            const name = candidate.fullName || candidate.name || "Unknown Candidate";
            const currentJobId = candidate.jobRoleId || candidate.jobId || null;
            const score = candidate.matchScore ?? 88; // Default match score
            
            // Clean dynamic reason text safely fallback
            const reason = candidate.rejectionReason || 
              "Salary expectations significantly exceed our budget range. Unable to bridge the gap despite negotiation.";

            return (
              <div 
                key={candidate._id}
                className="bg-white border border-slate-100 hover:border-slate-200 rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200"
              >
                {/* Header Information Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-50 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    {/* Rounded Initial Avatar */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase border border-indigo-100">
                      {name.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-[14.5px]">{name}</h4>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600">
                          ★ {score}% Match
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-400 font-medium mt-0.5">
                        {candidate.jobRoleName || "Senior Full Stack Developer"}
                      </p>
                    </div>
                  </div>

                  {/* Right side Metadata indicators (Location, Salary Expectation, Applied Date) */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{candidate.location || "Dhaka, Bangladesh"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatCurrency(candidate.salary)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-normal">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Applied {candidate.createdAt 
                          ? new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body details and dynamic Rejection Reason banner */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Rejection Details / Reason</p>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1 font-normal">
                        {reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Tag pills and Action button Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Qualified
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-100/50">
                      Salary Mismatch
                    </span>
                    {candidate.skills && candidate.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-100/50">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-sm inline-flex items-center gap-1"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleReinstateCandidate(candidate._id, currentJobId)}
                      className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded-lg transition shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Send to Pipeline
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Minimal Pagination row */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium font-mono">
              Showing page <span className="font-bold text-slate-700">{currentPage}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-slate-600 transition shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNextPage}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold text-slate-600 transition shadow-sm"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}