"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { 
  Loader2, Eye, Star, Trash2, 
  MapPin, Inbox 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";

// Dialog Components
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

const CandidateListTable = ({ searchTerm, job }) => {
  const { id: jobId } = useParams();
  const { fetchByStatus, removeCandidate } = useRecruitment();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // --- FETCH ALL DATA ---
  const loadAllData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const requests = RECRUITMENT_STAGES.map(stage => 
        fetchByStatus(jobId, stage, 1, 50, searchTerm)
      );
      const results = await Promise.all(requests);
      const allCandidates = results.flatMap(res => res.candidates || []);
      
      // Filter unique by ID and sort by newest
      const uniqueCandidates = Array.from(new Map(allCandidates.map(c => [c._id, c])).values());
      uniqueCandidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setCandidates(uniqueCandidates);
    } catch (err) {
      console.error("Error loading table data:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId, searchTerm, fetchByStatus]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Sync with global events
  useEffect(() => {
    const handleRefresh = () => loadAllData();
    window.addEventListener("refresh-kanban-board", handleRefresh);
    return () => window.removeEventListener("refresh-kanban-board", handleRefresh);
  }, [loadAllData]);

  // Styling logic based on your screenshot
  const getStageStyles = (stage) => {
    const styles = {
      Applied: "bg-[#64748B] text-white",
      Screening: "bg-[#3B82F6] text-white",
      Assessment: "bg-[#8B5CF6] text-white",
      Interview: "bg-[#F59E0B] text-white",
      "Final Review": "bg-[#F97316] text-white",
      Offer: "bg-[#10B981] text-white",
      Hired: "bg-[#059669] text-white",
      Rejected: "bg-[#EF4444] text-white",
    };
    return styles[stage] || "bg-gray-400 text-white";
  };

  const handleOpenModal = (person) => {
    setSelectedPerson(person);
    setIsViewOpen(true);
  };

  const renderStatusDialog = () => {
    if (!isViewOpen || !selectedPerson) return null;
    const commonProps = { 
      open: isViewOpen, 
      onClose: () => setIsViewOpen(false), 
      person: selectedPerson, 
      job: job 
    };

    switch (selectedPerson.status) {
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
    <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm my-5">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Candidate</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Job Role</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Match</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Stage</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Source</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B]">Applied</th>
            <th className="px-6 py-4 text-xs font-semibold text-[#64748B] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan="8" className="py-24 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
              </td>
            </tr>
          ) : candidates.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-24 text-center">
                <Inbox className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No candidates available</p>
              </td>
            </tr>
          ) : (
            candidates.map((person) => (
              <tr key={person._id} className="hover:bg-slate-50/50 transition-colors group">
                {/* Candidate */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1E293B] text-sm">{person.fullName}</span>
                    <span className="text-xs text-[#64748B]">{person.email}</span>
                  </div>
                </td>

                {/* Job Role */}
                <td className="px-6 py-4 text-sm text-[#64748B] font-medium">
                  {person.jobRoleName || "Senior Full Stack Developer"}
                </td>

                {/* Match Score */}
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${person.matchScore > 80 ? 'text-[#10B981]' : 'text-amber-500'}`}>
                    <Star className={`w-4 h-4 ${person.matchScore > 80 ? 'fill-[#10B981]' : ''}`} />
                    {person.matchScore || 74}%
                  </div>
                </td>

                {/* Stage - Becomes a Button for Modal */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleOpenModal(person)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-transform hover:scale-105 active:scale-95 shadow-sm ${getStageStyles(person.status)}`}
                  >
                    {person.status}
                  </button>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-gray-50 text-[#64748B] border-gray-200 font-bold px-3 py-0.5 rounded-full text-[10px] whitespace-nowrap">
                    {person.status === 'Hired' ? 'hired' : person.status === 'Rejected' ? 'rejected' : 'in progress'}
                  </Badge>
                </td>

                {/* Source */}
                <td className="px-6 py-4 text-sm text-[#64748B] font-medium">{person.source || "LinkedIn"}</td>

                {/* Applied Date */}
                <td className="px-6 py-4 text-sm text-[#64748B] font-medium whitespace-nowrap">
                  {new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(person)}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-[#64748B] hover:text-indigo-600 transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => removeCandidate(person._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-[#64748B] hover:text-red-600 transition-all"
                      title="Delete Candidate"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {renderStatusDialog()}
    </div>
  );
};

export default CandidateListTable;