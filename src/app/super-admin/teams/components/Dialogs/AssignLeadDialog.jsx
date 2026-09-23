'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const AssignLeadDialog = ({
  open,
  onOpenChange,
  selectedTeam,
  employeeSearchTerm,
  setEmployeeSearchTerm,
  selectedEmployee,
  setSelectedEmployee,
  getAvailableEmployees,
  onAssignLead
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Team Lead</DialogTitle>
          <DialogDescription>
            Select an employee to lead {selectedTeam?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
              Available Employees ({getAvailableEmployees('lead', employeeSearchTerm).length})
            </Label>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-2 space-y-2">
                {getAvailableEmployees('lead', employeeSearchTerm).length > 0 ? (
                  getAvailableEmployees('lead', employeeSearchTerm).map(emp => (
                    <motion.div
                      key={emp.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEmployee(emp.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEmployee === emp.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{emp.profile.full_name}</p>
                            {selectedEmployee === emp.id && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                onOpenChange(false);
                setSelectedEmployee('');
                setEmployeeSearchTerm('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onAssignLead}
              disabled={!selectedEmployee}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
            >
              Assign as Lead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignLeadDialog;
