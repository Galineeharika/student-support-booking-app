import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Calculator, 
  FileText, 
  DollarSign, 
  HelpCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Sparkles,
  Info
} from 'lucide-react';

export default function BookingWizard({ 
  staffList, 
  courses, 
  student, 
  initialCategory, 
  initialStaffId,
  onBookingComplete,
  setActiveTab 
}) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Program Mentor Check-in');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || null);
  const [selectedStaffId, setSelectedStaffId] = useState(initialStaffId || null);
  
  // Date & Slot Selection
  const today = new Date();
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i + 1);
    return {
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].fullDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [contactMethod, setContactMethod] = useState('Webex Video');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:30 AM - 12:00 PM',
    '01:30 PM - 02:00 PM',
    '02:30 PM - 03:00 PM',
    '04:00 PM - 04:30 PM'
  ];

  const categories = [
    { id: 'Program Mentor Check-in', label: 'Program Mentor Check-in', icon: User, roleFilter: 'Program Mentor', desc: 'Pacing review & term planning with Dr. Marcus Vance' },
    { id: 'Course Instructor Support', label: 'Course Instructor Support', icon: BookOpen, roleFilter: 'Course Instructor', desc: '1-on-1 help with course labs, OA preparation & code reviews' },
    { id: 'Math Center Tutoring', label: 'Math Center Tutoring', icon: Calculator, roleFilter: 'Math Center Specialist', desc: 'Discrete Math, Calculus & predicate logic coaching' },
    { id: 'Writing Center Support', label: 'Writing Center Support', icon: FileText, roleFilter: 'Writing Coach', desc: 'Technical documentation, APA citations & capstone reviews' },
    { id: 'Financial Aid & Scholarships', label: 'Financial Aid & Scholarships', icon: DollarSign, roleFilter: 'Financial Aid Counselor', desc: 'Night Owl scholarships, FAFSA & student aid guidance' },
    { id: 'Night Owl IT Help Desk', label: 'Night Owl IT Desk', icon: HelpCircle, roleFilter: 'IT Support', desc: 'Panopto video recording, portal logins & proctoring setup' }
  ];

  // Auto select staff based on category selection
  useEffect(() => {
    const currentCatObj = categories.find(c => c.id === selectedCategory);
    if (currentCatObj && staffList && staffList.length > 0) {
      const matchingStaff = staffList.filter(s => s.role === currentCatObj.roleFilter);
      if (matchingStaff.length > 0) {
        setSelectedStaffId(matchingStaff[0].id);
      } else {
        setSelectedStaffId(staffList[0].id);
      }
    }
  }, [selectedCategory, staffList]);

  // Filter staff based on selected category & selected course instructor
  const filteredStaff = staffList.filter(s => {
    const currentCatObj = categories.find(c => c.id === selectedCategory);
    if (!currentCatObj) return true;
    return s.role === currentCatObj.roleFilter;
  });

  const selectedStaffObj = staffList.find(s => s.id === Number(selectedStaffId)) || staffList[0];
  const selectedCourseObj = courses.find(c => c.id === Number(selectedCourseId));

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        student_id: student?.id || 1,
        staff_id: Number(selectedStaffId),
        course_id: selectedCategory === 'Course Instructor Support' ? Number(selectedCourseId) : null,
        service_type: selectedCategory,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        contact_method: contactMethod,
        notes: notes || 'Student requested support appointment.'
      };

      const res = await fetch('http://localhost:8000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create appointment');
      const newApp = await res.json();
      
      setIsSubmitting(false);
      onBookingComplete(newApp);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setIsSubmitting(false);
      alert('Error booking appointment. Please check backend connection.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Step Indicator Header */}
      <div className="glass-card p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">Step {step} of 3</span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {step === 1 && 'Select WGU Support Category'}
              {step === 2 && 'Choose Staff, Date & Time Slot'}
              {step === 3 && 'Confirm Session Details'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Complimentary WGU Student Service
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: 1, title: 'Category' },
            { num: 2, title: 'Schedule & Staff' },
            { num: 3, title: 'Confirm & Notes' }
          ].map((s) => (
            <div 
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                step === s.num
                  ? 'bg-[#002F6C] border-amber-400 text-white font-bold'
                  : step > s.num
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 cursor-pointer'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                step === s.num
                  ? 'bg-amber-400 text-[#001E47]'
                  : step > s.num
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-semibold">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`glass-card p-5 cursor-pointer border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-r from-[#002F6C]/80 to-[#0F172A] ring-1 ring-amber-400/50 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-amber-400 text-[#001E47]' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-white">{cat.label}</h4>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* If Course Instructor Support is selected, select course */}
          {selectedCategory === 'Course Instructor Support' && (
            <div className="glass-card p-6 border border-amber-400/30 space-y-4">
              <label className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Select Enrolled WGU Course for Instructor Help:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      if (course.instructor_id) setSelectedStaffId(course.instructor_id);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      Number(selectedCourseId) === course.id
                        ? 'bg-[#002F6C] border-amber-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-amber-400 px-2 py-0.5 rounded bg-slate-950">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-400">{course.units} Units</span>
                    </div>
                    <div className="font-bold text-sm text-white mt-2">{course.title}</div>
                    {course.instructor && (
                      <div className="text-xs text-slate-400 mt-1">CI: {course.instructor.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="btn-wgu-gold px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg"
            >
              <span>Next: Choose Staff & Time</span>
              <ArrowRight className="w-4 h-4 text-[#001E47]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: STAFF & DATE/TIME SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Select Staff Member */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              1. Select Specialist or Instructor ({filteredStaff.length} Available)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStaff.map((staff) => {
                const isSelected = Number(selectedStaffId) === staff.id;
                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`glass-card p-4 cursor-pointer border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-amber-400 bg-[#002F6C]/80 ring-1 ring-amber-400/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={staff.avatar_url}
                      alt={staff.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/30"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white truncate">{staff.name}</h4>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{staff.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-amber-300 font-medium">{staff.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{staff.department}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Select Date */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
              2. Select Appointment Date
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {dateOptions.map((d) => (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedDate === d.fullDate
                      ? 'bg-amber-400 text-[#001E47] border-amber-400 font-bold shadow-lg scale-105'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider">{d.dayName}</div>
                  <div className="text-lg font-black my-0.5">{d.dayNum}</div>
                  <div className="text-[10px] font-medium">{d.month}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Time Slot */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              3. Select Available Time Slot (Mountain Time)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedTimeSlot === slot
                      ? 'bg-[#002F6C] border-amber-400 text-amber-300 ring-1 ring-amber-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{slot}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              4. Select Preferred Contact Mode
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Webex Video', label: 'Webex Video', icon: Video, desc: 'Interactive screen share' },
                { id: 'Phone Call', label: 'Phone Call', icon: Phone, desc: 'Direct phone line' },
                { id: 'Live Chat', label: 'Live Text Chat', icon: MessageSquare, desc: 'Real-time chat' }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setContactMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      contactMethod === m.id
                        ? 'bg-[#002F6C] border-amber-400 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-amber-400 mb-1" />
                    <div className="text-xs font-bold text-white">{m.label}</div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setStep(3)}
              className="btn-wgu-gold px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <span>Next: Notes & Confirm</span>
              <ArrowRight className="w-4 h-4 text-[#001E47]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUMMARY & CONFIRMATION */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-amber-400/40 space-y-6 bg-gradient-to-b from-[#0F172A] to-[#001E47]">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Appointment Summary Review
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialist Card */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                {selectedStaffObj && (
                  <>
                    <img
                      src={selectedStaffObj.avatar_url}
                      alt={selectedStaffObj.name}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-400/40"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Assigned Specialist</span>
                      <h4 className="font-bold text-base text-white">{selectedStaffObj.name}</h4>
                      <p className="text-xs text-slate-300 font-medium">{selectedStaffObj.role}</p>
                      <p className="text-xs text-slate-400">{selectedStaffObj.department}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Schedule Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Time & Support Channel</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-white">{selectedCategory}</span>
                </div>
                {selectedCategory === 'Course Instructor Support' && selectedCourseObj && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Course:</span>
                    <span className="font-semibold text-amber-300">{selectedCourseObj.code} - {selectedCourseObj.title}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedDate} @ {selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Mode:</span>
                  <span className="font-semibold text-blue-400">{contactMethod}</span>
                </div>
              </div>
            </div>

            {/* Notes / Questions Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Session Objective & Preparation Notes for Specialist (Optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Need assistance reviewing hash table distance calculations for C950 PA Task 2, or checking degree plan timeline..."
                rows={4}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                A Webex meeting link and calendar invite will be generated instantly upon confirmation. You can reschedule or cancel at any time from <strong>My Appointments</strong>.
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="btn-wgu-gold px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5 text-[#001E47]" />
              <span>{isSubmitting ? 'Booking Appointment...' : 'Confirm & Schedule Appointment'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
