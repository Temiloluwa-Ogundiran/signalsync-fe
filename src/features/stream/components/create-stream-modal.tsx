"use client";

import { useState, useRef } from "react";
import {
  X,
  Globe,
  Lock,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useCreateStream, useUploadImage } from "../hooks/use-streams";
import { toast } from "sonner";

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (msg) return msg;
  }
  return "Please check your inputs and try again.";
}

interface CreateStreamModalProps {
  open: boolean;
  onClose: () => void;
}

type Privacy = "public" | "private" | "paid";

const privacyOptions: {
  value: Privacy;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "public",
    label: "Public",
    icon: <Globe className="h-4 w-4" />,
    desc: "Anyone can find and follow this stream",
  },
  {
    value: "private",
    label: "Private",
    icon: <Lock className="h-4 w-4" />,
    desc: "Only approved members can join",
  },
  {
    value: "paid",
    label: "Paid",
    icon: <DollarSign className="h-4 w-4" />,
    desc: "Members pay a subscription to join",
  },
];

export function CreateStreamModal({ open, onClose }: CreateStreamModalProps) {
  const { mutateAsync: createStream, isPending } = useCreateStream();
  const uploadMutation = useUploadImage();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function reset() {
    setName("");
    setDescription("");
    setPrivacy("public");
    setTagInput("");
    setTags([]);
    setPrice("");
    setRequireApproval(false);
    setAvatarUrl(null);
    setBannerUrl(null);
    setAvatarPreview(null);
    setBannerPreview(null);
    setAvatarUploading(false);
    setBannerUploading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    uploadMutation
      .mutateAsync({ file, bucketType: "avatar" })
      .then((res) => {
        setAvatarUrl(res.url);
        setAvatarUploading(false);
      })
      .catch((err: unknown) => {
        toast.error("Avatar upload failed", {
          description: getErrorMessage(err),
        });
        setAvatarUploading(false);
        setAvatarPreview(null);
      });
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    setBannerUploading(true);
    uploadMutation
      .mutateAsync({ file, bucketType: "banner" })
      .then((res) => {
        setBannerUrl(res.url);
        setBannerUploading(false);
      })
      .catch((err: unknown) => {
        toast.error("Banner upload failed", {
          description: getErrorMessage(err),
        });
        setBannerUploading(false);
        setBannerPreview(null);
      });
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createStream({
        name: name.trim(),
        description: description.trim() || undefined,
        privacy,
        forum_enabled: true,
        tags: tags.length > 0 ? tags : null,
        price: privacy === "paid" && price ? Number(price) : null,
        require_join_approval: privacy === "private" ? requireApproval : false,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      toast.success("Stream created!", {
        description: `"${name.trim()}" is live.`,
      });
      handleClose();
    } catch (err: unknown) {
      toast.error("Failed to create stream", {
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-modal-bg border border-border-primary rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Decorative accent strip */}
        <div className="h-1 w-full bg-linear-to-r from-accent via-blue-400 to-indigo-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-primary shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Create Stream
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">
              Share your trades with the world
            </p>
          </div>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-full bg-bg-tertiary hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto scrollbar-thin flex-1"
        >
          <div className="px-6 py-5 space-y-5">
            {/* Banner + Avatar upload */}
            <div className="relative">
              {/* Banner */}
              <div
                onClick={() => bannerRef.current?.click()}
                className="h-28 rounded-xl bg-bg-tertiary border border-dashed border-border-secondary cursor-pointer overflow-hidden group flex items-center justify-center hover:bg-bg-hover transition-colors"
              >
                {bannerPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={bannerPreview}
                      alt="banner"
                      className="w-full h-full object-cover"
                    />
                    {bannerUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-text-tertiary group-hover:text-text-secondary transition-colors">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs font-medium">Add banner</span>
                  </div>
                )}
              </div>
              <input
                ref={bannerRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />

              {/* Avatar overlapping banner */}
              <div className="absolute -bottom-5 left-5">
                <div
                  onClick={() => avatarRef.current?.click()}
                  className="w-14 h-14 rounded-xl border-4 border-modal-bg bg-accent/20 cursor-pointer overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity shadow-md"
                >
                  {avatarPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-accent">
                      {name.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Spacer for avatar overflow */}
            <div className="h-5" />

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                Stream Name <span className="text-danger">*</span>
              </label>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Forex Scalping Signals"
                className="w-full bg-bg-input border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                Description
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this stream about?"
                className="w-full bg-bg-input border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                Privacy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {privacyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPrivacy(opt.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                      privacy === opt.value
                        ? "border-accent bg-accent-light text-accent"
                        : "border-border-primary bg-bg-input text-text-secondary hover:border-accent/40 hover:text-text-primary"
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                {privacyOptions.find((o) => o.value === privacy)?.desc}
              </p>
            </div>

            {/* Paid price */}
            {privacy === "paid" && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                  Monthly Price (USD) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="w-full bg-bg-input border border-border-primary rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Private: require approval toggle */}
            {privacy === "private" && (
              <div className="flex items-center justify-between py-3 px-4 bg-bg-tertiary rounded-xl border border-border-primary">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Require join approval
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Manually approve each member request
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireApproval(!requireApproval)}
                  aria-label="Toggle require join approval"
                  aria-pressed={requireApproval}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                    requireApproval ? "bg-accent" : "bg-border-secondary"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      requireApproval ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                Tags{" "}
                <span className="text-text-tertiary font-normal normal-case">
                  (up to 8)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g. forex, crypto…"
                  maxLength={30}
                  className="flex-1 bg-bg-input border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 8}
                  className="h-10 w-10 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 flex items-center justify-center text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 bg-accent-light text-accent text-xs font-bold rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-danger transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-primary bg-bg-primary/60 backdrop-blur-sm flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-border-primary text-text-secondary text-sm font-bold hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isPending || avatarUploading || bannerUploading || !name.trim()
              }
              className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Stream"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
