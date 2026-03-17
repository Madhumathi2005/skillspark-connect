import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Chat = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Tables<"messages">[]>([]);
  const [partner, setPartner] = useState<Tables<"profiles"> | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !partnerId) return;

    const loadData = async () => {
      const [partnerRes, msgRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", partnerId).single(),
        supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true }),
      ]);
      setPartner(partnerRes.data);
      setMessages(msgRes.data || []);
      setLoading(false);
    };
    loadData();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${partnerId}`,
        },
        (payload) => {
          const msg = payload.new as Tables<"messages">;
          if (msg.receiver_id === user.id) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, partnerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || !partnerId) return;
    const content = input.trim();
    setInput("");

    const { data, error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content,
    }).select().single();

    if (error) {
      setInput(content);
    } else if (data) {
      setMessages((prev) => [...prev, data]);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-2rem)] -m-6 md:-m-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/connections")} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="w-9 h-9 rounded-full bg-secondary/40 flex items-center justify-center text-xs font-bold text-secondary-foreground">
          {partner?.avatar_initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{partner?.full_name || "Unknown"}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-1">Say hello to {partner?.full_name}!</p>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.sender_id === user?.id
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-xl h-11" />
          <Button type="submit" variant="hero" size="icon" className="h-11 w-11 rounded-xl shrink-0">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
