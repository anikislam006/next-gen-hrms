"use client";

import React, { useState, useEffect, useCallback } from "react";
import CandidateCard from "./CandidateCard";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import { Loader2, ChevronDown, Inbox, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";

const RECRUITMENT_STAGES = [
  "Applied",
  "Screening",
  "Assessment",
  "Interview",
  "Final Review",
  "Offer",
  "Hired",
];

const StatusLayout = ({ searchTerm, job }) => {
  return (
    <div className="flex gap-6 h-full w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar px-2">
      {RECRUITMENT_STAGES.map((stage) => (
        <KanbanColumn key={stage} stage={stage} searchTerm={searchTerm} job={job} />
      ))}
    </div>
  );
};

// --- INTERNAL COLUMN COMPONENT ---
const KanbanColumn = ({ stage, searchTerm, job }) => {
  const { id: jobId } = useParams();
  const { removeCandidate, changeCandidateStatus, fetchByStatus } = useRecruitment();

  const [candidates, setCandidates] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // --- FETCH DATA FOR THIS SPECIFIC STATUS ---
  const loadStageData = useCallback(
    async (pageNum, isLoadMore = false) => {
      if (!jobId) return;
      setLoading(true);
      try {
        // Now passing searchTerm to the custom hook which calls the API
        const data = await fetchByStatus(jobId, stage, pageNum, 10, searchTerm);

        if (isLoadMore) {
          setCandidates((prev) => [...prev, ...data.candidates]);
        } else {
          setCandidates(data.candidates || []);
        }
        setHasMore(data.hasNextPage);
      } catch (err) {
        console.error(`Error loading ${stage}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [jobId, stage, fetchByStatus, searchTerm]
  );

  // Trigger load when component mounts OR when search term changes
  useEffect(() => {
    setPage(1); // Reset to page 1 for new search
    loadStageData(1, false);
  }, [loadStageData, searchTerm]);

  // --- GLOBAL SYNC LISTENER ---
  useEffect(() => {
    const handleRefresh = () => {
      setPage(1);
      loadStageData(1, false);
    };

    window.addEventListener("refresh-kanban-board", handleRefresh);
    return () => window.removeEventListener("refresh-kanban-board", handleRefresh);
  }, [loadStageData]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadStageData(nextPage, true);
  };

  // --- DRAG AND DROP LOGIC ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverColumn(stage);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOverColumn(null);

    const candidateId = e.dataTransfer.getData("candidateId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    if (candidateId && currentStatus !== stage) {
      try {
        await changeCandidateStatus(candidateId, stage, jobId);
        // Success: the 'refresh-kanban-board' event will sync all columns
      } catch (error) {
        console.error("Move failed:", error);
        loadStageData(1, false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: "bg-blue-500",
      Screening: "bg-indigo-500",
      Assessment: "bg-purple-500",
      Interview: "bg-orange-500",
      "Final Review": "bg-rose-500",
      Offer: "bg-emerald-500",
      Hired: "bg-green-600",
    };
    return colors[status] || "bg-gray-400";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOverColumn(null)}
      onDrop={handleDrop}
      className={`flex-shrink-0 w-[340px] min-h-[1000px] flex flex-col rounded-xl border transition-all duration-300 overflow-hidden relative ${
        dragOverColumn
          ? "bg-indigo-50/50 border-indigo-400 border-dashed ring-4 ring-indigo-100/50"
          : "bg-gray-50/40 border-gray-100"
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-100 bg-white/90 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(stage)} shadow-sm`} />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              {stage}
            </h3>
          </div>
          <span className="bg-slate-100 text-slate-500 text-[11px] font-black px-3 py-1 rounded-xl">
            {candidates.length}{hasMore ? "+" : ""}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-out ${getStatusColor(stage)}`}
            style={{ width: candidates.length > 0 ? "100%" : "8%" }}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {candidates.length > 0 ? (
          <>
            {candidates.map((person) => (
              <CandidateCard
                key={person._id}
                person={person}
                removeCandidate={removeCandidate}
                job={job}
              />
            ))}

            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="group w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    Load More Results
                  </>
                )}
              </button>
            )}
          </>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              {searchTerm ? "No Matches Found" : "Empty Stage"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      {dragOverColumn && (
        <div className="absolute inset-0 pointer-events-none border-2 border-indigo-400 rounded-xl flex items-center justify-center bg-indigo-50/30 backdrop-blur-[2px] z-10">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3 animate-bounce">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-bold text-indigo-600">Move to {stage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusLayout;