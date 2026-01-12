
import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { AppState, BuildingAnalysis } from './types';
import { analyzeBuildingImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    images: [],
    loading: false,
    error: null,
    result: null,
  });

  const handleImagesReady = async (base64Array: string[]) => {
    setState(prev => ({ 
      ...prev, 
      images: base64Array, 
      loading: true, 
      error: null, 
      result: null 
    }));
    
    try {
      const result = await analyzeBuildingImage(base64Array);
      setState(prev => ({ ...prev, loading: false, result }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.message || 'An unexpected error occurred during multi-angle analysis.' 
      }));
    }
  };

  const handleReset = () => {
    setState({
      images: [],
      loading: false,
      error: null,
      result: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          {!state.images.length && !state.loading && (
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                Multi-Angle Building <br className="hidden sm:block" /> Analysis Powered by AI
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-500">
                Upload up to 5 photos of the same building from different angles. Our AI cross-references viewpoints for higher accuracy in feature counting and scale estimation.
              </p>
            </div>
          )}

          {/* Interaction Area */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
            {!state.result && !state.loading ? (
              <ImageUploader onImagesReady={handleImagesReady} loading={state.loading} />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-800">
                    {state.loading ? 'Processing Analysis' : 'Aggregated Analysis Dashboard'}
                  </h3>
                  {!state.loading && (
                    <button 
                      onClick={handleReset}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Analysis
                    </button>
                  )}
                </div>

                {state.loading && (
                  <div className="flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-slate-800">Processing {state.images.length} Viewpoints...</h4>
                      <p className="text-slate-500 max-w-sm mt-2">
                        Cross-referencing angles to detect all doors, windows, and calculate building scale.
                      </p>
                      <div className="flex gap-2 justify-center mt-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center animate-in zoom-in-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="text-xl font-bold text-red-900 mb-2">Analysis Interrupted</h4>
                    <p className="text-red-700 mb-6">{state.error}</p>
                    <button 
                      onClick={handleReset}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {state.result && state.images.length > 0 && (
                  <AnalysisResult analysis={state.result} imageUrls={state.images} />
                )}
              </div>
            )}
          </div>

          {/* Feature List */}
          {!state.result && !state.loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <FeatureItem 
                title="Cross-Angle Sync" 
                desc="Identifies parts of the building hidden in some views but visible in others for 100% coverage."
                icon="🔄"
              />
              <FeatureItem 
                title="Feature Verification" 
                desc="Validates window and door counts by seeing them from multiple perspectives to avoid duplicates."
                icon="✅"
              />
              <FeatureItem 
                title="Triangulated Scale" 
                desc="Uses multiple scale references (doors, frames) to arrive at a more reliable dimension estimate."
                icon="📏"
              />
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100 bg-white mt-12">
        <div className="container mx-auto px-4">
          <p className="font-medium text-slate-500">SteelStructure AI Systems</p>
          <p className="mt-1">Precision industrial analysis powered by Gemini Vision AI</p>
          <p className="mt-4 opacity-75">© {new Date().getFullYear()} All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem: React.FC<{ title: string; desc: string; icon: string }> = ({ title, desc, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
    <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl">{icon}</div>
    <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;
