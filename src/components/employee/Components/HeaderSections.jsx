import React from 'react';
import { motion } from "framer-motion";
import { Users } from 'lucide-react';

const HeaderSections = ({ totalEmployees = 0 }) => {
    return (
         <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8" />
              <h1 className="text-3xl font-bold">
                Employee Information Management
              </h1>
            </div>
            <p className="text-purple-100">
              Comprehensive employee profile and document management system
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <div className="text-purple-200 text-sm">All Time Total</div>
          </div>
        </div>
      </motion.div>
    );
};

export default HeaderSections;