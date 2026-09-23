"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  GitBranch,
  UserCheck,
  Clock,
  DollarSign,
  Target,
  Receipt,
  User,
  Shield,
  Settings,
  LineChartIcon,
  Network,
  Briefcase,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "@/context/AuthContext";

// 🔹 Base paths by role
const roleBasePaths = {
  superadmin: "/super-admin",
  admin: "/admin",
  employee: "/employee",
};

// 🔹 Menu items (role agnostic)
const menuItems = [
  {
    id: "app-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics",
    roles: ["superadmin", "employee", "admin"],
  },  
  {
    id: "attendance",
    label: "Attendance",
    icon: Clock,
    description: "Track attendance and working hours",
    roles: ["superadmin", "employee", "admin"],
  },
  {
    id: "line-management",
    label: "Line Management",
    icon: LineChartIcon,
    description: "View line manager relationship",
    roles: [""],
  },
  {
    id: "leave-management",
    label: "Leave Management",
    icon: Calendar,
    description: "Manage leave requests and approvals",
    roles: ["superadmin", "employee", "admin"],
  },
  {
    id: "leave-settings",
    label: "Leave Advance Settings",
    icon: Briefcase,
    description:
      "Configure working days, half-day, past leave & modify settings",
    roles: ["superadmin", "admin"],
  },
  {
    id: "leave-policies",
    label: "Leave Policies",
    icon: Settings,
    description: "Configure leave types, policies, and rules",
    roles: ["superadmin", "admin"],
  },
  // {
  //   id: "recruitment",
  //   label: "Recruitment",
  //   icon: UserCheck,
  //   description: "Manage Recruitment records",
  //   roles: ["superadmin", "admin"],
  // },
    {
    id: "recruitment-nextzen",
    label: "Recruitment",
    icon: UserCheck,
    description: "Manage Recruitment records",
    roles: ["superadmin"],
  },
  {
    id: "employees",
    label: "Employee Management",
    icon: Users,
    description: "Manage Employee records",
    roles: ["superadmin", "admin"],
  },
  {
    id: "teams",
    label: "Team Management",
    icon: GitBranch,
    description: "Manage teams and hierarchy",
    roles: ["superadmin", "employee", "admin"],
  },
  {
    id: "org-hierarchy",
    label: "Org hierarchy",
    icon: Network,
    description: "View org-hierarchy",
    roles: ["superadmin", "employee", "admin"],
  },
  {
    id: "managers",
    label: "Manager Assignment",
    icon: UserCheck,
    description: "Assign managers and approvals",
    roles: [""],
  },

  {
    id: "payroll",
    label: "Payroll",
    icon: DollarSign,
    description: "Salary and payroll management",
    roles: ["superadmin", "admin"],
  },
  {
    id: "performance",
    label: "Performance",
    icon: Target,
    description: "Performance reviews and goals",
    roles: ["superadmin", "admin", "employee"],
  },
  {
    id: "expense",
    label: "Expense Management",
    icon: Receipt,
    description: "Manage expense claims and reimbursements",
    roles: ["superadmin", "admin", "employee"],
  },
  {
    id: "self-service",
    label: "Self Service",
    icon: User,
    description: "Employee self-service portal",
    roles: ["superadmin", "admin", "employee"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    description: "Analytics and reporting dashboard",
    roles: ["superadmin", "admin"],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    description: "Compliance and document management",
    roles: ["superadmin", "admin"],
  },
  {
    id: "admin-panel",
    label: "Admin Panel",
    icon: Settings,
    description: "System administration and settings",
    roles: ["superadmin"],
  }, 
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, UserAllDetails } = useAuth();
  const pathname = usePathname();

  // Normalize role
  const userRole = user?.role?.toLowerCase() || "";
  const basePath = roleBasePaths[userRole] || "";

  // Filter menus by role and build path dynamically
  const filteredMenuItems = menuItems
    .filter((item) => item.roles?.includes(userRole))
    .map((item) => ({
      ...item,
      path: `${basePath}/${item.id}`, // 🔥 dynamic path
    }));

  // Render menu items
  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;

    const menuButton = (
      <motion.div
        key={item.id}
        whileHover={{ scale: 1.02, x: collapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href={item.path}
          onClick={() => setMobileOpen(false)}
          className={`
            w-full flex flex-col items-start gap-1 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
            ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }
          `}
        >
          {/* Top row */}
          <div className="flex items-center gap-3 w-full">
            <Icon
              className={`w-5 h-5 ${
                isActive
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-700"
              }`}
            />
            {!collapsed && <div className="font-medium">{item.label}</div>}
          </div>

          {/* Description */}
          <AnimatePresence>
            {!collapsed && !isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full pl-8 overflow-hidden"
              >
                <div className="text-xs opacity-75 truncate">
                  {item.description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    );

    return collapsed ? (
      <TooltipProvider key={item.id}>
        <Tooltip>
          <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-75">{item.description}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      menuButton
    );
  };

  // Sidebar content
  const sidebarContent = (
    <div className="h-full flex flex-col font-inter bg-white/80 backdrop-blur-xl border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR System
              </h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {user?.role === "SuperAdmin"
              ? "SA"
              : user?.role?.charAt(0).toUpperCase() || "U"}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden"
              >
                <div className="font-medium text-gray-900 truncate">
                  {user?.role === "SuperAdmin"
                    ? "Super Admin"
                    : user?.role === "admin"
                      ? "Hr & Admin"
                      : user?.role
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : "User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {UserAllDetails?.fullName || "Unnamed User"}
                </div>
                {UserAllDetails?.designation && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {UserAllDetails?.designation}
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenuItems.map(renderMenuItem)}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        Admin Dashboard v1.0
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 p-0 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 340 }}
        transition={{ duration: 0.3 }}
        className="hidden md:block h-screen sticky top-0 z-40"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -340 }}
              animate={{ x: 0 }}
              exit={{ x: -340 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed left-0 top-0 h-full w-60 z-50 bg-white"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
