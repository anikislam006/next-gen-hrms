"use client";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import React from "react";

const NoReq = ({ canCreateOnboardingRequest, setShowCreateRequest }) => {
  return (
    <div className="text-center py-12">
      <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Onboarding Requests
      </h3>
      <p className="text-gray-600 mb-4">
        Create your first onboarding request to get started
      </p>
      {canCreateOnboardingRequest() && (
        <Button
          onClick={() => setShowCreateRequest(true)}
          className="bg-gradient-to-r from-green-500 to-teal-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Onboarding Request
        </Button>
      )}
    </div>
  );
};

export default NoReq;
