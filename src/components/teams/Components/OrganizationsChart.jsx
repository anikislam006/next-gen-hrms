"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Building2,
  Users,
  Crown,
  User,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/* ----------------------------
   HIERARCHY LEVEL SETTINGS
---------------------------- */
const HIERARCHY_LEVELS = {
  1: { icon: Crown, color: "text-yellow-600", label: "CEO" },
  2: { icon: Building2, color: "text-blue-600", label: "Manager" },
  3: { icon: Users, color: "text-green-600", label: "Team Lead" },
  4: { icon: UserCheck, color: "text-purple-600", label: "Senior Staff" },
  5: { icon: User, color: "text-gray-600", label: "Staff" },
};

/* ----------------------------
   MAIN COMPONENT
---------------------------- */
export default function OrganizationChart({ data }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (id) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderOrgNode = (node, depth = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const LevelIcon = HIERARCHY_LEVELS[node.level]?.icon || User;

    return (
      <div key={node.id} className="w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.1 }}
          className={`flex items-center p-3 rounded-lg border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 mb-2 ${
            depth > 0 ? "ml-8" : ""
          } ${!node.has_employee_record ? "border-red-200 bg-red-50/30" : ""}`}
        >
          {/* Left Section */}
          <div className="flex items-center flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="mr-2 p-1 hover:bg-gray-100 rounded transition"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Avatar */}
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={node.profile_picture} />
              <AvatarFallback>
                {node.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="font-medium text-gray-900">{node.name}</h4>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <LevelIcon
                    className={`w-3 h-3 ${HIERARCHY_LEVELS[node.level]?.color}`}
                  />
                  {node.designation}
                </Badge>

                {!node.has_employee_record && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Missing Record
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{node.email}</p>
              <p className="text-xs text-gray-500">{node.department}</p>
            </div>

            {/* Right Side Badges */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Level {node.level}</Badge>
              {hasChildren && (
                <Badge variant="outline">
                  {node.children.length} subordinate
                  {node.children.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recursive Child Nodes */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {node.children.map((child) => renderOrgNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div>
      {renderOrgNode(data)}
    </div>
  );
}
