"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Header from "./components/Header";
import SearchDepartment from "./components/SearchDepartment";
import DepartmentList from "./teamsComp/DepartmentList";
import Pagination from "./teamsComp/Pagination";
import CreateDepartmentDialog from "./components/Dialogs/CreateDepartmentDialog";
import CreateTeamDialog from "./components/Dialogs/CreateTeamDialog";
import States from "./components/States";
import { useTeams } from "../../hook/useTeams";
import AssignHeadDialog from "./components/Dialogs/AssignHeadDialog";
import EmployeeList from "./components/EmployeeList";
import { useDepartments } from "@/app/hook/useDepartment";
import { toast } from "sonner";
import AddMemberDialog from "./components/Dialogs/AddMemberDialog";

export default function TeamsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "departments";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [showDeptModal, setShowDeptModal] = React.useState(false);
  const [showAssignHead, setShowAssignHead] = React.useState(false);
  const [showAssignTeamMember, setShowAssignTeamMember] = React.useState(false);
   
  const [selectedDept, setSelectedDept] = React.useState(null);
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  
  
  const { loading, assignHead, removeHead } = useDepartments();
  const {
    departments,
    departmentTeams,
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
    changeTeamPage,
    loadDepartmentTeams,
    handleAddTeamMember,
    handleDeleteTeamMember
  } = useTeams(pageFromUrl, "");

  // Sync page from URL
  React.useEffect(() => {
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  const updatePageInUrl = (page) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", currentTab);
    params.set("page", page);
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
    setCurrentPage(page);
  };

  const handleAssignHead = async (employee) => {
    try {
      await assignHead(selectedDept._id, employee);
      await loadDepartmentTeams(currentPage);
      toast.success("Department head assigned successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAssignTeamMember = async (employee) => {
  try {
    const payload = {
      teamId: selectedTeam._id, // ✅ use selectedTeam._id
      employeeId: employee.employeeId,
      email: employee.email,
      name: employee.fullName,
    };

    console.log("ddd",payload);
    
    await handleAddTeamMember(payload);
    await loadDepartmentTeams(currentPage);

    toast.success("Team member assigned successfully");
  } catch (error) {
    toast.error(error.message);
  }
};



  const handleRemoveHead = async (deptId) => {
    try {
      await removeHead(deptId);
      await loadDepartmentTeams(currentPage);
      toast.success("Department head removed successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8 p-5 font-poppins">
      <Header onNewDepartment={() => setShowDeptModal(true)} />
      <States />
      {currentTab === "departments" && (
        <div className="space-y-4">
          <SearchDepartment
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* ✅ Department-wise paginated teams */}
          <DepartmentList
            departmentTeams={departmentTeams}
            onDelete={handleDeleteDepartment}
            onDeleteTeam={handleDeleteTeam}
            onCreateTeam={(deptId) =>
              setTeamForm({ departmentId: deptId, teamName: "" })
            }
            onCreateHead={(dept) => {
              setSelectedDept(dept);
              setShowAssignHead(true);
            }}
            onCreateTeamMember={(dept) => {
              setSelectedTeam(dept);
              setShowAssignTeamMember(true);
            }}
            onTeamPageChange={changeTeamPage}
            onRemoveHead={(deptId) => handleRemoveHead(deptId)} // ✅ ADD
            
           onDeleteTeamMember={handleDeleteTeamMember}
          />

          {/* Global page = department teams page */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={updatePageInUrl}
          />
        </div>
      )}

      <CreateDepartmentDialog
        showCreateDept={showDeptModal}
        setShowCreateDept={setShowDeptModal}
        deptForm={deptForm}
        setDeptForm={setDeptForm}
        handleCreateDepartment={handleCreateDepartment}
        setShowDeptModal={setShowDeptModal}
      />

      <CreateTeamDialog
        open={!!teamForm.departmentId}
        onOpenChange={() => setTeamForm({ departmentId: "", teamName: "" })}
        teamForm={teamForm}
        setTeamForm={setTeamForm}
        departments={departments}
        onCreate={handleCreateTeam}
      />

      {/* Assign Department Head Dialog */}
      <AssignHeadDialog
        open={showAssignHead}
        setOpen={setShowAssignHead}
        selectedDept={selectedDept}
        onAssign={handleAssignHead}
      />
     <AddMemberDialog
  open={showAssignTeamMember}
  setOpen={setShowAssignTeamMember}
  selectedTeam={selectedTeam}
  onAssign={handleAssignTeamMember}
/>

    </div>
  );
}
