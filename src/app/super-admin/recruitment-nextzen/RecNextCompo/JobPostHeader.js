"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  UserPlus,
  Plus,
  ClipboardCheck,
} from "lucide-react";
import CreateJobDialog from "./CreateJobDialog";
import CreateRecruitment from "./CreateRecruitment";
import CreateAssessmentDialog from "./CreateAssessmentDialog";
import { Button } from "@/components/ui/button";

const JobPostHeader = () => {
  const [jobOpen, setJobOpen] = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-8 h-8" />
              <h1 className="text-3xl font-semibold">
                Recruitment Management
              </h1>
            </div>
            <p className="text-purple-100">
              Streamline your hiring process and track candidate pipelines
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => setJobOpen(true)}
              className="bg-white text-blue-600 hover:bg-purple-50 font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Job
            </Button>

            <Button
              onClick={() => setRecruitmentOpen(true)}
              className="bg-white text-blue-600 hover:bg-purple-50 font-semibold flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Candidate
            </Button>

            <Button
              onClick={() => setAssessmentOpen(true)}
              className="bg-white text-blue-600 hover:bg-purple-50 font-semibold flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              Create Assessment
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Dialogs */}
      <CreateJobDialog open={jobOpen} onClose={() => setJobOpen(false)} />
      <CreateRecruitment
        open={recruitmentOpen}
        onClose={() => setRecruitmentOpen(false)}
      />
      <CreateAssessmentDialog
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
      />
    </>
  );
};

export default JobPostHeader;