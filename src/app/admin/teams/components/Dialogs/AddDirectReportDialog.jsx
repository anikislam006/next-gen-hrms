'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const AddDirectReportDialog = ({
  showAddDirectReport,        // matches parent
  setShowAddDirectReport,     // matches parent
  selectedDept,
  employeeSearchTerm,
  setEmployeeSearchTerm,
  selectedEmployee,
  setSelectedEmployee,
  getAvailableEmployees,
  handleAddDirectReport        // matches parent
}) => {

  // Reset selection when dialog closes
  useEffect(() => {
    if (!showAddDirectReport) {
      setSelectedEmployee('');
      setEmployeeSearchTerm('');
    }
  }, [showAddDirectReport, setSelectedEmployee, setEmployeeSearchTerm]);

  const availableEmployees = getAvailableEmployees('direct_report', employeeSearchTerm);

  const handleAdd = () => {
    if (selectedEmployee) {
      const emp = availableEmployees.find(e => e.id === selectedEmployee);
      handleAddDirectReport(emp);   // pass employee object
      setShowAddDirectReport(false); 
      setSelectedEmployee('');
      setEmployeeSearchTerm('');
    }
  };

  return (
    <Dialog open={showAddDirectReport} onOpenChange={setShowAddDirectReport}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Direct Report</DialogTitle>
          <DialogDescription>
            Add an employee who reports directly to {selectedDept?.name || 'this department'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
            <p className="text-sm text-indigo-800">
              💡 <strong>Direct Reports:</strong> Employees assigned to the department but NOT part of any team.
              They report directly to the department head.
            </p>
          </div>

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
            <Label className="mb-2 block">
              Available Employees ({availableEmployees.length})
            </Label>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-2">
                {availableEmployees.length > 0 ? (
                  availableEmployees.map(emp => (
                    <motion.div
                      key={emp.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEmployee(emp.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEmployee === emp.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{emp.profile.fullName}</p>
                            {selectedEmployee === emp.id && (
                              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {emp.employee_id} • {emp.profile.email}
                          </p>
                          <Badge className="mt-1" variant="outline">
                            {emp.role}
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

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDirectReport(false);
                setSelectedEmployee('');
                setEmployeeSearchTerm('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!selectedEmployee}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
            >
              Add as Direct Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDirectReportDialog;
