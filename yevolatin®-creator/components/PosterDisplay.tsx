import React, { useState } from 'react';

interface PosterDisplayProps {
  imageDataUrl: string;
  fileName: string;
  onSave: (imageDataUrl: string) => void;
  isSaved: boolean;
  onEditText: () => void;
}

const PosterDisplay: React.FC<PosterDisplayProps> = ({ imageDataUrl, fileName, onSave, isSaved, onEditText }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = async () => {
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

  const handleShare = async () => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      // Check if the browser supports sharing files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Intelligence Generated Poster',
          text: 'Check out this poster I made with the YEVOLATIN Intelligence Poster Maker!',
        });
      } else {
        // Fallback for browsers that don't support Web Share API for files
        try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            alert('Image copied to clipboard! You can now paste it to share.');
        } catch (copyError) {
            console.error('Failed to copy image to clipboard:', copyError);
            alert('Sharing is not supported on this browser. Please download the poster to share it.');
        }
      }
    } catch (error) {
      // This can happen if the user cancels the share dialog, so we don't need to show an error.
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Share action was cancelled by the user.');
      } else {
        console.error('Sharing failed:', error);
        alert('Could not share the poster. Please try downloading it instead.');
      }
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 shadow-lg shadow-black/30 border border-white/20">
          <img 
            src={imageDataUrl} 
            alt={fileName} 
            className="w-full h-auto rounded-md cursor-zoom-in transition-transform duration-300 hover:scale-105"
            onClick={toggleZoom}
            aria-label={`View larger image of ${fileName}`}
          />
        </div>
        <div className="flex items-stretch gap-3">
          <button
            onClick={handleDownload}
            className="flex-grow flex items-center justify-center px-6 py-3 text-lg font-bold rounded-lg bg-white text-green-900 shadow-md border border-black/20 transform hover:scale-105 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
           <button
            onClick={onEditText}
            title="Edit the text on this poster"
            className="flex-shrink-0 px-4 py-3 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20 hover:border-white transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
          </button>
           <button
            onClick={handleShare}
            title="Share this poster"
            className="flex-shrink-0 px-4 py-3 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20 hover:border-white transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          <button
            onClick={() => onSave(imageDataUrl)}
            disabled={isSaved}
            title={isSaved ? "This poster is already saved in your gallery" : "Save poster to gallery"}
            className="flex-shrink-0 px-4 py-3 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 border border-white/20 hover:border-white transition-colors disabled:bg-transparent disabled:text-green-400/50 disabled:border-green-800/50 disabled:cursor-not-allowed"
          >
            {isSaved ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                 </svg>
            ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                 </svg>
            )}
          </button>
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={toggleZoom}
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
            onClick={toggleZoom}
            className="absolute top-4 right-6 text-white text-5xl font-bold hover:text-gray-300 transition-colors z-50"
            aria-label="Close zoomed view"
          >
            &times;
          </button>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageDataUrl}
              alt={`Zoomed view of ${fileName}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PosterDisplay;
