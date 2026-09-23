"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, Loader2, Check } from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import { useDepartments } from "@/app/hook/useDepartment";

/* ====================== TAG INPUT COMPONENT ====================== */
function TagInput({ label, tags, setTags }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white focus-within:ring-1 focus-within:ring-ring">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:text-destructive"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type skill and press Enter..." : ""}
          className="flex-1 outline-none min-w-[120px] bg-transparent text-sm"
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Press Enter or comma to add a skill.
      </p>
    </div>
  );
}

/* ====================== DEPARTMENT DROPDOWN (with search + infinite scroll) ====================== */
function DepartmentDropdown({ value, onChange, departmentName }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  const {
    departments,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
  } = useDepartments();

  // Track accumulated departments across pages
  const [allDepts, setAllDepts] = useState([]);

  useEffect(() => {
    if (departments.length === 0) return;

    setAllDepts((prev) => {
      // If on page 1 (or after a search reset), replace the list
      if (currentPage === 1) return departments;

      // Otherwise append, deduplicating by _id
      const existingIds = new Set(prev.map((d) => d._id));
      const newOnes = departments.filter((d) => !existingIds.has(d._id));
      return [...prev, ...newOnes];
    });
  }, [departments, currentPage]);

  // Reset accumulated list when search changes
  useEffect(() => {
    setAllDepts([]);
    setCurrentPage(1);
  }, [search]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading) return;

    const reachedBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (reachedBottom && currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [loading, currentPage, totalPages, setCurrentPage]);

  const handleSelect = (dept) => {
    onChange({
      departmentId: dept._id,
      department: dept.name || dept.departmentName || dept.title,
    });
    setOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2 relative" ref={dropdownRef}>
      <Label>Department</Label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:border-gray-400 transition-colors"
      >
        <span className={departmentName ? "text-gray-900" : "text-gray-400"}>
          {departmentName || "Select department"}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-[280px] overflow-hidden flex flex-col">

          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <Input
              autoFocus
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* List with infinite scroll */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto py-1"
          >
            {allDepts.length === 0 && !loading && (
              <p className="text-center text-xs text-gray-400 py-6">
                {search ? "No matching departments" : "No departments yet"}
              </p>
            )}

            {allDepts.map((dept) => {
              const deptName = dept.name || dept.departmentName || dept.title;
              const isSelected = value === dept._id;

              return (
                <button
                  type="button"
                  key={dept._id}
                  onClick={() => handleSelect(dept)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                    isSelected ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <div>
                    <div className="text-gray-900">{deptName}</div>
                    {dept.description && (
                      <div className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {dept.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {loading && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="animate-spin text-gray-400" size={16} />
                <span className="ml-2 text-xs text-gray-500">Loading...</span>
              </div>
            )}

            {!loading &&
              allDepts.length > 0 &&
              currentPage >= totalPages && (
                <p className="text-center text-[10px] text-gray-400 py-2">
                  All departments loaded
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== RICH TEXT EDITOR ====================== */
function RichTextEditor({ id, label, value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate({ editor }) {
      onChange({ target: { id, value: editor.getHTML() } });
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[120px]",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="border rounded-md p-2 min-h-[120px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function FormInput({ id, label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function FormSelect({ id, label, options, value, onChange }) {
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ====================== CREATE JOB DIALOG (NEXTZEN) ====================== */
export default function CreateJobDialog({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const initialFormState = {
    title: "",
    employmentType: "",
    location: "",
    vacancies: "",
    department: "",        // ✅ NEW — display name
    departmentId: "",      // ✅ NEW — ObjectId reference
    context: "",
    responsibilities: "",
    competencies: "",
    skills: [],
    experience: "",
    salary: "",
    benefits: "",
    interview: "",
    instructions: "",
    startDate: "",
    endDate: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const { submitJob, loading, error, fetchJobs } = useJobPostsNextzen();
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  };

  // ✅ NEW — handler for department selection
  const handleDepartmentChange = ({ departmentId, department }) => {
    setFormData((prev) => ({ ...prev, departmentId, department }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    try {
      const result = await submitJob(formData, { page: 1 });

      if (result?.success) {
        setSuccess(result.message || "Nextzen job post created successfully");
        await fetchJobs({ page: 1 });

        setTimeout(() => {
          setFormData(initialFormState);
          setSuccess("");
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onClose}
      title="Create Nextzen Job"
      description="Fill job details"
      size="LARGE"
    >
      <form
        onSubmit={onSubmit}
        className="flex flex-col h-[75vh] max-h-[850px]"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="sticky top-0 bg-white pb-4 z-20">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-1 pr-3 py-6">
            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-8 mt-0">
              <div className="grid grid-cols-2 gap-5">
                <FormInput
                  id="title"
                  label="Job Title"
                  placeholder="Enter job title"
                  value={formData.title}
                  onChange={handleChange}
                />
                <FormSelect
                  id="employmentType"
                  label="Employment Type"
                  options={[
                    { value: "", label: "Select type" },
                    { value: "full-time", label: "Full-time" },
                    { value: "part-time", label: "Part-time" },
                    { value: "contract", label: "Contract" },
                    { value: "internship", label: "Internship" },
                  ]}
                  value={formData.employmentType}
                  onChange={handleChange}
                />
              </div>

              {/* ✅ NEW — Department selector + location row */}
              <div className="grid grid-cols-2 gap-5">
                <DepartmentDropdown
                  value={formData.departmentId}
                  departmentName={formData.department}
                  onChange={handleDepartmentChange}
                />
                <FormInput
                  id="location"
                  label="Location"
                  placeholder="Job location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <FormInput
                  id="vacancies"
                  label="Vacancies"
                  type="number"
                  placeholder="0"
                  value={formData.vacancies}
                  onChange={handleChange}
                />
              </div>

              <RichTextEditor
                id="context"
                label="Job Context"
                value={formData.context}
                onChange={handleChange}
              />
              <RichTextEditor
                id="responsibilities"
                label="Responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
              />
              <RichTextEditor
                id="competencies"
                label="Core Competencies"
                value={formData.competencies}
                onChange={handleChange}
              />
            </TabsContent>

            {/* REQUIREMENTS */}
            <TabsContent value="requirements" className="space-y-8 mt-0">
              <TagInput
                label="Required Skills"
                tags={formData.skills}
                setTags={handleSkillsChange}
              />

              <RichTextEditor
                id="experience"
                label="Experience Requirements"
                value={formData.experience}
                onChange={handleChange}
              />
              <FormInput
                id="salary"
                label="Salary (Monthly)"
                type="number"
                value={formData.salary}
                onChange={handleChange}
              />
            </TabsContent>

            {/* APPLICATION */}
            <TabsContent value="application" className="space-y-8 mt-0">
              <RichTextEditor
                id="benefits"
                label="Benefits"
                value={formData.benefits}
                onChange={handleChange}
              />
              <RichTextEditor
                id="interview"
                label="Interview Process"
                value={formData.interview}
                onChange={handleChange}
              />
              <RichTextEditor
                id="instructions"
                label="Application Instructions"
                value={formData.instructions}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <FormInput
                  id="startDate"
                  label="Post Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <FormInput
                  id="endDate"
                  label="Deadline"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {activeTab === "application" && (
          <div className="pt-5 border-t mt-auto">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mb-2">{success}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Job"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </AccessibleDialog>
  );
}