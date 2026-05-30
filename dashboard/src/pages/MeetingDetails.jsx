import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Trash2, Clock, Calendar, Users, MessageSquare, Sun, Moon, Lightbulb, Flag, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import axios from 'axios'

const MeetingDetails = () => {
  const { meeting_id } = useParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [isDeleting, setIsDeleting] = useState(false);
  const [meeting, setMeeting] = useState({
    id: meeting_id,
    name: 'Design Review: Dashboard',
    date_time: 'Oct 10, 2026',
    duration: '1h 20m',
    participants: 6,
    queriesMade: 14,
    status: 'Completed',
    summary: 'Discussed the new layout for the dashboard. Agreed on moving the sidebar to the top navigation. Next steps include finalizing the color palette and implementing the dark mode toggle.',
    insights: ['Key insights: User engagement increased by 15%, performance bottlenecks identified in data fetching.'],
    topics: ['UI redesign, performance optimization, dark mode implementation'],
    decisions_made: ['Adopt new color palette, refactor data layer, schedule follow‑up meeting next week'],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`http://localhost:4000/dashboard/fetch-meeting/${meeting_id}`, { withCredentials: true })
        console.log(res.data)
        setMeeting({ ...meeting, ...res.data })
      }
      catch (err) {
        console.log(err)
      }

    })()
  }, [])

  // Mock data for the meeting based on ID
  // In a real app, you would fetch this data using the ID

  const handleDelete = async () => {
    // Simulate API call for deletion
    try {
      await axios.post(`http://localhost:4000/dashboard/delete-meeting/${meeting_id}`, {}, { withCredentials: true })
      navigate('/dashboard')
    }
    catch (err) {
      console.log(err)
    }
    setIsDeleting(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#202124] transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#ffffff]/80 dark:bg-[#202124]/80 border-b border-[#dadce0] dark:border-[#3c4043] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] hidden sm:block">
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
            <h2 className="text-3xl font-bold mb-2">{meeting.name}</h2>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Calendar size={14} /> {meeting.date_time.split(", ")[0]}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor(meeting.duration / 3600000) + "hr " + Math.floor(meeting.duration / 60000) % 60 + "min"}</span>
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
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#00796b]/10 text-[#00796b] dark:bg-[#00796b]/20 dark:text-[#80cbc4]">
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
                <p className="text-lg font-bold">{meeting.date_time.split(",")[1]}</p>
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

        {/* AI Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {meeting.summary}
            </p>
          </CardContent>
        </Card>

        {/* Insights, Topics, Decisions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Insights */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Insights</h3>
              <ul className='list-disc list-inside'>
                {meeting.insights.map((insight, index) => {
                  return <li key={index} className=" text-slate-600 dark:text-slate-400 text-sm ">{insight}</li>
                })}
              </ul>
            </CardContent>
          </Card>
          {/* Key Topics */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#00796b]/10 text-[#00796b] dark:bg-[#00796b]/20 dark:text-[#80cbc4]">
                <Tag size={24} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Key Topics</h3>
              <ul className='list-disc list-inside'>
                {meeting.topics.map((topic, index) => {
                  return <li key={index} className=" text-slate-600 dark:text-slate-400 text-sm ">{topic}</li>
                })}
              </ul>
            </CardContent>
          </Card>
          {/* Decisions */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Flag size={24} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Decisions Made</h3>
              <ul className='list-disc list-inside'>
                {meeting.decisions_made.map((decision, index) => {
                  return <li key={index} className=" text-slate-600 dark:text-slate-400 text-sm ">{decision}</li>
                })}
              </ul>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MeetingDetails;
