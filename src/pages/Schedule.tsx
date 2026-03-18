import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, CheckCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const Schedule = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Tables<"sessions">[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, Tables<"profiles">>>({});
  const [connectedProfiles, setConnectedProfiles] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New session form state
  const [newPartnerId, setNewPartnerId] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("60");
  const [newType, setNewType] = useState("teaching");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("session_date", { ascending: true });
    setSessions(data || []);

    // Load partner profiles for sessions
    const pids = new Set<string>();
    (data || []).forEach(s => pids.add(s.creator_id === user.id ? s.partner_id : s.creator_id));
    if (pids.size > 0) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", Array.from(pids));
      const map: Record<string, Tables<"profiles">> = {};
      (profiles || []).forEach(p => { map[p.user_id] = p; });
      setPartnerProfiles(map);
    }

    // Load connected users for the create form
    const { data: conns } = await supabase
      .from("connections")
      .select("*")
      .eq("status", "accepted")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    if (conns && conns.length > 0) {
      const connIds = conns.map(c => c.sender_id === user.id ? c.receiver_id : c.sender_id);
      const { data: cProfiles } = await supabase.from("profiles").select("*").in("user_id", connIds);
      setConnectedProfiles(cProfiles || []);
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from("sessions").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Failed to cancel");
    else { toast.success("Session cancelled"); load(); }
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase.from("sessions").update({ status: "completed" }).eq("id", id);
    if (error) toast.error("Failed to mark complete");
    else { toast.success("Session marked as completed!"); load(); }
  };

  const handleCreate = async () => {
    if (!user || !newPartnerId || !newSkill || !newDate || !newTime) {
      toast.error("Please fill in all fields");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("sessions").insert({
      creator_id: user.id,
      partner_id: newPartnerId,
      skill: newSkill,
      session_date: newDate,
      session_time: newTime,
      duration: parseInt(newDuration),
      type: newType,
    });
    if (error) {
      toast.error("Failed to create session");
    } else {
      toast.success("Session created!");
      setDialogOpen(false);
      setNewPartnerId("");
      setNewSkill("");
      setNewDate("");
      setNewTime("");
      setNewDuration("60");
      setNewType("teaching");
      load();
    }
    setCreating(false);
  };

  const upcoming = sessions.filter(s => s.status === "upcoming");
  const completed = sessions.filter(s => s.status === "completed");
  const cancelled = sessions.filter(s => s.status === "cancelled");

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
          {session.status === "upcoming" && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => handleComplete(session.id)}>
                Complete
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleCancel(session.id)}>
                Cancel
              </Button>
            </div>
          )}
          {session.status === "completed" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle size={12} /> Completed</span>
          )}
          {session.status === "cancelled" && (
            <span className="text-xs text-destructive">Cancelled</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past learning sessions.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2"><Plus size={16} /> New Session</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Schedule a New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Partner</Label>
                <Select value={newPartnerId} onValueChange={setNewPartnerId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a connected partner" /></SelectTrigger>
                  <SelectContent>
                    {connectedProfiles.length > 0 ? connectedProfiles.map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                    )) : (
                      <SelectItem value="none" disabled>No connected partners yet</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Skill / Topic</Label>
                <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. React Basics" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Select value={newDuration} onValueChange={setNewDuration}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="hero" className="w-full" onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 size={16} className="animate-spin" />}
                Create Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-muted rounded-xl p-1">
          <TabsTrigger value="upcoming" className="rounded-lg">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {upcoming.length > 0 ? upcoming.map(s => <SessionCard key={s.id} session={s} />) : (
              <div className="text-center py-16 text-muted-foreground">No upcoming sessions. Schedule one!</div>
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
        <TabsContent value="cancelled" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {cancelled.length > 0 ? cancelled.map(s => <SessionCard key={s.id} session={s} />) : (
              <div className="text-center py-16 text-muted-foreground">No cancelled sessions.</div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
