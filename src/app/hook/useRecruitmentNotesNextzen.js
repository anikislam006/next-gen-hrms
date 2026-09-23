"use client";

import { useState, useCallback } from "react";
import {
  addRecruitmentNoteNextzen,
  getNotesByCandidateNextzen,
  deleteRecruitmentNoteNextzen,
} from "../api/recruitment-notes-nextzen";
import { useAuth } from "@/context/AuthContext";

export function useRecruitmentNotesNextzen() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, UserAllDetails } = useAuth();

  const fetchByCandidate = useCallback(async (candidateId) => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const json = await getNotesByCandidateNextzen(candidateId);
      setNotes(json.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitNote = useCallback(
    async ({ candidateId, candidateName, noteType, noteContent }) => {
      setLoading(true);
      try {
        const addedBy = {
          name: user?.displayName || user?.name || "Unknown",
          email: user?.email || "N/A",
          role: user?.role || "N/A",
          designation: UserAllDetails?.designation || "N/A",
        };

        const result = await addRecruitmentNoteNextzen({
          candidateId,
          candidateName,
          noteType,
          noteContent,
          addedBy,
        });

        await fetchByCandidate(candidateId);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchByCandidate, user, UserAllDetails]
  );

  const removeNote = useCallback(
    async (id, candidateId) => {
      try {
        await deleteRecruitmentNoteNextzen(id);
        await fetchByCandidate(candidateId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchByCandidate]
  );

  return { notes, loading, error, fetchByCandidate, submitNote, removeNote };
}