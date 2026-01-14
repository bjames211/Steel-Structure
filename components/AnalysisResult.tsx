
import React, { useState, useMemo } from 'react';
import { BuildingAnalysis, VariableInsight, FeatureInsight, ColorPaletteItem } from '../types';
import { generate3DVariant } from '../services/geminiService';

interface AnalysisResultProps {
  analysis: BuildingAnalysis;
  mainUrl: string;
  onGenerateImage: (url: string) => void;
  isGenerating: boolean;
  generatedUrl: string | null;
  colorPalette: ColorPaletteItem[];
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  analysis: initialAnalysis, mainUrl, onGenerateImage, isGenerating, generatedUrl, colorPalette
}) => {
  const [analysis, setAnalysis] = useState<BuildingAnalysis>(initialAnalysis);

  const colorMap = useMemo(() => colorPalette.reduce((acc, curr) => ({
    ...acc,
    [curr.name]: curr.hex
  }), {} as Record<string, string>), [colorPalette]);

  const handle3DGen = async () => {
    try {
      const url = await generate3DVariant(analysis);
      onGenerateImage(url);
    } catch (e) {
      alert("Visual generation failed.");
    }
  };

  const updateVariable = (key: keyof BuildingAnalysis['variables'], field: 'value' | 'thought', val: string | number) => {
    setAnalysis(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [key]: { ...prev.variables[key], [field]: val }
      }
    }));
  };

  const updateFeature = (key: keyof BuildingAnalysis['features'], field: 'total' | 'thought', val: string | number) => {
    setAnalysis(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: { ...prev.features[key], [field]: val }
      }
    }));
  };

  const vars = analysis.variables;
  const feats = analysis.features;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Product Identity Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 flex-shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
             </svg>
          </div>
          <div className="flex-grow min-w-0">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Short Display Title</p>
             <input 
               type="text" value={analysis.productTitleShort} 
               onChange={(e) => setAnalysis(prev => ({ ...prev, productTitleShort: e.target.value }))}
               className="w-full text-lg font-black text-slate-900 outline-none focus:text-blue-600 transition-colors bg-transparent truncate"
             />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-2xl shadow-lg shadow-slate-100 flex-shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
          </div>
          <div className="flex-grow min-w-0">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Full SEO Title</p>
             <input 
               type="text" value={analysis.productTitleLong} 
               onChange={(e) => setAnalysis(prev => ({ ...prev, productTitleLong: e.target.value }))}
               className="w-full text-sm font-bold text-slate-600 outline-none focus:text-blue-600 transition-colors bg-transparent truncate"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <VarTile 
          label="WIDTH (OUTER)" value={vars?.width?.value ?? 0} unit="FT" icon="↔️" 
          thought={vars?.width?.thought ?? ''} 
          onValueChange={(v) => updateVariable('width', 'value', Number(v))}
          onThoughtChange={(t) => updateVariable('width', 'thought', t)}
        />
        <VarTile 
          label="LENGTH (DEPTH)" value={vars?.length?.value ?? 0} unit="FT" icon="↕️" 
          thought={vars?.length?.thought ?? ''}
          onValueChange={(v) => updateVariable('length', 'value', Number(v))}
          onThoughtChange={(t) => updateVariable('length', 'thought', t)}
        />
        <VarTile 
          label="SIDE HEIGHT" value={vars?.wallHeight?.value ?? 0} unit="FT" icon="📏" 
          thought={vars?.wallHeight?.thought ?? ''}
          onValueChange={(v) => updateVariable('wallHeight', 'value', Number(v))}
          onThoughtChange={(t) => updateVariable('wallHeight', 'thought', t)}
        />
        <VarTile 
          label="ROOF PITCH" value={vars?.pitch?.value ?? '3/12'} unit="" icon="📐" 
          thought={vars?.pitch?.thought ?? ''}
          onValueChange={(v) => updateVariable('pitch', 'value', v)}
          onThoughtChange={(t) => updateVariable('pitch', 'thought', t)}
        />
        <VarTile 
          label="ROLL-UP DOORS" value={feats?.garageDoors?.total ?? 0} unit="QTY" icon="🚗" 
          thought={feats?.garageDoors?.thought ?? ''}
          onValueChange={(v) => updateFeature('garageDoors', 'total', Number(v))}
          onThoughtChange={(t) => updateFeature('garageDoors', 'thought', t)}
        />
        <VarTile 
          label="WALK-IN DOORS" value={feats?.manDoors?.total ?? 0} unit="QTY" icon="🚪" 
          thought={feats?.manDoors?.thought ?? ''}
          onValueChange={(v) => updateFeature('manDoors', 'total', Number(v))}
          onThoughtChange={(t) => updateFeature('manDoors', 'thought', t)}
        />
        <VarTile 
          label="WINDOWS" value={feats?.windows?.total ?? 0} unit="QTY" icon="🪟" 
          thought={feats?.windows?.thought ?? ''}
          onValueChange={(v) => updateFeature('windows', 'total', Number(v))}
          onThoughtChange={(t) => updateFeature('windows', 'thought', t)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Confidence Scores</h3>
              <div className="space-y-4">
                 <ConfidenceBar label="Sizing Confidence" value={analysis.confidence?.sizing ?? 0} color="bg-blue-500" />
                 <ConfidenceBar label="Color Confidence" value={analysis.confidence?.colors ?? 0} color="bg-emerald-500" />
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detected Colors</h3>
             <div className="space-y-2">
                <ColorBlock label="Roof" name={analysis.colors?.roof ?? 'N/A'} hex={colorMap[analysis.colors?.roof] || '#eee'} />
                <ColorBlock label="Wall" name={analysis.colors?.wall ?? 'N/A'} hex={colorMap[analysis.colors?.wall] || '#eee'} />
                <ColorBlock label="Trim" name={analysis.colors?.trim ?? 'N/A'} hex={colorMap[analysis.colors?.trim] || '#eee'} />
                <ColorBlock label="Wainscot" name={analysis.colors?.wainscot ?? 'N/A'} hex={colorMap[analysis.colors?.wainscot] || '#eee'} />
             </div>
             <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Audit Insight:</p>
                <p className="text-[11px] text-slate-600 font-medium italic leading-tight">{analysis.colors?.thought ?? 'No insight.'}</p>
             </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
             <h3 className="text-xs font-bold text-blue-400 uppercase mb-4 tracking-widest">Visual Variant</h3>
             <img src={mainUrl} className="w-full aspect-video object-cover rounded-xl mb-4 border border-white/5" />
             <button 
               onClick={handle3DGen} disabled={isGenerating}
               className="w-full py-4 bg-blue-600 rounded-xl text-xs font-black uppercase hover:bg-blue-500 transition-all disabled:opacity-50"
             >
               {isGenerating ? 'Rendering Engine...' : 'Generate 3D Visual'}
             </button>
             {generatedUrl && (
               <div className="mt-4 animate-in zoom-in">
                 <img src={generatedUrl} className="w-full rounded-xl border-2 border-white/10 shadow-lg" />
               </div>
             )}
           </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white p-1 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
             <div className="bg-slate-50 p-8 rounded-[2.2rem] border border-white">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-blue-600"></span>
                  World-Class Sales Description
                </h3>
                <textarea 
                  value={analysis.descriptions?.actualSalesCopy ?? ''}
                  onChange={(e) => setAnalysis(prev => ({ ...prev, descriptions: { ...prev.descriptions, actualSalesCopy: e.target.value } }))}
                  className="w-full bg-transparent text-xl text-slate-800 leading-snug font-medium italic outline-none focus:ring-2 focus:ring-blue-100 rounded-lg p-2 min-h-[400px]"
                />
             </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-800">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Markdown Template (Dynamic)</h3>
                <span className="text-[10px] text-blue-400 font-bold uppercase">Uses Placeholders</span>
             </div>
             <textarea 
               value={analysis.descriptions?.templateMarkdown ?? ''}
               onChange={(e) => setAnalysis(prev => ({ ...prev, descriptions: { ...prev.descriptions, templateMarkdown: e.target.value } }))}
               className="w-full h-96 bg-black/30 text-blue-100/70 font-mono text-[11px] p-6 rounded-2xl border border-white/5 outline-none focus:ring-1 focus:ring-white/20"
             />
           </div>
        </div>
      </div>
    </div>
  );
};

