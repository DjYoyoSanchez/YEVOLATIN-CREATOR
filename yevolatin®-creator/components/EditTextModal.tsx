import React, { useState } from 'react';
import Spinner from './Spinner';

interface EditTextModalProps {
  posterUrl: string;
  initialText: string;
  onClose: () => void;
  onConfirm: (newText: string) => void;
  isEditing: boolean;
  error: string | null;
}

const EditTextModal: React.FC<EditTextModalProps> = ({ posterUrl, initialText, onClose, onConfirm, isEditing, error }) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = () => {
    if (text.trim() && !isEditing) {
      onConfirm(text);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-poster-title"
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
      <div 
        className="bg-green-900/50 border-2 border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row gap-6 p-6 shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/3 flex-shrink-0 flex flex-col">
          <div className="bg-black/20 p-2 rounded-lg border border-white/20">
            <img src={posterUrl} alt="Poster to edit" className="w-full h-auto rounded-md shadow-md" />
          </div>
        </div>
        <div className="md:w-2/3 flex flex-col">
          <h3 id="edit-poster-title" className="text-2xl font-bold text-white">Update Poster Text</h3>
          <p className="text-gray-300 mb-4 mt-1">The AI will intelligently update the text while preserving the original poster design.</p>
          <textarea
            id="edit-text-area"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200 flex-grow"
            placeholder="Enter the new text for the poster..."
            disabled={isEditing}
          />
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm" role="alert">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleSubmit}
              disabled={isEditing || !text.trim()}
              className="w-full flex-1 px-6 py-3 text-lg font-bold rounded-lg bg-white text-green-900 shadow-lg border border-black/20 transform hover:scale-105 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isEditing ? (
                <div className="flex items-center justify-center">
                  <Spinner />
                  <span className="ml-3">Applying Changes...</span>
                </div>
              ) : (
                '✔ Apply Text Changes'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isEditing}
              className="w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg bg-transparent border-2 border-gray-300 text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTextModal;
