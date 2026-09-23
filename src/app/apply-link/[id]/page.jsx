"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJobPosts } from "@/app/hook/useRecruitment";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";

import {
  UserPlus,
  FileUp,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  Users,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const RichTextDisplay = ({ content, className = "" }) => {
  if (!content) {
    return <p className="text-slate-400 italic text-xs">No content provided</p>;
  }
  return (
    <div
      className={`prose prose-sm max-w-none text-slate-600 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const ApplyJobPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const { fetchSingleJob, loading: jobLoading } = useJobPosts();
  const { submitCandidate, loading: isSubmitting } = useRecruitment();

  const [job, setJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobRoleId: id || "",
    jobRoleName: "",
    source: "Career Site",
    experience: "",
    education: "",
    skills: "",
    salary: "",
    noticePeriod: "",
  });

  useEffect(() => {
    const getDetails = async () => {
      if (id) {
        try {
          const data = await fetchSingleJob(id);
          if (data) {
            setJob(data);
            setFormData((prev) => ({
              ...prev,
              jobRoleId: data._id,
              jobRoleName: data.title,
            }));
          }
        } catch (err) {
          console.error("Error fetching job details:", err);
        }
      }
    };
    getDetails();
  }, [id, fetchSingleJob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Please upload your resume.");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("resume", resumeFile);

      await submitCandidate(data);
      alert("Application Submitted Successfully!");
      router.push("/");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  if (jobLoading && !job) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Board
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live Posting
          </span>
        </div>

        <div className="flex flex-row gap-6  w-full">

          {/* ─────────────── LEFT: JOB DETAILS ─────────────── */}
          <div className=" space-y-6 w-[30%]">

            {/* Job header card */}
            <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200">
                    {job?.employmentType || "Full-Time"}
                  </span>
                  {job?._id && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Ref: {job._id.slice(-8)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {job?.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {job?.location || "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <RichTextDisplay content={job?.salary} className="inline-block" />
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Vacancies</p>
                      <h4 className="text-xl font-black text-slate-900">{job?.vacancies || 0}</h4>
                      <p className="text-xs font-bold text-blue-600">Openings</p>
                    </div>
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-100 shadow-sm rounded-xl bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Deadline</p>
                      <h4 className="text-sm font-black text-red-500">
                        {job?.endDate
                          ? new Date(job.endDate).toLocaleDateString()
                          : "N/A"}
                      </h4>
                      <p className="text-xs font-bold text-red-500">Last Date</p>
                    </div>
                    <Calendar className="w-7 h-7 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail sections */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Job Context
                </h4>
                <RichTextDisplay content={job?.context} />
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Key Responsibilities
                </h4>
                <RichTextDisplay content={job?.responsibilities} />
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Core Competencies
                </h4>
                <RichTextDisplay content={job?.competencies} />
              </div>
            </div>
          </div>

          {/* ─────────────── RIGHT: APPLICATION FORM ─────────────── */}
          <div className="w-[70%]">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">

              <div className="mb-6 pb-6 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900">
                  Apply for this position
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Complete all fields to submit your application.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Section 1: Resume ── */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    01 · Resume (PDF)
                  </Label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center ${
                      resumeFile
                        ? "border-emerald-400 bg-emerald-50/50"
                        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    {resumeFile ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">
                          Click to replace
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileUp className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">
                          Drop your resume here
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          PDF files only
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Section 2: Personal ── */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    02 · Identification & Contact
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Full Name *</Label>
                      <Input
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Michael Scott"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Email *</Label>
                      <Input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Phone *</Label>
                      <Input
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+880 1XXX XXX XXX"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Current Location *</Label>
                      <Input
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Qualifications ── */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    03 · Qualifications & Experience
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Education
                      </Label>
                      <Input
                        name="education"
                        required
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="e.g. MBA in Finance"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Skills & Expertise
                      </Label>
                      <Input
                        name="skills"
                        required
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Node.js, Project Management..."
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Experience (years)
                      </Label>
                      <Input
                        name="experience"
                        type="number"
                        required
                        value={formData.experience}
                        onChange={handleChange}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Notice Period (days)
                      </Label>
                      <Input
                        name="noticePeriod"
                        type="number"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        placeholder="30"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        Expected Salary (monthly)
                      </Label>
                      <Input
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="e.g. 50000"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">Source</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(v) =>
                          setFormData((prev) => ({ ...prev, source: v }))
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Career Site">Career Site</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ── Submit ── */}
                <div className="pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobPage;