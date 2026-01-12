
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  onImagesReady: (images: string[]) => void;
  loading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesReady, loading }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Cast to File[] to avoid 'unknown' type issues with Array.from in some TS configurations
    const files = Array.from(event.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      // 'file' is now correctly typed as 'File' (which inherits from 'Blob')
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = () => {
    if (selectedImages.length > 0) {
      onImagesReady(selectedImages);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
          ${loading ? 'opacity-50 cursor-not-allowed border-slate-300' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          multiple
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="bg-slate-100 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Add Building Angles</h3>
            <p className="text-sm text-slate-500 mt-1">Upload 1-5 photos from different viewpoints for better accuracy</p>
          </div>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Staged Angles ({selectedImages.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button 
            disabled={loading}
            onClick={handleStartAnalysis}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md disabled:bg-slate-400 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Analyze Building with Multi-Angle Vision'}
            {!loading && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
