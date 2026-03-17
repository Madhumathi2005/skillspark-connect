import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Plus, X } from "lucide-react";
import { mockStats } from "@/data/mockData";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [language, setLanguage] = useState(user?.language || "");
  const [skills, setSkills] = useState(user?.skills || []);
  const [interests, setInterests] = useState(user?.learningInterests || []);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Your Profile</h1>
        <Button
          variant={editing ? "hero" : "outline"}
          onClick={editing ? handleSave : () => setEditing(true)}
        >
          {editing ? "Save Changes" : "Edit Profile"}
        </Button>
      </div>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0">
            {user?.avatar}
          </div>
          <div className="flex-1 space-y-3">
            {editing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl text-lg font-semibold" />
            ) : (
              <h2 className="font-display text-xl font-semibold text-foreground">{name}</h2>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={14} />{location}</span>
              <span className="flex items-center gap-1"><Globe size={14} />{language}</span>
              <span className="flex items-center gap-1"><Star size={14} className="fill-current text-primary" />{mockStats.rating} rating</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <Label className="text-sm font-medium text-muted-foreground mb-2 block">About</Label>
        {editing ? (
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="rounded-xl" />
        ) : (
          <p className="text-foreground">{bio}</p>
        )}
      </motion.div>

      {/* Location & Language */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-soft grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Languages</Label>
            <Input value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl" />
          </div>
        </motion.div>
      )}

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills You Teach</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <Badge key={skill} className="rounded-full bg-primary/10 text-primary border-0 gap-1 pr-1">
              {skill}
              {editing && (
                <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X size={12} />
                </button>
              )}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="rounded-xl flex-1"
            />
            <Button variant="outline" size="icon" onClick={addSkill}><Plus size={16} /></Button>
          </div>
        )}
      </motion.div>

      {/* Learning Interests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">Skills You Want to Learn</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {interests.map((interest) => (
            <Badge key={interest} className="rounded-full bg-accent/20 text-accent-foreground border-0 gap-1 pr-1">
              {interest}
              {editing && (
                <button onClick={() => setInterests(interests.filter((i) => i !== interest))} className="hover:bg-accent/30 rounded-full p-0.5">
                  <X size={12} />
                </button>
              )}
            </Badge>
          ))}
        </div>
        {editing && (
          <div className="flex gap-2">
            <Input
              placeholder="Add an interest..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              className="rounded-xl flex-1"
            />
            <Button variant="outline" size="icon" onClick={addInterest}><Plus size={16} /></Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
