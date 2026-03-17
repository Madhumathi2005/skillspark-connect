import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Calendar, Repeat, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const Agreements = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<(Tables<"agreements"> & { partnerProfile?: Tables<"profiles"> })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("agreements")
      .select("*")
      .or(`user_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) { setAgreements([]); setLoading(false); return; }

    const pids = data.map(a => a.user_id === user.id ? a.partner_id : a.user_id);
    const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", pids);
    const map: Record<string, Tables<"profiles">> = {};
    (profiles || []).forEach(p => { map[p.user_id] = p; });

    setAgreements(data.map(a => ({
      ...a,
      partnerProfile: map[a.user_id === user.id ? a.partner_id : a.user_id],
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleEnd = async (id: string) => {
    const { error } = await supabase.from("agreements").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error("Failed to end agreement");
    else { toast.success("Agreement ended"); load(); }
  };

  const active = agreements.filter(a => a.status === "active");
  const completed = agreements.filter(a => a.status !== "active");

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  const AgreementCard = ({ agreement }: { agreement: typeof agreements[0] }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
            {agreement.partnerProfile?.avatar_initials || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{agreement.partnerProfile?.full_name || "Partner"}</p>
            <Badge variant={agreement.status === "active" ? "default" : "secondary"} className="rounded-full text-xs mt-0.5">
              {agreement.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-background mb-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">You teach</p>
          <p className="text-sm font-medium text-foreground">{agreement.your_skill}</p>
        </div>
        <ArrowLeftRight size={16} className="text-primary shrink-0" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">They teach</p>
          <p className="text-sm font-medium text-foreground">{agreement.their_skill}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Repeat size={12} />{agreement.sessions_per_week}x / week</span>
        <span className="flex items-center gap-1"><Calendar size={12} />{agreement.start_date} → {agreement.end_date}</span>
      </div>

      {agreement.status === "active" && (
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleEnd(agreement.id)}>
          End Agreement
        </Button>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Agreements</h1>
        <p className="text-muted-foreground mt-1">View your skill swap agreements with learning partners.</p>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Active Agreements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {active.map(a => <AgreementCard key={a.id} agreement={a} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Past Agreements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {completed.map(a => <AgreementCard key={a.id} agreement={a} />)}
          </div>
        </div>
      )}

      {agreements.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No agreements yet</p>
          <p className="text-sm mt-1">Connect with someone and create a skill swap agreement!</p>
        </div>
      )}
    </div>
  );
};

export default Agreements;
