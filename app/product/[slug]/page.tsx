import Link from 'next/link';
import { ChevronRight, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';
import ProductGallery from './ProductGallery';
import ReviewCard from '@/components/product/ReviewCard';

const sampleProduct = {
  id: '1', name: 'Silver Moonlight Ring', slug: 'silver-moonlight-ring',
  description: 'A beautifully handcrafted sterling silver ring with a delicate moonlight finish. This piece features an intricate design that catches light at every angle, making it perfect for both everyday wear and special occasions.',
  category: 'Rings', price: 2499, comparePrice: 3999, material: 'Sterling Silver',
  weight: 8, stock: 15, images: [], tags: ['rings', 'silver', 'handcrafted'],
  model3d: null as { url: string; fileName: string } | null, // 3D model file (set via admin)
};

const sampleReviews = [
  { userName: 'Priya S.', rating: 5, comment: 'Absolutely beautiful ring! The craftsmanship is excellent.', date: '2 weeks ago' },
  { userName: 'Rahul M.', rating: 4, comment: 'Great quality silver. Lovely design.', date: '1 month ago' },
];

export async function generateMetadata() {
  return {
    title: `${sampleProduct.name} | Silveri`,
    description: sampleProduct.description.slice(0, 160),
  };
}

export default function ProductPage() {
  const product = sampleProduct;
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description,
    brand: { '@type': 'Brand', name: 'Silveri' },
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'INR', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-gold transition-colors">{product.category}</Link>
            <ChevronRight size={14} />
            <span className="text-warm-black">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Gallery / 3D Viewer */}
            <ProductGallery product={product} />


            <div>
              <span className="inline-block bg-gold/15 text-gold-dark text-xs font-medium px-3 py-1 rounded-full mb-3">{product.material}</span>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-medium text-warm-black mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={16} className={s <= 4 ? 'fill-gold text-gold' : 'text-silver'} />))}
                </div>
                <span className="text-sm text-muted">({sampleReviews.length} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-semibold text-warm-black">₹{product.price.toLocaleString('en-IN')}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <>
                    <span className="text-lg text-muted line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className={`text-sm mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </p>
              {product.weight && <p className="text-sm text-muted mb-6">Weight: {product.weight}g</p>}

              <ProductDetailClient product={product} />

              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-silver/30">
                <div className="text-center"><Shield size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">Certified Silver</p></div>
                <div className="text-center"><Truck size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">Free Shipping ₹999+</p></div>
                <div className="text-center"><RotateCcw size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">7-Day Returns</p></div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-silver/30 pt-8 max-w-3xl">
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Description</h3>
            <p className="text-muted text-sm leading-relaxed mb-8">{product.description}</p>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Care & Details</h3>
            <ul className="text-muted text-sm leading-relaxed space-y-2 mb-8">
              <li>Store in a cool, dry place away from direct sunlight</li>
              <li>Clean with a soft, dry cloth after wearing</li>
              <li>Avoid contact with perfume, lotion, or chemicals</li>
            </ul>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Shipping Info</h3>
            <ul className="text-muted text-sm leading-relaxed space-y-2">
              <li>Free shipping on orders above ₹999</li>
              <li>Standard delivery: 5-7 business days</li>
              <li>Express delivery: 2-3 business days</li>
            </ul>
          </div>

          <section className="mt-12">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-warm-black mb-6">Customer Reviews</h2>
            <div className="max-w-2xl">
              {sampleReviews.map((review, i) => (<ReviewCard key={i} {...review} />))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
