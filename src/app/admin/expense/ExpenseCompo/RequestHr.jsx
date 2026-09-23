"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Clock, CheckCircle2, Loader2, Check, X,
  Receipt, TrendingUp, ShieldCheck, Crown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense";
import { motion } from "framer-motion";

const RequestHr = ({ categories = [], UserAllDetails }) => {
  const {
    expenses,
    loading,
    pagination,
    globalSummary,
    fetchExpensesSentToHr,
    updateStatus,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  const loadHrInbox = useCallback(() => {
    fetchExpensesSentToHr({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      category: activeCategory === "all" ? "" : activeCategory,
      dateRange: dateRange,
    });
  }, [currentPage, searchTerm, activeCategory, dateRange, fetchExpensesSentToHr]);

  useEffect(() => {
    loadHrInbox();
  }, [loadHrInbox]);

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
      await updateStatus(id, status, actorDetails, loadHrInbox);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const renderActionArea = (exp) => {
    if (exp.status === "sent_to_hr") {
      // ── Amount-based routing logic ──
      // ≤ 15,000 → HR can directly approve and send to Finance
      // > 15,000 → HR must send to CEO for high-value approval
      const isHighValue = exp.amount > 15000;

      return (
        <div className="flex gap-2">
          {isHighValue ? (
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => handleStatusUpdate(exp._id, "sent_to_ceo")}
            >
              <Crown className="w-3 h-3 mr-1" />
              Send to CEO
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleStatusUpdate(exp._id, "approved")}
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              const r = window.prompt("Reason for rejection:");
              if (r) handleStatusUpdate(exp._id, "rejected", r);
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    if (exp.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Check className="w-3 h-3" />
          Approved
        </span>
      );
    }
    if (exp.status === "sent_to_ceo") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-violet-50 text-violet-600 border border-violet-200">
          <Crown className="w-3 h-3" />
          Sent to CEO
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
    if (exp.status === "reimbursed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-200">
          <CheckCircle2 className="w-3 h-3" />
          Reimbursed
        </span>
      );
    }
    return null;
  };

  const getTierBadge = (amount) => {
    if (amount <= 7500) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-50 text-green-600 border border-green-200">
          Low 7.5k
        </span>
      );
    }
    if (amount <= 15000) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-200">
          Mid 15k
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-200">
        High 15k+
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "HR Inbox Total",
            val: globalSummary?.allTimeCount || 0,
            sub: `BDT ${globalSummary?.allTimeTotal?.toLocaleString() || 0}`,
            icon: Receipt,
            color: "text-blue-600",
          },
          {
            label: "This Month",
            val: `BDT ${globalSummary?.thisMonthTotal?.toLocaleString() || 0}`,
            sub: "Sent to HR",
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Last Month",
            val: `BDT ${globalSummary?.lastMonthTotal?.toLocaleString() || 0}`,
            sub: "Previous period",
            icon: TrendingUp,
            color: "text-violet-600",
          },
          {
            label: "Awaiting Action",
            val: expenses.filter((e) => e.status === "sent_to_hr").length,
            sub: "On this page",
            icon: ShieldCheck,
            color: "text-emerald-600",
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
              placeholder="Search by name, department, merchant, category..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={activeCategory}
              onValueChange={(v) => { setActiveCategory(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-44 h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateRange}
              onValueChange={(v) => { setDateRange(v); setCurrentPage(1); }}
            >
              <SelectTrigger className="w-36 h-10">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
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

                    {/* Employee info row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {exp.fullName?.charAt(0) || <Receipt className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{exp.fullName}</h3>
                          {getTierBadge(exp.amount)}
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(exp.date).toLocaleDateString()} • {exp.projectCode}
                        </p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Merchant</p>
                        <p className="font-medium">{exp.merchant || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">HOD Approved By</p>
                        <p className="font-medium text-xs">{exp.lastActionBy?.name || "—"}</p>
                      </div>
                    </div>

                  </div>

                  {/* Action area */}
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
                <div className="space-y-2">
                  <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold">No expenses waiting for HR review.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. PAGINATION */}
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <p>PAGE {currentPage} OF {pagination.totalPages || 1}</p>
            <div className="flex gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                variant="outline"
                size="sm"
              >
                Prev
              </Button>
              <Button
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((p) => p + 1)}
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

export default RequestHr;