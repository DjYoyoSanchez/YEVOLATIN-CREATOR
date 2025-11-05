
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

const YEVOLATIN_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABoAAAAIQCAYAAABa2+HjAAAgAElEQVR4nOy9aXAk13no/002b2/vfU960pOmC6bpwTBDDEO2wca2bcu2xIm/8x/x/h+fkzhx4sSJEzt2Yhu2bZttDwwzDNEwnd70pHve292d+X2qqrquJptk2kCA5P35fVWVN9kmu+SqK7/yKx8QERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERER-l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...A...l...-l...A..';

// FIX: Corrected React.FC type
const App: React.FC = () => {
    // State management
    const [mainImage, setMainImage] = useState<File[]>([]);
    const [logo1Files, setLogo1Files] = useState<File[]>([]);
    const [logo2Files, setLogo2Files] = useState<File[]>([]);
    const [personName, setPersonName] = useState<string>('YOYO SANCHEZ');
    const [infoText, setInfoText] = useState<string>(DEFAULT_INFO_TEXT);
    const [socialLink, setSocialLink] = useState<string>('');
    const [activePreset, setActivePreset] = useState<PresetName>('Energetic');
    const [activeBackground, setActiveBackground] = useState<BackgroundStyle>('Gold and Black');
    const [settings, setSettings] = useState<Preset['settings']>(presets.find(p => p.name === 'Energetic')!.settings);
    const [isLoading, setIsLoading] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [allGeneratedPosters, setAllGeneratedPosters] = useState<Record<string, string[]>[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [savedPosters, setSavedPosters] = useState<SavedPoster[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [editingState, setEditingState] = useState<EditingState | null>(null);
    const [isEditingPosterText, setIsEditingPosterText] = useState(false);
    const [editingError, setEditingError] = useState<string | null>(null);
    const encouragingMessageIntervalRef = useRef<number | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Effects
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                setSavedPosters(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load saved posters from local storage", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedPosters));
        } catch (e) {
            console.error("Failed to save posters to local storage", e);
        }
    }, [savedPosters]);

    useEffect(() => {
        if (isLoading) {
            let messageIndex = 0;
            setProgressText(encouragingMessages[messageIndex]);
            encouragingMessageIntervalRef.current = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % encouragingMessages.length;
                setProgressText(encouragingMessages[messageIndex]);
            }, 3000);
        } else {
            if (encouragingMessageIntervalRef.current) {
                clearInterval(encouragingMessageIntervalRef.current);
                encouragingMessageIntervalRef.current = null;
            }
        }
        return () => {
            if (encouragingMessageIntervalRef.current) {
                clearInterval(encouragingMessageIntervalRef.current);
            }
        };
    }, [isLoading]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allGeneratedPosters.length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved posters. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [allGeneratedPosters]);


    // Handlers
    const handlePresetChange = (name: PresetName) => {
        const preset = presets.find(p => p.name === name);
        if (preset) {
            setActivePreset(name);
            setSettings(preset.settings);
        }
    };

    const handleGenerateClick = useCallback(async () => {
        if (mainImage.length === 0) {
            setError('Please upload a main image of the presenter.');
            return;
        }

        setError(null);
        setIsLoading(true);
        // Do not clear previous results, just append new ones.
        // setAllGeneratedPosters([]); 
        
        try {
            const result = await apiGenerateContent(
                mainImage[0],
                personName,
                infoText,
                logo1Files,
                logo2Files,
                settings,
                activeBackground,
                socialLink,
                setProgressText
            );
            setAllGeneratedPosters(prev => [...prev, result.posters]);
            setShowResults(true);
            setTimeout(() => {
                 resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'An unknown error occurred during poster generation.');
        } finally {
            setIsLoading(false);
        }
    }, [mainImage, personName, infoText, logo1Files, logo2Files, settings, activeBackground, socialLink]);

    const handleSavePoster = (imageDataUrl: string) => {
        if (savedPosters.some(p => p.imageDataUrl === imageDataUrl)) return;
        const newPoster: SavedPoster = {
            id: Date.now(),
            imageDataUrl,
        };
        setSavedPosters(prev => [...prev, newPoster]);
    };

    const handleDeletePoster = (id: number) => {
        setSavedPosters(prev => prev.filter(p => p.id !== id));
    };

    const handleOpenEditTextModal = (imageDataUrl: string, size: string, index: number, batchIndex: number) => {
        setEditingState({ imageDataUrl, size, index, batchIndex });
    };

    const handleConfirmEditText = async (newText: string) => {
        if (!editingState) return;

        setIsEditingPosterText(true);
        setEditingError(null);
        setInfoText(newText); // Update main info text as well

        try {
            const { poster } = await apiEditTextOnPoster(editingState.imageDataUrl, newText);
            setAllGeneratedPosters(prev => {
                const newBatches = [...prev];
                const targetBatch = { ...newBatches[editingState.batchIndex] };
                targetBatch[editingState.size][editingState.index] = poster;
                newBatches[editingState.batchIndex] = targetBatch;
                return newBatches;
            });
            setEditingState(null); // Close modal on success
        } catch (e) {
            console.error(e);
            setEditingError(e instanceof Error ? e.message : 'Failed to edit poster.');
        } finally {
            setIsEditingPosterText(false);
        }
    };
    
    const isPosterSaved = (url: string) => savedPosters.some(p => p.imageDataUrl === url);
    
    const handleReset = () => {
        if (allGeneratedPosters.length > 0 && !window.confirm("This will clear all generated posters from this session. Are you sure?")) {
            return;
        }
        setMainImage([]);
        setLogo1Files([]);
        setLogo2Files([]);
        setPersonName('YOYO SANCHEZ');
        setInfoText(DEFAULT_INFO_TEXT);
        setSocialLink('');
        handlePresetChange('Energetic');
        setActiveBackground('Gold and Black');
        setAllGeneratedPosters([]);
        setShowResults(false);
        setError(null);
        window.scrollTo(0, 0);
    };
    
    const scrollToResults = () => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black text-white font-sans">
            <header className="py-4 px-4 md:px-8 shadow-lg bg-black/30 backdrop-blur-md sticky top-0 z-40 border-b border-white/10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <img src={YEVOLATIN_LOGO_BASE64} alt="YevoLatin Logo" className="h-16"/>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Intelligence Poster Maker</h1>
                    </div>
                    <div className="flex items-center gap-4">
                         {allGeneratedPosters.length > 0 && (
                            <button 
                                onClick={scrollToResults}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/50 border border-red-500 rounded-lg hover:bg-red-600/80 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
                                Done ({allGeneratedPosters.length})
                            </button>
                        )}
                        <button 
                            onClick={() => setIsGalleryOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
                            Gallery ({savedPosters.length})
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    {/* Column 1: Core Inputs */}
                    <div className="space-y-8 p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                       <h2 className="text-3xl font-bold border-b-2 border-red-500 pb-2">1. Upload Assets</h2>
                        <FileInput
                            id="main-image"
                            label="Presenter's Image"
                            files={mainImage}
                            onFilesChange={setMainImage}
                            description="Upload one high-quality photo of the person. The background will be removed automatically."
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FileInput
                                id="logo1"
                                label="Official YEVOLATIN Logo"
                                files={logo1Files}
                                onFilesChange={setLogo1Files}
                                description="Appears top-left."
                            />
                            <FileInput
                                id="logo2"
                                label="Logo 2 (Optional)"
                                files={logo2Files}
                                onFilesChange={setLogo2Files}
                                description="Appears top-right."
                            />
                        </div>
                    </div>

                    {/* Column 2: Text & Style Inputs */}
                    <div className="space-y-8 p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                        <h2 className="text-3xl font-bold border-b-2 border-red-500 pb-2">2. Customize Content</h2>
                         <div>
                            <label htmlFor="person-name" className="block mb-2 text-lg font-semibold text-gray-200">Presenter's Name</label>
                            <input
                                id="person-name"
                                type="text"
                                value={personName}
                                onChange={(e) => setPersonName(e.target.value)}
                                className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200"
                                placeholder="e.g., Yev O. Latin"
                            />
                        </div>
                        <div>
                            <label htmlFor="info-text" className="block mb-2 text-lg font-semibold text-gray-200">Event Information Text</label>
                            <textarea
                                id="info-text"
                                value={infoText}
                                onChange={(e) => setInfoText(e.target.value)}
                                rows={10}
                                className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200"
                                placeholder="Enter event details here..."
                            />
                        </div>
                         <SocialLinkInput socialLink={socialLink} setSocialLink={setSocialLink} />
                    </div>

                     {/* Row 2: Styling */}
                     <div className="lg:col-span-2 space-y-8 p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10">
                       <h2 className="text-3xl font-bold border-b-2 border-red-500 pb-2">3. Select Style</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-3">Background Theme</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {backgroundStyles.map(style => (
                                        <button
                                            key={style.name}
                                            onClick={() => setActiveBackground(style.name)}
                                            className={`p-3 rounded-lg text-center transition-all duration-200 border-2 ${activeBackground === style.name ? 'bg-white text-green-900 border-white font-bold' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-xl font-semibold mb-3">Presenter Style Preset</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {presets.map(preset => (
                                        <button
                                            key={preset.name}
                                            onClick={() => handlePresetChange(preset.name)}
                                            className={`p-3 rounded-lg text-center transition-all duration-200 border-2 ${activePreset === preset.name ? 'bg-white text-green-900 border-white font-bold' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
                
                <div className="mt-8 flex flex-col items-center gap-4">
                    <button
                        onClick={handleGenerateClick}
                        disabled={isLoading || mainImage.length === 0}
                        className="px-12 py-4 text-2xl font-bold rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg border-2 border-red-400 transform hover:scale-105 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? 'Generating...' : '✨ Generate Posters'}
                    </button>
                     <button
                        onClick={handleReset}
                        className="text-gray-400 hover:text-white hover:underline transition-colors text-sm"
                     >
                         Reset All & Start Over
                     </button>
                </div>

                {error && (
                    <div className="mt-8 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center" role="alert">
                        <p className="font-semibold">An Error Occurred</p>
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center py-20 space-y-6">
                        <Spinner />
                        <p className="text-xl font-semibold text-gray-300 animate-pulse">{progressText}</p>
                    </div>
                )}

                {showResults && !isLoading && (
                    <div ref={resultsRef} className="mt-12 animate-fade-in">
                        {allGeneratedPosters.map((batch, batchIndex) => (
                          <div key={batchIndex} className="mb-16">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-4xl font-bold">Poster Batch #{batchIndex + 1}</h2>
                                {batchIndex === allGeneratedPosters.length - 1 && (
                                     <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" /></svg>
                                        Start Over
                                    </button>
                                )}
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {batch['9:16'] && batch['9:16'].map((poster, index) => (
                                    <PosterDisplay 
                                        key={`story-${batchIndex}-${index}`} 
                                        imageDataUrl={poster}
                                        fileName={`YevoLatin-Poster-Story-${batchIndex}-${index+1}.png`}
                                        onSave={handleSavePoster}
                                        isSaved={isPosterSaved(poster)}
                                        onEditText={() => handleOpenEditTextModal(poster, '9:16', index, batchIndex)}
                                    />
                                ))}
                                 {batch['1:1'] && batch['1:1'].map((poster, index) => (
                                    <PosterDisplay 
                                        key={`square-${batchIndex}-${index}`}
                                        imageDataUrl={poster}
                                        fileName={`YevoLatin-Poster-Square-${batchIndex}-${index+1}.png`}
                                        onSave={handleSavePoster}
                                        isSaved={isPosterSaved(poster)}
                                        onEditText={() => handleOpenEditTextModal(poster, '1:1', index, batchIndex)}
                                    />
                                ))}
                            </div>
                            {batchIndex < allGeneratedPosters.length - 1 && (
                                <hr className="my-12 border-t-2 border-white/10" />
                            )}
                          </div>  
                        ))}
                        
                    </div>
                )}
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
                    isEditing={isEditingPosterText}
                    error={editingError}
                />
            )}
        </div>
    );
};

export default App;
