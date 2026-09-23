'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function CreateTeamDialog({ 
  open, 
  onOpenChange, 
  teamForm, 
  setTeamForm, 
  departments, 
  onCreate 
}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            {teamForm.departmentId
              ? `Adding a team under ${departments.find(d => d._id === teamForm.departmentId)?.name}`
              : 'Select a department and create a team'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Select Department */}
          <div>
            <Label>Department *</Label>
            <Select
              value={teamForm.departmentId}
              onValueChange={(value) => setTeamForm({ ...teamForm, departmentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Name */}
          <div>
            <Label>Team Name *</Label>
            <Input
              placeholder="e.g., Backend Team"
              value={teamForm.teamName}
              onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTeamForm({ departmentId: '', teamName: '' });
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={onCreate}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
