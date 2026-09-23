"use client";
import React, { useState, useEffect } from "react";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, Calendar, UserCheck, Loader2, 
  Video, Clock, Search, User, X, Briefcase, ChevronRight, Info, Trophy, LinkIcon, Settings2, PlusCircle
} from "lucide-react";
import { useEmployees } from "@/app/hook/useEmployees";
import { useInterview } from "@/app/hook/useInterview";

export default function CreateInterviewDialog({ open, onClose, jobInfo, personInfo }) {
  const { 
    submitInterview, 
    fetchSpecificInterview, 
    removeInterview, 
    loading: interviewLoading, 
  } = useInterview();
  
  const { employees, searchTerm, setSearchTerm, loading: empLoading } = useEmployees();
  const [showResults, setShowResults] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentRound, setCurrentRound] = useState({ 
    roundTitle: "", 
    duration: "45", 
    roundDate: "",
    roundTime: "", 
    maxMarks: "100", 
    interviewer: null 
  });

  const [formData, setFormData] = useState({
    _id: null,
    interviewTitle: "",
    instructions: "",
    interviewRoundsList: [],
    jobId: "", 
    jobRoleName: "",
    candidateId: "",
    candidateName: ""
  });

  /* ================= HELPERS ================= */
  const generateCalendarLink = (round) => {
    const baseUrl = "https://calendar.google.com/calendar/u/0/r/eventedit";
    const title = encodeURIComponent(`${formData.interviewTitle || "Interview"}: ${round.roundTitle}`);
    const startStr = `${round.roundDate}T${round.roundTime}:00`;
    const startDate = new Date(startStr);
    const endDate = new Date(startDate.getTime() + parseInt(round.duration) * 60000);
    const formatForGoogle = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `${baseUrl}?text=${title}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&add=video`;
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const loadExistingInterview = async () => {
      if (open && jobInfo?._id && personInfo?._id) {
        try {
          const existingData = await fetchSpecificInterview(jobInfo._id, personInfo._id);
          if (existingData) {
            setFormData({
              _id: existingData._id,
              interviewTitle: existingData.interviewTitle || "",
              instructions: existingData.instructions || "",
              interviewRoundsList: existingData.interviewRoundsList || [],
              jobId: jobInfo._id,
              jobRoleName: jobInfo.title,
              candidateId: personInfo._id,
              candidateName: personInfo.fullName
            });
            setIsEditMode(true);
          }
        } catch (err) {
          setIsEditMode(false);
          setFormData(prev => ({
            ...prev,
            jobId: jobInfo._id,
            jobRoleName: jobInfo.title,
            candidateId: personInfo._id,
            candidateName: personInfo.fullName
          }));
        }
      }
    };
    loadExistingInterview();
  }, [open, jobInfo, personInfo, fetchSpecificInterview]);

  /* ================= ACTIONS ================= */
  const handleSelectEmployee = (emp) => {
    setCurrentRound(prev => ({ ...prev, interviewer: emp }));
    setSearchTerm("");
    setShowResults(false);
  };

  const addRoundToList = () => {
    if (!currentRound.roundTitle || !currentRound.roundDate || !currentRound.roundTime || !currentRound.interviewer) {
      alert("Please fill all round details.");
      return;
    }
    const generatedLink = generateCalendarLink(currentRound);
    setFormData(prev => ({
      ...prev,
      interviewRoundsList: [
        ...prev.interviewRoundsList, 
        { ...currentRound, roundId: Date.now(), interviewLink: generatedLink, calendarUrl: generatedLink }
      ]
    }));
    setCurrentRound({ roundTitle: "", duration: "45", roundDate: "", roundTime: "", maxMarks: "100", interviewer: null });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitInterview(formData);
      if (response.success) onClose();
    } catch (err) {
      alert(err.message || "Failed to save.");
    }
  };

  return (
    <AccessibleDialog 
      open={open} 
      onOpenChange={onClose} 
      title={isEditMode ? "Update Pipeline Architecture" : "Design Interview Pipeline"}
      className="max-w-[85vw] w-[75vw] rounded-[2.5rem]"
    >
      {/* Dynamic Header Badge */}
      <div className="flex items-center gap-3 p-3 px-5 mb-8 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
          <User size={16} className="text-indigo-500" />
          {personInfo?.fullName}
        </div>
        <ChevronRight size={14} className="text-slate-300" />
        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
          <Briefcase size={16} className="text-indigo-500" />
          {jobInfo?.title}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-12 gap-10 h-[68vh]">
        {/* Settings Panel */}
        <div className="col-span-4 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 size={14} className="text-slate-400" />
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Phase Settings</Label>
            </div>
            <Input 
              placeholder="Internal Interview Title" 
              className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
              value={formData.interviewTitle} 
              onChange={(e) => setFormData({...formData, interviewTitle: e.target.value})}
              required
            />
            <textarea 
              placeholder="Candidate instructions or internal notes..." 
              className="w-full h-24 p-4 border border-slate-200 rounded-xl text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            />
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-[1.5rem] space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <PlusCircle size={16} className="text-indigo-600" />
              <Label className="text-xs font-bold text-slate-800">Add New Round</Label>
            </div>
            
            <Input 
              placeholder="Round Title (e.g. Behavioral)" 
              className="bg-slate-50 border-none h-11 text-sm font-semibold"
              value={currentRound.roundTitle} 
              onChange={(e) => setCurrentRound({...currentRound, roundTitle: e.target.value})} 
            />
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Assign Interviewer..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                className="pl-10 bg-slate-50 border-none h-11 text-sm font-semibold"
              />
              {showResults && searchTerm && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                  {employees.map(emp => (
                    <button key={emp._id} type="button" onClick={() => handleSelectEmployee(emp)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 text-xs font-bold text-slate-600 transition-colors">
                      {emp.fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentRound.interviewer && (
              <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold">
                <span className="flex items-center gap-2"><UserCheck size={14}/> {currentRound.interviewer.fullName}</span>
                <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => setCurrentRound({...currentRound, interviewer: null})} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Date</p>
                <Input type="date" className="bg-slate-50 border-none h-11 text-xs" value={currentRound.roundDate} onChange={(e) => setCurrentRound({...currentRound, roundDate: e.target.value})} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Time</p>
                <Input type="time" className="bg-slate-50 border-none h-11 text-xs" value={currentRound.roundTime} onChange={(e) => setCurrentRound({...currentRound, roundTime: e.target.value})} />
              </div>
            </div>

            <div className="relative">
              <Trophy className="absolute left-3 top-3.5 w-4 h-4 text-amber-500" />
              <Input type="number" placeholder="Max Score" className="pl-10 bg-slate-50 border-none h-11 text-sm font-bold" value={currentRound.maxMarks} onChange={(e) => setCurrentRound({...currentRound, maxMarks: e.target.value})} />
            </div>

            <Button type="button" onClick={addRoundToList} className="w-full bg-slate-900 hover:bg-black rounded-xl h-11 text-xs font-bold tracking-wide transition-all shadow-lg shadow-slate-200">
              Inject Round to Pipeline
            </Button>
          </div>
        </div>

        {/* Pipeline Canvas Preview */}
        <div className="col-span-8 flex flex-col bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100">
           <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
             {formData.interviewRoundsList.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                  <div className="p-4 rounded-full bg-white border border-slate-100 shadow-sm">
                    <Video size={32} className="opacity-20" />
                  </div>
                  <p className="text-sm font-medium">No rounds architected yet.</p>
               </div>
             ) : (
               formData.interviewRoundsList.map((item, index) => (
                <div key={item.roundId || index} className="group bg-white border border-slate-100 rounded-[1.5rem] p-7 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative">
                    <button type="button" className="absolute top-6 right-6 p-2 rounded-full hover:bg-red-50 transition-colors" onClick={() => setFormData(prev => ({...prev, interviewRoundsList: prev.interviewRoundsList.filter(i => i.roundId !== item.roundId)}))}>
                        <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-red-500" />
                    </button>
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-[1.25rem] font-bold text-slate-900 tracking-tight">
                          {index + 1}. {item.roundTitle}
                        </h3>
                        <p className="text-[0.9rem] text-slate-500 font-medium flex items-center gap-2">
                           <User size={14} className="text-indigo-500" /> {item.interviewer?.fullName || "HR Manager"}
                        </p>
                      </div>
                      <span className="mr-8 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-black uppercase tracking-wider">
                        scheduled
                      </span>
                    </div>

                    <div className="mt-6 flex gap-8">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                          <Calendar size={16} className="text-slate-400 group-hover:text-indigo-500" />
                        </div>
                        <span className="text-[0.85rem] font-bold">{item.roundDate}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                          <Clock size={16} className="text-slate-400 group-hover:text-indigo-500" />
                        </div>
                        <span className="text-[0.85rem] font-bold">{item.roundTime} ({item.duration}m)</span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between items-end border-t border-slate-50 pt-6">
                      <a href={item.interviewLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-xs">
                          <LinkIcon size={14} />
                          <span>SYNC TO GOOGLE CALENDAR</span>
                      </a>
                      
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Score</p>
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-black text-slate-900">{item.maxMarks}</span>
                          <span className="text-slate-400 font-bold text-sm">Pts</span>
                        </div>
                      </div>
                    </div>
                </div>
               ))
             )}
           </div>

           {/* Footer Action Bar */}
           <div className="pt-8 mt-6 border-t border-slate-200/60 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                  <Trophy className="text-amber-500" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Weightage</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formData.interviewRoundsList.reduce((acc, curr) => acc + Number(curr.maxMarks), 0)} <span className="text-slate-400 text-sm">Points</span>
                  </p>
                </div>
             </div>
             
             <Button 
               disabled={interviewLoading || formData.interviewRoundsList.length === 0} 
               type="submit" 
               className="h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-[1.25rem] shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
               {interviewLoading ? <Loader2 className="animate-spin" /> : "Deploy Pipeline"}
             </Button>
           </div>
        </div>
      </form>
    </AccessibleDialog>
  );
}