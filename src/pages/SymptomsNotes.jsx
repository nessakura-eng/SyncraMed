import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const COMMON_SYMPTOMS = [
  "Headache", "Nausea", "Fatigue", "Dizziness", "Insomnia",
  "Stomach pain", "Muscle ache", "Dry mouth", "Anxiety", "Joint pain",
  "Rash", "Swelling", "Shortness of breath", "Chest pain", "Constipation",
];

const MOODS = [
  { value: "great", label: "Great", emoji: "😊" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "poor", label: "Poor", emoji: "😕" },
  { value: "bad", label: "Bad", emoji: "😞" },
];

export default function SymptomsNotes() {
  const today = format(new Date(), "yyyy-MM-dd");
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["symptomLogs"],
    queryFn: () => base44.entities.SymptomLog.list("-date", 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SymptomLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptomLogs"] });
      resetForm();
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setSelectedSymptoms([]);
    setCustomSymptom("");
    setSeverity("");
    setMood("");
    setNotes("");
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const handleSubmit = () => {
    createMutation.mutate({
      date: today,
      symptoms: selectedSymptoms,
      severity: severity || undefined,
      mood: mood || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Symptoms & Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track how you're feeling</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          New Entry
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log for {format(new Date(), "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mood */}
            <div className="space-y-2">
              <Label className="text-xs">How are you feeling?</Label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-all ${
                      mood === m.value ? "border-foreground bg-secondary" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label className="text-xs">Symptoms</Label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((sym) => (
                  <Badge
                    key={sym}
                    variant={selectedSymptoms.includes(sym) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleSymptom(sym)}
                  >
                    {sym}
                    {selectedSymptoms.includes(sym) && <X className="h-2.5 w-2.5 ml-1" />}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add custom symptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSymptom())}
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={addCustomSymptom}>Add</Button>
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <Label className="text-xs">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="How was your day? Any observations about your medications..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-24"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* History */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No entries yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Log your first entry
            </Button>
          </div>
        ) : (
          logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{format(new Date(log.date), "MMMM d, yyyy")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {log.mood && (
                        <span className="text-xs text-muted-foreground">
                          Mood: {MOODS.find((m) => m.value === log.mood)?.emoji} {log.mood}
                        </span>
                      )}
                      {log.severity && (
                        <Badge variant="outline" className="text-xs capitalize">{log.severity}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {log.symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {log.symptoms.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
                {log.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
