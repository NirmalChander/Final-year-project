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
            className="mb-1 hover:bg-muted rounded-lg"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your legal question..."
              className="min-h-[48px] max-h-[160px] resize-none pr-12 bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm transition-all"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mb-1 hover:bg-muted rounded-lg"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="mb-1 bg-accent hover:bg-accent-light text-accent-foreground disabled:opacity-50 rounded-lg h-10 w-10 p-0 transition-all shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          For general legal information only. Consult a qualified lawyer for advice.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
