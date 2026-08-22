import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { playClickSound } from '../lib/soundFx';
import type { ImageGenerationRecord } from '../types';

interface LightboxModalProps {
  record: ImageGenerationRecord | null;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  record,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and pan state whenever a new record is opened
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [record]);

  // Keyboard shortcut (Escape to close, +/- to zoom, 0 to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setScale((prev) => Math.min(10, Number((prev + 0.5).toFixed(1))));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setScale((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))));
      } else if (e.key === '0') {
        e.preventDefault();
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  // Mouse wheel zoom handler (zoom in/out up to 10x deep zoom)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.3 : -0.3;
    setScale((prev) => {
      const nextScale = Math.min(10, Math.max(1, Number((prev + zoomFactor).toFixed(1))));
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return nextScale;
    });
  };

  // Double click toggles between 1x and 3.5x deep zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(3.5);
    }
  };

  // Drag & Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setScale((prev) => Math.min(10, Number((prev + 0.75).toFixed(1))));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.75).toFixed(1)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none overflow-hidden"
      onClick={() => {
        playClickSound();
        onClose();
      }}
    >
      {/* Top Floating Minimalist Bar with ONLY Close Button */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
            onClose();
          }}
          className="p-2.5 text-zinc-400 hover:text-white bg-[#14141c]/90 hover:bg-[#22222e] border border-[#2a2a3a] rounded-full transition-all cursor-pointer shadow-xl backdrop-blur-md active:scale-90"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Interactive Zoom & Pan Canvas (No prompt text, zero clutter) */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-default relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform ${
            isDragging ? 'cursor-grabbing duration-0' : scale > 1 ? 'cursor-grab duration-150' : 'cursor-zoom-in duration-200'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={record.imageUrl}
            alt="Lumina Output"
            referrerPolicy="no-referrer"
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Floating Minimalist Deep Zoom Controller HUD */}
      <div 
        className="absolute bottom-6 z-30 flex items-center gap-2 bg-[#12121ad0] border border-[#262638] px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-[#20202e] rounded-xl transition-all cursor-pointer"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Current Zoom Level Display */}
        <span className="text-xs font-mono font-semibold text-zinc-200 min-w-[50px] text-center select-none">
          {Math.round(scale * 100)}%
        </span>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={scale >= 10}
          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 hover:bg-[#20202e] rounded-xl transition-all cursor-pointer"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Reset Zoom Button */}
        {scale > 1 && (
          <>
            <div className="w-[1px] h-4 bg-[#28283a] mx-0.5" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-[#20202e] rounded-xl transition-all flex items-center gap-1 text-[11px] font-mono cursor-pointer"
              title="Reset Zoom (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>100%</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
};
