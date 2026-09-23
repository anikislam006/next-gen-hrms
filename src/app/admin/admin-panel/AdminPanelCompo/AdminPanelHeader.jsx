'use client';

import React from 'react';
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * AdminPanelHeader
 * @param {Object} systemStats - Object containing stats like totalUsers
 */
const AdminPanelHeader = ({ systemStats = { totalUsers: 0 } }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-red-100">System administration and user management</p>
          <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 mt-2">
            🎭 Demo Mode Active
          </Badge>
        </div>
        <div className="text-right">
          {/* <div className="text-2xl font-bold">
            {systemStats?.totalUsers?.toLocaleString() || 0}
          </div> */}
          {/* <div className="text-red-200 text-sm">Total Users</div> */}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPanelHeader;