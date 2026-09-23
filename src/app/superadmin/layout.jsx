'use client';

import { Suspense } from "react"; // 1. Import Suspense
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

// Optional: A simple loading component for the fallback
function AdminLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2 text-slate-600">Loading module...</span>
    </div>
  );
}

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  // Fixed the replace path to match your folder structure "/super-admin"
  const activeModule = pathname.replace("/super-admin", "") || "dashboard";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          {/* 2. Wrap children in Suspense */}
          <Suspense fallback={<AdminLoader />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}