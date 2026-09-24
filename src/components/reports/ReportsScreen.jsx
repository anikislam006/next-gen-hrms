"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Wallet, Download, Loader2, Info, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { EMPLOYEE_REPORTS, FINANCIAL_REPORTS } from "./reportRegistry";
import { exportRowsToCsv } from "./csvExport";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function useReportRunner(reports) {
  const [reportKey, setReportKey] = useState(reports[0].key);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const report = reports.find((r) => r.key === reportKey) || reports[0];

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await report.run({ month, year });
      setResult(res);
    } catch (err) {
      console.error("Report error:", err);
      setError(err?.message || "Could not load this report.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [report, month, year]);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, month, year]);

  return { reportKey, setReportKey, month, setMonth, year, setYear, loading, error, result, report, run };
}

function ReportFilters({ report, month, setMonth, year, setYear }) {
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }, []);

  if (!report.filters) return null;

  return (
    <div className="flex items-center gap-3">
      {report.filters === "month" && (
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          {yearOptions.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ReportTable({ result, loading, error }) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 w-8 h-8" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl text-red-500 font-medium">
        {error}
      </div>
    );
  }
  if (!result || result.rows.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-xl text-slate-400 font-medium">
        No data found for this selection.
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {result.columns.map((c) => (
              <TableHead key={c.key}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.rows.map((row, idx) => (
            <TableRow key={idx}>
              {result.columns.map((c) => (
                <TableCell key={c.key}>
                  {typeof row[c.key] === "number" ? row[c.key].toLocaleString("en-BD") : (row[c.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ReportGroup({ reports }) {
  const { reportKey, setReportKey, month, setMonth, year, setYear, loading, error, result, report, run } =
    useReportRunner(reports);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Select value={reportKey} onValueChange={setReportKey}>
            <SelectTrigger className="w-80"><SelectValue /></SelectTrigger>
            <SelectContent>
              {reports.map((r) => (
                <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ReportFilters report={report} month={month} setMonth={setMonth} year={year} setYear={setYear} />

          <div className="flex-1" />

          <Button variant="outline" onClick={run} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => result && exportRowsToCsv(report.key, result.columns, result.rows)}
            disabled={!result || result.rows.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {result?.note && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{result.note}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <ReportTable result={result} loading={loading} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsScreen() {
  const [tab, setTab] = useState("employee");

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        <p className="text-yellow-100 opacity-90">
          Real reports from live data — export any of them as a spreadsheet.
        </p>
      </motion.div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("employee")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
            tab === "employee" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" /> Employee Information Reports
        </button>
        <button
          onClick={() => setTab("financial")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
            tab === "financial" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          <Wallet className="w-4 h-4" /> Financial & Payroll Reports
        </button>
      </div>

      {tab === "employee" ? (
        <ReportGroup key="employee" reports={EMPLOYEE_REPORTS} />
      ) : (
        <ReportGroup key="financial" reports={FINANCIAL_REPORTS} />
      )}
    </div>
  );
}
