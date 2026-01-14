
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onFilesReady: (files: string[]) => void;
  main?: string | null;
  loading?: boolean;
  mode?: 'hero' | 'sidebar';
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onFilesReady, main, loading, mode = 'hero'
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('image/'));
    
    const base64Promises = validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(base64Promises);
    if (results.length > 0) {
      onFilesReady(results);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  if (mode === 'sidebar') {
    return (
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileRef.current?.click()}
        className={`w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all gap-2
          ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-400'}`}
      >
        <input type="file" ref={fileRef} className="hidden" accept="image/*" multiple onChange={(e) => processFiles(e.target.files)} />
        <input type="file" ref={folderRef} className="hidden" webkitdirectory="" directory="" onChange={(e) => processFiles(e.target.files)} />
        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
        </div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Add More Assets<br/><span className="text-[7px] text-slate-300">Drop files or folders</span></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileRef.current?.click()}
        className={`w-full min-h-[400px] rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
          ${isDragging ? 'border-blue-600 bg-blue-50 scale-[0.99]' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400'}`}
      >
        <input 
          type="file" 
          ref={fileRef} 
          className="hidden" 
          accept="image/*" 
          multiple 
          onChange={(e) => processFiles(e.target.files)} 
        />
        <input 
          type="file" 
          ref={folderRef} 
          className="hidden" 
          webkitdirectory="" 
          directory="" 
          onChange={(e) => processFiles(e.target.files)} 
        />

        <div className="text-center p-12 pointer-events-none">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <span className="text-5xl">🏢</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Automated Batch Ingestion</h3>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            Drag a folder or multiple images to trigger the high-precision AI sync engine.
          </p>
          <div className="mt-10 flex gap-4 justify-center pointer-events-auto">
             <button 
               onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
               className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-black transition-all"
             >
               Select Files
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); folderRef.current?.click(); }}
               className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-blue-400 transition-all"
             >
               Select Folder
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
