import React, { useState, useEffect } from 'react';
import { RetroHeader } from './components/RetroHeader';
import { TextBoard } from './components/TextBoard';
import { ImageBoard } from './components/ImageBoard';
import { PasscodeModal } from './components/PasscodeModal';
import { AdminKeysModal } from './components/AdminKeysModal';
import { LightboxModal } from './components/LightboxModal';
import { saveGeneratedImage, fetchUserGenerations } from './lib/firebase';
import type { ImageGenerationRecord } from './types';

// Direct Client-Side Fallback Generator for Static Deployments (e.g. GitHub Pages)
async function generateClientFallback(promptText: string): Promise<string> {
  const enhancedPrompt = `${promptText}, highly detailed, sharp focus, 8k resolution, cinematic lighting`;
  const seed = Math.floor(Math.random() * 1000000);
  const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

  try {
    const res = await fetch(directUrl);
    if (res.ok) {
      const blob = await res.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('[ClientGen] Direct fetch fallback failed:', err);
  }

  return directUrl;
}

export default function App() {
  const [prompt, setPrompt] = useState('Minimalist dark sphere floating over calm water in atmospheric light');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ImageGenerationRecord | null>(null);

  // Admin & Modals state
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [isAdminKeysModalOpen, setIsAdminKeysModalOpen] = useState(false);
  const [lightboxRecord, setLightboxRecord] = useState<ImageGenerationRecord | null>(null);

  // Initial load of past generated image if present
  useEffect(() => {
    fetchUserGenerations().then((items) => {
      if (items.length > 0) {
        setCurrentRecord(items[0]);
      }
    });
  }, []);

  // Handle generation request
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // 1. Try Backend Server Endpoint First
      let generatedUrl = '';
      let engineName = 'Lumina Powered';

      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: prompt.trim(),
            aspectRatio: '1:1',
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.imageUrl) {
            generatedUrl = data.imageUrl;
            engineName = data.engineUsed || 'Lumina Multi-Key Diffusion';
          }
        }
      } catch (backendErr) {
        console.log('[App] Backend not reachable (Static GitHub Pages mode), switching to client generator:', backendErr);
      }

      // 2. If Backend not available (Static GitHub Pages Hosting), use direct client generator
      if (!generatedUrl) {
        generatedUrl = await generateClientFallback(prompt.trim());
      }

      const latencyMs = Date.now() - startTime;
      const newRecord: ImageGenerationRecord = {
        id: 'gen_' + Date.now(),
        prompt: prompt.trim(),
        style: 'Realistic',
        aspectRatio: '1:1',
        imageUrl: generatedUrl,
        createdAt: Date.now(),
        engineUsed: engineName,
        latencyMs: latencyMs,
        wordCount: prompt.trim().split(/\s+/).length,
        charCount: prompt.length,
      };

      setCurrentRecord(newRecord);
      saveGeneratedImage(newRecord);

    } catch (err) {
      console.error('Generation error:', err);
      alert('Error generating image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-[#e4e4e7] font-sans selection:bg-[#27272e] selection:text-white overflow-x-hidden">
      
      {/* 1. Clean Header with Animated Lumina Brand & API Keys Lock */}
      <RetroHeader
        onOpenLockModal={() => setIsPasscodeModalOpen(true)}
      />

      {/* 2. Main Center Responsive Canvas */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 flex flex-col items-center justify-start gap-4 sm:gap-6">
        
        {/* Prompt Input Box */}
        <div className="w-full">
          <TextBoard
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Image Output Box */}
        <div className="w-full">
          <ImageBoard
            currentRecord={currentRecord}
            isGenerating={isGenerating}
            prompt={prompt}
            onRegenerate={handleGenerate}
            onOpenLightbox={(rec) => setLightboxRecord(rec)}
          />
        </div>

      </main>

      {/* 3. Lumina Minimalist Footer */}
      <footer className="w-full border-t border-[#181820] py-4 px-4 text-center text-xs text-zinc-500 select-none mt-auto">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-semibold text-zinc-200">Lumina</span>
          <span className="font-mono flex items-center gap-1.5 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Developer of Pakistan
          </span>
        </div>
      </footer>

      {/* --- Security & Image Modals --- */}

      {/* Passcode Entry Modal */}
      <PasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={() => {
          setIsPasscodeModalOpen(false);
          setIsAdminKeysModalOpen(true);
        }}
      />

      {/* Admin API Keys Dashboard */}
      <AdminKeysModal
        isOpen={isAdminKeysModalOpen}
        onClose={() => setIsAdminKeysModalOpen(false)}
        onKeysUpdated={() => {}}
      />

      {/* Fullscreen High-Res Image Lightbox Modal */}
      <LightboxModal
        record={lightboxRecord}
        onClose={() => setLightboxRecord(null)}
      />

    </div>
  );
}
