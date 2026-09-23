"use client";
import React from "react";
import { Receipt, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useExpense } from "@/app/hook/useExpense";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ExpenseHeader = ({ 
  activeTab, 
  setIsDialogOpen, 
  setIsExpenseDialogOpen 
}) => {
  const { globalSummary } = useExpense();

  // Assuming demoMode might be used later, if not, you can remove the Badge
  const demoMode = false; 

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Header Section - Exactly as requested */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex flex-col md:flex-row lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Expense & Reimbursement Management</h1>
            </div>
            <p className="text-pink-100">
              Complete expense management with approval workflow and reimbursement tracking
            </p>
            {demoMode && (
              <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 mt-2">
                🎭 Demo Mode Active
              </Badge>
            )}
          </div>
          <div className="text-right">
            
            <div className="text-2xl font-bold">
              {formatCurrency(globalSummary?.thisMonthTotal || 0)}
            </div>
            <div className="text-pink-200 text-sm">This Month</div>
                  {/* Action Buttons Section - Integrated to work with the layout */}
      <div className="flex justify-end mt-4">
        {activeTab === "categories" && (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-white text-rose-600 hover:bg-pink-50 "
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> 
            Create Category
          </Button>
        )}

        {activeTab === "requests" && (
          <Button
            onClick={() => setIsExpenseDialogOpen(true)}
            className="bg-white text-rose-600 hover:bg-pink-50 "
          >
            <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> 
            Submit Expense
          </Button>
        )}
      </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default ExpenseHeader;