import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Sparkles, GripHorizontal, MessageSquare } from 'lucide-react';
import { Send, X } from 'lucide-react';
import axios from 'axios';

/**
 * OverlayChatBox - Independent draggable/resizable chat container.
 * Props:
 *   meetingId: string - ID of the current meeting (extracted from URL).
 *   onClose: optional callback when the chatbox is closed.
 */
export default function OverlayChatBox({ meetingId, onClose, messages, setMessages }) {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });


  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ----- Drag handling -----
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setIsResizing(true);
    resizeStart.current = {
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging) {
        setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
      } else if (isResizing) {
        const newWidth = Math.max(240, resizeStart.current.width + (e.clientX - resizeStart.current.x));
        const newHeight = Math.max(200, resizeStart.current.height + (e.clientY - resizeStart.current.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };
    const onMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = input;
    const meetingId = window.location.pathname.slice(1);

    setMessages((prev) => [...prev, { role: 'human', content: msg }]);
    setInput('');
    setLoading(true);
    axios.post("http://localhost:4000/chat-query/query", {
      meeting_ids: [meetingId],
      messages: [...messages, { role: 'human', content: msg }],
    }, {
      withCredentials: true
    }).then(res => {
      console.log(res.data);
      setMessages([...messages, { role: 'human', content: msg }, { role: 'ai', content: res.data.response }]);
    })
      .catch((err) => {

      })
      .finally(() => {
        setLoading(false)
      })
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="absolute z-[2147483647] bg-[#202124]/70 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-white flex flex-col"
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        transform: 'translate(0,0)',
      }}
    >
      {/* Header - drag handle */}
      <div
        className="flex items-center justify-between p-2 cursor-move bg-white/5 border-b border-white/10"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 select-none">
          <GripHorizontal className="h-4 w-4 text-slate-400" />
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">Smart Chat Box</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#202124]/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'human' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded px-3 py-1 text-sm ${{
                human: 'bg-indigo-600 text-white',
                ai: 'bg-gray-700 text-gray-200',
              }[msg.role]}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-400 italic">Thinking...</div>
        )}
      </div>

      {/* Input area */}
      <div className="p-2 border-t border-white/10 bg-[#202124]/20 flex items-center">
        <textarea
          rows={1}
          className="flex-1 rounded bg-[#202124]/40 border border-white/20 px-2 py-1 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
          placeholder="Ask something about this meeting..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
        >
          <Send className="h-4 w-4" />
        </button>
        {/* Resize handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          className="ml-2 w-3 h-3 cursor-nwse-resize bg-slate-500 rounded-full"
        />
      </div>
    </div>
  );
}
