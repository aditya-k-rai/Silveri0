'use client';

import { Component, ReactNode, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Box, ImageIcon, AlertTriangle } from 'lucide-react';

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

// Error boundary to catch 3D viewer crashes
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
        <div className="aspect-square bg-silver/20 rounded-xl flex flex-col items-center justify-center gap-3">
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
  colour: string;
  model3dFileName: string | null;
}

export default function ProductGallery({ name, primaryImage, hoverImage, colour, model3dFileName }: ProductGalleryProps) {
  // Only enable 3D if the filename looks like a real uploaded model URL (not just a placeholder name)
  const has3D = !!model3dFileName && (
    model3dFileName.startsWith('http') || model3dFileName.startsWith('/')
  );
  // Always default to images — 3D is opt-in
  const [viewMode, setViewMode] = useState<'images' | '3d'>('images');
  const [viewerFailed, setViewerFailed] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const images = [primaryImage, hoverImage].filter(Boolean) as string[];

  const materialPreset = colour.toLowerCase().includes('gold')
    ? colour.toLowerCase().includes('rose')
      ? 'rose-gold'
      : 'gold'
    : colour.toLowerCase().includes('platinum')
    ? 'platinum'
    : 'silver';

  const modelUrl = model3dFileName || '';

  // If 3D failed, force images mode
  const show3D = viewMode === '3d' && has3D && !viewerFailed;

  return (
    <div className="space-y-4">
      {/* Toggle Buttons (only show if valid 3D model exists and hasn't failed) */}
      {has3D && !viewerFailed && (
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

      {/* 3D Viewer (wrapped in error boundary) */}
      {show3D ? (
        <ViewerErrorBoundary onError={() => { setViewerFailed(true); setViewMode('images'); }}>
          <JewelryViewer
            modelUrl={modelUrl}
            fileName={model3dFileName!}
            className="aspect-square"
            materialPreset={materialPreset as 'silver' | 'gold' | 'rose-gold' | 'platinum'}
            autoRotate={true}
          />
        </ViewerErrorBoundary>
      ) : (
        /* Image Gallery */
        <>
          <div className="aspect-square bg-silver/20 rounded-xl flex items-center justify-center relative overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[activeThumb] || images[0]}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <span className="text-muted">Product Image</span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden relative cursor-pointer transition-colors ${
                    activeThumb === i ? 'border-gold' : 'border-transparent hover:border-gold/50'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
