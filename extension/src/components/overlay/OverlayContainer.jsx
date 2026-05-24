import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Sparkles, GripHorizontal } from 'lucide-react';
import OverlayLogin from './OverlayLogin';
import OverlayControls from './OverlayControls';

export default function OverlayContainer({
  isMinimized,
  setIsMinimized,
  isLoggedIn,
  setIsLoggedIn,
  isRecording,
  setIsRecording,
  onEnd
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only start dragging if left mouse button is pressed
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed top-4 right-4 z-[2147483647] w-96 font-sans shadow-2xl transition-opacity duration-200"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      {/* Translucent & Blurred Container */}
      <div className="backdrop-blur-xl bg-[#202124]/60 border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-white">

        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 cursor-move hover:bg-white/10 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 select-none">
            <GripHorizontal className="h-4 w-4 text-slate-400" />
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">Smart AI Helper</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start when clicking minimize
              setIsMinimized(!isMinimized);
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking the button
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4 bg-transparent">
            {!isLoggedIn ? (
              <OverlayLogin onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
              <OverlayControls
                isRecording={isRecording}
                onStart={() => setIsRecording(true)}
                onPause={() => setIsRecording(false)}
                onEnd={() => {
                  if (onEnd) onEnd();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
