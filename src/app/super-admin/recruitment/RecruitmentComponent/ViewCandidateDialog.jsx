"use client";

import React, { useState } from 'react';
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Briefcase, Mail, Phone, GraduationCap, FileText, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ViewCandidateDialog({ open, onClose, person }) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  if (!person) return null;

  return (
    <AccessibleDialog 
      open={open} 
      onOpenChange={onClose} 
      title="Candidate Profile" 
      description={`Reviewing details for ${person.fullName}`}
      size="LARGE"
    >
      <div className="flex flex-col h-[70vh]">
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="details">General Details {person.status}</TabsTrigger>
            <TabsTrigger value="experience">Experience & Skills </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-2">
            {/* GENERAL DETAILS */}
            <TabsContent value="details" className="space-y-6 mt-0">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Mail className="w-4 h-4 text-indigo-500" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                      <p className="text-sm font-medium">{person.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Phone className="w-4 h-4 text-indigo-500" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                      <p className="text-sm font-medium">{person.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin className="w-4 h-4 text-indigo-500" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                      <p className="text-sm font-medium">{person.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><GraduationCap className="w-4 h-4 text-indigo-500" /></div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Education</p>
                      <p className="text-sm font-medium">{person.education}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {person.fullName.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold">{person.fullName}</h4>
                        <p className="text-sm text-slate-500">Applied for {person.jobRoleName}</p>
                    </div>
                </div>
                <Button onClick={() => setIsResumeOpen(true)} variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" /> View Resume
                </Button>
              </div>
            </TabsContent>

            {/* EXPERIENCE & SKILLS */}
            <TabsContent value="experience" className="space-y-6 mt-0">
                <div className="space-y-2">
                    <h5 className="font-bold text-slate-800">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                        {person.skills?.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                    <h5 className="font-bold text-indigo-900 mb-1">Total Experience</h5>
                    <p className="text-2xl font-black text-indigo-600">{person.experience} <span className="text-sm font-normal">Years</span></p>
                </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="pt-6 border-t mt-auto flex justify-end">
          <Button onClick={onClose}>Close Profile</Button>
        </div>
      </div>

      {/* NESTED RESUME DIALOG */}
      <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col">
            <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                <DialogTitle>Resume: {person.fullName}</DialogTitle>
                <a href={person.resume} target="_blank" className="mr-8 flex items-center gap-1 text-sm text-indigo-600 font-bold">
                    <ExternalLink className="w-4 h-4" /> Full View
                </a>
            </DialogHeader>
            <div className="flex-1 bg-slate-100 p-4">
                <iframe src={`${person.resume}#toolbar=0`} className="w-full h-full rounded shadow-lg bg-white" title="CV" />
            </div>
        </DialogContent>
      </Dialog>
    </AccessibleDialog>
  );
}