import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Database,
  Settings,
  History,
  Sparkles,
  Send,
  Copy,
  Download,
  Menu,
  X,
  LogOut,
  MessageSquare,
  Key,
  BadgeAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sqlCode?: string;
  results?: { columns: string[]; data: any[] };
}

const demoMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content: "Show me total revenue by category for orders in the last 30 days",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "Here's the SQL query to get total revenue by category for the last 30 days:",
    sqlCode: `SELECT
  c.name AS category_name,
  SUM(oi.quantity * p.price) AS total_revenue
FROM demo_ecom.order_items oi
JOIN demo_ecom.products p ON oi.product_id = p.id
JOIN demo_ecom.categories c ON p.category_id = c.id
JOIN demo_ecom.orders o ON oi.order_id = o.id
WHERE
  o.placed_at >= NOW() - INTERVAL '30 days'
GROUP BY
  c.name
ORDER BY
  total_revenue DESC;`,
    results: {
      columns: ["category_name", "total_revenue"],
      data: [{ category_name: "Category 10", total_revenue: 9036.40 }],
    },
  },
];

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

// COMPONENT: Settings Dialog
const SettingsDialog = ({
  session,
  open,
  onOpenChange,
}: {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const userEmail = session?.user?.email || "N/A";
  const authMethod = session?.user?.app_metadata.provider || "email";
  const isEmailPasswordUser = authMethod === "email";

  const handlePasswordReset = async () => {
    if (!session?.user?.email) {
      toast.error("Error", {
        description: "Could not find user email to send reset link.",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        session.user.email,
        {
          redirectTo: `${window.location.origin}/auth?reset=true`, // Redirect user after reset
        },
      );

      if (error) throw error;

      toast.success("Password Reset Email Sent!", {
        description: "Check your inbox for the link to change your password.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Error", {
        description:
          "Failed to send reset link. Please try again or contact support.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your user details and security settings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">User Information</h3>
            <div className="space-y-1">
              <Label>Email (Username)</Label>
              <Input value={userEmail} disabled className="bg-muted/50" />
            </div>
            <div className="flex justify-between items-center text-sm">
              <Label className="font-normal text-muted-foreground">
                Authentication Method:
              </Label>
              <Badge
                variant="secondary"
                className="capitalize bg-primary/10 text-primary"
              >
                {authMethod}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Key className="w-4 h-4" /> Change Password
            </h3>
            {isEmailPasswordUser ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  A password reset link will be sent to your registered email
                  address.
                </p>
                <Button
                  onClick={handlePasswordReset}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  Send Password Reset Email
                </Button>
              </div>
            ) : (
              <Alert className="border-primary/50 bg-primary/5">
                <BadgeAlert className="w-4 h-4 text-primary" />
                <AlertTitle>Password Managed by Provider</AlertTitle>
                <AlertDescription className="text-sm text-primary">
                  Since you signed in with {authMethod}, you must change your
                  password directly through your {authMethod} account settings.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Chat = ({ session }: { session: Session | null; loading: boolean }) => {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const saveCurrentChat = useCallback(() => {
    if (currentMessages.length === 0 || !activeChatId) return;

    const title = currentMessages[0].content.substring(0, 30) + "...";

    setChatHistory((prevHistory) => {
      const existingChatIndex = prevHistory.findIndex(
        (s) => s.id === activeChatId,
      );

      if (existingChatIndex !== -1) {
        const updatedHistory = [...prevHistory];
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          title,
          messages: currentMessages,
        };
        return updatedHistory;
      } else {
        const newSession: ChatSession = {
          id: activeChatId,
          title: title,
          messages: currentMessages,
        };
        return [newSession, ...prevHistory];
      }
    });
  }, [activeChatId, currentMessages]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      const demoSession: ChatSession = {
        id: "demo-" + Date.now(),
        title: "Demo Chat: Revenue by Category...",
        messages: demoMessages,
      };
      setChatHistory([demoSession]);
      setCurrentMessages(demoSession.messages);
      setActiveChatId(demoSession.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userInitial = session?.user?.email
    ? session.user.email[0].toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNewChat = () => {
    saveCurrentChat();
    setCurrentMessages([]);
    setActiveChatId(null);
  };

  const handleSelectHistory = (id: string) => {
    saveCurrentChat();

    const sessionToLoad = chatHistory.find((session) => session.id === id);
    if (sessionToLoad) {
      setCurrentMessages(sessionToLoad.messages);
      setActiveChatId(sessionToLoad.id);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: currentMessages.length + 1,
      role: "user",
      content: input,
    };

    const updatedMessages = [...currentMessages, newMessage];
    setCurrentMessages(updatedMessages);

    let currentActiveId = activeChatId;
    if (currentActiveId === null) {
      currentActiveId = `chat-${Date.now()}`;
      setActiveChatId(currentActiveId);
    }

    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setCurrentMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: "I'm working on generating your SQL query...",
        },
      ]);
    }, 500);

    const title = updatedMessages[0].content.substring(0, 30) + "...";
    setChatHistory((prevHistory) => {
      const existingChatIndex = prevHistory.findIndex(
        (s) => s.id === currentActiveId,
      );

      if (existingChatIndex !== -1) {
        const updatedHistory = [...prevHistory];
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          title,
          messages: updatedMessages,
        };
        return updatedHistory;
      } else {
        const newSession: ChatSession = {
          id: currentActiveId!,
          title: title,
          messages: updatedMessages,
        };
        return [newSession, ...prevHistory];
      }
    });
  };

  return (
    <div className="h-screen flex bg-chat-bg text-chat-foreground">
      {/* Settings Dialog */}
      <SettingsDialog
        session={session}
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-chat-sidebar border-r border-chat-border transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-chat-border">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">QueryZen</span>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-chat-message border-chat-border hover:bg-chat-message/80"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg bg-chat-message transition text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Assistant</span>
              </button>
            </div>

            {/* History Section */}
            <div>
              <h3 className="text-xs font-semibold text-chat-muted mb-2 px-2 flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </h3>
              <div className="space-y-1">
                {chatHistory.length === 0 && (
                  <p className="text-xs text-chat-muted px-2">
                    Your chat history will appear here.
                  </p>
                )}
                {/* Render chat history */}
                {chatHistory.map((session) => (
                  <button
                    key={session.id}
                    className={cn(
                      "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm truncate",
                      session.id === activeChatId && "bg-chat-message",
                    )}
                    onClick={() => handleSelectHistory(session.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-chat-muted mb-2 px-2">
                CONFIGURATION
              </h3>
              <div className="space-y-1">
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm">
                  <Database className="w-4 h-4" />
                  <span>Databases</span>
                </button>
                {/* Settings button opens dialog */}
                <button
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm"
                  onClick={() => setSettingsDialogOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-chat-border">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
            <p className="text-primary font-medium mb-1">
              Start your free trial
            </p>
            <p className="text-xs text-chat-muted mb-2">
              Get access to all features
            </p>
            {/* FIXED: Link to the /upgrade route */}
            <Link to="/upgrade" className="w-full">
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary-hover"
              >
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-chat-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-chat-foreground hover:bg-chat-message"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <h1 className="text-lg font-semibold">SQL Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-chat-muted hover:text-chat-foreground hover:bg-chat-message"
            >
              Help
            </Button>
            {/* Added Sign Out Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-chat-muted hover:text-chat-foreground hover:bg-chat-message"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-medium">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {currentMessages.length === 0 && (
              <div className="text-center text-chat-muted pt-20">
                <Database className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-chat-foreground">
                  Welcome to Text2SQL.ai
                </h2>
                <p>
                  Start a new chat by typing your SQL query in plain English
                  below.
                </p>
              </div>
            )}
            {currentMessages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.role === "user" ? (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        You
                      </span>
                    </div>
                    <div className="flex-1 bg-chat-message rounded-lg p-4">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-chat-muted">
                        {message.content}
                      </p>

                      {message.sqlCode && (
                        <div className="bg-code-bg rounded-lg overflow-hidden border border-chat-border">
                          <div className="flex items-center justify-between px-4 py-2 bg-chat-sidebar border-b border-chat-border">
                            <span className="text-xs font-medium text-chat-muted">
                              SQL Query
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-chat-muted hover:text-chat-foreground"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </div>
                          <pre className="p-4 overflow-x-auto text-sm font-mono">
                            <code className="text-chat-foreground">
                              {message.sqlCode.split("\n").map((line, i) => {
                                const keywords =
                                  /\b(SELECT|FROM|JOIN|WHERE|GROUP BY|ORDER BY|DESC|AS|SUM|NOW|INTERVAL|ON)\b/g;
                                const highlighted = line.replace(
                                  keywords,
                                  (match) =>
                                    `<span class="text-code-keyword">${match}</span>`,
                                );
                                return (
                                  <div
                                    key={i}
                                    dangerouslySetInnerHTML={{
                                      __html: highlighted,
                                    }}
                               B                                  />
                                );
                              })}
                            </code>
                          </pre>
                        </div>
                      )}

                      {message.results && (
                        <div className="bg-code-bg rounded-lg overflow-hidden border border-chat-border">
                          <div className="flex items-center justify-between px-4 py-2 bg-chat-sidebar border-b border-chat-border">
                            <span className="text-xs font-medium text-chat-muted">
                              {message.results.data.length} row found
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-chat-muted hover:text-chat-foreground"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-chat-sidebar">
                                <tr>
                                  {message.results.columns.map((col, i) => (
                                    <th
                                      key={i}
                                      className="px-4 py-3 text-left font-medium text-chat-muted uppercase text-xs tracking-wider"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.results.data.map((row, i) => (
                                  <tr
                                    key={i}
                                    className="border-t border-chat-border"
                                  >
                                    {message.results.columns.map((col, j) => (
                                      <td
                                        key={j}
                                        className="px-4 py-3 text-chat-foreground"
                                      >
                                        {row[col]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-chat-border p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about SQL..."
                className="flex-1 bg-chat-message border-chat-border text-chat-foreground placeholder:text-chat-muted focus-visible:ring-primary"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-primary hover:bg-primary-hover"
                disabled={!input.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-chat-muted mt-2 text-center">
              Tip: Click 'Run' to see the results!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;