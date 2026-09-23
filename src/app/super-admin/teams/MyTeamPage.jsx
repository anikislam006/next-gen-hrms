"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import Header from "./components/Header";
import SearchDepartment from "./components/SearchDepartment";
import DepartmentList from "./teamsComp/DepartmentList";
import Pagination from "./teamsComp/Pagination";
import CreateDepartmentDialog from "./components/Dialogs/CreateDepartmentDialog";
import CreateTeamDialog from "./components/Dialogs/CreateTeamDialog";
import States from "./components/States";
import AssignHeadDialog from "./components/Dialogs/AssignHeadDialog";
import AddMemberDialog from "./components/Dialogs/AddMemberDialog";

import { useMyTeam } from "../../hook/useMyTeam";
import { useDepartments } from "@/app/hook/useDepartment";

export default function MyTeamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "departments";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [showDeptModal, setShowDeptModal] = React.useState(false);
  const [showAssignHead, setShowAssignHead] = React.useState(false);
  const [showAssignTeamMember, setShowAssignTeamMember] = React.useState(false);
  const [selectedDept, setSelectedDept] = React.useState(null);
  const [selectedTeam, setSelectedTeam] = React.useState(null);

  const { assignHead, removeHead } = useDepartments();

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
    loadMyDepartmentTeams, // Personalized loader
    handleAddTeamMember,
    handleDeleteTeamMember,
  } = useMyTeam(pageFromUrl, "");

  // 1. CRITICAL FIX: Ensure personal teams load on mount and page change
  useEffect(() => {
    loadMyDepartmentTeams(currentPage);
  }, [currentPage]); 

  // Sync page from URL to internal state
  useEffect(() => {
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
      await loadMyDepartmentTeams(currentPage); 
      toast.success("Department head assigned successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAssignTeamMember = async (employee) => {
    try {
      const payload = {
        teamId: selectedTeam._id,
        employeeId: employee.employeeId,
        email: employee.email,
        name: employee.fullName,
      };
      await handleAddTeamMember(payload);
      await loadMyDepartmentTeams(currentPage); 
      toast.success("Team member assigned successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveHead = async (deptId) => {
    try {
      await removeHead(deptId);
      await loadMyDepartmentTeams(currentPage); 
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            <div className="flex-1">
              <SearchDepartment
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            
            <div className="px-4 py-2 bg-[#e2ff31] text-black rounded-lg font-bold text-sm shadow-xl uppercase tracking-wider">
              My Teams Overview
            </div>
          </div>

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
            onRemoveHead={(deptId) => handleRemoveHead(deptId)}
            onDeleteTeamMember={handleDeleteTeamMember}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={updatePageInUrl}
          />
        </div>
      )}

      {/* Dialogs */}
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