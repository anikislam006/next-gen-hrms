"use client";

import React from 'react';
import { 
  FileText, 
  MapPin, 
  Trash2, 
  Briefcase, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Sub-component for Rich Text Rendering
const RichTextDisplay = ({ content, className = "" }) => {
  if (!content) return <p className="text-gray-400 italic text-xs">No content provided</p>;
  return (
    <div
      className={`prose prose-sm max-w-none text-gray-600 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const JobPostList = ({ jobs, loading, handleDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Active Recruitment Posts
          <Badge variant="secondary" className="ml-2">
            Manager View
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recruitment records found</p>
            <p className="text-sm text-gray-500 mt-2">
              Create a new job post to start hiring.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold rounded-lg">
                        {typeof job.title === "string" ? job.title.substring(0, 2).toUpperCase() : "JP"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg">
                            <RichTextDisplay content={job.title} className="prose-p:my-0 inline" />
                         </h3>
                         <Badge variant="outline" className="text-[10px] uppercase">
                            ID: {job._id.slice(-6)}
                         </Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location} • {job.employmentType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={`/super-admin/recruitment/${job._id}`}>
                        <User className="h-4 w-4 mr-1" />
                        Recruiter
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job._id, job.title)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Job Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Vacancies</p>
                    <p className="font-medium">{job.vacancies} Positions</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Post Duration</p>
                    <p className="font-medium text-sm">
                      {new Date(job.startDate).toLocaleDateString()} to {new Date(job.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interview Mode</p>
                    <div className="font-medium">
                        <RichTextDisplay content={job.interview} className="prose-p:my-0" />
                    </div>
                  </div>
                </div>

                {/* Context/Reason Style Box */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-medium mb-1">Job Context</p>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    <RichTextDisplay content={job.context} className="line-clamp-2" />
                  </div>
                </div>

                {/* Workflow/Footer Style */}
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-xs">
                      <div className="flex items-center gap-2 text-indigo-700">
                        <CheckCircle className="h-3 w-3" />
                        Salary: <RichTextDisplay content={job.salary} className="prose-p:my-0 font-bold inline" />
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-3 w-3" />
                        Posted: {new Date(job.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                        ACTIVE LISTING
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobPostList;