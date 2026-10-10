import React from 'react';
import { 
  BookOpen, 
  User, 
  Clock, 
  PlusCircle, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function CoursesView({ courses, onBookCourseSupport }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            Enrolled Degree Courses (Term 3)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access course materials, view designated Course Instructors, or schedule 1-on-1 tutoring sessions.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>B.S. Computer Science</span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-card glass-card-hover p-6 border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-black text-amber-300 px-2.5 py-1 rounded bg-[#002F6C] border border-amber-400/30">
                  {course.code}
                </span>
                <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {course.units} Competency Units
                </span>
              </div>

              <h3 className="font-bold text-lg text-white mb-2">{course.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{course.description}</p>

              {/* Assigned CI Box */}
              {course.instructor && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.instructor.avatar_url}
                      alt={course.instructor.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/30"
                    />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Course Instructor</div>
                      <div className="font-bold text-xs text-white">{course.instructor.name}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono">Rating: {course.instructor.rating}★</span>
                </div>
              )}
            </div>

            {/* Book Course Support Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => onBookCourseSupport(course)}
                className="w-full btn-wgu-gold py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
              >
                <PlusCircle className="w-4 h-4 text-[#001E47]" />
                <span>Request Instructor Support for {course.code}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
