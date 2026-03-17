import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Globe, Search, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const SkillMatching = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user?.id || "")
        .eq("profile_visibility", "public");
      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(s) ||
      (p.skills || []).some(sk => sk.toLowerCase().includes(s)) ||
      (p.learning_interests || []).some(li => li.toLowerCase().includes(s))
    );
  });

  const handleConnect = async (targetUserId: string, name: string) => {
    if (!user) return;
    const { error } = await supabase.from("connections").insert({
      sender_id: user.id,
      receiver_id: targetUserId,
    });
    if (error) {
      if (error.code === "23505") {
        toast.info("Connection request already sent!");
      } else {
        toast.error("Failed to send request");
      }
    } else {
      toast.success(`Connection request sent to ${name}!`);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Skill Matching</h1>
        <p className="text-muted-foreground mt-1">Find your perfect learning partner.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search skills, names..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 rounded-xl" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
                {p.avatar_initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{p.full_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star size={10} className="fill-current text-primary" />{p.rating || 0}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Teaches</p>
                <div className="flex flex-wrap gap-1">
                  {(p.skills || []).length > 0 ? p.skills!.map((t) => (
                    <Badge key={t} className="rounded-full text-[10px] bg-primary/10 text-primary border-0">{t}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None listed</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Wants to learn</p>
                <div className="flex flex-wrap gap-1">
                  {(p.learning_interests || []).length > 0 ? p.learning_interests!.map((w) => (
                    <Badge key={w} className="rounded-full text-[10px] bg-accent/20 text-accent-foreground border-0">{w}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None listed</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              {p.location && <><MapPin size={12} />{p.location}</>}
              {p.language && <>{p.location && <span className="mx-1">·</span>}<Globe size={12} />{p.language}</>}
            </div>

            <div className="flex gap-2">
              <Button variant="hero" size="sm" className="flex-1" onClick={() => handleConnect(p.user_id, p.full_name)}>
                Connect
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/chat/${p.user_id}`)}>
                <MessageCircle size={14} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No matches found</p>
          <p className="text-sm mt-1">Try adjusting your search or invite friends to join!</p>
        </div>
      )}
    </div>
  );
};

export default SkillMatching;
