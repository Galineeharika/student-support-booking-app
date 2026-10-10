import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Star, 
  Clock, 
  Mail, 
  PlusCircle, 
  Award, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function StaffDirectoryView({ staffList, onStartBookingStaff }) {
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const roles = [
    'All',
    'Program Mentor',
    'Course Instructor',
    'Math Center Specialist',
    'Writing Coach',
    'Financial Aid Counselor',
    'IT Support'
  ];

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.specialties && s.specialties.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Search Bar */}
      <div className="glass-card p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              WGU Faculty & Support Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Connect 1-on-1 with accredited Program Mentors, Course Instructors, and Academic Coaches.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                roleFilter === r
                  ? 'bg-amber-400 text-[#001E47] font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="glass-card glass-card-hover p-6 border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header */}
              <div className="flex items-start gap-4 mb-3">
                <img
                  src={staff.avatar_url}
                  alt={staff.name}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-400/40 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white truncate">{staff.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 inline-block mt-0.5">
                    {staff.role}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{staff.department}</p>
                </div>
              </div>

              {/* Rating & Hours */}
              <div className="py-2.5 px-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs my-3">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{staff.rating} / 5.0 Rating</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{staff.office_hours || 'M-F Office Hours'}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {staff.bio}
              </p>

              {/* Specialties Tags */}
              {staff.specialties && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {staff.specialties.split(',').map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Book CTA */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => onStartBookingStaff(staff)}
                className="w-full btn-wgu-gold py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
              >
                <PlusCircle className="w-4 h-4 text-[#001E47]" />
                <span>Book 1-on-1 Session</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
