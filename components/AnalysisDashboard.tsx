import React, { useEffect, useState } from 'react';
import { EngineOutput } from '../types';
import { FileText, Sparkles } from 'lucide-react';

interface Props {
  output: EngineOutput | null;
  isProcessing: boolean;
}

interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

const DocumentEditor: React.FC<Props> = ({ output, isProcessing }) => {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Parse markdown headers to create dynamic outline
  useEffect(() => {
    if (!output?.content) return;

    const lines = output.content.split('\n');
    const items: OutlineItem[] = [];
    
    lines.forEach((line, index) => {
      // Match # Header or ## Header
      const match = line.match(/^(#{1,3})\s+(.+)/);
      if (match) {
        items.push({
          id: `section-${index}`,
          text: match[2].trim().replace(/\*\*/g, ''), // Remove bolding from TOC
          level: match[1].length
        });
      }
    });

    setOutline(items);
  }, [output?.content]);

  // Inject Custom Scrollbar CSS
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(99, 102, 241, 0.2);
      border-radius: 20px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(99, 102, 241, 0.5);
    }
  `;

  // If no output yet, show the "Void" empty state
  if (!output && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-900/20 animate-glow">
          <Sparkles className="w-8 h-8 text-indigo-400 opacity-75" />
        </div>
        <h3 className="text-xl font-light text-slate-400 mb-2">Awaiting Inspiration</h3>
        <p className="text-sm text-slate-600">Enter a topic below to ignite the engine.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <style>{scrollbarStyles}</style>

      {/* 1. The Navigator (Left Sidebar) */}
      <aside className="hidden md:flex flex-col w-[280px] shrink-0 bg-slate-900/30 backdrop-blur-md border-r border-slate-800/50 pt-8 pb-32 overflow-y-auto custom-scrollbar">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 text-slate-200 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-medium text-sm tracking-wide">Outline</span>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {isProcessing && outline.length === 0 ? (
             // Loading Skeleton for Sidebar
             [1,2,3,4].map(i => (
                <div key={i} className="h-8 rounded-lg bg-slate-800/50 animate-pulse mx-2 mb-2" />
             ))
          ) : (
            outline.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                   document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                   setActiveSection(item.id);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-300 group flex items-center gap-3
                  ${activeSection === item.id 
                    ? 'bg-indigo-500/10 text-indigo-300 shadow-[inset_2px_0_0_0_#818cf8]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }
                  ${item.level > 1 ? 'pl-8' : ''}
                `}
              >
                {/* Status Indicator Dot */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors
                  ${activeSection === item.id ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-slate-700 group-hover:bg-slate-600'}
                `}></span>
                
                <span className="truncate opacity-90">{item.text}</span>
              </button>
            ))
          )}
        </nav>
      </aside>

      {/* 2. Center Stage (Editor) - FIXED: overflow-y-auto and padding-bottom */}
      <main className="flex-1 relative h-full overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-3xl mx-auto pt-16 pb-32 px-8 md:px-12">
          
          {/* Header Info */}
          {output && (
            <div className="mb-12 text-center animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6">
                {output.isFullReport ? 'Full Generated Report' : 'Surgical Revision'}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-slate-100 leading-tight mb-4">
                {output.title || "Untitled Document"}
              </h1>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 uppercase tracking-widest font-medium">
                <span>AI Generated</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* The Page */}
          <div className="relative min-h-[80vh]">
            {isProcessing && !output ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                <div className="h-32 bg-slate-800/50 rounded-xl mt-8"></div>
              </div>
            ) : (
              <article className="prose prose-invert prose-lg max-w-none">
                 {/* Render Markdown Content */}
                 <div className="font-serif text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {output?.content.split('\n').map((line, i) => {
                       const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
                       if (headerMatch) {
                          const id = `section-${i}`; 
                          const isH1 = headerMatch[1].length === 1;
                          const className = isH1 
                            ? "text-2xl font-sans font-bold text-slate-100 mt-12 mb-6 pb-4 border-b border-slate-800/60" 
                            : "text-xl font-sans font-semibold text-indigo-100 mt-8 mb-4";
                          return <div key={i} id={id} className={className}>{headerMatch[2]}</div>
                       }
                       // Regular paragraph styling
                       if (line.trim() === '') return <br key={i} />;
                       return <p key={i} className="mb-4 text-slate-300 font-light">{line}</p>
                    })}
                 </div>
              </article>
            )}
            
            {/* Processing Overlay for Mode B */}
            {isProcessing && output && (
               <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 flex flex-col items-center">
                     <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                     <span className="text-sm font-medium text-slate-300 tracking-wide">Refining Document...</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentEditor;
