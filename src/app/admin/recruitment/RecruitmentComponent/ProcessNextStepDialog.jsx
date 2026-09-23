"use client";

import React, { useState } from 'react';
import AccessibleDialog from "@/components/ui/accessible-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

function RichTextEditor({ id, label, value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate({ editor }) { onChange({ target: { id, value: editor.getHTML() } }); },
    editorProps: { attributes: { class: "outline-none min-h-[150px] p-3" } },
    immediatelyRender: false,
  });
  if (!editor) return null;
  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={id} className="font-bold text-slate-700">{label}</Label>
      <div className="border rounded-xl focus-within:ring-2 ring-indigo-500/20 transition-all">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function ProcessNextStepDialog({ open, onClose, person, onUpdateStatus }) {
  const [formData, setFormData] = useState({
    notes: "",
    internalRating: "average",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would call your API to move the stage
    // For example: await onUpdateStatus(person._id, "Interview", formData);
    onClose();
  };

  return (
    <AccessibleDialog 
      open={open} 
      onOpenChange={onClose} 
      title="Move to Next Stage" 
      description={`Proceeding ${person?.fullName} to the next recruitment phase.`}
      size="DEFAULT"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Label className="font-bold text-slate-700">Internal Rating</Label>
          <div className="flex gap-2">
            {['poor', 'average', 'good', 'excellent'].map((level) => (
              <Button 
                key={level}
                type="button"
                variant={formData.internalRating === level ? "default" : "outline"}
                className="capitalize flex-1"
                onClick={() => setFormData(prev => ({...prev, internalRating: level}))}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <RichTextEditor 
          id="notes" 
          label="Internal Evaluation Notes" 
          value={formData.notes} 
          onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} 
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            Confirm & Proceed
          </Button>
        </div>
      </form>
    </AccessibleDialog>
  );
}