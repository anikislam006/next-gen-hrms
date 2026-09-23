"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  addCandidateNote,
  getSpecificCandidateNotes,
  deleteCandidateNote
} from "../api/candidateNote";

/* ================= SHARED STATE ================= */

let sharedNotes = [];
let sharedNotesLoading = false;
let sharedNotesError = null;
let notesListeners = [];

const notifyNotes = () => {
  notesListeners.forEach((listener) => listener());
};

export function useCandidateNotes() {

  const [notes, setNotes] = useState(sharedNotes);
  const [loading, setLoading] = useState(sharedNotesLoading);
  const [error, setError] = useState(sharedNotesError);

  /* ================= LISTENER SYSTEM ================= */

  useEffect(() => {

    const listener = () => {
      setNotes([...sharedNotes]);
      setLoading(sharedNotesLoading);
      setError(sharedNotesError);
    };

    notesListeners.push(listener);

    listener();

    return () => {
      notesListeners = notesListeners.filter((l) => l !== listener);
    };

  }, []);

  /* ================= FETCH SPECIFIC NOTES ================= */

  const fetchSpecificNotes = useCallback(async (jobId, candidateId) => {

    try {

      if (!jobId || !candidateId) {
        console.warn("fetchSpecificNotes: Missing jobId or candidateId");
        return [];
      }

      sharedNotesLoading = true;
      notifyNotes();

      const result = await getSpecificCandidateNotes(jobId, candidateId);

      sharedNotes = Array.isArray(result) ? result : [];
      sharedNotesError = null;

      return sharedNotes;

    } catch (err) {

      sharedNotesError = err.message || "Failed to fetch candidate notes";
      console.error("fetchSpecificNotes error:", err);

      return [];

    } finally {

      sharedNotesLoading = false;
      notifyNotes();

    }

  }, []);

  /* ================= ADD NOTE ================= */

  const submitCandidateNote = useCallback(async (noteData) => {

    try {

      sharedNotesLoading = true;
      notifyNotes();

      const response = await addCandidateNote(noteData);

      if (response?.success) {

        // Optimistic update
        if (response.data) {
          sharedNotes = [response.data, ...sharedNotes];
        }

        window.dispatchEvent(
          new CustomEvent("refresh-candidate-notes")
        );
      }

      return response;

    } catch (err) {

      sharedNotesError = err.message || "Failed to submit candidate note";
      console.error("submitCandidateNote error:", err);

      throw err;

    } finally {

      sharedNotesLoading = false;
      notifyNotes();

    }

  }, []);

  /* ================= DELETE NOTE ================= */

  const removeCandidateNote = useCallback(async (noteId) => {

    try {

      if (!noteId) {
        throw new Error("Note ID is required");
      }

      sharedNotesLoading = true;
      notifyNotes();

      const response = await deleteCandidateNote(noteId);

      if (response?.success) {

        // Optimistic UI update
        sharedNotes = sharedNotes.filter(
          (note) => note._id !== noteId
        );

        notifyNotes();

        window.dispatchEvent(
          new CustomEvent("refresh-candidate-notes")
        );
      }

      return response;

    } catch (err) {

      sharedNotesError = err.message || "Failed to delete candidate note";
      console.error("removeCandidateNote error:", err);

      throw err;

    } finally {

      sharedNotesLoading = false;
      notifyNotes();

    }

  }, []);

  /* ================= RETURN ================= */

  return {
    notes,
    loading,
    error,
    fetchSpecificNotes,
    submitCandidateNote,
    removeCandidateNote
  };

}