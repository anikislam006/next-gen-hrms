import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";


const StateCardSections = ({employmentTypes, employmentType, employmentCounts, setEmploymentType}) => {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {employmentTypes.map((item, index) => {
        const Icon = item.icon;
        const count =
          item.label === "Total"
            ? Object.values(employmentCounts).reduce((acc, val) => acc + val, 0)
            : employmentCounts[item.label] || 0;

        const isActive = employmentType === item.label;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEmploymentType(item.label);
              setPage(1);
            }}
            className="cursor-pointer"
          >
            <Card
              className={`shadow-md hover:shadow-xl transition-all rounded-2xl border ${
                isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isActive ? "text-blue-700" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isActive ? "text-blue-700" : item.textColor
                      }`}
                    >
                      {count}
                    </p>
                  </div>
                  <Icon
                    className={`w-8 h-8 ${
                      isActive ? "text-blue-600" : item.color
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StateCardSections;
