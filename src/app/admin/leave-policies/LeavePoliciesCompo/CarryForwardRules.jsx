import React from "react";
import { CalendarArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function CarryForwardRules({ isOpen, onToggle, formData, handleChange }) {
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
              <CalendarArrowUp className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-regular text-gray-800">Carry Forward Rules</h2>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </div>
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">
            Configure year-end carry forward policies
          </p>
        </button>

        {/* Form Content */}
        {isOpen && (
          <div className="px-6 pb-8 pt-2 space-y-6">
            
            {/* Allow Carry Forward Toggle Card */}
            <div className="flex items-center justify-between p-4 bg-[#F8F9FB] rounded-xl border border-gray-50">
              <div className="space-y-0.5">
                <h4 className="text-[16px] font-semibold text-gray-900">Allow Carry Forward</h4>
                <p className="text-[14px] text-slate-500">Allow unused leave to be carried to next year</p>
              </div>
              <Switch 
                checked={formData.allowCarryForward}
                onCheckedChange={(v) => handleChange("allowCarryForward", v)}
              />
            </div>

            {/* Maximum Carry Forward Days */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Maximum Carry Forward Days
              </Label>
              <Input
                type="number"
                placeholder="5"
                value={formData.maxCarryDays}
                onChange={(e) => handleChange("maxCarryDays", e.target.value)}
                className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
              />
              <p className="text-[14px] text-slate-500">
                Maximum days that can be carried forward to next year
              </p>
            </div>

            {/* Carry Forward Expiry (Months) */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Carry Forward Expiry (Months)
              </Label>
              <Input
                type="number"
                placeholder="3"
                value={formData.carryForwardExpiry}
                onChange={(e) => handleChange("carryForwardExpiry", e.target.value)}
                className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
              />
              <p className="text-[14px] text-slate-500">
                Carried forward leave expires after this many months
              </p>
            </div>

            {/* Expiry Date (MM-DD) */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">
                Expiry Date (MM-DD)
              </Label>
              <Input
                type="text"
                placeholder="03-31"
                value={formData.expiryDate}
                onChange={(e) => handleChange("expiryDate", e.target.value)}
                className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
              />
              <p className="text-[14px] text-slate-500">
                Carried forward leave expires on this date (e.g., 03-31 for March 31)
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}