import React, { useState } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Share2, 
  MessageSquare, 
  Users, 
  PhoneOff, 
  Sparkles, 
  ShieldCheck, 
  Send
} from 'lucide-react';

export default function WebexMeetingModal({ appointment, onClose }) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { sender: appointment.staff.name, text: `Welcome to our WGU support session! How can I help you today with ${appointment.service_type}?`, time: '10:01 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'You (Alex)', text: inputMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-4xl border border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl bg-[#0B132B] flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#001E47] via-[#002F6C] to-[#001E47] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">WGU Webex Virtual Meeting Room</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold status-pulse">
                  LIVE SESSION
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {appointment.service_type} • Host: <strong className="text-amber-400">{appointment.staff.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas & Chat Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 gap-4 overflow-y-auto min-h-[350px]">
          
          {/* Main Video View (2 Cols) */}
          <div className="lg:col-span-2 space-y-3 flex flex-col">
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center min-h-[280px]">
              
              {/* Main Host Video Box */}
              <div className="text-center space-y-3 p-6">
                <img
                  src={appointment.staff.avatar_url}
                  alt={appointment.staff.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400/40 mx-auto shadow-2xl"
                />
                <div>
                  <div className="font-bold text-lg text-white">{appointment.staff.name}</div>
                  <div className="text-xs text-amber-400 font-medium">{appointment.staff.role}</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WGU Verified Faculty Instructor</span>
                  </div>
                </div>
              </div>

              {/* Small Student PIP Video Preview */}
              <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                {isVideoOn ? (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">Camera Off</div>
                )}
              </div>
            </div>

            {/* Session Notes Preview */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <strong className="text-amber-400">Session Objective:</strong> "{appointment.notes || 'General support session.'}"
            </div>
          </div>

          {/* Right Column: Webex Live Chat */}
          <div className="lg:col-span-1 glass-card p-3 border border-slate-800 flex flex-col justify-between h-[380px]">
            <div className="pb-2 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Webex Meeting Chat
              </span>
              <span className="text-slate-400 text-[10px]">2 Participants</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span className="font-bold text-slate-300">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Send Input */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Send chat message..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="btn-wgu-gold px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5 text-[#001E47]" />
              </button>
            </form>
          </div>

        </div>

        {/* Video Control Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-xl border transition-colors ${
                isMicOn ? 'bg-slate-800 border-slate-700 text-white' : 'bg-rose-950 border-rose-500 text-rose-300'
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-xl border transition-colors ${
                isVideoOn ? 'bg-slate-800 border-slate-700 text-white' : 'bg-rose-950 border-rose-500 text-rose-300'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Session</span>
          </button>
        </div>

      </div>
    </div>
  );
}
