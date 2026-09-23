"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, X } from "lucide-react";

// Import your custom hook
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";

import BasicInformation from "./BasicInformation";
import PolicyAvailability from "./PolicyAvailability";
import ApprovalWorkflow from "./ApprovalWorkflow";
import Entitlement from "./Entitlement";
import CarryForwardRules from "./CarryForwardRules";
import EncashmentRules from "./EncashmentRules";
import AdvancedSettings from "./AdvancedSettings";

export default function AddPolicyDialog({ showAddPolicy, setShowAddPolicy, selectedPolicy }) {
  // 1. Pull the function from your hook
  const { addDetailedPolicy, loading: hookLoading } = useLeavePolicy();
  
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState("basic");

  const initialData = {
    policyName: "",
    parentPolicyTypeId: "",
    parentPolicyTypeName: "",
    description: "",
    eligibility: "all",
    approvalStrategy: "manager",
    firstApprover: "reporting-manager",
    entitlementType: "annual",
    annualDays: 14,
    accrualStart: "joining",
    availableInProbation: false,
    availableInNotice: true,
    allowCarryForward: true,
    maxCarryDays: 5,
    carryForwardExpiry: 3,
    expiryDate: "03-31",
    allowEncashment: false,
    minLeaveDuration: 0.5,
    maxConsecutive: "",
    minAdvanceNotice: 0,
    maxAdvanceBooking: "",
    requireAttachmentDays: "",
    weekendCounting: "exclude",
    holidayCounting: "exclude",
    allowHalfDay: true,
  };

  const [formData, setFormData] = useState(initialData);

  // 2. Sync selected policy data whenever the dialog opens
  useEffect(() => {
    if (showAddPolicy && selectedPolicy) {
      setFormData(prev => ({
        ...prev,
        parentPolicyTypeId: selectedPolicy._id,
        parentPolicyTypeName: selectedPolicy.name,
      }));
    }
  }, [showAddPolicy, selectedPolicy]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation: Ensure policy name is provided
    if (!formData.policyName.trim()) {
      alert("Please enter a Policy Name");
      return;
    }

    setLoading(true);
    try {
      // 3. Use the hook function instead of direct fetch
      const result = await addDetailedPolicy(formData);

      if (result.success) {
        // Success feedback (replace with toast if available)
        alert("Policy saved successfully!");
        setShowAddPolicy(false);
        setFormData(initialData); // Reset form
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Failed to save the policy.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Dialog open={showAddPolicy} onOpenChange={setShowAddPolicy}>
      <DialogContent className="max-w-4xl max-h-[96vh] overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedPolicy ? `Setup ${selectedPolicy.name} Rules` : "Create Leave Policy"}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">
              Parent Type: <span className="text-blue-600">{selectedPolicy?.name || "None"}</span>
            </p>
          </div>
   
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-160px)] bg-[#FDFDFE] py-4 px-6">
          <div className="space-y-4 pb-10">
            <BasicInformation isOpen={openSection === "basic"} onToggle={() => toggleSection("basic")} formData={formData} handleChange={handleChange} />
            <PolicyAvailability isOpen={openSection === "availability"} onToggle={() => toggleSection("availability")} formData={formData} handleChange={handleChange} />
            <ApprovalWorkflow isOpen={openSection === "approval"} onToggle={() => toggleSection("approval")} formData={formData} handleChange={handleChange} />
            <Entitlement isOpen={openSection === "entitlement"} onToggle={() => toggleSection("entitlement")} formData={formData} handleChange={handleChange} />
            <CarryForwardRules isOpen={openSection === "carryforward"} onToggle={() => toggleSection("carryforward")} formData={formData} handleChange={handleChange} />
            <EncashmentRules isOpen={openSection === "encashment"} onToggle={() => toggleSection("encashment")} formData={formData} handleChange={handleChange} />
            <AdvancedSettings isOpen={openSection === "advanced"} onToggle={() => toggleSection("advanced")} formData={formData} handleChange={handleChange} />
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white sm:justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowAddPolicy(false)}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 px-6 rounded-xl font-medium"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleSubmit}
            disabled={loading || hookLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-semibold shadow-lg shadow-blue-200 min-w-[200px] transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" /> 
                Save Detailed Policy
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}