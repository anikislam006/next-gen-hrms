const BASE_URL = "https://code360.pro";

export const addRecruitmentNoteNextzen = async (data) => {
  const res = await fetch(`${BASE_URL}/add-recruitment-note-nextzen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to add note");
  return json;
};

export const getNotesByCandidateNextzen = async (candidateId) => {
  const res = await fetch(`${BASE_URL}/recruitment-notes-by-candidate-nextzen/${candidateId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch notes");
  return json;
};

export const deleteRecruitmentNoteNextzen = async (id) => {
  const res = await fetch(`${BASE_URL}/delete-recruitment-note-nextzen/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to delete note");
  return json;
};