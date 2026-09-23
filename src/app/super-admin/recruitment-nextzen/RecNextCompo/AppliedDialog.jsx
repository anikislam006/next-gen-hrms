"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail, Phone, MapPin, Briefcase, GraduationCap, DollarSign, FileText,
  X, ExternalLink, Loader2, Star, Archive, ArrowRight, CheckCircle2,
  Plus, Code, FileBadge, Brain, Users, Award, Layers, Calendar,
  Trash2, MessageSquare, Sparkles, Video, Clock, TrendingUp,
  ClipboardCheck, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAssessmentResultNextzen } from "@/app/hook/useAssessmentResultNextzen";
import { useRecruitmentNotesNextzen } from "@/app/hook/useRecruitmentNotesNextzen";
import AddNoteDialog from "./AddNoteDialog";
import SendToInventoryDialog from "./SendToInventoryDialog";
import { useRecruitmentNextzen } from "@/app/hook/useRecruitment-jobs-nextzen";
import { useAssessmentNextzen } from "@/app/hook/useAssesmentNextzen";

const RECRUITMENT_STAGES = [
  "Applied", "Screening", "Assessment", "Interview", "Final Review", "Offer", "Hired", "Rejected",
];

// Map keywords from a component title to a relevant icon
const getAssessmentIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("coding") || t.includes("programming") || t.includes("code")) return Code;
  if (t.includes("case") || t.includes("business")) return Briefcase;
  if (t.includes("technical") || t.includes("knowledge")) return Brain;
  if (t.includes("behavioral") || t.includes("cultural")) return Users;
  if (t.includes("design")) return Award;
  return ClipboardCheck;
};

