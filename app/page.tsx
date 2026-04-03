import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';

// Sample data — will be replaced with Firestore data
const featuredProducts = [
  { id: '1', name: 'Silver Moonlight Ring', slug: 'silver-moonlight-ring', price: 2499, comparePrice: 3999, image: '', material: 'Sterling Silver' },
  { id: '2', name: 'Gold Plated Pendant', slug: 'gold-plated-pendant', price: 3499, comparePrice: 4999, image: '', material: 'Gold Plated' },
  { id: '3', name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', price: 1999, comparePrice: 2999, image: '', material: 'Silver & Pearl' },
  { id: '4', name: 'Twisted Silver Bracelet', slug: 'twisted-silver-bracelet', price: 2999, comparePrice: 4499, image: '', material: 'Sterling Silver' },
];

const exploreCategories = [
  { name: 'Wedding', slug: 'wedding', image: '' },
  { name: 'Gift', slug: 'gift', image: '' },
  { name: 'Anniversary', slug: 'anniversary', image: '' },
];

export default function HomePage() {
  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-gradient-to-br from-[#F4A261] via-[#E89050] to-[#E07A3A] min-h-[400px] md:min-h-[500px] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl lg:text-7xl font-light text-warm-black mb-4">
            Timeless <span className="font-medium">Elegance</span>
          </h1>
          <p className="text-warm-black/80 text-lg md:text-xl max-w-xl mx-auto mb-8 font-light">
            Discover our handcrafted collection of luxury silver jewelry for every occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 bg-warm-black text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-warm-black/90 transition-colors"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm text-warm-black px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white/50 transition-colors border border-warm-black/20"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FEATURED PRODUCTS SECTION ====== */}
      <section className="bg-[#4A55D4] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-white mb-2">
              Featured Products
            </h2>
            <p className="text-white/70 text-sm">Handpicked pieces from our collection</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-square bg-silver/30">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-silver/40 to-silver/20">
                      <span className="text-muted text-xs">Product Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted">{product.material}</p>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-medium text-warm-black mt-0.5 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-warm-black font-semibold text-sm">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.comparePrice && (
                      <span className="text-muted text-xs line-through">
                        ₹{product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 text-white border border-white/40 px-6 py-2.5 rounded-full text-sm hover:bg-white/10 transition-colors"
            >
              View All Products
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== EXPLORE PRODUCTS SECTION ====== */}
      <section className="bg-[#4A55D4] py-12 md:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-white mb-2">
              Explore Products
            </h2>
            <p className="text-white/70 text-sm">Shop by occasion</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {exploreCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group text-center"
              >
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-white mb-3 group-hover:text-gold transition-colors">
                  {cat.name}
                </h3>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#00D4FF] shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-warm-black/40 text-sm">Category Image</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== NEW ARRIVALS SECTION ====== */}
      <section className="bg-cream py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-warm-black">
                New Arrivals
              </h2>
              <p className="text-muted text-sm mt-1">Just added to our collection</p>
            </div>
            <Link
              href="/category/new-arrivals"
              className="text-gold text-sm font-medium hover:text-gold-dark transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={`new-${product.id}`}
                href={`/product/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-silver/30"
              >
                <div className="relative aspect-square bg-silver/20">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-silver/30 to-silver/10">
                    <span className="text-muted text-xs">Product Image</span>
                  </div>
                  <span className="absolute top-2 left-2 bg-gold text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    NEW
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-medium text-warm-black line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-warm-black font-semibold text-sm">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== NEWSLETTER CTA ====== */}
      <section className="bg-warm-black py-12 md:py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-gold mb-3">
            Stay Connected
          </h2>
          <p className="text-silver text-sm mb-6">
            Subscribe for exclusive offers, new arrivals, and styling tips.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-full px-5 py-3 text-sm text-white placeholder-muted outline-none focus:border-gold transition-colors"
            />
            <button
              type="button"
              className="bg-gold text-warm-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
