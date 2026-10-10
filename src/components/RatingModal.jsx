import React, { useState } from 'react';
import { X, Star, ThumbsUp, CheckCircle2 } from 'lucide-react';

export default function RatingModal({ appointment, onClose, onRatingSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onRatingSubmit(appointment.id, rating, feedback);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-md border border-amber-400/40 rounded-2xl overflow-hidden shadow-2xl bg-[#0B132B] p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-lg text-white">Rate & Review Support Session</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-2">
          <img
            src={appointment.staff.avatar_url}
            alt={appointment.staff.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-400/40 mx-auto shadow-md"
          />
          <h4 className="font-bold text-base text-white">{appointment.staff.name}</h4>
          <p className="text-xs text-amber-400 font-medium">{appointment.staff.role}</p>
        </div>

        {/* Interactive Star Picker */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-bold text-slate-400 block">Select Rating:</label>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-xs font-bold text-amber-300">
            {rating === 5 && '🌟 Excellent Support!'}
            {rating === 4 && '👍 Very Helpful'}
            {rating === 3 && '👌 Good Session'}
            {rating <= 2 && ' Need Improvement'}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Written Feedback (Optional):</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share how this instructor helped you prepare for your objective assessment or term goal..."
            rows={3}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Buttons */}
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
            <span>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
