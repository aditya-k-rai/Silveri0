'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Eye, Trash2, Box } from 'lucide-react';
import JewelryViewer from './JewelryViewer';

interface ModelFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface ModelUploaderProps {
  existingModels?: ModelFile[];
  onUpload?: (file: File) => Promise<string>;
  onDelete?: (modelId: string) => Promise<void>;
}

const ACCEPTED_FORMATS = '.obj,.3dm';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ModelUploader({
  existingModels = [],
  onUpload,
  onDelete,
}: ModelUploaderProps) {
  const [models, setModels] = useState<ModelFile[]>(existingModels);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewModel, setPreviewModel] = useState<ModelFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.toLowerCase().split('.').pop();
    if (!['obj', '3dm'].includes(ext || '')) {
      return `Unsupported format: .${ext}. Only .obj and .3dm files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB.`;
    }
    return null;
  };

  const handleUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      let url: string;

      if (onUpload) {
        url = await onUpload(file);
      } else {
        // Create local blob URL for preview (demo mode)
        url = URL.createObjectURL(file);
      }

      const newModel: ModelFile = {
        id: `model_${Date.now()}`,
        name: file.name,
        url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setModels((prev) => [...prev, newModel]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDelete = async (modelId: string) => {
    if (!confirm('Delete this 3D model?')) return;

    try {
      if (onDelete) {
        await onDelete(modelId);
      }
      setModels((prev) => prev.filter((m) => m.id !== modelId));
      if (previewModel?.id === modelId) setPreviewModel(null);
    } catch {
      setError('Failed to delete model');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Box size={16} className="text-gold" />
          3D Models
        </h3>
        <span className="text-xs text-[#888]">
          Supports .obj, .3dm • Max 50MB
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-gold bg-gold/5'
            : 'border-[#444] hover:border-[#666] bg-[#1e1e1e]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload size={24} className={`mx-auto mb-2 ${isDragging ? 'text-gold' : 'text-[#666]'}`} />
        <p className="text-sm text-[#aaa]">
          {uploading ? (
            <span className="text-gold">Uploading...</span>
          ) : isDragging ? (
            <span className="text-gold">Drop 3D file here</span>
          ) : (
            <>Drag & drop <strong className="text-white">.obj</strong> or <strong className="text-white">.3dm</strong> file, or click to browse</>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-2 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError(null)}><X size={14} className="text-red-400" /></button>
        </div>
      )}

      {/* Model List */}
      {models.length > 0 && (
        <div className="space-y-2">
          {models.map((model) => (
            <div
              key={model.id}
              className={`bg-[#242424] border rounded-lg p-3 flex items-center gap-3 transition-colors ${
                previewModel?.id === model.id ? 'border-gold' : 'border-[#333]'
              }`}
            >
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                <File size={18} className="text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{model.name}</p>
                <p className="text-xs text-[#888]">
                  {formatFileSize(model.size)} • {model.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setPreviewModel(previewModel?.id === model.id ? null : model)}
                  className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                    previewModel?.id === model.id ? 'bg-gold text-warm-black' : 'hover:bg-[#333] text-[#888]'
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
            </div>
          ))}
        </div>
      )}

      {/* 3D Preview */}
      {previewModel && (
        <div className="rounded-xl overflow-hidden border border-[#333]">
          <div className="bg-[#1a1a1a] px-3 py-2 flex items-center justify-between border-b border-[#333]">
            <span className="text-xs text-[#aaa] flex items-center gap-2">
              <Eye size={12} /> Preview: {previewModel.name}
            </span>
            <button onClick={() => setPreviewModel(null)} className="text-[#888] hover:text-white">
              <X size={14} />
            </button>
          </div>
          <JewelryViewer
            modelUrl={previewModel.url}
            fileName={previewModel.name}
            className="h-[350px]"
            autoRotate={true}
          />
        </div>
      )}
    </div>
  );
}
