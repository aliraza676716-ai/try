import React, { useState } from 'react';
import { ArrowRight, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { playClickSound, playGeneratingPulse } from '../lib/soundFx';

interface TextBoardProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// Miniature Dot Matrix Wave indicator for the top header
const MiniDotWave: React.FC = () => {
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#181824] border border-[#2e2e40] select-none">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-pulse"
          style={{
            animationDuration: '1.2s',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

export const TextBoard: React.FC<TextBoardProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
}) => {
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    playGeneratingPulse();
    onGenerate();
  };

  const handleClear = () => {
    playClickSound();
    setPrompt('');
  };

  const handleCopyPrompt = () => {
    if (!prompt.trim()) return;
    playClickSound();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`luminous-box-container w-full shadow-2xl ${isGenerating ? 'active-glow' : ''}`}>
      <div className="luminous-box-content p-4 sm:p-5 flex flex-col justify-between">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 select-none">
            <div className={`w-2 h-2 rounded-full transition-colors ${isGenerating ? 'bg-white shadow-[0_0_8px_white] animate-pulse' : 'bg-zinc-400'}`} />
            
            <label htmlFor="prompt-input" className="text-xs font-semibold text-zinc-200 tracking-wide cursor-pointer flex items-center gap-2">
              <span>{isGenerating ? 'Analyzing...' : 'Analyze'}</span>
              {isGenerating && <MiniDotWave />}
            </label>
          </div>

          {/* Action Buttons: Copy, Clean, Character & Word Count */}
          <div className="flex items-center gap-2">
            {prompt.length > 0 && !isGenerating && (
              <>
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="bg-[#171720] hover:bg-[#20202c] text-zinc-400 hover:text-zinc-200 border border-[#262634] px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy prompt text"
                >
                  {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Clean Button */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-[#171720] hover:bg-[#251a1e] text-zinc-400 hover:text-[#fca5a5] border border-[#262634] hover:border-[#4a2228] px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Clean prompt text"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clean</span>
                </button>
              </>
            )}

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 pl-1 select-none">
              <span>{prompt.length} chars</span>
              <span>•</span>
              <span>{prompt.trim() ? prompt.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>
        </div>

        {/* Text Input Area with Subtle Scanner line during Generation */}
        <form onSubmit={handleSubmit} className="relative rounded-xl overflow-hidden">
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type anything you want to generate (e.g. A serene glass monolith standing in mist during blue hour, 8k resolution)..."
            rows={3}
            disabled={isGenerating}
            className="w-full bg-[#08080b] border border-[#1b1b22] focus:border-[#383848] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-y min-h-[85px] max-h-[350px] leading-relaxed transition-colors font-normal"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />

          {/* Smooth horizontal laser scan line when analyzing */}
          {isGenerating && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              <div 
                className="w-full h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_white] opacity-80"
                style={{
                  animation: 'promptScan 2s ease-in-out infinite',
                  position: 'absolute',
                }}
              />
            </div>
          )}
        </form>

        {/* Bottom Action Row: Shortcut Hint & Primary Submit Button */}
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#181820] gap-2">
          <span className="text-[11px] text-zinc-500 hidden sm:inline-block font-mono select-none">
            <kbd className="bg-[#15151c] text-zinc-400 px-1.5 py-0.5 rounded border border-[#242430] text-[10px]">Ctrl</kbd> + <kbd className="bg-[#15151c] text-zinc-400 px-1.5 py-0.5 rounded border border-[#242430] text-[10px]">Enter</kbd> to generate
          </span>

          <button
            onClick={handleSubmit}
            disabled={isGenerating || !prompt.trim()}
            className="bg-zinc-100 hover:bg-white disabled:opacity-30 text-black px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
            id="generate-button"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <span>Generate Image</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
