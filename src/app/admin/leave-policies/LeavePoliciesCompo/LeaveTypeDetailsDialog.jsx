'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Users, TrendingUp, Plus } from 'lucide-react';
import AddPolicyDialog from './AddPolicyDialog';

export default function LeaveTypeDetailsDialog({ showDetails, setShowDetails, selectedPolicy }) {
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  if (!selectedPolicy) return null;

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-[#fcfcfd]">
        <div className="p-6 bg-white border-b flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-900">{selectedPolicy.name}</DialogTitle>
            <p className="text-slate-500 text-sm">View and manage all policies for this leave type</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Leave Type Information</h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <InfoItem label="Name" value={selectedPolicy.name} />
              <InfoItem label="Status" value={selectedPolicy.isEnabled ? 'Enabled' : 'Disabled'} badge />
              <InfoItem label="Description" value={selectedPolicy.description} fullWidth />
              <InfoItem label="Auto-Assign" value={selectedPolicy.isAutoAssign ? 'Yes' : 'No'} />
              <InfoItem label="Total Policies" value="1" />
            </div>
          </div>

          <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">Tools</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ToolCard icon={<Users className="text-blue-600" />} title="Assign Policy" desc="Bulk assign policies to employees" bg="bg-blue-50" />
              <ToolCard icon={<TrendingUp className="text-emerald-600" />} title="Initial Balance" desc="Adjust leave balances manually" bg="bg-emerald-50" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <h3 className="text-xl font-bold text-slate-900">Policies</h3>
            <Button onClick={() => setShowAddPolicy(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
              <Plus className="w-4 h-4" /> Add Policy
            </Button>
          </div>
        </div>

        <AddPolicyDialog selectedPolicy={selectedPolicy} showAddPolicy={showAddPolicy} setShowAddPolicy={setShowAddPolicy} leaveTypeName={selectedPolicy.name} />
      </DialogContent>
    </Dialog>
  );
}

const InfoItem = ({ label, value, fullWidth, badge }) => (
  <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
    <p className="text-sm font-medium text-slate-400">{label}</p>
    {badge ? (
      <span className="text-[12px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded border border-emerald-100">{value}</span>
    ) : (
      <p className="text-[15px] font-semibold text-slate-800">{value || "N/A"}</p>
    )}
  </div>
);

const ToolCard = ({ icon, title, desc, bg }) => (
  <button className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all text-left group">
    <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
    <div>
      <p className="font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  </button>
);