const BASE_URL = "https://code360.pro";

export const createAssessmentResultNextzen = async (data) => {
  const res = await fetch(`${BASE_URL}/add-assessment-result-nextzen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to save result");
  return json;
};

export const getAssessmentResultsByCandidateNextzen = async (candidateId) => {
  const res = await fetch(`${BASE_URL}/assessment-results-by-candidate-nextzen/${candidateId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch results");
  return json;
};

export const updateAssessmentResultNextzen = async (id, data) => {
  const res = await fetch(`${BASE_URL}/update-assessment-result-nextzen/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to update result");
  return json;
};

export const deleteAssessmentResultNextzen = async (id) => {
  const res = await fetch(`${BASE_URL}/delete-assessment-result-nextzen/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to delete result");
  return json;
};