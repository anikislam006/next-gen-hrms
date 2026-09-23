"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, UserPlus, User, Shield } from "lucide-react";
import OnboardingReqForm from "@/Form/OnboardingReqForm";
import NoReq from "./NoReq";
import OnboardingRequestsList from "./OnboardingRequestsList";

const EmployeeOnboardingTabs = ({onboardingRequests}) => {
  const [activeTab, setActiveTab] = useState("requests");
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState(null);



  const handleCopyActivationLink = (request) => {
    if (!request.verifyLink) return;
    navigator.clipboard.writeText(request.verifyLink)
      .then(() => {
        setCopiedTokenId(request._id);
        setTimeout(() => setCopiedTokenId(null), 2000);
      })
      .catch(err => console.error("Failed to copy link:", err));
  };

  const handleSendActivationEmail = (request) => {
    alert(`Activation email sent to ${request.email}`);
  };

  const canCreateOnboardingRequest = () => true;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="requests">Onboarding Requests</TabsTrigger>
          <TabsTrigger value="employee-portal">Employee Portal</TabsTrigger>
        </TabsList> */}

        {canCreateOnboardingRequest() && (
          <>
            <Button
              onClick={() => setShowCreateRequest(true)}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Onboarding Request
            </Button>

            <OnboardingReqForm
              showCreateRequest={showCreateRequest}
              setShowCreateRequest={setShowCreateRequest}
            />
          </>
        )}
      </div>

      {/* Requests Tab */}
      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Onboarding Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onboardingRequests.length === 0 ? (
              <NoReq
                canCreateOnboardingRequest={canCreateOnboardingRequest}
                setShowCreateRequest={setShowCreateRequest}
              />
            ) : (
              <OnboardingRequestsList
                onboardingRequests={onboardingRequests}
                copiedTokenId={copiedTokenId}
                handleCopyActivationLink={handleCopyActivationLink}
                handleSendActivationEmail={handleSendActivationEmail}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Employee Portal Tab */}
      <TabsContent value="employee-portal">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Employee Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Employee Self-Registration Portal</h3>
              <p className="text-gray-600 mb-4">
                Employees access this portal using their activation link
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default EmployeeOnboardingTabs;
