import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Heart, 
  Eye, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Zap, 
  Compass, 
  ChevronDown,
  X
} from 'lucide-react';
import { SHOWCASE_PROJECTS } from '../data/showcaseProjects';
import { ProjectDetailModal } from './ProjectDetailModal';
import { playClickSound } from '../lib/soundFx';
import type { DesignProject, ProjectCategory } from '../types';

const CATEGORIES: ProjectCategory[] = [
  'All',
  'UI Design',
  'UX Design',
  'Web Design',
  'Mobile App',
  'Branding',
  'Dashboard'
];

interface FeaturedDesignsShowcaseProps {
  onUsePromptInStudio: (prompt: string, style: string) => void;
}

export const FeaturedDesignsShowcase: React.FC<FeaturedDesignsShowcaseProps> = ({
  onUsePromptInStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'appreciated' | 'viewed' | 'newest'>('appreciated');
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedProjects, setLikedProjects] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('gridscape_liked_projects');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [showAll, setShowAll] = useState(false);

  const handleToggleLike = (projectId: string) => {
    setLikedProjects((prev) => {
      const next = { ...prev, [projectId]: !prev[projectId] };
      try {
        localStorage.setItem('gridscape_liked_projects', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save like to localStorage', e);
      }
      return next;
    });
  };

  const filteredProjects = useMemo(() => {
    return SHOWCASE_PROJECTS.filter((proj) => {
      const categoryMatch = selectedCategory === 'All' || proj.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
        proj.title.toLowerCase().includes(q) ||
        proj.designer.name.toLowerCase().includes(q) ||
        proj.tags.some(t => t.toLowerCase().includes(q)) ||
        proj.description.toLowerCase().includes(q) ||
        proj.category.toLowerCase().includes(q);

      return categoryMatch && searchMatch;
    }).sort((a, b) => {
      const aLikes = a.likesCount + (likedProjects[a.id] ? 1 : 0);
      const bLikes = b.likesCount + (likedProjects[b.id] ? 1 : 0);
      
      if (sortBy === 'appreciated') return bLikes - aLikes;
      if (sortBy === 'viewed') return b.viewsCount - a.viewsCount;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy, likedProjects]);

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  const handleOpenProject = (project: DesignProject) => {
    playClickSound();
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section 
      id="creative-showcase-section"
      className="w-full bg-[#000000] border-t border-zinc-800 py-16 px-4 sm:px-6 relative"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* 1. Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Curated Design Archive</span>
            </div>
            
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              Featured Designs &amp; Creative Projects
            </h2>
            
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
              Explore award-winning UI/UX architectures, mobile frameworks, and interactive dashboards created by product designers.
            </p>
          </div>

          {/* Quick Summary Pill & Studio Sync Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">Total Showcased</span>
              <span className="font-semibold text-zinc-200 text-sm">{SHOWCASE_PROJECTS.length} Projects</span>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-medium">Studio Sync</span>
              <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                1-Click Prompt Load
              </span>
            </div>
          </div>
        </div>

        {/* 2. Controls: Category Filters, Search & Sort */}
        <div className="space-y-4">
          
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' 
                ? SHOWCASE_PROJECTS.length 
                : SHOWCASE_PROJECTS.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    playClickSound();
                    setSelectedCategory(cat);
                  }}
                  className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-zinc-950 border-white font-semibold shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-zinc-200 text-black font-semibold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Sorting Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, designer, tags..."
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort and Count */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs text-zinc-400">
              <span className="font-medium text-zinc-400">
                Showing {displayedProjects.length} of {filteredProjects.length}
              </span>

              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500 text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    playClickSound();
                    setSortBy(e.target.value as any);
                  }}
                  className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="appreciated" className="bg-zinc-900">Most Appreciated</option>
                  <option value="viewed" className="bg-zinc-900">Most Viewed</option>
                  <option value="newest" className="bg-zinc-900">Featured First</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Responsive Grid of Design Project Cards */}
        {filteredProjects.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-200">
              No Matching Projects Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              We couldn't find any designs matching "{searchQuery}". Try searching for other keywords or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project) => {
              const isLiked = !!likedProjects[project.id];
              const totalLikes = project.likesCount + (isLiked ? 1 : 0);

              return (
                <div
                  key={project.id}
                  className="group bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  {/* Card Top: Design Preview Image */}
                  <div className="relative overflow-hidden bg-zinc-950 aspect-[16/10]">
                    <img 
                      src={project.thumbnail} 
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Badges: Category & Like */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className="bg-zinc-950/80 text-zinc-300 border border-zinc-700 text-[10px] font-medium px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                        {project.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          handleToggleLike(project.id);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all backdrop-blur-sm border ${
                          isLiked 
                            ? 'bg-rose-500/90 text-white border-rose-400' 
                            : 'bg-zinc-950/80 text-zinc-300 border-zinc-700 hover:text-white hover:bg-zinc-900'
                        }`}
                        title={isLiked ? 'Unlike project' : 'Appreciate project'}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-white' : ''}`} />
                        <span>{totalLikes}</span>
                      </button>
                    </div>

                    {/* Hover Quick View Trigger */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <button
                        onClick={() => handleOpenProject(project)}
                        className="pointer-events-auto bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono z-10">
                      <span className="flex items-center gap-1 bg-zinc-950/70 px-2 py-0.5 rounded-md">
                        <Eye className="w-3 h-3 text-zinc-400" /> {project.viewsCount.toLocaleString()} views
                      </span>
                      <span className="text-zinc-300 font-medium bg-zinc-950/70 px-2 py-0.5 rounded-md">
                        {project.duration || 'Pro Case Study'}
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Designer Info, Title & Subtitle */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Designer Row */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <img 
                          src={project.designer.avatar} 
                          alt={project.designer.name} 
                          className="w-6 h-6 rounded-full border border-zinc-700 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200 truncate leading-none">
                            {project.designer.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {project.designer.location}
                          </p>
                        </div>
                      </div>

                      {/* Project Title */}
                      <h3 
                        onClick={() => handleOpenProject(project)}
                        className="font-display font-semibold text-base text-zinc-100 group-hover:text-white transition-colors leading-snug cursor-pointer line-clamp-1"
                      >
                        {project.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {project.subtitle}
                      </p>
                    </div>

                    {/* Tag Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            playClickSound();
                            setSearchQuery(tag);
                          }}
                          className="bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-500 font-medium self-center">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Action Buttons */}
                  <div className="px-4 pb-4 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    
                    {/* View Project Button */}
                    <button
                      onClick={() => handleOpenProject(project)}
                      className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>View Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    {/* Quick Studio Prompt Tool */}
                    <button
                      onClick={() => {
                        playClickSound();
                        onUsePromptInStudio(project.studioPrompt, project.suggestedStyle);
                        const textBoard = document.getElementById('text-board-container');
                        if (textBoard) {
                          textBoard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 p-2 rounded-lg transition-all"
                      title="Load this visual prompt into Gridscape Studio"
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* 4. "View All Projects" / "Show Less" Expand Interaction */}
        {filteredProjects.length > 6 && (
          <div className="pt-6 text-center">
            <button
              onClick={() => {
                playClickSound();
                setShowAll(!showAll);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-6 py-3 rounded-xl font-medium text-xs tracking-wide transition-all inline-flex items-center gap-2"
              id="view-all-projects-btn"
            >
              <span>{showAll ? 'Collapse to Featured (6)' : `View All Projects (${filteredProjects.length})`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

      </div>

      {/* 5. Rich Project Details Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUsePrompt={onUsePromptInStudio}
        onToggleLike={handleToggleLike}
        isLiked={selectedProject ? !!likedProjects[selectedProject.id] : false}
      />

    </section>
  );
};
