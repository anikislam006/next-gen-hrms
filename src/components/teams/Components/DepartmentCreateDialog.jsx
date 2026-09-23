"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Save, Building2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const DepartmentCreateDialog = ({ open, setOpen }) => {
  // --- Fake employees data for Department Head dropdown ---
  const employees = [
    { id: "e1", full_name: "Alice Johnson", designation: "Manager" },
    { id: "e2", full_name: "Bob Smith", designation: "Team Lead" },
    { id: "e3", full_name: "Charlie Brown", designation: "Senior Developer" },
  ];

  // --- Form state ---
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    description: "",
    budget: "",
    location: "",
    phone: "",
    email: "",
    head_id: "none",
    objectives: [""],
  });

  const [loading, setLoading] = useState(false);

  // --- Objectives Handlers ---
  const addObjective = () => {
    setFormData((prev) => ({ ...prev, objectives: [...prev.objectives, ""] }));
  };

  const updateObjective = (index, value) => {
    const updated = [...formData.objectives];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, objectives: updated }));
  };

  const removeObjective = (index) => {
    const filtered = formData.objectives.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, objectives: filtered }));
  };

  // --- Handle Create Department ---
  const handleCreateDepartment = async () => {
    if (!formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setLoading(true);
    try {
      // Example API call
      const res = await axios.post("https://code360.pro/api/add-department", formData);
      if (res.data.success) {
        toast.success("Department created successfully!");
        setFormData({
          name: "",
          status: "active",
          description: "",
          budget: "",
          location: "",
          phone: "",
          email: "",
          head_id: "none",
          objectives: [""],
        });
        setOpen(false);
      } else {
        toast.error(res.data.message || "Failed to create department");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      Create New Department
                    </DialogTitle>
                    <DialogDescription>
                      Add a new department to your organization structure
                    </DialogDescription>
                  </DialogHeader>

        {/* Form */}
        <div className="space-y-6 py-4">

          {/* Name + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Department Name *</Label>
              <Input
                placeholder="e.g., Finance"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-1">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="mb-1">Description</Label>
            <Textarea
              placeholder="Brief department description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Department Head */}
          <div>
            <Label className="mb-1">Select Department Head</Label>
            <Select
              value={formData.head_id}
              onValueChange={(v) => setFormData({ ...formData, head_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Head Assigned</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Budget</Label>
              <Input
                type="number"
                placeholder="e.g., 1000000"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-1">Location</Label>
              <Input
                placeholder="e.g., Building A"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1">Phone</Label>
              <Input
                placeholder="+8801..."
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="mb-1">Email</Label>
              <Input
                type="email"
                placeholder="e.g., info@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="mb-1">Objectives</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
                className="flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>

            <AnimatePresence>
              {formData.objectives.map((obj, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder={`Objective ${i + 1}`}
                    value={obj}
                    onChange={(e) => updateObjective(i, e.target.value)}
                  />
                  {formData.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateDepartment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />{" "}
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentCreateDialog;
