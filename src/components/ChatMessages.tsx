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
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 border-2 border-accent shadow-accent">
                  <AvatarImage src={lawyerAvatar} alt="AI Lawyer" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Scale className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-card border border-border rounded-lg p-5 shadow-legal">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">AI Legal Counsel</span>
                      <Badge variant="outline" className="text-xs border-accent text-accent">
                        Advocate
                      </Badge>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.legalReferences && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                          <BookOpen className="h-4 w-4" />
                          Legal References
                        </div>
                        {message.legalReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="bg-accent/5 border-l-4 border-accent p-3 rounded-r-lg"
                          >
                            <p className="font-semibold text-sm text-accent-foreground">
                              {ref.section}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{ref.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 justify-end">
                <div className="flex-1 flex flex-col items-end">
                  <div className="bg-primary text-primary-foreground rounded-lg p-5 shadow-legal max-w-2xl">
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-muted">
                    <User className="h-6 w-6" />
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
