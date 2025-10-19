import { useState, useEffect } from "react";
import { BookOpen, Gavel, Shield, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { geminiService, GeminiResponse } from "@/lib/gemini";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  image?: {
    file: File;
    url: string;
    name: string;
  };
  legalReferences?: Array<{ section: string; description: string }>;
  actionSteps?: Array<{ step: string; description: string }>;
  contactInfo?: Array<{ department: string; helpline: string; type: 'phone' | 'email' | 'website'; description?: string }>;
}

const ChatLayout = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    currentSession,
    currentSessionId,
    createNewSession,
    addMessageToCurrentSession,
    switchToSession,
    isLoading: chatLoading
  } = useChatHistory();

  // Auto-minimize sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMinimized(true);
    }
  }, [isMobile]);

  const handleSendMessage = async (content: string, image?: File) => {
    if (!currentSession || isLoading) return;

    setIsLoading(true);

    // Prepare chat history for Gemini API
    // Filter out the initial AI welcome message and only include actual conversation
    const conversationHistory = currentSession.messages
      .filter(msg => msg.type === 'user' || msg.type === 'ai')
      .slice(1) // Skip the initial AI welcome message
      .map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'model' as const,
        content: msg.content
      }));

    // Add user message
    addMessageToCurrentSession({
      type: "user",
      content,
      image: image ? {
        file: image,
        url: URL.createObjectURL(image),
        name: image.name
      } : undefined
    });

    // Get response from Gemini
    const response: GeminiResponse = await geminiService.generateLegalResponse(content, conversationHistory, image);

    // Add AI response
    addMessageToCurrentSession({
      type: "ai",
      content: response.content,
      legalReferences: response.legalReferences,
      actionSteps: response.actionSteps,
      contactInfo: response.contactInfo
    });

    setIsLoading(false);
  };

  const handleNewChat = () => {
    createNewSession();
  };

  const handleSwitchChat = (sessionId: string) => {
    switchToSession(sessionId);
    // On mobile, close sidebar after selecting a conversation for better UX
    if (isMobile && !isMinimized) {
      setIsMinimized(true);
    }
  };

  const messages = currentSession?.messages || [];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--gradient-start) / 0.4) 0%, hsl(var(--gradient-middle) / 0.5) 40%, hsl(var(--gradient-middle) / 0.5) 60%, hsl(var(--gradient-end) / 0.4) 100%)' }}>
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out relative ${
          isMinimized ? "w-16" : "w-64 md:w-72"
        } ${!isMinimized ? "md:relative absolute left-0 top-0 bottom-0 z-50 md:z-auto" : ""}`}
      >
        <ChatSidebar
          minimized={isMinimized}
          onToggle={() => setIsMinimized(!isMinimized)}
          onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat}
          currentSessionId={currentSessionId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Modern Minimal Header */}
        <header className="h-12 md:h-14 bg-card/10 backdrop-blur-lg border-b border-border/30 shadow-xl flex items-center justify-between px-3 md:px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div>
                <h1 className="text-sm md:text-base font-semibold text-foreground">AI Legal Assistant</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-sm">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages messages={messages} isLoading={isLoading} user={user} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
