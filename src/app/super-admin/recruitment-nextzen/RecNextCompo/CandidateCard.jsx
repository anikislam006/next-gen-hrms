"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Briefcase, Star, FileText, Video, ChevronDown, Eye, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Separate Dialog Components
import AppliedDialog from './AppliedDialog';
import ScreeningDialog from './ScreeningDialog';
import AssessmentDialog from './AssessmentDialog';
import InterviewDialog from './InterviewDialog';
import FinalReviewDialog from './FinalReviewDialog';
import OfferDialog from './OfferDialog';
import HiredDialog from './HiredDialog';

import { useAssessmentNextzen } from "@/app/hook/useAssesmentNextzen";

const STAGES = [
  { key: "Applied", label: "Applied" },
  { key: "Screening", label: "Screening" },
  { key: "Assessment", label: "Assessment" },
  { key: "Interview", label: "Interview" },
  { key: "Final Review", label: "Final Review" },
  { key: "Offer", label: "Offer" },
  { key: "Hired", label: "Hired" },
  { key: "Reject", label: "Reject" },
];

const CandidateCard = ({ candidate, onDragStart, onStatusChange, stagesConfig = STAGES, job }) => {
  const {
    assessments,
    fetchAssessmentsByJob,
  } = useAssessmentNextzen();

  const [isViewOpen, setIsViewOpen] = useState(false);

  // ── Critical Fix: Fetch assessments inside useEffect ──────────────────
  useEffect(() => {
    if (candidate.jobRoleId) {
      fetchAssessmentsByJob(candidate.jobRoleId);
    }
  }, [candidate.jobRoleId, fetchAssessmentsByJob]);

  // ── Logic for CTO Assessment Badge (image_a0bf1e.png) ─────────────────
  const lastFlowStatus = candidate?.assessmentFlow?.[candidate.assessmentFlow.length - 1]?.status;
  const showCtoBadge = lastFlowStatus === "sent_to_review";
  
  const ctoQuestionsCount = useMemo(() => {
    const assessment = assessments?.find(a => a.jobRoleId === candidate.jobRoleId);
    return assessment?.ctoAssessmentTypesList?.length || 0;
  }, [assessments, candidate.jobRoleId]);

  const score = candidate.matchScore ?? Math.min(95, 70 + (candidate.experience || 0) * 3);

  const scoreColor =
    score >= 90 ? "text-emerald-600 bg-emerald-50" :
    score >= 80 ? "text-blue-600 bg-blue-50" :
    score >= 70 ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-50";

  const sourceColor = {
    LinkedIn: "bg-blue-50 text-blue-700",
    Referral: "bg-purple-50 text-purple-700",
    "Career Site": "bg-slate-50 text-slate-700",
    "Job Board": "bg-orange-50 text-orange-700",
    Indeed: "bg-cyan-50 text-cyan-700",
  }[candidate.source] || "bg-slate-50 text-slate-700";

  const renderStatusDialog = () => {
    if (!isViewOpen) return null;
    const activeJob = job || {
      _id: candidate.jobRoleId || candidate.jobId || "",
      title: candidate.jobRoleName || "Job Position",
      skills: candidate.skills || []
    };
    const commonProps = { open: isViewOpen, onClose: () => setIsViewOpen(false), person: candidate, job: activeJob };

    switch (candidate.status) {
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
    <>
      <Card
        draggable
        onDragStart={onDragStart}
        className="candidate-card relative border-slate-100 shadow-sm rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
      >
        {/* CTO Badge from image_a0bf1e.png */}
        {/* CTO Badge from image_a0bf1e.png with Pulse Animation */}
{showCtoBadge && (
  <div className="absolute -top-3 -left-3 z-10">
    <div className="relative flex items-center justify-center">
      {/* Outer Pulse Ring */}
      <div className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
      
      {/* Main Badge Container */}
      <div className="relative bg-indigo-600 p-1.5 rounded-full shadow-lg border border-indigo-400/50 hover:scale-110 transition-transform duration-200">
        <Brain className="w-4 h-4 text-white animate-pulse" />
      </div>

      {/* Red Counter Badge */}
      {ctoQuestionsCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
          {ctoQuestionsCount}
        </div>
      )}
    </div>
  </div>
)}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 truncate">
                {candidate.fullName || "Unknown"}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {candidate.jobRoleName || "—"} 
              </p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${scoreColor} flex-shrink-0`}>
              <Star className="w-2.5 h-2.5" />
              {score}%
            </div>
          </div>

          {/* Location + experience */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
            {candidate.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {candidate.location.split(",")[0]}
              </span>
            )}
            {candidate.experience !== undefined && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Briefcase className="w-3 h-3" />
                {candidate.experience}y
              </span>
            )}
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-blue-700">
              in progress
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${sourceColor}`}>
              {candidate.source || "—"}
            </span>
          </div>

          {/* Note Section from image_a0bf1e.png */}
          <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-2 mb-3">
             <p className="text-[11px] text-purple-700 leading-relaxed line-clamp-2">
                {candidate.lastUpdatedBy?.designation 
                  ? `Last reviewed by ${candidate.lastUpdatedBy.designation}`
                  : `Reviewing technical skills for ${candidate.jobRoleName}...`}
             </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {candidate.testCount || 0} tests
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                {candidate.interviewCount || 0} interviews
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsViewOpen(true); }}
                className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors">
                    Move <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {stagesConfig
                    .filter((s) => s.key !== candidate.status)
                    .map((s) => (
                      <DropdownMenuItem key={s.key} onClick={() => onStatusChange(candidate, s.key)} className="text-xs cursor-pointer">
                        Move to {s.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderStatusDialog()}
    </>
  );
};

export default CandidateCard;