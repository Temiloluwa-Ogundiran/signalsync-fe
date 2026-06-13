"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Settings,
  X,
  Send,
  Pin,
  Hand,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
  isCoHost?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isCameraOn?: boolean;
}

const PARTICIPANTS: Participant[] = [
  {
    id: "1",
    name: "Alex Trader",
    avatar: "https://picsum.photos/100/100?random=1",
    isHost: true,
    isSpeaking: true,
    isCameraOn: true,
  },
  {
    id: "2",
    name: "Sarah Snipe",
    avatar: "https://picsum.photos/100/100?random=2",
    isCoHost: true,
    isMuted: true,
    isCameraOn: true,
  },
  {
    id: "3",
    name: "Crypto King",
    avatar: "https://picsum.photos/100/100?random=3",
    isMuted: true,
  },
  {
    id: "4",
    name: "John Doe",
    avatar: "https://picsum.photos/100/100?random=4",
    isMuted: true,
  },
  {
    id: "5",
    name: "Jane Smith",
    avatar: "https://picsum.photos/100/100?random=5",
    isMuted: true,
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    user: "Sarah Snipe",
    text: "Gold is testing the 2030 level.",
    time: "10:42 AM",
  },
  {
    id: 2,
    user: "Crypto King",
    text: "Watching BTC for a breakout here.",
    time: "10:43 AM",
  },
  { id: 3, user: "John Doe", text: "Can you look at US30?", time: "10:44 AM" },
];

