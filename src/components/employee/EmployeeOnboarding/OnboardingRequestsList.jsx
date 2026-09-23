"use client";
import React from "react";
import { motion } from "framer-motion";
import OnboardingRequestCard from "./OnboardingRequestCard";

const OnboardingRequestsList = ({
  onboardingRequests,
  copiedTokenId,
  handleCopyActivationLink,
  handleSendActivationEmail,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {onboardingRequests.map((request) => (
        <OnboardingRequestCard
          key={request._id}
          request={request}
          copiedTokenId={copiedTokenId}
          handleCopyActivationLink={handleCopyActivationLink}
          handleSendActivationEmail={handleSendActivationEmail}
        />
      ))}
    </div>
  );
};

export default OnboardingRequestsList;
