import { Switch } from "@/components/ui/switch";

export default function ToggleCard({ title, checked, onChange }) {
  return (
    <div className="flex justify-between items-center border p-4 rounded-xl">

      <p className="font-medium">{title}</p>

      <Switch
        checked={checked}
        onCheckedChange={onChange}
      />

    </div>
  );
}