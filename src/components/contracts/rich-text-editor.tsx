"use client";

import { Textarea } from "@/components/ui/textarea";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2">
        Use Markdown for formatting. Variables: {"{{client_name}}"}, {"{{business_name}}"}, {"{{date}}"}, {"{{total_amount}}"}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={25}
        className="font-mono text-sm"
        placeholder="Enter your contract content using Markdown..."
      />
    </div>
  );
}
