"use client";

import React from 'react';
import { motion } from "framer-motion";
import { User, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SelfServiceHeader = ({ UserAllDetails }) => {
  // Mapping props to match your data structure
  const fullName = UserAllDetails?.fullName || "Employee";
  const designation = UserAllDetails?.designation || "Staff";
  const employeeId = UserAllDetails?.employeeId || "EMP001";
  const lineManager = UserAllDetails?.lineManager; 
  const isDemoMode = UserAllDetails?.isDemoMode || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      // Ensure the outer motion div is full width
      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg"
    >
      {/* The 'w-full' here combined with 'justify-between' forces 
          the two children to the opposite ends. 
      */}
      <div className="flex flex-col md:flex-row lg:flex-row  items-start md:items-center justify-between gap-6 w-full">
        
        {/* Left Side: Portal Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Self Service Portal</h1>
          </div>
          <p className="text-emerald-100">
            Manage your profile, requests, and view important information
          </p>
          {isDemoMode && (
            <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 mt-2 inline-flex">
              🎭 Demo Mode Active
            </Badge>
          )}
        </div>

        {/* Right Side: Employee Details */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-2xl font-bold">
            {fullName}
          </div>
          <div className="text-emerald-200 text-sm">
            {designation} • {employeeId}
          </div>
          
          {lineManager && (
            <div className="flex items-center gap-2 text-emerald-200 text-sm mt-2 justify-start md:justify-end">
              <UserCheck className="w-4 h-4" />
              <span>Reports to: {lineManager}</span>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default SelfServiceHeader;