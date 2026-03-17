import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Users, Clock, Star, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<Tables<"sessions">[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, Tables<"profiles">>>({});
  const [allProfiles, setAllProfiles] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [sessRes, profRes] = await Promise.all([
        supabase.from("sessions").select("*").or(`creator_id.eq.${user.id},partner_id.eq.${user.id}`).order("session_date", { ascending: true }),
        supabase.from("profiles").select("*").neq("user_id", user.id).limit(5),
      ]);
      setSessions(sessRes.data || []);
      setAllProfiles(profRes.data || []);

      // Fetch partner profiles for sessions
      const partnerIds = new Set<string>();
      (sessRes.data || []).forEach(s => {
        const pid = s.creator_id === user.id ? s.partner_id : s.creator_id;
        partnerIds.add(pid);
      });
      if (partnerIds.size > 0) {
        const { data } = await supabase.from("profiles").select("*").in("user_id", Array.from(partnerIds));
        const map: Record<string, Tables<"profiles">> = {};
        (data || []).forEach(p => { map[p.user_id] = p; });
        setPartnerProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const upcomingSessions = sessions.filter(s => s.status === "upcoming").slice(0, 3);

  const statCards = [
    { label: "Sessions Completed", value: profile?.total_sessions || 0, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Hours Learned", value: profile?.hours_learned || 0, icon: Clock, color: "bg-accent/20 text-accent-foreground" },
    { label: "Hours Taught", value: profile?.hours_taught || 0, icon: TrendingUp, color: "bg-secondary/40 text-secondary-foreground" },
    { label: "Rating", value: profile?.rating || 0, icon: Star, color: "bg-primary/10 text-primary" },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your learning journey.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={item} className="bg-card rounded-2xl p-5 shadow-soft">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Upcoming Sessions</h2>
            <Link to="/schedule" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session) => {
              const pid = session.creator_id === user!.id ? session.partner_id : session.creator_id;
              const partner = partnerProfiles[pid];
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {partner?.avatar_initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{session.skill}</p>
                    <p className="text-xs text-muted-foreground">with {partner?.full_name || "Partner"} · {session.session_time}</p>
                  </div>
                  <Badge variant={session.type === "teaching" ? "default" : "secondary"} className="rounded-full text-xs">
                    {session.type === "teaching" ? "Teaching" : "Learning"}
                  </Badge>
                </div>
              );
            }) : (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming sessions</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Discover People</h2>
            <Link to="/matching" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">Browse all <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            {allProfiles.length > 0 ? allProfiles.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary/40 flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                  {p.avatar_initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.skills?.length ? `Teaches ${p.skills[0]}` : "No skills listed"}
                    {p.learning_interests?.length ? ` · Wants ${p.learning_interests[0]}` : ""}
                  </p>
                </div>
                <Users size={14} className="text-muted-foreground" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">No other users yet. Invite friends!</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Your Skills & Interests</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Skills you teach</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || []).length > 0 ? profile!.skills!.map((skill) => (
                <Badge key={skill} className="rounded-full bg-primary/10 text-primary border-0">{skill}</Badge>
              )) : <p className="text-sm text-muted-foreground">None yet — edit your profile to add skills</p>}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Skills you want to learn</p>
            <div className="flex flex-wrap gap-2">
              {(profile?.learning_interests || []).length > 0 ? profile!.learning_interests!.map((skill) => (
                <Badge key={skill} className="rounded-full bg-accent/20 text-accent-foreground border-0">{skill}</Badge>
              )) : <p className="text-sm text-muted-foreground">None yet — edit your profile to add interests</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
