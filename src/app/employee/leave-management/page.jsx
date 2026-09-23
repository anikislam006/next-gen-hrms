"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";
import { useAuth } from "@/context/AuthContext";
import SubmitLeaveReqDialog from "./LeaveManagementCompo/SubmitLeaveReqDialog";
import LeaveManagementBanner from "./LeaveManagementCompo/LeaveManagementBanner";
import LeaveTypeCard from "./LeaveManagementCompo/LeaveTypeCard";
import RequestCard from "./LeaveManagementCompo/RequestCard";

const LeaveManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { UserAllDetails } = useAuth();

  const {
    myRequests,
    leavePolicies,
    requestPagination,
    requestLoading,
    fetchMyRequests,
    fetchAllLeavePolicies,
  } = useLeavePolicy();

  const [myPage, setMyPage] = useState(1);
  const [mySearch, setMySearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");

  // Fetch Leave Types once on mount
  useEffect(() => {
    fetchAllLeavePolicies();
  }, [fetchAllLeavePolicies]);

  // Fetch "My Requests"
  useEffect(() => {
    if (UserAllDetails?.email) {
      fetchMyRequests(UserAllDetails.email, { page: myPage, limit: 10 });
    }
  }, [UserAllDetails?.email, myPage, fetchMyRequests]);

  // Filter Logic
  const filteredMyRequests = useMemo(() => {
    return (myRequests || []).filter((req) => {
      const matchesSearch = req.leaveType
        .toLowerCase()
        .includes(mySearch.toLowerCase());
      const matchesType =
        activeTypeFilter === "all" || req.leaveType === activeTypeFilter;
      const matchesStatus =
        activeStatusFilter === "all" || req.status === activeStatusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [myRequests, mySearch, activeTypeFilter, activeStatusFilter]);

  return (
    <div className="space-y-8 p-6 bg-[#F4F7FE] min-h-screen">
      <LeaveManagementBanner onClick={() => setIsModalOpen(true)} />
      <LeaveTypeCard />

      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search my history..."
              value={mySearch}
              onChange={(e) => setMySearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Leave Type Filter */}
            <Select value={activeTypeFilter} onValueChange={setActiveTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Policy Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Policies</SelectItem>
                {leavePolicies?.map((policy) => (
                  <SelectItem key={policy._id} value={policy.name}>
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request Cards */}
        <div className="space-y-4">
          {requestLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-slate-900" />
            </div>
          ) : filteredMyRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[32px] p-20 text-center text-slate-400">
              <XCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              You haven't submitted any requests yet.
            </div>
          ) : (
            filteredMyRequests.map((req) => (
              <RequestCard key={req._id} item={req} isGlobal={false} />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <Button
            disabled={myPage === 1}
            onClick={() => setMyPage((p) => p - 1)}
            variant="outline"
            className="rounded-xl h-11"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="bg-white border border-slate-200 h-11 px-6 flex items-center rounded-xl font-bold text-slate-700 text-sm">
            Page {myPage}
          </div>
          <Button
            disabled={!requestPagination.hasNextPage}
            onClick={() => setMyPage((p) => p + 1)}
            variant="outline"
            className="rounded-xl h-11"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <SubmitLeaveReqDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default LeaveManagementPage;