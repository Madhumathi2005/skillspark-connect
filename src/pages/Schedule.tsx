import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Video, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const Schedule = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Tables<"sessions">[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, Tables<"profiles">>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("session_date", { ascending: true });
    setSessions(data || []);

    const pids = new Set<string>();
    (data || []).forEach(s => pids.add(s.creator_id === user.id ? s.partner_id : s.creator_id));
    if (pids.size > 0) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", Array.from(pids));
      const map: Record<string, Tables<"profiles">> = {};
      (profiles || []).forEach(p => { map[p.user_id] = p; });
      setPartnerProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("sessions").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Failed to cancel");
    else { toast.success("Session cancelled"); load(); }
  };

  const upcoming = sessions.filter(s => s.status === "upcoming");
  const completed = sessions.filter(s => s.status === "completed");

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const SessionCard = ({ session }: { session: Tables<"sessions"> }) => {
    const pid = session.creator_id === user!.id ? session.partner_id : session.creator_id;
    const partner = partnerProfiles[pid];
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:shadow-soft transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {partner?.avatar_initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{session.skill}</p>
          <p className="text-sm text-muted-foreground">with {partner?.full_name || "Partner"}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{session.session_date}</span><span>·</span>
            <span className="flex items-center gap-1"><Clock size={10} />{session.session_time}</span><span>·</span>
            <span>{session.duration}min</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={session.type === "teaching" ? "default" : "secondary"} className="rounded-full text-xs">
            {session.type === "teaching" ? "Teaching" : "Learning"}
          </Badge>
          {session.status === "upcoming" ? (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleCancel(session.id)}>
              Cancel
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle size={12} /> Completed</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Schedule</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past learning sessions.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-muted rounded-xl p-1">
          <TabsTrigger value="upcoming" className="rounded-lg">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {upcoming.length > 0 ? upcoming.map(s => <SessionCard key={s.id} session={s} />) : (
              <div className="text-center py-16 text-muted-foreground">No upcoming sessions.</div>
            )}
          </motion.div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {completed.length > 0 ? completed.map(s => <SessionCard key={s.id} session={s} />) : (
              <div className="text-center py-16 text-muted-foreground">No completed sessions yet.</div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
