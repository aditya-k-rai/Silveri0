import { create } from "zustand";

export interface OrderEvent {
  status: string;
  date: string;
  time: string;
  note?: string;
  customerNotified: boolean;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  total: number;
  status: string;
  items: { sku: string; name: string; price: number; quantity: number }[];
  events: OrderEvent[];
}

const INITIAL_ORDERS: Order[] = [
  { 
    id: "ORD-2026-157", customer: "Vikram Kohli", email: "vikram@example.com", phone: "+91 65498 73210", location: "Chennai, Tamil Nadu", date: "2026-04-03", total: 10498, status: "New",
    items: [{ sku: "SLV-RNG-006", name: "Solitaire Ring", price: 5499, quantity: 1 }, { sku: "SLV-BRC-004", name: "Charm Bracelet", price: 4999, quantity: 1 }],
    events: [{ status: "New", date: "2026-04-03", time: "10:30 AM", customerNotified: true, note: "Order placed successfully." }]
  },
  { 
    id: "ORD-2026-156", customer: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", location: "Mumbai, Maharashtra", date: "2026-04-02", total: 6398, status: "Delivered",
    items: [{ sku: "SLV-RNG-001", name: "Silver Elegance Ring", price: 2499, quantity: 1 }, { sku: "SLV-NCK-002", name: "Luna Necklace", price: 3899, quantity: 1 }],
    events: [
      { status: "New", date: "2026-04-02", time: "09:15 AM", customerNotified: true },
      { status: "Processing", date: "2026-04-02", time: "02:00 PM", customerNotified: false },
      { status: "Shipped", date: "2026-04-02", time: "06:45 PM", customerNotified: true, note: "Dispatched via BlueDart." },
      { status: "Delivered", date: "2026-04-04", time: "11:20 AM", customerNotified: true, note: "Handed to resident." }
    ]
  },
  { 
    id: "ORD-2026-155", customer: "Arjun Mehta", email: "arjun@example.com", phone: "+91 87654 32100", location: "Delhi, NCR", date: "2026-04-01", total: 3899, status: "Shipped",
    items: [{ sku: "SLV-NCK-002", name: "Luna Necklace", price: 3899, quantity: 1 }],
    events: [
      { status: "New", date: "2026-04-01", time: "10:00 AM", customerNotified: true },
      { status: "Shipped", date: "2026-04-03", time: "01:30 PM", customerNotified: true, note: "In transit." }
    ]
  },
  { 
    id: "ORD-2026-154", customer: "Neha Reddy", email: "neha@example.com", phone: "+91 76543 21000", location: "Bangalore, Karnataka", date: "2026-03-31", total: 8750, status: "Processing",
    items: [{ sku: "SLV-RNG-006", name: "Solitaire Ring", price: 5499, quantity: 1 }, { sku: "SLV-ANK-005", name: "Twist Anklet", price: 1299, quantity: 2 }, { sku: "SLV-BRC-004", name: "Charm Bracelet", price: 653, quantity: 1 }] ,
    events: [
      { status: "New", date: "2026-03-31", time: "08:20 AM", customerNotified: true },
      { status: "Processing", date: "2026-04-01", time: "04:00 PM", customerNotified: false, note: "Awaiting polishing." }
    ]
  },
  { 
    id: "ORD-2026-153", customer: "Rahul Singh", email: "rahul@example.com", phone: "+91 65432 10000", location: "Pune, Maharashtra", date: "2026-03-30", total: 2499, status: "Delivered",
    items: [{ sku: "SLV-RNG-001", name: "Silver Elegance Ring", price: 2499, quantity: 1 }],
    events: [
      { status: "New", date: "2026-03-30", time: "11:10 AM", customerNotified: true },
      { status: "Delivered", date: "2026-04-02", time: "03:45 PM", customerNotified: true }
    ]
  },
  { 
    id: "ORD-2026-152", customer: "Ananya Gupta", email: "ananya@example.com", phone: "+91 54321 00000", location: "Hyderabad, Telangana", date: "2026-03-29", total: 5200, status: "Shipped",
    items: [{ sku: "SLV-NCK-007", name: "Pearl Pendant", price: 2899, quantity: 1 }, { sku: "SLV-EAR-003", name: "Aria Earrings", price: 2301, quantity: 1 }],
    events: [
      { status: "New", date: "2026-03-29", time: "05:50 PM", customerNotified: true },
      { status: "Processing", date: "2026-03-30", time: "09:00 AM", customerNotified: false },
      { status: "Shipped", date: "2026-04-03", time: "12:00 PM", customerNotified: true }
    ]
  },
];

interface OrderStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, newStatus: string, event: OrderEvent) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: INITIAL_ORDERS,
  setOrders: (orders) => set({ orders }),
  updateOrderStatus: (id, newStatus, event) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            status: newStatus,
            events: [...o.events, event]
          };
        }
        return o;
      })
    }))
}));
