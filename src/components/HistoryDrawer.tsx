import React from 'react';
import { Layers, X, Download, Trash2, Eye } from 'lucide-react';
import { playClickSound } from '../lib/soundFx';
import type { ImageGenerationRecord } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ImageGenerationRecord[];
  onSelectRecord: (record: ImageGenerationRecord) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectRecord,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150 text-zinc-100">
      <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl h-full flex flex-col">
        
        {/* Header */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-100">
              Generation History ({history.length})
            </h3>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-2 text-xs">
              <Layers className="w-8 h-8 mx-auto text-zinc-600 mb-1" />
              <p className="font-medium text-zinc-300">Your history is currently empty</p>
              <p className="text-[11px] text-zinc-500">Generate images to populate your gallery.</p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2.5 hover:border-zinc-700 transition-colors"
              >
                <div 
                  className="relative aspect-video bg-black rounded-lg cursor-pointer overflow-hidden border border-zinc-800 group"
                  onClick={() => {
                    playClickSound();
                    onSelectRecord(record);
                    onClose();
                  }}
                >
                  <img
                    src={record.imageUrl}
                    alt={record.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1.5">
                    <Eye className="w-4 h-4" /> Load Canvas
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-relaxed">
                    &ldquo;{record.prompt}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1.5">
                    <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                      {record.style} &bull; {record.aspectRatio}
                    </span>
                    <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      playClickSound();
                      const link = document.createElement('a');
                      link.href = record.imageUrl;
                      link.download = `gridscape_${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-2.5 py-1 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      onSelectRecord(record);
                      onClose();
                    }}
                    className="bg-white hover:bg-zinc-200 text-black px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (confirm('Clear local history items?')) {
                  playClickSound();
                  onClearHistory();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
            <span className="text-[11px] text-zinc-500 font-mono">
              Auto-saved
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
