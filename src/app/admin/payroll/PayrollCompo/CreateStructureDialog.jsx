"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePayroll } from "@/app/hook/usePayroll";

const CreateStructureDialog = () => {
  const [showCreateStructure, setShowCreateStructure] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the add method from your hook
  const { handleAddStructure } = usePayroll();

  // Initial State for the form
  const [structureForm, setStructureForm] = useState({
    grade: "",
    level: "",
    title: "",
    basic_min: "",
    basic_max: "",
    epf_applicable: true,
    // BIZ-PAY-01, confirmed with Anik (2026-09-24): House Rent/Medical/
    // Conveyance are ALWAYS derived automatically from Basic Salary via the
    // fixed company formula (Basic 60% / House Rent 30% / Medical 5% /
    // Conveyance 5% of Gross) — they're not grade-specific, so there's
    // nothing to set here for them. Mobile Allowance and Other Allowance are
    // the business's own "additional" components on top of Gross, so those
    // stay configurable as a per-grade default preset.
    default_mobile_allowance: "",
    default_other_allowances: "",
  });

  // Handle Submission with API call
  const handleCreateSalaryStructure = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the method from your usePayroll hook
      const result = await handleAddStructure(structureForm);

      if (result.success) {
        // Close the modal
        setShowCreateStructure(false);
        
        // Reset form
        setStructureForm({
          grade: "",
          level: "",
          title: "",
          basic_min: "",
          basic_max: "",
          epf_applicable: true,
          default_mobile_allowance: "",
          default_other_allowances: "",
        });
      } else {
        alert(result.message || "Failed to create structure");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showCreateStructure} onOpenChange={setShowCreateStructure}>
      {/* The Button that opens the modal */}
      <DialogTrigger asChild>
        <Button className="bg-[#4F81F4] hover:bg-[#3d69d4] text-white gap-2">
          <PlusCircle className="w-4 h-4" />
          Create Structure
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle >
            Create Salary Structure
          </DialogTitle>
          <DialogDescription >
            Define a new salary structure with grades, levels, and allowances.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateSalaryStructure} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Grade Selection */}
            <div className="space-y-2">
              <Label htmlFor="grade" >Grade</Label>
              <Select 
                value={structureForm.grade} 
                onValueChange={(value) => setStructureForm(prev => ({ ...prev, grade: value }))}
              >
                <SelectTrigger >
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="level" >Level</Label>
              <Select 
                value={structureForm.level} 
                onValueChange={(value) => setStructureForm(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger >
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="4">Level 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title Input */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title" >Title</Label>
              <Input
                id="title"
                
                value={structureForm.title}
                onChange={(e) => setStructureForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Executive Level"
                required
              />
            </div>

            {/* Basic Salary Min */}
            <div className="space-y-2">
              <Label htmlFor="basic_min" >Basic Salary (Min)</Label>
              <Input
                id="basic_min"
                type="number"
                
                value={structureForm.basic_min}
                onChange={(e) => setStructureForm(prev => ({ ...prev, basic_min: e.target.value }))}
                placeholder="25000"
                required
              />
            </div>

            {/* Basic Salary Max */}
            <div className="space-y-2">
              <Label htmlFor="basic_max" >Basic Salary (Max)</Label>
              <Input
                id="basic_max"
                type="number"
                
                value={structureForm.basic_max}
                onChange={(e) => setStructureForm(prev => ({ ...prev, basic_max: e.target.value }))}
                placeholder="35000"
                required
              />
            </div>
          </div>

          {/* BIZ-PAY-01, confirmed with Anik (2026-09-24): Basic Salary +
              House Rent + Medical Allowance + Conveyance = Gross Salary,
              split 60% / 30% / 5% / 5% of Gross — a fixed company formula,
              not something that varies by grade. Whatever Basic (or Gross)
              gets entered on an employee's individual salary always derives
              House Rent/Medical/Conveyance automatically from this formula.
              Mobile Allowance and Other Allowance are the business's own
              "additional" components on top of Gross, so those stay
              grade-configurable presets here. */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              House Rent (30%), Medical (5%) and Conveyance (5%) are calculated automatically from Basic Salary for every
              employee — no need to set them per grade.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Default Additional Allowances for this Grade (optional)</Label>
            <p className="text-xs text-gray-500">
              Pre-fills these amounts when this structure is applied to an employee's salary — each
              employee's figures stay individually editable afterward.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <Label htmlFor="default_mobile_allowance" className="text-xs text-gray-600">Mobile Allowance</Label>
                <Input
                  id="default_mobile_allowance"
                  type="number"
                  value={structureForm.default_mobile_allowance}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, default_mobile_allowance: e.target.value }))}
                  placeholder="e.g., 500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="default_other_allowances" className="text-xs text-gray-600">Other Allowances</Label>
                <Input
                  id="default_other_allowances"
                  type="number"
                  value={structureForm.default_other_allowances}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, default_other_allowances: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Provident Fund (PF) applicability (BIZ-PAY-07) — renamed from
              "EPF" to match the business's own terminology. */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <Label htmlFor="epf_applicable">Provident Fund (PF) Applicable</Label>
              <p className="text-xs text-gray-500">
                Whether Provident Fund (10% of Basic) applies to employees on this structure
              </p>
            </div>
            <Switch
              id="epf_applicable"
              checked={structureForm.epf_applicable}
              onCheckedChange={(checked) =>
                setStructureForm((prev) => ({ ...prev, epf_applicable: checked }))
              }
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowCreateStructure(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Structure"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStructureDialog;