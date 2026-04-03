'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Upload, File, Eye, Trash2, X, Box, Search, Plus } from 'lucide-react';

const JewelryViewer = dynamic(() => import('@/components/3d/JewelryViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-[#242424] rounded-xl flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Model3D {
  id: string;
  name: string;
  fileName: string;
  url: string;
  size: number;
  productName: string;
  productId: string;
  uploadedAt: string;
  format: string;
}

// Sample data
const sampleModels: Model3D[] = [
  {
    id: 'm1',
    name: 'Silver Elegance Ring',
    fileName: 'ring_silver_elegance.obj',
    url: '',
    size: 2400000,
    productName: 'Silver Elegance Ring',
    productId: 'P001',
    uploadedAt: '2024-03-15',
    format: 'OBJ',
  },
  {
    id: 'm2',
    name: 'Luna Necklace',
    fileName: 'luna_necklace.3dm',
    url: '',
    size: 5800000,
    productName: 'Luna Necklace',
    productId: 'P002',
    uploadedAt: '2024-03-12',
    format: '3DM',
  },
  {
    id: 'm3',
    name: 'Aria Earrings',
    fileName: 'aria_earrings.obj',
    url: '',
    size: 1900000,
    productName: 'Aria Earrings',
    productId: 'P003',
    uploadedAt: '2024-03-10',
    format: 'OBJ',
  },
];

const PRODUCTS = [
  { id: 'P001', name: 'Silver Elegance Ring' },
  { id: 'P002', name: 'Luna Necklace' },
  { id: 'P003', name: 'Aria Earrings' },
  { id: 'P004', name: 'Charm Bracelet' },
  { id: 'P005', name: 'Twist Anklet' },
  { id: 'P006', name: 'Solitaire Ring' },
  { id: 'P007', name: 'Pearl Pendant' },
];

export default function Admin3DModelsPage() {
  const [models, setModels] = useState<Model3D[]>(sampleModels);
  const [search, setSearch] = useState('');
  const [previewModel, setPreviewModel] = useState<Model3D | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadState, setUploadState] = useState({
    selectedProduct: '',
    file: null as File | null,
    uploading: false,
    error: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.fileName.toLowerCase().includes(search.toLowerCase()) ||
      m.format.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['obj', '3dm'].includes(ext || '')) {
      setUploadState((s) => ({ ...s, error: 'Only .obj and .3dm files are supported' }));
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadState((s) => ({ ...s, error: 'File size must be under 50MB' }));
      return;
    }

    setUploadState((s) => ({ ...s, file, error: '' }));
  };

  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.selectedProduct) return;

    setUploadState((s) => ({ ...s, uploading: true }));

    // Simulate upload — in production, this uploads to Firebase Storage
    await new Promise((r) => setTimeout(r, 1500));

    const product = PRODUCTS.find((p) => p.id === uploadState.selectedProduct);
    const ext = uploadState.file.name.split('.').pop()?.toUpperCase() || '';
    const localUrl = URL.createObjectURL(uploadState.file);

    const newModel: Model3D = {
      id: `m${Date.now()}`,
      name: product?.name || 'Untitled',
      fileName: uploadState.file.name,
      url: localUrl,
      size: uploadState.file.size,
      productName: product?.name || 'Untitled',
      productId: uploadState.selectedProduct,
      uploadedAt: new Date().toISOString().split('T')[0],
      format: ext,
    };

    setModels((prev) => [newModel, ...prev]);
    setUploadState({ selectedProduct: '', file: null, uploading: false, error: '' });
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this 3D model?')) return;
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (previewModel?.id === id) setPreviewModel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Box size={22} className="text-gold" />
            3D Model Manager
          </h1>
          <p className="text-sm text-[#888] mt-1">Upload and manage .obj and .3dm jewelry models</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-warm-black text-sm font-medium rounded-xl hover:bg-gold-light transition-colors"
        >
          <Plus size={16} /> Upload Model
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-4">
          <p className="text-2xl font-semibold text-white">{models.length}</p>
          <p className="text-sm text-[#888]">Total Models</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-4">
          <p className="text-2xl font-semibold text-white">{models.filter((m) => m.format === 'OBJ').length}</p>
          <p className="text-sm text-[#888]">.OBJ Files</p>
        </div>
        <div className="bg-[#242424] border border-[#333] rounded-xl p-4">
          <p className="text-2xl font-semibold text-white">{models.filter((m) => m.format === '3DM').length}</p>
          <p className="text-sm text-[#888]">.3DM Files (Rhino)</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#242424] border border-[#333] rounded-xl text-sm text-white placeholder-[#666] focus:outline-none focus:border-gold"
        />
      </div>

      {/* 3D Preview Area */}
      {previewModel && previewModel.url && (
        <div className="rounded-xl overflow-hidden border border-[#333]">
          <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-[#333]">
            <div className="flex items-center gap-3">
              <Eye size={16} className="text-gold" />
              <div>
                <p className="text-sm text-white font-medium">{previewModel.name}</p>
                <p className="text-xs text-[#888]">{previewModel.fileName} • {previewModel.format}</p>
              </div>
            </div>
            <button onClick={() => setPreviewModel(null)} className="text-[#888] hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <JewelryViewer
            modelUrl={previewModel.url}
            fileName={previewModel.fileName}
            className="h-[400px]"
            autoRotate={true}
          />
        </div>
      )}

      {/* Model Table */}
      <div className="bg-[#242424] border border-[#333] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#333] text-left">
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Model</th>
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Format</th>
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Size</th>
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Uploaded</th>
              <th className="px-5 py-3 text-[#888] font-medium text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((model) => (
              <tr key={model.id} className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                      <File size={16} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{model.fileName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#ccc]">{model.productName}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    model.format === 'OBJ'
                      ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                      : 'bg-purple-900/30 text-purple-400 border border-purple-800'
                  }`}>
                    .{model.format}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#888]">{formatSize(model.size)}</td>
                <td className="px-5 py-3 text-[#888]">{model.uploadedAt}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setPreviewModel(previewModel?.id === model.id ? null : model)}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        previewModel?.id === model.id
                          ? 'bg-gold text-warm-black'
                          : 'hover:bg-[#333] text-[#888] hover:text-white'
                      }`}
                      title="Preview 3D"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-red-900/30 text-[#888] hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Box size={32} className="mx-auto text-[#444] mb-3" />
            <p className="text-[#888] text-sm">No 3D models found</p>
            <p className="text-[#666] text-xs mt-1">Upload .obj or .3dm files to get started</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowUploadModal(false)} />
          <div className="relative bg-[#1e1e1e] border border-[#333] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Upload size={18} className="text-gold" />
                Upload 3D Model
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#888] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Product */}
              <div>
                <label className="block text-sm text-[#aaa] mb-2">Assign to Product</label>
                <select
                  value={uploadState.selectedProduct}
                  onChange={(e) => setUploadState((s) => ({ ...s, selectedProduct: e.target.value }))}
                  className="w-full bg-[#242424] border border-[#444] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-gold"
                >
                  <option value="">Select a product...</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* File Drop Zone */}
              <div>
                <label className="block text-sm text-[#aaa] mb-2">3D File (.obj or .3dm)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#444] hover:border-gold rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".obj,.3dm"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploadState.file ? (
                    <div className="flex items-center justify-center gap-3">
                      <File size={20} className="text-gold" />
                      <div className="text-left">
                        <p className="text-sm text-white">{uploadState.file.name}</p>
                        <p className="text-xs text-[#888]">{formatSize(uploadState.file.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto mb-2 text-[#666]" />
                      <p className="text-sm text-[#aaa]">Click to select .obj or .3dm file</p>
                      <p className="text-xs text-[#666] mt-1">Max 50MB</p>
                    </>
                  )}
                </div>
              </div>

              {/* Error */}
              {uploadState.error && (
                <p className="text-red-400 text-sm">{uploadState.error}</p>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!uploadState.file || !uploadState.selectedProduct || uploadState.uploading}
                className="w-full bg-gold text-warm-black py-3 rounded-lg font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadState.uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-warm-black border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload Model
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
