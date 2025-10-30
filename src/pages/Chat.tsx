import { useState } from "react";
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
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sqlCode?: string;
  results?: { columns: string[]; data: any[] };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "user",
      content: "Show me total revenue by category for orders in the last 30 days",
    },
    {
      id: 2,
      role: "assistant",
      content: "Here's the SQL query to get total revenue by category for the last 30 days:",
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
        data: [
          { category_name: "Category 10", total_revenue: 9036.40 },
        ],
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: "assistant",
        content: "I'm working on generating your SQL query...",
      }]);
    }, 500);
  };

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
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Assistant</span>
              </button>
            </div>

            <div>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-chat-message transition text-sm">
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-chat-muted mb-2 px-2">CONFIGURATION</h3>
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
            <p className="text-primary font-medium mb-1">Start your free trial</p>
            <p className="text-xs text-chat-muted mb-2">Get access to all features</p>
            <Button size="sm" className="w-full bg-primary hover:bg-primary-hover">
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
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold">SQL Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-chat-muted hover:text-chat-foreground hover:bg-chat-message">
              Help
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-sm font-medium">
              J
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {message.role === "user" ? (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">You</span>
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
                      <p className="text-sm text-chat-muted">{message.content}</p>
                      
                      {message.sqlCode && (
                        <div className="bg-code-bg rounded-lg overflow-hidden border border-chat-border">
                          <div className="flex items-center justify-between px-4 py-2 bg-chat-sidebar border-b border-chat-border">
                            <span className="text-xs font-medium text-chat-muted">SQL Query</span>
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
                              {message.sqlCode.split('\n').map((line, i) => {
                                const keywords = /\b(SELECT|FROM|JOIN|WHERE|GROUP BY|ORDER BY|DESC|AS|SUM|NOW|INTERVAL|ON)\b/g;
                                const highlighted = line.replace(
                                  keywords,
                                  (match) => `<span class="text-code-keyword">${match}</span>`
                                );
                                return (
                                  <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />
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
                                  <tr key={i} className="border-t border-chat-border">
                                    {message.results.columns.map((col, j) => (
                                      <td key={j} className="px-4 py-3 text-chat-foreground">
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
