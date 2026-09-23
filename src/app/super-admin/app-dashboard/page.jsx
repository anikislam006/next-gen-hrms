"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Loader2
} from 'lucide-react';
import { useDashboardStats } from '@/app/hook/useDashboardState';

// --- UI Components ---
const Card = ({ children, className }) => (
  <div className={`rounded-xl border shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Badge = ({ children, className }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
    {children}
  </span>
);

const DashboardPage = () => {
  // Fetch real data from your hook
  const { stats, loading, error } = useDashboardStats();

  const currentUser = {
    profile: { designation: "System Administrator" }
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT', // Changed to BDT based on your location, change to USD if preferred
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <Card className="bg-white p-8 max-w-md text-center border-red-200">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* System Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8" />
                <h1 className="text-3xl font-bold">HR Management Dashboard</h1>
              </div>
              <p className="text-blue-100 mb-2">
                System Overview • {currentUser?.profile?.designation}
              </p>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="text-sm">Total Employees: {stats?.totalEmployees}</span>
                <span className="text-sm">Today: {new Date().toLocaleDateString()}</span>
                <Badge className="bg-white/20 text-white border-white/30 ml-2">
                  Live System
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Today's Attendance</div>
              <div className="text-blue-200 text-sm">
                {stats?.presentToday} Present
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Employees */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-800">
                    {stats?.totalEmployees}
                  </div>
                  <div className="text-sm text-green-600">Total Employees</div>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 text-xs text-green-600">
                Avg. Gross Salary: {formatCurrency(stats?.averageGrossSalary)}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Rate */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-800">
                    {stats?.attendanceRate}%
                  </div>
                  <div className="text-sm text-blue-600">Attendance Rate</div>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4 text-xs text-blue-600">
                {stats?.presentToday} people checked in today
              </div>
            </CardContent>
          </Card>

          {/* Pending Leaves */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {stats?.totalPendingLeaves}
                  </div>
                  <div className="text-sm text-orange-600">Pending Leaves</div>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-4 text-xs text-orange-600">
                Requires immediate action
              </div>
            </CardContent>
          </Card>

          {/* Monthly Payroll */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {formatCurrency(stats?.lastMonthTotalSalary)}
                  </div>
                  <div className="text-sm text-purple-600">Last Month Payroll</div>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4 text-xs text-purple-600 font-medium">
                Period: {stats?.lastMonthLabel}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/super-admin/employees"
            className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-md"
          >
            <Users className="w-6 h-6" />
            <span>Manage Employees</span>
          </Link>

          <Link 
            href="/super-admin/leave-management"
            className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all hover:shadow-md"
          >
            <Calendar className="w-6 h-6" />
            <span>Leave Management</span>
          </Link>

          <Link 
            href="/super-admin/payroll-records"
            className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all hover:shadow-md"
          >
            <DollarSign className="w-6 h-6" />
            <span>Payroll Records</span>
          </Link>

          <Link 
            href="/super-admin/reports"
            className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl text-white font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-md"
          >
            <BarChart3 className="w-6 h-6" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;