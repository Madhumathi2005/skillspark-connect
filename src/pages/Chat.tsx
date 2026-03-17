import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

const contacts: Record<string, { name: string; avatar: string; status: string }> = {
  "1": { name: "Priya Sharma", avatar: "PS", status: "Online" },
  "2": { name: "Marcus Chen", avatar: "MC", status: "Last seen 2h ago" },
  "3": { name: "Sofia Andersson", avatar: "SA", status: "Online" },
  "4": { name: "James Okafor", avatar: "JO", status: "Last seen 5m ago" },
  "5": { name: "Yuki Tanaka", avatar: "YT", status: "Offline" },
};

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", text: "Hey! I saw you want to learn Python. I'd love to help!", sender: "them", timestamp: "10:00 AM" },
    { id: "2", text: "That sounds great! I can teach you React in exchange.", sender: "me", timestamp: "10:02 AM" },
    { id: "3", text: "Perfect! When would you like to start?", sender: "them", timestamp: "10:03 AM" },
    { id: "4", text: "How about tomorrow at 10 AM?", sender: "me", timestamp: "10:05 AM" },
    { id: "5", text: "Works for me! I'll send you a calendar invite.", sender: "them", timestamp: "10:06 AM" },
  ],
  "2": [
    { id: "1", text: "Hi Marcus! Ready for our guitar session?", sender: "me", timestamp: "1:30 PM" },
    { id: "2", text: "Absolutely! I've prepared some chord progressions for you.", sender: "them", timestamp: "1:32 PM" },
  ],
};

const Chat = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const contact = contacts[partnerId || ""] || { name: "Unknown", avatar: "??", status: "Offline" };
  const [messages, setMessages] = useState<Message[]>(mockMessages[partnerId || ""] || []);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Thanks for the message! I'll get back to you soon. 😊",
          sender: "them",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-2rem)] -m-6 md:-m-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/connections")} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="w-9 h-9 rounded-full bg-secondary/40 flex items-center justify-center text-xs font-bold text-secondary-foreground">
          {contact.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.status}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon"><Phone size={16} /></Button>
          <Button variant="ghost" size="icon"><Video size={16} /></Button>
          <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-1">Say hello to {contact.name}!</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.sender === "me"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <p>{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl h-11"
          />
          <Button type="submit" variant="hero" size="icon" className="h-11 w-11 rounded-xl shrink-0">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
