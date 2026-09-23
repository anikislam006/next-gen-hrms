"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Loader2,
  FileText,
  Video,
  Users,
  Search,
  ClipboardCheck,
  Send,
  CheckCircle2,
  XCircle,
  Archive
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";
import CandidateCard from "./CandidateCard";
import { useAuth } from "@/context/AuthContext";

// ── Designations that see ALL candidates (no department filter) ─────────────
const FULL_ACCESS_DESIGNATIONS = ["CEO", "Head_of_HR", "HR_Manager"];

// ── Pipeline stages ──────────────────────────────────────────────────────
const STAGES = [
  {
    key: "Applied",
    label: "Applied",
    icon: Users,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    accent: "bg-slate-300",
  },
  {
    key: "Screening",
    label: "Screening",
    icon: Search,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    accent: "bg-blue-400",
  },
  {
    key: "Assessment",
    label: "Assessment",
    icon: ClipboardCheck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    accent: "bg-purple-400",
  },
  {
    key: "Interview",
    label: "Interview",
    icon: Video,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    accent: "bg-pink-400",
  },
  {
    key: "Final Review",
    label: "Final Review",
    icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "bg-orange-400",
  },
  {
    key: "Offer",
    label: "Offer",
    icon: Send,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    accent: "bg-cyan-400",
  },
  {
    key: "Hired",
    label: "Hired",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500",
  },
  // {
  //   key: "Reject",
  //   label: "Reject",
  //   icon: XCircle,
  //   iconBg: "bg-red-100/80",
  //   iconColor: "text-red-600",
  //   accent: "bg-red-500",
  // },
  {
    key: "Inventory",
    label: "Inventory",
    icon: Archive,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    accent: "bg-indigo-500",
  },
];

