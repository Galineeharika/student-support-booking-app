import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ChevronDown,
  Key
} from 'lucide-react';

export default function AiAssistantChat({ onDataRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🦉 Hello Alex! I am your WGU Night Owl AI Support Assistant. Ask me to find available sessions, check open seats, or book/cancel support sessions directly for you!'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMsg;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory.map(m => ({ role: m.role, content: m.content })),
          student_id: 1
        })
      });

      if (!res.ok) throw new Error('Chat API response failed');

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          action: data.action,
          note: data.note
        }
      ]);

      // If an action was executed by AI (booked or cancelled), refresh dashboard data!
      if (data.action && onDataRefresh) {
        onDataRefresh();
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '🦉 Sorry, I encountered an issue connecting to the AI assistant endpoint. Please ensure the backend server is running.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What sessions are available?",
    "Book me into C950 Data Structures",
    "Show my active bookings",
    "Cancel booking for C175"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-wgu-gold px-4 py-3 rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform border border-amber-400/50"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-[#001E47]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 status-pulse"></span>
          </div>
          <span className="font-extrabold text-xs text-[#001E47] uppercase tracking-wider">
            Night Owl AI Mentor
          </span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="glass-card w-[380px] sm:w-[420px] h-[520px] rounded-2xl border border-amber-400/40 shadow-2xl flex flex-col overflow-hidden bg-[#0B132B] animate-fadeIn">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#001E47] via-[#002F6C] to-[#001E47] flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  WGU AI Support Mentor 🦉
                </h3>
                <p className="text-[10px] text-slate-300 font-mono">OpenRouter LLM + Real-time Booking</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-300 hover:border-amber-400/40 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-1.5 ${
                  msg.role === 'user'
                    ? 'bg-[#002F6C] text-white p-3 rounded-2xl rounded-tr-none border border-amber-400/30'
                    : 'bg-slate-900 text-slate-200 p-3 rounded-2xl rounded-tl-none border border-slate-800'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* If action occurred */}
                  {msg.action && (
                    <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-start gap-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{msg.action.details}</span>
                    </div>
                  )}

                  {/* Note about API key if missing */}
                  {msg.note && (
                    <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>{msg.note}</span>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Night Owl AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI about sessions, book, or cancel..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="btn-wgu-gold px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#001E47]" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
