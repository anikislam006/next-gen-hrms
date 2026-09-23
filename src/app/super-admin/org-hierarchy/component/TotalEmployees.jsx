'use client';

import React, { useState, useEffect } from "react";
import TreeNode from "./TreeNode";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  TreeDescription, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

const TotalEmployees = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic: Wait 500ms after the user stops typing to trigger a re-fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, designation, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-2xl leading-5 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                         focus:border-blue-500 sm:text-sm transition-all shadow-sm"
            />
            {search !== debouncedSearch && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend / Info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Current Path</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
            <span>Reports</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 italic">
          Click on a node to expand or collapse branches
        </p>
      </div>

      {/* Tree Container */}
      <div className="relative min-h-[400px] rounded-2xl bg-slate-50/50 border border-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Starting Point: CEO
              We pass the debouncedSearch so the API only triggers 
              when the user stops typing.
          */}
          <TreeNode 
            designation="CEO" 
            search={debouncedSearch} 
            depth={0} 
          />
        </div>

        {/* Empty State Overlay (Optional) */}
        {debouncedSearch && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none mt-8 text-center text-gray-400 text-sm"
          >
            Showing results matching "{debouncedSearch}"
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Tip:</strong> The hierarchy is built based on "Reports To" assignments. If an employee is missing, check their manager assignment in the Employee Profile.
        </div>
      </div>
    </div>
  );
};

export default TotalEmployees;