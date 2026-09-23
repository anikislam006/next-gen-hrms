import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeamMembersSection({ teamMembers }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teamMembers.map((member) => (
        <Card
          key={member.id}
          className={`border-l-4 ${
            member.has_employee_record
              ? "border-purple-500"
              : "border-gray-400 opacity-80"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              {member.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
