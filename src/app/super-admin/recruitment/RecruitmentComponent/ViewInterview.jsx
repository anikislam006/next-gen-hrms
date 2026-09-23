"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Loader2,
  ArrowLeft,
  Trophy,
  Clock,
  User,
  PlusCircle,
  Link as LinkIcon,
  Briefcase
} from "lucide-react";

// Hooks
import { useInterview } from "@/app/hook/useInterview";
import { useAssessmentResult } from "@/app/hook/useAssessmentResult";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Internal Component
import CreateInterviewDialog from "./CreateInterviewDialog";
import Link from "next/link";

const ViewInterview = ({ person, job }) => {
  const { 
    fetchSpecificInterview, 
    loading: isFetching 
  } = useInterview();

  const { 
    submitInterviewResult,   
    fetchInterviewDetails, 
    loading: isSaving
  } = useAssessmentResult();

  // --- State Management ---
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  
  // Evaluation States
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [localQueue, setLocalQueue] = useState([]); 

  /* ================= DATA FETCHING ================= */
  const loadInterview = useCallback(async () => {
    if (job?._id && person?._id) {
      const scheduleData = await fetchSpecificInterview(job._id, person._id);
      const resultsData = await fetchInterviewDetails(job._id, person._id);
      
      if (scheduleData) {
        const mergedRounds = scheduleData.interviewRoundsList.map(round => {
          // Robust ID comparison: Convert both to String for matching
          const result = resultsData?.interviewRoundsList?.find(
            r => String(r.roundId) === String(round.roundId)
          );
          return {
            ...round,
            score: result ? result.obtainMarks : "",
            feedback: result ? result.feedback : ""
          };
        });
        
        setInterviewData({ ...scheduleData, interviewRoundsList: mergedRounds });
      }
    }
  }, [job?._id, person?._id, fetchSpecificInterview, fetchInterviewDetails]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  /* ================= EVALUATION LOGIC ================= */
  const handleSelectRound = (round) => {
    setSelectedRound(round);
    const queued = localQueue.find(q => String(q.roundId) === String(round.roundId));
    setScore(queued ? queued.score : (round.score || ""));
    setFeedback(queued ? queued.feedback : (round.feedback || ""));
  };

  const handleConfirmRoundGrade = () => {
    setLocalQueue(prev => {
      const filtered = prev.filter(q => String(q.roundId) !== String(selectedRound.roundId));
      return [...filtered, { 
        roundId: selectedRound.roundId, // Keep original type here
        roundTitle: selectedRound.roundTitle,
        interviewer: selectedRound.interviewer,
        score, 
        feedback 
      }];
    });
    setSelectedRound(null);
  };

  const handleFinalSave = async () => {
    try {
      const payload = {
        jobRoleId: job._id,
        candidateId: person._id,
        jobRoleName: job.title,
        candidateName: person.fullName,
        interviewRound: localQueue.map(q => ({
          // FORCE CONVERSION TO NUMBER FOR BACKEND
          roundId: Number(q.roundId) || 0, 
          roundTitle: q.roundTitle,
          interviewer: q.interviewer,
          maxMarks: q.maxMarks,
          obtainMarks: Number(q.score) || 0,
          feedback: q.feedback
        }))
      };

      const res = await submitInterviewResult(payload);
      
      if (res.success) {
        setLocalQueue([]);
        await loadInterview();
      }
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  /* ================= RENDERER: EVALUATION FORM ================= */
  if (selectedRound) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedRound(null)} 
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 font-bold text-xs group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Timeline
        </button>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedRound.roundTitle}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grading Component</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Score (0-100)</Label>
                <Input 
                  type="number" 
                  value={score} 
                  onChange={(e) => setScore(e.target.value)} 
                  className="h-14 text-2xl font-black rounded-2xl"
                  placeholder="0"
                />
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                <Calendar className="text-slate-400" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Interview Date</p>
                  <p className="text-sm font-bold text-slate-800">{selectedRound.roundDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Interviewer Feedback</Label>
              <Textarea 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)} 
                className="min-h-[120px] rounded-2xl text-sm p-4" 
                placeholder="How was the candidate's performance?"
              />
            </div>

            <Button onClick={handleConfirmRoundGrade} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-2xl transition-all">
              Confirm Round Grade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDERER: MAIN LIST VIEW ================= */
  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Interview Scheduling</h2>
          <p className="text-sm text-gray-500">Manage interviews for {person?.fullName}</p>
        </div>
        <button 
          onClick={() => setIsInterviewModalOpen(true)}
          className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Info Header */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-200"><User size={16} className="text-gray-400" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Candidate</p>
            <p className="text-sm font-bold text-gray-700">{person?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l pl-4">
          <div className="p-2 bg-white rounded-lg border border-gray-200"><Briefcase size={16} className="text-gray-400" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Position</p>
            <p className="text-sm font-bold text-gray-700">{job?.title}</p>
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-300" /></div>
      ) : (
        <div className="space-y-4">
          {interviewData?.interviewRoundsList?.length > 0 ? (
            interviewData.interviewRoundsList.map((round) => {
              const queued = localQueue.find(q => String(q.roundId) === String(round.roundId));
              const hasScore = queued || round.score;
              
              return (
                <div 
  key={round.roundId}
  onClick={() => handleSelectRound(round)}
  className="group bg-white border border-slate-100 rounded-[1.25rem] p-7 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative"
>
  {/* Header Section */}
  <div className="flex justify-between items-start">
    <div className="space-y-0.5">
      <h3 className="text-[1.35rem] font-bold text-slate-900 tracking-tight">
        {round.roundTitle}
      </h3>
      <p className="text-[0.95rem] text-slate-500 font-medium">
        with {round.interviewer?.fullName || "HR Manager"}
      </p>
      <p className="text-[0.85rem] text-slate-400">
        {round.interviewer?.role || "HR Manager"}
      </p>
    </div>
    
    <span className={`px-4 py-1.5 rounded-full text-[13px] font-medium border ${
      hasScore 
        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
        : "bg-indigo-50 text-indigo-600 border-indigo-100"
    }`}>
      {hasScore ? "evaluated" : "scheduled"}
    </span>
  </div>

  {/* Details Section */}
  <div className="mt-6 space-y-3">
    <div className="flex items-center gap-3 text-slate-600">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
        <Calendar size={18} className="text-slate-500 group-hover:text-indigo-500" />
      </div>
      <span className="text-[0.95rem] font-medium">{round.roundDate}, {round.roundTime}</span>
    </div>
    
    <div className="flex items-center gap-3 text-slate-600">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
        <Clock size={18} className="text-slate-500 group-hover:text-indigo-500" />
      </div>
      <span className="text-[0.95rem] font-medium">{round.duration || "45"} minutes</span>
    </div>
  </div>

  {/* Footer / Action Section */}
  <div className="mt-8 flex justify-between items-end">
    <Link 
      href={round.interviewLink}
      className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors py-2"
    >
      <LinkIcon size={18} />
      <span>Join Meeting</span>
    </Link>

    {hasScore && (
      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-3xl font-black text-slate-900">
            {queued ? queued.score : round.score}
          </span>
          <span className="text-slate-400 font-bold text-lg">/ {round.maxMarks}</span>
        </div>
      </div>
    )}
  </div>
</div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400">
              <Calendar size={40} className="mb-2 opacity-20" />
              <p className="italic">No interviews scheduled.</p>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      {localQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <Trophy className="text-indigo-400" size={20} />
              <div>
                <p className="text-[10px] font-bold uppercase text-indigo-400">Pending</p>
                <p className="text-xs font-bold">{localQueue.length} Round(s) Graded</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setLocalQueue([])} className="text-xs">Discard</Button>
              <Button onClick={handleFinalSave} disabled={isSaving} className="bg-indigo-600 text-xs px-6 rounded-xl">
                {isSaving ? <Loader2 className="animate-spin size-3" /> : "Save All"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreateInterviewDialog
        open={isInterviewModalOpen} 
        onClose={() => {
          setIsInterviewModalOpen(false);
          loadInterview(); 
        }}
        jobInfo={job}
        personInfo={person}
      />
    </div>
  );
};

export default ViewInterview;