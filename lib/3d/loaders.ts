'use client';

import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

/**
 * Load an .obj file and return a Three.js Group
 */
export async function loadOBJ(url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => resolve(obj),
      undefined,
      (error) => reject(error)
    );
  });
}

/**
 * Load a .3dm (Rhino) file and convert to Three.js BufferGeometry
 * Uses rhino3dm WASM library loaded from CDN
 */
export async function load3DM(url: string): Promise<THREE.Group> {
  // Load rhino3dm from CDN to avoid bundler issues with WASM
  const rhino3dmScript = 'https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/rhino3dm.min.js';

  // Load the script dynamically if not already loaded
  const win = window as unknown as Record<string, unknown>;
  if (!win.rhino3dm) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = rhino3dmScript;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load rhino3dm library'));
      document.head.appendChild(script);
    });
  }

  // Initialize rhino3dm
  const rhino3dm = await (win as unknown as { rhino3dm: () => Promise<Record<string, unknown>> }).rhino3dm();

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const doc = (rhino3dm as Record<string, unknown> & { File3dm: { fromByteArray: (arr: Uint8Array) => Record<string, unknown> } }).File3dm.fromByteArray(new Uint8Array(buffer));

  const group = new THREE.Group();

  const objects = (doc as Record<string, () => Record<string, unknown>>).objects() as { count: number; get: (i: number) => Record<string, () => Record<string, unknown>> };
  for (let i = 0; i < objects.count; i++) {
    const obj = objects.get(i);
    const geometry = obj.geometry() as Record<string, unknown>;

    if (geometry.objectType === 32) {
      // Mesh object type
      const vertices = (geometry as Record<string, () => { count: number; get: (i: number) => number[] }>).vertices();
      const faces = (geometry as Record<string, () => { count: number; get: (i: number) => number[] }>).faces();

      const bufferGeometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const indices: number[] = [];

      for (let v = 0; v < vertices.count; v++) {
        const pt = vertices.get(v);
        positions.push(pt[0], pt[1], pt[2]);
      }

      for (let f = 0; f < faces.count; f++) {
        const face = faces.get(f);
        indices.push(face[0], face[1], face[2]);
        if (face.length === 4) {
          indices.push(face[0], face[2], face[3]);
        }
      }

      bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      bufferGeometry.setIndex(indices);
      bufferGeometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.15,
      });

      const mesh = new THREE.Mesh(bufferGeometry, material);
      group.add(mesh);
    }
  }

  // Auto-center and scale
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = 2 / maxDim;
    group.position.sub(center);
    group.scale.multiplyScalar(scale);
  }

  return group;
}

/**
 * Apply jewelry-grade metallic material to all meshes
 */
function applyJewelryMaterial(group: THREE.Group) {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.9,
        roughness: 0.15,
      });
    }
  });
}

/**
 * Auto-center and normalize scale of a model
 */
function normalizeModel(group: THREE.Group) {
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const scale = 2 / maxDim;
    group.position.sub(center);
    group.scale.multiplyScalar(scale);
  }
}

/**
 * Auto-detect file type and load
 */
export async function loadModel(url: string, fileName: string): Promise<THREE.Group> {
  const ext = fileName.toLowerCase().split('.').pop();

  if (ext === 'obj') {
    const group = await loadOBJ(url);
    normalizeModel(group);
    applyJewelryMaterial(group);
    return group;
  }

  if (ext === '3dm') {
    return load3DM(url);
  }

  throw new Error(`Unsupported file format: .${ext}. Use .obj or .3dm files.`);
}