const StatusLayout = ({ filters = {}, onTotalChange }) => {
  const { UserAllDetails } = useAuth();
  const designation = UserAllDetails?.designation ?? null;

  // Don't fetch until we know the user's designation
  const authReady = Boolean(designation);

  // ✅ Case-insensitive — true means "use fetchByStatus" (see everything)
  const hasFullAccess = useMemo(() => {
    if (!designation) return false;
    const norm = String(designation).trim().toLowerCase();
    return FULL_ACCESS_DESIGNATIONS.map((d) => d.toLowerCase()).includes(norm);
  }, [designation]);

  const {
    fetchByStatus,
    fetchByStatusByDepartment,
    changeCandidateStatus,
  } = useRecruitmentNextzen();

  const [stageData, setStageData] = useState({});
  const [stageLoading, setStageLoading] = useState({});

  // Drag state
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // ── Load all stages ──────────────────────────────────────────────────────
  const loadAllStages = useCallback(async () => {
    if (!authReady) return;

    setStageLoading(STAGES.reduce((acc, s) => ({ ...acc, [s.key]: true }), {}));

    const params = {
      page: 1,
      limit: 20,
      search: filters.search || "",
      jobRoleName: filters.jobRoleName || "all",
      source: filters.source || "all",
    };

    // ✅ CEO / Head_of_HR / HR_Manager → fetchByStatus (all candidates)
    // ✅ Everyone else → fetchByStatusByDepartment (own dept only)
    const fetcher = (stageKey) => {
      if (hasFullAccess) {
        return fetchByStatus(stageKey, params);
      }
      return fetchByStatusByDepartment(stageKey, params);
    };

    const results = await Promise.all(
      STAGES.map((stage) =>
        fetcher(stage.key).then((res) => ({ stage: stage.key, data: res }))
      )
    );

    const next = {};
    let total = 0;
    results.forEach(({ stage, data }) => {
      next[stage] = data;
      total += data?.total || 0;
    });

    setStageData(next);
    setStageLoading(
      STAGES.reduce((acc, s) => ({ ...acc, [s.key]: false }), {})
    );

    if (onTotalChange) onTotalChange(total);
  }, [
    authReady,
    hasFullAccess,
    fetchByStatus,
    fetchByStatusByDepartment,
    filters.search,
    filters.jobRoleName,
    filters.source,
    onTotalChange,
  ]);

  useEffect(() => {
    loadAllStages();
  }, [loadAllStages]);

  // Auto-refresh on global event
  useEffect(() => {
    const handler = () => loadAllStages();
    window.addEventListener("refresh-kanban-board", handler);
    return () => window.removeEventListener("refresh-kanban-board", handler);
  }, [loadAllStages]);

  // ── Drag and drop ────────────────────────────────────────────────────────
  const handleDragStart = (e, candidate, fromStage) => {
    setDraggedCandidate({ ...candidate, fromStage });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", candidate._id);
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, toStage) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedCandidate) return;
    if (draggedCandidate.fromStage === toStage) {
      setDraggedCandidate(null);
      return;
    }

    // Optimistic UI — move the candidate locally first
    setStageData((prev) => {
      const fromCandidates =
        prev[draggedCandidate.fromStage]?.candidates?.filter(
          (c) => c._id !== draggedCandidate._id
        ) || [];
      const toCandidates = [
        { ...draggedCandidate, status: toStage },
        ...(prev[toStage]?.candidates || []),
      ];

      return {
        ...prev,
        [draggedCandidate.fromStage]: {
          ...prev[draggedCandidate.fromStage],
          candidates: fromCandidates,
          total: Math.max((prev[draggedCandidate.fromStage]?.total || 1) - 1, 0),
        },
        [toStage]: {
          ...prev[toStage],
          candidates: toCandidates,
          total: (prev[toStage]?.total || 0) + 1,
        },
      };
    });

    try {
      await changeCandidateStatus(draggedCandidate._id, toStage);
    } catch (err) {
      console.error("Status change failed — reloading board:", err);
      loadAllStages();
    } finally {
      setDraggedCandidate(null);
    }
  };

  // ── Status change via dropdown (alternative to drag) ─────────────────────
  const handleStatusChange = async (candidate, newStatus) => {
    if (candidate.status === newStatus) return;
    try {
      // Optimistic local move
      setStageData((prev) => {
        const fromCandidates =
          prev[candidate.status]?.candidates?.filter(
            (c) => c._id !== candidate._id
          ) || [];
        const toCandidates = [
          { ...candidate, status: newStatus },
          ...(prev[newStatus]?.candidates || []),
        ];
        return {
          ...prev,
          [candidate.status]: {
            ...prev[candidate.status],
            candidates: fromCandidates,
            total: Math.max((prev[candidate.status]?.total || 1) - 1, 0),
          },
          [newStatus]: {
            ...prev[newStatus],
            candidates: toCandidates,
            total: (prev[newStatus]?.total || 0) + 1,
          },
        };
      });

      await changeCandidateStatus(candidate._id, newStatus);
    } catch (err) {
      console.error("Status change failed:", err);
      loadAllStages();
    }
  };

  const totalAcrossStages = STAGES.reduce(
    (sum, s) => sum + (stageData[s.key]?.total || 0),
    0
  );

  // Show a loading state while auth context resolves
  if (!authReady) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-sm text-slate-500">
          Loading user permissions...
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {STAGES.map((stage) => {
        const Icon = stage.icon;
        const data = stageData[stage.key];
        const candidates = data?.candidates || [];
        const total = data?.total || 0;
        const isLoading = stageLoading[stage.key];
        const isDragOver = dragOverStage === stage.key;

        return (
          <div
            key={stage.key}
            className={`flex flex-col w-[280px] rounded-2xl transition-all ${
              isDragOver ? "ring-2 ring-blue-400 ring-offset-2 bg-blue-50/40" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            {/* Column Header */}
            <Card className="border-slate-100 shadow-sm rounded-xl mb-3 sticky top-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${stage.iconBg}`}>
                      <Icon className={`w-4 h-4 ${stage.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {stage.label}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {total} candidate{total !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {total}
                  </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full ${stage.accent} rounded-full transition-all`}
                    style={{
                      width:
                        totalAcrossStages > 0
                          ? `${Math.min(
                              (total / totalAcrossStages) * 100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Column body */}
            <div className="flex-1 space-y-3 min-h-[200px]">
              {isLoading && candidates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
                  Drop candidates here
                </div>
              ) : (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate._id}
                    candidate={candidate}
                    onDragStart={(e) => handleDragStart(e, candidate, stage.key)}
                    onStatusChange={handleStatusChange}
                    stagesConfig={STAGES}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusLayout;