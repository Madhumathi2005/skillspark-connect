import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { mockStats, mockSessions, mockMatches } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Users, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const statCards = [
  { label: "Sessions Completed", value: mockStats.totalSessions, icon: BookOpen, color: "bg-primary/10 text-primary" },
  { label: "Hours Learned", value: mockStats.hoursLearned, icon: Clock, color: "bg-accent/20 text-accent-foreground" },
  { label: "Hours Taught", value: mockStats.hoursTaught, icon: TrendingUp, color: "bg-secondary/40 text-secondary-foreground" },
  { label: "Active Partners", value: mockStats.activePartners, icon: Users, color: "bg-primary/10 text-primary" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const Dashboard = () => {
  const { user } = useAuth();
  const upcomingSessions = mockSessions.filter((s) => s.status === "upcoming").slice(0, 3);
  const topMatches = mockMatches.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your learning journey.</p>
      </div>

      {/* Stats */}
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
        {/* Upcoming Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Upcoming Sessions</h2>
            <Link to="/schedule" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {session.partnerAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{session.skill}</p>
                  <p className="text-xs text-muted-foreground">with {session.partnerName} · {session.time}</p>
                </div>
                <Badge variant={session.type === "teaching" ? "default" : "secondary"} className="rounded-full text-xs">
                  {session.type === "teaching" ? "Teaching" : "Learning"}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Matches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">Top Matches</h2>
            <Link to="/matching" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {topMatches.map((match) => (
              <div key={match.id} className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary/40 flex items-center justify-center text-sm font-semibold text-secondary-foreground">
                  {match.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{match.name}</p>
                  <p className="text-xs text-muted-foreground">Teaches {match.teaches[0]} · Wants {match.wants[0]}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Star size={12} className="fill-current" />
                  {match.compatibility}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Your Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Your Skills & Interests</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Skills you teach</p>
            <div className="flex flex-wrap gap-2">
              {user?.skills.map((skill) => (
                <Badge key={skill} className="rounded-full bg-primary/10 text-primary border-0">{skill}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Skills you want to learn</p>
            <div className="flex flex-wrap gap-2">
              {user?.learningInterests.map((skill) => (
                <Badge key={skill} className="rounded-full bg-accent/20 text-accent-foreground border-0">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
