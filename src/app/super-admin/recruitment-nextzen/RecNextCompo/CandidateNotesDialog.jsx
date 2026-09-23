"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, Plus } from "lucide-react";
import { useCandidateNotes } from "@/app/hook/useCandidateNotes";

const CandidateNotesDialog = ({ open, onOpenChange, person, job }) => {
  const { user, UserAllDetails } = useAuth();
  const { submitCandidateNote } = useCandidateNotes();

  const [noteType, setNoteType] = useState("General");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= RESET FORM WHEN CLOSED ================= */

  useEffect(() => {
    if (!open) {
      setNoteContent("");
      setNoteType("General");
      setLoading(false);
    }
  }, [open]);

  /* ================= SUBMIT NOTE ================= */

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!noteContent.trim() || loading) return;

    try {
      setLoading(true);

      const noteData = {
        noteType,
        content: noteContent.trim(),

        candidateId: person?._id,
        candidateName: person?.fullName,

        jobRoleId: job?._id || person?.jobRoleId,
        jobRoleName: job?.jobRoleName || person?.jobRoleName,

        noteBy: {
          name: user?.displayName || user?.name || "System User",
          email: user?.email,
          role: user?.role,
          designation: UserAllDetails?.designation || "N/A",
          at: new Date().toISOString(),
        },
      };

      const res = await submitCandidateNote(noteData);

      if (res?.success) {
        window.dispatchEvent(new Event("refresh-candidate-notes"));
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Add note error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CTRL + ENTER SUBMIT ================= */

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[520px] p-6 bg-white rounded-2xl border-none shadow-2xl z-[9999]"
        >
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Add Candidate Note
            </DialogTitle>

            <DialogDescription className="text-slate-500 text-sm">
              Add internal feedback about{" "}
              <span className="font-semibold text-slate-700">
                {person?.fullName || "Candidate"}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="space-y-6 mt-4"
          >
            {/* NOTE TYPE */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Note Type
              </label>

              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-11 focus:ring-blue-500">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>

                <SelectContent className="z-[10000]">
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Decision">Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NOTE CONTENT */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Note Content
              </label>

              <Textarea
                placeholder="Write internal feedback about the candidate..."
                className="min-h-[160px] bg-slate-50 border-slate-200 focus:ring-blue-500 resize-none p-4 text-sm rounded-xl"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />

              <p className="text-xs text-slate-400">
                Tip: Press <b>Ctrl + Enter</b> to quickly submit
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-slate-600 font-semibold hover:bg-slate-100 h-11 px-6"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading || !noteContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CandidateNotesDialog;