const BASE_URL = "https://code360.pro";

export const createInterviewNextzen = async (interviewForm) => {
  const res = await fetch(`${BASE_URL}/add-interview-post-nextzen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(interviewForm),
  });
  return await res.json();
};

export const getAllInterviewsNextzen = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/all-interviews-nextzen?${query}`);
  return await res.json();
};

export const deleteInterviewNextzen = async (id) => {
  const res = await fetch(`${BASE_URL}/delete-interview-nextzen/${id}`, {
    method: "DELETE",
  });
  return await res.json();
};

// Update Result in the same interview document
export const updateInterviewResultNextzen = async (id, resultData) => {
  try {
    const res = await fetch(`${BASE_URL}/update-interview-result-nextzen/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData),
    });
    return await res.json();
  } catch (error) {
    throw error;
  }
};