import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchDepartments, createDepartment, deleteDepartment } from "../api/department";
import { 
  fetchTeams, 
  createTeam, 
  deleteTeam, 
  fetchMyDepartmentTeams, 
  addTeamMember, 
  deleteTeamMemberAPI 
} from "../api/team";
import { useAuth } from "@/context/AuthContext";

export const useMyTeam = (initialPage = 1, initialSearch = "") => {
  // ---------------- Context & Auth ----------------
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  // ---------------- States ----------------
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [departmentTeams, setDepartmentTeams] = useState([]);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [teamForm, setTeamForm] = useState({ departmentId: "", teamName: "" });
  
  const [teamPages, setTeamPages] = useState({}); // Per-department inner team page tracking

  // ---------------- Logic: Load Personalized Data ----------------
  const loadMyDepartmentTeams = useCallback(async (page = currentPage) => {
    if (!userEmail) return;
    
    try {
      const data = await fetchMyDepartmentTeams({
        email: userEmail,
        page,
        deptLimit: 4,
        teamPage: 1,
        teamLimit: 2,
      });

      if (data.success) {
        setDepartmentTeams(data.data);
        setTotalPages(data.departmentPagination?.totalPages || 1);

        // Initialize inner team pages for the UI components
        const initTeamPages = {};
        data.data.forEach((item) => {
          if (item.department?._id) {
            initTeamPages[item.department._id] = 1;
          }
        });
        setTeamPages(initTeamPages);
      }
    } catch (err) {
      console.error("Failed to load personal teams:", err);
    }
  }, [userEmail, currentPage]);

  // ---------------- Logic: Nested Team Pagination ----------------
  const changeTeamPage = async (departmentId, teamPage) => {
    if (!userEmail) return;
    try {
      // Optimistically update the page state for the specific department
      setTeamPages((prev) => ({
        ...prev,
        [departmentId]: teamPage,
      }));

      // Fetch from the personalized API so the view remains filtered to the user
      const data = await fetchMyDepartmentTeams({
        email: userEmail,
        page: currentPage,
        deptLimit: 4,
        teamPage,
        teamLimit: 2,
      });

      if (data.success) {
        setDepartmentTeams(data.data);
      }
    } catch (err) {
      console.error("Failed to change team page:", err);
    }
  };

  // ---------------- Logic: Static Supporting Data ----------------
  const loadDepartments = async () => {
    try {
      const data = await fetchDepartments();
      setDepartments(data.data || []);
    } catch (error) {
      console.error("Failed to load departments list:", error);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data || []);
    } catch (error) {
      console.error("Failed to load flat teams list:", error);
    }
  };

  // ---------------- Handlers: Operations & Refreshes ----------------
  const handleCreateDepartment = async () => {
    if (!deptForm.name || !deptForm.code) return alert("Please fill all fields");
    try {
      await createDepartment(deptForm);
      setDeptForm({ name: "", code: "" });
      setCurrentPage(1); // Reset to first page
      await loadMyDepartmentTeams(1);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.departmentId || !teamForm.teamName) return alert("Please fill all fields");
    try {
      await createTeam(teamForm);
      setTeamForm({ departmentId: "", teamName: "" });
      await loadTeams();
      await loadMyDepartmentTeams(currentPage);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!departmentId || !confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(departmentId);
      setCurrentPage(1);
      await loadMyDepartmentTeams(1);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!teamId || !confirm("Are you sure you want to delete this team?")) return;
    try {
      await deleteTeam(teamId);
      await loadTeams();
      await loadMyDepartmentTeams(currentPage);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddTeamMember = async (payload) => {
    try {
      await addTeamMember(payload.teamId, payload);
      await loadMyDepartmentTeams(currentPage);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteTeamMember = async (teamId, memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await deleteTeamMemberAPI({ teamId, memberId });
      await loadMyDepartmentTeams(currentPage);
    } catch (error) {
      alert(error.message);
    }
  };

  // ---------------- Memoized Filtering ----------------
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

  // ---------------- Side Effects ----------------
  
  // Initial load for static data (used in dropdowns/forms)
  useEffect(() => {
    loadDepartments();
    loadTeams();
  }, []);

  // Primary Data Effect: Syncs with user auth and page changes
  useEffect(() => {
    if (userEmail) {
      loadMyDepartmentTeams(currentPage);
    }
  }, [currentPage, userEmail, loadMyDepartmentTeams]);

  return {
    // Data States
    departments,
    departmentTeams: filteredDepartmentTeams,
    teams,
    
    // UI Controls
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Form States
    deptForm,
    setDeptForm,
    teamForm,
    setTeamForm,
    
    // Operations
    handleCreateDepartment,
    handleCreateTeam,
    handleDeleteDepartment,
    handleDeleteTeam,
    teamPages,
    changeTeamPage,
    handleAddTeamMember,
    handleDeleteTeamMember,
    loadMyDepartmentTeams
  };
};