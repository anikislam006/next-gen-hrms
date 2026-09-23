"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Archive,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  Star,
  Briefcase,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen"; // ✅ Nextzen hook

const INVENTORY_REASONS = [
  { label: "Salary Expectations Mismatch", value: "salary", emoji: "💰" },
  { label: "Location Not Suitable", value: "location", emoji: "📍" },
  { label: "Candidate Declined Offer", value: "declined", emoji: "❌" },
  { label: "Timing/Availability Issues", value: "timing", emoji: "⏰" },
  { label: "Accepted Counter Offer", value: "counter_offer", emoji: "📉" },
  { label: "Overqualified for Position", value: "overqualified", emoji: "🏆" },
  { label: "Cultural Fit Concerns", value: "cultural_fit", emoji: "🤝" },
  { label: "Other Reason", value: "other", emoji: "📋" },
];

const initialFormState = {
  reasonCategory: "",
  detailedReason: "",
};

const SendToInventoryDialog = ({ open, onOpenChange, person }) => {
  // ✅ Pull sendToInventory from the Nextzen hook
  const { sendToInventory } = useRecruitmentNextzen();

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Reset form when dialog closes ──────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setSuccess("");
      setError("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!person) return null;

  // ── Compute match score (same heuristic used elsewhere) ────────────────
  const matchScore =
    person.matchScore ?? Math.min(95, 70 + (person.experience || 0) * 3);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.reasonCategory) {
      setError("Please select a reason category");
      return;
    }
    if (!formData.detailedReason.trim()) {
      setError("Please provide a detailed reason");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendToInventory(person._id, {
        reasonCategory: formData.reasonCategory,
        detailedReason: formData.detailedReason.trim(),
      });

      if (result?.success) {
        setSuccess("Candidate moved to inventory successfully!");

        // Brief delay to show the success state, then close
        setTimeout(() => {
          onOpenChange(false);
        }, 800);
      }
    } catch (err) {
      console.error("Failed to send to inventory:", err);
      setError(err.message || "Failed to move to inventory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-2xl focus:outline-none">
        <form onSubmit={handleSubmit}>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div className="px-8 pt-8 pb-4 relative bg-white border-b border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Archive className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Send to Candidate Inventory
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Save{" "}
              <span className="font-semibold text-slate-700">
                {person.fullName}
              </span>{" "}
              to inventory for future opportunities
            </p>
          </div>

          {/* ── BODY ────────────────────────────────────────────────────── */}
          <div className="px-8 py-6 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Why use Inventory info card */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-900 text-sm mb-1">
                  Why use Inventory?
                </h4>
                <p className="text-purple-700 text-xs leading-relaxed">
                  Qualified candidates who can't join now due to timing, salary,
                  or location can be saved for future roles.
                </p>
              </div>
            </div>

            {/* Reason Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Reason Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.reasonCategory}
                onValueChange={(val) =>
                  setFormData({ ...formData, reasonCategory: val })
                }
              >
                <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-md focus:bg-white">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_REASONS.map((reason) => (
                    <SelectItem
                      key={reason.value}
                      value={reason.value}
                      className="cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{reason.emoji}</span>
                        <span>{reason.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Reason */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Detailed Reason <span className="text-red-500">*</span>
              </Label>
              <textarea
                value={formData.detailedReason}
                onChange={(e) =>
                  setFormData({ ...formData, detailedReason: e.target.value })
                }
                placeholder="e.g., Excellent candidate but expecting 20% higher salary. Consider for senior role when budget allows..."
                className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            {/* Candidate Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" />
                Candidate Summary
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Match Score</p>
                  <p className="font-bold text-emerald-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {matchScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Experience</p>
                  <p className="font-bold text-slate-900">
                    {person.experience || 0} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Current Stage</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    {person.status || "Applied"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Job Role</p>
                  <p className="font-semibold text-slate-700 text-xs truncate">
                    {person.jobRoleName || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status messages */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* ── ACTION FOOTER ───────────────────────────────────────────── */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-slate-600 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.reasonCategory ||
                !formData.detailedReason.trim()
              }
              className="bg-purple-600 hover:bg-purple-700 text-white h-10 px-6 rounded-md font-semibold flex items-center gap-2 shadow-sm shadow-purple-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Moving...
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  Send to Inventory
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendToInventoryDialog;