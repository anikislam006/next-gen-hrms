"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Calendar 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const MyProfileSelfService = () => {
    const { UserAllDetails } = useAuth();

    // Use a fallback for the nested profile structure to match your design requirements
    const currentUser = {
        profile: {
            full_name: UserAllDetails?.fullName,
            email: UserAllDetails?.email,
            phone: UserAllDetails?.phone,
            designation: UserAllDetails?.designation,
            department: UserAllDetails?.department,
            employee_id: UserAllDetails?.employeeId
        }
    };

    return (
        <div className="space-y-6">
            {/* Personal Information Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <User className="w-6 h-6" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <User className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Full Name</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.full_name || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Email Address</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.email || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <Phone className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Phone Number</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.phone || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Designation</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.designation || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Department</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.department || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-white/40">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-600">Employee ID</div>
                                    <div className="font-medium text-gray-900">
                                        {currentUser?.profile?.employee_id || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyProfileSelfService;