"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Clock, CheckCircle2, Loader2, Check, X,
  Receipt, TrendingUp, ShieldCheck, Crown, SendHorizonal, Banknote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense";
import { motion } from "framer-motion";

const MyExpense = ({ UserAllDetails }) => {
  const {
    expenses,
    loading,
    stats,
    pagination,
    globalSummary,
    categories,
    fetchAllCategories,
    fetchMyExpenses,
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  // ── load categories once ──────────────────────────────────────────────────
  useEffect(() => {
    fetchAllCategories({ page: 1, limit: 100 });
  }, [fetchAllCategories]);

  // ── load my expenses ──────────────────────────────────────────────────────
  const loadMyExpenses = useCallback(() => {
    if (!UserAllDetails?.email) return;
    fetchMyExpenses(UserAllDetails.email, {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: activeStatus === "all" ? "" : activeStatus,
      category: activeCategory === "all" ? "" : activeCategory,
      dateRange: dateRange,
    });
  }, [UserAllDetails?.email, currentPage, searchTerm, activeStatus, activeCategory, dateRange, fetchMyExpenses]);

  useEffect(() => {
    loadMyExpenses();
  }, [loadMyExpenses]);

  // ── status pill renderer ──────────────────────────────────────────────────
  const renderStatusPill = (status) => {
    const map = {
      pending: {
        icon: Clock,
        cls: "bg-amber-50 text-amber-600 border-amber-200",
        label: "Pending",
      },
      sent_to_hr: {
        icon: SendHorizonal,
        cls: "bg-violet-50 text-violet-600 border-violet-200",
        label: "Sent to HR",
      },
      sent_to_ceo: {
        icon: Crown,
        cls: "bg-violet-50 text-violet-600 border-violet-200",
        label: "Sent to CEO",
      },
      approved: {
        icon: Check,
        cls: "bg-emerald-50 text-emerald-600 border-emerald-200",
        label: "Approved",
      },
      rejected: {
        icon: X,
        cls: "bg-red-50 text-red-600 border-red-200",
        label: "Rejected",
      },
      reimbursed: {
        icon: CheckCircle2,
        cls: "bg-blue-50 text-blue-600 border-blue-200",
        label: "Reimbursed",
      },
      disbursed: {
        icon: Banknote,
        cls: "bg-blue-50 text-blue-600 border-blue-200",
        label: "Disbursed",
      },
    };

    const config = map[status] || {
      icon: Clock,
      cls: "bg-slate-50 text-slate-500 border-slate-200",
      label: status || "Unknown",
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${config.cls}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // ── tier badge ────────────────────────────────────────────────────────────
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
            label: "My Total",
            val: stats?.total || 0,
            sub: `BDT ${globalSummary?.allTimeTotal?.toLocaleString() || 0}`,
            icon: Receipt,
            color: "text-blue-600",
          },
          {
            label: "Pending",
            val: stats?.pending || 0,
            sub: "Awaiting approval",
            icon: Clock,
            color: "text-amber-600",
          },
          {
            label: "Approved",
            val: stats?.approved || 0,
            sub: "Ready for payment",
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
              placeholder="Search merchant, location, description..."
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
                <SelectItem value="sent_to_hr">Sent to HR</SelectItem>
                <SelectItem value="sent_to_ceo">Sent to CEO</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeCategory} onValueChange={(v) => { setActiveCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-44 h-10"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-36 h-10"><SelectValue placeholder="Date Range" /></SelectTrigger>
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

                    {/* Avatar + name + tier */}
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
                          {new Date(exp.date).toLocaleDateString()} • {exp.projectCode || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                        <p className="font-semibold">{exp.department || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                        <p className="font-bold text-blue-600">BDT {exp.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Category</p>
                        <p className="font-medium">{exp.categoryName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Merchant</p>
                        <p className="font-medium">{exp.merchant || "—"}</p>
                      </div>
                    </div>

                    {/* Description (if present) */}
                    {exp.description && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Description</p>
                        <p className="text-xs text-slate-600">{exp.description}</p>
                      </div>
                    )}

                  </div>

                  {/* Status area (read-only — no action buttons) */}
                  <div className="flex md:flex-col items-end justify-between gap-2">
                    {renderStatusPill(exp.status)}
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
                  <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-semibold">You haven't submitted any expenses yet.</p>
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

export default MyExpense;