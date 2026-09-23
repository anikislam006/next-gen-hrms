"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Target, GitBranch, Trophy } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerformanceHeader from "./PerformanceCompo/PerformanceHeader";
import PerformanceAppraisals from "./PerformanceCompo/ PerformanceAppraisals";
import GoalsObjectives from "./PerformanceCompo/GoalsObjectives";
import ApprovalWorkflow from "./PerformanceCompo/ApprovalWorkflow";

const PerformanceMainPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'appraisals'
  const activeTab = searchParams.get("tab") || "appraisals";

  // Tab change handler — updates URL without page reload
  const handleTabChange = (val) => {
    router.push(`?tab=${val}`, { scroll: false });
  };

  // ── VIEW: Performance Appraisals ──────────────────────────────────────────
  const RenderAppraisals = () => (
        <PerformanceAppraisals></PerformanceAppraisals>

  );

  // ── VIEW: Approval Workflow ──────────────────────────────────────────────
  const RenderApprovalWorkflow = () => (
        <ApprovalWorkflow></ApprovalWorkflow>
  );

  // ── VIEW: Goals & Objectives ──────────────────────────────────────────────
  const RenderGoals = () => (
    <GoalsObjectives></GoalsObjectives>
  );

  return (
    <div className="space-y-8 p-6 bg-[#F8FAFC] min-h-screen">

      {/* HEADER */}
      <PerformanceHeader activeTab={activeTab} />

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList className="w-full">
          <TabsTrigger value="appraisals">
            <Target className="w-4 h-4" /> Performance Appraisals
          </TabsTrigger>
          <TabsTrigger value="approval">
            <GitBranch className="w-4 h-4" /> Approval Workflow
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Trophy className="w-4 h-4" /> Goals & Objectives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appraisals" className="outline-none">
          {RenderAppraisals()}
        </TabsContent>
        <TabsContent value="approval" className="outline-none">
          {RenderApprovalWorkflow()}
        </TabsContent>
        <TabsContent value="goals" className="outline-none">
          {RenderGoals()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMainPage;