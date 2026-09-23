"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";
import { 
  Calendar, 
  Plus, 
  Loader2 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

const LeaveReqSelfService = () => {
  const { UserAllDetails } = useAuth();
  const { 
    leaveRequests, 
    requestLoading, 
    fetchMyRequests,
    applyLeave // Assuming this exists in your hook
  } = useLeavePolicy();

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    days: 0
  });

  // Fetch data on mount
  useEffect(() => {
    if (UserAllDetails?.email) {
      fetchMyRequests(UserAllDetails.email);
    }
  }, [UserAllDetails?.email, fetchMyRequests]);

  // Calculate days when dates change
  useEffect(() => {
    if (leaveForm.start_date && leaveForm.end_date) {
      const start = new Date(leaveForm.start_date);
      const end = new Date(leaveForm.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setLeaveForm(prev => ({ ...prev, days: diffDays > 0 ? diffDays : 0 }));
    }
  }, [leaveForm.start_date, leaveForm.end_date]);

  const handleLeaveApplication = async () => {
    setLoading(true);
    // Add your application logic here using applyLeave from hook
    console.log("Submitting Leave:", leaveForm);
    setTimeout(() => {
      setLoading(false);
      setShowLeaveForm(false);
      resetLeaveForm();
    }, 1500);
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
      days: 0
    });
    setShowLeaveForm(false);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "approved") return "bg-green-100 text-green-700 border-green-200";
    if (s === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="space-y-6 ">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Leave Requests
            </CardTitle>
            <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Apply Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Submit a new leave request for approval
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Leave Type *</Label>
                    <Select 
                      value={leaveForm.leave_type} 
                      onValueChange={(value) => setLeaveForm(prev => ({ ...prev, leave_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={leaveForm.start_date}
                        onChange={(e) => setLeaveForm(prev => ({ ...prev, start_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label>End Date *</Label>
                      <Input
                        type="date"
                        value={leaveForm.end_date}
                        onChange={(e) => setLeaveForm(prev => ({ ...prev, end_date: e.target.value }))}
                        min={leaveForm.start_date || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  {leaveForm.start_date && leaveForm.end_date && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600">
                        Total Days: <span className="font-bold text-blue-800">{leaveForm.days}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label>Reason *</Label>
                    <Textarea
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please provide reason for leave"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleLeaveApplication} 
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetLeaveForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {requestLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Leave Requests</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any leave requests yet.</p>
              <Button 
                onClick={() => setShowLeaveForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                Apply for Leave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((leave) => (
                <div key={leave._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{leave.leaveType}</h4>
                    <Badge className={`${getStatusColor(leave.status)} border shadow-sm`}>
                      {leave.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex gap-8">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <span className="ml-2 font-medium text-gray-700">{leave.startDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <span className="ml-2 font-medium text-gray-700">{leave.endDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-8 md:justify-end">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-bold text-blue-600">{leave.totalDays || leave.days} days</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Applied:</span>
                        <span className="ml-2 text-gray-700">{new Date(leave.appliedAt || leave.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="text-gray-500 text-xs block mb-1 uppercase font-bold">Reason:</span>
                      <span className="text-gray-700">{leave.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveReqSelfService;