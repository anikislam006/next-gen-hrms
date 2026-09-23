import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const LeaveManagementBanner = ({ onClick }) => {
  return (
    <div className=" flex flex-col md:flex-row lg:flex-row lg:flex-row items-center justify-between gap-6">
      
      {/* Left Side: Header & Subtext */}
      <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600 mt-2">
            Submit requests, track balances, and manage approvals with proper workflow
          </p>
        </div>

      {/* Right Side: Action Button */}
      <Button 
        onClick={onClick}
        
      >
        <Plus className="h-5 w-5" />
        Submit Leave Request
      </Button>
      
    </div>
  );
};

export default LeaveManagementBanner;