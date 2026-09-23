"use client";

import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Briefcase, 
  GraduationCap, DollarSign, FileText, X, 
  ExternalLink, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRecruitment } from '@/app/hook/useRecruitment-jobs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RECRUITMENT_STAGES = [
  "Applied", "Screening", "Assessment", "Interview", 
  "Final Review", "Offer", "Hired", "Inventory", "Rejected"
];

export default function ViewDialog({ open, onClose, person }) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { changeCandidateStatus } = useRecruitment();

  if (!person) return null;

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

  const getCleanSkills = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return [];
    return skillsArray
      .map(skill => skill.replace(/[\[\]"\\ ]/g, ''))
      .filter(s => s !== "");
  };

  const cleanSkills = getCleanSkills(person.skills);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[1050px] h-[90vh] p-0 overflow-hidden border-none bg-[#f3f4f6] shadow-2xl focus:outline-none ring-0 flex flex-col">
          
          {/* 1. TOP HEADER SECTION */}
          <div className="bg-white px-10 py-8 relative border-b border-slate-100 shrink-0">
         
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[34px] font-bold text-slate-900 tracking-tight leading-none">
                  {person.fullName}
                </h2>
                <p className="text-[#5d6b82] text-xl font-medium mt-3">
                  {person.jobRoleName}
                </p>
              </div>
              
              <div className="flex gap-3 items-center mt-1 mr-12">
                <Badge className="bg-[#5d6b82] hover:bg-[#5d6b82] text-white px-5 py-2 rounded-full text-sm font-semibold border-none">
                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  {person.status}
                </Badge>
                <div className="flex items-center gap-1.5 bg-[#e6f9f1] text-[#1eb773] px-4 py-1.5 rounded-full font-bold border border-[#d1f2e5]">
                  <span className="text-sm">★</span>
                  <span className="text-lg">{person.matchScore || 92}%</span> 
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-10">
              <p className="text-slate-500 text-[16px]">
                Complete candidate profile with contact information, experience, and interview history
              </p>
              <button 
                onClick={() => setIsResumeOpen(true)}
                className="flex items-center gap-2 text-[#5d6b82] font-semibold hover:text-slate-900 transition-colors group"
              >
                <FileText className="w-5 h-5" /> 
                <span className="border-b border-slate-300 group-hover:border-slate-900">Show Full CV Overview</span>
              </button>
            </div>
          </div>

          {/* 2. TABS & CONTENT SECTION */}
          <Tabs defaultValue="overview" className="w-full flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start rounded-none h-[64px] bg-[#e2e4e9] p-2 px-8 gap-4 shrink-0">
              {["Overview", "Assessments", "Interviews", "Timeline", "Notes"].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab.toLowerCase()} 
                  className="rounded-full px-12 h-full data-[state=active]:bg-white data-[state=active]:text-slate-900 text-slate-600 font-bold shadow-none border-none transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto bg-[#f3f4f6]">
              <TabsContent value="overview" className="p-10 space-y-8 mt-0 outline-none">
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[28px] border border-slate-200 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-800 mb-6">Contact Information</h4>
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 text-slate-700 font-medium">
                        <Mail className="w-5 h-5 text-slate-400" /> {person.email}
                      </div>
                      <div className="flex items-center gap-4 text-slate-700 font-medium">
                        <Phone className="w-5 h-5 text-slate-400" /> {person.phone}
                      </div>
                      <div className="flex items-center gap-4 text-slate-700 font-medium">
                        <MapPin className="w-5 h-5 text-slate-400" /> {person.location}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[28px] border border-slate-200 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-800 mb-6">Professional Details</h4>
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 text-slate-700 font-medium">
                        <Briefcase className="w-5 h-5 text-slate-400" /> {person.experience} years experience
                      </div>
                      <div className="flex items-center gap-4 text-slate-700 font-medium">
                        <GraduationCap className="w-5 h-5 text-slate-400" /> {person.education}
                      </div>
                      <div className="flex items-center gap-4 text-slate-700 font-bold text-lg">
                        <DollarSign className="w-5 h-5 text-slate-400" /> ${person.salary?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[28px] border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-800 mb-6">Skills</h4>
                  <div className="flex flex-wrap gap-3">
                    {cleanSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-[#eff6ff] text-[#2563eb] hover:bg-[#eff6ff] border-none px-6 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-wider">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[28px] border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-800 mb-8">Application Details</h4>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-slate-500 text-[15px] font-medium mb-2">Source</p>
                      <p className="text-xl font-extrabold text-slate-900">{person.source}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[15px] font-medium mb-2">Applied Date</p>
                      <p className="text-xl font-extrabold text-slate-900">
                        {new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[15px] font-medium mb-2">Notice Period</p>
                      <p className="text-xl font-extrabold text-slate-900">{person.noticePeriod} days</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* 3. FOOTER ACTIONS - SIMPLIFIED */}
          <div className="bg-white p-6 px-10 border-t flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Current Stage:</span>
              <Select onValueChange={handleStatusUpdate} defaultValue={person.status}>
                <SelectTrigger className="w-[220px] bg-[#f8fafc] border border-slate-200 rounded-xl h-12 px-5 text-slate-900 font-bold text-sm shadow-sm focus:ring-0 transition-all">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  {RECRUITMENT_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage} className="font-medium text-slate-700 focus:bg-slate-50 cursor-pointer">
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => handleStatusUpdate("Rejected")}
                disabled={isUpdating}
                variant="outline" 
                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl px-8 h-12 font-bold flex items-center gap-2 transition-all"
              >
                ⓧ Reject Candidate
              </Button>
              <Button 
                onClick={onClose} 
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 h-12 font-bold transition-all shadow-lg"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CV PREVIEW MODAL */}
      <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col overflow-hidden bg-white border-none shadow-2xl focus:outline-none ring-0">
          <div className="p-5 border-b flex flex-row items-center justify-between bg-white shrink-0">
            <h3 className="text-xl font-bold ml-4">Resume: {person.fullName}</h3>
            <div className="flex items-center gap-6 mr-10">
              <a 
                href={person.resume} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-sm text-[#0061ff] font-bold hover:underline"
              >
                <ExternalLink className="w-5 h-5" /> Full View
              </a>
              <button onClick={() => setIsResumeOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-[#4b4e52] p-6 flex justify-center overflow-hidden">
             <iframe 
                src={`${person.resume}#view=FitH&toolbar=0`} 
                className="w-full h-full border-none rounded-sm shadow-2xl bg-white max-w-[950px]" 
                title="Candidate CV"
             />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}