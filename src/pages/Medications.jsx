import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pill, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MedForm from "@/components/medications/MedForm";
import MedCard from "@/components/medications/MedCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Medications() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  useEffect(() => {
    if (urlParams.get("action") === "add") setShowForm(true);
  }, []);

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ["medications"],
    queryFn: () => base44.entities.Medication.list(),
  });

  const { data: pharmacies = [] } = useQuery({
    queryKey: ["pharmacies"],
    queryFn: () => base44.entities.Pharmacy.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Medication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setEditing(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Medication.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setDeleting(null);
    },
  });

  const handleSubmit = (data) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (med) => {
    setEditing(med);
    setShowForm(true);
  };

  const filteredMeds = medications.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const pharmacyMap = Object.fromEntries(pharmacies.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your prescriptions</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5" />
          Add Medication
        </Button>
      </div>

      {showForm && (
        <MedForm
          medication={editing}
          pharmacies={pharmacies}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {!showForm && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2">
            {isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : filteredMeds.length === 0 ? (
              <div className="text-center py-16">
                <Pill className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No medications found" : "No medications added yet"}
                </p>
                {!search && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                    Add your first medication
                  </Button>
                )}
              </div>
            ) : (
              filteredMeds.map((med, i) => (
                <MedCard
                  key={med.id}
                  medication={med}
                  pharmacy={pharmacyMap[med.pharmacy_id]}
                  onEdit={handleEdit}
                  onDelete={setDeleting}
                  index={i}
                />
              ))
            )}
          </div>
        </>
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this medication and its history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate(deleting.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
