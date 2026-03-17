import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Clock, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface ConnectionWithProfile {
  connection: Tables<"connections">;
  profile: Tables<"profiles">;
}

const Connections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = async () => {
    if (!user) return;
    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!conns || conns.length === 0) {
      setConnections([]);
      setLoading(false);
      return;
    }

    const otherIds = conns.map(c => c.sender_id === user.id ? c.receiver_id : c.sender_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", otherIds);
    const profileMap: Record<string, Tables<"profiles">> = {};
    (profiles || []).forEach(p => { profileMap[p.user_id] = p; });

    setConnections(conns.map(c => ({
      connection: c,
      profile: profileMap[c.sender_id === user.id ? c.receiver_id : c.sender_id],
    })));
    setLoading(false);
  };

  useEffect(() => { loadConnections(); }, [user]);

  const handleAccept = async (connId: string) => {
    const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connId);
    if (error) toast.error("Failed to accept");
    else { toast.success("Connection accepted!"); loadConnections(); }
  };

  const handleDecline = async (connId: string) => {
    const { error } = await supabase.from("connections").update({ status: "declined" }).eq("id", connId);
    if (error) toast.error("Failed to decline");
    else { toast.info("Connection declined."); loadConnections(); }
  };

  const received = connections.filter(c => c.connection.receiver_id === user?.id && c.connection.status === "pending");
  const sent = connections.filter(c => c.connection.sender_id === user?.id && c.connection.status === "pending");
  const accepted = connections.filter(c => c.connection.status === "accepted");
  const declined = connections.filter(c => c.connection.status === "declined");

  const ConnectionCard = ({ item }: { item: ConnectionWithProfile }) => {
    const isSender = item.connection.sender_id === user?.id;
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
            {item.profile?.avatar_initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{item.profile?.full_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{new Date(item.connection.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {(item.profile?.skills || []).map(t => (
            <Badge key={t} className="rounded-full text-[10px] bg-primary/10 text-primary border-0">{t}</Badge>
          ))}
          {(item.profile?.learning_interests || []).map(w => (
            <Badge key={w} className="rounded-full text-[10px] bg-accent/20 text-accent-foreground border-0">{w}</Badge>
          ))}
        </div>

        <div className="flex gap-2">
          {item.connection.status === "pending" && !isSender && (
            <>
              <Button size="sm" variant="hero" className="flex-1 gap-1" onClick={() => handleAccept(item.connection.id)}>
                <Check size={14} /> Accept
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDecline(item.connection.id)}>
                <X size={14} />
              </Button>
            </>
          )}
          {item.connection.status === "pending" && isSender && (
            <Button size="sm" variant="outline" className="flex-1 gap-1" disabled>
              <Clock size={14} /> Pending
            </Button>
          )}
          {item.connection.status === "accepted" && (
            <Button size="sm" variant="hero" className="flex-1 gap-1" onClick={() => navigate(`/chat/${item.profile?.user_id}`)}>
              <MessageCircle size={14} /> Chat
            </Button>
          )}
          {item.connection.status === "declined" && (
            <Button size="sm" variant="outline" className="flex-1 text-muted-foreground" disabled>Declined</Button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Connections</h1>
        <p className="text-muted-foreground mt-1">Manage your connection requests and chat with partners.</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="rounded-xl bg-muted/50">
          <TabsTrigger value="received" className="rounded-lg gap-1.5">
            Received {received.length > 0 && <Badge className="rounded-full h-5 w-5 p-0 justify-center bg-primary text-primary-foreground text-[10px] border-0">{received.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-lg">Sent</TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-lg">Connected</TabsTrigger>
          <TabsTrigger value="declined" className="rounded-lg">Declined</TabsTrigger>
        </TabsList>

        {[
          { value: "received", data: received, empty: "No pending requests" },
          { value: "sent", data: sent, empty: "No sent requests" },
          { value: "accepted", data: accepted, empty: "No connections yet" },
          { value: "declined", data: declined, empty: "No declined requests" },
        ].map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.data.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tab.data.map((c) => <ConnectionCard key={c.connection.id} item={c} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <UserPlus size={40} className="mx-auto mb-3 opacity-40" />
                <p>{tab.empty}</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Connections;
