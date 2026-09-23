'use client';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const activeModule = pathname.replace("/super-admin", "") || "dashboard";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          {/* <h2 className="text-xl font-bold mb-4 capitalize">{activeModule}</h2> */}
          {children}
        </main>
      </div>
    </div>
  );
}
