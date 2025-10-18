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
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-lg">
                  <AvatarImage src={lawyerAvatar} alt="AI Lawyer" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    <Scale className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-5 shadow-glass">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-foreground">AI Legal Counsel</span>
                      <Badge className="text-xs bg-gradient-to-r from-primary to-accent text-white border-0">
                        Advocate
                      </Badge>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.legalReferences && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <BookOpen className="h-4 w-4" />
                          Legal References
                        </div>
                        {message.legalReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary p-4 rounded-r-xl backdrop-blur-sm"
                          >
                            <p className="font-semibold text-sm text-primary">
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
                  <div className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl p-5 shadow-glow max-w-2xl backdrop-blur-xl">
                    <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-muted to-secondary">
                    <User className="h-6 w-6 text-foreground" />
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
