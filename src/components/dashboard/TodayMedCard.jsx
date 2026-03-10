import React from "react";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const statusColors = {
  taken: "bg-green-50 border-green-200 text-green-700",
  skipped: "bg-red-50 border-red-200 text-red-400 line-through",
  missed: "bg-muted border-border text-muted-foreground",
  pending: "bg-card border-border text-foreground",
};

export default function TodayMedCard({ log, onMarkTaken, onMarkSkipped }) {
  const isPending = log.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all",
        statusColors[log.status]
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold",
          log.status === "taken" ? "bg-green-100 text-green-700" :
          log.status === "skipped" ? "bg-red-100 text-red-500" :
          "bg-secondary text-secondary-foreground"
        )}>
          {log.status === "taken" ? <Check className="h-4 w-4" /> :
           log.status === "skipped" ? <X className="h-4 w-4" /> :
           <Clock className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-sm">{log.medication_name}</p>
          <p className="text-xs opacity-70">{log.scheduled_time}</p>
        </div>
      </div>
      {isPending && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => onMarkSkipped(log)}
          >
            Skip
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
            onClick={() => onMarkTaken(log)}
          >
            Taken
          </Button>
        </div>
      )}
    </motion.div>
  );
}
