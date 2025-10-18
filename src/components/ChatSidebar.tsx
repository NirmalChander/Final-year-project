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
    { icon: FileText, label: "Document Templates", color: "text-accent-glow" },
    { icon: Shield, label: "Rights & Duties", color: "text-accent" },
  ];

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-card/80 border-r border-border/50 p-4">
      {/* Logo Section */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-glow relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <Scale className="h-8 w-8 text-white animate-float" />
          <div>
            <h2 className="font-bold text-white">Legal AI</h2>
            <p className="text-xs text-white/80">Your Advocate</p>
          </div>
        </div>
        <ThemeToggle />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </div>

      {/* New Chat Button */}
      <Button className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:shadow-glow text-white font-semibold rounded-xl h-12 transition-all hover:scale-[1.02]">
        <Plus className="mr-2 h-5 w-5" />
        New Consultation
      </Button>

      <Separator className="mb-4" />

      {/* Recent Chats */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Consultations
        </h3>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left p-3 rounded-xl hover:bg-muted/50 backdrop-blur-sm transition-all group hover:shadow-sm border border-transparent hover:border-border/50"
              >
                <p className="text-sm font-medium text-foreground group-hover:text-primary truncate transition-colors">
                  {chat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{chat.time}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="my-4" />

      {/* Quick Links */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Resources</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all rounded-xl group"
            >
              <link.icon className={`mr-3 h-4 w-4 ${link.color} group-hover:scale-110 transition-transform`} />
              <span className="group-hover:text-primary transition-colors">{link.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Secure & Confidential</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
