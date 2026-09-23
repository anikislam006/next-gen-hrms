"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Clock, CheckCircle2, Loader2, Check, X,
  Receipt, TrendingUp, Banknote, Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense";
import { motion } from "framer-motion";

const RequestFinance = ({ UserAllDetails }) => {
  const {
    expenses,
    loading,
    stats,
    pagination,
    globalSummary,
    categories,           // ← pulled from hook directly
    fetchExpensesApproved,
    fetchAllCategories,   // ← fetch categories inside this component
    updateStatus,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  // ── fetch categories once on mount ────────────────────────────────────────
  useEffect(() => {
    fetchAllCategories({ page: 1, limit: 100 }); // load all for dropdown
  }, [fetchAllCategories]);

  // ── load finance inbox data ────────────────────────────────────────────────
  const loadFinanceInbox = useCallback(() => {
    fetchExpensesApproved({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: activeStatus === "all" ? "" : activeStatus,
      category: activeCategory === "all" ? "" : activeCategory,
      dateRange: dateRange,
    });
  }, [currentPage, searchTerm, activeStatus, activeCategory, dateRange, fetchExpensesApproved]);

  useEffect(() => {
    loadFinanceInbox();
  }, [loadFinanceInbox]);

  // ── status action ──────────────────────────────────────────────────────────
  const handleStatusUpdate = async (id, status, note = "") => {
    try {
      const actorDetails = {
        name: UserAllDetails?.fullName || "",
        email: UserAllDetails?.email || "",
        employeeId: UserAllDetails?.employeeId || "",
        designation: UserAllDetails?.designation || "",
        department: UserAllDetails?.department || "",
        note: note,
      };
      await updateStatus(id, status, actorDetails, loadFinanceInbox);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ── action area per status ─────────────────────────────────────────────────
  const renderActionArea = (exp) => {
    if (exp.status === "approved") {
      return (
        <div className="flex flex-wrap gap-2 justify-end">
          {/* <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleStatusUpdate(exp._id, "reimbursed")}
          >
            <Banknote className="w-3 h-3 mr-1" />
            Reimburse
          </Button> */}
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleStatusUpdate(exp._id, "disbursed")}
          >
            <Send className="w-3 h-3 mr-1" />
            Disburse
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
             onClick={() => handleStatusUpdate(exp._id, "rejected")}
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    if (exp.status === "reimbursed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Reimbursed
        </span>
      );
    }
    if (exp.status === "disbursed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-200">
          <Send className="w-3 h-3" />
          Disbursed
        </span>
      );
    }
    if (exp.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-red-50 text-red-600 border border-red-200">
          <X className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. STATUS COUNT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Finance Total",
            val: stats?.total || 0,
            sub: `BDT ${globalSummary?.allTimeTotal?.toLocaleString() || 0}`,
            icon: Receipt,
            color: "text-blue-600",
          },
          {
            label: "Pending",
            val: stats?.pending || 0,
            sub: "Action required",
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Approved",
            val: stats?.approved || 0,
            sub: "Ready to reimburse",
            icon: CheckCircle2,
            color: "text-emerald-600",
          },
          {
            label: "Reimbursed",
            val: stats?.reimbursed || 0,
            sub: "Settled",
            icon: Check,
            color: "text-blue-600",
          },
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
              placeholder="Search expenses..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* <Select value={activeStatus} onValueChange={(v) => { setActiveStatus(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select> */}
            <Select value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 h-10"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. LIST */}
        <div className="space-y-4">
          {expenses.length > 0 ? (
            expenses.map((exp) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border rounded-xl p-6 hover:border-blue-200 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {exp.fullName?.charAt(0) || <Receipt className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{exp.fullName}</h3>
                        <p className="text-xs text-slate-500">
                          {new Date(exp.date).toLocaleDateString()} • {exp.projectCode}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                        <p className="font-semibold">{exp.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                        <p className="font-bold text-blue-600">BDT {exp.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Category</p>
                        <p className="font-medium">{exp.categoryName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                        <span className="text-[10px] font-black uppercase text-blue-500">{exp.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between gap-2">
                    {renderActionArea(exp)}
                    {exp.receiptUrl && (
                      <a
                        href={exp.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-500 hover:underline"
                      >
                        VIEW RECEIPT
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-400 border border-dashed rounded-xl">
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "No expenses found."
              )}
            </div>
          )}

          {/* 4. PAGINATION */}
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <p>PAGE {currentPage} OF {pagination.totalPages || 1}</p>
            <div className="flex gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>
              <Button
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage(p => p + 1)}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFinance;