"use client";
import React from "react";
import { 
  Search, 
  Trash2, 
  Loader2, 
  Inbox
} from "lucide-react";
import { usePayroll } from "@/app/hook/usePayroll";
import CreateStructureDialog from "./CreateStructureDialog";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const StructuresTab = () => {
  const {
    structures,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    handleDeleteStructure,
  } = usePayroll();

  // Standard Currency Formatter
  const formatCurrency = (amount) => {
    return `BDT ${Number(amount).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row lg:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search salary structures..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CreateStructureDialog />
      </div>

      <Card className="status-card">
        <CardHeader>
          <CardTitle>Salary Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && structures.length === 0 ? (
              <div className="py-24 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading structures...</p>
              </div>
            ) : structures.length > 0 ? (
              structures.map((structure) => (
                <div key={structure._id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{structure.title}</h3>
                      <p className="text-sm text-gray-600">
                        Grade {structure.grade}{structure.level} • 
                        {formatCurrency(structure.basic_min)} - {formatCurrency(structure.basic_max)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {structure.epf_applicable ? 'EPF' : 'No EPF'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStructure(structure._id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed rounded-lg">
                <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No salary structures found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {structures.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StructuresTab;