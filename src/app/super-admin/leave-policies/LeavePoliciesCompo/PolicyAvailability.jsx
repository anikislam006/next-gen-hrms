"use client";

import React from "react";
import { Users, ChevronDown, ChevronUp, Search, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/app/hook/useEmployees";

export default function PolicyAvailability({ isOpen, onToggle, formData, handleChange }) {
  const { employees, searchTerm, setSearchTerm, loading } = useEmployees();

  // Single Source of Truth: always use parent's formData
  const selectedList = formData.selectedEmployees || [];

  const handleToggleEmployee = (emp) => {
    const isSelected = selectedList.some(item => item.email === emp.email);
    
    let updated;
    if (isSelected) {
      // REMOVE: Filter out the employee if already selected
      updated = selectedList.filter((item) => item.email !== emp.email);
    } else {
      // SELECT: Add only the required fields
      updated = [
        ...selectedList, 
        {
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          email: emp.email
        }
      ];
    }
    
    // Update parent state immediately
    handleChange("selectedEmployees", updated);
  };

  const isEmpSelected = (email) => selectedList.some(item => item.email === email);

  return (
    <div className="max-w-4xl mx-auto m-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={onToggle}
          type="button"
          className="w-full flex flex-col p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-gray-900" />
              <h2 className="text-[17px] font-medium text-gray-800">Policy Availability</h2>
            </div>
            {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-900 stroke-[3px]" />}
          </div>
          <p className="text-[16px] text-slate-500 mt-1 ml-9 text-left">Define who is eligible for this policy</p>
        </button>

        {isOpen && (
          <div className="px-6 pb-8 pt-2 space-y-6">
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-gray-900">Eligibility Type</Label>
              <Select
                value={formData.eligibility || "all"}
                onValueChange={(v) => handleChange("eligibility", v)}
              >
                <SelectTrigger className="w-full h-12 bg-[#F8F9FB] border-none text-gray-900 px-4 focus:ring-1 focus:ring-gray-200">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="groups">Employee Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.eligibility === "groups" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    className="pl-10 h-11 bg-white border-gray-200 focus:border-gray-900 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="col-span-2 text-center py-10 text-gray-400">Loading...</div>
                  ) : employees.length > 0 ? (
                    employees.map((emp) => {
                      const selected = isEmpSelected(emp.email);
                      return (
                        <div
                          key={emp._id}
                          onClick={() => handleToggleEmployee(emp)}
                          className={`relative cursor-pointer p-4 rounded-xl border transition-all ${
                            selected ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900" : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-900 text-sm">{emp.fullName}</h4>
                              <p className="text-xs text-gray-500">ID: {emp.employeeId}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">{emp.email}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              selected ? "bg-gray-900 border-gray-900" : "border-gray-300"
                            }`}>
                              {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-10 text-gray-400">No employees found.</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Selected: <span className="font-bold text-gray-900">{selectedList.length}</span>
                  </p>
                  {selectedList.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => handleChange("selectedEmployees", [])}
                      className="text-xs font-semibold text-red-500"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}