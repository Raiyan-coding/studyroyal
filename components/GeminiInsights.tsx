
import React, { useState } from 'react';
import { analyzeStudyData } from '../services/geminiService';
import { MissionDataStore } from '../types';

interface GeminiInsightsProps {
  missionData: MissionDataStore;
  monthLabel: string;
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ missionData, monthLabel }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getInsights = async () => {
    setLoading(true);
    const result = await analyzeStudyData(missionData, monthLabel);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 p-6 rounded-2xl border border-blue-500/10 shadow-xl flex flex-col justify-center items-center text-center">
      <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 text-blue-400">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
         </svg>
      </div>
      
      {!insight ? (
        <>
          <h4 className="text-lg font-bold text-white mb-2">AI-Powered Insights</h4>
          <p className="text-slate-400 text-sm mb-6 max-w-xs">
            Analyze your study patterns with Gemini AI to get personalized advice and focus recommendations.
          </p>
          <button 
            onClick={getInsights}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : 'Generate Insights'}
          </button>
        </>
      ) : (
        <div className="text-left w-full h-full max-h-64 overflow-y-auto custom-scrollbar">
           <div className="flex justify-between items-start mb-4 sticky top-0 bg-[#111318]/50 backdrop-blur pb-2">
             <h4 className="text-blue-400 font-bold text-sm tracking-wider uppercase">Gemini Intelligence</h4>
             <button onClick={() => setInsight(null)} className="text-slate-500 hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
           </div>
           <div className="prose prose-invert prose-sm">
             <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                {insight}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GeminiInsights;
