import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  makingMargin: number;
  isLinked: boolean;
  stock: number;
  category: string;
  subCategory: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  carat: string;
  colour: string;
  colour2: string;
  size: string;
  height: string;
  weight: string;
  width: string;
  radius: string;
  description: string;
  warranty: string;
  tags: string;
  views: number;
  likes: number;
  primaryImage: string | null;
  hoverImage: string | null;
  image3: string | null;
  image4: string | null;
  image5: string | null;
  image6: string | null;
  model3dFileName: string | null;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  incrementViews: (id: string) => void;
  incrementLikes: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: true,
  setProducts: (items) => set({ products: items, loading: false }),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  addProduct: (product) => set((state) => ({
    products: [product, ...state.products]
  })),
  incrementViews: (id) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, views: (p.views ?? 0) + 1 } : p)
  })),
  incrementLikes: (id) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, likes: (p.likes ?? 0) + 1 } : p)
  })),
}));
