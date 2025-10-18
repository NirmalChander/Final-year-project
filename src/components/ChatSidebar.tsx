import { Scale, Plus, Clock, BookText, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./ThemeToggle";

const ChatSidebar = () => {
  const recentChats = [
    { id: 1, title: "Property Rights Query", time: "2 hours ago" },
    { id: 2, title: "Employment Law Advice", time: "Yesterday" },
    { id: 3, title: "Consumer Protection Act", time: "2 days ago" },
  ];

  const quickLinks = [
    { icon: BookText, label: "Legal Dictionary", color: "text-accent" },
    { icon: FileText, label: "Document Templates", color: "text-accent" },
    { icon: Shield, label: "Rights & Duties", color: "text-accent" },
  ];

  return (
    <div className="h-full flex flex-col bg-card border-r border-border p-3">
      {/* Modern Minimal Logo Section */}
      <div className="flex items-center justify-between mb-4 px-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary rounded-lg shadow-sm">
            <Scale className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">LegalAI</h2>
            <p className="text-xs text-muted-foreground">Assistant</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* New Chat Button */}
      <Button className="w-full mb-3 bg-accent hover:bg-accent-light text-accent-foreground font-medium rounded-lg h-10 transition-all shadow-sm">
        <Plus className="mr-2 h-4 w-4" />
        New Chat
      </Button>

      <Separator className="mb-3" />

      {/* Recent Chats */}
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          Recent
        </h3>
        <ScrollArea className="h-56">
          <div className="space-y-1 px-1">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-all group"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors">
                  {chat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{chat.time}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="my-3" />

      {/* Quick Links */}
      <div className="flex-1">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">Resources</h3>
        <div className="space-y-0.5 px-1">
          {quickLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start hover:bg-muted transition-all rounded-lg h-9 text-sm group"
            >
              <link.icon className={`mr-2.5 h-4 w-4 ${link.color} group-hover:scale-110 transition-transform`} />
              <span className="group-hover:text-primary transition-colors">{link.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-3 border-t border-border px-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-accent" />
          <span>Encrypted & Private</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
