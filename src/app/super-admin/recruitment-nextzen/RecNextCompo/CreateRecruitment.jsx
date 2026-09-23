"use client";

import React, { useEffect, useState, useMemo } from "react";
import { UserPlus, FileUp, CheckCircle2, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useJobPostsNextzen } from "@/app/hook/useJobPostsNextzen";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

/* ====================== TAG INPUT COMPONENT ====================== */
function TagInput({ tags, setTags, placeholder }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag) => {
    const cleanedTag = tag.toLowerCase();
    if (!tags.includes(cleanedTag)) {
      setTags([...tags, cleanedTag]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="flex items-center bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 hover:text-indigo-900"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 outline-none bg-transparent text-sm min-w-[100px]"
      />
    </div>
  );
}

/* ====================== MAIN COMPONENT ====================== */
const CreateRecruitment = ({ open, onClose, job }) => {
  // Pull both Nextzen hooks
  const { fetchJobOptions } = useJobPostsNextzen();
  const { submitCandidate, loading: isSubmitting, error, fetchAllCandidates } = useRecruitmentNextzen();

  const [jobOptions, setJobOptions] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [success, setSuccess] = useState("");

  const initialFormState = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobRoleId: "",
    jobRoleName: "",
    jobDepartment: "",
    source: "Career Site",
    experience: "",
    education: "",
    skills: [],
    salary: "",
    noticePeriod: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch job options every time the dialog opens
  useEffect(() => {
    if (open) {
      fetchJobOptions().then((data) => {
        setJobOptions(data || []);

        // If a job was passed in, auto-select it
        if (job?.title && data?.length > 0) {
          const matchedJob = data.find(
            (opt) => opt.title.toLowerCase() === job.title.toLowerCase()
          );
          if (matchedJob) {
            setFormData((prev) => ({
              ...prev,
              jobRoleId: matchedJob._id,
              jobRoleName: matchedJob.title,
              jobDepartment: matchedJob.department
            }));
          }
        }
      });
    }
  }, [open, fetchJobOptions, job]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setResumeFile(null);
      setSuccess("");
    }
  }, [open]);

  // Suggested skills derived from selected job
  const suggestedSkills = useMemo(() => {
    const selected = jobOptions.find((opt) => opt._id === formData.jobRoleId);
    return selected?.skills || [];
  }, [formData.jobRoleId, jobOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setSkills = (newSkills) => {
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  };

  const addSuggestedSkill = (skill) => {
    if (!formData.skills.includes(skill.toLowerCase())) {
      setSkills([...formData.skills, skill.toLowerCase()]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") {
      setResumeFile(file);
    } else if (file) {
      alert("Please upload a PDF file only.");
      e.target.value = null;
    }
  };

  const handleJobChange = (e) => {
    const selectedId = e.target.value;
    const selectedJob = jobOptions.find((opt) => opt._id === selectedId);
    setFormData((prev) => ({
      ...prev,
      jobRoleId: selectedId,
      jobRoleName: selectedJob ? selectedJob.title : "",
      jobDepartment: selectedJob ? selectedJob.department : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!formData.jobRoleId) {
      alert("Please select a job role.");
      return;
    }

    try {
      // Build FormData for multipart upload (resume file + fields)
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "skills") {
          // Backend expects skills as comma-separated string
          data.append(key, formData[key].join(","));
        } else {
          data.append(key, formData[key]);
        }
      });
      if (resumeFile) {
        data.append("resume", resumeFile);
      }

      const result = await submitCandidate(data);

      if (result?.success) {
        setSuccess(result.message || "Candidate added successfully!");

        // Refresh shared state
        await fetchAllCandidates({ page: 1 });

        // Dispatch global update event to trigger board/list view updates in real time
        window.dispatchEvent(new CustomEvent("refresh-kanban-board"));

        // Brief pause to show the success message, then close
        setTimeout(() => {
          setFormData(initialFormState);
          setResumeFile(null);
          setSuccess("");
          onClose();
        }, 800);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="p-8 pb-0">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Candidate
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Enter candidate details and upload a resume. The system will
              calculate scores based on skills.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Resume Upload */}
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-gray-700">
              Resume (PDF) *
            </Label>
            <div
              className={`relative flex items-center justify-center border-2 border-dashed rounded-lg p-4 transition-all ${
                resumeFile
                  ? "border-green-500 bg-green-50/30"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                {resumeFile ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {resumeFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload PDF resume
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Full Name *
              </Label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Email *
              </Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Phone *
              </Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0123"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Location *
              </Label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Job Role *
              </Label>
              <select
                name="jobRoleId"
                value={formData.jobRoleId}
                onChange={handleJobChange}
                disabled={!!job?.title && !!formData.jobRoleId}
                className="flex w-full h-10 px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select job role</option>
                {jobOptions.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Source
              </Label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="flex w-full h-10 px-3 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded"
              >
                <option value="Career Site">Career Site</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Skill Tagging System */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Skills *
            </Label>
            <TagInput
              tags={formData.skills}
              setTags={setSkills}
              placeholder="Type a skill and hit Enter..."
            />

            {suggestedSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Job Requirements:
                </span>
                {suggestedSkills.map((skill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addSuggestedSkill(skill)}
                    className="flex items-center gap-1 text-[11px] bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 transition-colors"
                  >
                    <Plus size={10} />
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Years of Experience *
              </Label>
              <Input
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                placeholder="0"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Education *
              </Label>
              <Input
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Degree"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Expected Salary
              </Label>
              <Input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="100000"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Notice Period (Days)
              </Label>
              <Input
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                placeholder="30"
                className="bg-gray-50/50 border-gray-200 h-10"
              />
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="flex justify-end items-center gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 font-semibold px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-10 rounded font-semibold shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRecruitment;