export interface ClipDropKey {
  id: string;
  key: string;
  maskedKey: string;
  addedAt: number;
  usedCount: number;
  maxQuota: number; // 100 images per key as required
  status: 'active' | 'exhausted' | 'disabled';
  label?: string;
  lastUsedAt?: number;
}

export interface AdminStats {
  totalKeys: number;
  activeKeys: number;
  exhaustedKeys: number;
  totalTokensRemaining: number;
  totalImagesGenerated: number;
  currentActiveKeyId?: string;
}

export type AspectRatioType = '1:1' | '16:9' | '9:16' | '4:3' | '3:2';

export interface StylePreset {
  id: string;
  name: string;
  promptSuffix: string;
  iconName: string;
  color: string;
}

export interface ImageGenerationRecord {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: AspectRatioType;
  imageUrl: string;
  createdAt: number;
  engineUsed: string;
  keyIdUsed?: string;
  latencyMs: number;
  wordCount: number;
  charCount: number;
  seed?: number;
  promptBreakdown?: {
    subject: string;
    lighting: string;
    style: string;
    colorPalette: string[];
  };
}

export interface PromptAnalysisStep {
  id: number;
  title: string;
  detail: string;
  progress: number;
  status: 'pending' | 'active' | 'completed';
}

export type ProjectCategory = 
  | 'All' 
  | 'UI Design' 
  | 'UX Design' 
  | 'Web Design' 
  | 'Mobile App' 
  | 'Branding' 
  | 'Dashboard';

export interface DesignProject {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProjectCategory, 'All'>;
  tags: string[];
  thumbnail: string;
  heroImage: string;
  likesCount: number;
  viewsCount: number;
  publishedDate: string;
  designer: {
    name: string;
    avatar: string;
    role: string;
    handle: string;
    location: string;
    verified?: boolean;
  };
  client?: string;
  duration?: string;
  description: string;
  caseStudy: {
    overview: string;
    challenge: string;
    solution: string;
    results: string;
    tools: string[];
    typography: {
      headingFont: string;
      bodyFont: string;
    };
    colorPalette: {
      name: string;
      hex: string;
      bgClass?: string;
    }[];
    deliverables: string[];
  };
  studioPrompt: string;
  suggestedStyle: string;
}

export const ADMIN_PASSCODE = '123QWErty.A...???...A80103';
