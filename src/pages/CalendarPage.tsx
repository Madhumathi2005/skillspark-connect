import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isSameDay } from "date-fns";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const CalendarPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<Tables<"sessions">[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, Tables<"profiles">>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`)
        .order("session_date");
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
    load();
  }, [user]);

  const sessionsOnDate = selectedDate
    ? sessions.filter((s) => isSameDay(parseISO(s.session_date), selectedDate))
    : [];

  const sessionDates = sessions.map((s) => parseISO(s.session_date));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-1">View and manage your learning sessions.</p>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-4 shadow-soft self-start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{ hasSession: sessionDates }}
            modifiersClassNames={{ hasSession: "bg-primary/20 font-bold text-primary" }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
          </h2>

          {sessionsOnDate.length > 0 ? (
            <div className="space-y-3">
              {sessionsOnDate.map((session) => {
                const pid = session.creator_id === user!.id ? session.partner_id : session.creator_id;
                const partner = partnerProfiles[pid];
                return (
                  <div key={session.id} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {partner?.avatar_initials || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{session.skill}</p>
                      <p className="text-xs text-muted-foreground">
                        with {partner?.full_name || "Partner"} · {session.session_time} · {session.duration}min
                      </p>
                    </div>
                    <Badge variant={session.type === "teaching" ? "default" : "secondary"} className="rounded-full text-xs">
                      {session.type === "teaching" ? "Teaching" : "Learning"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sessions scheduled for this day.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;
