import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Trash2, Clock, Calendar, Users, MessageSquare, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock data for the meeting based on ID
  // In a real app, you would fetch this data using the ID
  const meeting = {
    id,
    title: 'Design Review: Dashboard',
    date: 'Oct 10, 2026',
    time: '2:00 PM - 3:20 PM',
    duration: '1h 20m',
    participants: 6,
    queriesMade: 14,
    status: 'Completed',
    summary: 'Discussed the new layout for the dashboard. Agreed on moving the sidebar to the top navigation. Next steps include finalizing the color palette and implementing the dark mode toggle.'
  };

  const handleDelete = () => {
    // Simulate API call for deletion
    setIsDeleting(true);
    setTimeout(() => {
      // In a real app, we'd handle the deletion success and maybe toast a message
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 hidden sm:block">
            MeetAssist
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{meeting.title}</h2>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} /> {meeting.date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {meeting.duration}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} className="mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Meeting'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Participants</p>
                <p className="text-2xl font-bold">{meeting.participants}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Time</p>
                <p className="text-lg font-bold">{meeting.time}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Queries Made</p>
                <p className="text-2xl font-bold">{meeting.queriesMade}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {meeting.summary}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MeetingDetails;
