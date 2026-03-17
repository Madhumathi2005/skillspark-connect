import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Clock, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type ConnectionStatus = "pending_received" | "pending_sent" | "accepted" | "declined";

interface Connection {
  id: string;
  name: string;
  avatar: string;
  teaches: string[];
  wants: string[];
  status: ConnectionStatus;
  sentAt: string;
  compatibility: number;
}

const mockConnections: Connection[] = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar: "PS",
    teaches: ["Python", "Data Science"],
    wants: ["JavaScript", "React"],
    status: "accepted",
    sentAt: "2026-03-10",
    compatibility: 95,
  },
  {
    id: "2",
    name: "Marcus Chen",
    avatar: "MC",
    teaches: ["Guitar", "Music Theory"],
    wants: ["UI Design", "Figma"],
    status: "accepted",
    sentAt: "2026-03-12",
    compatibility: 88,
  },
  {
    id: "3",
    name: "Sofia Andersson",
    avatar: "SA",
    teaches: ["Machine Learning", "Python"],
    wants: ["React", "TypeScript"],
    status: "pending_received",
    sentAt: "2026-03-15",
    compatibility: 92,
  },
  {
    id: "4",
    name: "James Okafor",
    avatar: "JO",
    teaches: ["Node.js", "Express"],
    wants: ["UI Design", "Illustration"],
    status: "pending_received",
    sentAt: "2026-03-16",
    compatibility: 80,
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    avatar: "YT",
    teaches: ["Piano", "Music Production"],
    wants: ["JavaScript", "Web Dev"],
    status: "pending_sent",
    sentAt: "2026-03-14",
    compatibility: 75,
  },
  {
    id: "6",
    name: "Elena Popova",
    avatar: "EP",
    teaches: ["Russian", "Literature"],
    wants: ["Python", "AI"],
    status: "declined",
    sentAt: "2026-03-08",
    compatibility: 60,
  },
];

const Connections = () => {
  const [connections, setConnections] = useState(mockConnections);
  const navigate = useNavigate();

  const handleAccept = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted" as ConnectionStatus } : c))
    );
    const conn = connections.find((c) => c.id === id);
    toast.success(`Accepted connection with ${conn?.name}!`);
  };

  const handleDecline = (id: string) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "declined" as ConnectionStatus } : c))
    );
    const conn = connections.find((c) => c.id === id);
    toast.info(`Declined connection with ${conn?.name}.`);
  };

  const received = connections.filter((c) => c.status === "pending_received");
  const sent = connections.filter((c) => c.status === "pending_sent");
  const accepted = connections.filter((c) => c.status === "accepted");
  const declined = connections.filter((c) => c.status === "declined");

  const ConnectionCard = ({ conn }: { conn: Connection }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
          {conn.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{conn.name}</p>
          <p className="text-xs text-muted-foreground">
            {conn.compatibility}% match · Sent {conn.sentAt}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {conn.teaches.map((t) => (
          <Badge key={t} className="rounded-full text-[10px] bg-primary/10 text-primary border-0">
            {t}
          </Badge>
        ))}
        {conn.wants.map((w) => (
          <Badge key={w} className="rounded-full text-[10px] bg-accent/20 text-accent-foreground border-0">
            {w}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        {conn.status === "pending_received" && (
          <>
            <Button size="sm" variant="hero" className="flex-1 gap-1" onClick={() => handleAccept(conn.id)}>
              <Check size={14} /> Accept
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDecline(conn.id)}>
              <X size={14} />
            </Button>
          </>
        )}
        {conn.status === "pending_sent" && (
          <Button size="sm" variant="outline" className="flex-1 gap-1" disabled>
            <Clock size={14} /> Pending
          </Button>
        )}
        {conn.status === "accepted" && (
          <Button
            size="sm"
            variant="hero"
            className="flex-1 gap-1"
            onClick={() => navigate(`/chat/${conn.id}`)}
          >
            <MessageCircle size={14} /> Chat
          </Button>
        )}
        {conn.status === "declined" && (
          <Button size="sm" variant="outline" className="flex-1 text-muted-foreground" disabled>
            Declined
          </Button>
        )}
      </div>
    </motion.div>
  );

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
                {tab.data.map((c) => (
                  <ConnectionCard key={c.id} conn={c} />
                ))}
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