export default function AppliedDialog({ open, onClose, person, job }) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [statusValue, setStatusValue] = useState(person?.status || "Applied");

  const { changeCandidateStatus } = useRecruitmentNextzen();

  const {
    assessments,
    loading: assessmentsLoading,
    fetchAssessmentsByJob,
  } = useAssessmentNextzen();

  const {
    results, summary, loading: resultsLoading,
    fetchByCandidate, submitResult, removeResult,
  } = useAssessmentResultNextzen();

  const {
    notes, loading: notesLoading,
    fetchByCandidate: fetchNotes, submitNote, removeNote,
  } = useRecruitmentNotesNextzen();

  // ── Load all data when dialog opens ────────────────────────────────────
  useEffect(() => {
    if (open && person?._id) {
      fetchByCandidate(person._id);
      fetchNotes(person._id);
      if (person.jobRoleId) {
        fetchAssessmentsByJob(person.jobRoleId);
      }
      setStatusValue(person.status || "Applied");
    }
  }, [open, person, fetchByCandidate, fetchNotes, fetchAssessmentsByJob]);

  // ── The single assessment for this job role ────────────────────────────
  const jobAssessment = useMemo(() => {
    return assessments && assessments.length > 0 ? assessments[0] : null;
  }, [assessments]);

  // ── Component titles already evaluated for this candidate ──────────────
  const takenComponentIds = useMemo(() => {
    return new Set(results.map((r) => r.assessmentTitle).filter(Boolean));
  }, [results]);

  if (!person) return null;

  // ── Status change handler ──────────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setStatusValue(newStatus);
    try {
      await changeCandidateStatus(person._id, newStatus);
    } catch (err) {
      console.error("Status change failed:", err);
    }
  };

  // ── Note submission ────────────────────────────────────────────────────
  const handleAddNote = async ({ noteType, noteContent }) => {
    await submitNote({
      candidateId: person._id,
      candidateName: person.fullName,
      noteType,
      noteContent,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[950px] h-[90vh] p-0 overflow-hidden border-none bg-[#f8fafc] flex flex-col focus:outline-none">

          {/* Header */}
          <div className="px-8 pt-8 pb-4 bg-white border-b border-slate-100 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{person.fullName}</h2>
              <p className="text-sm text-slate-500 mt-1">{person.jobRoleName}</p>
              <p className="text-xs text-slate-400 mt-2 max-w-md">
                Complete candidate profile with contact information, experience, and interview history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-slate-700 text-white">
                {statusValue}
              </span>
              {person.matchScore !== undefined || person.experience !== undefined ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold text-emerald-600 bg-emerald-50">
                  <Star className="w-3.5 h-3.5" />
                  {person.matchScore || Math.min(95, 70 + (person.experience || 0) * 3)}%
                </div>
              ) : null}
              {person.resume && (
                <button
                  onClick={() => setIsResumeOpen(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"
                >
                  <FileText className="w-4 h-4" /> Show Full CV
                </button>
              )}
              
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

            {/* ── ASSESSMENT CENTER ──────────────────────────────────────── */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-900">Assessment Center</h3>
                    <p className="text-xs text-slate-500">
                      Evaluate candidate skills and capabilities
                    </p>
                  </div>
                </div>
                {!showNewAssessment && (
                  <Button
                    onClick={() => setShowNewAssessment(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={assessmentsLoading}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Assessment
                  </Button>
                )}
              </div>

              {/* Assessment Summary Card */}
              {summary.totalTests > 0 && (
                <div className="bg-white border border-slate-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Assessment Summary</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600">{summary.totalTests}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Tests</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{summary.avgScore}%</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Avg Score</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{summary.highest}%</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Highest</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">{summary.lowest}%</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Lowest</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment History */}
              {results.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Assessment History ({results.length})
                  </p>
                  {results.map((r) => (
                    <AssessmentResultCard
                      key={r._id}
                      result={r}
                      onDelete={() => removeResult(r._id, person._id)}
                    />
                  ))}
                </div>
              )}

              {/* New Assessment Flow — components are the cards */}
              {showNewAssessment && (
                <NewAssessmentFlow
                  candidate={person}
                  selectedComponent={selectedComponent}
                  setSelectedComponent={setSelectedComponent}
                  jobAssessment={jobAssessment}
                  loadingAssessments={assessmentsLoading}
                  takenComponentIds={takenComponentIds}
                  onSubmit={async (data) => {
                    await submitResult({
                      ...data,
                      candidateId: person._id,
                      candidateName: person.fullName,
                      candidateEmail: person.email,
                      jobRoleId: person.jobRoleId,
                      jobRoleName: person.jobRoleName,
                    });
                    setShowNewAssessment(false);
                    setSelectedComponent(null);
                  }}
                  onCancel={() => {
                    setShowNewAssessment(false);
                    setSelectedComponent(null);
                  }}
                  loading={resultsLoading}
                />
              )}

              {/* Scoring Guide */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                <p className="font-bold text-blue-700 mb-1 flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-200 inline-flex items-center justify-center text-[8px] text-blue-700 font-black">i</span>
                  Assessment Scoring Guide
                </p>
                <ul className="text-blue-600 space-y-0.5 ml-4">
                  <li>• 80-100%: Excellent — Exceeds expectations</li>
                  <li>• 60-79%: Good — Meets expectations</li>
                  <li>• 40-59%: Fair — Needs improvement</li>
                  <li>• Below 40%: Poor — Does not meet requirements</li>
                </ul>
              </div>
            </div>

            {/* ── TABS ───────────────────────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-100 p-1 rounded-full grid grid-cols-5 w-full">
                <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
                <TabsTrigger value="assessments" className="rounded-full">Assessments</TabsTrigger>
                <TabsTrigger value="interviews" className="rounded-full">Interviews</TabsTrigger>
                <TabsTrigger value="timeline" className="rounded-full">Timeline</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-full">Notes</TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="Contact Information">
                    <InfoRow icon={Mail} text={person.email} />
                    <InfoRow icon={Phone} text={person.phone} />
                    <InfoRow icon={MapPin} text={person.location} />
                  </Card>
                  <Card title="Professional Details">
                    <InfoRow icon={Briefcase} text={`${person.experience} years experience`} />
                    <InfoRow icon={GraduationCap} text={person.education} />
                    <InfoRow icon={DollarSign} text={person.salary ? `$${Number(person.salary).toLocaleString()}` : "—"} />
                  </Card>
                </div>
                <Card title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {(person.skills || []).map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
                <Card title="Application Details">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Source</p>
                      <p className="font-bold">{person.source || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Applied Date</p>
                      <p className="font-bold">
                        {person.createdAt ? new Date(person.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Notice Period</p>
                      <p className="font-bold">{person.noticePeriod ? `${person.noticePeriod} days` : "—"}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* ASSESSMENTS TAB */}
              <TabsContent value="assessments" className="mt-6 space-y-3">
                {results.length === 0 ? (
                  <EmptyState icon={FileText} message="No assessments evaluated yet" />
                ) : (
                  results.map((r) => (
                    <div key={r._id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{r.assessmentTitle}</h4>
                          <p className="text-xs text-slate-500">{r.assessmentType}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${getScoreColor(r.percentage)}`}>
                            {r.scoreObtained}/{r.maxScore}
                          </p>
                          <p className="text-xs text-slate-500">{r.percentage}%</p>
                        </div>
                      </div>
                      {r.overallFeedback && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                          {r.overallFeedback}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                        <span>Evaluated by: {r.evaluatedBy?.role || r.evaluatedBy?.name || "—"}</span>
                        <span>{new Date(r.evaluatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* INTERVIEWS */}
              <TabsContent value="interviews" className="mt-6">
                <EmptyState icon={Video} message="No interviews scheduled yet" />
              </TabsContent>

              {/* TIMELINE */}
              <TabsContent value="timeline" className="mt-6 space-y-3">
                {(person.history && person.history.length > 0) ? (
                  person.history.slice().reverse().map((h, i) => (
                    <TimelineItem key={i} item={h} />
                  ))
                ) : (
                  <TimelineItem
                    item={{
                      status: person.status || "Applied",
                      name: "System",
                      at: person.createdAt,
                    }}
                  />
                )}
              </TabsContent>

              {/* NOTES */}
              <TabsContent value="notes" className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {notes.length} note{notes.length !== 1 ? "s" : ""}
                  </p>
                  <Button onClick={() => setIsNoteOpen(true)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                  </Button>
                </div>

                {notesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : notes.length === 0 ? (
                  <EmptyState icon={MessageSquare} message="No notes added yet" />
                ) : (
                  notes.map((n) => (
                    <div key={n._id} className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-200">
                            {n.noteType}
                          </span>
                          <p className="text-sm text-slate-700 mt-2">{n.noteContent}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeNote(n._id, person._id)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span>By {n.addedBy?.name || "—"} ({n.addedBy?.role || "—"})</span>
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Action Bar */}
          <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
            <Select value={statusValue} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECRUITMENT_STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleStatusChange("Rejected")} className="text-red-600 border-red-200 hover:bg-red-50">
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button variant="outline" onClick={() => setIsInventoryOpen(true)} className="text-purple-600 border-purple-200 hover:bg-purple-50">
                <Archive className="w-4 h-4 mr-1" /> Send to Inventory
              </Button>
              <Button onClick={() => handleStatusChange("Screening")} className="bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="w-4 h-4 mr-1" /> Send for Screening
              </Button>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Modal */}
      <Dialog open={isResumeOpen} onOpenChange={setIsResumeOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800">Resume: {person.fullName}</h3>
            <a href={person.resume} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> Open Full
            </a>
          </div>
          <div className="flex-1 bg-slate-800 p-4 flex justify-center">
            <iframe src={`${person.resume}#view=FitH`} className="w-full h-full border-none bg-white max-w-[850px]" title="CV" />
          </div>
        </DialogContent>
      </Dialog>

      <AddNoteDialog
        open={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        candidate={person}
        onSubmit={handleAddNote}
        loading={notesLoading}
      />

      <SendToInventoryDialog
        open={isInventoryOpen}
        onOpenChange={setIsInventoryOpen}
        person={person}
      />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4">
      <h4 className="font-bold text-slate-900 text-sm mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <span className="truncate">{text || "—"}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Icon className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function TimelineItem({ item }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-slate-600 text-white flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4" />
        </div>
      </div>
      <div className="flex-1 bg-white border border-slate-100 rounded-xl shadow-sm p-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-slate-900 text-sm">{item.status}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Moved by {item.name || "System"} {item.designation && `(${item.designation})`}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {item.at ? new Date(item.at).toLocaleString() : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(percentage) {
  if (percentage >= 80) return "text-emerald-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 40) return "text-amber-600";
  return "text-red-600";
}

function AssessmentResultCard({ result, onDelete }) {
  const color = getScoreColor(result.percentage);
  const Icon = getAssessmentIcon(result.assessmentTitle);
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{result.assessmentTitle}</p>
            <p className="text-[11px] text-slate-500">
              Evaluated by {result.evaluatedBy?.role || "—"} on {new Date(result.evaluatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full bg-amber-50 ${color} text-sm font-bold`}>
          {result.scoreObtained}/{result.maxScore}
        </div>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full ${result.percentage >= 80 ? "bg-emerald-500" : result.percentage >= 60 ? "bg-blue-500" : result.percentage >= 40 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${result.percentage}%` }}
        />
      </div>
      {result.overallFeedback && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-line">
          {result.overallFeedback}
          {result.detailedEvaluation && Object.keys(result.detailedEvaluation).length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <p className="font-semibold text-xs text-slate-700 mb-1">Detailed Evaluation:</p>
              {Object.entries(result.detailedEvaluation).map(([key, val]) =>
                val ? <p key={key} className="text-xs"><span className="font-semibold">{key}:</span> {val}</p> : null
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end mt-2">
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

// ── New Assessment Flow — components ARE the cards ──────────────────────────
function NewAssessmentFlow({
  candidate,
  selectedComponent,
  setSelectedComponent,
  jobAssessment,
  loadingAssessments,
  takenComponentIds,
  onSubmit,
  onCancel,
  loading,
}) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [details, setDetails] = useState("");

  // Reset form whenever the chosen component changes
  useEffect(() => {
    setScore("");
    setFeedback("");
    setDetails("");
  }, [selectedComponent]);

  const components = jobAssessment?.assessmentTypesList || [];
  const availableComponents = components.filter(
    (c) => !takenComponentIds.has(c.typeTitle)
  );

  // ── STEP 1: Pick a component (each one represents an evaluation type) ──
  if (!selectedComponent) {
    return (
      <div className="bg-white border-2 border-blue-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Assessment
          </p>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm font-semibold text-slate-700 mb-1">
          Select Assessment Type
        </p>
        <p className="text-[11px] text-slate-500 mb-3">
          Configured for{" "}
          <span className="font-semibold text-slate-700">
            {candidate.jobRoleName}
          </span>
        </p>

        {loadingAssessments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-500">Loading...</span>
          </div>
        ) : !jobAssessment ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                No assessment configured for this job role
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Ask your admin to create an assessment for{" "}
                <span className="font-bold">{candidate.jobRoleName}</span> first.
              </p>
            </div>
          </div>
        ) : availableComponents.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                All assessments completed
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                The candidate has been evaluated on every component for this role.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {availableComponents.map((component) => {
              const Icon = getAssessmentIcon(component.typeTitle);
              return (
                <button
                  key={component.id || component.typeTitle}
                  onClick={() => setSelectedComponent(component)}
                  className="text-left p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {component.typeTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Max marks: {component.maxMarks}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: Fill in score + evaluation for the chosen component ────────
  const maxScore = selectedComponent.maxMarks || 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim() || !score) return;

    onSubmit({
      assessmentId: jobAssessment._id,
      assessmentTitle: selectedComponent.typeTitle,
      assessmentType: selectedComponent.typeTitle,
      scoreObtained: score,
      maxScore,
      detailedEvaluation: details ? { Evaluation: details } : {},
      overallFeedback: feedback,
    });
  };

  const SelectedIcon = getAssessmentIcon(selectedComponent.typeTitle);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-2 border-blue-200 rounded-xl p-5 mb-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Assessment
        </p>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SelectedIcon className="w-4 h-4 text-blue-600" />
          <div>
            <p className="font-bold text-sm">{selectedComponent.typeTitle}</p>
            <p className="text-[11px] text-slate-500">
              {jobAssessment.jobRoleName} · {selectedComponent.maxMarks} max marks
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setSelectedComponent(null)}
        >
          Change
        </Button>
      </div>

      <div>
        <label className="text-sm font-bold mb-1 block">Assessment Name</label>
        <input
          value={selectedComponent.typeTitle}
          disabled
          className="w-full h-10 px-3 text-sm bg-slate-100 border border-slate-200 rounded-md text-slate-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold mb-1 block">Score Obtained</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={`e.g., ${Math.round(maxScore * 0.7)}`}
            min="0"
            max={maxScore}
            className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md"
            required
          />
        </div>
        <div>
          <label className="text-sm font-bold mb-1 block">Maximum Score</label>
          <input
            type="number"
            value={maxScore}
            disabled
            className="w-full h-10 px-3 text-sm bg-slate-100 border border-slate-200 rounded-md text-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold mb-1 block">
          Detailed Evaluation (Optional)
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Brief notes on the candidate's performance for this component..."
          rows={3}
          className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-md"
        />
      </div>

      <div>
        <label className="text-sm font-bold mb-1 block">Overall Feedback *</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide overall assessment feedback, strengths, areas for improvement..."
          rows={4}
          className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-md"
          required
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-1" /> Save Assessment
            </>
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}