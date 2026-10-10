import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  PlusCircle, 
  Server, 
  Clock, 
  Award,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, student, isBackendConnected, upcomingCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'book', label: 'Book Appointment', icon: PlusCircle, highlight: true },
    { id: 'appointments', label: 'My Appointments', icon: Calendar, badge: upcomingCount },
    { id: 'staff', label: 'Instructors & Mentors', icon: Users },
    { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B132B]/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-[#001E47] via-[#002F6C] to-[#001E47] px-4 py-1.5 text-xs text-slate-300 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-amber-400">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            WESTERN GOVERNORS UNIVERSITY
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">Night Owl Student Support Services Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 status-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-slate-300 font-mono text-[11px]">
              {isBackendConnected ? 'FastAPI + SQLite Active' : 'Backend Connecting...'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-medium">Term 3 Pacing: On Track</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#002F6C] to-[#FFC72C] p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black text-amber-400 tracking-tighter">WGU</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                  WGU Support Hub
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Mentorship • Course Support • Math & Writing Labs</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab.highlight
                      ? 'btn-wgu-gold shadow-md'
                      : isActive
                      ? 'bg-[#002F6C] text-white border border-amber-400/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${tab.highlight ? 'text-[#001E47]' : isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-400 text-slate-950 font-bold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Profile Info */}
          {student && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-semibold text-white">{student.name}</div>
                <div className="text-xs text-amber-400 font-mono">ID: #{student.wgu_id}</div>
              </div>
              <img
                src={student.avatar_url}
                alt={student.name}
                className="w-9 h-9 rounded-full ring-2 ring-amber-400/40 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-slate-800 bg-[#0B132B] px-2 py-1.5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] flex flex-col items-center py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                isActive ? 'text-amber-400 bg-slate-800/80 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
