
import React, { useState } from 'react';
import { BuildingAnalysis, WallBreakdown } from '../types';

interface AnalysisResultProps {
  analysis: BuildingAnalysis;
  imageUrls: string[];
}

const COLOR_MAP: Record<string, string> = {
  "Charcoal": "#36454F",
  "Slate Blue": "#6A5ACD",
  "Burnished Slate": "#4E443C",
  "Forest Green": "#228B22",
  "Polar White": "#F8F8FF",
  "Light Grey": "#D3D3D3",
  "Desert Sand": "#EDC9AF",
  "Crimson Red": "#DC143C",
  "Hawaiian Blue": "#0073CF",
  "Gallery Blue": "#005073",
  "Colony Green": "#355E3B",
  "Copper Penny": "#AD6F69",
  "Rustic Red": "#8B0000",
  "Tan": "#D2B48C",
  "Brown": "#A52A2A",
  "Black": "#000000",
  "Burgundy": "#800020",
  "Clay": "#BE6A31",
  "Ash Grey": "#B2BEB5",
  "Ivy Green": "#32612D",
  "N/A": "transparent",
  "Unknown": "#f1f5f9"
};

const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score > 85 ? 'bg-emerald-500' : score > 65 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-sm">
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
      <span className="text-[10px] font-bold uppercase tracking-tight text-white/90">{score}% Reliability</span>
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, imageUrls }) => {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Angle Gallery */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Visual Inspection</h3>
            <ConfidenceBadge score={analysis.colors.confidence} />
          </div>
          
          <div className="rounded-xl overflow-hidden aspect-video relative group bg-slate-100 flex-grow">
            <img 
              src={imageUrls[activeImage]} 
              alt="Analyzed building" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {imageUrls.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-6">
            <ColorSwatch label="Roof" colorName={analysis.colors.roof} />
            <ColorSwatch label="Wall" colorName={analysis.colors.wall} />
            <ColorSwatch label="Trim" colorName={analysis.colors.trim} />
            <ColorSwatch label="Wainscot" colorName={analysis.colors.wainscot} />
          </div>
        </div>

        {/* Right: Specs & Features */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
             </div>
             
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-blue-400 font-bold text-xs uppercase tracking-widest">Structural Scaling</h3>
               <ConfidenceBadge score={analysis.dimensions.confidence} />
             </div>
             
             <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase mb-1">Gable Width</p>
                  <p className="text-2xl font-bold">{analysis.dimensions.widthGableSideFeet}' <span className="text-xs font-normal text-slate-500">FT</span></p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase mb-1">Total Length</p>
                  <p className="text-2xl font-bold">{analysis.dimensions.lengthFeet}' <span className="text-xs font-normal text-slate-500">FT</span></p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase mb-1">Peak Height</p>
                  <p className="text-2xl font-bold">{analysis.dimensions.peakHeightFeet}' <span className="text-xs font-normal text-slate-500">FT</span></p>
                </div>
             </div>

             <div className="border-t border-slate-800 pt-6">
                <p className="text-slate-400 text-sm mb-1">Estimated Area</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-blue-400">{analysis.dimensions.estimatedSquareFootage.toLocaleString()}</p>
                  <span className="text-xl font-medium text-blue-400/60 uppercase">SQ.FT.</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Bay & Feature Count</h3>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Cross-Verified Data</div>
            </div>
            
            {/* Bay Analysis Row */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
                    {analysis.features.bays.count}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900 uppercase">Structural Bays</h4>
                    <p className="text-[10px] text-blue-700">Estimated {analysis.features.bays.estimatedSpacingFeet}' Spacing</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Scale Factor</p>
                  <p className="text-sm font-bold text-blue-800">{analysis.features.bays.count} x {analysis.features.bays.estimatedSpacingFeet}ft</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <FeatureCard icon="🚪" label="Garage" count={analysis.features.garageDoors.total} />
              <FeatureCard icon="🚶" label="Man Doors" count={analysis.features.manDoors.total} />
              <FeatureCard icon="🪟" label="Windows" count={analysis.features.windows} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <BreakdownList title="Garage Door Placement" items={analysis.features.garageDoors.breakdown} />
              <BreakdownList title="Man Door Placement" items={analysis.features.manDoors.breakdown} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl">
        <h3 className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase tracking-wider mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          Logic Verification (Bay-to-Scale)
        </h3>
        <p className="text-slate-600 leading-relaxed italic mb-4 text-sm bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          "{analysis.dimensions.estimationLogic}"
        </p>
        <div className="text-[10px] text-slate-400 uppercase font-bold flex justify-between">
          <span>* Multi-angle cross-referencing enabled</span>
          <span>© SteelStructure AI Systems</span>
        </div>
      </div>
    </div>
  );
};

const ColorSwatch: React.FC<{ label: string; colorName: string }> = ({ label, colorName }) => {
  const bgColor = COLOR_MAP[colorName] || "#f1f5f9";
  const isNA = colorName === 'N/A';
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`w-10 h-10 rounded-lg shadow-inner border border-slate-200 flex items-center justify-center text-[9px] overflow-hidden ${isNA ? 'bg-slate-100' : ''}`} 
        style={{ backgroundColor: bgColor }}
      >
        {isNA ? <span className="text-slate-300">N/A</span> : ''}
      </div>
      <div className="text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">{label}</p>
        <p className="text-[10px] font-semibold text-slate-700 truncate max-w-[70px] mt-0.5">
          {colorName}
        </p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; label: string; count: number }> = ({ icon, label, count }) => (
  <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-100">
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-2xl font-bold text-slate-800">{count}</span>
    <span className="text-[10px] font-bold text-slate-400 uppercase text-center leading-none mt-1">{label}</span>
  </div>
);

const BreakdownList: React.FC<{ title: string; items: WallBreakdown[] }> = ({ title, items }) => (
  <div className="space-y-2">
    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h4>
    {items.length > 0 ? (
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
            <span className="text-slate-600 font-medium">{item.wall}</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">{item.count}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-slate-400 italic">None detected</p>
    )}
  </div>
);

export default AnalysisResult;
