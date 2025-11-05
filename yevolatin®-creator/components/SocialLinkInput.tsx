
import React, { useState, useEffect } from 'react';

type Platform = 'instagram' | 'facebook' | 'vk' | 'email';

interface SocialLinkInputProps {
  socialLink: string;
  setSocialLink: (link: string) => void;
}

const platformConfig = {
  instagram: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
      </svg>
    ),
    placeholder: 'Your Instagram Username',
    baseUrl: 'https://www.instagram.com/',
  },
  facebook: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.32 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
      </svg>
    ),
    placeholder: 'Your Facebook Username/ID',
    baseUrl: 'https://www.facebook.com/',
  },
  vk: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M16.14,15.82C16.5,16.12 16.74,16.25 16.9,16.25C17.36,16.25 17.5,15.87 17.5,15.2C17.5,14.28 17.06,13.63 15.28,12.23C13.62,10.92 13.06,10.37 13.06,9.6C13.06,9.08 13.4,8.75 13.88,8.75C14.25,8.75 14.7,8.94 15.5,9.65L16.2,8.68C15.3,7.9 14.45,7.5 13.69,7.5C12.5,7.5 11.66,8.14 11.66,9.3C11.66,10.55 12.47,11.16 14.1,12.44C15.92,13.86 16.5,14.41 16.5,15.16C16.5,15.54 16.35,15.7 16.14,15.82M10.87,11.85L11.42,12.4C10.7,13.2 10.1,13.86 10.1,14.37C10.1,14.65 10.23,15 10.5,15H11.75V16.25H9.76C9,16.25 8.5,15.65 8.5,14.9C8.5,13.9 9.38,12.79 10.87,11.85M9.1,8.75C9.76,8.75 10.1,9.08 10.1,9.45V11.23L9,12.06V9.45C9,9.08 9,8.75 9.1,8.75M12,12.06L12,12.06Z" />
      </svg>
    ),
    placeholder: 'Your VK ID',
    baseUrl: 'https://vk.com/',
  },
  email: {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z" />
      </svg>
    ),
    placeholder: 'Your Email Address',
    baseUrl: 'mailto:',
  },
};

const SocialLinkInput: React.FC<SocialLinkInputProps> = ({ socialLink, setSocialLink }) => {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [handle, setHandle] = useState('');

  useEffect(() => {
    if (!platform || !handle.trim()) {
      setSocialLink('');
      return;
    }
    const config = platformConfig[platform];
    const url = `${config.baseUrl}${handle.trim()}`;
    setSocialLink(url);
  }, [platform, handle, setSocialLink]);

  return (
    <div>
      <label className="block mb-2 text-lg font-semibold text-gray-200">
        Social Link (for QR Code)
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-2 p-2 bg-black/20 border border-white/30 rounded-lg">
          {Object.keys(platformConfig).map((key) => {
            const p = key as Platform;
            const isActive = platform === p;
            return (
              <button
                key={p}
                title={p.charAt(0).toUpperCase() + p.slice(1)}
                onClick={() => setPlatform(p)}
                className={`p-2 rounded-md transition-all duration-200 ${isActive ? 'bg-white text-green-900 shadow-lg' : 'text-gray-400 hover:bg-white/20 hover:text-white'}`}
              >
                {platformConfig[p].icon}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder={platform ? platformConfig[platform].placeholder : "Select a platform first"}
          className="w-full p-3 bg-black/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-white transition-colors text-gray-200 disabled:bg-black/30 disabled:cursor-not-allowed"
          disabled={!platform}
        />
      </div>
    </div>
  );
};

export default SocialLinkInput;
