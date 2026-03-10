import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, ArrowRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import QuickStats from "@/components/dashboard/QuickStats";
import TodayMedCard from "@/components/dashboard/TodayMedCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading: medsLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: () => base44.entities.Medication.list(),
  });

  const { data: todayLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["todayLogs", today],
    queryFn: () => base44.entities.MedicationLog.filter({ date: today }),
  });

  const { data: symptomLogs = [] } = useQuery({
    queryKey: ["todaySymptoms", today],
    queryFn: () => base44.entities.SymptomLog.filter({ date: today }),
  });

  // Generate logs for today if they don't exist yet
  const createLogsMutation = useMutation({
    mutationFn: (logs) => base44.entities.MedicationLog.bulkCreate(logs),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todayLogs"] }),
  });

  useEffect(() => {
    if (!medsLoading && !logsLoading && medications.length > 0 && todayLogs.length === 0) {
      const activeMeds = medications.filter(m => m.is_active !== false);
      const newLogs = [];
      activeMeds.forEach((med) => {
        const times = med.reminder_times || ["08:00"];
        times.forEach((time) => {
          newLogs.push({
            medication_id: med.id,
            medication_name: med.name,
            scheduled_time: time,
            status: "pending",
            date: today,
          });
        });
      });
      if (newLogs.length > 0) {
        createLogsMutation.mutate(newLogs);
      }
    }
  }, [medsLoading, logsLoading, medications, todayLogs]);

  const updateLogMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MedicationLog.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todayLogs"] }),
  });

  const handleMarkTaken = (log) => {
    updateLogMutation.mutate({
      id: log.id,
      data: { status: "taken", taken_at: format(new Date(), "HH:mm") },
    });
  };

  const handleMarkSkipped = (log) => {
    updateLogMutation.mutate({
      id: log.id,
      data: { status: "skipped" },
    });
  };

  const sortedLogs = [...todayLogs].sort((a, b) => {
    const order = { pending: 0, taken: 1, skipped: 2, missed: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const isLoading = medsLoading || logsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link to={createPageUrl("Medications") + "?action=add"}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Med
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <QuickStats medications={medications} todayLogs={todayLogs} />
      )}

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
            <Link to={createPageUrl("CalendarView")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              View Calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
          ) : sortedLogs.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No medications scheduled for today</p>
              <Link to={createPageUrl("Medications") + "?action=add"}>
                <Button variant="outline" size="sm" className="mt-3">Add your first medication</Button>
              </Link>
            </div>
          ) : (
            sortedLogs.map((log) => (
              <TodayMedCard
                key={log.id}
                log={log}
                onMarkTaken={handleMarkTaken}
                onMarkSkipped={handleMarkSkipped}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to={createPageUrl("SymptomsNotes")}>
          <Card className="p-4 hover:border-foreground/20 transition-colors cursor-pointer group">
            <p className="font-medium text-sm">Log Symptoms</p>
            <p className="text-xs text-muted-foreground mt-1">Track how you're feeling today</p>
            <ArrowRight className="h-3.5 w-3.5 mt-2 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Card>
        </Link>
        <Link to={createPageUrl("Education")}>
          <Card className="p-4 hover:border-foreground/20 transition-colors cursor-pointer group">
            <p className="font-medium text-sm">Med Education</p>
            <p className="text-xs text-muted-foreground mt-1">Learn about your medications</p>
            <ArrowRight className="h-3.5 w-3.5 mt-2 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Card>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
