"use client";
import React from "react";
import { 
  Loader2, 
  SearchX, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  Hotel, 
  Utensils, 
  Smartphone, 
  Briefcase, 
  GraduationCap,
  Receipt
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const CategoriesTab = ({
  categories = [],
  loading,
  pagination,
  currentPage,
  setCurrentPage,
}) => {
  // Helper to map styles and icons based on category name from your reference images
  const getCategoryConfig = (name) => {
    const n = name.toLowerCase();
    if (n.includes("travel") || n.includes("transport")) 
      return { bgColor: "bg-blue-50/50", borderColor: "border-blue-100", color: "text-blue-600", icon: Car };
    if (n.includes("accommodation") || n.includes("hotel")) 
      return { bgColor: "bg-green-50/50", borderColor: "border-green-100", color: "text-green-600", icon: Hotel };
    if (n.includes("meals") || n.includes("entertainment") || n.includes("food")) 
      return { bgColor: "bg-orange-50/50", borderColor: "border-orange-100", color: "text-orange-600", icon: Utensils };
    if (n.includes("communication") || n.includes("phone")) 
      return { bgColor: "bg-purple-50/50", borderColor: "border-purple-100", color: "text-purple-600", icon: Smartphone };
    if (n.includes("office")) 
      return { bgColor: "bg-indigo-50/50", borderColor: "border-indigo-100", color: "text-indigo-600", icon: Briefcase };
    if (n.includes("training")) 
      return { bgColor: "bg-teal-50/50", borderColor: "border-teal-100", color: "text-teal-600", icon: GraduationCap };
    
    return { bgColor: "bg-slate-50/50", borderColor: "border-slate-100", color: "text-slate-600", icon: Receipt };
  };

  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#4F81F4] mb-4" />
        <p className="text-slate-500 font-medium italic">Syncing Enveria Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map((cat, index) => {
            const config = getCategoryConfig(cat.categoryName);
            return (
             <motion.div
  key={cat._id || index}
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
  <Card className={`${config.bgColor} ${config.borderColor} border`}>
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <config.icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${config.color}`}>{cat.categoryName}</h3>
          <p className="text-sm text-gray-600">
            Max: {formatCurrency(cat.maxAmount)}
          </p>
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-gray-700">Policy Details:</p>
          <ul className="mt-1 space-y-1 text-gray-600">
            <li>• Receipt required: {cat.receiptRequired ? 'Yes' : 'No'}</li>
            <li>• Approval required: {cat.approvalRequired ? 'Yes' : 'No'}</li>
            <li>• Maximum amount: {formatCurrency(cat.maxAmount)}</li>
          </ul>
        </div>
        
        {cat.subcategories && cat.subcategories.length > 0 && (
          <div>
            <p className="font-medium text-gray-700">Subcategories:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {cat.subcategories.map((sub, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {typeof sub === 'string' ? sub : sub.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
</motion.div>
            );
          })}

          {/* Pagination Controls */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {pagination?.totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-10 rounded-xl font-bold px-5 border-slate-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination?.hasNextPage || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-10 rounded-xl font-bold px-5 border-slate-200"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 p-24 text-center rounded-[32px] bg-white">
          <SearchX className="mx-auto h-12 w-12 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No categories found</p>
        </Card>
      )}
    </div>
  );
};

export default CategoriesTab;