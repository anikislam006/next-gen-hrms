"use client";
import React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useMyTeam } from "@/app/hook/useMyTeam";

const designations = [
  "CEO",
  "Head_of_HR",
  "HR_Manager",
  "HR_Executive",
  "CTO",
  "Technical_Lead",
  "Senior_Developer",
  "Head_of_Finance",
  "Finance_Manager",
  "Senior_Accountant",
  "System_Admin",
];

export default function EditEmployeeDialog({
  open,
  onClose,
  editFormData,
  setEditFormData,
  refreshEmployees,
  fetchEmployees
}) {
  const { departments } = useMyTeam();

  const onSave = async () => {
    if (!editFormData._id) {
      toast.error("Invalid Employee ID");
      return;
    }

    try {
      const response = await axios.put(
        `https://code360.pro/api/update-user-data/${editFormData._id}`,
        editFormData
      );

      if (response.data.success) {
        toast.success("Employee updated successfully!");
        onClose();
        if (refreshEmployees) refreshEmployees();
        if (fetchEmployees) fetchEmployees();
      } else {
        toast.error(response.data.message || "Failed to update employee.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Something went wrong while updating employee.");
    }
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onClose}
      title="Edit Employee"
      description="Update employee information and profile details"
      size="LARGE"
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        {/* BASIC INFO TAB */}
        <TabsContent value="basic" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-full-name">Full Name *</Label>
              <Input
                id="edit-full-name"
                value={editFormData.fullName || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status || "pending"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* EMPLOYMENT TAB */}
        <TabsContent value="employment" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-department">Department *</Label>
              <Select
                value={editFormData.department || ""}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments && departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DESIGNATION — now a Select */}
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-designation">Designation</Label>
              <Select
                value={editFormData.designation || ""}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, designation: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-role">Role</Label>
              <Select
                value={editFormData.role || "Employee"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-employment-type">Employment Type</Label>
              <Select
                value={editFormData.employmentType || "Permanent"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, employmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* CONTACT TAB */}
        <TabsContent value="contact" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-address-present">Present Address</Label>
              <Textarea
                id="edit-address-present"
                value={editFormData.presentAddress || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    presentAddress: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-address-permanent">Permanent Address</Label>
              <Textarea
                id="edit-address-permanent"
                value={editFormData.permanentAddress || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    permanentAddress: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* PERSONAL TAB */}
        <TabsContent value="personal" className="space-y-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={
                  editFormData.dateOfBirth
                    ? new Date(editFormData.dateOfBirth).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    dateOfBirth: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-gender">Gender</Label>
              <Select
                value={editFormData.gender || ""}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose} className="rounded-lg font-bold">
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-slate-900 hover:bg-slate-800 rounded-lg font-bold">
          <Save className="w-4 h-4 mr-2" />
          Update Employee
        </Button>
      </div>
    </AccessibleDialog>
  );
}