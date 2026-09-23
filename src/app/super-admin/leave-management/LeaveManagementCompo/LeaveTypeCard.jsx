"use client";

import React from 'react';
import { Calendar, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats } from '@/app/hook/useDashboardState';

const LeaveTypeCardsGrid = () => {
  const { UserAllDetails } = useAuth();
  const userEmail = UserAllDetails?.email;

  // Fetching live data from the hook
  const { userStats, loading, error } = useDashboardStats(userEmail);

  /**
   * Helper to maintain your design colors based on the leave name.
   * If a name doesn't match, it defaults to a neutral gray.
   */
  const getColorConfig = (name) => {
    const leaveName = name.toLowerCase();
    if (leaveName.includes('sick')) return { color: 'text-red-500', bg: 'bg-red-50' };
    if (leaveName.includes('casual')) return { color: 'text-blue-500', bg: 'bg-blue-50' };
    if (leaveName.includes('annual')) return { color: 'text-green-500', bg: 'bg-green-50' };
    if (leaveName.includes('bareavement') || leaveName.includes('bereavement')) return { color: 'text-gray-500', bg: 'bg-gray-50' };
    if (leaveName.includes('paternity') || leaveName.includes('maternity')) return { color: 'text-purple-600', bg: 'bg-purple-50' };
    
    return { color: 'text-slate-500', bg: 'bg-slate-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg text-sm">
        Failed to load leave types: {error}
      </div>
    );
  }

  // Use the breakdown from API or an empty array if not loaded yet
  const leaveTypes = userStats?.leaveTypesBreakdown || [];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mx-auto">
        {leaveTypes.map((item) => {
          const { color, bg } = getColorConfig(item.name);
          
          return (
            <Card 
              key={item.id} 
              className="bg-white rounded-3xl border border-slate-100 hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  
                  {/* Left Side: Dynamic Text Content */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[13px] font-semibold text-slate-500 tracking-tight">
                      {item.name}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-950 tracking-tight">
                      {item.myRemaining}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Used: {item.myLeaveReq}
                    </p>
                  </div>

                  {/* Right Side: Pastel Circle & Calendar Icon */}
                  <div className={`h-16 w-16 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Calendar className={`h-7 w-7 ${color}`} strokeWidth={1.5}/>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveTypeCardsGrid;