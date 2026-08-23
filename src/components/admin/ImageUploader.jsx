import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { Upload, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ImageUploader({ folder, initialUrl, onUploadComplete, label }) {
  const { currentUser, isAdmin } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || '');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync with initial URL if it changes (e.g., when editing different items)
  useEffect(() => {
    if (initialUrl && !selectedFile) {
      setPreviewUrl(initialUrl);
      setSuccess(true);
    } else if (!initialUrl) {
      setPreviewUrl('');
      setSuccess(false);
      setSelectedFile(null);
    }
  }, [initialUrl, selectedFile]);

  const handleUpload = (file) => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    if (!currentUser || !isAdmin) {
      setError('Unauthorized: Only administrators can upload files.');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    // Build unique storage path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Track upload progress
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(percent);
      },
      (err) => {
        // Error callback
        console.error('Firebase Storage Upload Error:', err);
        setError(`Upload failed: ${err.message}`);
        setUploading(false);
      },
      async () => {
        // Success callback
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPreviewUrl(downloadUrl);
          setSuccess(true);
          setUploading(false);
          setSelectedFile(null);
          // Notify parent component
          if (onUploadComplete) {
            onUploadComplete(downloadUrl);
          }
        } catch (downloadErr) {
          setError(`Failed to retrieve download URL: ${downloadErr.message}`);
          setUploading(false);
        }
      }
    );
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError('');
    setSuccess(false);
    setProgress(0);

    // Validate type (must be image)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Validate size (limit to 3MB)
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      setError('File is too large! Maximum allowed size is 3MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Start auto-upload
    handleUpload(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(initialUrl || '');
    setProgress(0);
    setError('');
    setSuccess(!!initialUrl);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label || 'Upload Image'}</label>
        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-500 hover:text-white transition-colors p-1"
            title="Reset"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Image Preview Window */}
      <div className="relative w-full aspect-[16/9] rounded-lg bg-slate-900/60 border border-dashed border-slate-800 overflow-hidden flex items-center justify-center group">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-600">
            <Upload className="w-8 h-8 stroke-1" />
            <span className="text-[9px] uppercase font-bold tracking-wider">No Image Preview</span>
          </div>
        )}

        {/* Uploading progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 p-4">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <div className="w-full max-w-[150px] bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Uploading: {progress}%</span>
          </div>
        )}
      </div>

      {/* File Input Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <label className="flex-1 cursor-pointer">
            <div className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-center border border-slate-800 rounded-lg p-2 text-xs font-bold transition-all truncate">
              {selectedFile ? selectedFile.name : 'Choose File'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelection}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Helper Instructions / Status messages */}
        {error && (
          <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && !selectedFile && (
          <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Image Ready & Verified</span>
          </div>
        )}

        {!selectedFile && !error && !success && (
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
            Supports PNG, JPG, WEBP, GIF (Max 3MB)
          </span>
        )}
      </div>
    </div>
  );
}
