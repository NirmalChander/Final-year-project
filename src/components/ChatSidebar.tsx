import { useState, useEffect } from "react";
import { Scale, Plus, Clock, BookText, FileText, Shield, ChevronLeft, ChevronRight, Trash2, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useAuth } from "@/lib/auth";
import { useTheme } from "next-themes";

const ChatSidebar = ({
  minimized,
  onToggle,
  onNewChat,
  onSwitchChat,
  currentSessionId: propCurrentSessionId
}: {
  minimized: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSwitchChat: (sessionId: string) => void;
  currentSessionId?: string | null;
}) => {
  const { sessions, currentSessionId: hookCurrentSessionId, deleteSession, isLoading } = useChatHistory();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // Use prop value if provided, otherwise fall back to hook value
  const currentSessionId = propCurrentSessionId !== undefined ? propCurrentSessionId : hookCurrentSessionId;

  const quickLinks = [
    { icon: BookText, label: "Legal Dictionary", color: "text-accent" },
    { icon: FileText, label: "Document Templates", color: "text-accent" },
    { icon: Shield, label: "Rights & Duties", color: "text-accent" },
  ];

  return (
    <div className="h-full flex flex-col bg-card/20 backdrop-blur-md border-r border-border/50 shadow-lg p-3 relative">
      {/* Toggle Button - Positioned absolutely at top-left */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute top-3 left-3 hover:bg-muted rounded-lg z-10"
      >
        {minimized ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>

      {/* Content Container with top padding to avoid overlay */}
      <div className="pt-16">
        {/* User Profile Section */}
        {user ? (
          <div className={`flex items-center ${minimized ? 'justify-center' : 'justify-between'} mb-3 sm:mb-4 px-2 sm:px-3 py-1.5 sm:py-2`}>
            <div className={`flex items-center ${minimized ? 'gap-0' : 'gap-2 sm:gap-2.5'}`}>
              <Avatar className={`h-7 w-7 sm:h-8 sm:w-8 ${minimized ? '' : ''}`}>
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback className="text-[10px] sm:text-xs">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {!minimized && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-[11px] sm:text-sm font-semibold text-foreground truncate leading-tight">{user.name}</h2>
                  <p className="text-[9px] sm:text-xs text-muted-foreground truncate leading-tight">{user.email}</p>
                </div>
              )}
            </div>
            {!minimized && (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground text-destructive border border-destructive/20 hover:border-destructive transition-all duration-200 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className={`flex items-center ${minimized ? 'justify-center' : 'justify-between'} mb-4 px-3 py-2`}>
            <div className={`flex items-center ${minimized ? 'gap-0' : 'gap-2.5'}`}>
              <div className="p-2 bg-primary rounded-lg shadow-sm">
                <Scale className="h-4 w-4 text-primary-foreground" />
              </div>
              {!minimized && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground">LegalAI</h2>
                  <p className="text-xs text-muted-foreground">Assistant</p>
                </div>
              )}
            </div>
            {!minimized && <ThemeToggle />}
          </div>
        )}

      {/* New Chat Button */}
      <Button
        className={`w-full mb-3 bg-accent/20 hover:bg-accent/30 dark:bg-accent/15 dark:hover:bg-accent/25 backdrop-blur-md border border-accent/30 text-foreground font-medium rounded-lg h-10 transition-all shadow-lg ${minimized ? 'px-2' : ''}`}
        onClick={onNewChat}
      >
        <Plus className={`h-4 w-4 ${minimized ? '' : 'mr-2'}`} />
        {!minimized && 'New Chat'}
      </Button>

      {!minimized && <Separator className="mb-3" />}

      {/* Recent Chats */}
      {!minimized && (
        <div className="flex-1 flex flex-col min-h-0 mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3 flex items-center gap-2 shrink-0">
            <Clock className="h-3.5 w-3.5" />
            Recent Chats
          </h3>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-1 pb-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-xs text-muted-foreground">Loading chats...</p>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted/50 mb-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No recent chats</p>
                  <p className="text-xs text-muted-foreground">Start a new conversation to see your chat history</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative rounded-lg transition-all duration-200 overflow-hidden ${
                        session.id === currentSessionId
                          ? 'bg-primary/10 border border-primary/20 shadow-sm'
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <button
                        onClick={() => onSwitchChat(session.id)}
                        className="w-full text-left p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded-lg"
                        aria-label={`Open chat: ${session.title}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium transition-colors ${
                              session.id === currentSessionId
                                ? 'text-primary'
                                : 'text-foreground group-hover:text-primary'
                            }`}>
                              {session.title.length > 10 ? `${session.title.substring(0, 10)}...` : session.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {new Date(session.updatedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {session.id === currentSessionId && (
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                        aria-label={`Delete chat: ${session.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {!minimized && <Separator className="my-3" />}

      {/* Quick Links */}
      <div className="flex-1">
        {!minimized && <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">Resources</h3>}
        <div className={`space-y-0.5 ${minimized ? 'px-2' : 'px-1'}`}>
          {quickLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full ${minimized ? 'justify-center px-2' : 'justify-start'} hover:bg-muted transition-all rounded-lg h-9 text-sm group`}
            >
              <link.icon className={`h-4 w-4 ${link.color} group-hover:scale-110 transition-transform ${minimized ? '' : 'mr-2.5'}`} />
              {!minimized && <span className="group-hover:text-primary transition-colors">{link.label}</span>}
            </Button>
          ))}
        </div>
      </div>

      {!minimized && <Separator className="my-3" />}

      {/* Theme Toggle */}
      {!minimized && (
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">Appearance</h3>
          <div className="px-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors shadow-sm">
              <div className="flex items-center gap-2">
                {theme === "light" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {theme === "light" ? "Light Mode" : "Dark Mode"}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {!minimized && (
        <div className="mt-auto pt-3 border-t border-border px-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>Encrypted & Private</span>
          </div>
        </div>
      )}

      {/* Theme Toggle at bottom end when minimized */}
      {minimized && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
          <ThemeToggle />
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatSidebar;
