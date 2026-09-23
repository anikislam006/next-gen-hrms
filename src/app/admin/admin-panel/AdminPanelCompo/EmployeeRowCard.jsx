"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Lock, 
  Unlock, 
  User, 
  Edit, 
  Trash2, 
  Eye, 
  IdCard 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import EmployeeDetailsDialog from "@/components/employee/Components/EmployeeDetailsDialog";
import EditEmployeeDialog from "@/components/employee/Components/EditEmployeeDialog";

export default function EmployeeRowCard({ employee, departments, fetchEmployees }) {
  const [emp, setEmp] = useState(employee);
  const [loading, setLoading] = useState(false);

  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleToggleLock = async (e) => {
    e.stopPropagation();
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

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditFormData(employee);
    setShowEditEmployee(true);
  };

  const handleUpdateEmployee = async () => {
    toast.success("Employee updated successfully!");
    setShowEditEmployee(false);
  };

  // Status Badge Logic
  const getStatusBadge = () => {
    if (emp.employmentType === "Locked") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 shadow-none">
          Locked
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none">
        Active
      </Badge>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all group"
      >
        {/* Left Section: Avatar & Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {employee.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-lg">
                {employee.fullName}
              </h4>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                {employee.employeeId || "No ID"}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" /> {employee.email}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-none">
                {employee.role} ({employee.hr_level})
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                {employee.department}
              </Badge>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Middle Section: Meta Info (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-8 px-4 border-x border-slate-100 mx-4">
           <div className="text-xs space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-tighter">Joined</p>
                <p className="text-slate-700 font-semibold">{new Date(employee.joiningDate).toLocaleDateString()}</p>
           </div>
           <div className="text-xs space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-tighter">Designation</p>
                <p className="text-slate-700 font-semibold">{employee.designation}</p>
           </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
           
            onClick={() => handleOpenDetails(employee)}
          >
            <Eye className="w-4 h-4 mr-1.5 text-slate-500" />
            View
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            
            onClick={handleEditClick}
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={handleToggleLock}
            className={`rounded-lg font-bold ${
              emp.employmentType === "Locked" 
                ? "text-orange-600 border-orange-200 hover:bg-orange-50" 
                : "text-slate-600"
            }`}
          >
            {emp.employmentType === "Locked" ? (
              <>
                <Unlock className="w-4 h-4 mr-1.5" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-1.5" />
                Lock
              </>
            )}
          </Button>

          {/* <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
                e.stopPropagation();
                // Logic for deletion if needed
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button> */}
        </div>
      </motion.div>

      {/* Details Dialog */}
      {selectedEmployee && (
        <EmployeeDetailsDialog
          open={showEmployeeDetails}
          onClose={() => setShowEmployeeDetails(false)}
          employee={selectedEmployee}
          onEdit={() => {
              setShowEmployeeDetails(false);
              setShowEditEmployee(true);
              setEditFormData(selectedEmployee);
          }}
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
        fetchEmployees={fetchEmployees}
      />
    </>
  );
}