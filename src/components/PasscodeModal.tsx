import React, { useState } from 'react';
import { Lock, X, ShieldAlert, Check } from 'lucide-react';
import { playClickSound, playLockBeep } from '../lib/soundFx';
import { ADMIN_PASSCODE } from '../types';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsVerifying(true);
    setError(false);

    try {
      const res = await fetch('/api/admin/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playLockBeep(true);
        setPasscode('');
        onSuccess();
      } else {
        playLockBeep(false);
        setError(true);
      }
    } catch {
      if (passcode.trim() === ADMIN_PASSCODE) {
        playLockBeep(true);
        setPasscode('');
        onSuccess();
      } else {
        playLockBeep(false);
        setError(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-[#141417] border border-[#27272e] rounded-xl shadow-2xl p-5 text-[#e4e4e7]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#23232a]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1e1e24] border border-[#2b2b34] rounded-lg text-zinc-300">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-medium text-xs text-zinc-200">
              Admin Access
            </h3>
          </div>
          
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-[#1e1e24] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simple Form with Passcode Entry Bar */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-normal text-zinc-400 block mb-1.5">
              Enter Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(false);
              }}
              placeholder="Enter your security code..."
              autoFocus
              className="w-full bg-[#0d0d10] border border-[#27272e] focus:border-[#40404c] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-[#241316] border border-[#4a1c22] rounded-lg p-2 text-[#fca5a5] text-xs flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Incorrect passcode. Please try again.</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="flex-1 bg-[#1a1a1f] hover:bg-[#22222a] text-zinc-400 hover:text-zinc-200 border border-[#282830] py-2 rounded-lg text-xs font-normal transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !passcode.trim()}
              className="flex-1 bg-zinc-200 hover:bg-white disabled:opacity-30 text-black py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {isVerifying ? (
                <span>Checking...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
