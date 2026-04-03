'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, ImageIcon } from 'lucide-react';

// Dynamically import 3D viewer (heavy — only load when needed)
const JewelryViewer = dynamic(() => import('@/components/3d/JewelryViewer'), {
  ssr: false,
  loading: () => (
    <div className="aspect-square bg-silver/20 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-muted text-sm">Loading 3D viewer...</span>
      </div>
    </div>
  ),
});

interface ProductGalleryProps {
  product: {
    name: string;
    images: string[];
    material: string;
    model3d: { url: string; fileName: string } | null;
  };
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [viewMode, setViewMode] = useState<'images' | '3d'>(
    product.model3d ? '3d' : 'images'
  );

  const materialPreset = product.material.toLowerCase().includes('gold')
    ? product.material.toLowerCase().includes('rose')
      ? 'rose-gold'
      : 'gold'
    : product.material.toLowerCase().includes('platinum')
    ? 'platinum'
    : 'silver';

  return (
    <div className="space-y-4">
      {/* Toggle Buttons (only show if model exists) */}
      {product.model3d && (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === '3d'
                ? 'bg-gold text-warm-black'
                : 'bg-silver/30 text-muted hover:bg-silver/50'
            }`}
          >
            <Box size={16} />
            3D View
          </button>
          <button
            onClick={() => setViewMode('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'images'
                ? 'bg-gold text-warm-black'
                : 'bg-silver/30 text-muted hover:bg-silver/50'
            }`}
          >
            <ImageIcon size={16} />
            Photos
          </button>
        </div>
      )}

      {/* 3D Viewer */}
      {viewMode === '3d' && product.model3d ? (
        <JewelryViewer
          modelUrl={product.model3d.url}
          fileName={product.model3d.fileName}
          className="aspect-square"
          materialPreset={materialPreset as 'silver' | 'gold' | 'rose-gold' | 'platinum'}
          autoRotate={true}
        />
      ) : (
        /* Image Gallery */
        <>
          <div className="aspect-square bg-silver/20 rounded-xl flex items-center justify-center relative">
            <span className="text-muted">Product Image</span>
            {product.model3d && (
              <button
                onClick={() => setViewMode('3d')}
                className="absolute bottom-4 right-4 bg-warm-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium hover:bg-warm-black transition-colors"
              >
                <Box size={14} />
                View in 3D
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-20 h-20 bg-silver/20 rounded-lg flex items-center justify-center border-2 border-transparent hover:border-gold cursor-pointer transition-colors"
              >
                <span className="text-muted text-[10px]">{i}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
