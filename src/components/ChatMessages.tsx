import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scale, User, BookOpen, ChevronDown, ChevronRight, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/loading-animation.json";
import lawyerAvatar from "@/assets/lawyer-avatar.png";

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

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  user?: User | null;
}

const ChatMessages = ({ messages, isLoading = false, user }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [expandedReferences, setExpandedReferences] = useState<Set<string>>(new Set());
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());
  const [isAtBottom, setIsAtBottom] = useState(true);

  const toggleReferences = (messageId: string) => {
    setExpandedReferences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleContacts = (messageId: string) => {
    setExpandedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setIsAtBottom(true);
    } catch (e) {
      // Safe fallback: ignore if scrolling is not available
    }
  }, [messages, isLoading]);

  // Handle scroll to show/hide floater
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
      }
    };

    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      // Initial check
      const fakeEvent = new Event('scroll');
      Object.defineProperty(fakeEvent, 'target', { value: viewport });
      handleScroll(fakeEvent);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative h-full min-h-0">
      <ScrollArea ref={scrollAreaRef} className="h-full min-h-0">
        <div className="max-w-full sm:max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-6 pt-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-fade-in ${
                message.type === "user" ? "animate-slide-in-right" : "animate-slide-in-left"
              }`}
            >
              {message.type === "ai" ? (
                <div className="flex gap-3">
                  <Avatar className="h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 ring-1 ring-border shadow-md">
                    <AvatarImage src={lawyerAvatar} alt="AI Lawyer" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      <Scale className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="chat-bubble-ai bg-card border border-border p-4 shadow-lg max-w-[90%] sm:max-w-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs sm:text-sm font-semibold text-foreground">AI Assistant</span>
                        <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 border-2 border-white shadow-sm">
                          <Check className="h-1.5 w-1.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-foreground">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-foreground mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-foreground mb-1 mt-2">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground my-2">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono text-foreground my-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {message.actionSteps && message.actionSteps.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 mb-1.5">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 text-white" />
                            </div>
                            Recommended Steps ({message.actionSteps.length})
                          </div>
                          <div className="space-y-1.5">
                            {message.actionSteps.map((step, idx) => (
                              <div
                                key={idx}
                                className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-2 sm:p-3 rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center shadow-sm">
                                    {step.step}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs sm:text-sm text-foreground leading-relaxed prose prose-xs max-w-none dark:prose-invert">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          p: ({ children }) => <p className="mb-0">{children}</p>,
                                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                                        }}
                                      >
                                        {step.description}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.contactInfo && message.contactInfo.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => toggleContacts(message.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 w-full text-left group"
                          >
                            {expandedContacts.has(message.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300" />
                            )}
                            <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <Phone className="h-1.5 w-1.5 text-white" />
                            </div>
                            <span className="group-hover:text-blue-800 dark:group-hover:text-blue-300">Contacts ({message.contactInfo.length})</span>
                          </button>
                          {expandedContacts.has(message.id) && (
                            <div className="mt-2 ml-4">
                              <div className="flex flex-wrap gap-1.5">
                              {message.contactInfo.map((contact, idx) => (
                                <div
                                  key={idx}
                                  className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-1.5 py-1 rounded-md flex items-center gap-1.5 flex-shrink-0"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex-shrink-0 text-xs">
                                      {contact.type === 'email' ? '📧' :
                                       contact.type === 'website' ? '🌐' : '📞'}
                                    </div>
                                    <div className="flex-1 min-w-0 max-w-40">
                                      {contact.type === 'email' ? (
                                        <>
                                          <p className="text-xs font-medium text-foreground truncate" title={contact.department}>{contact.department}</p>
                                          <a
                                            href={`mailto:${contact.helpline}`}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate block"
                                            title={contact.helpline}
                                          >
                                            {contact.helpline}
                                          </a>
                                        </>
                                      ) : contact.type === 'website' ? (
                                        <a
                                          href={contact.helpline.startsWith('http') ? contact.helpline : `https://${contact.helpline}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline truncate block"
                                          title={contact.department}
                                        >
                                          {contact.department}
                                        </a>
                                      ) : (
                                        <>
                                          <p className="text-xs font-medium text-foreground truncate" title={contact.department}>{contact.department}</p>
                                          <a
                                            href={`tel:${contact.helpline}`}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate block"
                                            title={contact.helpline}
                                          >
                                            {contact.helpline}
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            </div>
                          )}
                        </div>
                      )}
                      {message.legalReferences && (
                        <div className="mt-4">
                          <button
                            onClick={() => toggleReferences(message.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 border border-border rounded-md hover:bg-muted/50 hover:text-foreground hover:border-accent transition-all duration-200 w-full text-left group"
                          >
                            {expandedReferences.has(message.id) ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            )}
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                            <span className="group-hover:text-foreground">References ({message.legalReferences.length})</span>
                          </button>
                          {expandedReferences.has(message.id) && (
                            <div className="mt-2 ml-4">
                              <div className="space-y-1">
                              {message.legalReferences.map((ref, idx) => (
                                <div
                                  key={idx}
                                  className="bg-accent/5 border-l-2 border-accent p-2 rounded-r-lg"
                                >
                                  <p className="text-xs font-semibold text-foreground">
                                    {ref.section}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{ref.description}</p>
                                </div>
                              ))}
                            </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 flex flex-col items-end">
                    <div className="chat-bubble-user bg-primary text-primary-foreground px-4 py-3 shadow-lg max-w-[90%] sm:max-w-2xl">
                      {message.image && (
                        <div className="mb-3">
                          <img
                            src={message.image.url}
                            alt={message.image.name}
                            className="max-w-full h-auto max-h-64 rounded-lg border border-primary-foreground/20"
                          />
                        </div>
                      )}
                      <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-primary-foreground/30 pl-4 italic my-2">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-primary-foreground/20 px-1.5 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-primary-foreground/20 p-3 rounded-md overflow-x-auto text-xs font-mono my-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Avatar className="hidden sm:block h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 ring-1 ring-border shadow-md">
                    <AvatarImage src={user?.picture} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-muted text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5 text-foreground" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="animate-fade-in">
              <div className="flex gap-3">
                <Avatar className="h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 ring-1 ring-border shadow-md">
                  <AvatarImage src={lawyerAvatar} alt="AI Lawyer" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    <Scale className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="chat-bubble-ai bg-card border border-border p-2 shadow-lg max-w-[90%]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-foreground">AI Assistant</span>
                      <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 border-2 border-white shadow-sm">
                        <Check className="h-1.5 w-1.5 sm:h-3 sm:w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Lottie
                        animationData={loadingAnimation}
                        loop={true}
                        style={{ width: 180, height: 180 }}
                      />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* anchor element to ensure scrolling always reaches the bottom */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <Button
        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        className={`absolute bottom-4 right-4 h-11 w-11 rounded-full shadow-xl shadow-primary/25 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border border-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 hover:ring-2 hover:ring-primary/20 ${
          isAtBottom ? 'opacity-0 pointer-events-none scale-95' : 'opacity-70 scale-100'
        }`}
        size="sm"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatMessages;
