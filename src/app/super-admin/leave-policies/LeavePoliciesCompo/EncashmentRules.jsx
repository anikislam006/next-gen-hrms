import React from "react";
import { Coins, ChevronDown, ChevronUp, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function EncashmentRules({ isOpen, onToggle, formData, handleChange }) {
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
              {/* DollarSign icon matches your image exactly */}
              <DollarSign className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-regular text-gray-800">Encashment Rules</h2>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />
            )}
          </div>
          
          {/* Subtitle */}
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">
            Configure leave encashment policies
          </p>
        </button>

        {/* Form Content */}
        {isOpen && (
          <div className="px-6 pb-8 pt-2">
            
            {/* Allow Encashment Toggle Card */}
            <div className="flex items-center justify-between p-5 bg-[#F8F9FB] rounded-xl border border-gray-50 transition-all">
              <div className="space-y-0.5 text-left">
                <h4 className="text-[16px] font-semibold text-gray-900">Allow Encashment</h4>
                <p className="text-[14px] text-slate-500">
                  Allow employees to encash unused leave
                </p>
              </div>
              <Switch 
                checked={formData.allowEncashment}
                onCheckedChange={(v) => handleChange("allowEncashment", v)}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}