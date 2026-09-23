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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLeavePolicy } from '@/app/hook/useLeavePolicy';

// Import the hook we created

export default function CreateLeaveTypeDialog({
  showCreateLeave,
  setShowCreateLeave,
  leaveForm,
  setLeaveForm,
}) {
  // Use the submit function from our shared hook
  const { submitLeavePolicy, loading } = useLeavePolicy();

  const handleSubmit = async () => {
    try {
      // 1. Execute the POST request via the hook
      await submitLeavePolicy(leaveForm);
      
      // 2. Reset the form local state (optional, can also be done in the hook)
      setLeaveForm({
        name: '',
        description: '',
        colorTag: '#3b82f6',
        isAutoAssign: false,
        isEnabled: true
      });

      // 3. Close the dialog on success
      setShowCreateLeave(false);
    } catch (error) {
      // Error is already handled/logged in the hook, 
      // but you could add a toast notification here
      console.error("Submission failed:", error);
    }
  };

  return (
    <Dialog open={showCreateLeave} onOpenChange={setShowCreateLeave}>
      <DialogContent className="max-w-md w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Leave Type</DialogTitle>
          <DialogDescription>
            Define a new leave policy for your employees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Leave Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Leave Name *</Label>
            <Input
              placeholder="e.g., Annual Leave"
              value={leaveForm.name}
              onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Enter leave description..."
              value={leaveForm.description}
              onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
              className="resize-none h-20"
              disabled={loading}
            />
          </div>

          {/* Color Tag */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color Tag</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                <input
                  type="color"
                  value={leaveForm.colorTag || "#3b82f6"}
                  onChange={(e) => setLeaveForm({ ...leaveForm, colorTag: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div 
                  className="w-10 h-4 rounded-sm" 
                  style={{ backgroundColor: leaveForm.colorTag || "#3b82f6" }}
                />
              </div>
              <span className="text-sm text-slate-500">
                Choose a color to identify this leave type
              </span>
            </div>
          </div>

          {/* Auto-assign Switch Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[15px] font-medium text-slate-900">Auto-assign to new employees</p>
              <p className="text-sm text-slate-500">Automatically assign this leave type when adding new employees</p>
            </div>
            <Switch 
              checked={leaveForm.isAutoAssign}
              onCheckedChange={(val) => setLeaveForm({...leaveForm, isAutoAssign: val})}
              disabled={loading}
            />
          </div>

          {/* Enable Switch Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[15px] font-medium text-slate-900">Enable this leave type</p>
              <p className="text-sm text-slate-500">Make this leave type available for use</p>
            </div>
            <Switch 
              checked={leaveForm.isEnabled}
              onCheckedChange={(val) => setLeaveForm({...leaveForm, isEnabled: val})}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowCreateLeave(false)}
            className="flex-1 hover:bg-slate-100"
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !leaveForm.name}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all active:scale-[0.98]"
          >
            {loading ? "Creating..." : "Create Leave Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}