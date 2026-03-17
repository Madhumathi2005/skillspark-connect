import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { mockMatches } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Globe, Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const SkillMatching = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [profFilter, setProfFilter] = useState("all");

  const filtered = mockMatches.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.teaches.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      m.wants.some((w) => w.toLowerCase().includes(search.toLowerCase()));
    const matchesProf = profFilter === "all" || m.proficiency === profFilter;
    return matchesSearch && matchesProf;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Skill Matching</h1>
        <p className="text-muted-foreground mt-1">Find your perfect learning partner based on AI-powered matching.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills, names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <Select value={profFilter} onValueChange={setProfFilter}>
          <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
            <SelectValue placeholder="Proficiency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Match cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/40 flex items-center justify-center text-sm font-bold text-secondary-foreground">
                {match.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{match.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star size={10} className="fill-current text-primary" />{match.rating}</span>
                  <span>·</span>
                  <span>{match.reviews} reviews</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-primary">{match.compatibility}%</span>
                <p className="text-[10px] text-muted-foreground">match</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Teaches</p>
                <div className="flex flex-wrap gap-1">
                  {match.teaches.map((t) => (
                    <Badge key={t} className="rounded-full text-[10px] bg-primary/10 text-primary border-0">{t}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Wants to learn</p>
                <div className="flex flex-wrap gap-1">
                  {match.wants.map((w) => (
                    <Badge key={w} className="rounded-full text-[10px] bg-accent/20 text-accent-foreground border-0">{w}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <MapPin size={12} />{match.location}
              <span className="mx-1">·</span>
              <Globe size={12} />{match.language}
            </div>

            <div className="flex gap-2">
              <Button
                variant="hero"
                size="sm"
                className="flex-1"
                onClick={() => toast.success(`Connection request sent to ${match.name}!`)}
              >
                Connect
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageCircle size={14} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No matches found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default SkillMatching;
