import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Video, Database, MessageSquare, History, Check, Search, Paperclip, Send, Edit2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [info, setInfo] = useState({
    total_meetings: 0,
    queryMade: 0,
    availableMeetings: 0,
    meetings: []
  })

  const [stats, setStats] = useState([
    { label: 'Meetings Saved', value: info.total_meetings, icon: Database, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Available Meetings', value: info.availableMeetings, icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Queries Made', value: info.queryMade, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Total Recorded', value: info.total_meetings, icon: History, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ]);

  const [olderMeetings, setOlderMeetings] = useState([
    { id: 'm1', title: 'Q3 Roadmap Planning', date: 'Oct 12, 2026', duration: '45m' },
    { id: 'm2', title: 'Design Review: Dashboard', date: 'Oct 10, 2026', duration: '1h 20m' },
    { id: 'm3', title: 'Engineering Standup', date: 'Oct 09, 2026', duration: '15m' },
    { id: 'm4', title: 'Client Onboarding', date: 'Oct 05, 2026', duration: '50m' },
  ]);

  const [currentMeeting, setCurrentMeeting] = useState({
    name: 'No active meetings',
    duration: '00:00:00',
    status: 'Not Recording',
  });

  // ......................Fetching User Info...........................
  useEffect(() => {
    axios.get("http://localhost:4000/dashboard/fetch", {
      withCredentials: true
    }).then(res => {

      setInfo(res.data.data)
      setOlderMeetings(res.data.data.meetings)
      if (res.data.data.currentMeeting !== null) {
        setCurrentMeeting(res.data.data.currentMeeting)
      }
      else {
        setCurrentMeeting({ name: 'No active meetings', duration: '00:00:00', status: 'Not Recording' })
      }
      console.log(res.data.data);
    }).catch(error => {
      console.log(error);
    })
  }, [])

  // Mock Data


  useEffect(() => {
    setStats([
      { label: 'Meetings Saved', value: info.total_meetings, icon: Database, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      { label: 'Available Meetings', value: info.availableMeetings, icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
      { label: 'Queries Made', value: info.queryMade, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      { label: 'Total Recorded', value: info.total_meetings, icon: History, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    ]);
  }, [info])






  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (id, currentTitle, e) => {
    e.stopPropagation();
    setEditingMeetingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = (e) => {
    e.stopPropagation();
    if (editTitle.trim() === '') return cancelEdit(e);
    console.log(editTitle, editingMeetingId)
    if (editingMeetingId === 'current') {
      setCurrentMeeting({ ...currentMeeting, name: editTitle.trim() });
      axios.post("http://localhost:4000/dashboard/edit-current-meeting-name", {
        meeting_id: currentMeeting.meeting_id,
        name: editTitle.trim()
      }, {
        withCredentials: true
      }).then(res => {
        console.log(res.data);
      }).catch(error => {
        console.log(error);
      })
    } else {
      let temp = olderMeetings.map(m => m.meeting_id === editingMeetingId ? { ...m, name: editTitle.trim() } : m);
      console.log("-------------------", temp)
      setOlderMeetings(temp)
      axios.post("http://localhost:4000/dashboard/edit-meeting-name", {
        meeting_id: editingMeetingId,
        name: editTitle.trim()
      }, {
        withCredentials: true
      }).then(res => {
        console.log(res.data);
      }).catch(error => {
        console.log(error);
      })
    }
    setEditingMeetingId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingMeetingId(null);
  };

  const [selectedResources, setSelectedResources] = useState([]);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your meeting assistant. You can select older meetings as context and ask me anything about them.' }
  ]);
  const [isSelectingResources, setIsSelectingResources] = useState(false);

  const handleLogout = () => navigate('/login');

  const toggleResource = (id) => {
    setSelectedResources(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setMessages([...messages, { role: 'human', content: chatInput }]);
    const msg = chatInput;
    setChatInput('');
    try {
      await axios.post("http://localhost:4000/chat-query/query", {
        meeting_ids: selectedResources,
        messages: [...messages, { role: 'human', content: msg }],
      }, {
        withCredentials: true
      }).then(res => {
        console.log(res.data);
        setMessages([...messages, { role: 'human', content: chatInput }, { role: 'ai', content: res.data.response }]);
      })
    }
    catch (err) {
      setMessages([...messages, { role: 'human', content: chatInput }, { role: 'ai', content: 'Something went wrong' }]);
      console.log(err);
    }

  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Video size={18} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            MeetAssist
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Meetings) */}
          <div className="space-y-8 flex flex-col">
            {/* Current Meeting */}
            <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo-600 dark:text-indigo-400">Current Meeting</CardTitle>
                  <Badge variant="default" className="animate-pulse bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
                    {currentMeeting.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {editingMeetingId === 'current' ? (
                  <div className="flex items-center gap-2 mb-1 w-full">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex-1 font-semibold text-slate-800 dark:text-slate-100"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(e)}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shrink-0" onClick={saveEdit}><Check size={16} /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0" onClick={cancelEdit}><X size={16} /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1 group">
                    <h4 className="text-lg font-semibold">{currentMeeting.name}</h4>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600" onClick={(e) => startEditing('current', currentMeeting.name, e)}>
                      <Edit2 size={14} />
                    </Button>
                  </div>
                )}
                <p className="text-3xl font-mono tracking-wider font-light text-slate-700 dark:text-slate-300 mb-4">
                  {Math.floor(currentMeeting.duration / 3600000) + ":" + Math.floor(currentMeeting.duration / 60000) % 60 + ":" + Math.floor(currentMeeting.duration / 1000) % 60 || "0:0:0"}
                </p>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
                    ))}
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Older Meetings */}
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <CardTitle>Older Meetings</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {olderMeetings.map(meeting => (
                    <li
                      key={meeting.meeting_id}
                      onClick={() => navigate(`/dashboard/meeting/${meeting.meeting_id}`)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        {editingMeetingId === meeting.meeting_id ? (
                          <div className="flex items-center gap-1.5 mb-1" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex-1 min-w-0"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(e)}
                            />
                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" onClick={saveEdit}><Check size={14} /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={cancelEdit}><X size={14} /></Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="font-medium mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{meeting.name}</p>
                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-slate-400 hover:text-indigo-600" onClick={(e) => startEditing(meeting.meeting_id, meeting.name, e)}>
                              <Edit2 size={12} />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400">{meeting.date_time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{meeting.duration}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Chatbot) */}
          <Card className="lg:col-span-2 flex flex-col h-[650px] shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <CardTitle>AI Assistant</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Ask questions about your meetings</p>
                  </div>
                </div>

                {/* Resource Selector Dropdown Toggle */}
                <Button
                  variant={isSelectingResources ? "primary" : "outline"}
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => setIsSelectingResources(!isSelectingResources)}
                >
                  <Database size={14} />
                  {selectedResources.length} Resources
                </Button>
              </div>

              {/* Resource Selector Panel */}
              {isSelectingResources && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold">Select context for AI</h5>
                    <Badge variant="secondary" className="text-[10px]">{selectedResources.length} selected</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                    {olderMeetings.map(m => (
                      <div
                        key={m.meeting_id}
                        onClick={() => toggleResource(m.meeting_id)}
                        className={`text-xs p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${selectedResources.includes(m.meeting_id)
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                      >
                        <span className="truncate mr-2">{m.name}</span>
                        {selectedResources.includes(m.id) && <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'human' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm ${msg.role === 'human'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/60 rounded-b-2xl">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <Button type="button" variant="ghost" size="icon" className="absolute left-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Paperclip size={18} />
                </Button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about product strategy, deadlines..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-shadow text-sm"
                />
                <Button type="submit" size="icon" variant="primary" className="absolute right-1 w-8 h-8 rounded-lg shadow-none">
                  <Send size={14} />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
