export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  price: number;
  comparePrice?: number;
  stock: number;
  material: string;
  weight?: number;
  tags: string[];
  images: string[];
  model3d?: {
    url: string;
    fileName: string;
  };
  isFeatured: boolean;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  productCount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: UserAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode?: string;
  paymentId: string;
  razorpayOrderId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  phone: string;
  location?: string;
  role: 'customer' | 'admin';
  addresses: UserAddress[];
  wishlist: string[];
  blocked: boolean;
  createdAt: Date;
  orderCount?: number;
  totalSpent?: number;
}

export interface Promo {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiryDate: Date;
  isActive: boolean;
}

export interface HeroBanner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
}

export interface SiteSettings {
  heroImages: HeroBanner[];
  announcementText: string;
  showAnnouncement: boolean;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    whatsapp?: string;
  };
}
