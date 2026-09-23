"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Crown,
  UserPlus,
  UserCheck,
  X,
  Target,
  Users,
  Shield,
} from "lucide-react";

const DepartmentCard = ({
  dept, // department object
  deptHead, // department head info
  directReports = [], // direct report array
  deptTeams = [], // teams filtered by department
  employees = [], // employee list
  onAddTeam, // add team handler
  onDelete, // delete department handler

  // Head
  setSelectedDept,
  setShowAssignHead,
  handleRemoveHead,

  // Direct Reports
  setShowAddDirectReport,
  handleRemoveDirectReport,

  // Teams
  handleDeleteTeam,
  setSelectedTeam,
  setShowAssignLead,
  handleRemoveLead,
  setShowAddMember,
  handleRemoveMember,
  setTeamForm,
  setShowCreateTeam,
}) => {
  return (
    <Card className="border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all">
      {/* ---------------- HEADER ---------------- */}
      <CardHeader className="bg-blue-600 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-700 flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
              <p className="text-sm text-blue-100">{dept.code}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTeam}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="bg-white/10 border-white/30 text-white hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* ---------------- DEPARTMENT HEAD ---------------- */}
        <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-orange-900">Department Head</h4>
            </div>

            {!deptHead && (
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDept(dept);
                  setShowAssignHead(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Head
              </Button>
            )}
          </div>

          {deptHead ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
              <div>
                <p className="font-semibold text-gray-900">
                  {deptHead?.profile?.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {deptHead.employee_id} • {deptHead?.profile?.email}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveHead(dept.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 font-medium mb-2">
                No department head assigned
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedDept(dept);
                  setShowAssignHead(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Department Head
              </Button>
            </div>
          )}
        </div>

        {/* ---------------- DIRECT REPORTS ---------------- */}
        <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>

              <h4 className="font-semibold text-purple-900">
                Direct Reports ({directReports.length})
              </h4>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedDept(dept);
                setShowAddDirectReport(true);
              }}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Direct Report
            </Button>
          </div>

          {directReports.length > 0 ? (
            <div className="space-y-2">
              {directReports.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {emp.profile?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {emp.employee_id} • {emp.role}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDirectReport(dept.id, emp.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 font-medium">
                No direct reports yet
              </p>
            </div>
          )}
        </div>

        {/* ---------------- TEAMS ---------------- */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-200">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">
                Teams ({deptTeams.length})
              </h4>
              <p className="text-xs text-blue-700">
                Teams with leads and members
              </p>
            </div>
          </div>

          {deptTeams.length > 0 ? (
            <div className="space-y-3">
              {deptTeams.map((team) => {
                const teamLead = employees.find((e) => e.id === team.lead_id);
                const teamMembers = employees.filter((e) =>
                  team.member_ids?.includes(e.id)
                );

                return (
                  <div
                    key={team.id}
                    className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4"
                  >
                    {/* Team Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-semibold text-blue-900">
                          {team.teamName}
                        </h5>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Team Lead */}
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-900">
                            Team Lead
                          </p>
                        </div>
                        {!teamLead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowAssignLead(true);
                            }}
                            className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-200"
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Assign
                          </Button>
                        )}
                      </div>
                      {teamLead && (
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {teamLead.profile?.fullName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {teamLead.employee_id}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLead(team.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Team Members */}
                    <div className="bg-white border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-900">
                            Team Members ({teamMembers.length})
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowAddMember(true);
                          }}
                          className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Member
                        </Button>
                      </div>
                      {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                          {teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {member.profile?.fullName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {member.employee_id} • {member.role}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveMember(team.id, member.id)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                          No members yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-3">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <p className="font-semibold text-gray-900">No Teams Yet</p>
                <p className="text-sm text-gray-600 mt-1">
                  {deptHead
                    ? "You can create teams here."
                    : "Assign a department head first to create teams."}
                </p>
              </div>
              <Button
                size="sm"
                onClick={onAddTeam}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" /> Create First Team
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
