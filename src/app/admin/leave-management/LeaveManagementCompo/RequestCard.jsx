import React from 'react';
import { 
  Clock, 
  Clock4, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  User 
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RequestCard = ({ item, isGlobal = false, handleStatusChange }) => {
  const status = item.status?.toLowerCase() || "pending";

  // Helper for Badge Colors based on the new design
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'dept_head_approved':
      case 'manager_approved':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const StatusIcon = status === 'approved' ? CheckCircle : status === 'rejected' ? XCircle : Clock;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white mb-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-200 text-slate-900">
              {item.fullName ? item.fullName.split(' ').map(n => n[0]).join('') : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-slate-900">{item.fullName || "User"}</h3>
            <p className="text-sm text-gray-600">
              {item.department || "Organization"} • {item.designation || "Executive"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`${getStatusColor(status)} flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {status.replace('_', ' ').toUpperCase()}
          </Badge>

          {/* Logic check: item must be pending AND user must have global (manager) view */}
          {status === "pending" && isGlobal && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(item._id, "rejected")}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange(item._id, "approved")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500">Leave Type</p>
          <p className="font-medium">{item.leaveType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Duration</p>
          <p className="font-medium">
            {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {item.totalDays || 0} working days
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Applied Date</p>
          <p className="font-medium">
            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Reason Section */}
      <div className="mb-3">
        <p className="text-sm text-gray-500">Reason</p>
        <p className="text-sm italic text-slate-700">"{item.reason}"</p>
      </div>

      {/* Workflow Progress */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium mb-2">Approval Workflow</p>
        <div className="flex items-center gap-4 text-xs">
          {/* Step 1: Department Head */}
          <div className={`flex items-center gap-2 ${status === 'approved' ? 'text-green-600' : 'text-blue-600'}`}>
            {status === 'approved' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock4 className="h-3 w-3" />
            )}
            Department Head ({status === 'approved' ? 'Approved' : 'Pending'})
          </div>

          <ArrowRight className="h-3 w-3 text-gray-400" />

          {/* Step 2: HR Verification */}
          <div className={`flex items-center gap-2 ${status === 'approved' ? 'text-green-600' : 'text-gray-400'}`}>
            {status === 'approved' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            )}
            HR Verification
          </div>
        </div>

        {/* Optional Comments Section */}
        {(item.managerComments || item.rejectionReason) && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Comments:</p>
            {item.managerComments && (
              <p className="text-xs text-gray-600">Manager: {item.managerComments}</p>
            )}
            {item.rejectionReason && (
              <p className="text-xs text-red-600 font-medium">Rejection: {item.rejectionReason}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCard;