import { ChevronDown } from "lucide-react";

export default function Section({ icon, title, children, isOpen, onToggle }) {
  return (
    <div className="border rounded-xl bg-white">

      <div
        onClick={onToggle}
        className="flex justify-between items-center p-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>

        <ChevronDown className={isOpen ? "rotate-180" : ""} />
      </div>

      {isOpen && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}

    </div>
  );
}