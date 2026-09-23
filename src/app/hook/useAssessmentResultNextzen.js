"use client";

import { useState, useCallback } from "react";
import {
  createAssessmentResultNextzen,
  getAssessmentResultsByCandidateNextzen,
  updateAssessmentResultNextzen,
  deleteAssessmentResultNextzen,
} from "../api/assessment-result-nextzen";
import { useAuth } from "@/context/AuthContext";

export function useAssessmentResultNextzen() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({
    totalTests: 0,
    avgScore: 0,
    highest: 0,
    lowest: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, UserAllDetails } = useAuth();

  const fetchByCandidate = useCallback(async (candidateId) => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    try {
      const json = await getAssessmentResultsByCandidateNextzen(candidateId);
      setResults(json.results || []);
      setSummary(json.summary || { totalTests: 0, avgScore: 0, highest: 0, lowest: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitResult = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const evaluatedBy = {
          name: user?.displayName || user?.name || "Unknown",
          email: user?.email || "N/A",
          role: user?.role || "N/A",
          designation: UserAllDetails?.designation || "N/A",
        };

        const result = await createAssessmentResultNextzen({ ...data, evaluatedBy });
        if (data.candidateId) {
          await fetchByCandidate(data.candidateId);
        }
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

  const updateResult = useCallback(
    async (id, data, candidateId) => {
      try {
        const result = await updateAssessmentResultNextzen(id, data);
        if (candidateId) await fetchByCandidate(candidateId);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchByCandidate]
  );

  const removeResult = useCallback(
    async (id, candidateId) => {
      try {
        await deleteAssessmentResultNextzen(id);
        if (candidateId) await fetchByCandidate(candidateId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchByCandidate]
  );

  return {
    results,
    summary,
    loading,
    error,
    fetchByCandidate,
    submitResult,
    updateResult,
    removeResult,
  };
}