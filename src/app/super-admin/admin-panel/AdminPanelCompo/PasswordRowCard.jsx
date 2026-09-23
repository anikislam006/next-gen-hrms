"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Key, 
  Edit3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ChangePassDialog from "./ChangePassDialog"; // Adjust import path

const PasswordRowCard = ({ employee, fetchEmployees }) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all group mb-3"
    >
      {/* User Info Section */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
          {employee.fullName
            ? employee.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
            : "U"}
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
            {employee.fullName}
          </h4>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500">{employee.email}</p>
            <button 
              onClick={() => copyToClipboard(employee.email, "Email")}
              className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400"
              title="Copy Email"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none text-[10px] font-bold py-0 h-5">
              {employee.role || "Employee"}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-bold text-slate-500 py-0 h-5">
              {employee.employeeId}
            </Badge>
          </div>
        </div>
      </div>

      {/* Password and Actions Section */}
      <div className="flex items-center space-x-3">
        {/* Password Display Box */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 space-x-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Key className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Password</span>
          </div>
          
          <div className="min-w-[150px] font-mono text-sm font-medium text-slate-700">
            {showPassword ? (
              <span className="break-all">{employee.BDCode || "Not Set"}</span>
            ) : (
              <span>••••••••••••••••</span>
            )}
          </div>

          <div className="flex items-center border-l border-slate-200 pl-2 gap-1">
            <Button 
              onClick={() => setShowPassword(!showPassword)}
              
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button >
            <Button 
              onClick={() => copyToClipboard(employee.BDCode, "Password")}
              
            >
              <Copy className="w-4 h-4" />
            </Button >
          </div>
        </div>

        {/* Edit Action Button wrapped in ChangePassDialog */}
        <ChangePassDialog 
          employee={employee} 
          fetchEmployees={fetchEmployees}
          trigger={
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-slate-200 hover:bg-white font-bold text-slate-700"
            >
              <Edit3 className="w-4 h-4" />
              Change
            </Button>
          }
        />
      </div>
    </motion.div>
  );
};

export default PasswordRowCard;