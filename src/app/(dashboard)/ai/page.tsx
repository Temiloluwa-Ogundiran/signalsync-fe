import { AiChatPage } from "@/features/ai/components/ai-chat-page";

export const metadata = { title: "Partna AI" };

export default function AiPage() {
  return (
    <div className="h-full">
      <AiChatPage />
    </div>
  );
}
