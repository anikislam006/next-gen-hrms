"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, UserPlus } from "lucide-react";
import CreateJobDialog from "./CreateJobDialog";
import CreateRecruitment from "./CreateRecruitment";
import { Button } from "@/components/ui/button";

const RecruitmentHeader = ({job}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  return (
    <>
      <div className="space-y-6 mb-8">
        {/* ================= TOP SECTION ================= */}
        <div className="flex flex-col md:flex-row lg:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Recruitment Management</h1>
            <p className="text-gray-600 mt-2">
              Manage candidate pipeline and hiring process
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button >
              <BarChart3 className="w-4 h-4 " />
              Reports
            </Button>
            <Button
              onClick={() => setOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Add Candidate
            </Button>
          </div>
        </div>

        {/* ================= METRICS BAR ================= */}
        {/* Matches your color-coded side borders from the screenshot */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Total Candidates" value="30" color="border-blue-500" icon="users" />
          <MetricCard label="Active Pipeline" value="17" color="border-purple-500" icon="pulse" />
          <MetricCard label="Hired" value="1" color="border-green-500" icon="check" />
          <MetricCard label="Avg Match Score" value="83%" color="border-orange-500" icon="star" />
          <MetricCard label="High Match (≥80%)" value="23" color="border-indigo-500" icon="sparkle" />
        </div> */}

      </div>

      <CreateRecruitment job={job} open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
};

// Internal Metric Card Component
const MetricCard = ({ label, value, color, icon }) => (
  <div className={`bg-white p-5 rounded-xl border-l-4 ${color} shadow-sm border border-gray-100 flex justify-between items-center`}>
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    {/* Simplified Icon Placeholders - Replace with Lucide icons as needed */}
    <div className="opacity-60 text-indigo-500">
        {icon === 'users' && <UserPlus className="w-6 h-6" />}
        {/* Add more icons here */}
    </div>
  </div>
);

export default RecruitmentHeader;