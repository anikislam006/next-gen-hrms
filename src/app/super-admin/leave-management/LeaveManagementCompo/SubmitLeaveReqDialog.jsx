"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; // Assuming you use sonner or similar for notifications
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";

const SubmitLeaveReqDialog = ({ isOpen, onClose }) => {
  // Pull createRequest and requestLoading from your hook
  const { 
    leavePolicies, 
    fetchAllLeavePolicies, 
    loading, 
    createRequest, 
    requestLoading,
    fetchMyRequests,
    fetchAllRequests
  } = useLeavePolicy();
  
  const { UserAllDetails } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    designation: "",
    department: "",
    employeeId: "",
    fullName: "",
    employmentType: "",
    leaveType: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (isOpen && UserAllDetails) {
      setFormData((prev) => ({
        ...prev,
        email: UserAllDetails.email || "",
        designation: UserAllDetails.designation || "",
        department: UserAllDetails.department || "",
        employeeId: UserAllDetails.employeeId || "",
        fullName: UserAllDetails.fullName || "",
        employmentType: UserAllDetails.employmentType || "",
      }));
      fetchAllLeavePolicies({ page: 1, limit: 100 });
    }
  }, [isOpen, UserAllDetails, fetchAllLeavePolicies]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (id) => {
    const selectedPolicy = leavePolicies.find((p) => p._id === id);
    if (selectedPolicy) {
      setFormData((prev) => ({
        ...prev,
        leaveTypeId: selectedPolicy._id,
        leaveType: selectedPolicy.name,
      }));
    }
  };

 const handleSubmit = async () => {
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await createRequest(formData);
      if (response.success) {
        toast.success("Leave request submitted successfully!");
        
        // REFRESH DATA HERE
        // If the user is on their dashboard, refresh their specific list
        await fetchMyRequests(formData.email, { page: 1, limit: 10 });
        // Also refresh global if necessary
        await fetchAllRequests({ page: 1, limit: 10 });

        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit request");
    }
  };

  
  const enabledPolicies = leavePolicies.filter((policy) => policy.isEnabled);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[550px] p-0 overflow-hidden border-none rounded-[24px]">
        <DialogHeader className="p-8 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle >
                Submit Leave Request
              </DialogTitle>
              <p className="text-slate-500 text-[12px] mt-1 leading-relaxed">
                Logged in as: <span className="font-semibold text-slate-700">{UserAllDetails?.fullName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6 space-y-6 overflow-y-auto scrollbar-hide max-h-[70vh]">
          {/* Leave Type */}
          <div className="space-y-2">
            <Label >Leave Type</Label>
            <Select onValueChange={handleTypeSelect}>
              <SelectTrigger >
                <SelectValue placeholder={loading ? "Loading types..." : "Select leave type"} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : (
                  enabledPolicies.map((policy) => (
                    <SelectItem key={policy._id} value={policy._id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: policy.colorTag || '#cbd5e1' }}
                        />
                        {policy.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label >Start Date</Label>
              <Input
                type="date"
                
                onChange={(e) => handleChange("startDate", e.target.value)}
                value={formData.startDate}
              />
            </div>
            <div className="space-y-2">
              <Label >End Date</Label>
              <Input
                type="date"
                
                onChange={(e) => handleChange("endDate", e.target.value)}
                value={formData.endDate}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label >Reason</Label>
            <Textarea
              placeholder="Please provide a reason for your leave"
              className="min-h-[100px] bg-slate-50 border-none rounded-2xl p-4 resize-none focus-visible:ring-1 focus-visible:ring-slate-200"
              onChange={(e) => handleChange("reason", e.target.value)}
              value={formData.reason}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label >Emergency Contact</Label>
            <Input
              placeholder="Phone number"
              className="h-12 bg-slate-50 border-none rounded-xl px-4"
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              value={formData.emergencyContact}
            />
          </div>

          {/* Workflow Info */}
          <div className="bg-[#F4F9FF] p-6 rounded-2xl border border-blue-50">
            <h4 className="text-[12px] font-bold text-blue-900 mb-4">Approval Workflow:</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-sm" />
                <span className="text-[10px] font-medium text-blue-700">Step 1: Manager Approval</span>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-5 h-5 rounded-full border-4 border-white bg-slate-300 shadow-sm" />
                <span className="text-[10px] font-medium text-slate-600">Step 2: HR Head Approval</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={requestLoading}
            
          >
            Cancel
          </Button>
          <Button
            
            onClick={handleSubmit}
            disabled={requestLoading}
          >
            {requestLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitLeaveReqDialog;