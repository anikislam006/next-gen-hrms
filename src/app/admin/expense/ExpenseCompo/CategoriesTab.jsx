"use client";
import React from "react";
import { 
  Loader2, 
  SearchX, 
  ChevronLeft, 
  ChevronRight, 
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
  
  // Logic to rotate colors based on the data index, using a single uniform icon
  const getVariantByIndex = (index) => {
    const variants = [
      { bgColor: "bg-[#F0F7FF]", borderColor: "border-[#DDEBFF]", color: "text-[#3B82F6]" }, // Blue
      { bgColor: "bg-[#F0FFF4]", borderColor: "border-[#DCFCE7]", color: "text-[#22C55E]" }, // Green
      { bgColor: "bg-[#FFF7ED]", borderColor: "border-[#FFEDD5]", color: "text-[#F97316]" }, // Orange
      { bgColor: "bg-[#FAF5FF]", borderColor: "border-[#F3E8FF]", color: "text-[#A855F7]" }, // Purple
      { bgColor: "bg-[#F5F3FF]", borderColor: "border-[#EDE9FE]", color: "text-[#6366F1]" }, // Indigo
      { bgColor: "bg-[#F0FDFA]", borderColor: "border-[#CCFBF1]", color: "text-[#14B8A6]" }, // Teal
    ];
    return variants[index % variants.length];
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
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((cat, index) => {
              const config = getVariantByIndex(index);
              return (
                <motion.div
                  key={cat._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${config.bgColor} ${config.borderColor} border shadow-none rounded-[24px]`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-white/50 shadow-sm flex items-center justify-center">
                          {/* All icons are now the same Receipt icon */}
                          <Receipt className={`w-6 h-6 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${config.color}`}>{cat.categoryName}</h3>
                          <p className="text-xs font-medium text-slate-500">
                            Max: {formatCurrency(cat.maxAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="font-bold text-slate-700 mb-2">Policy Details:</p>
                          <ul className="space-y-1.5 text-slate-600 font-medium">
                            <li className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs">•</span> 
                              Receipt required: {cat.receiptRequired ? 'Yes' : 'No'}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs">•</span> 
                              Approval required: {cat.approvalRequired ? 'Yes' : 'No'}
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs">•</span> 
                              Maximum amount: {formatCurrency(cat.maxAmount)}
                            </li>
                          </ul>
                        </div>
                        
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div>
                            <p className="font-bold text-slate-700 mb-2">Subcategories:</p>
                            <div className="flex flex-wrap gap-2">
                              {cat.subcategories.map((sub, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="bg-white/80 text-slate-700 border-none shadow-sm hover:bg-white px-3 py-1 rounded-lg"
                                >
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
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col gap-3 mt-8">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Page {currentPage} of {pagination?.totalPages || 1}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-11 rounded-2xl font-bold px-6 border-slate-200 bg-white hover:bg-slate-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination?.hasNextPage || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-11 rounded-2xl font-bold px-6 border-slate-200 bg-white hover:bg-slate-50 transition-all"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
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