import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Dumbbell, Calendar, Clock, UserCheck } from 'lucide-react';
import { COACHES } from '../data/mockData';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultTier = 'Gold',
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [objective, setObjective] = useState('Weight Loss & Body Recomposition');
  const [trainingAge, setTrainingAge] = useState('3-5 Years');
  const [squat, setSquat] = useState('180');
  const [bench, setBench] = useState('130');
  const [deadlift, setDeadlift] = useState('230');
  const [preferredCoach, setPreferredCoach] = useState('marcus-vance');
  const [format, setFormat] = useState<'Online Remote' | 'In-Person (Pure Gym Hazel Grove)'>('Online Remote');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `MW-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedCode(code);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#111317] border border-[#2d323c] shadow-2xl p-6 md:p-8 my-8 text-zinc-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Corner Cut Accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-[#0b0c0e] border-b border-l border-[#2d323c] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#ff5500]"></div>
        </div>

        {/* Close Button */}
        <button
          id="close-consultation-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-[#1a1d24] transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#22252c] pb-4 mb-6">
          <div className="flex items-center gap-2 text-[#ff5500] font-mono text-xs uppercase tracking-widest mb-1">
            <span className="w-2 h-2 bg-[#ff5500]"></span>
            <span>Intake Protocol • Tier: {defaultTier}</span>
          </div>
          <h2 id="modal-headline" className="font-display text-3xl tracking-wide text-white uppercase">
            {step === 4 ? 'Application Received' : 'Book Personal Training & Coaching'}
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            4 x 1-2-1 session blocks, online coaching, plus nutrition & meal prep guidance — based at Pure Gym Hazel Grove, Stockport.
          </p>

          {/* Stepper Progress */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 h-1 bg-[#1e222a] relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      step >= s ? 'bg-[#ff5500]' : 'bg-transparent'
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 1: Goal & Format */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-2">
                1. Select Primary Athletic Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Weight Loss & Body Recomposition',
                  'Muscle Gain & Hypertrophy',
                  'Strength & 1-2-1 Coaching',
                  'Online Coaching & General Fitness',
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setObjective(item)}
                    className={`p-3 text-left font-mono text-xs border transition-all ${
                      objective === item
                        ? 'border-[#ff5500] bg-[#1a1815] text-white'
                        : 'border-[#22252c] bg-[#15171d] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item}</span>
                      {objective === item && <span className="w-1.5 h-1.5 bg-[#ff5500]"></span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-2">
                2. Coaching Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Online Remote', 'In-Person (Pure Gym Hazel Grove)'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`p-3 text-center font-mono text-xs border transition-all ${
                      format === fmt
                        ? 'border-[#ff5500] bg-[#1a1815] text-white font-bold'
                        : 'border-[#22252c] bg-[#15171d] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3 flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>Continue: Biometrics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Lifting History */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-2">
                Training Age (Barbell Experience)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['< 1 Year', '1-2 Years', '3-5 Years', '5+ Years'].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTrainingAge(yr)}
                    className={`p-2.5 text-center font-mono text-xs border ${
                      trainingAge === yr
                        ? 'border-[#ff5500] bg-[#1a1815] text-white font-bold'
                        : 'border-[#22252c] bg-[#15171d] text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-2">
                Current Estimated 1-Rep Maxes (KG)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Back Squat</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={squat}
                      onChange={(e) => setSquat(e.target.value)}
                      className="w-full bg-[#15171d] border border-[#262930] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
                      placeholder="180"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">kg</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Bench Press</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={bench}
                      onChange={(e) => setBench(e.target.value)}
                      className="w-full bg-[#15171d] border border-[#262930] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
                      placeholder="130"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">kg</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Deadlift</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={deadlift}
                      onChange={(e) => setDeadlift(e.target.value)}
                      className="w-full bg-[#15171d] border border-[#262930] px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
                      placeholder="230"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-2">
                Preferred Lead Coach
              </label>
              <select
                value={preferredCoach}
                onChange={(e) => setPreferredCoach(e.target.value)}
                className="w-full bg-[#15171d] border border-[#262930] px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
              >
                {COACHES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white font-mono text-xs uppercase px-4 py-2 border border-[#262930]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-6 py-3 flex items-center gap-2"
              >
                <span>Continue: Logistics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact & Notes */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="w-full bg-[#15171d] border border-[#262930] px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@domain.com"
                  className="w-full bg-[#15171d] border border-[#262930] px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-1">
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7000 000000"
                  className="w-full bg-[#15171d] border border-[#262930] px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 tracking-wider mb-1">
                Current Limitations, Injuries, or Specific PR Deadlines
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Want to drop 8kg, build muscle over 12 weeks, or need help planning meals around work."
                className="w-full bg-[#15171d] border border-[#262930] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff5500]"
              ></textarea>
            </div>

            <div className="p-3 bg-[#171920] border border-[#222630] flex items-start gap-2.5 text-[11px] font-mono text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
              <span>
                Drop your details below and I'll get back to you with availability and the right package for your goals.
              </span>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-zinc-400 hover:text-white font-mono text-xs uppercase px-4 py-2 border border-[#262930]"
              >
                Back
              </button>
              <button
                type="submit"
                id="submit-consultation-application-btn"
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-7 py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
              >
                <span>Transmit Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Submission Confirmation */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">
                Telemetry Received & Verified
              </div>
              <h3 className="font-display text-2xl text-white uppercase tracking-wider">
                Application Code: <span className="text-[#ff5500]">{submittedCode}</span>
              </h3>
              <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto mt-2">
                Your application has been received. I'll get back to you at <strong className="text-white">{email || 'your email'}</strong> with availability and package options.
              </p>
            </div>

            <div className="bg-[#15171d] border border-[#262930] p-4 text-left font-mono text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-[#20232a] pb-1.5">
                <span className="text-zinc-500">Tier Track:</span>
                <span className="text-white font-medium">{defaultTier}</span>
              </div>
              <div className="flex justify-between border-b border-[#20232a] pb-1.5">
                <span className="text-zinc-500">Objective:</span>
                <span className="text-white font-medium">{objective}</span>
              </div>
              <div className="flex justify-between border-b border-[#20232a] pb-1.5">
                <span className="text-zinc-500">Squat / Bench / Deadlift:</span>
                <span className="text-[#ff5500] font-bold">{squat}kg / {bench}kg / {deadlift}kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Next Action:</span>
                <span className="text-emerald-400">Response via Email / Instagram DM within 24h</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="bg-[#22252e] hover:bg-[#2d313d] text-white font-mono text-xs uppercase px-8 py-3 tracking-wider transition-colors"
              >
                Return to Website
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
