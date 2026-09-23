"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Building2,
  Award,
  Calendar,
  Clock,
  Copy,
  Check,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return {
        bgColor: "bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-600",
        badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: Clock,
        ringColor: "ring-yellow-200",
      };
    case "in_progress":
      return {
        bgColor: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100",
        borderColor: "border-blue-200",
        iconColor: "text-blue-600",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        icon: RefreshCw,
        ringColor: "ring-blue-200",
      };
    case "completed":
      return {
        bgColor: "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100",
        borderColor: "border-green-200",
        iconColor: "text-green-600",
        badgeColor: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle,
        ringColor: "ring-green-200",
      };
    case "expired":
      return {
        bgColor: "bg-gradient-to-br from-red-50 via-pink-50 to-red-100",
        borderColor: "border-red-200",
        iconColor: "text-red-600",
        badgeColor: "bg-red-100 text-red-700 border-red-200",
        icon: AlertCircle,
        ringColor: "ring-red-200",
      };
    default:
      return {
        bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
        borderColor: "border-gray-200",
        iconColor: "text-gray-600",
        badgeColor: "bg-gray-100 text-gray-700 border-gray-200",
        icon: AlertCircle,
        ringColor: "ring-gray-200",
      };
  }
};

const OnboardingRequestCard = ({
  request,
  copiedTokenId,
  handleCopyActivationLink,
  handleSendActivationEmail,
}) => {
  const config = getStatusConfig(request.status);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request.status);

  const StatusIcon = config.icon;
  const isExpiringSoon =
    request.status === "pending" &&
    new Date(request.tokenExpiryDate) <=
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const handleSendTokenAgain = async (request) => {
    try {
      const confirmResend = confirm(
        `Are you sure you want to resend the verification link to ${request.fullName}?`
      );
      if (!confirmResend) return;

      const res = await axios.put(
        `https://code360.pro/api/resend-onboard-token/${request._id}`
      );
      if (res.data.success) {
        toast.success("Token sent successfully!");
      } else {
        toast.error(res.data.message || "Failed to resend link.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending link. Please try again.");
    }
  };

  // ✅ Handle Mark as Completed
  const handleMarkCompleted = async (id) => {
    try {
      const confirmAction = window.confirm(
        "⚠️ Are you sure you want to mark this employee as completed?"
      );
      if (!confirmAction) return; // user canceled

      setLoading(true);
      const res = await axios.put(
        `https://code360.pro/api/add-completed/${id}`
      );

      if (res.data.success) {
        toast.success("✅ Employee marked as completed!");
        setStatus("completed"); // Update local UI
      } else {
        toast.error(res.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key={request.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group hover:scale-105`}
    >
      {/* Status indicator ribbon */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 transform rotate-45 translate-x-6 -translate-y-6 ${
          config.badgeColor.split(" ")[0]
        } opacity-20`}
      />

      {/* Status icon in top right */}
      <div className="absolute top-4 right-4">
        <div
          className={`p-2 rounded-full bg-white/80 ${config.ringColor} ring-2`}
        >
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pr-12">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-gray-800">
              {request.fullName}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                className={`${config.badgeColor} border text-xs px-2 py-1`}
              >
                {request.status.replace("_", " ").toUpperCase()}
              </Badge>
              {isExpiringSoon && (
                <Badge className="bg-red-500/20 text-red-700 border-red-300 text-xs px-2 py-1 animate-pulse">
                  Expiring Soon
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            {request.status === "inProgress" ? (
              <div>
                {status !== "completed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkCompleted(request._id)}
                    className="flex-1 text-xs bg-green-100 hover:bg-green-200 border-green-200 hover:border-green-300 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark as Completed
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="flex-1 text-xs bg-green-200 border-green-300 text-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Button>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        {/* Employee details */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{request.email} | {request.role}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span>{request.department}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-4 h-4 text-gray-500" />
            <span>{request.designation}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              Joining: {new Date(request.joiningDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Employment details */}
        <div className="bg-white/60 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Employee ID: </span>
              <div className="text-gray-800">{request.employeeId}</div>
            </div>
            <div>
              <span className="font-medium">Employment Type:</span>
              <div className="text-gray-800">{request.employmentType}</div>
            </div>
            {request.grossSalary && (
              <div className="col-span-2">
                <span className="font-medium">Gross Salary:</span>
                <div className="text-gray-800 font-bold">
                  ৳{request.grossSalary.toLocaleString()}
                </div>
              </div>
            )}

            {request.reportingManager && (
              <div className="col-span-2">
                <span className="font-medium">Reports to:</span>
                <div className="text-gray-800">{request.reportingManager}</div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline info */}
        <div className="space-y-2 text-xs text-gray-500 border-t border-white/40 pt-3">
          <div>
            Created by{" "}
            <span className="font-medium text-gray-700">
              {request?.createdBy?.name} | {request?.createdBy?.role} |{" "}
              {request?.createdBy?.email}
            </span>
          </div>
          <div>on {new Date(request.tokenStartDate).toLocaleDateString()}</div>
          {request.status === "pending" && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span
                className={isExpiringSoon ? "text-red-600 font-medium" : ""}
              >
                Expires{" "}
                {new Date(request?.tokenExpiryDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {request?.tokenStartDate && (
            <div>
              Activated on{" "}
              {new Date(request?.tokenStartDate).toLocaleDateString()}
            </div>
          )}
          {request?.tokenExpiryDate && (
            <div className="text-green-600 font-medium">
              Completed on{" "}
              {new Date(request?.tokenExpiryDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {request.status === "expired" ? (
          <div className="w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendTokenAgain(request)}
              className="flex-1 text-xs bg-white/80 hover:bg-white border-white/60 hover:border-white transition-all"
            >
              <Send className="w-3 h-3 mr-1" />
              Send token again?
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyActivationLink(request)}
              className="flex-1 text-xs bg-white/80 hover:bg-white border-white/60 hover:border-white transition-all"
            >
              {copiedTokenId === request._id ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendActivationEmail(request)}
              className="flex-1 text-xs bg-white/80 hover:bg-white border-white/60 hover:border-white transition-all"
            >
              <Send className="w-3 h-3 mr-1" />
              Send Email
            </Button>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default OnboardingRequestCard;
