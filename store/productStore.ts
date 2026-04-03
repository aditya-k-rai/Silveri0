import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; 
  makingMargin: number; // Important for dynamic market
  isLinked: boolean;    // Important for dynamic market
  stock: number;
  category: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  carat: string;
  colour: string;
  size: string;
  height: string;
  weight: string; // E.g., "4.2g"
  width: string;
  radius: string;
  warranty: string;
  tags: string;
  primaryImage: string | null;
  hoverImage: string | null;
  model3dFileName: string | null;
}

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "P001", name: "Silver Elegance Ring", sku: "SLV-RNG-001", price: 1588, isLinked: true, makingMargin: 1200, stock: 34, category: "Rings", status: "Active", isFeatured: true, isNewArrival: false, carat: "22K", colour: "Silver", size: "US 7", height: "0.2cm", weight: "4.2g", width: "0.8cm", radius: "0.85cm", warranty: "1 Year Polish Guarantee", tags: "wedding, elegant, classic", primaryImage: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=500&q=80", hoverImage: null, model3dFileName: "ring_elegance.obj" },
  { id: "P002", name: "Luna Necklace", sku: "SLV-NCK-002", price: 3610, isLinked: true, makingMargin: 2500, stock: 22, category: "Necklaces", status: "Active", isFeatured: false, isNewArrival: true, carat: "18K", colour: "Rose Gold", size: "18 inch chain", height: "N/A", weight: "12g", width: "0.4cm", radius: "", warranty: "Lifetime Clasp Replacement", tags: "daily wear, trendy", primaryImage: null, hoverImage: null, model3dFileName: "luna.3dm" },
  { id: "P003", name: "Aria Earrings", sku: "SLV-EAR-003", price: 1899, isLinked: false, makingMargin: 800, stock: 45, category: "Earrings", status: "Active", isFeatured: true, isNewArrival: true, carat: "24K", colour: "Gold", size: "Regular", height: "2.5cm", weight: "6g", width: "1.2cm", radius: "", warranty: "6 Month Manufacturer Defect Guarantee", tags: "party, gold", primaryImage: null, hoverImage: null, model3dFileName: null },
  { id: "P004", name: "Charm Bracelet", sku: "SLV-BRC-004", price: 3165, isLinked: true, makingMargin: 1500, stock: 18, category: "Bracelets", status: "Active", isFeatured: false, isNewArrival: false, carat: "18K", colour: "Silver", size: "7.5 inch lock", height: "0.5cm", weight: "18g", width: "0.8cm", radius: "", warranty: "No warranty on charms", tags: "casual, charm", primaryImage: null, hoverImage: null, model3dFileName: null },
];

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      setProducts: (items) => set({ products: items }),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      addProduct: (product) => set((state) => ({
        products: [product, ...state.products]
      }))
    }),
    { name: 'silveri-products' }
  )
);
