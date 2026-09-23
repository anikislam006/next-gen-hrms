"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Search, Clock, CheckCircle2, Loader2, Check, X, 
  Receipt, Wallet, TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense";
import { motion } from "framer-motion";

const RequestsHOD = ({ categories = [], UserAllDetails }) => {
  const { 
    expenses, stats, loading, pagination, 
    fetchExpensesByDepartment, // Use this for department-specific data
    updateStatus, 
    globalSummary 
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("all"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  console.log(UserAllDetails);
  

  // Get the department from user details
  const userDept = UserAllDetails?.department;



  // Memoized fetch function to prevent unnecessary re-renders
  const loadDepartmentData = useCallback(() => {
    if (!userDept) return;

    fetchExpensesByDepartment(userDept, { 
      page: currentPage, 
      limit: 10, 
      search: searchTerm,
      status: activeStatus === "all" ? "" : activeStatus,
      category: activeCategory === "all" ? "" : activeCategory,
      dateRange: dateRange
    });
  }, [userDept, currentPage, searchTerm, activeStatus, activeCategory, dateRange, fetchExpensesByDepartment]);

  useEffect(() => {
    loadDepartmentData();
  }, [loadDepartmentData]);

  const handleStatusUpdate = async (id, status, note = "") => {
  try {
    // ✅ Build actor object from UserAllDetails
    const actorDetails = {
      name: UserAllDetails?.fullName || "",
      email: UserAllDetails?.email || "",
      employeeId: UserAllDetails?.employeeId || "",
      designation: UserAllDetails?.designation || "",
      department: UserAllDetails?.department || "",
      note: note,
    };

    await updateStatus(id, status, actorDetails, loadDepartmentData);
    fetchExpensesByDepartment()
  } catch (err) {
    alert("Error: " + err.message);
  }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. STATUS COUNT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Dept. Total", val: stats?.total || 0, sub: `BDT ${globalSummary?.allTimeTotal?.toLocaleString() || 0}`, icon: Receipt, color: "text-blue-600" },
          { label: "Pending", val: stats?.pending || 0, sub: "Action required", icon: Clock, color: "text-amber-600" },
          { label: "Approved", val: stats?.approved || 0, sub: "Finance queue", icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Reimbursed", val: stats?.reimbursed || 0, sub: "Settled", icon: Check, color: "text-blue-600" },
        ].map((item, i) => (
          <Card key={i} className="border border-slate-100 shadow-sm rounded-[24px] bg-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <h4 className="text-2xl font-black text-slate-900">{item.val}</h4>
                <p className={`text-xs font-bold ${item.color}`}>{item.sub}</p>
              </div>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg p-5 space-y-4 shadow-sm border">
        {/* 2. FILTERS */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder={`Search expenses in ${userDept}...`}
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={activeStatus} onValueChange={(v) => { setActiveStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
                <SelectItem value="sent_to_hr">Sent To Hr</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 h-10"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(cat => <SelectItem key={cat._id} value={cat.categoryName}>{cat.categoryName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. LIST */}
        <div className="space-y-4">
          {expenses.length > 0 ? (
            expenses.map((exp) => (
              <motion.div key={exp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border rounded-xl p-6 hover:border-blue-200 transition-all shadow-sm">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {exp.employeeName?.charAt(0) || <Receipt className="w-5 h-5"/>}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{exp.employeeName}</h3>
                        <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()} • {exp.projectCode}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Department</p><p className="font-semibold">{exp.department}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p><p className="font-bold text-blue-600">BDT {exp.amount?.toLocaleString()}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Category</p><p className="font-medium">{exp.categoryName}</p></div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Status</p><span className="text-[10px] font-black uppercase text-blue-500">{exp.status}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col items-end justify-between gap-2">
                    {exp.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(exp._id, "sent_to_hr")}>Sent to hr</Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                          const r = window.prompt('Reason:');
                          if (r) handleStatusUpdate(exp._id, "rejected", r);
                        }}>Reject</Button>
                      </div>
                    )}
                    {exp.receiptUrl && <a href={exp.receiptUrl} target="_blank" className="text-[10px] font-bold text-blue-500 hover:underline">VIEW RECEIPT</a>}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 border border-dashed rounded-xl">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "No expenses found for this department."}
            </div>
          )}
          {/* 4. PAGINATION */}
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <p>PAGE {currentPage} OF {pagination.totalPages || 1}</p>
            <div className="flex gap-2">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} variant="outline" size="sm">Prev</Button>
              <Button disabled={!pagination.hasNextPage} onClick={() => setCurrentPage(p => p + 1)} variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsHOD;