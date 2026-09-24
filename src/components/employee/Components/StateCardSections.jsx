import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";


const StateCardSections = ({employmentTypes, employmentType, employmentCounts, totalEmployees = 0, setEmploymentType, setPage}) => {

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {employmentTypes.map((item, index) => {
        const Icon = item.icon;
        // "Total" is the actual employee count, not a sum of the buckets below —
        // those buckets mix two different dimensions (status vs. employment
        // type), so a single employee can count in more than one of them and
        // summing them overstated the total.
        const count =
          item.label === "Total" ? totalEmployees : employmentCounts[item.label] || 0;

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
              if (setPage) setPage(1);
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
                  <div className="flex-1 min-w-0">
                    {/* Fixed min-height reserves room for a 2-line label (e.g.
                        "Probation & Confirmation") so every card's number
                        sits at the same vertical position, whether its own
                        label wraps to one line or two. */}
                    <p
                      className={`text-sm font-medium min-h-[2.5rem] leading-tight flex items-end ${
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
                    className={`w-8 h-8 shrink-0 ${
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
