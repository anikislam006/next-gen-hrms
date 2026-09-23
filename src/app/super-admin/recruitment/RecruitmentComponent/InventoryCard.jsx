"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Briefcase,
  Star,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import { motion } from "framer-motion";

// Dialog components
import AppliedDialog from "./AppliedDialog";
import ScreeningDialog from "./ScreeningDialog";
import AssessmentDialog from "./AssessmentDialog";
import InterviewDialog from "./InterviewDialog";
import FinalReviewDialog from "./FinalReviewDialog";
import OfferDialog from "./OfferDialog";
import HiredDialog from "./HiredDialog";
import ViewDialog from "./ViewDialog";

const InventoryCard = ({ person, removeCandidate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { changeCandidateStatus } = useRecruitment();

  const matchScore = person.matchScore || 88;

  const appliedDate = person.createdAt
    ? new Date(person.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const onDragStart = (e) => {
    e.dataTransfer.setData("candidateId", person._id);
    e.dataTransfer.setData("currentStatus", person.status);
    e.dataTransfer.effectAllowed = "move";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === person.status) {
      setIsDropdownOpen(false);
      return;
    }
    setIsUpdating(true);
    setIsDropdownOpen(false);
    try {
      await changeCandidateStatus(person._id, newStatus, person.jobId);
      window.dispatchEvent(new Event("refresh-kanban-board"));
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusDialog = () => {
    if (!isViewOpen) return null;
    const commonProps = {
      open: isViewOpen,
      onClose: () => setIsViewOpen(false),
      person: person,
    };

    switch (person.status) {
      case "Inventory":     return <ViewDialog {...commonProps} />;
      case "Applied":       return <AppliedDialog {...commonProps} />;
      case "Screening":     return <ScreeningDialog {...commonProps} />;
      case "Assessment":    return <AssessmentDialog {...commonProps} />;
      case "Interview":     return <InterviewDialog {...commonProps} />;
      case "Final Review":  return <FinalReviewDialog {...commonProps} />;
      case "Offer":         return <OfferDialog {...commonProps} />;
      case "Hired":         return <HiredDialog {...commonProps} />;
      default:              return <AppliedDialog {...commonProps} />;
    }
  };

  return (
    <>
      <motion.div
        draggable
        onDragStart={onDragStart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border rounded-xl p-6 hover:border-blue-200 transition-all shadow-sm"
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">

          {/* ── LEFT: Candidate info ── */}
          <div className="flex-1">

            {/* Avatar + Name row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400">
                {person.fullName?.charAt(0) || <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{person.fullName}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-200">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {matchScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {person.jobRoleName || "—"} • Applied {appliedDate}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                <p className="font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {person.location || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Expected Salary</p>
                <p className="font-bold text-blue-600">
                  ${person.salary?.toLocaleString() || "0"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                <p className="font-medium">{matchScore}/100</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <span className="text-[10px] font-black uppercase text-blue-500">
                  {person.status}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Actions ── */}
          <div className="flex md:flex-col items-end justify-between gap-2">
            <button
              onClick={() => setIsViewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>

            {person.resume && (
              <a
                href={person.resume}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-blue-500 hover:underline"
              >
                VIEW RESUME
              </a>
            )}
          </div>
        </div>

        {/* ── Rejection reason block ── */}
        {person.inventoryDetails?.reason && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Rejection Reason
              </span>
              {person.inventoryDetails?.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-50 text-slate-600 border border-slate-200">
                  {person.inventoryDetails.category.split("_").join(" ")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {person.inventoryDetails.reason}
            </p>
          </div>
        )}

        {/* ── Delete action ── */}
        <div className="flex items-center justify-end mt-4">
          <button
            onClick={() => removeCandidate?.(person._id)}
            className="text-slate-300 hover:text-red-500 transition-colors"
            title="Remove candidate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {renderStatusDialog()}
    </>
  );
};

export default InventoryCard;