"use client";

import React, { useState } from "react";
import { 
  Search, 
  Mail, 
  Briefcase, 
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldEllipsis
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/app/hook/useEmployees";
import ChangeRoleDialog from "./ChangeRoleDialog";

const UserManagement = () => {
  const {
    employees,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    completedTotal
  } = useEmployees();

  // State to track which user is being edited
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row lg:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            User Management
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">
              {completedTotal} Verified
            </Badge>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Audit and manage system permissions</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 rounded-xl"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Employee</th>
              <th className="px-6 py-4 font-semibold">Position</th>
              <th className="px-6 py-4 font-semibold text-center">Role</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                </td>
              </tr>
            ) : (
              employees.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                        {user.fullName ? user.fullName.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.fullName}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase">
                          <Mail className="h-3 w-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{user.designation}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Briefcase className="h-3 w-3" /> {user.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className={`h-4 w-4 ${
                          user.role === "SuperAdmin" ? "text-purple-600" : "text-blue-600"
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenRoleModal(user)}
                      className="rounded-lg h-8 border-slate-200 hover:bg-slate-900 hover:text-white transition-all gap-1.5"
                    >
                      <ShieldEllipsis className="h-3.5 w-3.5" />
                      Role
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">Page {currentPage} of {totalPages}</p>
        <div className="flex gap-2">
          <Button
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modal - Passes user data for console logging verification */}
      <ChangeRoleDialog 
        open={isRoleModalOpen} 
        setOpen={setIsRoleModalOpen} 
        user={selectedUser} 
      />
    </div>
  );
};

export default UserManagement;