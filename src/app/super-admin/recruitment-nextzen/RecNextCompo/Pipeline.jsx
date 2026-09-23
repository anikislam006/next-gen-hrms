"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusLayout from "./StatusLayout";
 import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import RejectedList from "./RejectedList";

const SOURCE_OPTIONS = [
  { value: "all", label: "All Sources" },
  { value: "Career Site", label: "Career Site" },
  { value: "Referral", label: "Referral" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Job Board", label: "Job Board" },
  { value: "Indeed", label: "Indeed" },
  { value: "Other", label: "Other" },
];

const Pipeline = () => {
  const { fetchJobOptions } = useJobPostsNextzen();

  const [search, setSearch] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [jobOptions, setJobOptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // ── Figma-style canvas state ─────────────────────────────────────────────
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // ── Fetch job dropdown options ───────────────────────────────────────────
  useEffect(() => {
    fetchJobOptions().then((opts) => setJobOptions(opts || []));
  }, [fetchJobOptions]);

  // ── Reset view ───────────────────────────────────────────────────────────
  const resetView = () => {
    setScale(1);
    setPosition({ x: 50, y: 50 });
  };

  // ── Pan handlers ─────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    // Skip when interacting with form controls or buttons
    if (
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("[role='combobox']") ||
      e.target.closest(".candidate-card")
    )
      return;

    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  // ── Zoom handler (Ctrl/Cmd + scroll) ─────────────────────────────────────
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSpeed = 0.001;
      const delta = -e.deltaY * zoomSpeed;
      const newScale = Math.min(Math.max(scale + delta, 0.2), 2);
      setScale(newScale);
    }
  };

  // Filters object passed to StatusLayout
  const filters = {
    search,
    jobRoleName: jobRoleFilter,
    source: sourceFilter,
  };

  return (
    <div className="flex flex-col h-[calc(200vh-320px)] space-y-7 rounded-xl overflow-hidden select-none">

      {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
      <div className="z-30 bg-white px-4 py-4 border-b border-slate-100">
        <Card className="border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-row items-stretch md:items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /> */}
                <Input
                  placeholder="Search by name, email, role, or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full bg-slate-50 border-slate-200"
                />
              </div>

              {/* Job Role */}
              <Select value={jobRoleFilter} onValueChange={setJobRoleFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Job Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {jobOptions.map((opt) => (
                    <SelectItem key={opt._id} value={opt.title}>
                      {opt.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Source */}
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">{totalCount}</span>{" "}
                candidates
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── INFINITE CANVAS WORKSPACE ───────────────────────────────────── */}
      <div
        className={`flex-1 relative overflow-hidden transition-colors ${
          isDragging ? "bg-slate-200" : "bg-[#F3F4F6]"
        }`}
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
        {/* Floating zoom controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-xl border border-slate-200">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.1, 0.2))}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="text-[10px] font-bold text-slate-500 w-10 text-center">
            {Math.round(scale * 100)}%
          </div>
          <button
            onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="Reset view"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 ml-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <Hand className="w-3 h-3" /> Drag to Pan
          </div>
        </div>

        {/* Draggable workspace */}
        <div
          className="absolute will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div className="inline-block p-10">
            <div className="min-w-max">
              <StatusLayout
                filters={filters}
                onTotalChange={setTotalCount}
              />
            </div>
          </div>
        </div>
      </div>
      

   <RejectedList></RejectedList>

    </div>
  );
};

export default Pipeline;