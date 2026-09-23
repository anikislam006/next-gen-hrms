"use client";

import React, { useState } from 'react';
import { 
  XCircle, 
  Briefcase, 
  AlertCircle, 
  RefreshCcw, 
  Loader2 
} from 'lucide-react';
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import { Button } from "@/components/ui/button";

const RejectedList = () => {
    const { candidates, changeCandidateStatus } = useRecruitment();
    const [processingId, setProcessingId] = useState(null);
    
    // Filter for rejected candidates only
    const rejectedCandidates = candidates.filter(c => c.status === "Rejected");

    const handleReinstate = async (person) => {
        setProcessingId(person._id);
        try {
            // Move candidate back to "Applied" stage
            // We pass the jobId so the Kanban columns know which job to refresh
            await changeCandidateStatus(person._id, "Applied", person.jobId);
            
            // Note: Because of our hook's notifyRecruitment() and 
            // the refresh-kanban-board event, the UI will sync automatically.
        } catch (error) {
            console.error("Failed to reinstate candidate:", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (rejectedCandidates.length === 0) return null;

    return (
        <div className="mt-8 bg-red-50/30 border border-red-100 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Rejected Candidates ({rejectedCandidates.length})</h2>
                </div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Archived Applications
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rejectedCandidates.map((person) => (
                    <div 
                        key={person._id} 
                        className="bg-white border border-red-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                        {/* Status Tag */}
                        <div className="absolute top-0 right-0 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-bl-xl uppercase tracking-tighter">
                            {person.rejectionReason || "Rejected"}
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div className="pr-12">
                                <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                                    {person.fullName}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                                    <Briefcase className="w-3 h-3" /> {person.jobRoleName}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-start gap-2 p-3 bg-gray-50 rounded-xl mb-4">
                            <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-gray-500 leading-relaxed italic line-clamp-2">
                                {person.rejectionNote || "Technical skills do not meet the requirements."}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Match: {person.matchScore || "65"}%</span>
                            </div>

                            <Button 
                                onClick={() => handleReinstate(person)}
                                disabled={processingId === person._id}
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all active:scale-95"
                            >
                                {processingId === person._id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <RefreshCcw className="w-3 h-3" />
                                )}
                                Reinstate
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RejectedList;