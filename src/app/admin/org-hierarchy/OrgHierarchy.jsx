"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TotalEmployees from "./component/TotalEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Badge,
  Building2,
  Crown,
  GitBranch,
  Info,
  Network,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmployees } from "@/app/hook/useEmployees";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import TreeNode from "./component/TreeNode";

const OrgHierarchy = () => {
  const { user, setUser } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const { completedTotal } = useEmployees();

  const currentTab = searchParams.get("tab") || "total";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const changeTab = (tab) => {
    router.push(`?tab=${tab}&page=1`);
  };

  const isAdmin = user?.role === "admin" || user?.role === "SuperAdmin";

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Organizational Hierarchy</h1>
              </div>
              <p className="text-blue-100">
                Complete reporting structure and line manager relationships
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== TAB CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card
          onClick={() => changeTab("total")}
          className={`cursor-pointer transition border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100
      ${
        currentTab === "total"
          ? "ring-2 ring-blue-500 scale-[1.02]"
          : "hover:scale-[1.02]"
      }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {completedTotal}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* With Managers */}
        <Card
          onClick={() => changeTab("managers")}
          className={`cursor-pointer transition border-green-200 bg-gradient-to-br from-green-50 to-green-100
      ${
        currentTab === "managers"
          ? "ring-2 ring-green-500 scale-[1.02]"
          : "hover:scale-[1.02]"
      }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  With Managers
                </p>
                <p className="text-2xl font-bold text-green-900">-</p>
              </div>
              <ArrowDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Active Managers */}
        <Card
          onClick={() => changeTab("active")}
          className={`cursor-pointer transition border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100
      ${
        currentTab === "active"
          ? "ring-2 ring-purple-500 scale-[1.02]"
          : "hover:scale-[1.02]"
      }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Active Managers
                </p>
                <p className="text-2xl font-bold text-purple-900">-</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card
          onClick={() => changeTab("departments")}
          className={`cursor-pointer transition border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100
      ${
        currentTab === "departments"
          ? "ring-2 ring-orange-500 scale-[1.02]"
          : "hover:scale-[1.02]"
      }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Departments
                </p>
                <p className="text-2xl font-bold text-orange-900">-</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                Looking to Create or Manage Departments?
              </h3>

              <p className="text-gray-700 mb-4">
                This <strong>Organizational Hierarchy</strong> view shows the
                complete reporting structure. To create new departments, manage
                teams, or edit departmental structure, use the
                <strong> Team Management </strong> module.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push("/teams")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Go to Team Management
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-sm text-gray-600 flex items-center gap-2 px-3 py-2 bg-white/60 rounded-lg">
                  <span className="font-medium">From there:</span>
                  Click "Departments" → "+ Create New Department"
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== TAB CONTENT ===== */}
      <div className="">
        {currentTab === "total" && (
          <Card>
            <CardTitle className="flex items-center gap-2 p-5">
              <Building2 className="w-5 h-5" />
              Reporting Structure
            </CardTitle>
            <CardContent>
              <TotalEmployees />
            </CardContent>
          </Card>
        )}

        {currentTab === "managers" && (
          <h2 className="text-xl font-semibold">Members With Managers</h2>
        )}

        {currentTab === "active" && (
          <h2 className="text-xl font-semibold">Active Managers</h2>
        )}

        {currentTab === "departments" && (
          <h2 className="text-xl font-semibold">Departments List</h2>
        )}

        <p className="text-sm text-gray-500 mt-2">
          Current Page: {pageFromUrl}
        </p>
      </div>
    </div>
  );
};

/* ===== BUTTON STYLE FUNCTION ===== */
const tabStyle = (active) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition ${
    active ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
  }`;

export default OrgHierarchy;
