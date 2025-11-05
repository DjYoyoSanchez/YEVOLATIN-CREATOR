import React, { useState } from 'react';

export interface SavedPoster {
  id: number;
  imageDataUrl: string;
}

interface GalleryModalProps {
  posters: SavedPoster[];
  onClose: () => void;
  onDelete: (id: number) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({ posters, onClose, onDelete }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleDownload = async (imageDataUrl: string, id: number) => {
    const fileName = `saved-poster-${id}.png`;
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. You can try right-clicking the image and selecting "Save Image As...".');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this poster forever?')) {
      onDelete(id);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-white text-5xl font-bold hover:text-gray-300 transition-colors z-50"
          aria-label="Close gallery"
        >
          &times;
        </button>
        <div 
          className="bg-green-900/50 border-2 border-white/20 rounded-2xl w-full max-w-6xl h-full max-h-[90vh] p-6 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Saved Posters Gallery</h2>
          {posters.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-400 text-lg">You have no saved posters yet.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posters.map((poster) => (
                <div key={poster.id} className="group relative bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                  <img
                    src={poster.imageDataUrl}
                    alt={`Saved poster ${poster.id}`}
                    className="w-full h-auto object-cover aspect-square cursor-pointer"
                    onClick={() => setZoomedImage(poster.imageDataUrl)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-2">
                    <button onClick={() => handleDownload(poster.imageDataUrl, poster.id)} className="p-2 bg-white text-green-900 rounded-full hover:scale-110 transition-transform" title="Download Poster">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => handleDelete(poster.id)} className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition-transform" title="Delete Poster">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
          aria-modal="true"
          role="dialog"
        >
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-6 text-white text-5xl font-bold hover:text-gray-300 transition-colors z-50"
            aria-label="Close zoomed view"
          >
            &times;
          </button>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImage}
              alt="Zoomed view of saved poster"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryModal;
