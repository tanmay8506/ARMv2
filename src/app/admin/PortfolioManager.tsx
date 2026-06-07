"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Power, Save } from "lucide-react";

interface PortfolioAsset {
  id: string;
  title: string;
  category: string;
  cloudinary_path: string;
  width: number;
  height: number;
  display_order: number;
  is_active: boolean;
}

interface PortfolioManagerProps {
  initialAssets: PortfolioAsset[];
  onAssetChange?: () => void;
}

export default function PortfolioManager({
  initialAssets,
  onAssetChange,
}: PortfolioManagerProps) {
  const [assets, setAssets] = useState<PortfolioAsset[]>(initialAssets);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editOrder, setEditOrder] = useState(0);

  // Refresh assets list from API (helper)
  const refreshAssets = async () => {
    try {
      const res = await fetch("/api/admin/portfolio");
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (err) {
      console.error("Failed to refresh portfolio assets:", err);
    }
  };

  const startEdit = (asset: PortfolioAsset) => {
    setEditingId(asset.id);
    setEditTitle(asset.title);
    setEditCategory(asset.category);
    setEditOrder(asset.display_order);
  };

  const handleSaveAsset = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: editTitle,
          category: editCategory,
          display_order: editOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update asset");

      setAssets((prev) =>
        prev
          .map((a) => (a.id === id ? data.asset : a))
          .sort((a, b) => a.display_order - b.display_order)
      );
      setEditingId(null);
      if (onAssetChange) onAssetChange();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to save asset");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");

      setAssets((prev) => prev.map((a) => (a.id === id ? data.asset : a)));
      if (onAssetChange) onAssetChange();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to toggle status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this portfolio image? This will remove it from the database and Cloudinary CDN.")) return;
    setActionLoadingId(id);

    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete asset");

      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (onAssetChange) onAssetChange();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to delete asset");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-heading uppercase tracking-widest text-sm text-lamborghini-gold">
          Existing Artwork Gallery ({assets.length})
        </h3>
        <button
          onClick={refreshAssets}
          className="text-xs text-smoke hover:text-white underline underline-offset-4"
        >
          Refresh List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => {
          const isEditing = editingId === asset.id;
          const isLoading = actionLoadingId === asset.id;

          return (
            <div
              key={asset.id}
              className={`border p-4 flex gap-4 transition-all duration-300 ${
                asset.is_active
                  ? "border-white/[0.08] bg-white/[0.01]"
                  : "border-red-500/10 bg-red-500/[0.01] opacity-60"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-24 bg-[#0A0A0A] border border-white/10 flex-shrink-0 overflow-hidden">
                <Image
                  src={asset.cloudinary_path}
                  alt={asset.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              {/* Edit vs Read-Only Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-black border border-white/20 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-lamborghini-gold rounded-none"
                      placeholder="Title"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-black border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-lamborghini-gold rounded-none"
                      >
                        <option value="portfolio">Portfolio</option>
                        <option value="bridal">Bridal</option>
                        <option value="arabic">Arabic</option>
                        <option value="traditional">Traditional</option>
                        <option value="indo-arabic">Indo-Arabic</option>
                      </select>
                      <input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value, 10))}
                        className="w-full bg-black border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:border-lamborghini-gold rounded-none font-mono"
                        placeholder="Order"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-heading text-sm text-white truncate uppercase tracking-wider">
                      {asset.title}
                    </h4>
                    <p className="text-lamborghini-gold text-[10px] uppercase tracking-widest mt-0.5">
                      {asset.category}
                    </p>
                    <div className="flex gap-3 text-[10px] text-ash font-mono mt-1.5">
                      <span>Order: {asset.display_order}</span>
                      <span>•</span>
                      <span>{asset.width}x{asset.height}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/[0.04]">
                  <span className={`text-[9px] uppercase font-bold tracking-wider ${
                    asset.is_active ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {asset.is_active ? "Visible" : "Hidden"}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[9px] uppercase tracking-wider text-ash hover:text-white px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveAsset(asset.id)}
                          disabled={isLoading}
                          className="bg-lamborghini-gold text-black text-[9px] uppercase tracking-wider font-bold px-2 py-1 flex items-center gap-1 rounded-none"
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(asset)}
                          disabled={isLoading}
                          className="text-[9px] uppercase tracking-wider text-smoke hover:text-white border border-white/10 hover:border-white/30 px-2.5 py-1 rounded-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(asset.id, asset.is_active)}
                          disabled={isLoading}
                          className={`p-1.5 border rounded-none ${
                            asset.is_active
                              ? "border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5"
                              : "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5"
                          }`}
                          title={asset.is_active ? "Hide in Gallery" : "Show in Gallery"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          disabled={isLoading}
                          className="p-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 rounded-none"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {assets.length === 0 && (
          <div className="border border-dashed border-white/10 p-12 text-center text-smoke italic md:col-span-2">
            No portfolio images uploaded yet. Use the upload panel to stream your first artwork to Cloudinary!
          </div>
        )}
      </div>
    </div>
  );
}
