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
  /** Stable unique key per (productId, size, chain) — same product with two sizes
   *  becomes two separate cart lines. Auto-derived by addItem; callers don't need
   *  to set it. Falls back to productId on legacy persisted carts. */
  cartLineId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Selected ring size (only set for ring products with ringSizes configured). */
  size?: string;
  /** Pendant chain choice — undefined when product doesn't expose the toggle. */
  chain?: 'with' | 'without';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderEvent {
  status: string;
  date: string;
  time: string;
  note?: string;
  customerNotified: boolean;
}

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
  paymentId?: string;
  razorpayOrderId?: string;
  status: OrderStatus;
  events?: OrderEvent[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AdminReply {
  text: string;
  adminName: string;
  repliedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  /** Optional title/headline for the review */
  title?: string;
  /** Order this review is anchored to — proves the user actually bought + received the product */
  orderId?: string;
  /** Admin response shown beneath the review */
  adminReply?: AdminReply;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
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
