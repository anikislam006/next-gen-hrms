import React from 'react';
import { motion } from "framer-motion";

const PayrollHeader = () => {
    return (
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-1">Manage salaries, structures, and payroll processing</p>
        </div>
    
      </motion.div>
    );
};

export default PayrollHeader;