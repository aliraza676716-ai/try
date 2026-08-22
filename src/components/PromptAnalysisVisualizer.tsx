import React, { useEffect, useState } from 'react';
import { Terminal, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface PromptAnalysisVisualizerProps {
  prompt: string;
  style: string;
  isGenerating: boolean;
}

const ANALYSIS_STEPS: { title: string; detail: string; delay: number }[] = [
  { 
    title: 'Lexical Tokenization & Entity Parsing', 
    detail: 'Extracting key subject vectors, foreground silhouettes & semantic weights...',
    delay: 300 
  },
  { 
    title: 'Chromatic Lighting & Palette Matrix', 
    detail: 'Synthesizing color spectrum, illumination balance & ambient values...',
    delay: 900 
  },
  { 
    title: 'Geometric Composition & Aspect Alignment', 
    detail: 'Calculating perspective grid, composition layout & resolution scaling...',
    delay: 1600 
  },
  { 
    title: 'Neural Diffusion Inference Dispatch', 
    detail: 'Allocating token from active API queue & executing neural diffusion tensor...',
    delay: 2400 
  }
];

export const PromptAnalysisVisualizer: React.FC<PromptAnalysisVisualizerProps> = ({
  prompt,
  style,
  isGenerating
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      setProgressPercent(0);
      return;
    }

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) return 98;
        return prev + 2;
      });
    }, 60);

    const step1 = setTimeout(() => setCurrentStepIndex(1), 700);
    const step2 = setTimeout(() => setCurrentStepIndex(2), 1500);
    const step3 = setTimeout(() => setCurrentStepIndex(3), 2300);

    return () => {
      clearInterval(interval);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="w-full max-w-3xl my-6 bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-2xl shadow-xl p-5 select-none animate-in fade-in zoom-in-95 duration-200">
      
      {/* Visual Terminal Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-zinc-200">
            Prompt Analysis &amp; Diffusion Pipeline
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <Cpu className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
          <span>SAMPLING: {progressPercent}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full my-3.5 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Breakdown List */}
      <div className="space-y-2 my-3 text-xs">
        {ANALYSIS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div 
              key={idx}
              className={`p-2.5 rounded-xl border transition-colors flex items-start gap-2.5 ${
                isCurrent 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100' 
                  : isDone 
                    ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400' 
                    : 'border-transparent text-zinc-600'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                ) : (
                  <div className="w-3.5 h-3.5 border border-zinc-700 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between font-medium text-xs">
                  <span>{step.title}</span>
                  {isCurrent && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded">
                      Processing
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-normal">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Live Prompt Telemetry */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="truncate max-w-[280px] sm:max-w-md font-mono">
          Target: &ldquo;{prompt}&rdquo;
        </span>
        <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded text-[10px] shrink-0 font-medium">
          Style: {style}
        </span>
      </div>

    </div>
  );
};
