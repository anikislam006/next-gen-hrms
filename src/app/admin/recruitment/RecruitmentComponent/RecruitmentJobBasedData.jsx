"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  PlusCircle,
  Target,
  Users,
  BarChart3,
  Archive,
} from "lucide-react";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import { useJobPosts } from "@/app/hook/useRecruitment";
import StatusLayout from "./StatusLayout";
import CreateAssessmentDialog from "./CreateAssessmentDialog";
import InventoryData from "./InventoryData";
import RejectedList from "./RejectedList";
import CreateInterviewDialog from "./CreateInterviewDialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CandidateList from "./CandidateList";

const RecruitmentJobBasedData = ({ job }) => {
  const { id } = useParams();
  const {
    candidates,
    loading: hookLoading,
    fetchCandidatesByJob,
  } = useRecruitment();
  const { fetchSingleJob } = useJobPosts();

  const [jobInfo, setJobInfo] = useState(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline");

  // --- FIGMA WORKSPACE STATE (Infinite Canvas) ---
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const job = await fetchSingleJob(id);
      setJobInfo(job);
      // Fetch general candidates for the job to update counts
      await fetchCandidatesByJob(id, { search: searchTerm });
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [id, searchTerm, fetchSingleJob, fetchCandidatesByJob]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 50, y: 50 });
  };

  // --- PANNING LOGIC ---
  const handleMouseDown = (e) => {
    if (activeTab !== "pipeline") return;
    if (e.target.closest("button") || e.target.closest("input")) return;
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || activeTab !== "pipeline") return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- ZOOM LOGIC ---
  const handleWheel = (e) => {
    if (activeTab !== "pipeline") return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const delta = -e.deltaY * zoomSpeed;
      const newScale = Math.min(Math.max(scale + delta, 0.2), 2);
      setScale(newScale);
    }
  };

  // Tab Counts
  const pipelineCount = candidates.filter(
    (c) => c.status !== "Rejected" && c.status !== "Inventory",
  ).length;
  const inventoryCount = candidates.filter(
    (c) => c.status === "Inventory",
  ).length;

  return (
    <div className="flex flex-col h-screen rounded-xl overflow-hidden select-none">
      {/* --- TOP HEADER & SEARCH (Matching image_7dbf9f.png) --- */}
      <div className="z-30 bg-white px-8 pt-6 pb-4 border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  {/* Main Search Input */}
                  <div className="relative group w-full">
                    <Input
                      placeholder="Search by name, email, role, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11" // Added padding-left to clear the icon
                    />
                  </div>
                </div>

                {/* If you have other selects/buttons, they go here */}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-[10px]">
                ✓
              </div>
              Showing{" "}
              <span className="text-slate-900">
                {candidates.length} candidates
              </span>
            </div>

            {/* --- CUSTOM PILL TABS --- */}
            <div className="flex bg-[#F1F3F7] p-1.5 rounded-[22px] gap-1">
              {[
                {
                  id: "pipeline",
                  label: "Pipeline",
                  icon: Target,
                  count: pipelineCount,
                },
                { id: "list", label: "List", icon: Users, count: null },
                {
                  id: "analytics",
                  label: "Analytics",
                  icon: BarChart3,
                  count: null,
                },
                {
                  id: "inventory",
                  label: "Inventory",
                  icon: Archive,
                  count: inventoryCount,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-md text-[11px] ${
                        activeTab === tab.id
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button onClick={() => setIsAssessmentModalOpen(true)}>
              <PlusCircle className="w-4 h-4" />
              Create Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-grow relative overflow-hidden">
        {activeTab === "pipeline" && (
          <div
            className={`w-full h-full relative overflow-hidden transition-colors ${isDragging ? "bg-gray-200" : "bg-[#F3F4F6]"}`}
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
              backgroundSize: `${10 * scale}px ${10 * scale}px`,
              backgroundPosition: `${position.x}px ${position.y}px`,
            }}
          >
            {/* Zoom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-5 bg-white px-4 py-2 rounded-full shadow-2xl border border-gray-200">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.1, 0.2))}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="text-[10px] font-black text-gray-400 w-10 text-center">
                {Math.round(scale * 100)}%
              </div>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button
                onClick={resetView}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 ml-2 text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                <Hand className="w-3 h-3" /> Drag to Pan
              </div>
            </div>

            {/* Draggable Kanban Container */}
            <div
              className="absolute will-change-transform"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "0 0",
              }}
            >
              <div className="inline-block p-10">
                {hookLoading ? (
                  <div className="flex flex-col items-center justify-center min-h-[500px] w-[1200px] bg-white/40 rounded-3xl border-2 border-dashed border-gray-300">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Rendering Pipeline...
                    </p>
                  </div>
                ) : (
                  <div className="min-w-max">
                    <StatusLayout job={job} searchTerm={searchTerm} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && <InventoryData></InventoryData>}

        {activeTab === "list" && (
          <CandidateList job={job} searchTerm={searchTerm}></CandidateList>
        )}

        {activeTab === "analytics" && (
          /* Create an AnalyticsView component for this */
          <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-[32px] border border-gray-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Recruitment Analytics
            </p>
          </div>
        )}
      </div>

      {/* --- COLLAPSIBLE REJECTED SECTION (Footer) --- */}
      <div className="flex-none bg-white border-t border-gray-200 z-30">
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 list-none">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" /> Rejected
              Candidates
            </span>
            <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="p-6 pt-0 max-h-[300px] overflow-y-auto custom-scrollbar">
            {/* Search Term could also be passed here if needed */}
            <RejectedList />
          </div>
        </details>
      </div>

      {/* --- DIALOGS --- */}
      <CreateAssessmentDialog
        open={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        jobInfo={jobInfo}
        jobId={id}
      />
    </div>
  );
};

export default RecruitmentJobBasedData;
