"use client";

import React from "react";
import { motion } from "framer-motion";
import DepartmentCard from "./DepartmentCard";

const DepartmentList = ({
  departments,
  employees,
  teams,
  onAddTeam,
  onDeleteDepartment,
  setSelectedDept,
  setShowAssignHead,
  setShowAddDirectReport,
  setSelectedTeam,
  setShowAssignLead,
  setShowAddMember,
  setTeamForm,
  handleRemoveHead,
  handleRemoveDirectReport,
  handleRemoveLead,
  handleRemoveMember,
  handleDeleteTeam,
}) => {
  return (
    <div className="space-y-4">
      {departments.length === 0 && (
        <div className="text-center text-gray-500 p-8 border rounded-md">
          <p className="text-lg font-semibold">No departments found</p>
        </div>
      )}

      {departments.map((dept) => {
        const deptTeams = teams.filter((t) => t.department_id === (dept._id || dept.id));
        const deptHead = employees.find((e) => e.id === dept.head_id);
        const directReports = employees.filter((e) => dept.direct_report_ids?.includes(e.id));


        return (
          <motion.div
            key={dept._id || dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DepartmentCard
              dept={dept}
              deptHead={deptHead}
              directReports={directReports}
              deptTeams={deptTeams}
              employees={employees}
              onAddTeam={() => onAddTeam(dept._id || dept.id)}
              onDelete={() => onDeleteDepartment(dept._id || dept.id)}
              setSelectedDept={setSelectedDept}
              setShowAssignHead={setShowAssignHead}
              setShowAddDirectReport={setShowAddDirectReport}
              setSelectedTeam={setSelectedTeam}
              setShowAssignLead={setShowAssignLead}
              setShowAddMember={setShowAddMember}
              setTeamForm={setTeamForm}
              handleRemoveHead={handleRemoveHead}
              handleRemoveDirectReport={handleRemoveDirectReport}
              handleRemoveLead={handleRemoveLead}
              handleRemoveMember={handleRemoveMember}
              handleDeleteTeam={handleDeleteTeam}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default DepartmentList;
