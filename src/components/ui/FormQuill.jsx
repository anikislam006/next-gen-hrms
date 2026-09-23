"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function FormQuill({ id, label, value, onChange }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Render nothing on SSR

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <ReactQuill
        value={value}
        onChange={(content) => onChange(id, content)}
        theme="snow"
        className="h-40"
      />
    </div>
  );
}