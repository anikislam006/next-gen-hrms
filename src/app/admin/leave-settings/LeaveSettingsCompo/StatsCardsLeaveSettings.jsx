"use client";

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Split, 
  History 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * StatsCardsLeaveSettings
 * Uses the useLeavePolicy hook to display synchronized KPI data
 */
const StatsCardsLeaveSettings = ( { kpiData, loading }) => {
  // Destructure kpiData and loading from your custom hook

  const stats = [
    {
      label: "Leave Types",
      value: kpiData?.totalLeaveType || 0,
      icon: Calendar,
      color: "border-l-blue-500",
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Use Working Days",
      value: kpiData?.useWorkingDays || 0,
      icon: Clock,
      color: "border-l-green-500",
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Allow Half Day",
      value: kpiData?.allowHalfDay || 0,
      icon: Split,
      color: "border-l-orange-500",
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Allow Past Leave",
      value: kpiData?.allowPastDates || 0,
      icon: History,
      color: "border-l-purple-500",
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  if (loading && !kpiData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg border-l-4 border-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`border-l-4 ${stat.color} shadow-sm bg-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full ${stat.bg} flex items-center justify-center transition-transform hover:scale-110 shrink-0 ml-2`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCardsLeaveSettings;