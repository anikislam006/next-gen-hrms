"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRecruitment } from "@/app/hook/useRecruitment-jobs";
import {
  Loader2,
  Inbox,
  DollarSign,
  MapPin,
  XCircle,
  Clock,
  Users,
  TrendingDown,
  Award,
  Users2,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import InventoryCard from "./InventoryCard";

const InventoryData = () => {
  const { id: jobId } = useParams();
  const { fetchByStatus } = useRecruitment();

  const [allInventory, setAllInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // --- 1. DATA FETCHING LOGIC ---
  const loadInitialData = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await fetchByStatus(jobId, "Inventory", 1, 500, "");
      setAllInventory(data.candidates || []);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [jobId, fetchByStatus]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // --- 2. REAL-TIME SYNCHRONIZATION ---
  useEffect(() => {
    const handleRefresh = () => loadInitialData();
    window.addEventListener("refresh-kanban-board", handleRefresh);
    return () => window.removeEventListener("refresh-kanban-board", handleRefresh);
  }, [loadInitialData]);

  // --- 3. STATS ---
  const stats = useMemo(() => ({
    all: allInventory.length,
    salary: allInventory.filter(c => c.inventoryDetails?.category === "salary").length,
    location: allInventory.filter(c => c.inventoryDetails?.category === "location").length,
    declined: allInventory.filter(c => c.inventoryDetails?.category === "declined").length,
    timing: allInventory.filter(c => c.inventoryDetails?.category === "timing").length,
    counter_offer: allInventory.filter(c => c.inventoryDetails?.category === "counter_offer").length,
    overqualified: allInventory.filter(c => c.inventoryDetails?.category === "overqualified").length,
    cultural_fit: allInventory.filter(c => c.inventoryDetails?.category === "cultural_fit").length,
    other: allInventory.filter(c => c.inventoryDetails?.category === "other").length,
  }), [allInventory]);

  // --- 4. FILTER ---
  const filteredCandidates = useMemo(() => {
    if (activeTab === "all") return allInventory;
    return allInventory.filter(c => c.inventoryDetails?.category === activeTab);
  }, [activeTab, allInventory]);

  // --- 5. TAB CONFIG ---
  const tabs = [
    { key: "all",            label: "Total Qualified",   sub: "All candidates",    icon: Users,         color: "text-slate-700" },
    { key: "salary",         label: "Salary Mismatch",   sub: "Compensation gap",  icon: DollarSign,    color: "text-amber-600" },
    { key: "location",       label: "Location Issues",   sub: "Geographic",        icon: MapPin,        color: "text-blue-600" },
    { key: "declined",       label: "Declined Offer",    sub: "Rejected by us",    icon: XCircle,       color: "text-red-600" },
    { key: "timing",         label: "Timing Issues",     sub: "Not available now", icon: Clock,         color: "text-purple-600" },
    { key: "counter_offer",  label: "Counter Offer",     sub: "Got better offer",  icon: TrendingDown,  color: "text-emerald-600" },
    { key: "overqualified",  label: "Overqualified",     sub: "Above role level",  icon: Award,         color: "text-orange-600" },
    { key: "cultural_fit",   label: "Cultural Fit",      sub: "Team mismatch",     icon: Users2,        color: "text-indigo-600" },
    { key: "other",          label: "Other Reasons",     sub: "Miscellaneous",     icon: ClipboardList, color: "text-slate-600" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-5">

      {/* 1. STAT CARDS — exactly like your HOD/HR/Finance pages */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <Card
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border shadow-sm rounded-[24px] bg-white cursor-pointer transition-all ${
                isActive
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-slate-100 hover:border-blue-200"
              }`}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-500">{tab.label}</p>
                  <h4 className="text-2xl font-black text-slate-900">{stats[tab.key] || 0}</h4>
                  <p className={`text-xs font-bold ${tab.color}`}>{tab.sub}</p>
                </div>
                <Icon className={`w-7 h-7 ${tab.color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2. LIST CONTAINER — exactly like your HOD/HR/Finance pages */}
      <div className="bg-white rounded-lg p-5 space-y-4 shadow-sm border">

        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
            {activeTab === "all" ? "All Inventory" : activeTab.split("_").join(" ")}
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
              {filteredCandidates.length} Candidates
            </span>
          </h3>
        </div>

        {/* List / loading / empty */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 border border-dashed rounded-xl">
            <Loader2 className="animate-spin mx-auto w-6 h-6 text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3">
              Syncing Repository...
            </p>
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="space-y-4">
            {filteredCandidates.map((person) => (
              <InventoryCard
                key={person._id}
                person={person}
                isInventory={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed rounded-xl">
            <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-[11px] font-bold uppercase tracking-wider">
              No Candidates Found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryData;