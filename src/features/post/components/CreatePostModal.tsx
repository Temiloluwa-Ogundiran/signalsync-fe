"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Loader2,
  Send,
  ChevronDown,
  Check,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { useCreatePost, useUploadPostMedia } from "../hooks/use-posts";
import { useStreamStore } from "@/features/stream/store";
import { useMyStreams } from "@/features/stream/hooks/use-streams";
import type { Stream } from "@/features/stream/api/stream.api";
import type { MediaUploadResult } from "../api/post.api";

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (msg) return msg;
  }
  return "Something went wrong.";
}

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { activeStream } = useStreamStore();
  const { data: myStreams } = useMyStreams();
  const createPost = useCreatePost();
  const uploadMedia = useUploadPostMedia();

  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [streamPickerOpen, setStreamPickerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Default to activeStream when modal opens
  useEffect(() => {
    if (open && activeStream && !selectedStream) {
      setSelectedStream(activeStream);
    }
  }, [open, activeStream, selectedStream]);

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setStreamPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!open) return null;

  const targetStream = selectedStream || activeStream;

  function reset() {
    setContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setUploadedMedia(null);
    setUploading(false);
    setSelectedStream(null);
    setStreamPickerOpen(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));

    // Pre-upload immediately
    setUploading(true);
    try {
      const result = await uploadMedia.mutateAsync(file);
      setUploadedMedia(result);
    } catch (err: unknown) {
      toast.error("Media upload failed", {
        description: getErrorMessage(err),
      });
      setMediaFile(null);
      setMediaPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeMedia() {
    setMediaFile(null);
    setMediaPreview(null);
    setUploadedMedia(null);
  }

  async function handleSubmit() {
    if (!targetStream) {
      toast.error("No stream selected", {
        description: "Please select a stream first.",
      });
      return;
    }
    if (!content.trim() && !mediaFile) return;

    // Wait for upload to finish if still in progress
    if (mediaFile && !uploadedMedia && uploading) {
      toast.info("Please wait for the media to finish uploading.");
      return;
    }

    try {
      await createPost.mutateAsync({
        streamId: targetStream.id,
        type: "text",
        content: content.trim(),
        ...(uploadedMedia
          ? {
              mediaStoragePath: uploadedMedia.storage_path,
              mediaType: uploadedMedia.media_type,
              mediaMimeType: uploadedMedia.mime_type,
              mediaFilename: mediaFile?.name,
            }
          : {}),
      });
      toast.success("Post published!", {
        description: `Posted to "${targetStream.name}"`,
      });
      handleClose();
    } catch (err: unknown) {
      toast.error("Failed to create post", {
        description: getErrorMessage(err),
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg bg-modal-bg border border-border-primary rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80dvh] flex flex-col">
        {/* Accent strip */}
        <div className="h-1 w-full bg-linear-to-r from-accent via-blue-400 to-indigo-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-primary shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full bg-bg-tertiary hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-text-primary">New Post</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={
              createPost.isPending ||
              uploading ||
              (!content.trim() && !mediaFile)
            }
            className="bg-accent text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center gap-1.5"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Active stream indicator — clickable switcher */}
          {targetStream ? (
            <div className="relative mb-3" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setStreamPickerOpen((p) => !p)}
                className="flex items-center gap-2 hover:bg-bg-tertiary rounded-lg px-2 py-1.5 -ml-2 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center overflow-hidden">
                  {targetStream.avatar_url ? (
                    <img
                      src={targetStream.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-accent">
                      {targetStream.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-text-tertiary">
                  Posting to{" "}
                  <span className="text-text-primary font-bold">
                    {targetStream.name}
                  </span>
                </span>
                <ChevronDown className="h-3 w-3 text-text-tertiary" />
              </button>

              {streamPickerOpen && myStreams && myStreams.length > 0 && (
                <div className="absolute left-0 top-full mt-1 z-10 w-64 bg-card-bg border border-border-primary rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  <div className="p-1">
                    {myStreams.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStream(s);
                          setStreamPickerOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                          targetStream.id === s.id
                            ? "bg-accent-light text-accent font-medium"
                            : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        }`}
                      >
                        <div className="w-5 h-5 rounded bg-border-primary flex items-center justify-center overflow-hidden shrink-0">
                          {s.avatar_url ? (
                            <img
                              src={s.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Radio className="w-3 h-3 text-text-tertiary" />
                          )}
                        </div>
                        <span className="truncate flex-1 text-left">
                          {s.name}
                        </span>
                        {targetStream.id === s.id && (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-3 px-3 py-2 bg-warning-light rounded-lg text-xs text-warning font-medium">
              No stream selected. Choose one from the sidebar.
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={5}
            autoFocus
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary resize-none focus:outline-none leading-relaxed"
          />

          {mediaPreview && (
            <div className="relative mt-2 inline-block">
              <img
                src={mediaPreview}
                alt="Attachment"
                className="max-h-48 rounded-xl border border-border-primary"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
              <button
                onClick={removeMedia}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-t border-border-primary flex items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-9 w-9 rounded-full hover:bg-accent-light flex items-center justify-center text-accent transition-colors"
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
        </div>
      </div>
    </div>
  );
}
