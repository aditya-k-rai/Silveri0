"use client";

import React, { useState } from "react";
import { Upload, MessageCircle, Info, Sparkles, Send, Box, Camera, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Simulated Pricing Rates per gram (INR)
const PURITY_RATES: Record<string, number> = {
  "24K Gold": 7200,
  "22K Gold": 6700,
  "18K Gold": 5500,
  "925 Silver": 95,
  "Platinum": 3200,
};

// Simulated Making Charges per gram (INR) based on complexity
const COMPLEXITY_MAKING_CHARGE: Record<string, number> = {
  "Simple": 500,
  "Moderate": 850,
  "Intricate": 1500,
};

export default function CustomJewelryPage() {
  const [purity, setPurity] = useState("18K Gold");
  const [weight, setWeight] = useState(10);
  const [size, setSize] = useState("");
  const [complexity, setComplexity] = useState("Moderate");
  
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Estimations
  const estimatedMaterialCost = PURITY_RATES[purity] * weight;
  const estimatedMakingCharge = COMPLEXITY_MAKING_CHARGE[complexity] * weight;
  const estimatedTotal = estimatedMaterialCost + estimatedMakingCharge;

  const handleSimulateUpload = () => {
    if (images.length >= 3) return;
    const mockImages = [
      "https://images.unsplash.com/photo-1599643478514-4a52023961c2?w=500&q=80",
      "https://images.unsplash.com/photo-1515562141207-7a8ea4114e17?w=500&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=500&q=80"
    ];
    setImages([...images, mockImages[images.length]]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this saves to Firebase and alerts the admin panel
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#E8E8E8] max-w-lg w-full text-center shadow-xl">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A] mb-4">Request Sent Successfully!</h1>
            <p className="text-[#7A7585] mb-8 leading-relaxed">
              Our master artisans are reviewing your custom design request. We will contact you at <strong>{whatsapp}</strong> via WhatsApp shortly to discuss fine details and finalize the quote.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full py-3.5 bg-[#1A1A1A] text-white rounded-xl font-medium hover:bg-black transition-colors"
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col font-[family-name:var(--font-body)]">
      
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-semibold tracking-wide uppercase mb-3">
            Bespoke Services
          </span>
          <h1 className="text-4xl lg:text-5xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A] mb-4">
            Create Your Custom Jewelry
          </h1>
          <p className="text-lg text-[#7A7585]">
            Have a dream design in mind? Share your references, choose your materials, and let our master artisans bring your imagination to life.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
          
          {/* Left Column: The Form */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* Design References */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E8E8] shadow-sm">
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A] mb-1">Design References</h2>
              <p className="text-sm text-[#7A7585] mb-6">Upload 2-3 pictures defining the style, shape, or inspiration.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((slot) => (
                  <div key={slot} className="aspect-square relative rounded-2xl overflow-hidden border-2 border-dashed border-[#E8E8E8] bg-[#FDFAF5]">
                    {images[slot] ? (
                      <div className="w-full h-full relative group">
                        <Image src={images[slot]} alt="Reference" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => removeImage(slot)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={handleSimulateUpload}
                        className="w-full h-full flex flex-col items-center justify-center text-[#A09DAB] hover:text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all outline-none"
                      >
                        <Camera size={24} className="mb-2" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Upload</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Specifications */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E8E8] shadow-sm space-y-6">
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">Material Specifications</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Metal Purity</label>
                  <select 
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full bg-[#F5F3EF] border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 appearance-none"
                  >
                    {Object.keys(PURITY_RATES).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Ring/Chain Size <span className="text-xs font-normal text-[#7A7585]">(Optional)</span></label>
                  <input 
                    type="text" 
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. US 7, 18 Inch"
                    className="w-full bg-[#F5F3EF] border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-[#1A1A1A]">Target Weight</label>
                  <span className="text-[#C9A84C] font-semibold bg-[#C9A84C]/10 px-3 py-1 rounded-full text-sm">{weight} Grams</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="100" 
                  step="1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-[#E8E8E8] rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
                />
                <div className="flex justify-between text-xs text-[#A09DAB] mt-2">
                  <span>Light (2g)</span>
                  <span>Heavy (100g)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Design Complexity</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.keys(COMPLEXITY_MAKING_CHARGE).map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setComplexity(level)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        complexity === level 
                        ? 'bg-[#1A1A1A] text-white shadow-md' 
                        : 'bg-[#F5F3EF] text-[#7A7585] hover:bg-[#E8E8E8]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact Details */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E8E8] shadow-sm space-y-6">
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">Contact & Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Design Notes</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us exactly what you want crafted. Emphasize stones, engravings, or specific details..."
                  rows={4}
                  className="w-full bg-[#F5F3EF] border border-[#E8E8E8] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MessageCircle size={18} className="text-[#A09DAB]" />
                  </div>
                  <input 
                    required
                    type="tel" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F5F3EF] border border-[#E8E8E8] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                  />
                </div>
                <p className="text-xs text-[#7A7585] mt-2 flex items-center gap-1.5">
                  <Info size={12} /> We will strictly contact you on WhatsApp to discuss quotes.
                </p>
              </div>
            </section>

          </div>

          {/* Right Column: Dynamic Quote Estimator (Sticky) */}
          <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
            <div className="bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                <Box size={100} className="text-[#C9A84C]" />
              </div>

              <h3 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6 relative z-10">Quote Estimator</h3>
              
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Estimated Material Cost</span>
                  <span className="font-semibold">₹{estimatedMaterialCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Estimated Making Charges</span>
                  <span className="font-semibold">₹{estimatedMakingCharge.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="pt-4 mt-2 border-t border-white/20">
                  <div className="flex justify-between items-end">
                    <span className="text-white">Estimated Total</span>
                    <span className="text-3xl font-[family-name:var(--font-heading)] font-bold text-[#C9A84C]">
                      ₹{estimatedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-2 text-right">
                    *Approximate cost based on inputs. Final quote provided via WhatsApp.
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={images.length === 0 || !description || !whatsapp}
                className="w-full bg-[#C9A84C] text-[#1A1A1A] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#E8C56C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 relative shadow-[0_0_20px_rgba(201,168,76,0.3)]"
              >
                <Send size={18} />
                Submit Custom Request
              </button>

            </div>
          </div>

        </form>
      </main>

    </div>
  );
}
