import React from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApprovalWorkflow({ isOpen, onToggle, formData, handleChange }) {
  return (
    <div className="max-w-4xl mx-auto m-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <button
          onClick={onToggle}
          className="w-full flex flex-col p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-regular text-gray-800">Approval Workflow</h2>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </div>
          
          {/* Subtitle */}
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">
            Configure how leave requests are approved
          </p>
        </button>

        {/* Form Content */}
        {isOpen && (
          <div className="px-6 pb-8 pt-2 space-y-6">
            
            {/* Approval Workflow Field */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Approval Workflow
              </Label>
              <Select
                value={formData.approvalStrategy}
                onValueChange={(v) => handleChange("approvalStrategy", v)}
              >
                <SelectTrigger className="w-full h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus:ring-1 focus:ring-gray-200">
                  <SelectValue placeholder="Manager Only" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager Only</SelectItem>
                  <SelectItem value="manager-hr">Manager → HR</SelectItem>
                  <SelectItem value="hr">HR Only</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
              {/* Context Hint Text */}
              <p className="text-[14px] text-slate-500">
                Only reporting manager approval required
              </p>
            </div>

            {/* First Approver Field */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                First Approver
              </Label>
              <Select
                value={formData.firstApprover}
                onValueChange={(v) => handleChange("firstApprover", v)}
              >
                <SelectTrigger className="w-full h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus:ring-1 focus:ring-gray-200">
                  <SelectValue placeholder="Reporting Manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reporting-manager">Reporting Manager</SelectItem>
                  <SelectItem value="department-head">Department Head</SelectItem>
                  <SelectItem value="hr-admin">HR Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}