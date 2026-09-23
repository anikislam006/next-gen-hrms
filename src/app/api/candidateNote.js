/**
 * Sends a candidate note to the backend
 */
export const addCandidateNote = async (noteData) => {
  try {
    const res = await fetch("https://code360.pro/add-candidate-note-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteData),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return JSON. Check if the backend is running.");
    }

    const data = await res.json();

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to add candidate note");

  } catch (error) {
    console.error("addCandidateNote API error:", error);
    throw error;
  }
};



/**
 * Fetch notes for specific candidate
 */
export const getSpecificCandidateNotes = async (jobId, candidateId) => {
  try {
    if (!jobId || !candidateId) {
      console.warn("jobId or candidateId missing");
      return [];
    }

    const params = new URLSearchParams({
      jobId,
      candidateId,
    });

    const res = await fetch(
      `https://code360.pro/specific-candidate-notes-details?${params.toString()}`
    );

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    if (data?.success) {
      return data?.data || [];
    }

    return [];

  } catch (error) {
    console.error("Error fetching candidate notes:", error);
    return [];
  }
};



/**
 * Delete candidate note
 */
export const deleteCandidateNote = async (noteId) => {
  try {

    if (!noteId) {
      throw new Error("Note ID is required");
    }

    const res = await fetch(
      `https://code360.pro/delete-candidate-note/${noteId}`,
      {
        method: "DELETE",
      }
    );

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return JSON");
    }

    const data = await res.json();

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to delete note");

  } catch (error) {
    console.error("deleteCandidateNote API error:", error);
    throw error;
  }
};