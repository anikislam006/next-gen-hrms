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

export default function EditLeaveTypeDialog({
  showEditLeave,
  setShowEditLeave,
  editForm,
  setEditForm,
}) {
  const { updateLeavePolicy, loading } = useLeavePolicy();

  const handleUpdate = async () => {
    try {
      await updateLeavePolicy(editForm._id, editForm);
      setShowEditLeave(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Dialog open={showEditLeave} onOpenChange={setShowEditLeave}>
      <DialogContent className="max-w-md w-full overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Leave Type</DialogTitle>
          <DialogDescription>
            Update the policy details for {editForm?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Leave Name *</Label>
            <Input
              value={editForm?.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={editForm?.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="resize-none h-20"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Color Tag</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                <input
                  type="color"
                  value={editForm?.colorTag || "#3b82f6"}
                  onChange={(e) => setEditForm({ ...editForm, colorTag: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div 
                  className="w-10 h-4 rounded-sm" 
                  style={{ backgroundColor: editForm?.colorTag || "#3b82f6" }}
                />
              </div>
              <span className="text-sm text-slate-500">Change identification color</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[15px] font-medium text-slate-900">Auto-assign</p>
              <p className="text-sm text-slate-500">Automatically assign to new staff</p>
            </div>
            <Switch 
              checked={editForm?.isAutoAssign || false}
              onCheckedChange={(val) => setEditForm({...editForm, isAutoAssign: val})}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[15px] font-medium text-slate-900">Enabled</p>
              <p className="text-sm text-slate-500">Toggle availability</p>
            </div>
            <Switch 
              checked={editForm?.isEnabled || false}
              onCheckedChange={(val) => setEditForm({...editForm, isEnabled: val})}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={() => setShowEditLeave(false)} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !editForm?.name}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}