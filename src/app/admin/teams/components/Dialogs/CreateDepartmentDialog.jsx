'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateDepartmentDialog({
  showCreateDept,
  setShowCreateDept,
  deptForm,
  setDeptForm,
  handleCreateDepartment,
  setShowDeptModal
}) {

  const handleCreateDept = async () => {
  await handleCreateDepartment(); // existing function
  setShowDeptModal(false);       // ✅ close modal
};

  return (
    <Dialog open={showCreateDept} onOpenChange={setShowCreateDept}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription>
            Add a new department to your organization
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <div className="space-y-4 mt-2">
          {/* Department Name */}
          <div>
            <Label>Department Name *</Label>
            <Input
              placeholder="e.g., Marketing, Sales, Technology"
              value={deptForm.name}
              onChange={(e) =>
                setDeptForm({ ...deptForm, name: e.target.value })
              }
              className="mt-1"
            />
          </div>

          {/* Department Code */}
          <div>
            <Label>Department Code *</Label>
            <Input
              placeholder="e.g., MKT, SALES, TECH"
              value={deptForm.code}
              onChange={(e) =>
                setDeptForm({
                  ...deptForm,
                  code: e.target.value.toUpperCase(),
                })
              }
              maxLength={10}
              className="mt-1"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCreateDept(false);
              setDeptForm({ name: '', code: '' });
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreateDept}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Create Department
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
