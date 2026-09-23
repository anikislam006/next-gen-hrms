import React from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
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

export default function AdvancedSettings({ isOpen, onToggle, formData, handleChange }) {
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
              <Settings className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-regular text-gray-800">Advanced Settings</h2>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </div>
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">
            Additional configuration options
          </p>
        </button>

        {/* Form Content */}
        {isOpen && (
          <div className="px-6 pb-8 pt-2 space-y-6">
            
            {/* 2-Column Grid for Primary Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Minimum Leave Duration (Days)</Label>
                <Input
                  type="number"
                  placeholder="0.5"
                  value={formData.minLeaveDuration}
                  onChange={(e) => handleChange("minLeaveDuration", e.target.value)}
                  className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
                />
              </div>

              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Max Consecutive Days</Label>
                <Input
                  placeholder="No limit"
                  value={formData.maxConsecutive}
                  onChange={(e) => handleChange("maxConsecutive", e.target.value)}
                  className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
                />
              </div>

              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Minimum Advance Notice (Days)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.minAdvanceNotice}
                  onChange={(e) => handleChange("minAdvanceNotice", e.target.value)}
                  className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
                />
              </div>

              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Max Advance Booking (Days)</Label>
                <Input
                  placeholder="No limit"
                  value={formData.maxAdvanceBooking}
                  onChange={(e) => handleChange("maxAdvanceBooking", e.target.value)}
                  className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
                />
              </div>
            </div>

            {/* Attachment Rule */}
            <div className="space-y-3 text-left">
              <Label className="text-[15px] font-semibold text-gray-900">Require Attachment After (Days)</Label>
              <Input
                placeholder="No attachment required"
                value={formData.requireAttachmentDays}
                onChange={(e) => handleChange("requireAttachmentDays", e.target.value)}
                className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus-visible:ring-1 focus-visible:ring-gray-200"
              />
              <p className="text-[14px] text-slate-500">
                Require medical certificate or documentation after this many consecutive days
              </p>
            </div>

            {/* Counting Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Weekend Counting</Label>
                <Select value={formData.weekendCounting} onValueChange={(v) => handleChange("weekendCounting", v)}>
                  <SelectTrigger className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4">
                    <SelectValue placeholder="Exclude Weekends" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclude">Exclude Weekends</SelectItem>
                    <SelectItem value="include">Include Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 text-left">
                <Label className="text-[15px] font-semibold text-gray-900">Holiday Counting</Label>
                <Select value={formData.holidayCounting} onValueChange={(v) => handleChange("holidayCounting", v)}>
                  <SelectTrigger className="h-12 bg-[#F8F9FB] border-none text-gray-900 px-4">
                    <SelectValue placeholder="Exclude Holidays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclude">Exclude Holidays</SelectItem>
                    <SelectItem value="include">Include Holidays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Half-Day Toggle */}
            <div className="flex items-center justify-between p-5 bg-[#F8F9FB] rounded-xl border border-gray-50">
              <div className="space-y-0.5 text-left">
                <h4 className="text-[16px] font-semibold text-gray-900">Allow Half-Day Leave</h4>
                <p className="text-[14px] text-slate-500">Enable employees to apply for 0.5 day leave</p>
              </div>
              <Switch 
                checked={formData.allowHalfDay}
                onCheckedChange={(v) => handleChange("allowHalfDay", v)}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}