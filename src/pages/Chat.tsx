import { useState, useEffect, useCallback } from "react"; // Import useCallback
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { cn } from "@/lib/utils"; // Import cn

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

const Chat = ({
  session,
}: {
  session: Session | null;
  loading: boolean; // We still receive this prop, but won't use it
}) => {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Helper function to save the currently active chat, now memoized
  const saveCurrentChat = useCallback(() => {
    // Only save if we have messages and an active chat ID
    if (currentMessages.length === 0 || !activeChatId) return;

    const title = currentMessages[0].content.substring(0, 30) + "...";

    setChatHistory((prevHistory) => {
      const existingChatIndex = prevHistory.findIndex(
        (s) => s.id === activeChatId,
      );

      if (existingChatIndex !== -1) {
        // Update existing chat in history
        const updatedHistory = [...prevHistory];
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          title,
          messages: currentMessages,
        };
        return updatedHistory;
      } else {
        // It's a new chat, add it to history
        const newSession: ChatSession = {
          id: activeChatId,
          title: title,
          messages: currentMessages,
        };
        return [newSession, ...prevHistory];
      }
    });
  }, [activeChatId, currentMessages]); // Dependencies are stable or values

  // Set the initial demo chat *once*
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
  }, [chatHistory.length]); // Only runs when chatHistory.length changes (from 0 to 1)

  // Get user's initial (e.g., 'J')
  const userInitial = session?.user?.email
    ? session.user.email[0].toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/"); // Navigate to home after sign out
  };

  const handleNewChat = () => {
    // 1. Save the current chat to history if it's not empty
    saveCurrentChat();

    // 2. Clear current messages and set a new active ID
    setCurrentMessages([]);
    setActiveChatId(null); // No active session ID until a message is sent
  };

  const handleSelectHistory = (id: string) => {
    // 1. Save the current chat before switching
    saveCurrentChat();

    // 2. Load the selected chat
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

    // This is the *only* place we should be setting currentMessages directly
    // in response to a user action.
    const updatedMessages = [...currentMessages, newMessage];
    setCurrentMessages(updatedMessages);

    // If this is the first message of a new chat, create a new session ID
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

    // Save chat to history *after* sending
    // We update history with the *new* message included
    const title = updatedMessages[0].content.substring(0, 30) + "...";
    setChatHistory((prevHistory) => {
      const existingChatIndex = prevHistory.findIndex(
        (s) => s.id === currentActiveId,
      );

      if (existingChatIndex !== -1) {
        // Update existing chat
        const updatedHistory = [...prevHistory];
        updatedHistory[existingChatIndex] = {
          ...updatedHistory[existingChatIndex],
          title,
          messages: updatedMessages,
        };
        return updatedHistory;
      } else {
        // Add new chat
        const newSession: ChatSession = {
          id: currentActiveId!,
          title: title,
          messages: updatedMessages,
        };
        return [newSession, ...prevHistory];
      }
    });
  };

  // This `useEffect` was causing the issue.
  // We will now save to history *inside* the handleSend and handleNewChat functions,
  // which is a more predictable pattern.
  /*
  useEffect(() => {
    if (activeChatId) {
      saveCurrentChat();
    }
  }, [currentMessages, activeChatId, saveCurrentChat]);
  */

  return (
    <div className="h-screen flex bg-chat-bg text-chat-foreground">
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
            <span className="text-lg font-bold">Text2SQL.ai</span>
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
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm">
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
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary-hover"
            >
              Upgrade Now
            </Button>
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
                                  />
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