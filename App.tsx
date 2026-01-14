
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import WebsiteSettings from './components/WebsiteSettings';
import { AppState, SteelFrameType, WebsiteConfig, CreatedProduct, BuildingAnalysis, ColorPaletteItem } from './types';
import { analyzeBuildingImage } from './services/geminiService';

const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const REGIONS = ["ALL", ...STATES];

const DEFAULT_PALETTE: ColorPaletteItem[] = [
  { name: "Charcoal", hex: "#36454F" },
  { name: "Slate Blue", hex: "#6A5ACD" },
  { name: "Burnished Slate", hex: "#4E443C" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Polar White", hex: "#F8F8FF" },
  { name: "Light Grey", hex: "#D3D3D3" },
  { name: "Desert Sand", hex: "#EDC9AF" },
  { name: "Crimson Red", hex: "#DC143C" },
  { name: "Hawaiian Blue", hex: "#0073CF" },
  { name: "Gallery Blue", hex: "#005073" },
  { name: "Colony Green", hex: "#355E3B" },
  { name: "Copper Penny", hex: "#AD6F69" },
  { name: "Rustic Red", hex: "#8B0000" },
  { name: "Tan", hex: "#D2B48C" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Black", hex: "#000000" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Clay", hex: "#BE6A31" },
  { name: "Ash Grey", hex: "#B2BEB5" },
  { name: "Ivy Green", hex: "#32612D" }
];

const DEFAULT_WEBSITE: WebsiteConfig = {
  id: 'main-web',
  name: 'Main E-Commerce',
  brand: 'SteelDirect',
  phone: '888-555-0100',
  configuratorUrl: 'https://build.steeldirect.com',
  description: 'Primary sales portal.',
  rules: {
    width: { enabled: true, offset: 0 },
    length: { enabled: true, offset: 0 },
    height: { enabled: true, offset: 0 },
    allowRedIron: true,
    allowGalvanized: true,
    states: [...STATES]
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const savedWebsites = localStorage.getItem('ss_websites');
    const savedInventory = localStorage.getItem('ss_inventory');
    const savedPalette = localStorage.getItem('ss_palette');
    return {
      mainImage: null,
      variantImage: null,
      video: null,
      loading: false,
      generatingImage: false,
      generatedVariantUrl: null,
      error: null,
      result: null,
      view: 'analysis',
      websites: savedWebsites ? JSON.parse(savedWebsites) : [DEFAULT_WEBSITE],
      selectedWebsiteId: savedWebsites ? JSON.parse(savedWebsites)[0]?.id || DEFAULT_WEBSITE.id : DEFAULT_WEBSITE.id,
      inventory: savedInventory ? JSON.parse(savedInventory) : [],
      editingProductId: null,
      settings: {
        steelFrame: 'Red Iron',
        state: 'ALL'
      },
      colorPalette: savedPalette ? JSON.parse(savedPalette) : DEFAULT_PALETTE,
      queue: [],
      autoProcess: true
    };
  });

  useEffect(() => {
    localStorage.setItem('ss_websites', JSON.stringify(state.websites));
    localStorage.setItem('ss_inventory', JSON.stringify(state.inventory));
    localStorage.setItem('ss_palette', JSON.stringify(state.colorPalette));
  }, [state.websites, state.inventory, state.colorPalette]);

  const activeWebsite = state.websites.find(w => w.id === state.selectedWebsiteId) || state.websites[0] || DEFAULT_WEBSITE;

  const runAnalysis = useCallback(async (img: string) => {
    if (!img) return;
    setState(s => ({ ...s, loading: true, error: null, result: null }));
    try {
      const result = await analyzeBuildingImage(
        img, 
        undefined, 
        undefined, 
        state.colorPalette,
        activeWebsite.brand,
        activeWebsite.phone,
        activeWebsite.configuratorUrl
      );
      
      const defaultVars = {
        width: { value: 0, thought: 'Not detected' },
        length: { value: 0, thought: 'Not detected' },
        wallHeight: { value: 0, thought: 'Not detected' },
        peakHeight: { value: 0, thought: 'Not detected' },
        pitch: { value: '3/12', thought: 'Not detected' }
      };

      const vars = { ...defaultVars, ...(result.variables || {}) };
      
      const safeWidth = vars.width?.value || 0;
      const safeLength = vars.length?.value || 0;
      const safeHeight = vars.wallHeight?.value || 0;

      const adjustedWidth = activeWebsite.rules.width.enabled ? Number(safeWidth) + activeWebsite.rules.width.offset : safeWidth;
      const adjustedLength = activeWebsite.rules.length.enabled ? Number(safeLength) + activeWebsite.rules.length.offset : safeLength;
      const adjustedHeight = activeWebsite.rules.height.enabled ? Number(safeHeight) + activeWebsite.rules.height.offset : safeHeight;
      
      const updatedResult: BuildingAnalysis = {
        ...result,
        variables: { 
          ...vars, 
          width: { ...(vars.width || defaultVars.width), value: adjustedWidth }, 
          length: { ...(vars.length || defaultVars.length), value: adjustedLength },
          wallHeight: { ...(vars.wallHeight || defaultVars.wallHeight), value: adjustedHeight } 
        }
      };

      setState(s => ({ 
        ...s, 
        loading: false, 
        result: updatedResult,
        settings: {
          ...s.settings,
          state: updatedResult.metadata?.detectedState || s.settings.state
        }
      }));

      // If Auto-Pilot is on, trigger save after a brief delay
      if (state.autoProcess) {
        setTimeout(() => triggerAutoSave(updatedResult, img), 1500);
      }

    } catch (err: any) {
      console.error("Analysis Error:", err);
      setState(s => ({ ...s, loading: false, error: err.message || "Engine failure." }));
    }
  }, [state.colorPalette, activeWebsite, state.autoProcess]);

  const triggerAutoSave = (res: BuildingAnalysis, img: string) => {
    setState(s => {
      // Check if we already have this as a result (avoid double save)
      const productData: CreatedProduct = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        sku: res.sku,
        productTitleShort: res.productTitleShort,
        productTitleLong: res.productTitleLong,
        websiteId: activeWebsite.id,
        websiteName: activeWebsite.name,
        brand: activeWebsite.brand,
        dimensions: {
          width: Number(res.variables.width?.value || 0),
          length: Number(res.variables.length?.value || 0),
          height: Number(res.variables.wallHeight?.value || 0),
          pitch: String(res.variables.pitch?.value || '3/12')
        },
        colors: {
          roof: res.colors.roof,
          wall: res.colors.wall,
          trim: res.colors.trim,
          wainscot: res.colors.wainscot
        },
        features: {
          garageDoors: res.features.garageDoors?.total || 0,
          manDoors: res.features.manDoors?.total || 0,
          windows: res.features.windows?.total || 0
        },
        confidence: {
          sizing: res.confidence?.sizing || 0,
          colors: res.confidence?.colors || 0
        },
        description: res.descriptions.actualSalesCopy,
        state: s.settings.state,
        imageUrl: img,
        fullAnalysis: res
      };

      const nextImage = s.queue[0] || null;
      const nextQueue = s.queue.slice(1);

      if (nextImage) {
        setTimeout(() => runAnalysis(nextImage), 100);
      }

      return {
        ...s,
        inventory: [productData, ...s.inventory],
        result: null,
        mainImage: nextImage,
        queue: nextQueue,
        variantImage: null,
        generatedVariantUrl: null,
        editingProductId: null,
        view: nextImage ? 'analysis' : 'inventory'
      };
    });
  };

  const handleFilesReady = (files: string[]) => {
    setState(s => {
      const newQueue = [...s.queue, ...files];
      let nextMain = s.mainImage;
      let finalQueue = newQueue;

      // If we don't have a main image and we aren't loading, pick the first one
      if (!s.mainImage && !s.loading && newQueue.length > 0) {
        nextMain = newQueue[0];
        finalQueue = newQueue.slice(1);
        
        if (s.autoProcess) {
          setTimeout(() => runAnalysis(nextMain!), 100);
        }
      } else if (s.mainImage && s.autoProcess && !s.loading && !s.result) {
        // We have a main image but it's not processing yet
        setTimeout(() => runAnalysis(s.mainImage!), 100);
      }

      return {
        ...s,
        mainImage: nextMain,
        queue: finalQueue
      };
    });
  };

  const handleSaveToInventory = () => {
    if (!state.result || !state.mainImage) return;
    triggerAutoSave(state.result, state.mainImage);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this inventory record?")) {
      setState(s => ({
        ...s,
        inventory: s.inventory.filter(p => p.id !== id)
      }));
    }
  };

  const handleEditProduct = (product: CreatedProduct) => {
    setState(s => ({
      ...s,
      result: product.fullAnalysis,
      mainImage: product.imageUrl,
      settings: { ...s.settings, state: product.state },
      view: 'analysis',
      selectedWebsiteId: product.websiteId,
      editingProductId: product.id,
      autoProcess: false
    }));
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      mainImage: null,
      variantImage: null,
      video: null,
      loading: false,
      generatingImage: false,
      generatedVariantUrl: null,
      error: null,
      result: null,
      view: 'analysis',
      editingProductId: null,
      queue: [],
      settings: { ...prev.settings, state: 'ALL' }
    }));
  };

  const colorMap: Record<string, string> = state.colorPalette.reduce((acc, curr) => ({
    ...acc,
    [curr.name]: curr.hex
  }), {});

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        onOpenSettings={() => setState(s => ({ ...s, view: 'settings' }))} 
        onOpenInventory={() => setState(s => ({ ...s, view: 'inventory' }))}
      />
      
      <main className="flex-grow flex flex-col xl:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {state.view === 'settings' ? (
          <div className="flex-grow p-8 overflow-y-auto">
             <div className="max-w-7xl mx-auto">
                <WebsiteSettings 
                  websites={state.websites} 
                  onUpdate={(sites) => setState(s => ({ ...s, websites: sites }))}
                  colorPalette={state.colorPalette}
                  onUpdatePalette={(palette) => setState(s => ({ ...s, colorPalette: palette }))}
                  onClose={() => setState(s => ({ ...s, view: 'analysis' }))}
                />
             </div>
          </div>
        ) : state.view === 'inventory' ? (
          <div className="flex-grow p-8 overflow-y-auto bg-white">
             <div className="max-w-7xl mx-auto space-y-8">
               <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Vault</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Processed Assets & Global Records</p>
                  </div>
                  <button 
                    onClick={() => setState(s => ({ ...s, view: 'analysis' }))} 
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-blue-700 transition-all"
                  >
                    Ingest More
                  </button>
               </div>
               
               {state.inventory.length === 0 ? (
                 <div className="text-center py-40 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <span className="text-6xl block mb-6">🏜️</span>
                    <p className="font-black text-slate-300 uppercase tracking-[0.3em] text-[10px]">No assets currently stored in the vault</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                      <thead>
                        <tr className="text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                          <th className="pb-6">Asset</th>
                          <th className="pb-6">Identity & Region</th>
                          <th className="pb-6">Dimensions</th>
                          <th className="pb-6">Accessories</th>
                          <th className="pb-6">Colors</th>
                          <th className="pb-6">Confidence</th>
                          <th className="pb-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {state.inventory.map(item => (
                          <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-6">
                               <div className="w-24 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group/img cursor-zoom-in">
                                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                               </div>
                            </td>
                            <td className="py-6 pr-4">
                               <p className="font-black text-slate-900 text-sm truncate max-w-[240px]" title={item.productTitleLong}>
                                 {item.productTitleShort}
                               </p>
                               <p className="text-[9px] text-slate-400 font-bold truncate max-w-[240px] mt-0.5">{item.productTitleLong}</p>
                               <div className="flex gap-2 mt-2">
                                 <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.brand}</span>
                                 <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.state}</span>
                               </div>
                            </td>
                            <td className="py-6">
                               <p className="text-sm font-black text-slate-800">
                                 {item.dimensions.width}'x{item.dimensions.length}'x{item.dimensions.height}'
                               </p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pitch: {item.dimensions.pitch}</p>
                            </td>
                            <td className="py-6">
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                   <span className="w-3.5 h-3.5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-sm">G</span>
                                   <span>{item.features.garageDoors} Garage</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                   <span className="w-3.5 h-3.5 flex items-center justify-center bg-orange-100 text-orange-600 rounded-sm">D</span>
                                   <span>{item.features.manDoors} Walk-in</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                                   <span className="w-3.5 h-3.5 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-sm">W</span>
                                   <span>{item.features.windows} Windows</span>
                                 </div>
                               </div>
                            </td>
                            <td className="py-6">
                               <div className="flex -space-x-1.5">
                                  <ColorDot color={item.colors.roof} label="Roof" map={colorMap} />
                                  <ColorDot color={item.colors.wall} label="Wall" map={colorMap} />
                                  <ColorDot color={item.colors.trim} label="Trim" map={colorMap} />
                                  <ColorDot color={item.colors.wainscot} label="Wain" map={colorMap} />
                               </div>
                            </td>
                            <td className="py-6">
                               <div className="space-y-1 w-24">
                                  <MiniConf label="Sizing" val={item.confidence.sizing} color="bg-blue-400" />
                                  <MiniConf label="Colors" val={item.confidence.colors} color="bg-emerald-400" />
                               </div>
                            </td>
                            <td className="py-6 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditProduct(item)} className="p-3 bg-white border border-slate-100 shadow-sm hover:border-blue-200 rounded-xl text-slate-500 hover:text-blue-600 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteProduct(item.id)} className="p-3 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <>
            {/* Sidebar Queue & Controls */}
            <div className="w-full xl:w-96 bg-slate-100/50 border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
               <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Batch Engine</h2>
                    <button onClick={handleReset} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline transition-all">Reset</button>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Auto-Pilot Mode</label>
                     <button 
                       onClick={() => setState(s => ({ ...s, autoProcess: !s.autoProcess }))}
                       className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all group ${state.autoProcess ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white border-white text-slate-400 hover:border-slate-200'}`}
                     >
                       <span className="text-xs font-black uppercase tracking-widest">Auto Ingest</span>
                       {state.autoProcess ? (
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                           <div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></div>
                         </div>
                       ) : <span className="text-[9px] font-black uppercase tracking-widest">Inactive</span>}
                     </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Add More To Queue</label>
                    <ImageUploader onFilesReady={handleFilesReady} mode="sidebar" loading={state.loading} />
                  </div>
               </div>

               <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Ingestion Queue 
                    <span className="bg-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-bold">{state.queue.length + (state.mainImage ? 1 : 0)}</span>
                  </h3>
                  
                  {state.mainImage && (
                    <div className={`p-4 rounded-[2rem] border-2 bg-white flex items-center gap-4 transition-all shadow-sm ${state.loading ? 'border-blue-500 animate-pulse' : 'border-blue-100'}`}>
                       <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                         <img src={state.mainImage} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-grow min-w-0">
                         <p className="text-[10px] font-black text-slate-900 uppercase truncate">Current Asset</p>
                         <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{state.loading ? 'Ingesting...' : 'Reviewing'}</p>
                       </div>
                    </div>
                  )}

                  {state.queue.map((img, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white/40 border border-transparent hover:border-slate-200 flex items-center gap-4 group transition-all">
                       <div className="w-12 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                         <img src={img} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-grow min-w-0">
                         <p className="text-[9px] font-black text-slate-400 uppercase truncate">Pending Ingest</p>
                       </div>
                       <button onClick={() => setState(s => ({ ...s, queue: s.queue.filter((_, idx) => idx !== i) }))} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                  ))}

                  {!state.mainImage && state.queue.length === 0 && (
                    <div className="py-20 text-center opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Queue Empty</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow overflow-y-auto bg-slate-50 relative p-6 md:p-10">
               {!state.mainImage && !state.loading && state.queue.length === 0 ? (
                 <div className="max-w-4xl mx-auto h-full flex items-center">
                    <ImageUploader onFilesReady={handleFilesReady} loading={state.loading} mode="hero" />
                 </div>
               ) : (
                 <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row gap-6 items-end justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex-grow min-w-0 w-full space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-2.5 rounded-2xl">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Sync Interface</h2>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Logic: {activeWebsite.brand} ({state.settings.state})</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-grow min-w-[200px]">
                           <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Region Override</label>
                           <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={state.settings.state}
                            onChange={(e) => setState(s => ({ ...s, settings: { ...s.settings, state: e.target.value }}))}
                           >
                            {REGIONS.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                      </div>
                    </div>

                    {state.loading ? (
                      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                         <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8 shadow-xl shadow-blue-500/10"></div>
                         <h3 className="text-xl font-black text-slate-900 tracking-tighter">Synchronizing Engine...</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Ingesting Architectural DNA</p>
                      </div>
                    ) : state.result ? (
                      <div className="animate-in slide-in-from-bottom-6 duration-700">
                        <AnalysisResult 
                          analysis={state.result} 
                          mainUrl={state.mainImage!} 
                          isGenerating={state.generatingImage}
                          generatedUrl={state.generatedVariantUrl}
                          onGenerateImage={(url) => setState(s => ({ ...s, generatedVariantUrl: url, generatingImage: false }))}
                          colorPalette={state.colorPalette}
                        />
                        <div className="sticky bottom-6 mt-8 bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-800 z-50">
                          <div className="text-white text-center md:text-left">
                             <h3 className="font-black text-2xl leading-tight tracking-tight uppercase">
                               {state.editingProductId ? `Update Product?` : `Save & Process Next?`}
                             </h3>
                             <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">
                              {state.queue.length > 0 ? `${state.queue.length} items remaining in ingestion pipeline` : `Final inventory synchronization for ${activeWebsite.brand}`}
                             </p>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => setState(s => ({ ...s, result: null, mainImage: null }))} className="px-8 py-4 text-white text-[10px] font-black uppercase tracking-widest hover:text-slate-400 transition-all">Discard</button>
                            <button 
                              onClick={handleSaveToInventory} 
                              className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                              {state.editingProductId ? 'Update Inventory' : (state.queue.length > 0 ? 'Save & Next' : 'Confirm & Save')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : state.error ? (
                      <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 text-center space-y-4">
                         <span className="text-5xl">⚠️</span>
                         <h3 className="text-xl font-black text-red-900 tracking-tighter">Engine Failure</h3>
                         <p className="text-sm text-red-600 font-bold uppercase tracking-widest">{state.error}</p>
                         <button onClick={() => state.mainImage && runAnalysis(state.mainImage)} className="bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Retry Analysis</button>
                      </div>
                    ) : state.mainImage ? (
                       <div className="flex flex-col items-center justify-center py-40">
                         <div className="w-40 h-40 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 overflow-hidden">
                           <img src={state.mainImage} className="w-full h-full object-cover opacity-50" />
                         </div>
                         <button 
                           onClick={() => state.mainImage && runAnalysis(state.mainImage)}
                           className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all"
                         >
                           Trigger Ingestion
                         </button>
                       </div>
                    ) : null}
                 </div>
               )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const ColorDot: React.FC<{ color: string; label: string; map: Record<string, string> }> = ({ color, label, map }) => (
  <div 
    className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex-shrink-0 transition-transform hover:scale-125 z-10" 
    style={{ backgroundColor: map[color] || '#ccc' }}
    title={`${label}: ${color}`}
  />
);

const MiniConf: React.FC<{ label: string; val: number; color: string }> = ({ label, val, color }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
       <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${(val || 0) * 100}%` }} />
    </div>
    <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">{Math.round((val || 0) * 100)}%</span>
  </div>
);

export default App;
