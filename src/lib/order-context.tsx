import { createContext, useContext, useState, ReactNode } from "react";
import { Order, OrderItem } from "./types";

interface OrderContextType {
  orders: Order[];
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (serviceId: string) => void;
  clearCart: () => void;
  placeOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  placeOrder: () => {},
  updateOrderStatus: () => {},
});

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (item: OrderItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.serviceId === item.serviceId);
      if (exists) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((i) => i.serviceId !== serviceId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  return (
    <OrderContext.Provider value={{ orders, cart, addToCart, removeFromCart, clearCart, placeOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
