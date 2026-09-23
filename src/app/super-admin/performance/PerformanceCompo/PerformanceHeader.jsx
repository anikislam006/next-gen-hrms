import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp } from 'lucide-react';
// Assuming you are using a UI library like Shadcn for the Badge component
// If you don't have this component, I've provided a fallback below
import { Badge } from "@/components/ui/badge"; 

const PerformanceHeader = ({ 
  demoMode = true, 
  canManagePerformance = true, 
  stats = { avgRating: "4.8" } 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Enhanced Performance Management</h1>
          </div>
          
          <p className="text-indigo-100">
            Advanced appraisal workflow: Manager → Department Head → HR Head → CEO (optional)
          </p>

          <div className="flex items-center gap-2 mt-4">
            {demoMode && (
              <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 hover:bg-amber-500/30 transition-colors">
                🎭 Demo Mode Active
              </Badge>
            )}
            {canManagePerformance && (
              <Badge className="bg-green-500/20 text-green-100 border-green-300/30 hover:bg-green-500/30 transition-colors">
                👑 Management Authority
              </Badge>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold">{stats.avgRating}</div>
          <div className="text-indigo-200 text-sm font-medium uppercase tracking-wider">
            Avg Rating
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceHeader;