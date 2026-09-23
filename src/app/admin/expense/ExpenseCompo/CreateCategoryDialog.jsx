"use client";
import React, { useState } from 'react';
import { X, Plus, Info, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner"; // Using sonner for consistency
import { useExpense } from '@/app/hook/useExpense';

const CreateCategoryDialog = ({ isOpen, onClose }) => {
    // 1. Get the submit function from your hook
    const { submitCategory, loading } = useExpense();
    
    const [subInput, setSubInput] = useState("");
    const [formData, setFormData] = useState({
        categoryName: "",
        maxAmount: "",
        receiptRequired: true,
        approvalRequired: true,
        subcategories: []
    });

    const addSubcategory = () => {
        if (subInput.trim() && !formData.subcategories.includes(subInput.trim())) {
            setFormData(prev => ({
                ...prev,
                subcategories: [...prev.subcategories, subInput.trim()]
            }));
            setSubInput("");
        }
    };

    const removeSubcategory = (index) => {
        setFormData(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index)
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubcategory();
        }
    };

    // 2. Updated Submit logic to use the real API
    const handleSubmit = async () => {
        if (!formData.categoryName || !formData.maxAmount) {
            toast.error("Please fill in the category name and amount");
            return;
        }

        try {
            const response = await submitCategory(formData);
            
            if (response.success) {
                toast.success("Expense category created successfully!");
                
                // Reset Form
                setFormData({
                    categoryName: "",
                    maxAmount: "",
                    receiptRequired: true,
                    approvalRequired: true,
                    subcategories: []
                });
                
                onClose(); // Close Modal
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong while saving");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-white">
                    <DialogTitle className="text-[26px] font-bold text-slate-900 tracking-tight">
                        New Expense Category
                    </DialogTitle>
                    <p className="text-slate-500 text-[13px] mt-1">Define limits and rules for this expense group.</p>
                </DialogHeader>

                <div className="p-8 pt-2 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[14px] font-bold text-slate-700 ml-1">Category Name</Label>
                            <Input 
                                placeholder="e.g. Travel & Transportation"
                                
                                value={formData.categoryName}
                                onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[14px] font-bold text-slate-700 ml-1">Max Amount (BDT)</Label>
                            <Input 
                                type="number"
                                placeholder="50,000"
                                
                                value={formData.maxAmount}
                                onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] p-6 rounded-2xl space-y-4 border border-slate-100">
                        <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4" /> Policy Rules
                        </h4>
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-[15px] font-bold text-slate-800">Receipt Required</Label>
                                <p className="text-[12px] text-slate-500">Users must upload a proof of payment</p>
                            </div>
                            <Switch 
                                checked={formData.receiptRequired}
                                onCheckedChange={(val) => setFormData({...formData, receiptRequired: val})}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                            <div className="space-y-0.5">
                                <Label className="text-[15px] font-bold text-slate-800">Approval Required</Label>
                                <p className="text-[12px] text-slate-500">Admin must review each claim</p>
                            </div>
                            <Switch 
                                checked={formData.approvalRequired}
                                onCheckedChange={(val) => setFormData({...formData, approvalRequired: val})}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[14px] font-bold text-slate-700 ml-1">Subcategories</Label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Add subcategory (e.g. Fuel, Hotel)..."
                                className="h-12 bg-white border-slate-200 rounded-xl"
                                value={subInput}
                                onChange={(e) => setSubInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button 
                                type="button" 
                                onClick={addSubcategory}
                                className="h-12 w-12 bg-slate-900 text-white rounded-xl"
                            >
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            {formData.subcategories.map((sub, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:border-blue-200 transition-all group"
                                >
                                    <span className="text-[13px] font-semibold text-slate-700">{sub}</span>
                                    <button 
                                        onClick={() => removeSubcategory(index)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 bg-slate-50/50 flex items-center justify-end gap-3 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-500 font-bold hover:bg-slate-100 px-6 h-12 rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !formData.categoryName}
                        className="bg-[#4F81F4] hover:bg-[#3b6edb] text-white font-bold px-8 h-12 rounded-xl transition-all shadow-lg shadow-blue-100 min-w-[160px]"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Category"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCategoryDialog;