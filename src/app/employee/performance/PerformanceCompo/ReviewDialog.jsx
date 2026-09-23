"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { usePerformance } from "@/app/hook/usePerformance";

export default function ReviewDialog({ 
  open, 
  onClose, 
  selectedEmployee, 
  reviewerData, 
  refreshEmployees 
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Destructure submitReview from our custom hook
  const { submitReview } = usePerformance();

  const handleSubmit = async () => {
    if (rating === 0) {
      return toast.error("Please select a rating");
    }

    const payload = {
      // Reviewee Details
      employeeId: selectedEmployee?._id,
      employeeName: selectedEmployee?.fullName,
      employeeEmail: selectedEmployee?.email,
      employeeDesignation: selectedEmployee?.designation,
      
      // Reviewer Details
      reviewerId: reviewerData?.employeeId,
      reviewerName: reviewerData?.fullName,
      reviewerEmail: reviewerData?.email,
      
      // Review Content
      rating: Number(rating),
      feedback,
      weightContribution: 1.66, // 5 marks / 3 reviewers logic
    };

    setSubmitting(true);
    
    try {
      // Using the hook function which handles the fetch call and global state refresh
      const response = await submitReview(payload);
      
      if (response.success) {
        toast.success("Review submitted successfully!");
        
        // Reset local state
        setRating(0);
        setFeedback("");
        
        // Close dialog and refresh parent list
        onClose();
        if (refreshEmployees) refreshEmployees();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccessibleDialog 
      open={open} 
      onOpenChange={onClose} 
      title="Performance Review" 
      size="MEDIUM"
    >
      <div className="space-y-6">
        {/* Info Card */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
           <p className="text-sm text-indigo-800 font-semibold">
             Reviewing: <span className="font-bold">{selectedEmployee?.fullName}</span>
           </p>
           <p className="text-xs text-indigo-600 mt-1 opacity-80">
             Submitting as: {reviewerData?.fullName}
           </p>
        </div>

        {/* Rating Selector */}
        <div className="flex flex-col items-center gap-3 py-2">
          <Label className="text-gray-600 font-medium">Select Performance Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="transition-transform active:scale-90 hover:scale-110"
              >
                <Star 
                  className={`w-10 h-10 transition-colors ${
                    rating >= s 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-200"
                  }`} 
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest">
              {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
            </span>
          )}
        </div>

        {/* Feedback Input */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Detailed Feedback</Label>
          <Textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)} 
            placeholder="Describe the employee's strengths and areas for improvement..."
            className="min-h-[120px] focus-visible:ring-indigo-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
          >
            {submitting ? "Saving..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </AccessibleDialog>
  );
}