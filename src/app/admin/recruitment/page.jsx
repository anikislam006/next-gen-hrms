"use client";

import React, { useEffect, useState } from "react";
import JobPostHeader from "./RecruitmentComponent/JobPostHeader";
import { useJobPosts } from "@/app/hook/useRecruitment";
import Link from "next/link";
import JobFilterSection from "./RecruitmentComponent/JobFilterSection";
import JobPostList from "./RecruitmentComponent/JobPostList";

/**
 * Helper component to safely render Tiptap/HTML content
 * This ensures that bold, lists, and spacing from the editor are preserved.
 */


const Page = () => {
  const initialFilters = {
    title: "",
    status: "All",
    startDate: "",
    endDate: "",
    page: 1,
  };

  const [filterValues, setFilterValues] = useState(initialFilters);
  const [expandedId, setExpandedId] = useState(null);

  const { jobs, pagination, fetchJobs, deleteJob, loading, error } =
    useJobPosts();

  useEffect(() => {
    fetchJobs(filterValues);
  }, [filterValues.page, fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilterValues((prev) => ({ ...prev, page: 1 }));
    fetchJobs({ ...filterValues, page: 1 });
  };

  const handleClear = () => {
    setFilterValues(initialFilters);
    fetchJobs(initialFilters);
  };

  const goToPage = (newPage) => {
    setFilterValues((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete: "${title}"?`)) {
      try {
        await deleteJob(id);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 font-poppins space-y-6 w-full mx-auto bg-[#F8F9FB] min-h-screen">
      <JobPostHeader />

<JobFilterSection 
    filterValues={filterValues}
    onFilterChange={handleFilterChange}
    onSearch={handleSearch}
    onClear={handleClear}
/>

  {/* 3. The List Component */}
      <JobPostList 
        jobs={jobs}
        loading={loading}
        expandedId={expandedId}
        toggleExpand={toggleExpand}
        handleDelete={handleDelete}
      />

      {/* --- PAGINATION --- */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-8 pb-10">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Page {pagination.currentPage} / {pagination.totalPages}{" "}
          <span className="ml-2 text-gray-300">|</span>{" "}
          <span className="ml-2">{pagination.totalJobs} TOTAL RECORDS</span>
        </p>
        <div className="flex gap-2">
          <button
            disabled={pagination.currentPage <= 1 || loading}
            onClick={() => goToPage(pagination.currentPage - 1)}
            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
          >
            PREV
          </button>
          <button
            disabled={
              pagination.currentPage >= pagination.totalPages || loading
            }
            onClick={() => goToPage(pagination.currentPage + 1)}
            className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
