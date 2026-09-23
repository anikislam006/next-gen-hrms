"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitBranch, List, BarChart3, Archive } from "lucide-react";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";

// Import your actual dashboard tab screens
import Pipeline from "./Pipeline";
import ListedData from "./ListedData";
import Analytics from "./Analytics";
import InventoryNextzen from "./InventoryNextzen";

export default function Tablisted() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchAllCandidates, fetchByStatus } = useRecruitmentNextzen();

  // Read current tab from URL (default to "pipeline")
  const currentTab = searchParams.get("tab") || "pipeline";
  const [activeTab, setActiveTab] = useState(currentTab);

  // Dynamic state values for the Tab Headers
  const [pipelineCount, setPipelineCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);

  // Keep local state in sync with URL changes
  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  // ── DYNAMIC COUNT LOADER ──
  // Fetches both the aggregate metaCounts and explicit Inventory counts in parallel
  const loadBadgeMetrics = useCallback(async () => {
    try {
      // 1. Fetch all candidates (returns response containing metaCounts object)
      const allRes = await fetchAllCandidates({ page: 1, limit: 1 });
      
      // 2. Fetch inventory-specific candidates to get exact total count
      const inventoryRes = await fetchByStatus("Inventory", { page: 1, limit: 1 });

      const totalInventory = inventoryRes?.total || 0;
      setInventoryCount(totalInventory);

      if (allRes && allRes.metaCounts && allRes.metaCounts.statuses) {
        // Calculate total of active stages, excluding 'Inventory'
        const stagesMap = allRes.metaCounts.statuses;
        const totalPipelineCandidates = Object.keys(stagesMap).reduce((acc, stageKey) => {
          if (stageKey !== "Inventory") {
            return acc + (stagesMap[stageKey] || 0);
          }
          return acc;
        }, 0);

        setPipelineCount(totalPipelineCandidates);
      } else {
        // Fallback using simple math if metaCounts is structural-different
        const grandTotal = allRes?.pagination?.totalItems || 0;
        setPipelineCount(Math.max(0, grandTotal - totalInventory));
      }
    } catch (err) {
      console.error("Failed to load pipeline dynamic badge counts:", err);
    }
  }, [fetchAllCandidates, fetchByStatus]);

  // Initial load and global refresh syncing (when candidates change stage)
  useEffect(() => {
    loadBadgeMetrics();
  }, [loadBadgeMetrics]);

  useEffect(() => {
    const handleGlobalRefresh = () => {
      loadBadgeMetrics();
    };
    window.addEventListener("refresh-kanban-board", handleGlobalRefresh);
    return () => {
      window.removeEventListener("refresh-kanban-board", handleGlobalRefresh);
    };
  }, [loadBadgeMetrics]);

  // Update URL when tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Dynamic configuration inside render to access live component states
  const TAB_CONFIG = [
    {
      value: "pipeline",
      label: "Pipeline",
      icon: GitBranch,
      count: pipelineCount,
    },
    {
      value: "list",
      label: "List",
      icon: List,
      count: null, // no badge for List
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: BarChart3,
      count: null,
    },
    {
      value: "inventory",
      label: "Inventory",
      icon: Archive,
      count: inventoryCount,
    },
  ];

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

        {/* Tab Bar */}
        <TabsList className="bg-white border border-slate-100 shadow-sm rounded-xl p-1 h-auto mb-6 grid grid-cols-4 w-full max-w-2xl">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <Badge
                    className={`ml-1 px-1.5 py-0 h-5 text-[10px] font-bold transition-colors ${
                      isActive
                        ? "bg-white/20 text-white hover:bg-white/30 border-none"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-none"
                    }`}
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content — Pipeline */}
        <TabsContent value="pipeline" className="animate-in fade-in duration-500 mt-0">
          <Pipeline />
        </TabsContent>

        {/* Tab Content — List */}
        <TabsContent value="list" className="animate-in fade-in duration-500 mt-0">
          <ListedData />
        </TabsContent>

        {/* Tab Content — Analytics */}
        <TabsContent value="analytics" className="animate-in fade-in duration-500 mt-0">
          <Analytics />
        </TabsContent>

        {/* Tab Content — Inventory */}
        <TabsContent value="inventory" className="animate-in fade-in duration-500 mt-0">
          <InventoryNextzen />
        </TabsContent>
      </Tabs>
    </div>
  );
}