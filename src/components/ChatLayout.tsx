import { useState } from "react";
import { Scale, BookOpen, Gavel, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./ChatSidebar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  legalReferences?: Array<{ section: string; description: string }>;
}

const ChatLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Namaste! I am your AI Legal Assistant, here to help you navigate the Indian legal system. I can assist you with understanding laws, rights, procedures, and legal documentation. How may I assist you today?",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: "ai",
        content: "I understand your query. Let me provide you with detailed legal guidance on this matter. According to the relevant sections of Indian law...",
        timestamp: new Date(),
        legalReferences: [
          { section: "Section 420 IPC", description: "Cheating and dishonestly inducing delivery of property" },
          { section: "Article 21", description: "Protection of life and personal liberty" }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 ease-in-out relative z-10`}
      >
        {isSidebarOpen && <ChatSidebar />}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Clean Professional Header */}
        <header className="h-16 bg-primary border-b border-primary-dark flex items-center justify-between px-8 shadow-elevated">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-primary-light text-primary-foreground"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-4">
              <Scale className="h-7 w-7 text-accent" />
              <div>
                <h1 className="text-lg font-bold text-primary-foreground">AI Legal Counsel</h1>
                <p className="text-xs text-primary-foreground/80">Indian Legal Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light rounded-lg">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-xs text-primary-foreground font-medium">Secure</span>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ChatMessages messages={messages} />

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatLayout;
