/**
 * GTM / GA4 Analytics Helper
 * ---------------------------
 * Push structured events to window.dataLayer so GTM forwards them to GA4.
 * All events follow the GA4 e-commerce recommended schema:
 * https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 *
 * Usage:
 *   import { trackViewItem } from '@/lib/analytics/gtm';
 *   trackViewItem(product);
 */

/* ─── Types ────────────────────────────────────────────────────────────────── */

export interface GtmProduct {
  item_id: string;
  item_name: string;
  item_category: string;
  price: number;
  currency: string;
  quantity?: number;
  item_variant?: string; // e.g. "Gold Plated / Size 16"
  item_list_name?: string;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/* ─── Core push ─────────────────────────────────────────────────────────────── */

export function gtmEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Clear previous ecommerce data before each new event (GA4 recommendation)
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ...params });
}

/* ─── Product mapper ─────────────────────────────────────────────────────────── */

interface RawProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  plating?: string;
}

function toGtmItem(product: RawProduct, qty = 1, listName?: string): GtmProduct {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    currency: 'INR',
    quantity: qty,
    ...(product.plating ? { item_variant: product.plating } : {}),
    ...(listName ? { item_list_name: listName } : {}),
  };
}

/* ─── E-Commerce Events ─────────────────────────────────────────────────────── */

/**
 * view_item — fires when a user opens a product detail page.
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Item views
 */
export function trackViewItem(product: RawProduct): void {
  gtmEvent('view_item', {
    ecommerce: {
      currency: 'INR',
      value: product.price,
      items: [toGtmItem(product)],
    },
  });
}

/**
 * add_to_cart — fires when a user adds a product to cart.
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Add to carts
 */
export function trackAddToCart(product: RawProduct, qty = 1): void {
  gtmEvent('add_to_cart', {
    ecommerce: {
      currency: 'INR',
      value: product.price * qty,
      items: [toGtmItem(product, qty)],
    },
  });
}

/**
 * remove_from_cart — fires when a cart item is deleted.
 */
export function trackRemoveFromCart(product: { productId: string; name: string; price: number; quantity: number }): void {
  gtmEvent('remove_from_cart', {
    ecommerce: {
      currency: 'INR',
      value: product.price * product.quantity,
      items: [{
        item_id: product.productId,
        item_name: product.name,
        price: product.price,
        currency: 'INR',
        quantity: product.quantity,
      }],
    },
  });
}

/**
 * begin_checkout — fires when the user clicks "Proceed to Checkout".
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Checkouts
 */
export function trackBeginCheckout(
  items: { productId: string; name: string; price: number; quantity: number }[],
  value: number,
): void {
  gtmEvent('begin_checkout', {
    ecommerce: {
      currency: 'INR',
      value,
      items: items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.price,
        currency: 'INR',
        quantity: i.quantity,
      })),
    },
  });
}

/**
 * purchase — fires after Razorpay payment is verified.
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Purchases
 */
export function trackPurchase(
  orderId: string,
  items: { productId: string; name: string; price: number; quantity: number }[],
  value: number,
  shipping = 0,
): void {
  gtmEvent('purchase', {
    ecommerce: {
      transaction_id: orderId,
      currency: 'INR',
      value,
      shipping,
      items: items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.price,
        currency: 'INR',
        quantity: i.quantity,
      })),
    },
  });
}

/* ─── Discovery Events ──────────────────────────────────────────────────────── */

/**
 * search — fires when the user submits a search / filter query.
 * GA4 Report: Reports → Engagement → Events → search → search_term dimension
 * This is how you see "Most Searched Products / Terms".
 */
export function trackSearch(searchTerm: string): void {
  if (!searchTerm.trim()) return;
  gtmEvent('search', { search_term: searchTerm.trim() });
}

/**
 * select_item — fires when a user clicks on a product card.
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Item clicks
 */
export function trackSelectItem(product: RawProduct, listName = 'Product List'): void {
  gtmEvent('select_item', {
    ecommerce: {
      item_list_name: listName,
      items: [toGtmItem(product, 1, listName)],
    },
  });
}

/**
 * view_item_list — fires when a product grid scrolls into view.
 * GA4 Report: Reports → Monetization → Ecommerce purchases → Item list views
 * Tracks which collections / pages users actually see, with location breakdown.
 */
export function trackViewItemList(products: RawProduct[], listName: string): void {
  if (!products.length) return;
  gtmEvent('view_item_list', {
    ecommerce: {
      item_list_name: listName,
      items: products.slice(0, 20).map((p, idx) => ({
        ...toGtmItem(p, 1, listName),
        index: idx,
      })),
    },
  });
}
