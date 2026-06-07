"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Save, Power, CheckCircle, AlertCircle } from "lucide-react";

interface Settings {
  id?: string;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
}

interface ServiceTier {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_inr: number;
  is_active: boolean;
}

interface SettingsControlProps {
  initialSettings: Settings | null;
  initialServiceTiers: ServiceTier[];
}

export default function SettingsControl({
  initialSettings,
  initialServiceTiers,
}: SettingsControlProps) {
  const [settings, setSettings] = useState<Settings>(
    initialSettings || {
      working_hours_start: "09:00:00",
      working_hours_end: "18:00:00",
      timezone: "Asia/Kolkata",
    }
  );

  const [serviceTiers, setServiceTiers] = useState<ServiceTier[]>(initialServiceTiers);

  // Loading & Action states
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // New Service form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState(60);
  const [newPrice, setNewPrice] = useState(1000);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Service states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState(60);
  const [editPrice, setEditPrice] = useState(1000);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsStatus(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setSettingsStatus({ type: "success", msg: "Global settings updated successfully." });
    } catch (err: unknown) {
      const error = err as Error;
      setSettingsStatus({ type: "error", msg: error.message || "Something went wrong." });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Add Service Tier
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setAddLoading(true);
    setAddError("");

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          duration_minutes: newDuration,
          price_inr: newPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add service tier");

      setServiceTiers((prev) => [...prev, data.service].sort((a, b) => a.price_inr - b.price_inr));
      setNewTitle("");
      setNewDescription("");
      setNewDuration(60);
      setNewPrice(1000);
    } catch (err: unknown) {
      const error = err as Error;
      setAddError(error.message || "Failed to add service tier");
    } finally {
      setAddLoading(false);
    }
  };

  // Start Editing Service Tier
  const startEdit = (tier: ServiceTier) => {
    setEditingId(tier.id);
    setEditTitle(tier.title);
    setEditDescription(tier.description || "");
    setEditDuration(tier.duration_minutes);
    setEditPrice(tier.price_inr);
  };

  // Save Service Tier Updates
  const handleSaveService = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: editTitle,
          description: editDescription,
          duration_minutes: editDuration,
          price_inr: editPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save service tier");

      setServiceTiers((prev) =>
        prev
          .map((t) => (t.id === id ? data.service : t))
          .sort((a, b) => a.price_inr - b.price_inr)
      );
      setEditingId(null);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to update service tier");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");

      setServiceTiers((prev) => prev.map((t) => (t.id === id ? data.service : t)));
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to toggle status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Service Tier
  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service tier? If it is referenced by existing bookings, it will be soft-deleted (made inactive) instead.")) return;
    setActionLoadingId(id);

    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete service tier");

      if (data.service) {
        // Soft deleted
        setServiceTiers((prev) => prev.map((t) => (t.id === id ? data.service : t)));
      } else {
        // Hard deleted
        setServiceTiers((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to delete service tier");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ── Working Hours Config ────────────────────────────────────────── */}
      <section className="lg:col-span-4 border border-white/[0.08] bg-white/[0.02] p-6">
        <h3 className="font-heading uppercase tracking-widest text-sm text-lamborghini-gold mb-6">
          Working Hours
        </h3>
        
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1.5">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}
              className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1.5">
                Start Time
              </label>
              <input
                type="text"
                placeholder="09:00:00"
                value={settings.working_hours_start}
                onChange={(e) => setSettings((p) => ({ ...p, working_hours_start: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1.5">
                End Time
              </label>
              <input
                type="text"
                placeholder="18:00:00"
                value={settings.working_hours_end}
                onChange={(e) => setSettings((p) => ({ ...p, working_hours_end: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none font-mono"
                required
              />
            </div>
          </div>

          {settingsStatus && (
            <div className={`flex items-start gap-2 text-xs py-2 px-3 border ${
              settingsStatus.type === "success" 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {settingsStatus.type === "success" ? <CheckCircle className="w-3.5 h-3.5 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5" />}
              <span>{settingsStatus.msg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={settingsLoading}
            className="w-full bg-lamborghini-gold text-black py-2.5 text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-none"
          >
            {settingsLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </form>
      </section>

      {/* ── Service Tiers Manager ──────────────────────────────────────── */}
      <section className="lg:col-span-8 space-y-6">
        
        {/* Add Service form */}
        <div className="border border-white/[0.08] bg-white/[0.02] p-6">
          <h3 className="font-heading uppercase tracking-widest text-sm text-lamborghini-gold mb-6">
            Create Service Tier
          </h3>
          
          <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1">
                Tier Title
              </label>
              <input
                type="text"
                placeholder="e.g. Deluxe Arabic Henna"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1">
                Description
              </label>
              <textarea
                placeholder="Detail what is included in this session..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors resize-none rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={newDuration}
                onChange={(e) => setNewDuration(parseInt(e.target.value, 10))}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-smoke mb-1">
                Price (INR)
              </label>
              <input
                type="number"
                min={0}
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-lamborghini-gold transition-colors rounded-none"
                required
              />
            </div>

            {addError && (
              <div className="md:col-span-2 text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{addError}</span>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={addLoading}
                className="bg-white text-black px-6 py-2.5 text-xs uppercase font-bold tracking-widest hover:bg-lamborghini-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-none"
              >
                {addLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Create Package
              </button>
            </div>
          </form>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h3 className="font-heading uppercase tracking-widest text-sm text-lamborghini-gold">
            Active Packages
          </h3>
          
          <div className="space-y-3">
            {serviceTiers.map((tier) => {
              const isEditing = editingId === tier.id;
              const isActionLoading = actionLoadingId === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`border p-5 transition-all duration-300 ${
                    tier.is_active 
                      ? "border-white/[0.08] bg-white/[0.01]" 
                      : "border-red-500/10 bg-red-500/[0.01] opacity-60"
                  }`}
                >
                  {isEditing ? (
                    /* EDITING VIEW */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[8px] uppercase tracking-wider text-ash">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-black border border-white/20 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold rounded-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider text-ash">Price (INR)</label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                            className="w-full bg-black border border-white/20 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold rounded-none font-mono"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-ash">Description</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="w-full bg-black border border-white/20 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold rounded-none resize-none"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider text-ash">Duration (mins)</label>
                          <input
                            type="number"
                            step={15}
                            value={editDuration}
                            onChange={(e) => setEditDuration(parseInt(e.target.value, 10))}
                            className="w-24 bg-black border border-white/20 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-lamborghini-gold rounded-none font-mono"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-white/20 text-white text-[10px] uppercase tracking-wider hover:bg-white/5 rounded-none"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveService(tier.id)}
                            disabled={isActionLoading}
                            className="px-4 py-2 bg-lamborghini-gold text-black text-[10px] uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 rounded-none flex items-center gap-1.5 font-bold"
                          >
                            {isActionLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* READ-ONLY VIEW */
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-heading text-lg text-white uppercase tracking-wider">
                            {tier.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-[9px] uppercase font-bold border tracking-wider ${
                            tier.is_active 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {tier.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {tier.description && (
                          <p className="text-smoke text-sm mb-3 max-w-2xl leading-relaxed">
                            {tier.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-ash font-mono">
                          <span>Duration: {tier.duration_minutes} mins</span>
                          <span>•</span>
                          <span className="text-lamborghini-gold">₹{parseFloat(tier.price_inr.toString()).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => startEdit(tier)}
                          disabled={isActionLoading}
                          className="p-2 border border-white/10 hover:border-white/30 text-white hover:bg-white/5 transition-colors disabled:opacity-50 rounded-none"
                          title="Edit"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(tier.id, tier.is_active)}
                          disabled={isActionLoading}
                          className={`p-2 border transition-colors disabled:opacity-50 rounded-none ${
                            tier.is_active 
                              ? "border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5" 
                              : "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5"
                          }`}
                          title={tier.is_active ? "Deactivate" : "Activate"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(tier.id)}
                          disabled={isActionLoading}
                          className="p-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50 rounded-none"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {serviceTiers.length === 0 && (
              <div className="border border-dashed border-white/10 p-12 text-center text-smoke italic">
                No service tiers configured yet.
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
