import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowRight, ArrowLeft, Sparkles, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const SUGGESTED_SKILLS = [
  "JavaScript", "Python", "UI Design", "Photography", "Guitar", "Spanish",
  "Machine Learning", "Cooking", "Yoga", "Marketing", "Writing", "Data Science",
  "React", "Illustration", "Piano", "French", "Public Speaking", "Fitness",
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saving, setSaving] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustom = (value: string, list: string[], setList: (v: string[]) => void, clear: () => void) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      clear();
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ skills, learning_interests: interests })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save your preferences");
    } else {
      await refreshProfile();
      toast.success("Welcome to SkillSwap! 🎉");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "gradient-warm" : "bg-muted"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "gradient-warm" : "bg-muted"}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">What can you teach?</h1>
                  <p className="text-muted-foreground">Select the skills you'd love to share with others.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleItem(skill, skills, setSkills)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      skills.includes(skill)
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom(newSkill, skills, setSkills, () => setNewSkill("")))}
                  className="h-12 rounded-xl flex-1"
                />
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => addCustom(newSkill, skills, setSkills, () => setNewSkill(""))}>
                  <Plus size={18} />
                </Button>
              </div>

              {skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Your skills ({skills.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Badge key={s} className="rounded-full bg-primary/10 text-primary border-0 gap-1 pr-1 text-sm py-1 px-3">
                        {s}
                        <button onClick={() => setSkills(skills.filter((x) => x !== s))} className="hover:bg-primary/20 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="hero" size="xl" onClick={() => setStep(2)} disabled={skills.length === 0}>
                  Continue <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <BookOpen className="text-accent-foreground" size={24} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">What do you want to learn?</h1>
                  <p className="text-muted-foreground">Pick topics you're curious about — we'll find matches!</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleItem(interest, interests, setInterests)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      interests.includes(interest)
                        ? "bg-accent text-accent-foreground border-accent shadow-md"
                        : "bg-card text-foreground border-border hover:border-accent/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom(newInterest, interests, setInterests, () => setNewInterest("")))}
                  className="h-12 rounded-xl flex-1"
                />
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={() => addCustom(newInterest, interests, setInterests, () => setNewInterest(""))}>
                  <Plus size={18} />
                </Button>
              </div>

              {interests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Your interests ({interests.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i) => (
                      <Badge key={i} className="rounded-full bg-accent/20 text-accent-foreground border-0 gap-1 pr-1 text-sm py-1 px-3">
                        {i}
                        <button onClick={() => setInterests(interests.filter((x) => x !== i))} className="hover:bg-accent/30 rounded-full p-0.5">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" size="xl" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button variant="hero" size="xl" onClick={handleFinish} disabled={interests.length === 0 || saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
