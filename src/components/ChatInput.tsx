import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedImage) {
      onSend(message, selectedImage || undefined);
      setMessage("");
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [message]);

  // Set initial height to single line
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '52px';
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="border-t border-border/30 bg-card/10 backdrop-blur-lg shadow-xl shadow-black/5 pt-2 px-3 sm:px-4 pb-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse opacity-50"></div>
      {/* Floating particles effect */}
      <div className="absolute top-2 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-4 right-1/3 w-1 h-1 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-3 left-1/2 w-0.5 h-0.5 bg-primary/50 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-t-lg"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Image preview */}
        {selectedImage && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-accent/10 rounded-lg border border-accent/20">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="h-8 w-8 object-cover rounded"
            />
            <span className="text-sm text-foreground truncate">{selectedImage.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="h-6 w-6 p-0 hover:bg-destructive/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttachmentClick}
            className="mb-1 bg-accent/20 hover:bg-accent/30 dark:bg-accent/15 dark:hover:bg-accent/25 backdrop-blur-md border border-accent/30 text-foreground rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/20 relative group"
          >
            <Paperclip className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </Button>
          <div className="flex-1 relative group">
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your legal question..."
              className="relative min-h-[52px] max-h-[160px] resize-none pr-14 pl-3 pt-3 pb-3 bg-card/90 backdrop-blur-sm border border-border/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all duration-200 placeholder:text-muted-foreground/70 shadow-xl shadow-black/5 focus:shadow-2xl focus:shadow-primary/10 group-hover:shadow-primary/5 overflow-hidden"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-accent/20 hover:bg-accent/30 dark:bg-accent/15 dark:hover:bg-accent/25 backdrop-blur-md border border-accent/30 text-foreground rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg relative group"
              >
                <Mic className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute inset-0 rounded-lg bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="mb-1 bg-primary/90 hover:bg-primary dark:bg-primary/80 dark:hover:bg-primary/90 backdrop-blur-md border border-primary/30 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-xl h-11 w-11 p-0 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105 disabled:hover:scale-100 disabled:shadow-md relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <Send className="h-4 w-4 relative z-10 group-hover:rotate-12 transition-transform duration-200" />
            {/* Animated ring effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-300 animate-ping opacity-75"></div>
          </Button>
        </div>
        <div className="mt-3 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground/80 font-medium drop-shadow-sm inline-block px-3 py-1 rounded-full border border-border/30">
            ⚖️ Not legal advice. Consult a qualified lawyer.
            </p>
        </div>
      </div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
};

export default ChatInput;
