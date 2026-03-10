import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Check, X, Clock, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allMedLogs"],
    queryFn: () => base44.entities.MedicationLog.list("-date", 500),
  });

  const { data: symptomLogs = [] } = useQuery({
    queryKey: ["allSymptomLogs"],
    queryFn: () => base44.entities.SymptomLog.list("-date", 500),
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad beginning
  const startDayOfWeek = monthStart.getDay();
  const paddedDays = Array(startDayOfWeek).fill(null).concat(daysInMonth);

  // Get stats for a day
  const getDayStats = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayLogs = allLogs.filter((l) => l.date === dateStr);
    const taken = dayLogs.filter((l) => l.status === "taken").length;
    const total = dayLogs.length;
    return { taken, total, dayLogs };
  };

  const selectedDayLogs = allLogs.filter((l) => l.date === selectedDateStr);
  const selectedDaySymptoms = symptomLogs.filter((l) => l.date === selectedDateStr);

  const statusIcon = {
    taken: <Check className="h-3 w-3 text-green-600" />,
    skipped: <X className="h-3 w-3 text-red-500" />,
    missed: <Clock className="h-3 w-3 text-muted-foreground" />,
    pending: <Clock className="h-3 w-3 text-amber-500" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review your medication history</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const stats = getDayStats(day);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const adherence = stats.total > 0 ? stats.taken / stats.total : -1;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                    isSelected ? "bg-primary text-primary-foreground" :
                    isTodayDate ? "bg-secondary font-semibold" :
                    "hover:bg-accent"
                  )}
                >
                  <span className="text-xs">{format(day, "d")}</span>
                  {stats.total > 0 && (
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full mt-0.5",
                      isSelected ? "bg-primary-foreground" :
                      adherence === 1 ? "bg-green-500" :
                      adherence >= 0.5 ? "bg-amber-500" :
                      "bg-red-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDateStr}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No medication logs for this day</p>
                </div>
              ) : (
                selectedDayLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {statusIcon[log.status]}
                      <div>
                        <p className="text-sm font-medium">{log.medication_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {log.scheduled_time}
                          {log.taken_at && ` • Taken: ${log.taken_at}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === "taken" ? "default" : "secondary"} className="text-xs capitalize">
                      {log.status}
                    </Badge>
                  </div>
                ))
              )}

              {selectedDaySymptoms.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Symptoms & Notes</p>
                  {selectedDaySymptoms.map((s) => (
                    <div key={s.id} className="p-3 rounded-lg bg-secondary/50">
                      {s.symptoms?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.symptoms.map((sym) => (
                            <Badge key={sym} variant="outline" className="text-xs">{sym}</Badge>
                          ))}
                        </div>
                      )}
                      {s.mood && <p className="text-xs text-muted-foreground">Mood: <span className="capitalize">{s.mood}</span></p>}
                      {s.severity && <p className="text-xs text-muted-foreground">Severity: <span className="capitalize">{s.severity}</span></p>}
                      {s.notes && <p className="text-sm mt-2">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
