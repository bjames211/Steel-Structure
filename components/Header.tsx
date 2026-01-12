
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SteelStructure <span className="text-blue-400">AI</span></h1>
            <p className="text-xs text-slate-400 font-medium">INDUSTRIAL BUILDING ANALYSIS</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="text-sm text-slate-400 border border-slate-700 px-3 py-1 rounded-full">
            Precision Estimator v1.0
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
