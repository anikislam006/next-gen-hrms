"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Wallet, CalendarDays, Target, Receipt, FileText, 
  Mail, Phone, Briefcase, Building2, Calendar, UserCheck, 
  Crown, CheckCircle, AlertCircle, Shield, Calculator, 
  History, Receipt as ReceiptIcon, Eye, Download, BarChart3, 
  Plus, CreditCard 
} from 'lucide-react';

// Shadcn UI Imports (Assuming these paths)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Header Components
import SelfServiceHeader from './SelServiceCompo/SelfServiceHeader';
import SelfServiceState from './SelServiceCompo/SelfServiceState';
import MyProfileSelfService from './SelServiceCompo/MyProfileSelfService';
import SalarySelfService from './SelServiceCompo/SalarySelfService';
import LeaveReqSelfService from './SelServiceCompo/LeaveReqSelfService';
import ExpensesSelfService from './SelServiceCompo/ExpensesSelfService';
import GoalSelfService from './SelServiceCompo/GoalSelfService';
import DocumentsSelfService from './SelServiceCompo/DocumentsSelfService';
import { useAuth } from '@/context/AuthContext';

const SelfServiceMainPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'profile';
    const {UserAllDetails } = useAuth();

    // Mock Data for the design

    const lineManager = null; // Set to object to test manager view
    const epfSummary = { totalBalance: 12500, thisYearContribution: 3200, interestRate: 8.5, estimatedInterest: 1060 };
    const [selectedYear, setSelectedYear] = useState("2024");

    const handleTabChange = (value) => {
        router.push(`/super-admin/self-service?tab=${value}`, { scroll: false });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
            <SelfServiceHeader UserAllDetails={UserAllDetails} />
            <SelfServiceState UserAllDetails={UserAllDetails} />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <div>
                    <TabsList className="w-full">
                        <TabsTrigger value="profile" >My Profile</TabsTrigger>
                        <TabsTrigger value="salary" >Salary & EPF</TabsTrigger>
                        <TabsTrigger value="leave" >Leave Requests</TabsTrigger>
                        <TabsTrigger value="expense" >Expenses</TabsTrigger>
                        <TabsTrigger value="goals" >Goals</TabsTrigger>
                        <TabsTrigger value="documents" >Documents</TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* --- PROFILE TAB --- */}
                        <TabsContent value="profile" className="space-y-6 mt-0">
                            <MyProfileSelfService></MyProfileSelfService>
                        </TabsContent>

                        {/* --- SALARY TAB --- */}
                        <TabsContent value="salary" className="space-y-6 mt-0">
                            <SalarySelfService></SalarySelfService>
                        </TabsContent>

                         {/* --- LEAVE TAB --- */}
                        <TabsContent value="leave" className="space-y-6 mt-0">
                            <LeaveReqSelfService></LeaveReqSelfService>
                        </TabsContent>

                        {/* --- EXPENSE TAB --- */}
                        <TabsContent value="expense" className="space-y-6 mt-0">
                            <ExpensesSelfService></ExpensesSelfService>
                        </TabsContent>

                        {/* --- GOAL TAB --- */}
                        <TabsContent value="goals" className="space-y-6 mt-0">
                            <GoalSelfService></GoalSelfService>
                        </TabsContent>

                        {/* --- DOCUMENTS TAB --- */}
                        <TabsContent value="goals" className="space-y-6 mt-0">
                            <DocumentsSelfService></DocumentsSelfService>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

export default SelfServiceMainPage;