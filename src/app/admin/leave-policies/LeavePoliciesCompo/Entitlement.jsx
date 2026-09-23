import React from "react";
import { Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function Entitlement({ isOpen, onToggle, formData, handleChange }) {
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
              <Bookmark className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-regular text-gray-800">Entitlement</h2>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </div>
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">
            Configure leave allocation and accrual
          </p>
        </button>

        {/* Form Content */}
        {isOpen && (
          <div className="px-6 pb-8 pt-2 space-y-6">
            
            {/* Entitlement Type */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Entitlement Type
              </Label>
              <Select
                value={formData.entitlementType}
                onValueChange={(v) => handleChange("entitlementType", v)}
              >
                <SelectTrigger className="w-full h-12 bg-[#F8F9FB] border-none text-gray-900 px-4">
                  <SelectValue placeholder="Annual Allocation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Allocation</SelectItem>
                  <SelectItem value="monthly">Monthly Accrual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Annual Entitlement Days */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Annual Entitlement (Days)
              </Label>
              <Input
                type="number"
                placeholder="14"
                value={formData.annualDays}
                onChange={(e) => handleChange("annualDays", e.target.value)}
                className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
              />
              <p className="text-[14px] text-slate-500">
                Total leave days allocated per year
              </p>
            </div>

            {/* Accrual Start */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Accrual Start
              </Label>
              <Select
                value={formData.accrualStart}
                onValueChange={(v) => handleChange("accrualStart", v)}
              >
                <SelectTrigger className="w-full h-12 bg-[#F8F9FB] border-none text-gray-900 px-4">
                  <SelectValue placeholder="Employee Joining Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joining">Employee Joining Date</SelectItem>
                  <SelectItem value="fixed">Fixed Date (Jan 1st)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="border-gray-100 my-2" />

            {/* Toggle Sections */}
            <div className="space-y-3">
              {/* Available During Probation */}
              <div className="flex items-center justify-between p-4 bg-[#F8F9FB] rounded-xl border border-gray-50">
                <div className="space-y-0.5">
                  <h4 className="text-[16px] font-semibold text-gray-900">Available During Probation</h4>
                  <p className="text-[14px] text-slate-500">Allow employees to use this leave during probation period</p>
                </div>
                <Switch 
                  checked={formData.availableInProbation}
                  onCheckedChange={(v) => handleChange("availableInProbation", v)}
                />
              </div>

              {/* Available During Notice Period */}
              <div className="flex items-center justify-between p-4 bg-[#F8F9FB] rounded-xl border border-gray-50">
                <div className="space-y-0.5">
                  <h4 className="text-[16px] font-semibold text-gray-900">Available During Notice Period</h4>
                  <p className="text-[14px] text-slate-500">Allow employees to use this leave during notice period</p>
                </div>
                <Switch 
                  checked={formData.availableInNotice}
                  onCheckedChange={(v) => handleChange("availableInNotice", v)}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}