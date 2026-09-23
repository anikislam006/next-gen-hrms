'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({ onNewDepartment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Hierarchical Team Management</h1>
          </div>
          <p className="text-blue-100">
            Two assignment types: Direct reports to department OR team members
          </p>
          <p className="text-sm text-blue-100 mt-1 opacity-80">
            Logged in as: Admin
          </p>
        </div>
        <Button
          onClick={onNewDepartment}
          variant="secondary"
          size="lg"
          className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <Building2 className="h-5 w-5" />
          New Department
        </Button>
      </div>
    </motion.div>
  );
}
