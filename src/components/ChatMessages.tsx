import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scale, User, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import lawyerAvatar from "@/assets/lawyer-avatar.png";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  legalReferences?: Array<{ section: string; description: string }>;
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`animate-fade-in ${
              message.type === "user" ? "animate-slide-in-right" : "animate-slide-in-left"
            }`}
          >
            {message.type === "ai" ? (
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-border shadow-sm">
                  <AvatarImage src={lawyerAvatar} alt="AI Lawyer" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    <Scale className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">
                        Legal
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.legalReferences && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5" />
                          References
                        </div>
                        {message.legalReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="bg-accent/5 border-l-2 border-accent p-3 rounded-r-lg"
                          >
                            <p className="text-xs font-semibold text-foreground">
                              {ref.section}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{ref.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <div className="flex-1 flex flex-col items-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-sm max-w-2xl">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1.5">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <Avatar className="h-10 w-10 ring-1 ring-border">
                  <AvatarFallback className="bg-muted text-sm">
                    <User className="h-5 w-5 text-foreground" />
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
