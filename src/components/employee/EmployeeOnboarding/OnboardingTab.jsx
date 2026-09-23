"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  UserPlus,
  Users,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeOnboardingTabs from "./EmployeeOnboardingTabs";

const EmployeeTab = ({
  statuses,
  setStatus,
  setPage,
  employees,
  statusCounts,
  onboardingRequests
}) => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Employee Onboarding</h1>
            </div>
            <p className="text-green-100">
              Streamlined employee onboarding with self-registration
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold">
              {Object.values(statusCounts).reduce((acc, val) => acc + val, 0)}
            </div>
            <div className="text-green-200 text-sm">Total Requests</div>
          </div>
        </div>
      </motion.div>
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
        {statuses.map((item, index) => {
          const Icon = item.icon;
          const count =
            item.label === "Total"
              ? Object.values(statusCounts).reduce((acc, val) => acc + val, 0)
              : statusCounts[item.label] || 0;

          // gradient + border + text colors
          const gradients = {
            Total: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
            pending:
              "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
            "In Progress":
              "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
            completed:
              "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
            expired: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
          };

          const titleColors = {
            Total: "text-blue-600",
            Pending: "text-yellow-600",
            "In Progress": "text-orange-600",
            Completed: "text-green-600",
            Expired: "text-red-600",
          };

          const countColors = {
            Total: "text-blue-900",
            Pending: "text-yellow-900",
            "In Progress": "text-orange-900",
            Completed: "text-green-900",
            Expired: "text-red-900",
          };

          const iconColors = {
            Total: "text-blue-500",
            Pending: "text-yellow-500",
            "In Progress": "text-orange-500",
            Completed: "text-green-500",
            Expired: "text-red-500",
          };

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              onClick={() => {
                setStatus(item.label);
                setPage(1);
              }}
              className="cursor-pointer"
            >
              <Card
                className={`${
                  gradients[item.label] ||
                  "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                } shadow-md border ${
                  status === item.label ? "ring-2 ring-green-400" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          titleColors[item.label] || "text-gray-600"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          countColors[item.label] || "text-gray-900"
                        }`}
                      >
                        {count}
                      </p>
                    </div>
                    <Icon
                      className={`w-8 h-8 ${
                        iconColors[item.label] || "text-gray-500"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <EmployeeOnboardingTabs onboardingRequests={onboardingRequests}></EmployeeOnboardingTabs>


      {/* Employee List for Onboarding */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div
              key={emp._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="font-semibold text-lg">{emp.fullName}</h3>
              <p>ID: {emp.employeeId}</p>
              <p>Email: {emp.email}</p>
              <p>Phone: {emp.phone}</p>
              <p>Dept: {emp.department}</p>
              <p>Type: {emp.employmentType}</p>
              <p>Status: {emp.status}</p>
            </div>
          ))
        ) : (
          <p>No onboarding employees found.</p>
        )}
      </div> */}
    </div>
  );
};

export default EmployeeTab;
