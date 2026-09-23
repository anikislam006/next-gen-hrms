"use client";

import React from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function BasicInformation({ isOpen, onToggle, formData, handleChange }) {
  return (
    <div className="max-w-4xl mx-auto m-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors border-b border-gray-100">
          <button
            onClick={onToggle}
            type="button"
            className="flex flex-1 items-center gap-3 text-left"
          >
            <Settings className="w-6 h-6 text-gray-900" />
            <div>
              <h2 className="text-[17px] font-medium text-gray-800">Basic Information</h2>
              <p className="text-xs text-slate-500">Set policy name and general description</p>
            </div>
          </button>

          <div className="flex items-center gap-3 px-4 border-l border-gray-100 ml-4">
            <Label htmlFor="policy-enabled" className="text-[11px] font-bold uppercase text-gray-500 cursor-pointer">
              {formData.isEnabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="policy-enabled"
              checked={formData.isEnabled || false}
              onCheckedChange={(val) => handleChange("isEnabled", val)}
            />
          </div>

          <button onClick={onToggle} type="button" className="ml-2">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </button>
        </div>

        {/* Form Content */}
        {isOpen && (
          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Policy Name Field */}
            <div className="space-y-2">
              <Label htmlFor="policyName" className="text-sm font-semibold text-gray-700">
                Policy Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="policyName"
                type="text"
                placeholder="e.g., Standard Annual Leave Policy"
                className="h-11 bg-[#F8F9FB] border-none focus-visible:ring-1 focus-visible:ring-gray-200"
                value={formData.policyName || ""}
                onChange={(e) => handleChange("policyName", e.target.value)}
              />
            </div>

            {/* Policy Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Policy Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe this policy and its applicability..."
                className="min-h-[120px] bg-[#F8F9FB] border-none focus-visible:ring-1 focus-visible:ring-gray-200 resize-none"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}