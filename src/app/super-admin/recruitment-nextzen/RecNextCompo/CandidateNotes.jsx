"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCandidateNotes } from "@/app/hook/useCandidateNotes";
import CandidateNotesDialog from "./CandidateNotesDialog";
import { Plus, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CandidateNotes = ({ person, job }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  const { fetchSpecificNotes, removeCandidateNote, loading } =
    useCandidateNotes();

  /* ================= LOAD NOTES ================= */

  const loadNotes = useCallback(async () => {
    if (!person?._id || !job?._id) return;

    try {
      const data = await fetchSpecificNotes(job._id, person._id);

      if (Array.isArray(data)) {
        setNotes(data);
      } else if (data && typeof data === "object") {
        setNotes([data]);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("loadNotes error:", error);
      setNotes([]);
    }
  }, [person?._id, job?._id, fetchSpecificNotes]);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /* ================= REFRESH LISTENER ================= */

  useEffect(() => {
    const handleRefresh = () => loadNotes();

    window.addEventListener("refresh-candidate-notes", handleRefresh);

    return () => {
      window.removeEventListener("refresh-candidate-notes", handleRefresh);
    };
  }, [loadNotes]);

  /* ================= DELETE NOTE ================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      await removeCandidateNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="w-full flex flex-col gap-6 mt-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Internal Notes
            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          </h3>

          <p className="text-sm text-slate-500">
            Private feedback for {person?.fullName || "Candidate"}
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : notes.length > 0 ? (
          notes.map((note) => {
            const createdDate = note?.createdAt
              ? new Date(note.createdAt)
                  .toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZoneName: "short",
                  })
                  .replace(",", "")
              : "Unknown date";

            return (
              <div
                key={note?._id}
                className="w-full bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(note._id)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                {/* Note Type Badge */}
                <div className="absolute top-6 right-14">
                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1 font-normal text-slate-700 border-slate-200 text-sm lowercase"
                  >
                    {note?.noteType || "general"}
                  </Badge>
                </div>

                {/* Header */}
                <div className="mb-4">
                  <h4 className="text-[18px] font-bold text-[#1e293b] leading-tight">
                    {note?.noteBy?.name || "Unknown User"}
                  </h4>

                  <p className="text-[14px] text-slate-400 mt-1">
                    {createdDate.replace("GMT", "GMT+")}
                  </p>
                </div>

                {/* Content */}
                <div className="mt-6">
                  <p className="text-[16px] text-slate-600 whitespace-pre-wrap leading-normal">
                    {note?.content || "No content"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-[24px] border-2 border-dashed border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-500 font-medium">No notes yet</p>
            <p className="text-sm text-slate-400">
              Be the first to leave a comment about this candidate.
            </p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <CandidateNotesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        person={person}
        job={job}
      />
    </div>
  );
};

export default CandidateNotes;