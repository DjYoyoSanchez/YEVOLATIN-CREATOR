
import React, { useState, useCallback, useEffect, useRef } from 'react';
// FIX: Aliased imports to prevent name collision with local component methods.
import { generateContent as apiGenerateContent, editTextOnPoster as apiEditTextOnPoster } from './services/geminiService';
import FileInput from './components/FileInput';
import PosterDisplay from './components/PosterDisplay';
import Spinner from './components/Spinner';
import SliderInput from './components/SliderInput';
import GalleryModal, { SavedPoster } from './components/GalleryModal';
import EditTextModal from './components/EditTextModal';
import SocialLinkInput from './components/SocialLinkInput';

type PresetName = 'Energetic' | 'Elegant' | 'Modern' | 'Vivid Pop' | 'Cinematic' | 'Minimalist';
type BackgroundStyle = 'Gold and Black' | 'Christmas' | 'Neon Glow' | 'Abstract Watercolor' | 'Vintage Film' | 'Cosmic Nebula' | 'Urban Graffiti';

export interface PersonDescription {
  name: string;
  gender: 'Man' | 'Woman' | 'Any';
  skinTone: 'Light' | 'Tan' | 'Dark' | 'Any';
  hair: string;
  clothing: string;
  pose: string;
}

interface Preset {
  name: PresetName;
  settings: {
    sharpening: number;
    brightness: number;
    contrast: number;
    facialFidelity: number;
    preserveSkinTone: boolean;
    expression: string;
  };
}

interface EditingState {
  size: string;
  index: number;
  imageDataUrl: string;
  batchIndex: number;
}

const presets: Preset[] = [
  {
    name: 'Energetic',
    settings: {
      sharpening: 35,
      brightness: 5,
      contrast: 15,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'power',
    },
  },
  {
    name: 'Elegant',
    settings: {
      sharpening: 15,
      brightness: 10,
      contrast: -5,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'smile',
    },
  },
  {
    name: 'Modern',
    settings: {
      sharpening: 25,
      brightness: 0,
      contrast: 5,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'neutral',
    },
  },
  {
    name: 'Vivid Pop',
    settings: {
      sharpening: 40,
      brightness: 10,
      contrast: 25,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'smile',
    },
  },
  {
    name: 'Cinematic',
    settings: {
      sharpening: 30,
      brightness: -5,
      contrast: 20,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'focus',
    },
  },
  {
    name: 'Minimalist',
    settings: {
      sharpening: 10,
      brightness: 5,
      contrast: -10,
      facialFidelity: 100,
      preserveSkinTone: true,
      expression: 'neutral',
    },
  },
];

const backgroundStyles: { name: BackgroundStyle }[] = [
    { name: 'Gold and Black' },
    { name: 'Christmas' },
    { name: 'Neon Glow' },
    { name: 'Abstract Watercolor' },
    { name: 'Vintage Film' },
    { name: 'Cosmic Nebula' },
    { name: 'Urban Graffiti' },
];

const LOCAL_STORAGE_KEY = 'yevolatin-ai-poster-maker-saved-posters';
const encouragingMessages = [
    'Warming up the Intelligence...',
    'Designing your visuals...',
    'Finding the best layouts...',
    'Rendering the poster...',
    'Adding the final touches...',
    'Almost there...',
];

const DEFAULT_INFO_TEXT = `- YevoLatin® Curve, Dance Fitness Class
- YevoLatin® Bachata, Dance Class
- YevoLatin® Salsa, Dance Class
- YevoLatin® Reggaeton, Dance Class
- YevoLatin® Afro Fusion, Dance Class

- Date : 
- Time : 
- Price:
- Venue : 
- Address : 
- Tel : 
- Email:
- www.yevolatin.com`;

