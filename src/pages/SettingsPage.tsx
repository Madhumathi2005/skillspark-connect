import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  const handleSave = () => toast.success("Settings saved successfully!");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and notifications.</p>
      </div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Account</h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input defaultValue={user?.email} className="rounded-xl" disabled />
        </div>
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Privacy</h2>
        <div className="space-y-2">
          <Label>Profile Visibility</Label>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public — Anyone can find you</SelectItem>
              <SelectItem value="matches">Matches Only — Only matched partners</SelectItem>
              <SelectItem value="private">Private — Hidden from search</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 shadow-soft space-y-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Notifications</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Session Reminders</p>
            <p className="text-xs text-muted-foreground">Get reminded before sessions</p>
          </div>
          <Switch checked={sessionReminders} onCheckedChange={setSessionReminders} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Match Alerts</p>
            <p className="text-xs text-muted-foreground">Get notified of new skill matches</p>
          </div>
          <Switch checked={matchAlerts} onCheckedChange={setMatchAlerts} />
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="destructive" size="sm" onClick={() => toast.error("Account deletion is disabled in this demo.")}>
          Delete Account
        </Button>
      </motion.div>

      <Button variant="hero" size="lg" onClick={handleSave}>Save Settings</Button>
    </div>
  );
};

export default SettingsPage;
