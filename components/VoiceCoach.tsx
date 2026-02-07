
import React, { useState, useRef } from 'react';
import { generateBriefingAudio, analyzeStudyData } from '../services/geminiService';
import { MissionDataStore } from '../types';
import { sounds } from '../services/audioService';

interface VoiceCoachProps {
  missionData: MissionDataStore;
  monthLabel: string;
}

const VoiceCoach: React.FC<VoiceCoachProps> = ({ missionData, monthLabel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startBriefing = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    sounds.click();
    
    const analysis = await analyzeStudyData(missionData, monthLabel);
    const audioData = await generateBriefingAudio(analysis);

    if (audioData) {
      const audioBlob = b64toBlob(audioData, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
    setIsLoading(false);
  };

  const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  };

  return (
    <div className="bg-[#111318] p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-blue-600 animate-pulse' : 'bg-slate-800'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Commander's Briefing</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Voice AI Strategy</p>
          </div>
        </div>

        <button 
          onClick={startBriefing}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
            isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Decrypting...' : isPlaying ? 'Silence' : 'Receive Briefing'}
        </button>
      </div>

      {isPlaying && (
        <div className="w-full flex justify-center gap-1 h-6 items-end mt-2">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-blue-400 rounded-full"
              style={{ 
                height: `${Math.random() * 100}%`,
                transition: 'height 0.1s ease-out'
              }}
            />
          ))}
        </div>
      )}

      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden" 
      />
    </div>
  );
};

export default VoiceCoach;
