import { Button } from "@/components/ui/button";
import { Building, Building2, Crown, Plus, Target, Trash2, UserPlus, Users, X } from "lucide-react";

const DepartmentList = ({
  departmentTeams,
  onDelete,
  onCreateTeam,
  onDeleteTeam,
  onTeamPageChange,
  onCreateHead,
  onRemoveHead,
  onCreateTeamMember,
  onDeleteTeamMember,
}) => {
  if (!departmentTeams.length)
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold">No departments found</h3>
        <p className="text-gray-500 mt-2">Create your first department</p>
      </div>
    );

  return (
    <div className="space-y-4 font-poppins">
  {departmentTeams.map(({ department, teams, teamPagination }, index) => (
    <div
      key={department._id}
      className="border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="bg-blue-600 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-700 flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {department.name}
              </h3>
              <p className="text-sm text-blue-100">{department.code}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateTeam(department._id)}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(department._id)}
              className="bg-white/10 border-white/30 text-white hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">

        {/* Department Head */}
        <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-orange-900">
                Department Head
              </h4>
            </div>

            {!department.departmentHead && (
              <Button
                size="sm"
                onClick={() => onCreateHead(department)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Head
              </Button>
            )}
          </div>

          {department.departmentHead ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-200">
              <div>
                <p className="font-semibold text-gray-900">
                  {department.departmentHead.name}
                </p>
                <p className="text-sm text-gray-600">
                  {department.departmentHead.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveHead(department._id)}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-4 text-center text-sm text-gray-600">
              No department head assigned
            </div>
          )}
        </div>

        {/* Teams */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-200">
            <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">
                Teams ({teams.length})
              </h4>
              <p className="text-xs text-blue-700">
                Teams with members
              </p>
            </div>
          </div>

          {teams.length > 0 ? (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4"
                >
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
                      onClick={() => onDeleteTeam(team._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Members */}
                  <div className="bg-white border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-semibold text-blue-900">
                          Team Members ({team.teamMembers.length})
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateTeamMember(team)}
                        className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Member
                      </Button>
                    </div>

                    {team.teamMembers.length > 0 ? (
                      <div className="space-y-2">
                        {team.teamMembers.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {member.email} • {member.employeeId}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onDeleteTeamMember(team._id, member._id)
                              }
                              className="text-red-600 hover:bg-red-50 h-6 w-6 p-0"
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
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Target className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">No Teams Yet</p>
              <p className="text-sm text-gray-600">
                Create your first team
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-4 text-sm">
          <button
            disabled={teamPagination.currentPage === 1}
            onClick={() =>
              onTeamPageChange(
                department._id,
                teamPagination.currentPage - 1
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {teamPagination.currentPage} /{" "}
            {teamPagination.totalPages}
          </span>

          <button
            disabled={
              teamPagination.currentPage === teamPagination.totalPages
            }
            onClick={() =>
              onTeamPageChange(
                department._id,
                teamPagination.currentPage + 1
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

  );
};

export default DepartmentList;
