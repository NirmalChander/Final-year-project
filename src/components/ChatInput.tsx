import { useState } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="mb-2 hover:bg-muted"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your legal question here..."
              className="min-h-[60px] max-h-[200px] resize-none pr-12 bg-background border-border focus:border-accent focus:ring-accent"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-2 hover:bg-muted"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="mb-2 bg-accent hover:bg-accent-glow text-accent-foreground shadow-accent disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This AI provides general legal information. Consult a qualified lawyer for specific legal advice.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
