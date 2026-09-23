import { Tabs } from '@radix-ui/react-tabs';
import React from 'react';

const TabsSections = () => {
    return (
        <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-white/80 backdrop-blur-sm border border-white/20">
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Employee Directory
            </TabsTrigger>
            <TabsTrigger
              value="onboarding"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Onboarding
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Employee Directory Tab Content */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee Directory
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                    variant="outline"
                    size="sm"
                  >
                    {viewMode === "grid" ? "List View" : "Grid View"}
                  </Button>
                  <Button
                    onClick={() =>
                      exportEmployeesToCSV(filteredEmployees, console)
                    }
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  {canEditEmployees && (
                    <Button
                      onClick={() => console.log("Add employee")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search employees by name, ID, email, phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employee Grid/List with Action Buttons */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="relative group">
                    <EmployeeCard employee={employee} viewMode={viewMode} />

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {canEditEmployees && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      {canAssignManagers && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => handleAssignManager(employee)}
                        >
                          <UserCheck className="w-3 h-3" />
                        </Button>
                      )}
                      {canManagePasswords && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => handlePasswordManagement(employee)}
                        >
                          <Key className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No employees found
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ||
                    filterDepartment !== "all" ||
                    filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start by adding your first employee"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab Content */}
        <TabsContent value="onboarding" className="space-y-6">
          <EmployeeOnboarding />
        </TabsContent>
      </Tabs>
    );
};

export default TabsSections;