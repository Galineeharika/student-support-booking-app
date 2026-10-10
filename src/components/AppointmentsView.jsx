import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Star, 
  BookOpen, 
  User, 
  RotateCcw, 
  Sparkles,
  ExternalLink,
  ThumbsUp
} from 'lucide-react';

export default function AppointmentsView({ 
  appointments, 
  onCancel, 
  onOpenReschedule, 
  onOpenRating, 
  onOpenWebex, 
  setActiveTab 
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse"></span>
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            My Support Appointments
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage upcoming WGU mentorship & course sessions, access Webex meetings, or leave instructor feedback.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === tab.id
                  ? 'bg-[#002F6C] text-amber-300 font-bold border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List Grid */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((app) => (
            <div
              key={app.id}
              className={`glass-card p-6 border transition-all flex flex-col justify-between space-y-4 ${
                app.status === 'scheduled'
                  ? 'border-amber-400/30 bg-gradient-to-b from-[#0F172A] to-[#001E47]/60 hover:border-amber-400/60'
                  : 'border-slate-800 opacity-90'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.staff.avatar_url}
                      alt={app.staff.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/30"
                    />
                    <div>
                      <h3 className="font-bold text-base text-white">{app.staff.name}</h3>
                      <p className="text-xs text-amber-300 font-medium">{app.staff.role}</p>
                      <p className="text-[11px] text-slate-400">{app.staff.department}</p>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                {/* Session Details Box */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Support Type:</span>
                    <span className="font-semibold text-white">{app.service_type}</span>
                  </div>

                  {app.course && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Course Code:</span>
                      <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-amber-400/20">
                        {app.course.code} - {app.course.title}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Date & Slot:</span>
                    <span className="font-mono text-amber-400 font-bold">{app.date} @ {app.time_slot}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Contact Mode:</span>
                    <span className="font-semibold text-blue-300">{app.contact_method}</span>
                  </div>
                </div>

                {/* Session Notes */}
                {app.notes && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400 block mb-0.5">Student Notes:</span>
                    "{app.notes}"
                  </div>
                )}

                {/* Rating & Feedback if Completed */}
                {app.status === 'completed' && app.rating && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
                    <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{app.rating} / 5 Stars Rating Submitted</span>
                    </div>
                    {app.feedback && <p className="italic text-slate-300">"{app.feedback}"</p>}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                {app.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => onOpenWebex(app)}
                      className="flex-1 btn-wgu-gold py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Video className="w-4 h-4 text-[#001E47]" />
                      <span>Join Webex Video</span>
                    </button>

                    <button
                      onClick={() => onOpenReschedule(app)}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel session with ${app.staff.name}?`)) {
                          onCancel(app.id);
                        }
                      }}
                      className="py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {app.status === 'completed' && !app.rating && (
                  <button
                    onClick={() => onOpenRating(app)}
                    className="w-full btn-wgu-primary py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Rate & Review Instructor</span>
                  </button>
                )}

                {app.status === 'cancelled' && (
                  <button
                    onClick={() => setActiveTab('book')}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <span>Re-book Session</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Appointments Found</h3>
          <p className="text-xs text-slate-400">
            There are no support appointments matching filter "{filterStatus}".
          </p>
          <button
            onClick={() => setActiveTab('book')}
            className="btn-wgu-gold px-5 py-2.5 text-xs rounded-xl font-bold inline-flex items-center gap-2"
          >
            <span>Book New Appointment</span>
          </button>
        </div>
      )}
    </div>
  );
}
