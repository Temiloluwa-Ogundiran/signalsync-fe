import { AiChatPage } from "@/features/ai/components/ai-chat-page";

export const metadata = { title: "SignalSync AI" };

export default function AiPage() {
  return (
    <div className="h-full min-w-0 overflow-x-hidden">
      <AiChatPage />
    </div>
  );
}
