"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Loader2,
  Wallet,
  Receipt,
  ShieldCheck,
  ClipboardList,
  LayoutGrid,
  ShieldAlert,
  BarChart3,
  Check,
  Info,
  SearchX,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

// Hooks & Components (Ensure these paths are correct for your project)
import { useExpense } from "@/app/hook/useExpense";
import CreateCategoryDialog from "./ExpenseCompo/CreateCategoryDialog";

// UI Components
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import RequestsTab from "./ExpenseCompo/RequestsTab";
import PoliciesTab from "./ExpenseCompo/PoliciesTab";
import AnalyticsTab from "./ExpenseCompo/AnalyticsTab";
import CategoriesTab from "./ExpenseCompo/CategoriesTab";
import SubmitExpenseDialog from "./ExpenseCompo/SubmitExpenseDialog";
import ExpenseHeader from "./ExpenseCompo/ExpenseHeader";

const ExpensePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to 'categories'
  const activeTab = searchParams.get("tab") || "requests";

  const { categories, loading, pagination, fetchAllCategories } = useExpense();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  // --- Inside ExpensePage Component ---

useEffect(() => {
  // Fetch categories if we are on the categories tab OR requests tab
  // since the RequestsTab needs them for the filter dropdown.
  if (activeTab === "categories" || activeTab === "requests") {
    // Note: If you want all categories for the dropdown, 
    // you might want to fetch more than just the first page of 10.
    fetchAllCategories({ page: 1, limit: 100 }); 
  }
}, [fetchAllCategories, activeTab]); 
// Removed currentPage from dependency here to prevent category 
// re-fetching when just changing pages inside the requests list.

  // Tab change handler using Next.js router
  const handleTabChange = (val) => {
    // This updates the URL without a full page reload (preventing 404s)
    router.push(`?tab=${val}`, { scroll: false });
  };

  // --- VIEW: Categories ---
  const RenderCategories = () => (
    <CategoriesTab
      categories={categories}
      loading={loading}
      pagination={pagination}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  );

  // --- VIEW: Requests ---
  const RenderRequests = () => (
    <RequestsTab categories={categories}></RequestsTab>
  );

  // --- VIEW: Policies ---
  const RenderPolicies = () => <PoliciesTab></PoliciesTab>;

  // --- VIEW: Analytics ---
  const RenderAnalytics = () => <AnalyticsTab></AnalyticsTab>;

  return (
    <div className="space-y-8 p-6  bg-[#F8FAFC] min-h-screen">
      {/* HEADER */}
      <ExpenseHeader
        activeTab={activeTab}
        setIsDialogOpen={setIsDialogOpen}
        setIsExpenseDialogOpen={setIsExpenseDialogOpen}
      />

      {/* TABS NAVIGATION */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-8"
      >
        <TabsList className="w-full">
          <TabsTrigger value="requests">
            <ClipboardList className="w-4 h-4" /> Requests
          </TabsTrigger>
          {/* <TabsTrigger value="categories">
            <LayoutGrid className="w-4 h-4" /> Categories
          </TabsTrigger> */}
          <TabsTrigger value="policies">
            <ShieldAlert className="w-4 h-4" /> Policies
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* TABS CONTENT MAPPING */}
        <TabsContent value="categories" className="outline-none">
          {RenderCategories()}
        </TabsContent>
        <TabsContent value="requests" className="outline-none">
          {RenderRequests()}
        </TabsContent>
        <TabsContent value="policies" className="outline-none">
          {RenderPolicies()}
        </TabsContent>
        <TabsContent value="analytics" className="outline-none">
          {RenderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* FOOTER INFO CARD */}
      <Card className="border-purple-200 bg-purple-50 shadow-none rounded mt-10">
        <CardContent className="p-8">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
            <Info className="w-5 h-5 text-purple-600" /> Expense System
            Guidelines
          </h3>
          <ul className="space-y-3 text-sm text-purple-800">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 text-purple-600 bg-purple-100 rounded-full p-1" />
              <span>
                <strong>Category Limits:</strong> Enforce maximum BDT amounts to
                maintain fiscal discipline.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 text-purple-600 bg-purple-100 rounded-full p-1" />
              <span>
                <strong>Policy Rules:</strong> All updates are reflected
                immediately across the company claim forms.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* DIALOG COMPONENT */}
      <CreateCategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      <SubmitExpenseDialog
        isOpen={isExpenseDialogOpen}
        onClose={() => setIsExpenseDialogOpen(false)}
        categories={categories} // Passing live categories for the dropdown
      />
    </div>
  );
};

export default ExpensePage;
