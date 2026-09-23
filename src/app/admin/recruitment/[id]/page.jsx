"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJobPosts } from "@/app/hook/useRecruitment";
import RecruitmentHeader from "../RecruitmentComponent/RecruitmentHeader";
import RecruitmentJobBasedData from "../RecruitmentComponent/RecruitmentJobBasedData";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const JobDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { fetchSingleJob, loading, error } = useJobPosts();
  const [job, setJob] = useState(null);

  const generateHash = () => Math.random().toString(36).substring(7);
  const applyToken = generateHash();

  useEffect(() => {
    if (id) {
      fetchSingleJob(id)
        .then((data) => setJob(data))
        .catch((err) => console.error(err));
    }
  }, [id, fetchSingleJob]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">
          Error: {error || "Job not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#F8F9FB] p-6 font-poppins">
      <div className="w-full mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-bold text-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          BACK TO LIST
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-56 flex flex-col relative group hover:shadow-md transition-all duration-300">
          {/* Header Accent - Thinner for the short height */}
          <div className="h-2 bg-indigo-400 w-full shrink-0"></div>

          <div className="p-6 flex flex-col justify-between h-full">
            {/* TOP SECTION: Title and Badge */}
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="text-gray-600 ">
                  <span >
                    Recruitment Detail
                  </span>
                  <span >
                    ID: {job._id.slice(-8)}
                  </span>
                </div>
                <h1  className="text-3xl font-semibold mt-2">
                  {job.title}
                </h1>
                <p className="text-gray-600 mb-2">
                  {job.employmentType}
                </p>
              </div>

              {/* Action Button - Moved to top right to save space */}
              <Button>
                <Link
                href={`/apply-link/${job._id}?token=${applyToken}`}
                
              >
                Apply Link
              </Link>
              </Button>
            </div>

            {/* MIDDLE SECTION: Horizontal Stats Grid */}
            <div className="grid grid-cols-4 gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
              {/* Vacancy */}
              <div className="border-r border-gray-200 pr-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                  Vacancies
                </label>
                <p className="text-lg font-black text-gray-800 leading-none">
                  {job.vacancies}{" "}
                  <span className="text-[10px] text-gray-400">Pos.</span>
                </p>
              </div>

              {/* Start Date */}
              <div className="border-r border-gray-200 pr-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                  Start Date
                </label>
                <p className="text-xs font-bold text-gray-700 leading-none">
                  {new Date(job.startDate).toLocaleDateString()}
                </p>
              </div>

              {/* End Date */}
              <div className="border-r border-gray-200 pr-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                  Deadline
                </label>
                <p className="text-xs font-bold text-red-500 leading-none">
                  {new Date(job.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Created Info */}
              <div className="pl-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">
                  System Entry
                </label>
                <p className="text-[10px] font-bold text-indigo-900 truncate leading-none">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* BOTTOM SECTION: Subtle Footer info */}
            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                  Live Status
                </span>
              </div>
              <div className="text-[10px] font-bold text-gray-300">
                Verified Recruitment Data Office
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecruitmentHeader job={job}></RecruitmentHeader>
      <RecruitmentJobBasedData job={job}></RecruitmentJobBasedData>
    </div>
  );
};

export default JobDetailsPage;
