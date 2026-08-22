import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  RefreshCw, 
  X, 
  CheckSquare, 
  Square, 
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { playClickSound, playSuccessChime } from '../lib/soundFx';
import type { AdminStats, ClipDropKey } from '../types';

interface AdminKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: () => void;
}

export const AdminKeysModal: React.FC<AdminKeysModalProps> = ({
  isOpen,
  onClose,
  onKeysUpdated,
}) => {
  const [keys, setKeys] = useState<ClipDropKey[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [inputKeys, setInputKeys] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchKeysData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/keys');
      const data = await res.json();
      if (data.keys) {
        setKeys(data.keys);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch keys', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchKeysData();
      setSelectedIds([]);
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKeys.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keysText: inputKeys }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSuccessChime();
        setMessage({ 
          type: 'success', 
          text: `Added ${data.addedCount} Lumina API key(s). 100 images quota activated per key.` 
        });
        setInputKeys('');
        fetchKeysData();
        onKeysUpdated();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add keys.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network communication error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    playClickSound();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyIds: [id] }),
      });
      if (res.ok) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchKeysData();
        onKeysUpdated();
      }
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    playClickSound();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyIds: selectedIds }),
      });
      if (res.ok) {
        setSelectedIds([]);
        fetchKeysData();
        onKeysUpdated();
        setMessage({ type: 'success', text: `Deleted ${selectedIds.length} key(s).` });
      }
    } catch (err) {
      console.error('Bulk delete error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurgeExhausted = async () => {
    playClickSound();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purgeExhausted: true }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchKeysData();
        onKeysUpdated();
        setMessage({ type: 'success', text: `Removed ${data.deletedCount || 0} exhausted key(s).` });
      }
    } catch (err) {
      console.error('Purge error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    playClickSound();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    playClickSound();
    if (selectedIds.length === keys.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(keys.map((k) => k.id));
    }
  };

  const totalUsedImages = keys.reduce((acc, k) => acc + (k.usedCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121217] border border-[#262632] rounded-2xl shadow-2xl my-6 max-h-[90vh] flex flex-col text-[#e4e4e7] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0e0e13] border-b border-[#20202a] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#181822] border border-[#2c2c3e] rounded-xl text-zinc-200">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                <span>Lumina API Keys Vault</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e2330] text-emerald-400 border border-emerald-500/20">
                  Lumina Powered
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-normal">
                Multi-Key Auto-Rotation Engine (100 images per key)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a24] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-zinc-300">
          
          {/* Dashboard Metric Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0a0a0e] border border-[#1e1e28] p-3 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Total Keys</span>
              <span className="font-bold text-lg text-zinc-100 mt-0.5 block">
                {stats?.totalKeys || 0}
              </span>
            </div>

            <div className="bg-[#0a0a0e] border border-[#1e1e28] p-3 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Available Tokens</span>
              <span className="font-bold text-lg text-emerald-400 mt-0.5 block">
                {stats?.totalTokensRemaining || 0}
              </span>
            </div>

            <div className="bg-[#0a0a0e] border border-[#1e1e28] p-3 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Images Rendered</span>
              <span className="font-bold text-lg text-zinc-100 mt-0.5 block">
                {totalUsedImages}
              </span>
            </div>

            <div className="bg-[#0a0a0e] border border-[#1e1e28] p-3 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Active Keys</span>
              <span className="font-bold text-lg text-zinc-100 mt-0.5 block">
                {stats?.activeKeys || 0}
              </span>
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`p-3 rounded-xl border text-xs ${
              message.type === 'success' ? 'bg-[#101b13] text-[#86efac] border-[#1e3a24]' : 'bg-[#241316] text-[#fca5a5] border-[#4a1c22]'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add Key Form */}
          <form onSubmit={handleAddKeys} className="bg-[#0a0a0e] border border-[#1e1e28] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add Lumina API Key</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                1 key = 100 images
              </span>
            </div>

            <textarea
              value={inputKeys}
              onChange={(e) => setInputKeys(e.target.value)}
              placeholder="Paste Lumina API key here (or multiple keys on separate lines)..."
              rows={2}
              className="w-full bg-[#121218] border border-[#242432] focus:border-[#3e3e54] rounded-xl p-3 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
            />

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading || !inputKeys.trim()}
                className="bg-zinc-100 hover:bg-white disabled:opacity-30 text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
            </div>
          </form>

          {/* Keys List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#20202a] text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedIds.length === keys.length && keys.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-zinc-200" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-600" />
                  )}
                  <span>Select All ({selectedIds.length}/{keys.length})</span>
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="bg-[#241316] hover:bg-[#341b1f] text-[#fca5a5] text-xs px-2.5 py-1 rounded-lg border border-[#4a1c22] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete ({selectedIds.length})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {stats && stats.exhaustedKeys > 0 && (
                  <button
                    type="button"
                    onClick={handlePurgeExhausted}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 bg-[#161620] border border-[#282836] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Clean Exhausted ({stats.exhaustedKeys})
                  </button>
                )}

                <button
                  type="button"
                  onClick={fetchKeysData}
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Refresh keys list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Keys Table / Items */}
            {keys.length === 0 ? (
              <div className="text-center py-7 bg-[#0a0a0e] border border-[#1e1e28] rounded-xl p-4 text-zinc-500 text-xs">
                No API keys registered yet. Add a key above to start generating images.
              </div>
            ) : (
              <div className="space-y-1.5">
                {keys.map((k, index) => {
                  const isSelected = selectedIds.includes(k.id);
                  const isCurrentActive = stats?.currentActiveKeyId === k.id;
                  const isExhausted = k.status === 'exhausted' || k.usedCount >= k.maxQuota;
                  const remainingTokens = Math.max(0, k.maxQuota - k.usedCount);

                  return (
                    <div
                      key={k.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isCurrentActive
                          ? 'bg-[#0f1411] border-[#1d3522]'
                          : isExhausted
                          ? 'bg-[#0a0a0d] border-[#181820] opacity-50'
                          : 'bg-[#0a0a0e] border-[#1e1e28]'
                      } ${isSelected ? 'border-[#3d3d52]' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(k.id)}
                          className="text-zinc-500 hover:text-zinc-300 shrink-0 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-zinc-200" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-zinc-200">
                              {k.label ? k.label.replace(/ClipDrop/gi, 'Lumina') : `Lumina Key #${index + 1}`}
                            </span>
                            <code className="text-[11px] text-zinc-400 bg-[#14141c] px-1.5 py-0.2 rounded border border-[#222230] font-mono">
                              {k.maskedKey}
                            </code>
                            {isCurrentActive && (
                              <span className="text-[10px] text-emerald-400 bg-[#132217] px-1.5 py-0.2 rounded border border-[#1e3d25] font-mono">
                                Active
                              </span>
                            )}
                            {isExhausted && (
                              <span className="text-[10px] text-zinc-400 bg-[#201416] px-1.5 py-0.2 rounded border border-[#3b1e22] font-mono">
                                Exhausted
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Used: <span className="text-zinc-300">{k.usedCount} / {k.maxQuota} images</span> &bull; Remaining: <span className="text-emerald-400">{remainingTokens} tokens</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(k.id)}
                          className="p-1.5 text-zinc-500 hover:text-[#fca5a5] hover:bg-[#181822] rounded-lg transition-colors cursor-pointer"
                          title="Delete key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#0e0e13] border-t border-[#20202a] p-3.5 flex items-center justify-between shrink-0 text-xs">
          <span className="text-zinc-400 text-[11px] font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Lumina Powered
          </span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="bg-[#181822] hover:bg-[#222230] text-zinc-200 px-4 py-1.5 rounded-xl border border-[#28283a] transition-colors cursor-pointer text-xs font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
