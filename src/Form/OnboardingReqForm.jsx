"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDepartments } from "@/app/hook/useDepartment";
// Import your hook

const employmentTypes = ["Permanent", "Contract", "Probation"];

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

const OnboardingReqForm = ({ showCreateRequest, setShowCreateRequest }) => {
  const { user } = useAuth();
  
  // Use your department hook
  // We pass high limit or handle search if necessary to get all options for the dropdown
  const { departments, loading: deptsLoading } = useDepartments();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    designation: "",
    joiningDate: "",
    employmentType: "",
    grossSalary: "",
    reportingManager: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        createdBy: {
          email: user?.email || "",
          role: user?.role || "",
          name: user?.name || "",
        },
      };

      const res = await fetch("https://code360.pro/api/onboard-req", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage("✅ Onboarding request submitted successfully!");
      setFormData({
        fullName: "",
        email: "",
        department: "",
        designation: "",
        joiningDate: "",
        employmentType: "",
        grossSalary: "",
        reportingManager: "",
      });
      
      // Close dialog after success (Optional)
      // setTimeout(() => setShowCreateRequest(false), 2000);
      
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showCreateRequest} onOpenChange={setShowCreateRequest}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-500" />
            Create Onboarding Request
          </DialogTitle>
          <DialogDescription>
            Fill in basic employee information to generate an activation link
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@enveria.com"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={deptsLoading ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  {deptsLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    departments?.map((d) => (
                      <SelectItem key={d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) =>
                  setFormData({ ...formData, designation: value })
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
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Joining Date</Label>
              <Input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, employmentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gross Salary (৳)</Label>
              <Input
                type="number"
                name="grossSalary"
                value={formData.grossSalary}
                onChange={handleChange}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="space-y-2">
              <Label>Reporting Manager</Label>
              <Input
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                placeholder="Manager Name"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateRequest(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || deptsLoading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Request
                </>
              )}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
                message.startsWith("✅") 
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-red-50 text-red-700 border border-red-100"
              }`}>
              {message}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingReqForm;