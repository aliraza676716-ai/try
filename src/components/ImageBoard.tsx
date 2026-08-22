import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, ImageIcon, Maximize2 } from 'lucide-react';
import { playClickSound } from '../lib/soundFx';
import type { ImageGenerationRecord } from '../types';

interface ImageBoardProps {
  currentRecord: ImageGenerationRecord | null;
  isGenerating: boolean;
  prompt?: string;
  onRegenerate: () => void;
  onOpenLightbox: (record: ImageGenerationRecord) => void;
}

// EXACT CHATGPT / DALL-E DOT-MATRIX WAVE WITH SMOOTH WHITE-FROSTED BLURRED AESTHETIC
const ChatGPTDotMatrixCanvas: React.FC<{ promptText?: string }> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const COLS = 19;
    const ROWS = 14;

    const render = (time: number) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Grid boundaries with precise spacing
      const padLeft = width * 0.08;
      const padRight = width * 0.08;
      const padTop = height * 0.18; // space below "Creating image"
      const padBottom = height * 0.12;

      const gridWidth = width - padLeft - padRight;
      const gridHeight = height - padTop - padBottom;

      const colStep = gridWidth / (COLS - 1);
      const rowStep = gridHeight / (ROWS - 1);

      const elapsed = (time - startTime) / 1000;
      // Ultra-smooth cosine wave motion speed
      const speed = 2.2;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = padLeft + c * colStep;
          const y = padTop + r * rowStep;

          // Diagonal continuous harmonic wave
          const wavePhase = (c * 0.36 + r * 0.36) - elapsed * speed;
          
          // Normalized wave value from 0 to 1 with smooth cosine shaping
          const rawCos = Math.cos(wavePhase);
          const intensity = Math.pow((rawCos + 1) / 2, 2.4);

          // Dynamic dot radius: from 1.2px to 5.4px
          const minRadius = 1.2;
          const maxRadius = 5.4;
          const radius = minRadius + intensity * (maxRadius - minRadius);

          // Dynamic opacity
          const minOpacity = 0.15;
          const maxOpacity = 0.98;
          const opacity = minOpacity + intensity * (maxOpacity - minOpacity);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          // Smooth white/metallic dot rendering with subtle specular glow on wave peaks
          if (intensity > 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
            ctx.shadowBlur = 5;
          } else {
            ctx.fillStyle = `rgba(230, 230, 240, ${opacity})`;
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#08080d] flex flex-col justify-between select-none overflow-hidden rounded-xl">
      
      {/* 1. ULTRA-SMOOTH LUMINOUS WHITE-BLURRED FROSTED AESTHETIC */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft white-luminous blur aura 1 */}
        <div 
          className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-white/10 blur-[75px] animate-pulse"
          style={{ animationDuration: '4s' }}
        />
        {/* Ambient indigo-white frosted blur aura 2 */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] rounded-full bg-indigo-400/10 blur-[85px] animate-pulse"
          style={{ animationDuration: '5.5s' }}
        />
        {/* Fine frosted light sweep */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(8,8,13,0.85)_100%)]" />
      </div>

      {/* 2. TOP-LEFT "Creating image" (Clean ChatGPT Typography) */}
      <div className="relative z-10 pt-4 sm:pt-5 px-5 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="text-sm font-medium tracking-wide text-zinc-200 font-sans">
            Creating image
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white] animate-pulse inline-block" />
        </div>
      </div>

      {/* 3. INTERACTIVE 60FPS SMOOTH DOT-MATRIX CANVAS */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 4. MINIMALIST BOTTOM STATUS */}
      <div className="relative z-10 pb-3 px-5 sm:px-6 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Lumina Powered
        </span>
        <span className="text-zinc-500 font-mono">1024 × 1024</span>
      </div>

    </div>
  );
};

export const ImageBoard: React.FC<ImageBoardProps> = ({
  currentRecord,
  isGenerating,
  prompt = '',
  onRegenerate,
  onOpenLightbox,
}) => {
  const [imageKey, setImageKey] = useState<string>('');

  useEffect(() => {
    if (currentRecord?.imageUrl) {
      setImageKey(currentRecord.id || Date.now().toString());
    }
  }, [currentRecord?.id, currentRecord?.imageUrl]);

  const handleDownload = () => {
    if (!currentRecord) return;
    playClickSound();
    const link = document.createElement('a');
    link.href = currentRecord.imageUrl;
    const cleanName = currentRecord.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `lumina_${cleanName}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateClick = () => {
    playClickSound();
    onRegenerate();
  };

  return (
    <div className={`luminous-box-container w-full shadow-2xl ${isGenerating ? 'active-glow' : ''}`}>
      <div className="luminous-box-content p-4 sm:p-5 flex flex-col justify-between">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2 select-none">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-white shadow-[0_0_8px_white] animate-pulse' : 'bg-zinc-400'}`} />
            <span className="font-semibold text-zinc-200">Generated Output</span>
          </div>

          {currentRecord && !isGenerating && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 select-none">
              <span className="bg-[#15151e] px-2 py-0.5 rounded border border-[#242432]">
                {(currentRecord.latencyMs / 1000).toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* Image Display Frame */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] max-h-[560px] bg-[#060608] rounded-xl border border-[#1a1a24] overflow-hidden flex items-center justify-center group shadow-inner">
          
          {/* 1. Exact ChatGPT DALL-E Dot-Matrix Wave with Ultra-Smooth White Blurred Glow */}
          {isGenerating && <ChatGPTDotMatrixCanvas promptText={prompt} />}

          {/* 2. Image Loaded with Smooth Deblur Reveal */}
          {currentRecord && !isGenerating && (
            <div 
              key={imageKey} 
              className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden cursor-pointer"
              onClick={() => onOpenLightbox(currentRecord)}
              title="Click to view and zoom into image"
            >
              <img
                src={currentRecord.imageUrl}
                alt={currentRecord.prompt || 'Generated visual'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain animate-deblur-reveal transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Hover Zoom Hint */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#101016]/85 backdrop-blur-md border border-[#282836] text-white p-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Zoom View</span>
              </div>
            </div>
          )}

          {/* 3. Empty State */}
          {!currentRecord && !isGenerating && (
            <div className="p-8 text-center text-zinc-500 space-y-3 select-none flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#121218] border border-[#22222e] flex items-center justify-center text-zinc-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-sm text-zinc-300">
                  Ready to Create
                </p>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Your generated image will render here in high quality.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Controls: ONLY 2 Buttons (Regenerate & Download) */}
        {currentRecord && !isGenerating && (
          <div className="mt-4 pt-3.5 border-t border-[#181820] flex items-center justify-end gap-3">
            {/* Button 1: Regenerate */}
            <button
              onClick={handleRegenerateClick}
              disabled={isGenerating}
              className="bg-[#161620] hover:bg-[#1f1f2c] text-zinc-200 hover:text-white border border-[#282836] px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Regenerate Image"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Regenerate</span>
            </button>

            {/* Button 2: Download */}
            <button
              onClick={handleDownload}
              className="bg-zinc-100 hover:bg-white text-black px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
              title="Download High-Res Image"
            >
              <Download className="w-3.5 h-3.5 text-black" />
              <span>Download</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
