"use client";
import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function EmployeeDetailsDialog({
  open,
  onClose,
  employee,
  onEdit,
}) {
  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onClose}
      title="Employee Details"
      description="Complete employee information and profile details"
      size="LARGE"
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Full Name</Label>
                <p className="mt-2">{employee.fullName}</p>
              </div>
              <div>
                <Label className="text-gray-500">Employee Id</Label>
                <p className="mt-2">{employee.employeeId}</p>
              </div>
              <div>
                <Label className="text-gray-500">Email</Label>
                <p className="mt-2">{employee.email}</p>
              </div>
              <div>
                <Label className="text-gray-500">Phone</Label>
                <p className="mt-2">{employee.phone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Department</Label>
                <p className="mt-2">{employee.department}</p>
              </div>
              <div>
                <Label className="text-gray-500">Designation</Label>
                <p className="mt-2">{employee.designation}</p>
              </div>
              <div>
                <Label className="text-gray-500">Status</Label>
                <p className="mt-2">{employee.status}</p>
              </div>
              <div>
                <Label className="text-gray-500">Employment Type</Label>
                <p className="mt-2">{employee.employmentType}</p>
              </div>
              {employee.employmentType === "Probation" && (
                <div>
                  <Label className="text-gray-500">Probation Length</Label>
                  <p className="mt-2">{employee.probationMonths || 6} month(s)</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="employment" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Joining Date</Label>
                <p className="mt-2">
                  {employee.joiningDate
                    ? new Date(employee.joiningDate).toISOString().split("T")[0]
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Confirmation Date</Label>
                <p className="mt-2">
                  {employee.createdAt
                    ? new Date(employee.createdAt).toISOString().split("T")[0]
                    : "N/A"}
                </p>
              </div>
                  
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Gross Salary</Label>
                <p className="mt-2">
                  {employee.grossSalary ? `৳ ${employee.grossSalary}` : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Reporting Manager</Label>
                <p className="mt-2">{employee.reportingManager || "N/A"}</p>
              </div>
              {/* <div>
                <Label className="text-gray-500">Basic Salary</Label>
                <p className="mt-2">{employee.designation}</p>
              </div> */}
            
            </div>
          </div>
        </TabsContent>
        <TabsContent value="personal" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Date fo Birth</Label>
                <p className="mt-2">
                  {employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toISOString().split("T")[0]
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-gray-500">Gender</Label>
                <p className="mt-2">
                  {employee.gender}
                </p>
              </div>
               <div>
                <Label className="text-gray-500">Marital Status</Label>
                <p className="mt-2">৳ {employee.maritalStatus}</p>
              </div>
              <div>
                <Label className="text-gray-500">Nationality</Label>
                <p className="mt-2">{employee.nationality}</p>
              </div>
                            <div>
                <Label className="text-gray-500">Present Address</Label>
                <p className="mt-2">{employee.presentAddress}</p>
              </div>
              <div>
                <Label className="text-gray-500">Permanent Address</Label>
                <p className="mt-2">{employee.permanentAddress}</p>
              </div>
                  
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-500">Emergency Contact</Label>
                <p className="mt-2">Name : {employee.emergencyContact.name}</p>
                <p className="">Phone : {employee.emergencyContact.phone}</p>
                <p className="">Relation : {employee.emergencyContact.relation}</p>
              </div>

              <div>
                <Label className="text-gray-500">Passport Number</Label>
                <p className="mt-2">{employee.passportNumber}</p>
              </div>
              <div>
                <Label className="text-gray-500">Nid Number</Label>
                <p className="mt-2">{employee.nidNumber}</p>
              </div>
              <div>
                <Label className="text-gray-500">Tin Number</Label>
                <p className="mt-2">{employee.tinNumber}</p>
              </div>
              <div>
                <Label className="text-gray-500">Bank Details</Label>
                <p className="mt-2">
                  {employee.bankName || "N/A"}
                  {employee.bankAccountNumber ? ` — ${employee.bankAccountNumber}` : ""}
                </p>
                {employee.bankBranch && <p className="text-sm text-gray-500">{employee.bankBranch} branch</p>}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Employee
        </Button>
      </div>
    </AccessibleDialog>
  );
}
