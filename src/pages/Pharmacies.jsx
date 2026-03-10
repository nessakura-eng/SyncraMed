import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Building2, Phone, MapPin, Star, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
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

export default function Pharmacies() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(getEmptyForm());
  const queryClient = useQueryClient();

  function getEmptyForm() {
    return { name: "", address: "", city: "", state: "", zip_code: "", phone: "", fax: "", is_primary: false };
  }

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ["pharmacies"],
    queryFn: () => base44.entities.Pharmacy.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pharmacy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pharmacy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pharmacy.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacies"] });
      setDeleting(null);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(getEmptyForm());
  };

  const handleEdit = (pharmacy) => {
    setEditing(pharmacy);
    setForm(pharmacy);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If setting as primary, unset all other primaries first
    if (form.is_primary) {
      const otherPrimaries = pharmacies.filter(
        (p) => p.is_primary && p.id !== editing?.id
      );
      await Promise.all(
        otherPrimaries.map((p) =>
          base44.entities.Pharmacy.update(p.id, { ...p, is_primary: false })
        )
      );
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pharmacies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your linked pharmacies</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5" />
          Add Pharmacy
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-base">{editing ? "Edit Pharmacy" : "Add Pharmacy"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Pharmacy Name *</Label>
                  <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. CVS Pharmacy" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone *</Label>
                  <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="(555) 123-4567" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Input value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">State</Label>
                  <Input value={form.state || ""} onChange={(e) => handleChange("state", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ZIP</Label>
                  <Input value={form.zip_code || ""} onChange={(e) => handleChange("zip_code", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fax</Label>
                <Input value={form.fax || ""} onChange={(e) => handleChange("fax", e.target.value)} placeholder="(555) 123-4568" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_primary} onCheckedChange={(v) => handleChange("is_primary", v)} />
                <Label className="text-xs">Set as primary pharmacy</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
              <Button type="submit" size="sm">{editing ? "Save Changes" : "Add Pharmacy"}</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : pharmacies.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No pharmacies linked yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
              Add your first pharmacy
            </Button>
          </div>
        ) : (
          pharmacies.map((pharmacy, i) => (
            <motion.div
              key={pharmacy.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4 hover:border-foreground/20 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{pharmacy.name}</h3>
                        {pharmacy.is_primary && (
                          <Badge variant="default" className="text-xs gap-0.5"><Star className="h-2.5 w-2.5" /> Primary</Badge>
                        )}
                      </div>
                      {pharmacy.address && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[pharmacy.address, pharmacy.city, pharmacy.state, pharmacy.zip_code].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {pharmacy.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(pharmacy)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleting(pharmacy)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This pharmacy will be unlinked from your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteMutation.mutate(deleting.id)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
