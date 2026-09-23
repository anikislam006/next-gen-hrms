"use client";

import React, { useState } from "react";
import { useEmployees } from "../../../../hook/useEmployees";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, CheckCircle2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const AddMemberDialog = ({ open, setOpen, selectedTeam, onAssign }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const { employees, loading, currentPage, setCurrentPage, totalPages } = useEmployees();

  // Filter employees based on search term
  const getAvailableEmployees = (searchTerm) => {
    if (!employees) return [];
    return employees.filter(emp =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employmentType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAssignHead = () => {
    if (selectedEmployee) {
      const emp = employees.find(e => e._id === selectedEmployee);
      onAssign(emp);
      setOpen(false);
      setSelectedEmployee('');
      setEmployeeSearchTerm('');
    }
  };

  const availableEmployees = getAvailableEmployees(employeeSearchTerm);


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSelectedEmployee('');
        setEmployeeSearchTerm('');
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Department Head</DialogTitle>
          <DialogDescription>
            Select an employee to be the head of <strong>{selectedTeam?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <Label>Search Employee *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, email, or role..."
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Employee List */}
          <div>
            {/* <Label className="mb-2 block">
              Available Employees ({totalCompletedEmployees})
            </Label> */}
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-2">
                {loading && <p className="text-center py-8 text-gray-500">Loading...</p>}
                {!loading && availableEmployees.length > 0 ? (
                  availableEmployees.map(emp => (
                    <motion.div
                      key={emp._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEmployee(emp._id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEmployee === emp._id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{emp.fullName}</p>
                            {selectedEmployee === emp._id && (
                              <CheckCircle2 className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {emp.employeeId} • {emp.email}
                          </p>
                          <Badge className="mt-1" variant="outline">
                            {emp.employmentType}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No employees found</p>
                    <p className="text-sm">Try adjusting your search</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center mt-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setOpen(false);
              setSelectedEmployee('');
              setEmployeeSearchTerm('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignHead}
              disabled={!selectedEmployee}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
            >
              Assign as Head
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
