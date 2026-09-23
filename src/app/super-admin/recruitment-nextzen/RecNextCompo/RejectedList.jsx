"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, Search, Loader2 } from "lucide-react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

export default function RejectedList() {
  const { fetchByStatus, changeCandidateStatus, loading } = useRecruitmentNextzen();
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 12; // Adjusted to match the image grid (multiples of 3 looks best)

  // ---------------- Load Data ----------------
  const loadRejectedCandidates = useCallback(async () => {
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

      const data = await fetchByStatus("Rejected", params);
      
      setRejectedCandidates(data.candidates || []);
      setHasNextPage(data.hasNextPage || false);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to load rejected candidates:", err);
    }
  }, [currentPage, searchTerm, fetchByStatus]);

  useEffect(() => {
    loadRejectedCandidates();
  }, [loadRejectedCandidates]);

  useEffect(() => {
    const handleGlobalRefresh = () => {
      loadRejectedCandidates();
    };
    window.addEventListener("refresh-kanban-board", handleGlobalRefresh);
    return () => {
      window.removeEventListener("refresh-kanban-board", handleGlobalRefresh);
    };
  }, [loadRejectedCandidates]);

  // ---------------- Revert/Restore Handler ----------------
  const handleRestoreCandidate = async (candidateId, currentJobId) => {
    if (!confirm("Are you sure you want to reinstate this candidate to Applied status?")) return;
    try {
      await changeCandidateStatus(candidateId, "Applied", currentJobId, {
        revertReason: "Reinstated from Rejected list"
      });
    } catch (err) {
      alert(err.message || "Failed to reinstate candidate");
    }
  };

  return (
    <div className="w-full bg-[#f8f9fc] rounded-2xl p-6 shadow-sm border border-slate-100">
      
      {/* Premium Header & Filters Panel */}
      <div className="flex flex-col justify-between gap-4 pb-6 mb-6">
        {/* Title in Red Accent styling as shown in design */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-500 border border-red-100">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-800">
            Rejected Candidates <span className="text-red-500 font-semibold">({totalCount})</span>
          </h2>
        </div>

        {/* Minimal Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search archived profiles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && rejectedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400 mt-3 font-medium">Loading application history...</p>
        </div>
      ) : rejectedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-white/50">
          <span className="text-3xl mb-2">📁</span>
          <p className="text-sm font-semibold text-slate-700">No rejected candidates found</p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Archived profiles will appear here as soon as they are rejected from the pipeline stages.
          </p>
        </div>
      ) : (
        <div>
          {/* Bento Card Grid Layout matches image style (3 Columns on Large screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rejectedCandidates.map((candidate) => {
              const score = candidate.matchScore ?? 75; // Default score percentage
              const candidateName = candidate.fullName || candidate.name || "Unknown Candidate";
              const candidateRole = candidate.jobRoleName || "Senior Full Stack Developer";
              const rejectionLog = candidate.lastAction;
              const reason = candidate.rejectionReason || candidate.previousMetadata?.rejectionReason || "No details or feedback provided.";
              const jobId = candidate.jobRoleId || candidate.jobId || null;

              return (
                <div 
                  key={candidate._id} 
                  className="flex flex-col justify-between bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200/80 transition-all duration-200"
                >
                  {/* Card Content Top half */}
                  <div>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h4 className="font-bold text-slate-800 text-[15px] leading-snug">
                          {candidateName}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          {candidateRole}
                        </p>
                      </div>

                      {/* Pill style match score (Red hue to match image reference) */}
                      <div className="px-2 py-0.5 rounded bg-red-50 border border-red-100 text-[10px] font-bold text-red-500 font-mono">
                        {score}%
                      </div>
                    </div>

                    {/* Detailed Reason Field */}
                    <div className="mt-3.5 mb-6">
                      <p className="text-xs text-slate-500/90 leading-relaxed font-normal min-h-[40px] line-clamp-3">
                        {reason}
                      </p>
                    </div>
                  </div>

                  {/* Reinstate Action Button Container */}
                  <div className="w-full">
                    <button
                      onClick={() => handleRestoreCandidate(candidate._id, jobId)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50/40 border border-blue-200/80 hover:border-blue-300 rounded-lg shadow-sm transition duration-150"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                      Reinstate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table-less Minimal Pagination Controls */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">
              Showing page <span className="font-semibold text-slate-700">{currentPage}</span>
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-600 transition shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNextPage}
                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold text-slate-600 transition shadow-sm"
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