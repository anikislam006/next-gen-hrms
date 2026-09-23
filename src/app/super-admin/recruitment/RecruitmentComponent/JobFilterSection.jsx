"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

const JobFilterSection = ({ filterValues, onFilterChange, onSearch, onClear }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search Input - matches your example structure */}
           <Input
              name="title"
              placeholder="Search by ID, Name, Email or Phone..."
              value={filterValues.title}
              onChange={onFilterChange}
             
            />
          {/* Status Select - matches your example structure */}
          <Select 
            value={filterValues.status} 
            onValueChange={(value) => onFilterChange({ target: { name: 'status', value } })}
           
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={onSearch}
              className="px-6"
            >
              Filter
            </Button>
            <Button 
              variant="outline"
              onClick={onClear}
              className="px-3 text-gray-500"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobFilterSection;