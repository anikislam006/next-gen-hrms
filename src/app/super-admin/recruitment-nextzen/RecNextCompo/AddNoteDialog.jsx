"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";

const NOTE_TYPES = ["General", "Strength", "Concern", "Follow-up", "Reference Check"];

export default function AddNoteDialog({ open, onClose, candidate, onSubmit, loading }) {
  const [noteType, setNoteType] = useState("General");
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    if (!open) {
      setNoteType("General");
      setNoteContent("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    await onSubmit({ noteType, noteContent });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Add Note</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Add a note or comment about {candidate?.fullName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-bold">Note Type</Label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md"
            >
              {NOTE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Note Content</Label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter your note or comment here..."
              className="w-full h-28 p-3 text-sm border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !noteContent.trim()} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Note
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}