import React from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Phone, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  DollarSign, 
  HelpCircle,
  Award
} from 'lucide-react';

export default function DashboardView({ 
  student, 
  stats, 
  upcomingAppointments, 
  setActiveTab, 
  onOpenWebex, 
  onStartBookingCategory,
  onOpenReschedule
}) {
  const nextAppointment = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const categories = [
    {
      id: 'Program Mentor Check-in',
      title: 'Program Mentor',
      desc: 'Pacing, degree plan & milestone review',
      icon: User,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Dr. Marcus Vance'
    },
    {
      id: 'Course Instructor Support',
      title: 'Course Instructor',
      desc: 'Direct help with C950, C175, C480 labs & concepts',
      icon: BookOpen,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Subject Experts'
    },
    {
      id: 'Math Center Tutoring',
      title: 'Math Center',
      desc: 'Discrete Math, Calculus & Logic coaching',
      icon: Calculator,
      color: 'from-amber-500 to-orange-600',
      badge: '1-on-1 Labs'
    },
    {
      id: 'Writing Center Support',
      title: 'Writing Center',
      desc: 'APA guidance, Capstone & Technical reports',
      icon: FileText,
      color: 'from-purple-600 to-pink-700',
      badge: 'Paper Review'
    },
    {
      id: 'Financial Aid & Scholarships',
      title: 'Financial Aid',
      desc: 'FAFSA, Night Owl scholarships & billing',
      icon: DollarSign,
      color: 'from-emerald-700 to-green-800',
      badge: 'Counselors'
    },
    {
      id: 'Night Owl IT Help Desk',
      title: 'Night Owl IT Desk',
      desc: 'Portal logins, Panopto & exam proctoring setup',
      icon: HelpCircle,
      color: 'from-cyan-600 to-blue-700',
      badge: '24/7 Desk'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001E47] via-[#002F6C] to-[#0F172A] border border-amber-400/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WGU Night Owl Student Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="gradient-text">{student?.name || 'Alex Morgan'}</span>! 🦉
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Enrolled in <strong className="text-white">{student?.program || 'B.S. Computer Science'}</strong> — Term {student?.current_term || 3}. Connect with your Program Mentor or schedule 1-on-1 support with WGU Course Instructors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('book')}
              className="btn-wgu-gold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
            >
              <PlusCircle className="w-5 h-5 text-[#001E47]" />
              <span>Book New Support Session</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>View My Schedule ({stats?.upcoming_count || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Upcoming Appointments</span>
            <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white">{stats?.upcoming_count || 0}</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Next session scheduled</span>
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Sessions</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white">{stats?.completed_count || 0}</div>
          <div className="mt-1 text-xs text-slate-400 font-medium">
            100% attendance record
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Program Mentor</span>
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-white truncate">{student?.mentor_name || 'Dr. Marcus Vance'}</div>
          <div className="mt-1 text-xs text-purple-300 font-medium">
            College of IT • WGU Mentor
          </div>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Term Courses</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white">{stats?.enrolled_courses || 6}</div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">
            C950, C175, C480 & more
          </div>
        </div>
      </div>

      {/* Main Content Split: Next Appointment & Quick Support Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Next Appointment Priority Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Next Scheduled Session
            </h3>
            <span className="text-xs text-slate-400">Real-time status</span>
          </div>

          {nextAppointment ? (
            <div className="glass-card p-6 border border-amber-400/30 relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#001E47]/70">
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 status-pulse"></span>
                Confirmed
              </div>

              <div className="flex items-start gap-4">
                <img
                  src={nextAppointment.staff.avatar_url}
                  alt={nextAppointment.staff.name}
                  className="w-14 h-14 rounded-xl ring-2 ring-amber-400/40 object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg text-white">{nextAppointment.staff.name}</h4>
                  <p className="text-xs text-amber-400 font-medium">{nextAppointment.staff.role}</p>
                  <p className="text-xs text-slate-400">{nextAppointment.staff.department}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-xs text-slate-400">Category:</span>
                  <span className="font-semibold text-white">{nextAppointment.service_type}</span>
                </div>

                {nextAppointment.course && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-xs text-slate-400">Course:</span>
                    <span className="font-semibold text-amber-300">{nextAppointment.course.code} - {nextAppointment.course.title}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-xs text-slate-400">Date & Time:</span>
                  <span className="font-mono text-amber-400 font-bold">{nextAppointment.date} @ {nextAppointment.time_slot}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-xs text-slate-400">Contact Method:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                    {nextAppointment.contact_method}
                  </span>
                </div>
              </div>

              {nextAppointment.notes && (
                <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-0.5">Session Objective Notes:</span>
                  "{nextAppointment.notes}"
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => onOpenWebex(nextAppointment)}
                  className="w-full btn-wgu-gold py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110"
                >
                  <Video className="w-4 h-4 text-[#001E47]" />
                  <span>Join Webex Session</span>
                </button>
                
                <button
                  onClick={() => onOpenReschedule(nextAppointment)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Reschedule Session
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">No Upcoming Sessions</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule your weekly Program Mentor check-in or request Course Instructor help!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('book')}
                className="btn-wgu-primary px-4 py-2 text-xs rounded-lg inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Book Support Now</span>
              </button>
            </div>
          )}

          {/* Quick Contact Mentor Card */}
          <div className="glass-card p-5 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Assigned Program Mentor
            </h4>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Dr. Marcus Vance"
                className="w-12 h-12 rounded-full ring-2 ring-amber-400/40 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">Dr. Marcus Vance</div>
                <div className="text-xs text-amber-400">marcus.vance@wgu.edu</div>
                <div className="text-[11px] text-slate-400">Office Hours: M-F 8am-4pm MT</div>
              </div>
            </div>
            <button
              onClick={() => onStartBookingCategory('Program Mentor Check-in')}
              className="w-full mt-4 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Schedule Mentor Call</span>
            </button>
          </div>
        </div>

        {/* Right Column: Support Service Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Explore WGU Student Support Categories
              </h3>
              <p className="text-xs text-slate-400">Select a support channel to view available instructors and time slots</p>
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All Wizard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => onStartBookingCategory(cat.id)}
                  className="glass-card glass-card-hover p-5 cursor-pointer flex flex-col justify-between group border border-slate-800/80 hover:border-amber-400/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center shadow-md text-white group-hover:scale-110 transition-transform`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {cat.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Book 1-on-1 Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* WGU Student Success Commitment Notice */}
          <div className="glass-card p-5 border border-amber-400/20 bg-amber-400/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-300">WGU Night Owl Guarantee</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                All 1-on-1 support sessions are complimentary for enrolled WGU students. Program Mentors and Course Instructors are dedicated to helping you pass your Objective Assessments (OA) and Performance Assessments (PA).
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
