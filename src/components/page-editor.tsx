"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { PageEditorToolbar } from "@/components/page-editor-toolbar";

export function PageEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rounded-md max-w-full h-auto" },
      }),
      Placeholder.configure({ placeholder: "Write the lesson..." }),
    ],
    content: initialHtml || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none px-4 py-3 min-h-[320px]",
      },
    },
  });

  return (
    <div className="rounded-lg border bg-background">
      <PageEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
