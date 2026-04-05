'use client';

import { Component, ReactNode, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Box, ImageIcon, AlertTriangle } from 'lucide-react';

const JewelryViewer = dynamic(() => import('@/components/3d/JewelryViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square max-w-[520px] bg-silver-100 rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-muted text-sm">Loading 3D viewer...</span>
      </div>
    </div>
  ),
});

class ViewerErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full aspect-square max-w-[520px] bg-silver-100 rounded-2xl flex flex-col items-center justify-center gap-3">
          <AlertTriangle size={32} className="text-muted" />
          <p className="text-muted text-sm">3D model could not be loaded</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ProductGalleryProps {
  name: string;
  primaryImage: string | null;
  hoverImage: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
  colour: string;
  model3dFileName: string | null;
}

export default function ProductGallery({ name, primaryImage, hoverImage, image3, image4, image5, image6, colour, model3dFileName }: ProductGalleryProps) {
  const has3D = !!model3dFileName && (
    model3dFileName.startsWith('http') || model3dFileName.startsWith('/')
  );
  const [viewMode, setViewMode] = useState<'images' | '3d'>('images');
  const [viewerFailed, setViewerFailed] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const images = [primaryImage, hoverImage, image3, image4, image5, image6].filter(Boolean) as string[];

  const materialPreset = colour.toLowerCase().includes('gold')
    ? colour.toLowerCase().includes('rose')
      ? 'rose-gold'
      : 'gold'
    : colour.toLowerCase().includes('platinum')
    ? 'platinum'
    : 'silver';

  const modelUrl = model3dFileName || '';
  const show3D = viewMode === '3d' && has3D && !viewerFailed;

  return (
    <div className="sticky top-24">
      {/* Main Display */}
      <div className="relative w-full max-w-[520px]">
        {show3D ? (
          <ViewerErrorBoundary onError={() => { setViewerFailed(true); setViewMode('images'); }}>
            <JewelryViewer
              modelUrl={modelUrl}
              fileName={model3dFileName!}
              className="aspect-square rounded-2xl"
              materialPreset={materialPreset as 'silver' | 'gold' | 'rose-gold' | 'platinum'}
              autoRotate={true}
            />
          </ViewerErrorBoundary>
        ) : (
          <div className="aspect-square bg-silver-100 rounded-2xl overflow-hidden relative">
            {images.length > 0 ? (
              <Image
                src={images[activeThumb] || images[0]}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 520px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-silver-400 text-sm">Product Image</span>
              </div>
            )}
          </div>
        )}

        {/* View 3D Button — always visible on image when 3D model exists */}
        {has3D && !viewerFailed && (
          <button
            onClick={() => setViewMode(viewMode === '3d' ? 'images' : '3d')}
            className={`absolute top-3 left-3 z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 ${
              viewMode === '3d'
                ? 'bg-gold text-warm-black hover:bg-gold-light'
                : 'bg-white/90 backdrop-blur-md text-silver-800 hover:bg-white border border-silver-200'
            }`}
          >
            {viewMode === '3d' ? (
              <><ImageIcon size={16} /> Photos</>
            ) : (
              <><Box size={16} /> View 3D</>
            )}
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {(images.length > 0 || (has3D && !viewerFailed)) && (
        <div className="flex gap-2 sm:gap-3 mt-4 max-w-[520px] overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setActiveThumb(i); setViewMode('images'); }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden relative cursor-pointer transition-all duration-200 shrink-0 ${
                viewMode === 'images' && activeThumb === i
                  ? 'border-gold shadow-md shadow-gold/20 scale-105'
                  : 'border-silver-200 hover:border-gold/50'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}

          {/* 3D thumbnail */}
          {has3D && !viewerFailed && (
            <button
              onClick={() => setViewMode('3d')}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 shrink-0 ${
                viewMode === '3d'
                  ? 'border-gold bg-gold/10 shadow-md shadow-gold/20 scale-105'
                  : 'border-silver-200 bg-silver-50 hover:border-gold/50'
              }`}
            >
              <Box size={18} className="text-gold" />
              <span className="text-[10px] font-semibold text-silver-600">3D</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
