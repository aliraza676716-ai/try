import React from 'react';
import { Lock } from 'lucide-react';
import { playClickSound } from '../lib/soundFx';

interface RetroHeaderProps {
  onOpenLockModal: () => void;
}

export const RetroHeader: React.FC<RetroHeaderProps> = ({ onOpenLockModal }) => {
  const handleLockClick = () => {
    playClickSound();
    onOpenLockModal();
  };

  return (
    <header className="w-full bg-[#0c0c0f] border-b border-[#1c1c24] px-4 sm:px-6 py-3 select-none sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        
        {/* Animated Lumina Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2c2c3a] via-[#1a1a24] to-[#101018] border border-[#404054] flex items-center justify-center relative overflow-hidden animate-logo-box cursor-pointer">
            {/* Ambient Shimmer Flare */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            
            <svg
              className="w-4.5 h-4.5 text-zinc-100 animate-logo-poly"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" stroke="currentColor" strokeWidth="1.6" />
              <polygon points="12 6 18 10 18 14 12 18 6 14 6 10 12 6" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>

          <span className="font-semibold text-lg text-zinc-100 tracking-tight">
            Lumina
          </span>
        </div>

        {/* API Keys Vault Lock */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLockClick}
            className="bg-[#15151c] hover:bg-[#1f1f28] text-zinc-300 hover:text-white border border-[#272734] hover:border-[#3a3a4c] px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Lumina API Keys Vault"
            id="admin-security-lock-btn"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>API Keys</span>
          </button>
        </div>

      </div>
    </header>
  );
};
