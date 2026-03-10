import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";

const FREQUENCIES = [
  { value: "once_daily", label: "Once Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "three_times_daily", label: "Three Times Daily" },
  { value: "four_times_daily", label: "Four Times Daily" },
  { value: "as_needed", label: "As Needed" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];

const COLORS = ["#000000", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function MedForm({ medication, pharmacies = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(medication || {
    name: "",
    dosage: "",
    frequency: "once_daily",
    reminder_times: ["08:00"],
    prescribing_doctor: "",
    pharmacy_id: "",
    start_date: "",
    end_date: "",
    refills_remaining: 0,
    notes: "",
    is_active: true,
    color: "#000000",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addReminderTime = () => {
    setForm((prev) => ({
      ...prev,
      reminder_times: [...(prev.reminder_times || []), "12:00"],
    }));
  };

  const removeReminderTime = (index) => {
    setForm((prev) => ({
      ...prev,
      reminder_times: prev.reminder_times.filter((_, i) => i !== index),
    }));
  };

  const updateReminderTime = (index, value) => {
    setForm((prev) => {
      const times = [...(prev.reminder_times || [])];
      times[index] = value;
      return { ...prev, reminder_times: times };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-base">{medication ? "Edit Medication" : "Add Medication"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Medication Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Metformin"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dosage *</Label>
              <Input
                value={form.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
                placeholder="e.g. 500mg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Frequency *</Label>
              <Select value={form.frequency} onValueChange={(v) => handleChange("frequency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Prescribing Doctor</Label>
              <Input
                value={form.prescribing_doctor}
                onChange={(e) => handleChange("prescribing_doctor", e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
          </div>

          {/* Reminder Times */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Reminder Times</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addReminderTime}>
                <Plus className="h-3 w-3" /> Add Time
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(form.reminder_times || []).map((time, i) => (
                <div key={i} className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateReminderTime(i, e.target.value)}
                    className="h-7 w-28 border-0 bg-transparent text-xs p-0"
                  />
                  {(form.reminder_times || []).length > 1 && (
                    <button type="button" onClick={() => removeReminderTime(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Pharmacy</Label>
              <Select value={form.pharmacy_id || ""} onValueChange={(v) => handleChange("pharmacy_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select pharmacy" /></SelectTrigger>
                <SelectContent>
                  {pharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Refills Remaining</Label>
              <Input
                type="number"
                min="0"
                value={form.refills_remaining || 0}
                onChange={(e) => handleChange("refills_remaining", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={form.start_date || ""} onChange={(e) => handleChange("start_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={form.end_date || ""} onChange={(e) => handleChange("end_date", e.target.value)} />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-xs">Color Tag</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange("color", c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any additional notes..."
              className="h-20"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {medication ? "Save Changes" : "Add Medication"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
