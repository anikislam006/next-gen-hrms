"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Briefcase, Star, FileCheck2, Video, Eye, 
  Trash2, ChevronDown, CheckCircle2, Loader2 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";

// Separate Dialog Components
import AppliedDialog from './AppliedDialog';
import ScreeningDialog from './ScreeningDialog';
import AssessmentDialog from './AssessmentDialog';
import InterviewDialog from './InterviewDialog';
import FinalReviewDialog from './FinalReviewDialog';
import OfferDialog from './OfferDialog';
import HiredDialog from './HiredDialog';

const RECRUITMENT_STAGES = [
  "Applied", "Screening", "Assessment", "Interview", 
  "Final Review", "Offer", "Hired", "Rejected"
];

const CandidateCard = ({ person, removeCandidate, job }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false); // Controls the "View" modal state
    const dropdownRef = useRef(null);
    
    const { changeCandidateStatus } = useRecruitment();
    const matchScore = person.matchScore || 74;

    // --- DRAG AND DROP LOGIC ---
    const onDragStart = (e) => {
        e.dataTransfer.setData("candidateId", person._id);
        e.dataTransfer.setData("currentStatus", person.status);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.style.opacity = "0.5";
    };

    const onDragEnd = (e) => {
        e.currentTarget.style.opacity = "1";
    };

    // --- DROPDOWN LOGIC ---
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
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // --- DIALOG MAPPING LOGIC ---
    // This function returns the correct Dialog component based on status
    const renderStatusDialog = () => {
        if (!isViewOpen) return null;

        const commonProps = {
            open: isViewOpen,
            onClose: () => setIsViewOpen(false),
            person: person,
            job: job
        };

        switch (person.status) {
            case "Applied": return <AppliedDialog {...commonProps} />;
            case "Screening": return <ScreeningDialog {...commonProps} />;
            case "Assessment": return <AssessmentDialog {...commonProps} />;
            case "Interview": return <InterviewDialog {...commonProps} />;
            case "Final Review": return <FinalReviewDialog {...commonProps} />;
            case "Offer": return <OfferDialog {...commonProps} />;
            case "Hired": return <HiredDialog {...commonProps} />;
            default: return null; // Handle "Rejected" or unknown stages
        }
    };

    return (
        <>
            <div 
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                className="group bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative max-w-sm"
            >
                {/* Match Score Badge */}
                <div className="absolute -top-3 -right-2 z-10">
                    <div className="bg-[#FFF9E6] border border-[#FFE7A5] text-[#D97706] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                        <span className="text-xs font-bold">{matchScore}%</span>
                    </div>
                </div>

                {/* Profile Header */}
                <div className="mb-4">
                    <h3 className="text-md font-bold text-[#1E293B] leading-tight mb-1">
                        {person.fullName || "Unnamed Candidate"}
                    </h3>
                    <p className="text-[#64748B] text-sm font-medium mb-3">
                        {person.jobRoleName}
                    </p>

                    <div className="flex items-center gap-4 text-[#64748B] mb-5">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{person.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{person.experience}y</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen(!isDropdownOpen);
                                }}
                                disabled={isUpdating}
                                className="flex items-center gap-1.5 h-8 bg-[#E0E7FF] text-[#4F46E5] px-4 rounded-full text-xs font-bold hover:bg-[#D1DBFF] transition-all"
                            >
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : person.status}
                                <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] p-1.5">
                                    {RECRUITMENT_STAGES.map((stage) => (
                                        <button
                                            key={stage}
                                            onClick={() => handleStatusUpdate(stage)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                                person.status === stage 
                                                ? "bg-indigo-50 text-indigo-700 font-bold" 
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            }`}
                                        >
                                            {stage}
                                            {person.status === stage && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Badge variant="secondary" className="bg-[#F1F5F9] text-[#475569] border-none px-4 h-8 rounded-full text-xs font-medium">
                            Career Site
                        </Badge>
                    </div>
                </div>

                <div className="h-[1px] bg-slate-100 w-full mb-4" />

                {/* Footer Actions */}
                <div className="flex items-center justify-between text-[#64748B]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <FileCheck2 className="w-4 h-4" />
                            <span className="text-xs">0</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            <span className="text-xs">0</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setIsViewOpen(true)}
                            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Delete on Hover */}
                <button 
                    onClick={() => removeCandidate(person._id)}
                    className="absolute top-4 right-10 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Render the dynamically selected Dialog */}
            {renderStatusDialog()}
        </>
    );
};

export default CandidateCard;