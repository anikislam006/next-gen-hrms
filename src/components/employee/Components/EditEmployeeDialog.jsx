"use client";
import React, { useState } from "react";
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
import { useMyTeam } from "@/app/hook/useMyTeam";
import { updateEmployeeProfile } from "@/app/api/employeeProfiles";

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

// Normalizes a date value (Date, ISO string, or "") to a plain "YYYY-MM-DD"
// string so old vs. new values can be compared reliably.
function toDateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function EditEmployeeDialog({
  open,
  onClose,
  editFormData,
  setEditFormData,
  originalEmployee,
  refreshEmployees,
}) {
  const { departments } = useMyTeam();
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const designationChanged =
    (editFormData.designation || "") !== (originalEmployee?.designation || "");
  const joiningDateChanged =
    toDateOnly(editFormData.joiningDate) !== toDateOnly(originalEmployee?.joiningDate);
  const markingAsLeft =
    editFormData.status === "left" && (originalEmployee?.status || "") !== "left";
  const remarkRequired = designationChanged || joiningDateChanged || markingAsLeft;

  const onSave = async () => {
    if (!editFormData._id) {
      toast.error("Invalid Employee ID");
      return;
    }

    if (remarkRequired && !remark.trim()) {
      toast.error(
        "Please add a remark explaining the designation/joining date change before saving."
      );
      return;
    }

    if (markingAsLeft && !editFormData.leftDate) {
      toast.error("Please set the leaving date before marking this employee as Left.");
      return;
    }

    const selectedDept = departments?.find((d) => d.name === editFormData.department);

    const updates = {
      full_name: editFormData.fullName || null,
      phone: editFormData.phone || null,
      department_id: selectedDept ? selectedDept._id : editFormData.departmentId || null,
      designation: editFormData.designation || null,
      role: editFormData.role || "Employee",
      employment_type: editFormData.employmentType || "Probation",
      joining_date: editFormData.joiningDate ? toDateOnly(editFormData.joiningDate) : null,
      probation_months:
        editFormData.employmentType === "Probation" ? editFormData.probationMonths || 6 : null,
      status: editFormData.status || "active",
      left_date: editFormData.status === "left" ? toDateOnly(editFormData.leftDate) || null : null,
      present_address: editFormData.presentAddress || null,
      permanent_address: editFormData.permanentAddress || null,
      date_of_birth: editFormData.dateOfBirth ? toDateOnly(editFormData.dateOfBirth) : null,
      gender: editFormData.gender || null,
    };

    const previous = {
      designation: originalEmployee?.designation || "",
      joining_date: originalEmployee?.joiningDate ? toDateOnly(originalEmployee.joiningDate) : null,
      status: originalEmployee?.status || "",
    };

    try {
      setSaving(true);
      await updateEmployeeProfile({
        profileId: editFormData._id,
        updates,
        previous,
        remark: remark.trim() || null,
      });
      toast.success("Employee updated successfully!");
      setRemark("");
      onClose();
      if (refreshEmployees) refreshEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error(error?.message || "Something went wrong while updating employee.");
    } finally {
      setSaving(false);
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
              <Label className="mb-2 text-gray-500" htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email || ""}
                disabled
                title="Email is tied to the employee's sign-in account and can't be changed here."
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
                value={editFormData.status || "active"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inProgress">Needs Update</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="left">Left the company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editFormData.status === "left" && (
              <div>
                <Label className="mb-2 text-gray-500" htmlFor="edit-left-date">
                  Leaving Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-left-date"
                  type="date"
                  value={toDateOnly(editFormData.leftDate)}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, leftDate: e.target.value })
                  }
                />
                <p className="text-xs text-amber-600 mt-1">
                  Used for the Monthly Left-Employee and Turnover reports.
                </p>
              </div>
            )}
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
                value={editFormData.employmentType || "Probation"}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, employmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Semi Permanent">Semi Permanent</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 text-gray-500" htmlFor="edit-joining-date">Joining Date</Label>
              <Input
                id="edit-joining-date"
                type="date"
                value={toDateOnly(editFormData.joiningDate)}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, joiningDate: e.target.value })
                }
              />
            </div>

            {editFormData.employmentType === "Probation" && (
              <div>
                <Label className="mb-2 text-gray-500" htmlFor="edit-probation-months">
                  Probation Months
                </Label>
                <Select
                  value={String(editFormData.probationMonths || 6)}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, probationMonths: Number(value) })
                  }
                >
                  <SelectTrigger id="edit-probation-months">
                    <SelectValue placeholder="Select months" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} month{m > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Counted from the joining date above. Defaults to 6 months if not set.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Label className="mb-2 text-gray-500" htmlFor="edit-remark">
              Remark {remarkRequired && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="edit-remark"
              placeholder={
                remarkRequired
                  ? "Required: explain the reason for this designation/joining date/status change"
                  : "Optional note about this update"
              }
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            {remarkRequired && (
              <p className="text-xs text-amber-600 mt-1">
                A remark is required when changing designation, joining date, or marking someone as
                left — it's saved to this employee's history.
              </p>
            )}
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
                value={toDateOnly(editFormData.dateOfBirth)}
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
        <Button variant="outline" onClick={onClose} className="rounded-lg font-bold" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          className="bg-slate-900 hover:bg-slate-800 rounded-lg font-bold"
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Update Employee"}
        </Button>
      </div>
    </AccessibleDialog>
  );
}
