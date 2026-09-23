'use client';

import React, { useState, useEffect } from "react";
import { useHierarchy } from "@/app/hook/useHierarchy";
import { 
  Crown, Shield, Briefcase, TrendingUp, User, 
  ChevronRight, ChevronDown, Mail, Building 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const designationColors = {
  CEO: "from-red-500 to-pink-600",
  Head_of_HR: "from-purple-500 to-indigo-600",
  HR_Manager: "from-orange-500 to-yellow-600",
  HR_Executive: "from-green-500 to-emerald-600",
  CTO: "from-purple-500 to-indigo-600",
  Technical_Lead: "from-orange-500 to-yellow-600",
  Senior_Developer: "from-green-500 to-emerald-600",
  default: "from-blue-400 to-indigo-500",
};

const designationIcons = {
  CEO: Crown,
  Head_of_HR: Shield,
  CTO: Shield,
  Technical_Lead: TrendingUp,
  default: User,
};

const TreeNode = ({ designation, search, depth = 0 }) => {
  const { loadNode } = useHierarchy();
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(depth < 1); // Auto-open the root level
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentNode = async () => {
      setIsLoading(true);
      const result = await loadNode(designation, search);
      if (isMounted) {
        setData(result);
        setIsLoading(false);
      }
    };

    fetchCurrentNode();
    return () => { isMounted = false; };
  }, [designation, search, loadNode]);

  if (!data && isLoading) {
    return <div className="ml-6 py-2 animate-pulse text-gray-400 text-sm">Loading {designation}...</div>;
  }

  if (!data) return null;

  // Search Logic
  const matchesSearch = !search || data.employees?.some(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  const hasChildren = data.childrenDesignations?.length > 0;
  const colorClass = designationColors[designation] || designationColors.default;
  const Icon = designationIcons[designation] || designationIcons.default;

  return (
    <div className={`mt-3 ${depth > 0 ? "ml-6 border-l-2 border-slate-100 pl-4" : ""}`}>
      {/* Node Header Card */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 
          ${matchesSearch ? "bg-white shadow-sm border-blue-200" : "bg-gray-50/50 border-gray-100 opacity-80"}
          hover:shadow-md hover:border-blue-300 cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          {/* Toggle Icon */}
          <div className="text-gray-400 group-hover:text-blue-500">
            {hasChildren ? (
              isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <div className="w-[18px]" />
            )}
          </div>

          {/* Avatar Icon */}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} shadow-inner flex items-center justify-center text-white`}>
            <Icon size={22} />
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">
              {data.employees?.[0]?.fullName || "Vacant Position"}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {designation.replace(/_/g, ' ')}
              </span>
              {data.employees?.[0] && (
                <>
                  <span className="flex items-center gap-1"><Building size={12}/> {data.employees[0].department}</span>
                  <span className="flex items-center gap-1"><Mail size={12}/> {data.employees[0].email}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="hidden sm:flex flex-col items-end gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-100 text-slate-600">
            {data.employees?.length || 0} Direct Reports
          </span>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Multiple employees in same designation */}
            {data.employees?.length > 1 && (
              <div className="mt-2 space-y-2 ml-10">
                {data.employees.slice(1).map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                    <User size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{emp.fullName}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 text-xs">{emp.email}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recursive Children */}
            {hasChildren && (
              <div className="mt-1">
                {data.childrenDesignations.map((child) => (
                  <TreeNode 
                    key={child} 
                    designation={child} 
                    search={search} 
                    depth={depth + 1} 
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreeNode;