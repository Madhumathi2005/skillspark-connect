import { motion } from "framer-motion";
import { mockAgreements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Calendar, Repeat } from "lucide-react";
import { toast } from "sonner";

const Agreements = () => {
  const active = mockAgreements.filter((a) => a.status === "active");
  const completed = mockAgreements.filter((a) => a.status === "completed");

  const AgreementCard = ({ agreement }: { agreement: typeof mockAgreements[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-soft"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
            {agreement.partnerAvatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{agreement.partnerName}</p>
            <Badge
              variant={agreement.status === "active" ? "default" : "secondary"}
              className="rounded-full text-xs mt-0.5"
            >
              {agreement.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-background mb-4">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">You teach</p>
          <p className="text-sm font-medium text-foreground">{agreement.yourSkill}</p>
        </div>
        <ArrowLeftRight size={16} className="text-primary shrink-0" />
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground mb-1">They teach</p>
          <p className="text-sm font-medium text-foreground">{agreement.theirSkill}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Repeat size={12} />{agreement.sessionsPerWeek}x / week</span>
        <span className="flex items-center gap-1"><Calendar size={12} />{agreement.startDate} → {agreement.endDate}</span>
      </div>

      {agreement.status === "active" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Opening session scheduler...")}>
            Schedule Session
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => toast.info("Agreement ended (mock)")}>
            End
          </Button>
        </div>
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
            {active.map((a) => <AgreementCard key={a.id} agreement={a} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Completed</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {completed.map((a) => <AgreementCard key={a.id} agreement={a} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Agreements;
