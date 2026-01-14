
import React, { useState } from 'react';
import { WebsiteConfig, DimensionRule, ColorPaletteItem } from '../types';

const STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

interface WebsiteSettingsProps {
  websites: WebsiteConfig[];
  onUpdate: (sites: WebsiteConfig[]) => void;
  colorPalette: ColorPaletteItem[];
  onUpdatePalette: (palette: ColorPaletteItem[]) => void;
  onClose: () => void;
}

const WebsiteSettings: React.FC<WebsiteSettingsProps> = ({ 
  websites, onUpdate, colorPalette, onUpdatePalette, onClose 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(websites[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'profiles' | 'palette'>('profiles');

  const activeSite = websites.find(w => w.id === selectedId);

  const updateActiveSite = (updates: Partial<WebsiteConfig>) => {
    if (!selectedId || !activeSite) return;
    const newSites = websites.map(w => w.id === selectedId ? { ...w, ...updates } : w);
    onUpdate(newSites);
  };

  const addNewWebsite = () => {
    const newSite: WebsiteConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Website",
      brand: "New Brand",
      phone: "888-555-0199",
      configuratorUrl: "https://configurator.brand.com",
      description: "",
      rules: {
        width: { enabled: true, offset: 0 },
        length: { enabled: true, offset: 0 },
        height: { enabled: true, offset: 0 },
        allowRedIron: true,
        allowGalvanized: true,
        states: [...STATES]
      }
    };
    onUpdate([...websites, newSite]);
    setSelectedId(newSite.id);
  };

  const toggleState = (state: string) => {
    if (!activeSite) return;
    const current = activeSite.rules.states;
    const next = current.includes(state) ? current.filter(s => s !== state) : [...current, state];
    updateActiveSite({ rules: { ...activeSite.rules, states: next } });
  };

  const isAllSelected = activeSite?.rules.states.length === STATES.length;

  const toggleAllStates = () => {
    if (!activeSite) return;
    if (isAllSelected) {
      updateActiveSite({ rules: { ...activeSite.rules, states: [] } });
    } else {
      updateActiveSite({ rules: { ...activeSite.rules, states: [...STATES] } });
    }
  };

  const updatePaletteItem = (index: number, updates: Partial<ColorPaletteItem>) => {
    const newPalette = [...colorPalette];
    newPalette[index] = { ...newPalette[index], ...updates };
    onUpdatePalette(newPalette);
  };

  const removePaletteItem = (index: number) => {
    onUpdatePalette(colorPalette.filter((_, i) => i !== index));
  };

  const addPaletteItem = () => {
    onUpdatePalette([...colorPalette, { name: 'New Color', hex: '#cccccc' }]);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[85vh] overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <div className="flex gap-10 items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sync Engine</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure logic & brand aesthetics</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('profiles')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profiles' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Profiles</button>
             <button onClick={() => setActiveTab('palette')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'palette' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Palette</button>
          </div>
        </div>
        <button onClick={onClose} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {activeTab === 'profiles' ? (
          <>
            <div className="w-72 border-r border-slate-50 p-6 overflow-y-auto space-y-3 bg-slate-50/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Website Profiles</p>
              {websites.map(site => (
                <button
                  key={site.id}
                  onClick={() => setSelectedId(site.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all border ${selectedId === site.id ? 'bg-white shadow-xl border-blue-100 scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-100 opacity-60'}`}
                >
                  <p className={`font-black text-sm ${selectedId === site.id ? 'text-blue-600' : 'text-slate-700'}`}>{site.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest">{site.brand}</span>
                     <span className="text-[8px] font-black bg-blue-50 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest">{site.rules.states.length} States</span>
                  </div>
                </button>
              ))}
              <button 
                onClick={addNewWebsite}
                className="w-full mt-6 p-5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all bg-white/30"
              >
                + Create Profile
              </button>
            </div>

            {activeSite ? (
              <div className="flex-grow p-10 overflow-y-auto space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="w-6 h-[1px] bg-slate-200"></span>
                      General Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Profile Name</label>
                        <input 
                          type="text" value={activeSite.name} placeholder="e.g. Primary Customer Portal"
                          onChange={e => updateActiveSite({ name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Brand Name</label>
                          <input 
                            type="text" value={activeSite.brand} placeholder="e.g. STEEL_USA"
                            onChange={e => updateActiveSite({ brand: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Contact Phone</label>
                          <input 
                            type="text" value={activeSite.phone} placeholder="e.g. 888-555-0199"
                            onChange={e => updateActiveSite({ phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Configurator URL</label>
                        <input 
                          type="text" value={activeSite.configuratorUrl || ''} placeholder="https://configurator.brand.com"
                          onChange={e => updateActiveSite({ configuratorUrl: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Profile Bio</label>
                        <textarea 
                          value={activeSite.description} placeholder="Backend description for synchronization engine..."
                          onChange={e => updateActiveSite({ description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none h-32 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                       <span className="w-6 h-[1px] bg-slate-200"></span>
                       Dimension Adjustments
                     </h3>
                     <div className="space-y-4">
                        <RuleToggle label="Width Adjustment" rule={activeSite.rules.width} onChange={r => updateActiveSite({ rules: { ...activeSite.rules, width: r }})} />
                        <RuleToggle label="Length Adjustment" rule={activeSite.rules.length} onChange={r => updateActiveSite({ rules: { ...activeSite.rules, length: r }})} />
                        <RuleToggle label="Height Adjustment" rule={activeSite.rules.height} onChange={r => updateActiveSite({ rules: { ...activeSite.rules, height: r }})} />
                     </div>
                     
                     <div className="pt-8 border-t border-slate-100">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Material Eligibility</h3>
                       <div className="flex gap-4">
                          <MaterialToggle 
                            label="Red Iron Frame" active={activeSite.rules.allowRedIron} 
                            onClick={() => updateActiveSite({ rules: { ...activeSite.rules, allowRedIron: !activeSite.rules.allowRedIron }})} 
                          />
                          <MaterialToggle 
                            label="Galvanized Frame" active={activeSite.rules.allowGalvanized} 
                            onClick={() => updateActiveSite({ rules: { ...activeSite.rules, allowGalvanized: !activeSite.rules.allowGalvanized }})} 
                          />
                       </div>
                     </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-6 h-[1px] bg-slate-200"></span>
                        Sales Region Availability
                      </h3>
                      <button 
                        onClick={toggleAllStates} 
                        className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl border transition-all ${isAllSelected ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                      >
                        {isAllSelected ? 'Unselect All Regions' : 'Select All Regions'}
                      </button>
                   </div>
                   <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {STATES.map(s => (
                        <button 
                          key={s} onClick={() => toggleState(s)}
                          className={`py-3 rounded-xl text-[10px] font-black transition-all border ${activeSite.rules.states.includes(s) ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-300">
                <span className="text-5xl mb-4 opacity-20">⚙️</span>
                <p className="font-black text-[10px] uppercase tracking-[0.4em] italic">Select a profile to configure engine logic</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-grow p-10 overflow-y-auto">
             <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                   <div>
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Architectural Finishes</h3>
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight">Approved Color Palette</h4>
                   </div>
                   <button 
                     onClick={addPaletteItem}
                     className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                   >
                     + Add Finish
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {colorPalette.map((item, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                        <div className="relative group/color">
                           <div className="w-14 h-14 rounded-2xl shadow-inner border border-slate-100" style={{ backgroundColor: item.hex }} />
                           <input 
                             type="color" value={item.hex} 
                             onChange={(e) => updatePaletteItem(idx, { hex: e.target.value })}
                             className="absolute inset-0 opacity-0 cursor-pointer"
                           />
                        </div>
                        <div className="flex-grow min-w-0">
                           <input 
                             type="text" value={item.name} 
                             onChange={(e) => updatePaletteItem(idx, { name: e.target.value })}
                             className="w-full text-xs font-black text-slate-800 uppercase outline-none bg-transparent"
                           />
                           <p className="text-[9px] font-mono text-slate-400 mt-0.5">{item.hex.toUpperCase()}</p>
                        </div>
                        <button 
                          onClick={() => removePaletteItem(idx)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RuleToggle: React.FC<{ label: string, rule: DimensionRule, onChange: (r: DimensionRule) => void }> = ({ label, rule, onChange }) => (
  <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center gap-4">
       <input 
         type="checkbox" checked={rule.enabled} onChange={e => onChange({ ...rule, enabled: e.target.checked })}
         className="w-5 h-5 rounded-lg text-blue-600 border-slate-200 focus:ring-blue-500/20 transition-all cursor-pointer"
       />
       <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OFFSET:</span>
       <input 
         type="number" value={rule.offset} onChange={e => onChange({ ...rule, offset: parseInt(e.target.value) || 0 })}
         className="w-14 bg-transparent text-xs font-black text-blue-600 outline-none text-right"
       />
       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FT</span>
    </div>
  </div>
);

const MaterialToggle: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-2xl text-[10px] font-black border transition-all tracking-widest uppercase ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
  >
    {label}
  </button>
);

export default WebsiteSettings;
