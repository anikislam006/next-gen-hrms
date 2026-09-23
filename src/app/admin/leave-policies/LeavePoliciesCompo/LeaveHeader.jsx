"use client";

import React from 'react';
import { 
  Plus, 
  Settings, 
  Calendar, 
  FileText, 
  Users, 
  Zap,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardStats } from '@/app/hook/useDashboardState';

/**
 * LeaveHeader Component
 * @param {Function} onCreateClick - Handler for the "Add Leave Type" button
 */
const LeaveHeader = ({ onCreateClick }) => {
  // Fetching live data from the super-admin-dashboard-count API
  const { stats, loading, error } = useDashboardStats();

  // Show a subtle loading indicator or placeholder if data is fetching
  const displayValue = (value) => (loading ? "..." : value ?? 0);

  return (
    <div className="space-y-8 mb-10">
      {/* Top Section: Title and Action Button */}
      <div className="flex flex-col md:flex-row lg:flex-row lg:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Gradient Icon Box */}
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-blue-200">
            <Settings className="h-7 w-7 text-white" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Leave Policy Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Configure leave types, policies, entitlements, and approval workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
          <Button 
            onClick={onCreateClick}

          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">Add Leave Type</span>
          </Button>
        </div>
      </div>

      {/* Error State Message */}
      {error && (
        <div className="p-3 text-sm bg-red-50 border border-red-100 text-red-600 rounded-lg">
          Error loading statistics: {error}
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Leave Types */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Leave Types</p>
                <p className="text-2xl font-bold text-slate-900">
                  {displayValue(stats?.totalLeaveTypes)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Policies (isEnabled: true) */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Policies</p>
                <p className="text-2xl font-bold text-slate-900">
                  {displayValue(stats?.activeLeaveTypes)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Covered */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Employees Covered</p>
                <p className="text-2xl font-bold text-slate-900">
                  {displayValue(stats?.totalEmployees)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Assigned (isAutoAssign: true) */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Auto-Assigned</p>
                <p className="text-2xl font-bold text-slate-900">
                  {displayValue(stats?.totalAutoAssign)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveHeader;