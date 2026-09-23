"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Mail, Lock, Unlock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";
import EmployeeDetailsDialog from "./EmployeeDetailsDialog";
import EditEmployeeDialog from "./EditEmployeeDialog";

export default function EmployeeCard({ employee, departments }) {
  const [emp, setEmp] = useState(employee);
  const [loading, setLoading] = useState(false);

  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleToggleLock = async () => {
    try {
      const action = emp.employmentType === "Locked" ? "unlock" : "lock";
      if (!window.confirm(`Are you sure you want to ${action} this employee?`))
        return;

      setLoading(true);
      const endpoint =
        action === "lock"
          ? `https://code360.pro/api/add-locked/${emp._id}`
          : `https://code360.pro/api/add-unlocked/${emp._id}`;
      const res = await axios.put(endpoint);
      if (res.data.success) {
        toast.success(res.data.message);
        setEmp((prev) => ({
          ...prev,
          employmentType:
            action === "lock"
              ? "Locked"
              : prev.storeEmploymentType || "Unknown",
        }));
      } else toast.error(res.data.message || "Action failed");
    } catch (err) {
      console.error(err);
      toast.error("Error processing action");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleEditClick = () => {
    setEditFormData(selectedEmployee);
    setShowEmployeeDetails(false);
    setShowEditEmployee(true);
  };

  const handleUpdateEmployee = async () => {
    toast.success("Employee updated successfully!");
    setShowEditEmployee(false);
  };

  const roleInfo = {
    label: `${employee.role} (${employee.hr_level})`,
    icon: User,
    colorClass: "bg-purple-100",
    textColor: "text-purple-700",
  };

  const tenure = `${
    new Date().getFullYear() - new Date(employee.joiningDate).getFullYear()
  } year(s)`;

  return (
    <>
      <motion.div
        key={employee.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        className="group cursor-pointer"
      >
        <Card
          onClick={() => handleOpenDetails(employee)}
          className="h-full hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center">
                {employee.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock();
                }}
                disabled={loading}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                {emp.employmentType === "Locked" ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-orange-500" />
                )}
              </button>
            </div>

            <div className="mb-4 space-y-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {employee.fullName}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {employee.designation}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {employee.department}
              </p>
            </div>

            <Badge
              className={`${roleInfo.colorClass} ${roleInfo.textColor} text-xs flex items-center gap-1`}
            >
              <roleInfo.icon className="w-3 h-3" /> {roleInfo.label}
            </Badge>

            <div className="text-xs text-gray-500 space-y-1 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined:{" "}
                {new Date(employee.joiningDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Tenure: {tenure}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {employee.email}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Dialog */}
      {selectedEmployee && (
        <EmployeeDetailsDialog
          open={showEmployeeDetails}
          onClose={() => setShowEmployeeDetails(false)}
          employee={selectedEmployee}
          onEdit={handleEditClick}
        />
      )}

      {/* Edit Dialog */}
      <EditEmployeeDialog
        open={showEditEmployee}
        onClose={() => setShowEditEmployee(false)}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        onSave={handleUpdateEmployee}
        departments={departments}
      />
    </>
  );
}
