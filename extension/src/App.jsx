import React, { useEffect, useState } from 'react';
import { Sparkles, Save, Terminal, Cpu, ExternalLink, Video, Activity, Loader2 } from 'lucide-react';
import axios from 'axios';

function App() {
  const [isOnMeet, setIsOnMeet] = useState(false);
  const [meetUrl, setMeetUrl] = useState('');
  const [backendOnline, setBackendOnline] = useState(true);

  // Check backend server, user authentication and active tab
  useEffect(() => {
    //   checkBackendAndAuth();
    checkActiveTab();
  }, []);

  const checkActiveTab = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const url = tabs[0].url || '';
          setMeetUrl(url);
          if (url.includes('meet.google.com')) {
            setIsOnMeet(true);
          } else {
            setIsOnMeet(false);
          }
        }
      });
    }
  };

  const openLink = (url) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="w-[380px] min-h-[500px] bg-[#202124] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <header className="p-4 border-b border-[#3c4043] flex items-center justify-between bg-[#202124] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#00796b]/20 rounded-lg border border-[#00796b]/40 text-[#80cbc4]">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05]">
              MeetAssist
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">CHROME EXTENSION</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {backendOnline ? (
            <span className="flex items-center gap-1.5 text-xs text-[#80cbc4] bg-[#00796b]/20 px-2 py-0.5 rounded-full border border-[#00796b]/30 font-medium">
              <span className="h-1.5 w-1.5 bg-[#80cbc4] rounded-full animate-ping" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 px-2 py-0.5 rounded-full border border-red-500/25 font-medium">
              Offline
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4">

        {/* Connection Offline Warning */}
        {!backendOnline && (
          <div className="bg-red-950/20 border border-red-500/25 rounded-xl p-4 text-center flex flex-col gap-2">
            <div className="mx-auto p-2 bg-red-500/10 rounded-full text-red-400 w-fit">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-red-300 text-sm">Backend Server Offline</h3>
            <p className="text-xs text-slate-400">
              Please ensure your transcription backend service is running locally on port 4000.
            </p>
            <button
              onClick={() => {}}
              className="mt-2 text-xs bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 text-red-200 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {backendOnline && (
          <>
            {/* Google Meet Current Status Card */}
            {isOnMeet ? (
              <div className="bg-[#00796b]/15 border border-[#00796b]/40 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-[#00796b]/20 rounded-xl text-[#80cbc4]">
                  <Video className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#80cbc4]">Active Google Meet</p>
                  <p className="text-[11px] text-slate-400 truncate">Overlay is active on current tab</p>
                </div>
                <span className="text-[10px] text-[#80cbc4] bg-[#00796b]/35 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>
            ) : (
              <div className="bg-[#303134] border border-[#3c4043] rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#202124] rounded-xl text-slate-400">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Google Meet Inactive</p>
                    <p className="text-[11px] text-slate-400">Not currently inside a meeting</p>
                  </div>
                </div>
                <button
                  onClick={() => openLink("https://meet.google.com")}
                  className="text-xs bg-[#00796b]/20 hover:bg-[#00796b]/30 border border-[#00796b]/40 text-[#80cbc4] px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Join Meet
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Loading Spinner */}
            {false ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-[#80cbc4] animate-spin mb-2" />
                <p className="text-xs text-slate-400">Verifying session state...</p>
              </div>
            ) : (
              <>
                {/* Auth Area */}
                {false ? (
                  /* User Profile Card */
                  <div className="bg-[#303134] border border-[#3c4043] rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#00796b] to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                          U
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Transcriptor User</p>
                          <p className="text-xs text-slate-400"></p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-[#3c4043]" />

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openLink("http://localhost:5173")}
                        className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Go to Dashboard
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Login Card */
                  <div className="bg-[#303134] border border-[#3c4043] rounded-xl p-4 flex flex-col gap-3">
                    <div className="text-left mb-1">
                      <h3 className="text-sm font-semibold text-slate-200">Account Login</h3>
                      <p className="text-xs text-slate-400">Sign in to start capturing meetings</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Feature Highlights */}
        <div className="bg-[#303134] border border-[#3c4043] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1 bg-[#00796b]/20 text-[#80cbc4] rounded-md mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">AI Meeting Insights</h4>
                <p className="text-[10px] text-slate-400">Auto-generate precise summaries, topics, and decisions.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 bg-[#00796b]/20 text-[#80cbc4] rounded-md mt-0.5">
                <Save className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Real-Time Capture</h4>
                <p className="text-[10px] text-slate-400">Captures transcription chunks live with Google Meet captions.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1 bg-[#00796b]/20 text-[#80cbc4] rounded-md mt-0.5">
                <Terminal className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-zinc-200">Interactive Chat Overlay</h4>
                <p className="text-[10px] text-slate-400">Talk to your transcript directly inside the meeting screen.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-[#3c4043] text-center bg-[#202124]">
        <p className="text-[10px] text-slate-500">
          MeetAssist Extension &copy; 2026
        </p>
      </footer>
    </div>
  );
}

export default App;