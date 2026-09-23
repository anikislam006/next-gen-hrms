"use client";
import { useState, useEffect } from "react";
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, Send, Info, Layers, Plus, Calendar, 
  Briefcase, Globe, ClipboardCheck, Loader2 
} from "lucide-react";
import { useAssessment } from "@/app/hook/useAssessment";

export default function CreateAssessmentDialog({ open, onClose, jobInfo }) {
  const { 
    submitAssessment, 
    fetchAssessmentsByJob, 
    fetchAllAssessments, 
    removeAssessment,
    assessments, 
    loading,
    pagination 
  } = useAssessment();

  const [activeTab, setActiveTab] = useState("create");

  // --- Form State ---
  const [currentType, setCurrentType] = useState({ typeTitle: "", typeDescription: "", maxMarks: "" });
  const [formData, setFormData] = useState({
    assessmentTitle: "",
    startDate: "",
    instructions: "",
    assessmentTypesList: [],
    jobRoleId: "",
    jobRoleName: ""
  });

  // Load data based on tab switching
  useEffect(() => {
    if (!open) return;
    if (activeTab === "this-job" && jobInfo?._id) {
      fetchAssessmentsByJob(jobInfo._id);
    } else if (activeTab === "all") {
      fetchAllAssessments();
    }
  }, [activeTab, open, jobInfo?._id, fetchAssessmentsByJob, fetchAllAssessments]);

  // Sync job info
  useEffect(() => {
    if (jobInfo) {
      setFormData((prev) => ({
        ...prev,
        jobRoleId: jobInfo._id || "",
        jobRoleName: jobInfo.title || ""
      }));
    }
  }, [jobInfo]);

  const addTypeToList = () => {
    if (!currentType.typeTitle || !currentType.maxMarks) return;
    setFormData(prev => ({
      ...prev,
      assessmentTypesList: [...prev.assessmentTypesList, { ...currentType, id: Date.now() }]
    }));
    setCurrentType({ typeTitle: "", typeDescription: "", maxMarks: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await submitAssessment(formData);
      if (result.success) {
        setActiveTab("this-job"); // Switch to list view to see result
        setFormData(prev => ({ ...prev, assessmentTitle: "", assessmentTypesList: [], instructions: "" }));
      }
    } catch (err) { console.error(err); }
  };

  /* ================= RENDERER: ASSESSMENT LIST ITEM ================= */
  const renderAssessmentList = (items) => {
    if (loading && items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading assessments...</p>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-gray-50/50">
          <ClipboardCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No assessments found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item._id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-all shadow-sm group">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{item.assessmentTitle}</h4>
                <p className="text-[10px] text-indigo-600 font-bold uppercase">{item.jobRoleName}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.startDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {item.assessmentTypesList?.length || 0} Components</span>
                </div>
              </div>
              <button 
                onClick={() => removeAssessment(item._id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AccessibleDialog 
      open={open} 
      onOpenChange={onClose} 
      title="Assessment Management" 
      description="Create and manage evaluation stages for your recruitment pipeline" 
      className="max-w-[90vw] w-[90vw]"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="create" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Post Assessment
          </TabsTrigger>
          <TabsTrigger value="this-job" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Briefcase className="w-4 h-4 mr-2" /> This Job Assessments
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="w-4 h-4 mr-2" /> All Assessments
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1: CREATE --- */}
        <TabsContent value="create" className="h-[70vh] focus-visible:outline-none">
          <form onSubmit={onSubmit} className="grid grid-cols-12 gap-8 h-full">
            <div className="col-span-4 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase text-gray-500">Basic Information</Label>
                <Input 
                  placeholder="Assessment Title" 
                  value={formData.assessmentTitle} 
                  onChange={(e) => setFormData({...formData, assessmentTitle: e.target.value})}
                  className="h-11 border-gray-200"
                />
                <Input 
                  type="date" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="h-11 border-gray-200"
                />
                <textarea 
                  placeholder="Instructions for candidates..." 
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 bg-gray-50/30"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="text-xs font-bold uppercase text-indigo-600">Add Component</Label>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                  <Input placeholder="Component Title" value={currentType.typeTitle} onChange={(e) => setCurrentType({...currentType, typeTitle: e.target.value})} className="bg-white h-10 border-indigo-100" />
                  <Input type="number" placeholder="Max Marks" value={currentType.maxMarks} onChange={(e) => setCurrentType({...currentType, maxMarks: e.target.value})} className="bg-white h-10 border-indigo-100" />
                  <Button type="button" onClick={addTypeToList} className="w-full bg-indigo-600">Add to List</Button>
                </div>
              </div>
            </div>

            <div className="col-span-8 flex flex-col bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <Layers className="w-4 h-4" /> Added Components ({formData.assessmentTypesList.length})
               </h3>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {formData.assessmentTypesList.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                     <div>
                       <p className="font-bold text-sm">{item.typeTitle}</p>
                       <p className="text-xs text-gray-500">Max Marks: {item.maxMarks}</p>
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({...prev, assessmentTypesList: prev.assessmentTypesList.filter(i => i.id !== item.id)}))}>
                       <Trash2 className="w-4 h-4 text-red-400" />
                     </Button>
                   </div>
                 ))}
               </div>
               <div className="pt-6 mt-4 border-t flex justify-end">
                 <Button disabled={loading || !formData.assessmentTitle || formData.assessmentTypesList.length === 0} type="submit" className="h-12 px-10 bg-indigo-600 shadow-lg shadow-indigo-200">
                   {loading ? "Posting..." : "Finalize & Post Assessment"}
                 </Button>
               </div>
            </div>
          </form>
        </TabsContent>

        {/* --- TAB 2: THIS JOB --- */}
        <TabsContent value="this-job" className="h-[70vh] overflow-y-auto pr-2 custom-scrollbar focus-visible:outline-none">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Assessments for {jobInfo?.title}</h3>
            <p className="text-sm text-gray-500">Showing all evaluation stages specifically for this role.</p>
          </div>
          {renderAssessmentList(assessments)}
        </TabsContent>

        {/* --- TAB 3: ALL --- */}
        <TabsContent value="all" className="h-[70vh] overflow-y-auto pr-2 custom-scrollbar focus-visible:outline-none">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Global Assessment Repository</h3>
            <p className="text-sm text-gray-500">Total assessments across all job roles: {pagination.totalItems}</p>
          </div>
          {renderAssessmentList(assessments)}
        </TabsContent>
      </Tabs>
    </AccessibleDialog>
  );
}