const VarTile: React.FC<{ 
  label: string; value: string | number; unit: string; icon: string; thought: string; 
  onValueChange: (v: string) => void; onThoughtChange: (t: string) => void;
}> = ({ label, value, unit, icon, thought, onValueChange, onThoughtChange }) => {
  const [isEditingThought, setIsEditingThought] = useState(false);

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-lg transition-all group relative">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{label}</p>
      <div className="flex items-center justify-center gap-0.5">
        <input 
          type="text" value={value} 
          onChange={e => onValueChange(e.target.value)}
          className="text-2xl font-black text-slate-900 w-full bg-transparent text-center focus:outline-none focus:text-blue-600 px-1"
        />
        <span className="text-[9px] text-blue-500 font-black">{unit}</span>
      </div>
      
      <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-800 text-white text-[9px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-50 shadow-2xl border border-slate-700 pointer-events-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="text-blue-400 font-black uppercase tracking-widest">AI Reasoning</span>
          <button onClick={() => setIsEditingThought(!isEditingThought)} className="text-[8px] underline">Edit</button>
        </div>
        {isEditingThought ? (
          <textarea 
            className="w-full bg-slate-900 p-1 text-white border border-slate-600 rounded outline-none"
            value={thought}
            onChange={(e) => onThoughtChange(e.target.value)}
          />
        ) : (
          <p className="text-slate-300 font-medium italic leading-tight text-left">{thought || 'No insights available.'}</p>
        )}
      </div>
    </div>
  );
};

const ConfidenceBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
       <span>{label}</span>
       <span className="text-slate-900">{Math.round((value || 0) * 100)}%</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
       <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(value || 0) * 100}%` }}></div>
    </div>
  </div>
);

const ColorBlock: React.FC<{ label: string; name: string; hex: string }> = ({ label, name, hex }) => (
  <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-xl border border-slate-100 transition-all">
    <div className="w-8 h-8 rounded-lg shadow-sm border border-black/5 flex-shrink-0" style={{ backgroundColor: hex }} />
    <div className="flex-grow overflow-hidden">
      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-[10px] font-black text-slate-800 truncate">{name}</p>
    </div>
  </div>
);

export default AnalysisResult;
