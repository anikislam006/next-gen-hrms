"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Shield, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ComplianceCenter({ currentUser, demoMode = true }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Compliance Center</h1>
        </div>
        <p className="text-gray-300">Manage regulatory compliance and documentation</p>
        {demoMode && (
          <Badge className="bg-amber-500/20 text-amber-100 border-amber-300/30 mt-2">
            🎭 Demo Mode Active
          </Badge>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <FileCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Document Management</h3>
            <p className="text-gray-600">Manage compliance documents and certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Audit Trails</h3>
            <p className="text-gray-600">Track and monitor compliance activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Compliance Status</h3>
            <p className="text-gray-600">Monitor regulatory compliance status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Page = () => {
  return (
    <div className="p-6">
      <ComplianceCenter demoMode={true} />
    </div>
  );
};

export default Page;