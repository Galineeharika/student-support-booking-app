import React, { useState, useEffect } from 'react';
import AiAssistantChat from './components/AiAssistantChat';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Key,
  ShieldAlert
} from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(null);

  // Alert & Error Banners
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 5000);
  };

  const fetchData = async () => {
    try {
      const [healthRes, studentRes, sessionsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/student`),
        fetch(`${API_BASE}/sessions`),
        fetch(`${API_BASE}/bookings?student_id=1`)
      ]);

      if (healthRes.ok) setHealth(await healthRes.json());
      if (studentRes.ok) setStudent(await studentRes.json());
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (err) {
      console.error('Error fetching data from FastAPI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check if student has booked a specific session
  const isSessionBooked = (sessionId) => {
    return bookings.some(b => b.session_id === sessionId && b.status === 'confirmed');
  };

  // Handle Booking Action
  const handleBookSession = async (sessionId) => {
    setBookingInProgress(sessionId);
    try {
      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, student_id: 1 })
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle Transaction Rejections (Duplicates, Full capacity, Time conflicts)
        showAlert(data.detail || 'Failed to book session.', 'error');
      } else {
        showAlert(`Successfully booked "${data.session.title}"!`, 'success');
        fetchData();
      }
    } catch (err) {
      console.error('Booking error:', err);
      showAlert('Network or server error while booking.', 'error');
    } finally {
      setBookingInProgress(null);
    }
  };

  // Handle Cancellation Action
  const handleCancelBooking = async (bookingId, sessionTitle) => {
    if (!confirm(`Are you sure you want to cancel your booking for "${sessionTitle}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/cancel/${bookingId}`, {
        method: 'POST'
      });

      if (res.ok) {
        showAlert(`Cancelled booking for "${sessionTitle}". 1 seat freed up!`, 'info');
        fetchData();
      } else {
        const data = await res.json();
        showAlert(data.detail || 'Failed to cancel booking.', 'error');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      showAlert('Server error while cancelling booking.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans pb-12">
      
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-[#001E47] via-[#002F6C] to-[#0B132B] border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white flex items-center gap-2">
                WGU Student Support Session Booking
                <span className="px-2 py-0.5 text-[10px] bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  SQLite + FastAPI
                </span>
              </h1>
              <p className="text-xs text-slate-300">Transactional Capacity & Duplicate Prevention</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Student Info */}
            {student && (
              <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{student.name}</span>
                <span className="text-slate-400">({student.wgu_id})</span>
              </div>
            )}

            {/* OpenRouter API Key Status */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">OpenRouter:</span>
              {health?.openrouter_key_set ? (
                <span className="text-emerald-400 font-bold">Key Ready (.env)</span>
              ) : (
                <span className="text-amber-400 font-bold">Pending API Key</span>
              )}
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Alert Banner */}
        {alertInfo && (
          <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg animate-fadeIn ${
            alertInfo.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : alertInfo.type === 'info'
              ? 'bg-blue-950/80 border-blue-500/50 text-blue-200'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3 text-sm font-semibold">
              {alertInfo.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
              {alertInfo.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {alertInfo.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400" />}
              <span>{alertInfo.message}</span>
            </div>
            <button onClick={() => setAlertInfo(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left 2 Cols: Available Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Available WGU Support Sessions
                </h2>
                <p className="text-xs text-slate-400">
                  Select a session to book. Real-time seat counts and transaction protection enabled.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {sessions.length} Sessions Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sessions.map((sess) => {
                const booked = isSessionBooked(sess.id);
                const isFull = sess.available_seats <= 0;

                return (
                  <div
                    key={sess.id}
                    className={`glass-card p-5 border transition-all flex flex-col justify-between space-y-4 ${
                      booked
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : isFull
                        ? 'border-slate-800/60 opacity-75'
                        : 'border-slate-800 hover:border-amber-400/40'
                    }`}
                  >
                    <div>
                      {/* Top Header & Seat Pill */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-amber-300 border border-slate-700">
                          {sess.category}
                        </span>

                        {/* Available Seats Badge */}
                        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                          isFull
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            : sess.available_seats === 1
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30 animate-pulse'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                          <span>{isFull ? 'FULL (0 Seats)' : `${sess.available_seats} / ${sess.max_capacity} Seats Available`}</span>
                        </div>
                      </div>

                      {/* Title & Instructor */}
                      <h3 className="font-bold text-base text-white mb-1 leading-snug">{sess.title}</h3>
                      <p className="text-xs text-amber-300 font-medium">Instructor: {sess.instructor_name}</p>

                      {/* Date & Time Slot */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Date:
                          </span>
                          <span className="font-mono text-white font-semibold">{sess.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Time Slot:
                          </span>
                          <span className="font-mono text-amber-400 font-bold">{sess.time_slot}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Action Button */}
                    <div className="pt-2">
                      {booked ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Registered & Confirmed</span>
                        </div>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4 text-slate-600" />
                          <span>Session Fully Booked</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookSession(sess.id)}
                          disabled={bookingInProgress === sess.id}
                          className="w-full btn-wgu-gold py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4 text-[#001E47]" />
                          <span>{bookingInProgress === sess.id ? 'Booking...' : 'Book This Session'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: My Booked Sessions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                My Active Bookings ({bookings.length})
              </h2>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="glass-card p-5 border border-amber-400/30 bg-gradient-to-b from-[#0F172A] to-[#001E47]/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse"></span>
                        Confirmed
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Booking #{b.id}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{b.session.title}</h4>
                    <p className="text-xs text-amber-300">{b.session.instructor_name}</p>

                    <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-mono text-white font-semibold">{b.session.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slot:</span>
                        <span className="font-mono text-amber-400 font-bold">{b.session.time_slot}</span>
                      </div>
                    </div>

                    {/* Cancellation Button */}
                    <button
                      onClick={() => handleCancelBooking(b.id, b.session.title)}
                      className="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-white text-sm">No Active Bookings</h4>
                <p className="text-xs text-slate-400">
                  Select any available session on the left to register.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Floating OpenRouter AI Mentor Chat Widget */}
      <AiAssistantChat onDataRefresh={fetchData} />

    </div>
  );
}
