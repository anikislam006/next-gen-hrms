// hooks/useTeams.js
import { useState, useEffect, useMemo } from "react";
import { fetchDepartments, createDepartment, deleteDepartment } from "../api/department";
import { fetchTeams, createTeam, fetchDepartmentTeams, deleteTeam, addTeamMember, deleteTeamMemberAPI } from "../api/team";

export const useTeams = (initialPage = 1, initialSearch = "") => {
  // ---------------- States ----------------
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departmentTeams, setDepartmentTeams] = useState([]);


  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [teamForm, setTeamForm] = useState({ departmentId: "", teamName: "" });
  const [teamMemberForm, setTeamMemberForm] = useState({
  teamId: "",
  employeeId: "",
  email: "",
  name: "",
});


  const [teamPages, setTeamPages] = useState({}); // per-department team page

  // ---------------- Fetch Departments ----------------
  const loadDepartments = async (page = currentPage, search = searchTerm) => {
    try {
      const data = await fetchDepartments(page, search);
      setDepartments(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  // ---------------- Fetch Departments with Teams ----------------
  const loadDepartmentTeams = async (page = currentPage) => {
    try {
      // default deptLimit=4, teamLimit=2 (you can change)
      const data = await fetchDepartmentTeams({
        page,
        deptLimit: 4,
        teamPage: 1,
        teamLimit: 2,
      });

      setDepartmentTeams(data.data);
      setTotalPages(data.departmentPagination?.totalPages || 1);

      // Initialize per-department team page if not exists
      const initTeamPages = {};
      data.data.forEach((dept) => {
        initTeamPages[dept.department._id] = 1;
      });
      setTeamPages(initTeamPages);

    } catch (err) {
      console.error("Failed to load department teams:", err);
    }
  };

  // ---------------- Change Team Page for Department ----------------
  const changeTeamPage = async (departmentId, teamPage) => {
    try {
      setTeamPages((prev) => ({
        ...prev,
        [departmentId]: teamPage,
      }));

      const data = await fetchDepartmentTeams({
        page: currentPage,
        deptLimit: 4,
        teamPage,
        teamLimit: 2,
      });

      setDepartmentTeams(data.data);
    } catch (err) {
      console.error("Failed to change team page:", err);
    }
  };

  // ---------------- Fetch Flat Teams ----------------
  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch (error) {
      console.error("Failed to load teams:", error);
    }
  };

  // ---------------- Filter Departments ----------------
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  const filteredDepartmentTeams = useMemo(() => {
    if (!searchTerm) return departmentTeams;

    const term = searchTerm.toLowerCase();
    return departmentTeams.filter(({ department }) => {
      return (
        department.name.toLowerCase().includes(term) ||
        department.code.toLowerCase().includes(term)
      );
    });
  }, [departmentTeams, searchTerm]);

  // ---------------- Create Department ----------------
  const handleCreateDepartment = async () => {
    if (!deptForm.name || !deptForm.code) return alert("Fill all fields");

    try {
      await createDepartment(deptForm);
      alert("Department created!");
      setDeptForm({ name: "", code: "" });

      // Refresh
      setCurrentPage(1);
      await loadDepartments(1, searchTerm);
      await loadDepartmentTeams(1);

    } catch (error) {
      alert(error.message);
    }
  };

  // ---------------- Create Team ----------------
  const handleCreateTeam = async () => {
    if (!teamForm.departmentId || !teamForm.teamName) return alert("Fill all fields");

    try {
      await createTeam(teamForm);
      alert("Team created!");
      setTeamForm({ departmentId: "", teamName: "" });

      // Refresh
      loadTeams();
      await loadDepartmentTeams(currentPage);
    } catch (error) {
      alert(error.message);
    }
  };

  // ---------------- Delete Department ----------------
  const handleDeleteDepartment = async (departmentId) => {
    if (!departmentId) return alert("Department ID is required");
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      await deleteDepartment(departmentId);
      alert("Department deleted!");

      setCurrentPage(1);
      await loadDepartments(1, searchTerm);
      await loadDepartmentTeams(1);
    } catch (error) {
      alert(error.message);
    }
  };

  // ---------------- Delete Team ----------------
  const handleDeleteTeam = async (teamId) => {
    if (!teamId) return alert("Team ID is required");
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteTeam(teamId);
      alert("Team deleted!");
      await loadTeams();
      await loadDepartmentTeams(currentPage);
    } catch (error) {
      alert(error.message);
    }
  };

  // ---------------- Add Team Member ----------------
const handleAddTeamMember = async (payload) => {
  const { teamId, employeeId, email, name } = payload;

  if (!teamId || !employeeId || !email || !name) {
    throw new Error("Missing required fields");
  }

  try {
    await addTeamMember(teamId, { employeeId, email, name });

    // Refresh teams or department teams
    await loadTeams();
    await loadDepartmentTeams(currentPage);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const handleDeleteTeamMember = async (teamId, memberId) => {
  if (!teamId || !memberId) return alert("Team ID and Member ID are required");
  if (!confirm("Are you sure you want to remove this team member?")) return;

  try {
    await deleteTeamMemberAPI({ teamId, memberId });

    // Refresh the department teams
    await loadDepartmentTeams(currentPage);

    alert("Team member deleted successfully");
  } catch (error) {
    alert(error.message);
  }
};



  // ---------------- Effects ----------------
  useEffect(() => {
    loadDepartments();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadDepartmentTeams(currentPage);
  }, [currentPage]);

  useEffect(() => {
    loadTeams();
  }, []);

  return {
    departments,
    departmentTeams: filteredDepartmentTeams,
    teams,
    filteredDepartments,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    deptForm,
    setDeptForm,
    teamForm,
    setTeamForm,
    handleCreateDepartment,
    handleCreateTeam,
    handleDeleteDepartment,
    handleDeleteTeam,
    teamPages,
    changeTeamPage,
    loadDepartmentTeams,
    handleAddTeamMember,
    handleDeleteTeamMember
  };
};
