import React, { useState, useRef } from 'react';
import { Send, Sparkles, StopCircle, GraduationCap } from 'lucide-react';
import { createEngineSession, sendMessageToEngine } from './services/geminiService';
import { AppState } from './types';
import DocumentEditor from './components/AnalysisDashboard';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    topic: '',
    isProcessing: false,
    output: null,
    error: null
  });
  
  const [inputText, setInputText] = useState('');
  const chatSessionRef = useRef<Chat | null>(null);

  const initializeSession = () => {
    chatSessionRef.current = createEngineSession();
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || state.isProcessing) return;

    const userInput = inputText;
    setInputText(''); // Clear immediately
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      if (!chatSessionRef.current) {
        initializeSession();
      }
      
      const output = await sendMessageToEngine(chatSessionRef.current!, userInput);
      setState(prev => ({ ...prev, output, isProcessing: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: "Connection Interrupted." 
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 flex flex-col overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Bar (Minimal) */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-between px-6 border-b border-slate-800/50">
         <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-sans font-semibold tracking-tight text-slate-100">Academic<span className="text-indigo-400">Engine</span></h1>
         </div>
         
         <div className="flex items-center gap-4">
             {state.isProcessing && (
                <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                   PROCESSING
                </div>
             )}
         </div>
      </header>

      {/* Main Workspace - FIXED: Added overflow-hidden and min-h-0 to constrain flex item */}
      <main className="flex-1 pt-14 relative z-0 min-h-0 overflow-hidden">
         <DocumentEditor output={state.output} isProcessing={state.isProcessing} />
      </main>

      {/* 3. Bottom Floating Command Bar (The AI Brain) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center pb-8 pt-12 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
        <div className="pointer-events-auto w-full max-w-2xl px-4 relative group">
           
           {/* Glow Effect */}
           <div className={`absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl transition-opacity duration-500 ${state.isProcessing ? 'opacity-100 animate-pulse-slow' : 'opacity-0 group-hover:opacity-40'}`}></div>

           <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5 focus-within:ring-indigo-500/50 transition-all duration-300">
              
              <div className="pl-4 pr-3 text-slate-500">
                 {state.isProcessing ? (
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                 ) : (
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                 )}
              </div>

              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={state.output ? "Give a revision command (e.g. 'Expand the introduction')..." : "Enter a research topic to begin..."}
                disabled={state.isProcessing}
                className="w-full bg-transparent border-0 py-4 px-2 text-slate-200 placeholder:text-slate-500 focus:ring-0 text-base font-light outline-none"
              />

              <button 
                onClick={handleSubmit}
                disabled={!inputText.trim() || state.isProcessing}
                className="mr-2 p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-slate-400 transition-all duration-200"
              >
                {state.isProcessing ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </button>
           </div>
           
           {/* Context Label */}
           <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                 {state.output ? "Mode B: Surgical Edit" : "Mode A: Genesis"}
              </span>
           </div>

        </div>
      </div>

    </div>
  );
};

export default App;
