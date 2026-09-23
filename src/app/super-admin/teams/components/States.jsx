"use client";

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Crown, Building2, Target, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

const States = () => {
  const router = useRouter();

  const handleClick = (tabName) => {
    router.push(`/super-admin/teams?tab=${tabName}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card
        className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer"
        onClick={() => handleClick("departments")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Departments</p>
              <p className="text-2xl font-bold text-blue-900">5</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card
        className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer"
        onClick={() => handleClick("teams")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Teams</p>
              <p className="text-2xl font-bold text-green-900">7</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card
        className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer"
        onClick={() => handleClick("deptHeads")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Dept Heads</p>
              <p className="text-2xl font-bold text-purple-900">8</p>
            </div>
            <Crown className="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card
        className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer"
        onClick={() => handleClick("directReports")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">
                Direct Reports
              </p>
              <p className="text-2xl font-bold text-orange-900">9</p>
            </div>
            <UserCheck className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default States;
