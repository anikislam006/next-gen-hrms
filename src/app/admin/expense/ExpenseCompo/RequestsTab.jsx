"use client";
import React, { useEffect, useState } from "react";
import { 
  Search, Clock, CheckCircle2, FileText, 
  Loader2, Check, X, 
  Receipt, BarChart3, MapPin, Hash,
  Filter, CalendarDays, Wallet, TrendingUp,
  Badge
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense";
import { motion } from "framer-motion";

const RequestsTab = ({ categories = [] }) => {
  const { 
    expenses, stats, loading, pagination, 
    fetchHighTierExpenses, // Changed from fetchAllExpenses
    updateStatus, 
    globalSummary, filterSummary 
  } = useExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("all"); 
  const [activeCategory, setActiveCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all_time");

  useEffect(() => {
    // Calling the specific Tiered API
    fetchHighTierExpenses({ 
      page: currentPage, 
      limit: 10, 
      search: searchTerm,
      status: activeStatus === "all" ? "" : activeStatus,
      category: activeCategory === "all" ? "" : activeCategory,
      dateRange: dateRange
    });
  }, [currentPage, searchTerm, activeStatus, activeCategory, dateRange, fetchHighTierExpenses]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateStatus(id, status);
      fetchHighTierExpenses()
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-50 text-green-700 border-green-100";
      case "reimbursed": return "bg-blue-50 text-blue-700 border-blue-100";
      case "rejected": return "bg-red-50 text-red-700 border-red-100";
      case "pending": return "bg-orange-50 text-orange-700 border-orange-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. STATUS COUNT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Expenses", 
            val: stats?.total || 0, 
            sub: `BDT ${globalSummary?.allTimeTotal?.toLocaleString() || 0}`, 
            icon: Receipt, 
            color: "text-blue-600", 
            borderColor: "border-blue-600" 
          },
          { 
            label: "Pending", 
            val: stats?.pending || 0, 
            sub: "Awaiting approval", 
            icon: Clock, 
            color: "text-amber-600", 
            borderColor: "border-amber-600" 
          },
          { 
            label: "Approved", 
            val: stats?.approved || 0, 
            sub: "Ready for payment", 
            icon: CheckCircle2, 
            color: "text-emerald-600", 
            borderColor: "border-emerald-600" 
          },
          { 
            label: "Reimbursed", 
            val: stats?.reimbursed || 0, 
            sub: "Completed", 
            icon: Check, 
            color: "text-blue-600", 
            borderColor: "border-blue-600" 
          },
        ].map((item, i) => (
          <Card key={i} className="border border-slate-100 shadow-sm rounded-[24px] bg-white overflow-hidden">
            <CardContent className="p-8 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <h4 className="text-2xl font-black text-slate-900 leading-tight">{item.val}</h4>
                <p className={`text-xs font-bold ${item.color}`}>{item.sub}</p>
              </div>
              <div className={`flex items-center justify-center ${item.color}`}>
                <item.icon className="w-8 h-8 stroke-[2.5px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

     <div className="bg-white rounded-lg p-5 space-y-4">

      {/* 3. FILTERS (Search and Dropdowns) */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search expenses by description, merchant, location..."
              className="pl-10 h-10 border-slate-200 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={activeStatus} onValueChange={(val) => { setActiveStatus(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-32 h-10 ">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="reimbursed">Reimbursed</SelectItem>
              <SelectItem value="disbursed">Disbursed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activeCategory} onValueChange={(val) => { setActiveCategory(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-44 h-10 ">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories && categories.length > 0 && categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(val) => { setDateRange(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-36 h-10 ">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

{/* 4. DATA LIST (Card-based Layout) */}
      <div className="space-y-4">
        {expenses.length > 0 ? (
          expenses.map((exp) => (
            <motion.div
  key={exp._id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Receipt className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{exp.employeeName || exp.merchant}</h3>
          <p className="text-sm text-gray-600">
            {exp.projectCode || "GENERAL"} • {new Date(exp.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p>
          <p className="font-medium">{exp.categoryName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</p>
          <p className="font-medium text-lg">
            BDT {Number(exp.amount).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
          <p className="font-medium">{exp.location || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</p>
          <p className="font-medium">{exp.merchant || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</p>
          <p className="font-medium">{exp.department || 'Not specified'}</p>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
        <p className="text-gray-700">{exp.description || "No additional notes provided."}</p>
      </div>
     
    </div>

    {/* Right Side Status & Actions */}
    <div className="flex flex-col items-end gap-3">
     

      {/* Pending Actions */}
      {exp.status === 'sent_to_ceo' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleStatusUpdate(exp._id, "approved")}
          >
            <Check className="w-3 h-3 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              const reason = window.prompt('Please provide a reason for rejection:');
              if (reason) {
                handleStatusUpdate(exp._id, "rejected", reason);
              }
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Reject
          </Button>
        </div>
      )}

     {/* {exp.status === 'approved' && (
  <div className="flex flex-col items-end gap-2">
    <div className="text-xs text-green-600 text-right">
      Approved
      <br />
      on {new Date().toLocaleDateString()}
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => handleStatusUpdate(exp._id, "reimbursed")}
      >
        <Wallet className="w-3 h-3 mr-1" />
        Reimburse
      </Button>
      <Button
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => handleStatusUpdate(exp._id, "disbursed")}
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        Disburse
      </Button>
    </div>
  </div>
)} */}

      {/* Status Specific Info */}
      {exp.status === 'approved' && (
        <div className="text-xs text-green-600 text-right">
          Approved
          <br />
          on {new Date().toLocaleDateString()}
        </div>
      )}

      {exp.status === 'rejected' && exp.rejectionReason && (
        <div className="text-xs text-red-600 text-right max-w-48">
          Rejected: {exp.rejectionReason}
        </div>
      )}

      {exp.status === 'reimbursed' && (
        <div className="text-xs text-blue-600 text-right">
          Reimbursement Finalized
        </div>
      )}

      {/* Attachment Button */}
      {exp.receiptUrl && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-blue-600 h-auto p-0 text-xs"
          onClick={() => window.open(exp.receiptUrl, "_blank")}
        >
          View Attachment
        </Button>
      )}
    </div>
  </div>
</motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
            {loading ? (
              <Loader2 className="animate-spin w-10 h-10 text-[#4F81F4] mx-auto" />
            ) : (
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching expenses found</p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="pt-4 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase">
            Page {currentPage} of {pagination.totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button 
              disabled={currentPage === 1 || loading} 
              onClick={() => setCurrentPage(p => p - 1)} 
              variant="outline" 
              className="h-10 px-6 rounded-xl text-xs font-bold border-slate-200"
            >
              Previous
            </Button>
            <Button 
              disabled={!pagination.hasNextPage || loading} 
              onClick={() => setCurrentPage(p => p + 1)} 
              variant="outline" 
              className="h-10 px-6 rounded-xl text-xs font-bold border-slate-200"
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

export default RequestsTab;