// api/team.js
export const fetchTeams = async () => {
  try {
    const res = await fetch("https://code360.pro/api/get-teams");
    const data = await res.json();
    if (data.success) {
      return data.data.map((t) => ({
        ...t,
        department_id: t.department_id || t.departmentId,
        id: t._id || t.id,
      }));
    }
    throw new Error("Failed to fetch teams");
  } catch (error) {
    console.error("fetchTeams error:", error);
    throw error;
  }
};

export const fetchDepartmentTeams = async ({
  page = 1,
  deptLimit = 4,
  teamPage = 1,
  teamLimit = 2,
}) => {
  const res = await fetch(
    `https://code360.pro/api/departments-with-teams?page=${page}&deptLimit=${deptLimit}&teamPage=${teamPage}&teamLimit=${teamLimit}`
  );

  const data = await res.json();
  if (!data.success) throw new Error("Failed");

  return data;
};

// ../api/team.js
export const fetchMyDepartmentTeams = async ({
  email,
  page = 1,
  deptLimit = 4,
  teamPage = 1,
  teamLimit = 2,
}) => {
  const encodedEmail = encodeURIComponent(email);

  // Removed /api/ as requested
  const res = await fetch(
    `https://code360.pro/departments-with-myteam/${encodedEmail}?page=${page}&deptLimit=${deptLimit}&teamPage=${teamPage}&teamLimit=${teamLimit}`
  );

  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch your teams");

  return data;
};

export const createTeam = async (teamForm) => {
  try {
    const res = await fetch("https://code360.pro/api/add-team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    });
    const data = await res.json();
    if (data.success) return data;
    throw new Error(data.message || "Failed to create team");
  } catch (error) {
    console.error("createTeam error:", error);
    throw error;
  }
};

export const deleteTeam = async (teamId) => {
  const res = await fetch("https://code360.pro/api/delete-team", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to delete team");
  return data;
};

// ADD TEAM MEMBER
export const addTeamMember = async (teamId, payload) => {
  try {
    const res = await fetch(`https://code360.pro/api/add-team-member/${teamId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) return data;
    throw new Error(data.message || "Failed to add team member");
  } catch (error) {
    console.error("addTeamMember error:", error);
    throw error;
  }
};

// DELETE /api/delete-team-member
export const deleteTeamMemberAPI = async ({ teamId, memberId }) => {
  try {
    const res = await fetch("https://code360.pro/api/delete-team-member", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, memberId }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to delete team member");
    return data;
  } catch (error) {
    console.error("deleteTeamMemberAPI error:", error);
    throw error;
  }
};



