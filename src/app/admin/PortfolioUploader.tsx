"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import Image from "next/image";

interface UploadState {
  status: "idle" | "uploading" | "success" | "error";
  message?: string;
  url?: string;
}

export default function PortfolioUploader() {
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("portfolio");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadState({ status: "error", message: "Only image files are supported." });
      return;
    }
    selectedFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setUploadState({ status: "idle" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFileRef.current) {
      setUploadState({ status: "error", message: "Please select a file first." });
      return;
    }

    setUploadState({ status: "uploading" });

    const formData = new FormData();
    formData.append("file", selectedFileRef.current);
    formData.append("title", title || selectedFileRef.current.name.split(".")[0]);
    formData.append("category", category);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadState({
        status: "success",
        message: "Image uploaded successfully!",
        url: data.url,
      });
      setPreview(null);
      setTitle("");
      selectedFileRef.current = null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadState({ status: "error", message });
    }
  };

  const reset = () => {
    setUploadState({ status: "idle" });
    setPreview(null);
    setTitle("");
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {!preview && uploadState.status !== "success" && (
        <div
          className={`border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-lamborghini-gold bg-lamborghini-gold/5"
              : "border-white/20 hover:border-white/40 hover:bg-white/[0.02]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-smoke mb-4" />
          <p className="text-smoke mb-2 text-sm">
            Drag &amp; drop an image, or click to browse
          </p>
          <p className="text-white/30 text-xs">JPEG, PNG, WebP &middot; Max 10MB</p>
          <p className="text-white/30 text-xs mt-1">
            WebP thumbnails auto-generated on upload
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full aspect-video overflow-hidden">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <button
            onClick={reset}
            className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-black transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Success State */}
      {uploadState.status === "success" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
          <p className="text-emerald-400 font-medium">Image uploaded successfully!</p>
          <button
            onClick={reset}
            className="text-smoke text-sm underline underline-offset-4 hover:text-white transition-colors"
          >
            Upload another
          </button>
        </div>
      )}

      {/* Metadata Inputs */}
      {preview && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Image title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-smoke focus:outline-none focus:border-white/30 transition-colors"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
          >
            <option value="portfolio">Portfolio</option>
            <option value="bridal">Bridal</option>
            <option value="arabic">Arabic</option>
            <option value="traditional">Traditional</option>
            <option value="indo-arabic">Indo-Arabic</option>
          </select>
        </div>
      )}

      {/* Error Message */}
      {uploadState.status === "error" && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadState.message}</span>
        </div>
      )}

      {/* Upload Button */}
      {preview && (
        <button
          onClick={handleUpload}
          disabled={uploadState.status === "uploading"}
          className="w-full bg-lamborghini-gold text-black px-6 py-3 uppercase text-sm font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploadState.status === "uploading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload to Cloudinary"
          )}
        </button>
      )}
    </div>
  );
}