export function LiveSpacePage() {
  const router = useRouter();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState<
    "chat" | "people" | null
  >("chat");
  const [messages] = useState(INITIAL_MESSAGES);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const togglePanel = (panel: "chat" | "people") => {
    setActiveRightPanel(activeRightPanel === panel ? null : panel);
    setMobilePanelOpen(true);
  };

  const handleLeave = () => router.push("/spaces");

  return (
    <div className="fixed inset-0 bg-bg-primary text-text-primary flex flex-col z-50 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6 bg-bg-primary border-b border-border-primary flex-shrink-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-bg-tertiary px-3 py-1.5 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
              Live
            </span>
            <span className="text-text-tertiary text-xs">|</span>
            <span className="text-xs font-bold text-text-primary">
              01:42:15
            </span>
          </div>
          <h1 className="text-sm md:text-base font-bold truncate max-w-[150px] md:max-w-none">
            NY Session Live Trading
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center text-text-tertiary bg-bg-tertiary px-3 py-1.5 rounded-lg text-xs font-bold">
            <Users className="h-4 w-4 mr-2" /> 154
          </div>
          <button
            onClick={handleLeave}
            className="bg-danger hover:bg-danger/80 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
          >
            End Space
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Stage */}
        <div className="flex-1 bg-bg-secondary p-4 flex flex-col items-center justify-center relative overflow-hidden">
          {isScreenSharing ? (
            <div className="w-full h-full bg-bg-tertiary rounded-xl flex items-center justify-center border border-border-primary relative">
              <div className="text-text-tertiary flex flex-col items-center">
                <Monitor className="h-16 w-16 mb-4 opacity-50" />
                <p className="font-medium">You are sharing your screen</p>
              </div>
              <div className="absolute bottom-4 right-4 w-48 h-32 bg-bg-tertiary rounded-lg shadow-2xl border border-border-primary overflow-hidden">
                <img
                  src={PARTICIPANTS[0].avatar}
                  className="w-full h-full object-cover"
                  alt="Host"
                />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 h-full md:h-auto md:max-h-full aspect-video">
              <div className="bg-bg-tertiary rounded-2xl relative overflow-hidden border-2 border-accent shadow-lg shadow-accent/10 h-full">
                <img
                  src={PARTICIPANTS[0].avatar}
                  className="w-full h-full object-cover opacity-90"
                  alt="Host"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <div className="bg-accent p-1 rounded-full">
                    <Mic className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    Alex Trader (Host)
                  </span>
                </div>
              </div>
              <div className="bg-bg-tertiary rounded-2xl relative overflow-hidden border border-border-primary h-full">
                <img
                  src={PARTICIPANTS[1].avatar}
                  className="w-full h-full object-cover opacity-90"
                  alt="CoHost"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <div className="bg-danger p-1 rounded-full">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    Sarah Snipe
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* Audience overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-bg-secondary bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-tertiary"
              >
                {i > 3 ? (
                  "+150"
                ) : (
                  <img
                    src={`https://picsum.photos/50/50?random=${10 + i}`}
                    className="w-full h-full rounded-full"
                    alt="User"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        {activeRightPanel && (
          <div
            className={`${mobilePanelOpen ? "fixed inset-0 z-50" : "hidden md:flex"} w-full md:w-80 bg-bg-primary border-l border-border-primary flex-col`}
          >
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border-primary bg-bg-primary">
              <h2 className="font-bold text-lg capitalize">
                {activeRightPanel}
              </h2>
              <button
                onClick={() => {
                  setActiveRightPanel(null);
                  setMobilePanelOpen(false);
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="hidden md:flex border-b border-border-primary">
              {(["chat", "people"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveRightPanel(tab)}
                  className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors ${activeRightPanel === tab ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-primary"}`}
                >
                  {tab === "people" ? "People (154)" : "Chat"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeRightPanel === "chat" && (
                <>
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 border border-border-primary mb-4">
                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase mb-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </div>
                    <p className="text-sm text-text-secondary">
                      Welcome to the NY Session! Please keep mics muted unless
                      called upon.
                    </p>
                  </div>
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-bold text-sm text-text-secondary">
                          {msg.user}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {msg.time}
                        </span>
                      </div>
                      <p className="text-sm text-text-tertiary leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </>
              )}
              {activeRightPanel === "people" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-text-tertiary uppercase mb-3">
                      Hosts & Speakers
                    </h3>
                    {PARTICIPANTS.filter(
                      (p) => p.isHost || p.isCoHost || p.isSpeaking,
                    ).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between mb-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            className="w-8 h-8 rounded-full"
                            alt={p.name}
                          />
                          <div className="text-sm font-bold text-text-secondary flex items-center gap-2">
                            {p.name}
                            {p.isHost && (
                              <span className="bg-accent text-[10px] px-1.5 rounded text-white">
                                HOST
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="text-text-tertiary hover:text-text-primary">
                          <MicOff className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-tertiary uppercase mb-3">
                      Audience
                    </h3>
                    {PARTICIPANTS.filter(
                      (p) => !p.isHost && !p.isCoHost && !p.isSpeaking,
                    ).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-tertiary">
                          {p.name[0]}
                        </div>
                        <div className="text-sm font-bold text-text-tertiary">
                          {p.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {activeRightPanel === "chat" && (
              <div className="p-4 border-t border-border-primary bg-bg-primary">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Say something..."
                    className="w-full bg-bg-tertiary border-none rounded-full pl-4 pr-10 py-2.5 text-sm text-text-primary focus:ring-2 focus:ring-accent outline-none placeholder:text-text-tertiary"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-accent hover:text-accent-hover">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-20 bg-bg-primary border-t border-border-primary flex items-center justify-center relative px-4 z-20">
        <div className="hidden md:flex absolute left-6 items-center space-x-4">
          <button className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-lg bg-bg-tertiary group-hover:bg-border-primary transition-colors">
              <Settings className="h-5 w-5 text-text-tertiary" />
            </div>
            <span className="text-[10px] text-text-tertiary font-medium">
              Settings
            </span>
          </button>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 md:p-4 rounded-full transition-all ${isMicOn ? "bg-bg-tertiary text-text-primary hover:bg-border-primary" : "bg-danger text-white hover:bg-danger/80"}`}
          >
            {isMicOn ? (
              <Mic className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <MicOff className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-3 md:p-4 rounded-full transition-all ${isCameraOn ? "bg-bg-tertiary text-text-primary hover:bg-border-primary" : "bg-danger text-white hover:bg-danger/80"}`}
          >
            {isCameraOn ? (
              <Video className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <VideoOff className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 md:p-4 rounded-full transition-all ${isScreenSharing ? "bg-success text-white" : "bg-bg-tertiary text-text-primary hover:bg-border-primary"}`}
          >
            {isScreenSharing ? (
              <MonitorOff className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <Monitor className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
          <div className="h-8 w-px bg-border-primary mx-2 hidden md:block" />
          <button className="p-3 md:p-4 rounded-full bg-bg-tertiary text-text-primary hover:bg-border-primary transition-all relative">
            <Hand className="h-5 w-5 md:h-6 md:w-6" />
            <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </div>
        <div className="absolute right-4 md:right-6 flex items-center gap-3">
          <button
            onClick={() => togglePanel("chat")}
            className={`p-2 md:p-3 rounded-lg transition-colors ${activeRightPanel === "chat" ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"}`}
          >
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={() => togglePanel("people")}
            className={`p-2 md:p-3 rounded-lg transition-colors ${activeRightPanel === "people" ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary"}`}
          >
            <Users className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
