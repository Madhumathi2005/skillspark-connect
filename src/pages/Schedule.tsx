import { motion } from "framer-motion";
import { mockSessions } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Video, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Schedule = () => {
  const upcoming = mockSessions.filter((s) => s.status === "upcoming");
  const completed = mockSessions.filter((s) => s.status === "completed");

  const SessionCard = ({ session }: { session: typeof mockSessions[0] }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:shadow-soft transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
        {session.partnerAvatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{session.skill}</p>
        <p className="text-sm text-muted-foreground">with {session.partnerName}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{session.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={10} />{session.time}</span>
          <span>·</span>
          <span>{session.duration}min</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge
          variant={session.type === "teaching" ? "default" : "secondary"}
          className="rounded-full text-xs"
        >
          {session.type === "teaching" ? "Teaching" : "Learning"}
        </Badge>
        {session.status === "upcoming" ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Video size={12} /> Join
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive"
              onClick={() => toast.info("Session cancelled (mock)")}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs text-sage-dark">
            <CheckCircle size={12} /> Completed
          </span>
        )}
      </div>
    </div>
  );

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
            {upcoming.length > 0 ? (
              upcoming.map((s) => <SessionCard key={s.id} session={s} />)
            ) : (
              <div className="text-center py-16 text-muted-foreground">No upcoming sessions.</div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {completed.length > 0 ? (
              completed.map((s) => <SessionCard key={s.id} session={s} />)
            ) : (
              <div className="text-center py-16 text-muted-foreground">No completed sessions yet.</div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
