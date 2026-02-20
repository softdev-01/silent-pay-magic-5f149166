import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useServices } from "@/lib/service-context";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = ["Plumbing", "Cleaning", "Electrical", "Landscaping", "Painting", "Other"];

export function AddServiceDialog() {
  const { user } = useAuth();
  const { addService } = useServices();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setDeliveryAvailable(false);
    setDeliveryFee("");
  };

  const handleSubmit = () => {
    if (!user || !name.trim() || !price || !category) return;

    addService({
      id: `s-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      providerId: user.id,
      providerName: user.name,
      price: parseFloat(price),
      currency: "USD",
      category,
      status: "active",
      deliveryAvailable,
      deliveryFee: deliveryAvailable ? parseFloat(deliveryFee || "0") : undefined,
    });

    toast({ title: "Service added", description: `"${name.trim()}" is now listed.` });
    resetForm();
    setOpen(false);
  };

  const isValid = name.trim() && parseFloat(price) > 0 && category;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="svc-name">Service Name</Label>
            <Input id="svc-name" placeholder="e.g. Pipe Repair" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-desc">Description</Label>
            <Textarea id="svc-desc" placeholder="Describe the service..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="svc-price">Price ($)</Label>
              <Input id="svc-price" type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="svc-delivery">Delivery Available</Label>
            </div>
            <Switch id="svc-delivery" checked={deliveryAvailable} onCheckedChange={setDeliveryAvailable} />
          </div>
          {deliveryAvailable && (
            <div className="space-y-2">
              <Label htmlFor="svc-delivery-fee">Delivery Fee ($)</Label>
              <Input id="svc-delivery-fee" type="number" min="0" step="0.01" placeholder="0.00" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
