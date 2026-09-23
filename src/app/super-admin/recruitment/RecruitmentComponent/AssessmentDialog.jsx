"use client";

import React, { useState, useMemo } from 'react';
import { 
  Mail, Phone, MapPin, Briefcase, 
  GraduationCap, DollarSign, FileText, X, 
  ExternalLink, Loader2, Star,
  UserX, Archive, ArrowRight, CheckCircle2, Circle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRecruitment } from '@/app/hook/useRecruitment-jobs';
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SendToInventoryDialog from './SendToInventoryDialog';
import ViewAssessment from './ViewAssessment';
import ViewInterview from './ViewInterview';
import TimeLine from './TimeLine';
import CandidateNotes from './CandidateNotes';

const RECRUITMENT_STAGES = [
  "Applied", "Screening", "Assessment", "Interview", 
  "Final Review", "Offer", "Hired", "Rejected"
];

export default function AssessmentDialog({ open, onClose, person, job }) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { changeCandidateStatus } = useRecruitment();

  // 1. Helper to clean skill strings
  const getCleanSkills = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return [];
    return skillsArray
      .map(skill => skill.replace(/[\[\]"\\ ]/g, '').toLowerCase())
      .filter(s => s !== "");
  };

  // 2. Logic to calculate Match Percentage and breakdown
  const skillMatch = useMemo(() => {
    if (!person?.skills || !job?.skills) return { percentage: 0, matched: [], missing: [] };
    
    const candidateSkills = getCleanSkills(person.skills);
    const requiredSkills = getCleanSkills(job.skills);
    
    const matched = requiredSkills.filter(skill => candidateSkills.includes(skill));
    const missing = requiredSkills.filter(skill => !candidateSkills.includes(skill));
    
    const percentage = requiredSkills.length > 0 
      ? Math.round((matched.length / requiredSkills.length) * 100) 
      : 0;

    return { percentage, matched, missing };
  }, [person, job]);

  if (!person || !job) return null;

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === person.status) return;
    setIsUpdating(true);
    try {
      await changeCandidateStatus(person._id, newStatus, person.jobId);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[950px] h-[85vh] p-0 overflow-hidden border-none bg-[#f8fafc] flex flex-col focus:outline-none">
          
          {/* HEADER SECTION */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 shrink-0">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {person.fullName}
                </h2>
                <div className="flex items-center gap-2">
                 
                  <span className="text-slate-600 text-sm font-medium">{job.title}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-semibold">
                  {isUpdating && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
                  {person.status}
                </Badge>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                    <Star className="w-3.5 h-3.5 fill-emerald-600" />
                    <span className="text-sm font-bold">{skillMatch.percentage}% Match</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-slate-400 text-xs">
                Candidate • Applied {new Date(person.createdAt).toLocaleDateString()}
              </p>
              <button 
                onClick={() => setIsResumeOpen(true)}
                className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" /> 
                <span className="underline underline-offset-4">Quick View CV</span>
              </button>
            </div>
          </div>
          {/* TABS & MAIN CONTENT */}
          <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col overflow-hidden px-5">
            <TabsList className="w-full">
              {["Overview", "Assessments", "Timeline", "Notes"].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab.toLowerCase()} 
                  className=""
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
              <TabsContent value="overview" className="space-y-5 mt-0 outline-none">
                
                {/* SKILL MATCHING BAR (Visual Insight) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 ">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="text-sm font-bold text-slate-800">Skill Alignment</h4>
                    <span className="text-xs font-bold text-slate-500">{skillMatch.matched.length} / {job.skills.length} Required Skills</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${skillMatch.percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                    {skillMatch.matched.map(skill => (
                      <div key={skill} className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" /> {skill}
                      </div>
                    ))}
                    {skillMatch.missing.map(skill => (
                      <div key={skill} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded italic">
                        <Circle className="w-3 h-3" /> {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 ">
                    <h4 className="text-sm font-bold text-slate-800 mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" /> {person.email}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" /> {person.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" /> {person.location}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 ">
                    <h4 className="text-sm font-bold text-slate-800 mb-4">Professional Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" /> {person.experience} years exp.
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <GraduationCap className="w-4 h-4 text-slate-400" /> {person.education}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-900">
                        <DollarSign className="w-4 h-4 text-slate-400" /> ${person.salary?.toLocaleString()} / yr
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 ">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Source</p>
                      <p className="text-sm font-semibold text-slate-800">{person.source || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Notice Period</p>
                      <p className="text-sm font-semibold text-slate-800">{person.noticePeriod} Days</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Location Preference</p>
                      <p className="text-sm font-semibold text-slate-800">On-site</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="assessments" className="space-y-5 mt-0 outline-none">
                  <ViewAssessment person={person} job={job}></ViewAssessment>

              </TabsContent>
              <TabsContent value="interviews" className="space-y-5 mt-0 outline-none">
                  <ViewInterview person={person} job={job}></ViewInterview>
              </TabsContent>
              <TabsContent value="timeline" className="space-y-5 mt-0 outline-none">
                  {/* <ViewInterview person={person} job={job}></ViewInterview> */}
                  <TimeLine person={person} job={job}></TimeLine>
              </TabsContent>
               <TabsContent value="notes" className="space-y-5 mt-0 outline-none">
                  <CandidateNotes person={person} job={job}></CandidateNotes>
              </TabsContent>
            </div>
          </Tabs>

          {/* FOOTER ACTIONS */}
          <div className="bg-white p-4 px-6 border-t flex items-center justify-between shrink-0">
            <Select onValueChange={handleStatusUpdate} defaultValue={person.status}>
              <SelectTrigger className="w-[180px] h-10 text-sm font-medium">
                <SelectValue placeholder="Move to stage..." />
              </SelectTrigger>
              <SelectContent>
                {RECRUITMENT_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleStatusUpdate("Rejected")}
                disabled={isUpdating}
                variant="ghost" 
                className="text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 flex items-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Reject
              </Button>
              
              <Button 
                onClick={() => setIsInventoryOpen(true)}
                variant="outline" 
                className="border-slate-200 h-10 px-4 text-slate-600 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Send To Inventory
              </Button>
              
              <Button 
                onClick={() => handleStatusUpdate("Screening")}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 flex items-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Screening</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV VIEW MODAL */}
      <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800">Resume: {person.fullName}</h3>
            <div className="flex items-center gap-4">
              <a href={person.resume} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Open Full
              </a>

            </div>
          </div>
          <div className="flex-1 bg-slate-800 p-4 flex justify-center">
             <iframe src={`${person.resume}#view=FitH`} className="w-full h-full border-none  bg-white max-w-[850px]" title="CV" />
          </div>
        </DialogContent>
      </Dialog>

      <SendToInventoryDialog open={isInventoryOpen} onOpenChange={setIsInventoryOpen} person={person} />
    </>
  );
}