import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Music, 
  Layers, 
  Radio,
  ChevronRight,
  Database
} from 'lucide-react';
import { playClickSound, toggleSound, isSoundEnabled, playBeepSound } from '../lib/soundFx';
import type { ImageGenerationRecord, AdminStats } from '../types';

interface LeftSideWidgetProps {
  adminStats: AdminStats | null;
}

export const LeftSideWidget: React.FC<LeftSideWidgetProps> = ({ adminStats }) => {
  const [ticker, setTicker] = useState(0);
  const [sfx, setSfx] = useState(isSoundEnabled());

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(prev => (prev + 1) % 9999);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleTestBeep = () => {
    playBeepSound(520, 0.1);
  };

  return (
    <div className="hidden lg:flex flex-col gap-4 w-60 select-none text-xs shrink-0 animate-in fade-in slide-in-from-left-4 duration-300 text-zinc-100">
      
      {/* 1. System Diagnostics Module */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-medium text-zinc-200">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Core Telemetry</span>
          </div>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
            Active
          </span>
        </div>

        <div className="space-y-2 text-[11px] text-zinc-400">
          <div className="flex justify-between">
            <span className="text-zinc-500">Engine:</span>
            <strong className="text-zinc-200 font-medium font-mono">ClipDrop Dual-Core</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Buffer Clock:</span>
            <strong className="font-mono text-zinc-300">#{ticker.toString().padStart(4, '0')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Active Keys:</span>
            <strong className="font-mono text-emerald-400">{adminStats?.activeKeys || 0} Deployed</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Available Pool:</span>
            <strong className="font-mono text-zinc-200">{adminStats?.totalTokensRemaining || 0} / { (adminStats?.totalKeys || 0) * 100 }</strong>
          </div>
        </div>
      </div>

      {/* 2. Audio Synthesizer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-medium text-zinc-200">
            <Music className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sound Effects</span>
          </div>
          <button
            onClick={() => {
              const state = toggleSound();
              setSfx(state);
              if (state) playClickSound();
            }}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
            title="Toggle Web Audio SFX"
          >
            {sfx ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
          Web Audio frequency oscillator generates tactile clicks and synthesis audio triggers.
        </p>

        <button
          onClick={handleTestBeep}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
        >
          Test Audio Tone
        </button>
      </div>

      {/* 3. Key Rotation Spec */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg text-[11px] space-y-2">
        <span className="font-medium text-zinc-200 pb-1.5 border-b border-zinc-800 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-zinc-400" />
          <span>Rotation Protocol</span>
        </span>
        <div className="text-zinc-400 text-[11px] space-y-1 leading-relaxed font-normal">
          <p>&bull; <strong className="text-zinc-200">100 Images/Key:</strong> Auto-switch upon quota limit.</p>
          <p>&bull; <strong className="text-zinc-200">Zero Downtime:</strong> Hot pool auto-rotation.</p>
          <p>&bull; <strong className="text-zinc-200">Admin Vault:</strong> Protected by security passcode.</p>
        </div>
      </div>

    </div>
  );
};

interface RightSideWidgetProps {
  history: ImageGenerationRecord[];
  onSelectRecord: (record: ImageGenerationRecord) => void;
  onOpenFullGallery: () => void;
}

export const RightSideWidget: React.FC<RightSideWidgetProps> = ({
  history,
  onSelectRecord,
  onOpenFullGallery
}) => {
  return (
    <div className="hidden lg:flex flex-col gap-4 w-60 select-none text-xs shrink-0 animate-in fade-in slide-in-from-right-4 duration-300 text-zinc-100">
      
      {/* Recent Generations Gallery */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
        
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-medium text-zinc-200">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Recent Generations</span>
          </div>
          <span className="bg-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-mono">
            {history.length}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-[11px]">
            <p>No images generated yet.</p>
            <p className="text-[10px] mt-1 text-zinc-600">Creations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  playClickSound();
                  onSelectRecord(item);
                }}
                className="group cursor-pointer bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800/80 rounded-xl p-2 transition-all hover:border-zinc-700"
              >
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800 mb-1.5">
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                    {item.aspectRatio}
                  </span>
                </div>
                <p className="text-[11px] font-normal text-zinc-200 truncate">
                  {item.prompt}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                  <span>{item.style}</span>
                  <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <button
            onClick={() => {
              playClickSound();
              onOpenFullGallery();
            }}
            className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-2 rounded-xl text-[11px] font-medium text-zinc-200 text-center flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View All History</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

      </div>

      {/* Cloud Sync Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg text-[11px] space-y-1.5">
        <div className="flex items-center gap-2 font-medium text-zinc-200">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cloud Storage</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed font-normal">
          Cloud storage seamlessly syncs your generated images, custom prompts, and creative history.
        </p>
      </div>

    </div>
  );
};
