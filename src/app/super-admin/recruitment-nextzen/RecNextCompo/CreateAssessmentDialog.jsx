"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  FileText,
  List,
  Layers,
  Trash2,
  Plus,
  Loader2,
  Briefcase,
  Calendar,
  Award,
  CheckCircle2,
} from "lucide-react";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import { useAssessmentNextzen } from "@/app/hook/useAssesmentNextzen";

const CreateAssessmentDialog = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("create");

  const {
    assessments,
    loading,
    submitAssessment,
    fetchAllAssessments,
    fetchAssessmentsByJob,
    removeAssessment,
  } = useAssessmentNextzen();

  const { fetchJobOptions } = useJobPostsNextzen();

  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState("");

  // Form state
  const initialFormState = {
    assessmentTitle: "",
    startDate: "",
    instructions: "",
    assessmentTypesList: [],
    jobRoleId: "",
    jobRoleName: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [currentType, setCurrentType] = useState({
    typeTitle: "",
    maxMarks: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Load jobs on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      fetchJobOptions().then((opts) => setJobOptions(opts || []));
    }
  }, [open, fetchJobOptions]);

  // ── Load assessments when tab changes ──────────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (activeTab === "all") {
      fetchAllAssessments({ page: 1 });
    } else if (activeTab === "job") {
      if (selectedJobFilter) {
        fetchAssessmentsByJob(selectedJobFilter, { page: 1 });
      }
    }
  }, [open, activeTab, selectedJobFilter, fetchAllAssessments, fetchAssessmentsByJob]);

  // ── Reset on close ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setCurrentType({ typeTitle: "", maxMarks: "" });
      setSuccess("");
      setError("");
      setActiveTab("create");
    }
  }, [open]);

  // ── Add component to list ──────────────────────────────────────────────
  const addTypeToList = () => {
    if (!currentType.typeTitle || !currentType.maxMarks) {
      setError("Component title and max marks are required");
      return;
    }
    setError("");
    setFormData((prev) => ({
      ...prev,
      assessmentTypesList: [
        ...prev.assessmentTypesList,
        {
          id: Date.now(),
          typeTitle: currentType.typeTitle,
          maxMarks: currentType.maxMarks,
        },
      ],
    }));
    setCurrentType({ typeTitle: "", maxMarks: "" });
  };

  // ── Remove component from list ─────────────────────────────────────────
  const removeFromList = (id) => {
    setFormData((prev) => ({
      ...prev,
      assessmentTypesList: prev.assessmentTypesList.filter((i) => i.id !== id),
    }));
  };

  // ── Job select handler ─────────────────────────────────────────────────
  const handleJobChange = (e) => {
    const id = e.target.value;
    const job = jobOptions.find((opt) => opt._id === id);
    setFormData((prev) => ({
      ...prev,
      jobRoleId: id,
      jobRoleName: job ? job.title : "",
    }));
  };

  // ── Submit assessment ──────────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!formData.assessmentTitle || !formData.startDate) {
      setError("Title and start date are required");
      return;
    }
    if (formData.assessmentTypesList.length === 0) {
      setError("Please add at least one component");
      return;
    }
    if (!formData.jobRoleId) {
      setError("Please select a job role");
      return;
    }

    try {
      const result = await submitAssessment(formData);
      if (result?.success) {
        setSuccess(result.message || "Assessment created successfully!");
        setTimeout(() => {
          setFormData(initialFormState);
          setSuccess("");
          setActiveTab("all"); // jump to "All Assessments" so user sees their new entry
        }, 800);
      }
    } catch (err) {
      setError(err.message || "Failed to create assessment");
    }
  };

  // ── Delete assessment ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this assessment?")) return;
    await removeAssessment(id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="px-8 pt-8 pb-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Assessment Management
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Create new assessments, view by job role, or browse all
              assessments.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8">
            <TabsList className="grid grid-cols-3 w-full max-w-xl mb-4">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="job" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                By Job
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                All Assessments
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── TAB 1: CREATE ASSESSMENT ────────────────────────────────── */}
          <TabsContent value="create" className="mt-0 px-8 pb-8 max-h-[75vh] overflow-y-auto">
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-6">

              {/* Left column — basic info + add component */}
              <div className="col-span-12 md:col-span-5 space-y-5">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Basic Information
                  </Label>
                  <Input
                    placeholder="Assessment Title"
                    value={formData.assessmentTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, assessmentTitle: e.target.value })
                    }
                    className="h-11 border-slate-200"
                  />
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="h-11 border-slate-200"
                  />

                  {/* Job Role Select */}
                  <select
                    value={formData.jobRoleId}
                    onChange={handleJobChange}
                    className="w-full h-11 px-3 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Job Role</option>
                    {jobOptions.map((opt) => (
                      <option key={opt._id} value={opt._id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Instructions for candidates..."
                    className="w-full h-28 p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <Label className="text-xs font-bold uppercase text-blue-600">
                    Add Component
                  </Label>
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                    <Input
                      placeholder="Component Title (e.g. MCQ Test)"
                      value={currentType.typeTitle}
                      onChange={(e) =>
                        setCurrentType({ ...currentType, typeTitle: e.target.value })
                      }
                      className="bg-white h-10 border-blue-100"
                    />
                    <Input
                      type="number"
                      placeholder="Max Marks"
                      value={currentType.maxMarks}
                      onChange={(e) =>
                        setCurrentType({ ...currentType, maxMarks: e.target.value })
                      }
                      className="bg-white h-10 border-blue-100"
                    />
                    <Button
                      type="button"
                      onClick={addTypeToList}
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to List
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right column — components list */}
              <div className="col-span-12 md:col-span-7 flex flex-col bg-slate-50/50 rounded-2xl p-6 border border-slate-100 min-h-[400px]">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4" />
                  Added Components ({formData.assessmentTypesList.length})
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {formData.assessmentTypesList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
                      No components added yet
                    </div>
                  ) : (
                    formData.assessmentTypesList.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900">
                            {item.typeTitle}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3" />
                            Max Marks: {item.maxMarks}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => removeFromList(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Status messages */}
                {error && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </div>
                )}

                <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
                  <Button
                    disabled={
                      loading ||
                      !formData.assessmentTitle ||
                      formData.assessmentTypesList.length === 0
                    }
                    type="submit"
                    className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-100 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Finalize & Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* ── TAB 2: BY JOB ROLE ────────────────────────────────────────── */}
          <TabsContent value="job" className="mt-0 px-8 pb-8 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <Label className="text-sm font-semibold text-slate-700">
                  Filter by Job Role
                </Label>
              </div>

              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select a job role...</option>
                {jobOptions.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.title}
                  </option>
                ))}
              </select>

              {!selectedJobFilter ? (
                <div className="text-center py-12 text-sm text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
                  Select a job role to view its assessments
                </div>
              ) : (
                <AssessmentList
                  assessments={assessments}
                  loading={loading}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </TabsContent>

          {/* ── TAB 3: ALL ASSESSMENTS ────────────────────────────────────── */}
          <TabsContent value="all" className="mt-0 px-8 pb-8 max-h-[75vh] overflow-y-auto">
            <AssessmentList
              assessments={assessments}
              loading={loading}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// ── Reusable assessment list component ───────────────────────────────────
const AssessmentList = ({ assessments, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
        No assessments found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assessments.map((a) => (
        <div
          key={a._id}
          className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {a.assessmentTitle}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
                  {a.status || "active"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                {a.jobRoleName && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {a.jobRoleName}
                  </span>
                )}
                {a.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Total: {a.totalMarks} marks
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {a.assessmentTypesList?.length || 0} components
                </span>
              </div>

              {a.instructions && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {a.instructions}
                </p>
              )}

              {/* Components preview */}
              {a.assessmentTypesList?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {a.assessmentTypesList.slice(0, 5).map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                    >
                      {t.typeTitle} ({t.maxMarks})
                    </span>
                  ))}
                  {a.assessmentTypesList.length > 5 && (
                    <span className="text-[10px] text-slate-400">
                      +{a.assessmentTypesList.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(a._id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateAssessmentDialog;