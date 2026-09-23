"use client";
import React, { useState, useRef } from "react";
import { 
  X, Upload, Calendar as CalendarIcon, 
  Loader2, FileText, ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpense } from "@/app/hook/useExpense"; 
import { useAuth } from "@/context/AuthContext";

const SubmitExpenseDialog = ({ isOpen, onClose, categories = [] }) => {
  const { submitExpense, loading: hookLoading } = useExpense();
      const { UserAllDetails } = useAuth();
  
  const fileInputRef = useRef(null);
  

  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    categoryName: "",
    amount: "",
    currency: "BDT",
    date: new Date().toISOString().split('T')[0],
    projectCode: "PRJ-2025-001",
    description: "",
    location: "",
    merchant: "",

  });

  // Handle Category selection
  const handleCategoryChange = (id) => {
    // Find the category based on the ID string
    const selected = categories?.find((c) => String(c._id) === String(id));
    if (selected) {
      setFormData((prev) => ({ 
        ...prev, 
        categoryId: id, 
        categoryName: selected.categoryName 
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Max 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };
  

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return alert("Please select an expense category");
    
    try {
      const data = new FormData();
      
      // 1. File Attachment
      if (selectedFile) data.append("receipt", selectedFile);
      
      // 2. Existing Form Data
      data.append("categoryId", formData.categoryId);
      data.append("categoryName", formData.categoryName);
      data.append("amount", formData.amount);
      data.append("currency", formData.currency);
      data.append("date", formData.date);
      data.append("projectCode", formData.projectCode);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("merchant", formData.merchant);

      // 3. Appending User Details (New Requirement)
      // Note: Using optional chaining ?. to prevent errors if UserAllDetails is null
      data.append("fullName", UserAllDetails?.fullName || "");
      data.append("designation", UserAllDetails?.designation || "");
      data.append("email", UserAllDetails?.email || "");
      data.append("department", UserAllDetails?.department || "");
      data.append("phone", UserAllDetails?.phone || "");
      data.append("employeeId", UserAllDetails?.employeeId || "");

      // 4. Submit to API
      const response = await submitExpense(data);
      
      if (response.success) {
        // Reset local state
        setSelectedFile(null);
        setFormData({
          ...formData,
          categoryId: "",
          categoryName: "",
          amount: "",
          description: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "Something went wrong during submission.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-[24px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-0 relative">
          <DialogTitle className="text-2xl font-bold text-slate-900 text-left">Submit New Expense</DialogTitle>
          <p className="text-slate-500 mt-1 text-left">Create a new expense request with all necessary details and receipts.</p>
          
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Category *</Label>
            <Select 
              onValueChange={handleCategoryChange} 
              value={formData.categoryId || undefined} // Fallback to undefined to show placeholder
            >
              <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all">
                <SelectValue placeholder={categories?.length > 0 ? "Select category" : "Loading categories..."} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-[250px]">
                {categories && categories.length > 0 ? (
                  categories.map((cat) => (
                    <SelectItem 
                      key={String(cat._id)} 
                      value={String(cat._id)} 
                      className="cursor-pointer py-3"
                    >
                      <span className="font-medium text-slate-700">{cat.categoryName}</span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400 italic">
                    No categories available.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label className="font-bold text-slate-700">Amount *</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Currency</Label>
              <Select 
                value={formData.currency}
                onValueChange={(v) => setFormData({...formData, currency: v})}
              >
                <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="BDT">BDT</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Project Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Date *</Label>
              <div className="relative">
                <Input 
                  type="date" 
                  value={formData.date}
                  className="h-12 bg-slate-50 border-slate-100 rounded-xl pl-4 pr-10"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Project Code</Label>
              <Input 
                placeholder="PRJ-2025-001" 
                value={formData.projectCode}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                onChange={(e) => setFormData({...formData, projectCode: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Description *</Label>
            <Textarea 
              placeholder="Describe the expense purpose..." 
              className="min-h-[80px] bg-slate-50 border-slate-100 rounded-xl resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          {/* Location & Merchant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Location</Label>
              <Input 
                placeholder="City, Country" 
                value={formData.location}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Merchant/Vendor</Label>
              <Input 
                placeholder="Vendor name" 
                value={formData.merchant}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl"
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
              />
            </div>
          </div>

          {/* Receipt Section */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Receipt Attachment</Label>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedFile ? "border-blue-400 bg-blue-50/20" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center gap-3 w-full justify-center">
                  {selectedFile.type.includes("image") ? <ImageIcon className="text-blue-500" /> : <FileText className="text-blue-500" />}
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <X 
                    className="w-5 h-5 text-slate-400 hover:text-red-500 ml-2" 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  />
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">Upload Receipt (PDF or Image)</p>
                  <p className="text-xs text-slate-400">Max size: 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={hookLoading}
              className="flex-1 h-12 bg-[#4F81F4] hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              {hookLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : "Submit Request"}
            </Button>
            <Button 
              type="button" 
              onClick={onClose}
              variant="ghost" 
              className="px-8 h-12 rounded-xl font-bold text-slate-500"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitExpenseDialog;