"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import CreateJobDialog from "./CreateJobDialog";
import { Button } from "@/components/ui/button";

const JobPostHeader = () => {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-6">
            
            <Button 
                onClick={() => setOpen(true)}
                className="bg-white text-blue-600 hover:bg-purple-50 font-semibold"
            >
                + Create New Job
            </Button>
          </div>
        </div>
      </motion.div>

      <CreateJobDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default JobPostHeader;