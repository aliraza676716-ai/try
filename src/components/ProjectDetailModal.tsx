import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  Sparkles, 
  Check, 
  Calendar, 
  MapPin, 
  Wrench, 
  Palette, 
  Type, 
  Award,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { playClickSound } from '../lib/soundFx';
import type { DesignProject } from '../types';

interface ProjectDetailModalProps {
  project: DesignProject | null;
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (prompt: string, style: string) => void;
  onToggleLike: (projectId: string) => void;
  isLiked: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onUsePrompt,
  onToggleLike,
  isLiked
}) => {
  const [activeTab, setActiveTab] = useState<'case-study' | 'design-system' | 'prompt-spec'>('case-study');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  if (!isOpen || !project) return null;

  const handleCopyHex = (hex: string) => {
    playClickSound();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleShare = () => {
    playClickSound();
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleApplyToStudio = () => {
    playClickSound();
    onUsePrompt(project.studioPrompt, project.suggestedStyle);
    onClose();
    const textBoardElement = document.getElementById('text-board-container');
    if (textBoardElement) {
      textBoardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-zinc-800 text-zinc-300 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
              {project.category}
            </span>
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              Project Showcase
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick like button */}
            <button
              onClick={() => {
                playClickSound();
                onToggleLike(project.id);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all border ${
                isLiked 
                  ? 'bg-rose-500/90 text-white border-rose-400' 
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
              <span>{project.likesCount + (isLiked ? 1 : 0)}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Copy link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-1.5 rounded-lg border border-zinc-700 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share toast banner */}
        {shareToast && (
          <div className="bg-emerald-500/90 text-white px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Link copied to clipboard!
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Designer Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <img 
                src={project.designer.avatar} 
                alt={project.designer.name} 
                className="w-12 h-12 rounded-full border border-zinc-700 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-zinc-100">
                    {project.designer.name}
                  </h3>
                  {project.designer.verified && (
                    <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.2 rounded-full">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {project.designer.role} &bull; <span className="text-zinc-500">{project.designer.handle}</span>
                </p>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {project.designer.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {project.publishedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2.5">
              <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-center">
                <span className="block text-[10px] text-zinc-500 font-medium uppercase">Views</span>
                <span className="text-xs font-semibold text-zinc-200">{project.viewsCount.toLocaleString()}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-1.5 rounded-xl text-center">
                <span className="block text-[10px] text-zinc-500 font-medium uppercase">Appreciations</span>
                <span className="text-xs font-semibold text-zinc-200">{(project.likesCount + (isLiked ? 1 : 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Project Title & Subtitle */}
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {project.title}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed font-normal">
              {project.subtitle}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Large Hero Image Preview */}
          <div className="relative border border-zinc-800 overflow-hidden bg-zinc-950 rounded-xl group">
            <img 
              src={project.heroImage} 
              alt={project.title}
              className="w-full max-h-[440px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
            />
            
            {/* Style Badge */}
            <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Style: {project.suggestedStyle}</span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('case-study');
              }}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all border-t border-l border-r -mb-[1px] ${
                activeTab === 'case-study' 
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold' 
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Case Study & Research
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('design-system');
              }}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all border-t border-l border-r -mb-[1px] ${
                activeTab === 'design-system' 
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold' 
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Design System & Palette
            </button>
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('prompt-spec');
              }}
              className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all border-t border-l border-r -mb-[1px] ${
                activeTab === 'prompt-spec' 
                  ? 'bg-zinc-800 text-white border-zinc-700 font-semibold' 
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Studio Prompt Preset
            </button>
          </div>

          {/* TAB 1: Case Study */}
          {activeTab === 'case-study' && (
            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 font-normal">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-base text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Project Overview
                </h4>
                <p className="leading-relaxed text-zinc-400">
                  {project.caseStudy.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <h5 className="font-medium text-rose-400 text-xs mb-1">The Challenge</h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">{project.caseStudy.challenge}</p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <h5 className="font-medium text-emerald-400 text-xs mb-1">The Design Solution</h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">{project.caseStudy.solution}</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-emerald-500 text-black px-2 py-1 rounded text-xs font-bold">
                  RESULT
                </div>
                <p className="text-xs text-emerald-300 font-medium">
                  {project.caseStudy.results}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Design System & Color Palette */}
          {activeTab === 'design-system' && (
            <div className="space-y-5 text-xs">
              
              {/* Color Swatches */}
              <div>
                <h4 className="font-semibold text-sm text-zinc-200 mb-2.5 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-zinc-400" /> Color Tokens (Click to Copy HEX)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {project.caseStudy.colorPalette.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleCopyHex(color.hex)}
                      className="border border-zinc-800 p-2.5 bg-zinc-950 rounded-xl text-left hover:border-zinc-700 transition-all group"
                    >
                      <div 
                        className="w-full h-12 border border-zinc-700 mb-2 rounded-lg" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="block font-medium text-[11px] text-zinc-200 truncate">{color.name}</span>
                      <span className="block text-[10px] text-zinc-500 group-hover:text-zinc-300 font-mono mt-0.5">
                        {copiedHex === color.hex ? 'COPIED!' : color.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools Used */}
              <div>
                <h4 className="font-semibold text-sm text-zinc-200 mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-400" /> Tools &amp; Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.caseStudy.tools.map((tool) => (
                    <span 
                      key={tool}
                      className="bg-zinc-950 text-zinc-300 px-3 py-1 text-xs rounded-lg border border-zinc-800 flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Typography Spec */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5">
                <h4 className="font-semibold text-sm text-zinc-200 mb-1 flex items-center gap-2">
                  <Type className="w-4 h-4 text-zinc-400" /> Typographic Hierarchy
                </h4>
                <p className="text-xs text-zinc-400">
                  Headings: <strong className="text-zinc-200">{project.caseStudy.typography.headingFont}</strong> &bull; Body: <strong className="text-zinc-200">{project.caseStudy.typography.bodyFont}</strong>
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Prompt Preset */}
          {activeTab === 'prompt-spec' && (
            <div className="space-y-4 text-xs">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    Gridscape AI Studio Prompt Definition
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md">
                    {project.suggestedStyle}
                  </span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-300 font-mono text-xs leading-relaxed">
                  &ldquo;{project.studioPrompt}&rdquo;
                </div>
                <p className="text-[11px] text-zinc-500 font-normal">
                  Click the action button below to instantly load this style and prompt parameters into the studio generator.
                </p>
              </div>
            </div>
          )}

          {/* Action Footer inside Modal */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-500">
              Designed by <strong className="text-zinc-300">{project.designer.name}</strong> for {project.client || 'Creative Showcase'}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleApplyToStudio}
                className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>Load Prompt in Studio</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
