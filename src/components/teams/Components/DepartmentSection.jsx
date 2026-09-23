import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function DepartmentSection({ departments }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {departments.map((dept) => (
        <Card key={dept.id} className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-blue-500" />
              {dept.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {dept.description || "No description provided."}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
