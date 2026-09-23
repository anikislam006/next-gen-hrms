"use client";

import React from 'react';
import { 
  Shield, 
  ChevronRight, 
  CalendarDays, 
  Wallet, 
  Star,
  FileText,
  CreditCard,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from '@/app/hook/useDashboardState';

const SelfServiceState = ({ UserAllDetails }) => {
  const userEmail = UserAllDetails?.email;

  // Using the hook we created to fetch both global and user stats
  const { stats, userStats, loading, error } = useDashboardStats(userEmail);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Handlers for interactions
  const handleAction = (type) => {
    console.log(`Navigating to ${type} details...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-500 font-medium">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Leave Balance Card (Using userStats.policies) */}
      <Card 
        className="" 
        onClick={() => handleAction("Leave")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Approved Leaves</p>
              <p className="text-lg font-bold">
                {userStats?.policies?.overallTotalMyApprovedLeave || 0} / {userStats?.policies?.overallTotalAnnualDays || 0} Days
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Total Entitlement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Last Month Salary Card (Using userStats.payroll) */}
      <Card 
        className="" 
        onClick={() => handleAction("Payroll")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Last Month Salary</p>
              <p className="text-lg font-bold">
                {formatCurrency(userStats?.payroll?.lastMonthSalary)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Gross Earnings (Using userStats.payroll) */}
      <Card 
        className="" 
        onClick={() => handleAction("Earnings")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Total Gross Salary</p>
              <p className="text-lg font-bold">
                {formatCurrency(userStats?.payroll?.totalGrossSalary)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Policies (Using userStats.policies) */}
      <Card 
        className="" 
        onClick={() => handleAction("Policies")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Active Policies</p>
              <p className="text-lg font-bold">
                {userStats?.policies?.active || 0} <span className="text-sm font-normal text-gray-400">/ {userStats?.policies?.total || 0}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default SelfServiceState;