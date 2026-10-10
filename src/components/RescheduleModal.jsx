import React, { useState } from 'react';
import { X, Calendar, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function RescheduleModal({ appointment, onClose, onRescheduleSubmit }) {
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:30 AM - 12:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:30 AM - 12:00 PM',
    '01:30 PM - 02:00 PM',
    '02:30 PM - 03:00 PM',
    '04:00 PM - 04:30 PM'
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onRescheduleSubmit(appointment.id, selectedDate, selectedTimeSlot);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-lg border border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl bg-[#0B132B] p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Reschedule Appointment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300">
          Rescheduling session with <strong className="text-amber-400">{appointment.staff.name}</strong> ({appointment.service_type}).
        </div>

        {/* Date Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 block">Select New Date:</label>
          <div className="grid grid-cols-4 gap-2">
            {dateOptions.slice(0, 4).map((d) => (
              <button
                key={d.fullDate}
                onClick={() => setSelectedDate(d.fullDate)}
                className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                  selectedDate === d.fullDate
                    ? 'bg-amber-400 text-[#001E47] font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">{d.dayName}</div>
                <div className="text-base font-black my-0.5">{d.dayNum}</div>
                <div className="text-[9px]">{d.month}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 block">Select New Time Slot:</label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  selectedTimeSlot === slot
                    ? 'bg-[#002F6C] text-amber-300 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-wgu-gold px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-[#001E47]" />
            <span>{isSubmitting ? 'Updating...' : 'Confirm Reschedule'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
