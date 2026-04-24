'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { loadModel } from '@/lib/3d/loaders';
import {
  RotateCcw,
  Maximize2,
  Eye,
  Loader2,
} from 'lucide-react';

interface JewelryViewerProps {
  modelUrl: string;
  fileName: string;
  className?: string;
  showControls?: boolean;
  autoRotate?: boolean;
  materialPreset?: 'silver' | 'gold' | 'rose-gold' | 'platinum';
}

const MATERIAL_PRESETS = {
  silver: { color: 0xc0c0c0, metalness: 0.95, roughness: 0.1 },
  gold: { color: 0xc9a84c, metalness: 0.95, roughness: 0.08 },
  'rose-gold': { color: 0xb76e79, metalness: 0.95, roughness: 0.1 },
  platinum: { color: 0xe5e4e2, metalness: 0.98, roughness: 0.05 },
};

function ModelLoader({
  modelUrl,
  fileName,
  materialPreset = 'silver',
  onLoaded,
}: {
  modelUrl: string;
  fileName: string;
  materialPreset: string;
  onLoaded: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadModel(modelUrl, fileName)
      .then((loaded) => {
        if (!cancelled) {
          // Apply material preset
          const preset = MATERIAL_PRESETS[materialPreset as keyof typeof MATERIAL_PRESETS] || MATERIAL_PRESETS.silver;
          loaded.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: preset.color,
                metalness: preset.metalness,
                roughness: preset.roughness,
                envMapIntensity: 1.5,
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setModel(loaded);
          onLoaded();
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load 3D model');
          onLoaded();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [modelUrl, fileName, materialPreset, onLoaded]);

  if (error) {
    return (
      <Html center>
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center max-w-xs">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </Html>
    );
  }

  if (!model) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
          <p className="text-muted text-sm">Loading 3D model...</p>
        </div>
      </Html>
    );
  }

  return <primitive ref={groupRef} object={model} />;
}

export default function JewelryViewer({
  modelUrl,
  fileName,
  className = '',
  showControls = true,
  autoRotate: initialAutoRotate = true,
  materialPreset = 'silver',
}: JewelryViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [activeMaterial, setActiveMaterial] = useState(materialPreset);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-b from-[#f8f6f3] to-[#eae6df] rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      <Canvas
        camera={{ position: [0, 1, 3], fov: 45 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          {/* Lighting — studio setup for jewelry */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-5, 4, -3]} intensity={0.8} color="#ffe4c4" />
          <spotLight position={[0, 10, 0]} intensity={0.6} angle={0.3} penumbra={1} castShadow />
          <pointLight position={[-3, 2, 5]} intensity={0.4} color="#c9a84c" />

          {/* Environment reflections for metallic look */}
          <Environment preset="studio" />

          {/* 3D Model */}
          <ModelLoader
            modelUrl={modelUrl}
            fileName={fileName}
            materialPreset={activeMaterial}
            onLoaded={() => setIsLoading(false)}
          />

          {/* Shadow under model */}
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={5} blur={2.5} />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* 3D Badge */}
      <div className="absolute top-3 left-3 bg-warm-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium">
        <Eye size={14} />
        3D View
      </div>

      {/* Controls Panel */}
      {showControls && !isLoading && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          {/* Material Switcher */}
          <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-sm">
            {(Object.keys(MATERIAL_PRESETS) as Array<keyof typeof MATERIAL_PRESETS>).map((preset) => (
              <button
                key={preset}
                onClick={() => setActiveMaterial(preset)}
                title={preset.charAt(0).toUpperCase() + preset.slice(1).replace('-', ' ')}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  activeMaterial === preset ? 'border-warm-black scale-110' : 'border-transparent hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: `#${MATERIAL_PRESETS[preset].color.toString(16).padStart(6, '0')}`,
                }}
              />
            ))}
          </div>

          {/* View Controls */}
          <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-sm">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Stop rotation' : 'Auto rotate'}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                autoRotate ? 'bg-gold text-warm-black' : 'hover:bg-gray-100 text-muted'
              }`}
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-muted transition-colors"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Interaction Hint */}
      {!isLoading && (
        <div className="absolute top-3 right-3 text-[10px] text-muted/60 bg-white/60 backdrop-blur-sm px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  );
}
