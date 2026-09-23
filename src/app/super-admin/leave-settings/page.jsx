"use client";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Loader2, Zap, Calendar, Clock, History, Settings2, 
  Settings, Check, AlertCircle, Edit3, SearchX,
  Plus
} from "lucide-react";
import { useLeavePolicy } from "@/app/hook/useLeavePolicy";

// UI Components
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import StatsCardsLeaveSettings from "./LeaveSettingsCompo/StatsCardsLeaveSettings";
import SearchHeaderLeaveSettings from "./LeaveSettingsCompo/SearchHeaderLeaveSettings";
import CreateLeaveSettingsDialog from "./LeaveSettingsCompo/CreateLeaveSettingsDialog";
import { Button } from "@/components/ui/button";
const LeaveSettingsPage = () => {
  const {
    leavePolicies,
    loading,
    fetchAllLeavePolicies,
    updateTypeSettings,
    kpiData
  } = useLeavePolicy(); 

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useEffect(() => {
    fetchAllLeavePolicies({ page: 1, limit: 50 });
  }, [fetchAllLeavePolicies]);

  const filteredLeaveTypes = useMemo(() => {
    if (!searchTerm.trim()) return leavePolicies;
    return leavePolicies.filter((policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, leavePolicies]);

  useEffect(() => {
    if (filteredLeaveTypes.length > 0) {
      const isStillVisible = filteredLeaveTypes.find(t => t._id === activeTab);
      if (!isStillVisible) {
        setActiveTab(filteredLeaveTypes[0]._id);
      }
    }
  }, [filteredLeaveTypes, activeTab]);

  const handleToggle = async (id, field, currentValue) => {
    await updateTypeSettings(id, { [field]: !currentValue });
  };

  return (
    <div className="space-y-8 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            Leave Advance Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure advanced leave settings for each leave type
          </p>
        </div>
        {/* <Button 
        onClick={() => setIsCreateOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
      >
        <Plus className="h-4 w-4" />
        New Leave Type
      </Button> */}
      </div>

      <StatsCardsLeaveSettings  kpiData={kpiData} loading={loading}  />
      
      <SearchHeaderLeaveSettings
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        leavePolicies={leavePolicies}
      />

      {loading && leavePolicies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Loading configurations...</p>
        </div>
      ) : filteredLeaveTypes.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Exact Tab Design: Grid of 6 */}
          <TabsList className="grid w-full grid-cols-6">
            {filteredLeaveTypes.slice(0, 6).map((type) => (
              <TabsTrigger 
                key={type._id} 
                value={type._id} 
                className=""
              >
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: type.colorTag || '#3b82f6' }}
                />
                {type.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {filteredLeaveTypes.map((type) => (
            <TabsContent key={type._id} value={type._id}>
              <Card>
                {/* Exact Header Design: Color box with icon/dot */}
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${type.colorTag || '#3b82f6'}20` }}
                    >
                      <div 
                        className="h-6 w-6 rounded-full" 
                        style={{ backgroundColor: type.colorTag || '#3b82f6' }}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{type.name}</h2>
                      <p className="text-sm text-gray-600 font-normal">{type.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Advanced Toggles */}
                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex gap-4">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Use working days</p>
                          <p className="text-sm text-gray-500">Day count of leave will be based on employee's office schedule</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={type.useWorkingDays ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}>
                          {type.useWorkingDays ? "ENABLED" : "DISABLED"}
                        </Badge>
                        <Switch checked={type.useWorkingDays || false} onCheckedChange={() => handleToggle(type._id, "useWorkingDays", type.useWorkingDays)} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex gap-4">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Allow booking half day</p>
                          <p className="text-sm text-gray-500">Allow employees to book half day leave</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={type.allowHalfDay ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}>
                          {type.allowHalfDay ? "ENABLED" : "DISABLED"}
                        </Badge>
                        <Switch checked={type.allowHalfDay || false} onCheckedChange={() => handleToggle(type._id, "allowHalfDay", type.allowHalfDay)} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-none">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex gap-4">
                        <History className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Allow employee to apply leave in the past</p>
                          <p className="text-sm text-gray-500">Usually applies to leave types such as medical leave</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={type.allowPastDates ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}>
                          {type.allowPastDates ? "ENABLED" : "DISABLED"}
                        </Badge>
                        <Switch checked={type.allowPastDates || false} onCheckedChange={() => handleToggle(type._id, "allowPastDates", type.allowPastDates)} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${type.allowModifyPast ? 'border-red-200 bg-red-50/10' : 'border-slate-200'} shadow-none`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex gap-4">
                        <Edit3 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800">Allow employee to modify leave in the past</p>
                          <p className="text-sm text-gray-500 max-w-2xl">Allow an approved leave that has passed to be modified (triggers approval workflow)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={type.allowModifyPast ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}>
                          {type.allowModifyPast ? "ENABLED" : "DISABLED"}
                        </Badge>
                        <Switch checked={type.allowModifyPast || false} onCheckedChange={() => handleToggle(type._id, "allowModifyPast", type.allowModifyPast)} />
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="border-dashed border-2 p-20 text-center"><SearchX className="mx-auto h-12 w-12 text-gray-300 mb-2"/><p>No matching leave types found.</p></Card>
      )}

      {/* Info Card: Exact Purple Design */}
      <Card className="border-purple-200 bg-purple-50 shadow-none">
        <CardContent className="p-6">
          <h3 className="font-semibold text-purple-900 mb-4">About Leave Advance Settings</h3>
          <ul className="space-y-3 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <span><strong>Use Working Days:</strong> Excludes weekends when calculating leave duration</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <span><strong>Allow Half Day:</strong> Enables employees to book 0.5 day leaves</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <span><strong>Allow Past Leave:</strong> Permits applying for leaves on past dates (useful for sick leave)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
              <span><strong>Allow Modify Past Leave:</strong> Allows editing already approved past leaves (requires re-approval)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <CreateLeaveSettingsDialog 
      open={isCreateOpen} 
      setOpen={setIsCreateOpen} 
    />
    </div>
  );
};

export default LeaveSettingsPage;