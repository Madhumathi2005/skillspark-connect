import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { mockSessions } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format, parseISO, isSameDay } from "date-fns";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const sessionsOnDate = selectedDate
    ? mockSessions.filter((s) => isSameDay(parseISO(s.date), selectedDate))
    : [];

  const sessionDates = mockSessions.map((s) => parseISO(s.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted-foreground mt-1">View and manage your learning sessions.</p>
      </div>

      <div className="grid lg:grid-cols-[auto_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-soft self-start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="pointer-events-auto"
            modifiers={{ hasSession: sessionDates }}
            modifiersClassNames={{ hasSession: "bg-primary/20 font-bold text-primary" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
          </h2>

          {sessionsOnDate.length > 0 ? (
            <div className="space-y-3">
              {sessionsOnDate.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {session.partnerAvatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{session.skill}</p>
                    <p className="text-xs text-muted-foreground">
                      with {session.partnerName} · {session.time} · {session.duration}min
                    </p>
                  </div>
                  <Badge
                    variant={session.type === "teaching" ? "default" : "secondary"}
                    className="rounded-full text-xs"
                  >
                    {session.type === "teaching" ? "Teaching" : "Learning"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sessions scheduled for this day.</p>
              <p className="text-sm mt-1">Select a highlighted date to see sessions.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CalendarPage;
