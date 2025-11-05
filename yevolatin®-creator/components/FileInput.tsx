
import React, { useRef, useState, useEffect } from 'react';

interface FileInputProps {
  id: string;
  label: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  description?: string;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, files, onFilesChange, multiple = false, description }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create a new array of object URLs from the files prop
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);

    // Cleanup function to revoke the object URLs when the component unmounts or files change
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length === 0) return;

    if (multiple) {
      // Append new files to the existing list
      onFilesChange([...files, ...newFiles]);
    } else {
      // Replace the existing file with the new one
      onFilesChange([newFiles[0]]);
    }
    
    // Reset the input value to allow re-selecting the same file
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const canAddMore = multiple || files.length === 0;

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 text-lg font-semibold text-gray-200">{label}</label>
      {description && (
        <div className="flex items-start text-xs text-gray-400 -mt-1 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{description}</span>
        </div>
      )}
      <div className="flex flex-col gap-4 p-4 min-h-[12rem] bg-black/20 backdrop-blur-sm border-2 border-dashed border-white/20 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
                <div key={url} className="relative group aspect-square">
                    <img src={url} alt={`Preview ${index + 1}`} className="object-cover w-full h-full rounded-lg shadow-sm" />
                    <button 
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label={`Remove image ${index + 1}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            ))}
            
            {canAddMore && (
                <div 
                    onClick={handleClick}
                    className="flex items-center justify-center w-full aspect-square bg-black/20 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-white hover:bg-black/40 transition-all group"
                    role="button"
                    aria-label={multiple ? 'Add more images' : 'Upload an image'}
                >
                     <div className="text-center text-gray-400 group-hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm mt-1">{multiple ? 'Add images' : 'Upload image'}</p>
                    </div>
                </div>
            )}
        </div>
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          multiple={multiple}
        />
      </div>
    </div>
  );
};

export default FileInput;
