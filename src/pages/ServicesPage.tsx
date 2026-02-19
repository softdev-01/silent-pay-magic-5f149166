import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { mockServices } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/order-context";
import { Zap, ShoppingCart, Plus, Check, Trash2, Truck, MapPin, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function ServicesPage() {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, placeOrder } = useOrders();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryRequested, setDeliveryRequested] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const services = user?.role === "provider"
    ? mockServices.filter((s) => s.providerId === user.id)
    : mockServices;

  const isInCart = (serviceId: string) => cart.some((i) => i.serviceId === serviceId);

  const handleAddToCart = (service: typeof mockServices[0]) => {
    addToCart({
      serviceId: service.id,
      serviceName: service.name,
      providerId: service.providerId,
      providerName: service.providerName,
      price: service.price,
      quantity: 1,
    });
    toast({ title: "Added to cart", description: `${service.name} added.` });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryRequested
    ? cart.reduce((sum, item) => {
        const svc = mockServices.find((s) => s.id === item.serviceId);
        return sum + (svc?.deliveryFee ?? 0);
      }, 0)
    : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!user || cart.length === 0) return;
    if (deliveryRequested && !deliveryAddress.trim()) {
      toast({ title: "Address required", description: "Please enter a delivery address.", variant: "destructive" });
      return;
    }

    placeOrder({
      id: `ord-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      items: cart,
      deliveryRequested,
      deliveryAddress: deliveryRequested ? deliveryAddress.trim() : undefined,
      deliveryFee,
      subtotal,
      total,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    });

    toast({ title: "Order placed!", description: `Your order of $${total.toFixed(2)} has been submitted.` });
    setCheckoutOpen(false);
    setDeliveryRequested(false);
    setDeliveryAddress("");
    setNotes("");
  };

  return (
    <DashboardLayout>
      {/* Cart button for customers */}
      {user?.role === "customer" && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Browse Services</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Your Cart ({cart.length})</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto py-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Your cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.serviceId} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{item.providerName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">${item.price.toFixed(2)}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.serviceId)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <SheetFooter className="flex-col gap-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <Button className="w-full gap-2" onClick={() => setCheckoutOpen(true)}>
                    <Send className="h-4 w-4" /> Proceed to Checkout
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <StatusBadge status={s.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.providerName}</span>
                <span className="font-display text-lg font-bold">${s.price}</span>
              </div>
              {s.deliveryAvailable && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="h-3.5 w-3.5" /> Delivery available (+${s.deliveryFee})
                </div>
              )}
              {user?.role === "customer" && (
                isInCart(s.id) ? (
                  <Button variant="secondary" className="w-full gap-2" size="sm" onClick={() => removeFromCart(s.id)}>
                    <Check className="h-4 w-4" /> In Cart
                  </Button>
                ) : (
                  <Button className="w-full gap-2" size="sm" onClick={() => handleAddToCart(s)}>
                    <Plus className="h-4 w-4" /> Add to Cart
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Checkout dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Order summary */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Order Summary</Label>
              {cart.map((item) => (
                <div key={item.serviceId} className="flex justify-between text-sm">
                  <span>{item.serviceName}</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Delivery toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="delivery-toggle">Request Delivery</Label>
              </div>
              <Switch id="delivery-toggle" checked={deliveryRequested} onCheckedChange={setDeliveryRequested} />
            </div>

            {deliveryRequested && (
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  Delivery Address
                </Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  maxLength={200}
                />
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">Delivery fee: ${deliveryFee.toFixed(2)}</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryRequested && deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} className="gap-1.5">
              <Send className="h-4 w-4" /> Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
