"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Trash2,
  ClipboardCheck,
  Loader2,
  Briefcase,
  CheckCircle2,
  Trophy,
  ArrowLeft,
  Save,
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Hooks
import { useAssessment } from "@/app/hook/useAssessment";
import { useAssessmentResult } from "@/app/hook/useAssessmentResult";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ViewAssessment = ({ person, job }) => {
  const {
    fetchAssessmentsByJob,
    assessments,
    loading: fetchingAssessments,
  } = useAssessment();

  const { submitAssessmentResult, fetchSpecificResult, loading: isSavingResult } =
    useAssessmentResult();

  // --- State Management ---
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [existingResult, setExistingResult] = useState(null);

  // This holds the objects before they are posted to the DB
  const [resultsQueue, setResultsQueue] = useState([]);

  // Fetch Assessments and existing database results
  useEffect(() => {
    const initData = async () => {
      if (job?._id && person?._id) {
        fetchAssessmentsByJob(job._id);
        const res = await fetchSpecificResult(job._id, person._id);
        // Important: set the raw data. Our backend now provides 'id' aliased from 'componentId'
        if (res) setExistingResult(res);
      }
    };
    initData();
  }, [job?._id, person?._id, fetchAssessmentsByJob, fetchSpecificResult]);

  // Handle selecting a component to grade
  const handleSelectComponent = (assessment, component) => {
    // Check both local queue and saved DB results using string comparison for safety
    const existingInQueue = resultsQueue.find((r) => String(r.id) === String(component.id));
    const existingInDb = existingResult?.assessmentTypesList?.find(r => 
      String(r.componentId) === String(component.id) || String(r.id) === String(component.id)
    );

    setSelectedComponent({
      assessmentId: assessment._id,
      assessmentTitle: assessment.assessmentTitle,
      ...component,
    });

    setObtainedMarks(
      existingInQueue ? existingInQueue.obtainMarks : (existingInDb ? existingInDb.obtainMarks : "")
    );
    setFeedback(
      existingInQueue ? existingInQueue.feedback : (existingInDb ? existingInDb.feedback : "")
    );
  };

  const handleConfirmLocalGrade = () => {
    if (obtainedMarks === "" || !selectedComponent) return;

    const newResultEntry = {
      id: selectedComponent.id,
      componentId: selectedComponent.id, 
      typeTitle: selectedComponent.typeTitle,
      typeFeedback: feedback,
      maxMarks: selectedComponent.maxMarks,
      obtainMarks: Number(obtainedMarks),
      assessmentId: selectedComponent.assessmentId,
      assessmentName: selectedComponent.assessmentTitle,
    };

    setResultsQueue((prev) => {
      const filtered = prev.filter((item) => String(item.id) !== String(selectedComponent.id));
      return [...filtered, newResultEntry];
    });

    setSelectedComponent(null);
    setObtainedMarks("");
    setFeedback("");
  };

  const handleFinalPost = async () => {
    if (resultsQueue.length === 0) return;
    const meta = resultsQueue[0];

    const payload = {
      jobRoleId: job?._id,
      jobRoleName: job?.title,
      candidateId: person?._id,
      candidateName: person?.fullName,
      assessmentId: meta.assessmentId,
      assessmentName: meta.assessmentName,
      assessmentTypesList: resultsQueue,
    };

    try {
      const res = await submitAssessmentResult(payload);
      if (res.success) {
        setResultsQueue([]);
        // Re-fetch to show the "SAVED" status in the grid immediately
        const updated = await fetchSpecificResult(job._id, person._id);
        setExistingResult(updated);
      }
    } catch (err) {
      console.error("Failed to post assessments:", err);
    }
  };

  /* ================= RENDERER: COMPACT MARKING FORM ================= */
  if (selectedComponent) {
    return (
      <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 p-2">
        <button
          onClick={() => setSelectedComponent(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors my-4 font-bold text-xs group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {selectedComponent.typeTitle}
              </h3>
              <p className="text-xs text-slate-400">Grading <span className="text-blue-600 font-bold">{person?.fullName}</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Score</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={obtainedMarks}
                    onChange={(e) => setObtainedMarks(e.target.value)}
                    className="h-12 text-xl font-bold border-slate-200 bg-slate-50 focus:bg-white rounded-xl px-4"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">/ {selectedComponent.maxMarks}</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-center border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weightage</span>
                <p className="text-xl font-bold text-slate-800">{selectedComponent.maxMarks} <span className="text-xs opacity-50 font-medium">Pts</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Feedback Snippet
              </Label>
              <Textarea
                placeholder="Candidate performance notes..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50 focus:bg-white p-4 text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleConfirmLocalGrade}
              disabled={obtainedMarks === ""}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-blue-100"
            >
              Confirm Component Marks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= RENDERER: MAIN LIST ================= */
  const renderAssessmentList = (items) => {
    if (fetchingAssessments && (!items || items.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-200" />
          <p className="font-bold text-[10px] uppercase tracking-widest opacity-50">Syncing assessments...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-sm">{item.assessmentTitle}</h4>
              <BadgeContainer text={`${item.totalMarks} Total Points`} />
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {item.assessmentTypesList?.map((type) => {
                  const isQueued = resultsQueue.find((r) => String(r.id) === String(type.id));
                  const dbResult = existingResult?.assessmentTypesList?.find(r => 
                    String(r.componentId) === String(type.id) || String(r.id) === String(type.id)
                  );
                  const hasData = isQueued || dbResult;

                  return (
                    <div
                      key={type.id}
                      onClick={() => handleSelectComponent(item, type)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all group ${
                        isQueued ? "border-blue-500 bg-blue-50/50 shadow-sm" : hasData ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${hasData ? "bg-emerald-500" : "bg-slate-100 group-hover:bg-slate-200"}`}>
                           <CheckCircle className={`w-4 h-4 ${hasData ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 leading-tight">{type.typeTitle}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-tight ${hasData ? "text-emerald-600" : "text-slate-400"}`}>
                             {isQueued ? `Local: ${isQueued.obtainMarks}` : dbResult ? `Scored: ${dbResult.obtainMarks}` : "Awaiting Grade"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* --- PERFORMANCE SUMMARY GRID --- */}
        {(resultsQueue.length > 0 || (existingResult && existingResult.assessmentTypesList?.length > 0)) && (
          <div className="mt-10 pt-6 border-t border-slate-200 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Final Grade Summary</h3>
              </div>
              {!existingResult && <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100"><AlertCircle className="w-3 h-3" /> Unsaved Data</span>}
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Assessment Type</th>
                    <th className="px-5 py-3">Record Status</th>
                    <th className="px-5 py-3 text-center">Score</th>
                    <th className="px-5 py-3">Feedback Snippet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* DATABASE SAVED RESULTS */}
                  {existingResult?.assessmentTypesList?.map((res, idx) => (
                    <tr key={`db-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-700">{res.typeTitle || res.title}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">SAVED</span></td>
                      <td className="px-5 py-3 text-center font-bold text-emerald-600">{res.obtainMarks} / {res.maxMarks}</td>
                      <td className="px-5 py-3 text-slate-400 italic truncate max-w-[220px]">{res.feedback || "No feedback recorded"}</td>
                    </tr>
                  ))}
                  {/* QUEUED LOCAL RESULTS */}
                  {resultsQueue.map((res, idx) => (
                    <tr key={`queue-${idx}`} className="bg-blue-50/20 hover:bg-blue-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-blue-700">{res.typeTitle}</td>
                      <td className="px-5 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">PENDING</span></td>
                      <td className="px-5 py-3 text-center font-bold text-blue-600">{res.obtainMarks} / {res.maxMarks}</td>
                      <td className="px-5 py-3 text-blue-400 italic truncate max-w-[220px]">{res.feedback || "Awaiting database sync..."}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Total</p>
                   <p className="text-2xl font-black text-slate-900">
                    {(resultsQueue.reduce((a,b) => a + (Number(b.obtainMarks) || 0), 0) + (existingResult?.assessmentTypesList?.reduce((a,b) => a + (Number(b.obtainMarks) || 0), 0) || 0))}
                    <span className="text-xs font-bold text-slate-400 ml-1.5 uppercase">Points</span>
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <header className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Assessment Evaluation</h2>
        <p className="text-xs text-slate-500 font-medium">Evaluate the candidate across defined technical and behavioral components.</p>
      </header>

      <main className="pb-24">{renderAssessmentList(assessments)}</main>

      {/* Floating Action Bar */}
      {resultsQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[100] animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-900 text-white shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4 border border-slate-700 backdrop-blur-sm bg-opacity-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                 <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Evaluation in Progress</p>
                <p className="text-sm font-bold">{resultsQueue.length} New Grade{resultsQueue.length > 1 ? 's' : ''} Added</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setResultsQueue([])} className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold">Discard</Button>
              <Button
                onClick={handleFinalPost}
                disabled={isSavingResult}
                className="bg-blue-600 hover:bg-blue-500 text-xs font-bold px-6 shadow-lg shadow-blue-600/20"
              >
                {isSavingResult ? <Loader2 className="animate-spin h-4 w-4" /> : "Save All Grades"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Mini Component
const BadgeContainer = ({ text }) => (
  <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-bold uppercase">
    {text}
  </span>
);

export default ViewAssessment;