const YEVOLATIN_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABoAAAAIQCAYAAABa2+HjAAAgAElEQVR4nOy9aXAk13no/002b2/vfU960pOmC6bpwTBDDEO2wca2bcu2xIm/8x/x/h+fkzhx4sSJEzt2Yhu2bZttDwwzDNEwnd70pHve292d+X2qqrquJptk2kCA5P35fVWVN9kmu+SqK7/yKx8QERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER-l...A...A...l...A..';

// FIX: Corrected React.FC type and implemented the full component.
const App: React.FC = () => {
    // State management
    const [mainImage, setMainImage] = useState<File[]>([]);
    const [logo1Files, setLogo1Files] = useState<File[]>([]);
    const [logo2Files, setLogo2Files] = useState<File[]>([]);
    const [personName, setPersonName] = useState('YEVGENY YEVELENKO');
    const [infoText, setInfoText] = useState(DEFAULT_INFO_TEXT);
    const [socialLink, setSocialLink] = useState('');

    const [activePreset, setActivePreset] = useState<PresetName>('Energetic');
    const [sharpening, setSharpening] = useState(presets[0].settings.sharpening);
    const [brightness, setBrightness] = useState(presets[0].settings.brightness);
    const [contrast, setContrast] = useState(presets[0].settings.contrast);
    const [facialFidelity, setFacialFidelity] = useState(presets[0].settings.facialFidelity);
    const [preserveSkinTone, setPreserveSkinTone] = useState(presets[0].settings.preserveSkinTone);
    const [expression, setExpression] = useState(presets[0].settings.expression);
    const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('Gold and Black');
    
    const [generatedPosters, setGeneratedPosters] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [savedPosters, setSavedPosters] = useState<SavedPoster[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    const [editingState, setEditingState] = useState<EditingState | null>(null);
    const [isEditingText, setIsEditingText] = useState(false);
    const [editTextError, setEditTextError] = useState<string | null>(null);
    const [batchId, setBatchId] = useState<number>(0);

    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> to fix type error in browser environment.
    const encouragingMessageInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                setSavedPosters(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load saved posters from local storage:", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedPosters));
        } catch (e) {
            console.error("Failed to save posters to local storage:", e);
        }
    }, [savedPosters]);

    const applyPreset = useCallback((presetName: PresetName) => {
        const preset = presets.find(p => p.name === presetName);
        if (preset) {
            setActivePreset(presetName);
            setSharpening(preset.settings.sharpening);
            setBrightness(preset.settings.brightness);
            setContrast(preset.settings.contrast);
            setFacialFidelity(preset.settings.facialFidelity);
            setPreserveSkinTone(preset.settings.preserveSkinTone);
            setExpression(preset.settings.expression);
        }
    }, []);

    const setProgressText = (text: string) => {
        setLoadingMessage(text);
    };

    const handleGenerateClick = async () => {
        if (mainImage.length === 0) {
            setError('Please upload a main image of the presenter.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedPosters({});

        encouragingMessageInterval.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * encouragingMessages.length);
            setProgressText(encouragingMessages[randomIndex]);
        }, 3000);

        try {
            const options = {
                sharpening,
                brightness,
                contrast,
                facialFidelity,
                preserveSkinTone,
                expression,
            };
            const result = await apiGenerateContent(
                mainImage[0],
                personName,
                infoText,
                logo1Files,
                logo2Files,
                options,
                backgroundStyle,
                socialLink,
                setProgressText
            );
            setGeneratedPosters(result.posters);
            setBatchId(Date.now()); // Set a new batch ID for this generation
        } catch (err: any) {
            let errorMessage = err.message || 'An unknown error occurred during poster generation.';
            // Provide a more helpful message for common API key issues.
            if (typeof errorMessage === 'string' && (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404'))) {
                errorMessage = 'Generation failed with a "Not Found" error. This is often due to an invalid or improperly configured API key. Please verify that your API key is correct, active, and has billing enabled for its project.';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            if (encouragingMessageInterval.current) {
                clearInterval(encouragingMessageInterval.current);
            }
            setLoadingMessage('');
        }
    };

    const handleSavePoster = (imageDataUrl: string) => {
        if (!savedPosters.some(p => p.imageDataUrl === imageDataUrl)) {
            setSavedPosters(prev => [...prev, { id: Date.now(), imageDataUrl }]);
        }
    };

    const handleDeletePoster = (id: number) => {
        setSavedPosters(prev => prev.filter(p => p.id !== id));
    };
    
    const handleOpenEditTextModal = (imageDataUrl: string, size: string, index: number) => {
        setEditingState({ imageDataUrl, size, index, batchIndex: batchId });
    };

    const handleConfirmEditText = async (newText: string) => {
        if (!editingState) return;
        
        setIsEditingText(true);
        setEditTextError(null);
        
        try {
          const { poster } = await apiEditTextOnPoster(editingState.imageDataUrl, newText);
          
          setGeneratedPosters(prev => {
            const newPosters = { ...prev };
            const posterArray = [...(newPosters[editingState.size] || [])];
            posterArray[editingState.index] = poster;
            newPosters[editingState.size] = posterArray;
            return newPosters;
          });
          
          setInfoText(newText); // Update the main text area as well
          setEditingState(null);
          
        } catch (err: any) {
          let errorMessage = err.message || 'Failed to update text.';
          if (typeof errorMessage === 'string' && (errorMessage.includes('NOT_FOUND') || errorMessage.includes('404'))) {
            errorMessage = 'Edit failed with a "Not Found" error. Please check that your API key is correctly configured and active.';
          }
          setEditTextError(errorMessage);
        } finally {
          setIsEditingText(false);
        }
    };

    const isGenerated = Object.keys(generatedPosters).some(key => generatedPosters[key].length > 0);
    
    return (
        <div className="bg-green-950 text-white min-h-screen font-sans bg-gradient-to-br from-green-950 via-gray-900 to-black">
            <header className="container mx-auto p-4 md:px-8 py-6 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                    <img src={YEVOLATIN_LOGO_BASE64} alt="YevoLatin Logo" className="h-10 w-auto" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                        AI Poster Maker
                    </h1>
                </div>
                <button 
                    onClick={() => setIsGalleryOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
                    title="Open Saved Posters Gallery"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    Gallery
                </button>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel: Controls */}
                    <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-8 h-fit">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b-2 border-red-500 pb-2">1. Upload Assets</h2>
                            <FileInput
                                id="main-image"
                                label="Presenter Image"
                                files={mainImage}
                                onFilesChange={setMainImage}
                                description="Upload a high-quality photo of the presenter."
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FileInput id="logo1" label="Logo 1 (Optional)" files={logo1Files} onFilesChange={setLogo1Files} />
                                <FileInput id="logo2" label="Logo 2 (Optional)" files={logo2Files} onFilesChange={setLogo2Files} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b-2 border-red-500 pb-2">2. Add Details</h2>
                            <div>
                                <label htmlFor="person-name" className="block mb-2 text-lg font-semibold text-gray-200">Presenter Name</label>
                                <input id="person-name" type="text" value={personName} onChange={e => setPersonName(e.target.value)} className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200" />
                            </div>
                             <div>
                                <label htmlFor="info-text" className="block mb-2 text-lg font-semibold text-gray-200">Poster Information Text</label>
                                <textarea id="info-text" value={infoText} onChange={e => setInfoText(e.target.value)} rows={8} className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200" />
                            </div>
                             <SocialLinkInput socialLink={socialLink} setSocialLink={setSocialLink} />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white border-b-2 border-red-500 pb-2">3. Choose Style</h2>
                             <div>
                                <label className="block mb-3 text-lg font-semibold text-gray-200">Background Theme</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {backgroundStyles.map(style => (
                                        <button key={style.name} onClick={() => setBackgroundStyle(style.name)} className={`w-full p-3 text-sm rounded-lg transition-all border-2 ${backgroundStyle === style.name ? 'bg-white text-green-900 font-bold border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-3 text-lg font-semibold text-gray-200">Artistic Preset</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {presets.map(preset => (
                                        <button key={preset.name} onClick={() => applyPreset(preset.name)} className={`w-full p-3 text-sm rounded-lg transition-all border-2 ${activePreset === preset.name ? 'bg-white text-green-900 font-bold border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <details className="bg-black/20 p-4 rounded-lg border border-white/10">
                                <summary className="font-semibold text-lg cursor-pointer hover:text-red-400 transition-colors">Advanced Settings</summary>
                                <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                                    <SliderInput label="Sharpening" value={sharpening} onChange={setSharpening} />
                                    <SliderInput label="Brightness" value={brightness} onChange={setBrightness} min={-50} max={50} />
                                    <SliderInput label="Contrast" value={contrast} onChange={setContrast} min={-50} max={50} />
                                    <SliderInput label="Facial Fidelity" value={facialFidelity} onChange={setFacialFidelity} />
                                </div>
                             </details>
                        </div>
                        
                        <div className="pt-4">
                            <button
                                onClick={handleGenerateClick}
                                disabled={isLoading || mainImage.length === 0}
                                className="w-full px-8 py-4 text-xl font-bold rounded-lg bg-red-600 text-white shadow-lg border border-black/20 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {isLoading ? 'Generating...' : '✨ Generate Posters'}
                            </button>
                            {mainImage.length === 0 && <p className="text-center text-red-400 mt-2 text-sm">Please upload a presenter image to begin.</p>}
                        </div>

                    </div>

                    {/* Right Panel: Output */}
                    <div className="bg-black/20 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[60vh] lg:min-h-full">
                        {isLoading ? (
                            <div className="text-center">
                                <Spinner />
                                <p className="mt-4 text-xl font-semibold text-gray-300">{loadingMessage || 'Generating your posters...'}</p>
                                <p className="text-gray-400 mt-1">This may take a minute or two.</p>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg border border-red-500">
                                <h3 className="text-xl font-bold mb-2">Generation Failed</h3>
                                <p>{error}</p>
                            </div>
                        ) : isGenerated ? (
                             <div className="w-full h-full flex flex-col md:flex-row lg:flex-col gap-6 overflow-y-auto">
                                {generatedPosters['9:16']?.map((url, index) => (
                                    <PosterDisplay 
                                        key={`story-${batchId}-${index}`}
                                        imageDataUrl={url} 
                                        fileName={`poster-story-${index + 1}.png`}
                                        onSave={handleSavePoster}
                                        isSaved={savedPosters.some(p => p.imageDataUrl === url)}
                                        onEditText={() => handleOpenEditTextModal(url, '9:16', index)}
                                    />
                                ))}
                                {generatedPosters['1:1']?.map((url, index) => (
                                    <PosterDisplay 
                                        key={`square-${batchId}-${index}`}
                                        imageDataUrl={url} 
                                        fileName={`poster-square-${index + 1}.png`} 
                                        onSave={handleSavePoster}
                                        isSaved={savedPosters.some(p => p.imageDataUrl === url)}
                                        onEditText={() => handleOpenEditTextModal(url, '1:1', index)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h2 className="mt-4 text-2xl font-semibold">Your Posters Will Appear Here</h2>
                                <p className="mt-2 max-w-sm mx-auto">Fill out the details on the left and click "Generate Posters" to see the magic happen.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isGalleryOpen && (
                <GalleryModal 
                    posters={savedPosters}
                    onClose={() => setIsGalleryOpen(false)}
                    onDelete={handleDeletePoster}
                />
            )}
            
            {editingState && (
                <EditTextModal 
                    posterUrl={editingState.imageDataUrl}
                    initialText={infoText}
                    onClose={() => setEditingState(null)}
                    onConfirm={handleConfirmEditText}
                    isEditing={isEditingText}
                    error={editTextError}
                />
            )}
        </div>
    );
};

export default App;
