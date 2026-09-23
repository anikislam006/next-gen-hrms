import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SynchronizedSection({ teamMembers }) {
  const synced = teamMembers.filter((t) => t.has_employee_record);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {synced.map((member) => (
        <Card key={member.id} className="border-l-4 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              {member.name}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
