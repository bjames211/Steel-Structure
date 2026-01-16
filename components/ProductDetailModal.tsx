
import React, { useState } from 'react';
import { CreatedProduct, ColorPaletteItem } from '../types';

interface ProductDetailModalProps {
  product: CreatedProduct;
  colorPalette: ColorPaletteItem[];
  onClose: () => void;
  onEdit: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, colorPalette, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'copy' | 'template'>('copy');

  const colorMap = colorPalette.reduce((acc, curr) => ({
    ...acc,
    [curr.name]: curr.hex
  }), {} as Record<string, string>);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-7xl max-h-full bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-6">
          <div className="flex gap-6 items-center flex-grow min-w-0">
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 bg-slate-200">
               <img src={product.imageUrl} className="w-full h-full object-cover" alt="Building Asset" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.1em]">{product.brand}</span>
                <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.1em]">SKU: {product.sku}</span>
                <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-[0.1em]">REGION: {product.state}</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight truncate">{product.productTitleShort}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] truncate">{product.productTitleLong}</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
             <button onClick={onEdit} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">Edit Record</button>
             <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-10 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Specs Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   Detected Architecture
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    <SpecTile label="Width" val={product.dimensions.width} unit="FT" icon="↔️" />
                    <SpecTile label="Length" val={product.dimensions.length} unit="FT" icon="↕️" />
                    <SpecTile label="Height" val={product.dimensions.height} unit="FT" icon="📏" />
                    <SpecTile label="Pitch" val={product.dimensions.pitch} unit="" icon="📐" />
                 </div>
                 
                 <div className="space-y-3 pt-6 border-t border-slate-200/50">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Accessory Audit</p>
                    <FeatureRow icon="🚗" label="Garage Doors" count={product.features.garageDoors} />
                    <FeatureRow icon="🚪" label="Walk-in Doors" count={product.features.manDoors} />
                    <FeatureRow icon="🪟" label="Window Units" count={product.features.windows} />
                 </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Finish Palette
                 </h3>
                 <div className="space-y-4">
                    <ColorTile label="Roof" name={product.colors.roof} hex={colorMap[product.colors.roof] || '#eee'} />
                    <ColorTile label="Wall" name={product.colors.wall} hex={colorMap[product.colors.wall] || '#eee'} />
                    <ColorTile label="Trim" name={product.colors.trim} hex={colorMap[product.colors.trim] || '#eee'} />
                    <ColorTile label="Wainscot" name={product.colors.wainscot} hex={colorMap[product.colors.wainscot] || '#eee'} />
                 </div>
               </div>
            </div>

            {/* Description Area */}
            <div className="lg:col-span-8 space-y-6">
               <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-4">
                  <button 
                    onClick={() => setActiveTab('copy')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'copy' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Marketing Copy (Final)
                  </button>
                  <button 
                    onClick={() => setActiveTab('template')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'template' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Dynamic Variant Template
                  </button>
               </div>

               <div className="relative">
                  {activeTab === 'copy' ? (
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 min-h-[600px] animate-in slide-in-from-right-4 duration-300">
                       <div className="max-w-none text-slate-700 space-y-6 whitespace-pre-wrap">
                          {product.description}
                       </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 min-h-[600px] animate-in slide-in-from-left-4 duration-300">
                       <div className="flex justify-between items-center mb-6">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Variant-Ready Markdown</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(product.fullAnalysis.descriptions.templateMarkdown);
                              alert("Template copied to clipboard!");
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                          >
                            Copy Template
                          </button>
                       </div>
                       <div className="font-mono text-[11px] text-blue-100/60 leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                          {product.fullAnalysis.descriptions.templateMarkdown}
                       </div>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">CRO Hook & SEO Strategy</p>
                    <p className="text-xs font-bold text-slate-700 italic">"Size, Roof Pitch, and Colors are fully customizable. Contact us at {product.fullAnalysis.metadata.detectedState || 'Support'} for an engineering quote."</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Target:</span>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Direct Conversion + SEO Authority</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Technical Meta-Data</p>
                    <div className="space-y-1">
                       <p className="text-[10px] text-blue-200/50 font-mono">ID: {product.id}</p>
                       <p className="text-[10px] text-blue-200/50 font-mono">CREATED: {new Date(product.timestamp).toLocaleDateString()}</p>
                       <p className="text-[10px] text-blue-200/50 font-mono">ENGINE: GEMINI-3-PRO-ARCHITECT</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpecTile: React.FC<{ label: string; val: string | number; unit: string; icon: string }> = ({ label, val, unit, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-all">
    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{icon}</span>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900 leading-none">{val}<span className="text-[9px] text-blue-500 ml-0.5 font-bold uppercase">{unit}</span></p>
  </div>
);

const FeatureRow: React.FC<{ icon: string; label: string; count: number }> = ({ icon, label, count }) => (
  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    </div>
    <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-xl text-xs font-black">{count}</span>
  </div>
);

const ColorTile: React.FC<{ label: string; name: string; hex: string }> = ({ label, name, hex }) => (
  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all cursor-default">
    <div className="w-12 h-12 rounded-xl border-2 border-white shadow-xl flex-shrink-0" style={{ backgroundColor: hex }} />
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label} Application</p>
      <p className="text-[11px] font-black text-slate-800 uppercase truncate">{name}</p>
    </div>
  </div>
);

export default ProductDetailModal;
