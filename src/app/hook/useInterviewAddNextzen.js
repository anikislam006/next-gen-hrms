"use client";
import { useState, useEffect, useCallback } from "react";
import { createInterviewNextzen, getAllInterviewsNextzen, deleteInterviewNextzen, updateInterviewResultNextzen } from "../api/interview-nextzen";

let sharedInterviews = [];
let sharedLoading = false;
let listeners = [];

const notify = () => listeners.forEach((l) => l());

export function useInterviewNextzen() {
  const [interviews, setInterviews] = useState(sharedInterviews);
  const [loading, setLoading] = useState(sharedLoading);

  useEffect(() => {
    const listener = () => { setInterviews([...sharedInterviews]); setLoading(sharedLoading); };
    listeners.push(listener);
    return () => { listeners = listeners.filter((l) => l !== listener); };
  }, []);

  const fetchInterviews = useCallback(async (jobId) => {
    sharedLoading = true; notify();
    const res = await getAllInterviewsNextzen({ jobId });
    sharedInterviews = res.interviews || [];
    sharedLoading = false; notify();
  }, []);

  const submitInterviewSuggestion = useCallback(async (data) => {
    sharedLoading = true; notify();
    const res = await createInterviewNextzen(data);
    if (res.success) await fetchInterviews(data.jobRoleId);
    sharedLoading = false; notify();
    return res;
  }, [fetchInterviews]);

  // Inside useInterviewNextzen hook
const submitInterviewResult = useCallback(async (id, marks, feedback, jobId) => {
  sharedLoading = true; notify();
  try {
    const res = await updateInterviewResultNextzen(id, { marks, feedback });
    if (res.success) await fetchInterviews(jobId);
    return res;
  } finally {
    sharedLoading = false; notify();
  }
}, [fetchInterviews]);

  return { interviews, loading, submitInterviewSuggestion, fetchInterviews, submitInterviewResult };
}