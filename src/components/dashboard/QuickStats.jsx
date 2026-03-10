import React from "react";
import { Pill, Check, AlertTriangle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function QuickStats({ medications, todayLogs }) {
  const activeMeds = medications.filter(m => m.is_active !== false).length;
  const takenToday = todayLogs.filter(l => l.status === "taken").length;
  const pendingToday = todayLogs.filter(l => l.status === "pending").length;
  const totalToday = todayLogs.length;
  const adherenceRate = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  const stats = [
    { label: "Active Meds", value: activeMeds, icon: Pill, color: "bg-foreground text-background" },
    { label: "Taken Today", value: `${takenToday}/${totalToday}`, icon: Check, color: "bg-green-100 text-green-700" },
    { label: "Pending", value: pendingToday, icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
    { label: "Adherence", value: `${adherenceRate}%`, icon: Calendar, color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 border border-border hover:border-foreground/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
