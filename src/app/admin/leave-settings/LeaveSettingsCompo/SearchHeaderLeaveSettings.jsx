import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const SearchHeaderLeaveSettings = ({ searchTerm, setSearchTerm }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          {/* Search Icon */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {/* Input field exactly as styled in your target design */}
          <Input
            placeholder="Search leave types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10" // Added height and padding-left for the icon
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchHeaderLeaveSettings;