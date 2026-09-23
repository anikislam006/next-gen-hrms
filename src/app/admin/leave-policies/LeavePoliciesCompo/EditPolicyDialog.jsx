"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Loader2, X } from "lucide-react";
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";

import BasicInformation from "./BasicInformation";
import PolicyAvailability from "./PolicyAvailability";
import ApprovalWorkflow from "./ApprovalWorkflow";
import Entitlement from "./Entitlement";
import CarryForwardRules from "./CarryForwardRules";
import EncashmentRules from "./EncashmentRules";
import AdvancedSettings from "./AdvancedSettings";

export default function EditPolicyDialog({ showEditPolicy, setShowEditPolicy, ruleToEdit }) {
  const { updateDetailedPolicy, loading: hookLoading } = useLeavePolicy();
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState("basic");

  const [formData, setFormData] = useState({});

  // Populate form when ruleToEdit changes
  useEffect(() => {
    if (showEditPolicy && ruleToEdit) {
      setFormData({ ...ruleToEdit });
    }
  }, [showEditPolicy, ruleToEdit]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.policyName?.trim()) {
      alert("Please enter a Policy Name");
      return;
    }

    setLoading(true);
    try {
      // Use the update function from your hook
      const result = await updateDetailedPolicy(formData._id, formData);
      if (result.success) {
        setShowEditPolicy(false);
      }
    } catch (error) {
      alert(error.message || "Failed to update the policy.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Dialog open={showEditPolicy} onOpenChange={setShowEditPolicy}>
      <DialogContent className="max-w-4xl max-h-[96vh] overflow-hidden p-0 gap-0 border-none rounded-2xl shadow-2xl">
        <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-gray-900">Edit {ruleToEdit?.policyName}</DialogTitle>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase">Updating rules for {ruleToEdit?.parentPolicyTypeName}</p>
          </div>

        </div>

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

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white sm:justify-between items-center">
          <Button variant="ghost" onClick={() => setShowEditPolicy(false)} className="text-slate-500 rounded-xl">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || hookLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-semibold min-w-[200px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Update Rules</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}