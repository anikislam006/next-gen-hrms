"use client";

import React, { useState } from 'react';
import { X, Archive, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useRecruitment } from '@/app/hook/useRecruitment-jobs'; // Import your custom hook

const SendToInventoryDialog = ({ open, onOpenChange, person }) => {
  const { sendToInventory } = useRecruitment(); // Access the specialized function
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reasonCategory: "other",
    detailedReason: ""
  });

  if (!person) return null;

  const inventoryReasons = [
    { label: "Salary Expectations Mismatch", value: "salary", emoji: "💰" },
    { label: "Location Not Suitable", value: "location", emoji: "📍" },
    { label: "Candidate Declined Offer", value: "declined", emoji: "❌" },
    { label: "Timing/Availability Issues", value: "timing", emoji: "⏰" },
    { label: "Accepted Counter Offer", value: "counter_offer", emoji: "📉" },
    { label: "Overqualified for Position", value: "overqualified", emoji: "🏆" },
    { label: "Cultural Fit Concerns", value: "cultural_fit", emoji: "🤝" },
    { label: "Other Reason", value: "other", emoji: "📋" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calls the hook function which updates DB and refreshes Kanban
      await sendToInventory(person._id, {
        reasonCategory: formData.reasonCategory,
        detailedReason: formData.detailedReason,
      });
      
      onOpenChange(false); // Close modal on success
      // Reset form state for next use
      setFormData({ reasonCategory: "other", detailedReason: "" });
    } catch (error) {
      console.error("Failed to send to inventory:", error);
      // Optional: Add toast notification for error here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[32px] focus:outline-none ring-0">
        
        <form onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="px-8 pt-8 pb-4 relative">
            <button 
              type="button"
              onClick={() => onOpenChange(false)} 
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#f3e8ff] rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-[#9333ea]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Send to Candidate Inventory
              </h2>
            </div>
            <p className="text-slate-500 font-medium">
              Save {person.fullName} to inventory for future opportunities
            </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Why use Inventory Info Box */}
            <div className="bg-[#f5f0ff] border border-[#e9d5ff] rounded-[24px] p-6 flex gap-4">
              <div className="shrink-0 mt-1">
                <div className="w-6 h-6 border-2 border-[#9333ea] rounded-full flex items-center justify-center">
                  <span className="text-[#9333ea] font-bold text-xs">i</span>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-[#6b21a8] text-lg">Why use Inventory?</h4>
                <p className="text-[#7e22ce] text-[15px] leading-relaxed opacity-90">
                  Qualified candidates who can't join now due to timing, salary, or location 
                  can be saved for future roles.
                </p>
              </div>
            </div>

            {/* Reason Category */}
            <div className="space-y-3">
              <label className="text-lg font-bold text-slate-800">Reason Category</label>
              <Select 
                value={formData.reasonCategory} 
                onValueChange={(val) => setFormData({...formData, reasonCategory: val})}
              >
                <SelectTrigger className="h-14 bg-[#f8fafc] border-slate-200 rounded-2xl px-5 text-slate-900 font-medium focus:ring-purple-200 transition-all">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl overflow-hidden p-1">
                  {inventoryReasons.map((reason) => (
                    <SelectItem 
                      key={reason.value} 
                      value={reason.value}
                      className="rounded-xl py-3 px-4 focus:bg-purple-50 focus:text-purple-900 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{reason.emoji}</span>
                        <span className="font-medium">{reason.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Reason */}
            <div className="space-y-3">
              <label className="text-lg font-bold text-slate-800">Detailed Reason</label>
              <div className="relative">
                <textarea 
                  required
                  value={formData.detailedReason}
                  onChange={(e) => setFormData({...formData, detailedReason: e.target.value})}
                  className="w-full min-h-[140px] bg-[#f8fafc] border border-slate-200 rounded-[24px] p-5 text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all resize-none leading-relaxed"
                  placeholder="e.g., Excellent candidate but expecting 20% higher salary. Consider for senior role when budget allows..."
                />
                <div className="absolute bottom-4 right-4 bg-white rounded-full p-1 shadow-sm border">
                  <div className="w-6 h-6 bg-[#00d1b2] rounded-full flex items-center justify-center text-white text-[10px] font-bold">G</div>
                </div>
              </div>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-[24px] p-6">
              <h4 className="text-slate-800 font-bold mb-4">Candidate Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Match Score:</span>
                  <span className="text-[#1eb773] font-bold text-lg">92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Experience:</span>
                  <span className="text-slate-800 font-bold">{person.experience} years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-8 py-6 bg-slate-50 flex items-center justify-end gap-4 border-t">
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-6 py-3 text-slate-900 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-2xl h-14 px-8 font-bold flex items-center gap-2 shadow-lg shadow-purple-100 transition-all transform active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Archive className="w-5 h-5" />
              )}
              Send to Inventory
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendToInventoryDialog;