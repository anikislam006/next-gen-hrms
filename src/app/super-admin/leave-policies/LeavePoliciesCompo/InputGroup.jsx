import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputGroup({
  label,
  value,
  onChange,
  type = "text"
}) {
  return (
    <div className="space-y-2">

      <Label>{label}</Label>

      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

    </div>
  );
}