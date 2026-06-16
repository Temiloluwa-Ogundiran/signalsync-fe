"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DayNoteEditorProps {
  /** Initial HTML content. */
  content?: string;
  /** Called on every change with the current HTML (save wiring is a follow-up). */
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function DayNoteEditor({
  content = "",
  onChange,
  placeholder = "Write your reflections for the day…",
}: DayNoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    // v3 defaults this to false → the toolbar's isActive() states wouldn't
    // update on cursor moves / mark toggles. Re-enable so the toolbar tracks.
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[260px] w-full px-4 py-3 text-sm leading-relaxed text-text-primary focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="min-h-[320px] animate-pulse rounded-xl bg-bg-tertiary" />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-subtle">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-hairline px-2 py-1.5">
      <Btn
        icon={Bold}
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Btn
        icon={Italic}
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Btn
        icon={Underline}
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Btn
        icon={Strikethrough}
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <Divider />

      <Btn
        icon={Heading1}
        label="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      />
      <Btn
        icon={Heading2}
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />

      <Divider />

      <Btn
        icon={List}
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <Btn
        icon={ListOrdered}
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Btn
        icon={Quote}
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <Btn
        icon={Code}
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <Btn
        icon={Link2}
        label="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      />

      <Divider />

      <Btn
        icon={Undo2}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      />
      <Btn
        icon={Redo2}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

function Btn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors cursor-pointer",
        active
          ? "bg-surface-subtle text-text-primary"
          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-hairline" />;
}
