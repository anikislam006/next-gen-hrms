"use client";

import ReportsScreen from "@/components/reports/ReportsScreen";

// Real Reports module, backed by Supabase — replaces the old static
// "Demo Mode" placeholder. See Business Logic Requirements doc, Section I,
// for the exact report list this was built against.
export default function ReportsPage() {
  return <ReportsScreen />;
}
