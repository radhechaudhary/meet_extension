import React from 'react';
import { Play, Pause, Square, Info } from 'lucide-react';

export default function OverlayControls({ isRecording, onStart, onPause, onEnd }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#202124] border border-[#3C4043] rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2 text-indigo-400">
          <Info className="h-4 w-4" />
          <h3 className="text-sm font-medium">Instructions</h3>
        </div>
        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
          <li>Turn captions <strong>ON</strong> in Google Meet.</li>
          <li>Choose the correct meeting language.</li>
          <li>Pause recording when not discussing important topics.</li>
        </ul>
      </div>

      <div className="flex justify-between gap-2">
        {!isRecording ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 p-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Play className="h-4 w-4" /> Start
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/50 p-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Pause className="h-4 w-4" /> Pause
          </button>
        )}
        
        <button
          onClick={onEnd}
          className="flex-1 flex items-center justify-center gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 p-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Square className="h-4 w-4" /> End
        </button>
      </div>
    </div>
  );
}
