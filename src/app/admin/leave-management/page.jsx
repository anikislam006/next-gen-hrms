"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaveManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { UserAllDetails } = useAuth();
  
  const {
    leaveRequests,    
    myRequests,       
    leavePolicies,    // Added to fetch the types for the dropdown
    requestPagination,
    requestLoading,
    fetchMyRequests,
    fetchAllRequests,
    updateRequestStatus,
    fetchAllLeavePolicies // Added to ensure types are loaded
  } = useLeavePolicy();

  const [myPage, setMyPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [mySearch, setMySearch] = useState("");
  const [allSearch, setAllSearch] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all"); // New State for Leave Type
  const [currentTab, setCurrentTab] = useState("global-pipeline");

  // Fetch Leave Types once on mount
  useEffect(() => {
    fetchAllLeavePolicies();
  }, [fetchAllLeavePolicies]);

  // 1. Fetch "My Requests"
  useEffect(() => {
    if (UserAllDetails?.email) {
      fetchMyRequests(UserAllDetails.email, { page: myPage, limit: 10 });
    }
  }, [UserAllDetails?.email, myPage, fetchMyRequests]);

  // 2. Fetch "Global Requests" - Included activeTypeFilter in dependency
  useEffect(() => {
    const status = activeStatusFilter === "all" ? "" : activeStatusFilter;
    const leaveType = activeTypeFilter === "all" ? "" : activeTypeFilter;
    fetchAllRequests({ page: allPage, limit: 10, status, leaveType });
  }, [allPage, activeStatusFilter, activeTypeFilter, fetchAllRequests]);

  // 3. Filter Logic
  const filteredMyRequests = useMemo(() => {
    return (myRequests || []).filter(req => 
      req.leaveType.toLowerCase().includes(mySearch.toLowerCase())
    );
  }, [myRequests, mySearch]);

  const filteredAllRequests = useMemo(() => {
    return (leaveRequests || []).filter(req => 
      req.leaveType.toLowerCase().includes(allSearch.toLowerCase())
    );
  }, [leaveRequests, allSearch]);

  const handleStatusChange = async (id, status) => {
    try { 
      await updateRequestStatus(id, status); 
    } catch (err) { 
      console.error("Status update failed:", err); 
    }
  };

  return (
    <div className="space-y-8 p-6 bg-[#F4F7FE] min-h-screen">
      <LeaveManagementBanner onClick={() => setIsModalOpen(true)} />
      <LeaveTypeCard />

      <Tabs defaultValue="global-pipeline" onValueChange={setCurrentTab} className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-4">
          <TabsTrigger value="global-pipeline" className="rounded-lg px-6">
            <Globe className="w-4 h-4 mr-2" /> All Requests
          </TabsTrigger>
          <TabsTrigger value="my-requests" className="rounded-lg px-6">
            <Mail className="w-4 h-4 mr-2" /> My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global-pipeline" className="space-y-6 outline-none">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search globally..."
                value={allSearch}
                onChange={(e) => setAllSearch(e.target.value)}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-slate-900 h-8 w-8" />
                  </div>
                ) : filteredAllRequests.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl border-slate-100">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No global requests found</p>
                    <p className="text-sm text-gray-500 mt-2">
                      No requests matching the current filters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAllRequests.map((req) => (
                      <RequestCard 
                        key={req._id} 
                        item={req} 
                        isGlobal={true} 
                        handleStatusChange={handleStatusChange} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Global Pagination */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <Button disabled={allPage === 1} onClick={() => setAllPage(p => p - 1)} variant="outline" className="rounded-xl h-11">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="bg-white border border-slate-200 h-11 px-6 flex items-center rounded-xl font-bold text-slate-700 text-sm">
              Page {allPage}
            </div>
            <Button disabled={!requestPagination.hasNextPage} onClick={() => setAllPage(p => p + 1)} variant="outline" className="rounded-xl h-11">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-6 outline-none">
          <div className="bg-white border border-slate-200 rounded-[20px] p-2 flex items-center shadow-sm">
            <Input
              placeholder="Search my history..."
              value={mySearch}
              onChange={(e) => setMySearch(e.target.value)}
              className="border-none bg-slate-50/50 rounded-xl h-11 px-4 focus-visible:ring-0 placeholder:text-slate-400 text-sm max-w-xs"
            />
          </div>

          <div className="space-y-4">
            {requestLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-900" /></div>
            ) : filteredMyRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[32px] p-20 text-center text-slate-400">
                <XCircle className="w-12 h-12 mx-auto mb-4 opacity-20" /> You haven't submitted any requests yet.
              </div>
            ) : (
              filteredMyRequests.map(req => <RequestCard key={req._id} item={req} isGlobal={false} />)
            )}
          </div>
          
          <div className="flex items-center justify-center gap-3 pt-6">
            <Button disabled={myPage === 1} onClick={() => setMyPage(p => p - 1)} variant="outline" className="rounded-xl h-11">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="bg-white border border-slate-200 h-11 px-6 flex items-center rounded-xl font-bold text-slate-700 text-sm">
              Page {myPage}
            </div>
            <Button disabled={!requestPagination.hasNextPage} onClick={() => setMyPage(p => p + 1)} variant="outline" className="rounded-xl h-11">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <SubmitLeaveReqDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LeaveManagementPage;