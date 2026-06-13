"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "@/features/post/hooks/use-posts";
import { getErrorMessage } from "./stream-post-card";

export function ComposeBox({ streamId }: { streamId: string }) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  function handleMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function removeMedia() {
    setMediaFile(null);
    setMediaPreview(null);
  }

  async function handleSubmit() {
    if (!content.trim() && !mediaFile) return;
    try {
      await createPost.mutateAsync({
        streamId,
        type: "text",
        content: content.trim(),
        media: mediaFile ?? undefined,
      });
      setContent("");
      removeMedia();
      toast.success("Post published");
    } catch (err: unknown) {
      toast.error("Failed to create post", {
        description: getErrorMessage(err),
      });
    }
  }

  return (
    <div className="px-4 py-3 border-b border-border-primary">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening in this stream?"
        rows={3}
        className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary resize-none focus:outline-none"
      />
      {mediaPreview && (
        <div className="relative mt-2 inline-block">
          <img
            src={mediaPreview}
            alt="Attachment"
            className="max-h-40 rounded-lg border border-border-primary"
          />
          <button
            onClick={removeMedia}
            className="absolute -top-2 -right-2 bg-danger text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-text-tertiary hover:text-accent transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMedia}
        />
        <button
          onClick={handleSubmit}
          disabled={createPost.isPending || (!content.trim() && !mediaFile)}
          className="bg-accent text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {createPost.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}
