import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Clock, Building2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const freqLabels = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "3x daily",
  four_times_daily: "4x daily",
  as_needed: "As needed",
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
};

export default function MedCard({ medication, pharmacy, onEdit, onDelete, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card className="p-4 hover:border-foreground/20 transition-all group">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: medication.color || "#000" }}
            >
              {medication.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{medication.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{medication.dosage}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {freqLabels[medication.frequency] || medication.frequency}
                </Badge>
                {(medication.reminder_times || []).map((time) => (
                  <Badge key={time} variant="outline" className="text-xs font-normal gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {time}
                  </Badge>
                ))}
                {pharmacy && (
                  <Badge variant="outline" className="text-xs font-normal gap-1">
                    <Building2 className="h-2.5 w-2.5" />
                    {pharmacy.name}
                  </Badge>
                )}
              </div>
              {medication.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{medication.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={createPageUrl("Education") + `?med=${encodeURIComponent(medication.name)}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <BookOpen className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(medication)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(medication)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
