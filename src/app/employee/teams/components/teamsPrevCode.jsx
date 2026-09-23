"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "./components/Header";
import SearchDepartment from "./components/SearchDepartment";
import DepartmentList from "./components/DepartmentList";

import CreateDepartmentDialog from "./components/Dialogs/CreateDepartmentDialog";
import CreateTeamDialog from "./components/Dialogs/CreateTeamDialog";
import AssignHeadDialog from "./components/Dialogs/AssignHeadDialog";
import AddDirectReportDialog from "./components/Dialogs/AddDirectReportDialog";
import AssignLeadDialog from "./components/Dialogs/AssignLeadDialog";
import AddMemberDialog from "./components/Dialogs/AddMemberDialog";

import States from "./components/States";

export default function TeamsPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  const [showCreateDept, setShowCreateDept] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAssignHead, setShowAssignHead] = useState(false);
  const [showAddDirectReport, setShowAddDirectReport] = useState(false);
  const [showAssignLead, setShowAssignLead] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: "", code: "" });

  // IMPORTANT: correct keys for backend
  const [teamForm, setTeamForm] = useState({
    departmentId: "",
    teamName: ""
  });

  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ---------------- Fetch Departments ----------------
  const fetchDepartments = async (page = 1, search = "") => {
    try {
      const res = await fetch(
        `https://code360.pro/api/get-department?page=${page}&name=${search}`
      );
      const data = await res.json();
      if (data.success) {
        setDepartments(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Fetch Departments Error:", error);
    }
  };

  useEffect(() => {
    fetchDepartments(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // ---------------- Fetch Teams ----------------
 const fetchTeams = async () => {
  try {
    const res = await fetch("https://code360.pro/api/get-teams");
    const data = await res.json();
    if (data.success) {
      // normalize the key
      const normalized = data.data.map((t) => ({
        ...t,
        department_id: t.department_id || t.departmentId,
        id: t._id || t.id
      }));
      setTeams(normalized);
    }
  } catch (err) {
    console.error("Fetch Teams Error:", err);
  }
};


  useEffect(() => {
    fetchTeams();
  }, []);

  // ---------------- Mock Employees ----------------
  useEffect(() => {
    const dummyEmployees = Array.from({ length: 12 }, (_, i) => ({
      id: i.toString(),
      employee_id: `EMP${1000 + i}`,
      role: i % 3 === 0 ? "Manager" : "Staff",
      profile: {
        full_name: `Employee ${i + 1}`,
        email: `employee${i + 1}@company.com`,
      },
      direct_report: false,
    }));
    setEmployees(dummyEmployees);
  }, []);

  // ---------------- Filter Departments ----------------
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  // ---------------- Available Employees Filter ----------------
  const getAvailableEmployees = (type, search = "") => {
    let excludedIds = [];

    if (type === "head")
      excludedIds = departments.map((d) => d.head_id).filter(Boolean);

    else if (type === "direct_report")
      excludedIds = employees.filter((e) => e.direct_report).map((e) => e.id);

    else if (type === "lead")
      excludedIds = teams.map((t) => t.lead_id).filter(Boolean);

    else if (type === "member")
      excludedIds = teams.flatMap((t) => t.member_ids || []);

    return employees.filter(
      (e) =>
        !excludedIds.includes(e.id) &&
        (e.profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
          e.employee_id.toLowerCase().includes(search.toLowerCase()))
    );
  };

  // ---------------- Create Department ----------------
  const handleCreateDepartment = async () => {
    if (!deptForm.name || !deptForm.code)
      return alert("Fill all fields");

    try {
      const res = await fetch("https://code360.pro/api/add-department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm),
      });

      const data = await res.json();
      if (!data.success) return alert(data.message);

      alert("Department created!");
      setShowCreateDept(false);
      setDeptForm({ name: "", code: "" });
      fetchDepartments(currentPage, searchTerm);
    } catch (error) {
      console.error(error);
      alert("Error creating department");
    }
  };

  // ---------------- Create Team (PERFECT) ----------------
  const handleCreateTeam = async () => {
    if (!teamForm.departmentId || !teamForm.teamName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("https://code360.pro/api/add-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Unable to create team");
        return;
      }

      alert("Team created!");

      setTeamForm({ departmentId: "", teamName: "" });
      setShowCreateTeam(false);

      fetchTeams(); // refresh team list

    } catch (error) {
      console.error("Create team error:", error);
      alert("Something went wrong while creating the team");
    }
  };

  // ---------------- Delete Department ----------------
  const handleDeleteDepartment = (id) => {
    setDepartments((prev) => prev.filter((d) => d._id !== id));
    setTeams((prev) => prev.filter((t) => t.departmentId !== id));
    fetchDepartments(currentPage, searchTerm);
  };

  const handleDeleteTeam = (id) =>
    setTeams((prev) => prev.filter((t) => t._id !== id));

  // ---------------- Render ----------------
  return (
    <div className="space-y-8 p-5">
      <Header onNewDepartment={() => setShowCreateDept(true)} />
      <States />
      <SearchDepartment searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <DepartmentList
        departments={filteredDepartments}
        employees={employees}
        teams={teams}
        onAddTeam={(deptId) => {
          setSelectedDept(departments.find((d) => d._id === deptId));
          setShowCreateTeam(true);
          setTeamForm({ departmentId: deptId, teamName: "" });
        }}
        onDeleteDepartment={handleDeleteDepartment}
        setSelectedDept={setSelectedDept}
        setShowAssignHead={setShowAssignHead}
        setShowAddDirectReport={setShowAddDirectReport}
        setSelectedTeam={setSelectedTeam}
        setShowAssignLead={setShowAssignLead}
        setShowAddMember={setShowAddMember}
        handleDeleteTeam={handleDeleteTeam}
      />

      {/* ----------- Dialogs ----------- */}
      <CreateDepartmentDialog
        showCreateDept={showCreateDept}
        setShowCreateDept={setShowCreateDept}
        deptForm={deptForm}
        setDeptForm={setDeptForm}
        handleCreateDepartment={handleCreateDepartment}
      />

      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
        teamForm={teamForm}
        setTeamForm={setTeamForm}
        departments={departments}
        onCreate={handleCreateTeam}
      />

      <AssignHeadDialog
        showAssignHead={showAssignHead}
        setShowAssignHead={setShowAssignHead}
        selectedDept={selectedDept}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employeeSearchTerm={employeeSearchTerm}
        setEmployeeSearchTerm={setEmployeeSearchTerm}
        getAvailableEmployees={getAvailableEmployees}
        handleAssignHead={() => {}}
      />

      <AddDirectReportDialog
        showAddDirectReport={showAddDirectReport}
        setShowAddDirectReport={setShowAddDirectReport}
        selectedDept={selectedDept}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employeeSearchTerm={employeeSearchTerm}
        setEmployeeSearchTerm={setEmployeeSearchTerm}
        getAvailableEmployees={getAvailableEmployees}
        handleAddDirectReport={() => {}}
      />

      <AssignLeadDialog
        showAssignLead={showAssignLead}
        setShowAssignLead={setShowAssignLead}
        selectedTeam={selectedTeam}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employeeSearchTerm={employeeSearchTerm}
        setEmployeeSearchTerm={setEmployeeSearchTerm}
        getAvailableEmployees={getAvailableEmployees}
      />

      <AddMemberDialog
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        selectedTeam={selectedTeam}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        employeeSearchTerm={employeeSearchTerm}
        setEmployeeSearchTerm={setEmployeeSearchTerm}
        getAvailableEmployees={getAvailableEmployees}
      />
    </div>
  );
}
