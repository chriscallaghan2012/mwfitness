import React, { useState } from 'react';
import { IMAGES } from '../../data/mockData';
import { 
  Smartphone, 
  Video, 
  TrendingUp, 
  MessageSquare, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface OnlineCoachingScreenProps {
  onOpenConsultation: (tier?: string) => void;
}

export const OnlineCoachingScreen: React.FC<OnlineCoachingScreenProps> = ({ onOpenConsultation }) => {
  const [selectedDay, setSelectedDay] = useState<'MON' | 'WED' | 'FRI' | 'SAT'>('MON');

  const sampleMicrocycle = {
    MON: {
      title: 'Day 01 // Squat Accumulation & Knee Flexion',
      volume: '14,250 kg Total Load',
      exercises: [
        { name: 'Competition Low-Bar Squat', sets: '5 sets x 4 reps @ 80% (205kg)', notes: 'Focus on aggressive hip hinge and external rotation at bottom pause' },
        { name: 'Pause Squat (2-sec in hole)', sets: '3 sets x 3 reps @ 70% (180kg)', notes: 'Zero bounce. Maintain thoracic tightness.' },
        { name: 'Barbell Bulgarian Split Squat', sets: '3 sets x 8 reps per leg', notes: 'RPE 8. Knee tracking over 2nd toe.' },
        { name: 'Hanging Leg Raises + GHD Sit-ups', sets: '4 sets x 15 reps', notes: 'Bracing under spinal extension.' }
      ]
    },
    WED: {
      title: 'Day 02 // Bench Press Intensification & Scapular Drive',
      volume: '9,800 kg Total Load',
      exercises: [
        { name: 'Competition Paused Bench Press', sets: '4 sets x 3 reps @ 85% (150kg)', notes: 'Full competition pause on sternum. Drive heels through floor.' },
        { name: 'Close-Grip Incline Bench', sets: '3 sets x 6 reps @ 75% (125kg)', notes: 'Triceps overload. Bar touches upper clavicle.' },
        { name: 'Pendlay Barbell Rows', sets: '4 sets x 8 reps (110kg)', notes: 'Strict dead stop from the floor on every rep.' },
        { name: 'Face Pulls with Band & Cable Tricep Ext', sets: '4 sets x 15-20 reps', notes: 'Rear delt and elbow joint lubrication.' }
      ]
    },
    FRI: {
      title: 'Day 03 // Deadlift Neurological Drive & Rate of Force',
      volume: '16,500 kg Total Load',
      exercises: [
        { name: 'Conventional Deadlift (Top Single + Back-offs)', sets: '1x1 @ 90% (270kg) + 4x3 @ 80% (240kg)', notes: 'Wedge hips tight. Pull slack out of barbell before drive.' },
        { name: 'Deficit Deadlifts (2-inch block)', sets: '3 sets x 4 reps @ 72.5% (215kg)', notes: 'Quad drive off the floor. Do not round lumbar.' },
        { name: 'Barbell Romanian Deadlifts (RDL)', sets: '3 sets x 8 reps @ RPE 7.5 (160kg)', notes: 'Hamstrings loaded to maximum stretch threshold.' },
        { name: 'Heavy Barbell Shrugs & Farmer Holds', sets: '3 sets x 45-sec timed carry', notes: 'Trap bar loaded to 200kg.' }
      ]
    },
    SAT: {
      title: 'Day 04 // Work Capacity, Sled Conditioning & Grip',
      volume: 'High Aerobic & Lactic Flux',
      exercises: [
        { name: 'Rogue Dog Sled Push (40m turf)', sets: '8 rounds x 40m with 120kg on sled', notes: 'Sprint drive. Rest 90 seconds between rounds.' },
        { name: 'Kettlebell Clean & Press Complex', sets: '5 sets x 5 reps (double 28kg bells)', notes: 'Explosive hip snap. Solid lockout overhead.' },
        { name: 'Concept2 SkiErg Sprint Intervals', sets: '10 rounds x 250m @ sub-1:40 pace', notes: 'Lactate threshold buffering.' },
        { name: 'Thoracic & Hip Mobility Flow', sets: '15 minutes static & dynamic decompress', notes: 'Full recovery protocol.' }
      ]
    }
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.ONLINE_COACHING_GYM}
            alt="MWFITNESS Online Remote Training Facility"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-emerald-500/60 text-xs font-mono text-emerald-400 uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse"></span>
              <span>[ REMOTE HIGH PERFORMANCE ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              COACHED ANYWHERE. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-emerald-400">
                ZERO COMPROMISE.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Full coaching wherever you train. Individual programmes built around your goals, equipment and schedule — with nutritional advice and meal prep guidance to match.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onOpenConsultation('Gold')}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>Join Online Roster</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-xs font-mono text-zinc-400 px-4 py-2 bg-[#121418]/80 border border-[#232732]">
                Weekly check-ins • Programmes & nutrition included
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 4-STEP REMOTE CYCLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ OPERATIONAL CYCLE ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            HOW REMOTE COACHING WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121419] border border-[#22252e] p-6 relative">
            <div className="font-mono text-xs text-[#ff5500] font-bold mb-2">STEP 01 // ONBOARDING</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              Comprehensive Biomechanics Screen
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              You upload videos of your current squat, bench, and deadlift from 3 specific camera angles. We measure joint kinematics, lever lengths, and mobility limitations.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#22252e] p-6 relative">
            <div className="font-mono text-xs text-[#ff5500] font-bold mb-2">STEP 02 // PROGRAMMING</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              Bespoke Weekly Microcycle
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Every Sunday, your training protocol arrives in the MWFITNESS App with exact target weights, rep ranges, RPE targets, and tempo directives for each session.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#22252e] p-6 relative">
            <div className="font-mono text-xs text-[#ff5500] font-bold mb-2">STEP 03 // EXECUTION</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              Direct Video Feedback
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Upload top working sets directly within the app. Your coach returns audio/video commentary with telestrator drawings analyzing bar path and speed.
            </p>
          </div>

          <div className="bg-[#121419] border border-[#22252e] p-6 relative">
            <div className="font-mono text-xs text-[#ff5500] font-bold mb-2">STEP 04 // ADAPTATION</div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              Biometric Calibration
            </h3>
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Weekly audit of recovery readiness, resting heart rate, sleep quality, and bodyweight curves. Training volume is auto-regulated to prevent overtraining.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE MWFITNESS APP ECOSYSTEM WITH MOCKUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121419] border border-[#242833] p-8 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Description & Tech specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase tracking-widest">
                <Smartphone className="w-4 h-4 text-[#ff5500]" />
                <span>Proprietary Companion Technology</span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight leading-none">
                THE MWFITNESS TELEMETRY APP
              </h2>

              <p className="text-sm font-sans text-zinc-300 leading-relaxed">
                All programming is delivered through a simple tracking sheet you'll actually use — clear set-by-set instructions, video check-in feedback and weekly updates. No messy spreadsheets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3.5 bg-[#171a22] border border-[#222631] space-y-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-[#ff5500]" />
                    <span>In-App Video Auditing</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Upload sets directly from your camera roll. Receive voiceover feedback with bar-path tracking lines.
                  </p>
                </div>

                <div className="p-3.5 bg-[#171a22] border border-[#222631] space-y-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#ff5500]" />
                    <span>RPE / 1RM Auto-Regulator</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Input your weights and RPE; the algorithm recalculates back-off sets dynamically in real time.
                  </p>
                </div>

                <div className="p-3.5 bg-[#171a22] border border-[#222631] space-y-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#ff5500]" />
                    <span>CNS Readiness Tracking</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Daily HRV, sleep score, and soreness survey dictates volume adjustments before you touch a barbell.
                  </p>
                </div>

                <div className="p-3.5 bg-[#171a22] border border-[#222631] space-y-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ff5500]" />
                    <span>Direct Coach Comms</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Dedicated 1-on-1 direct messaging channel with guaranteed sub-6 hour response windows.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  Available natively on iOS and Android with offline workout logging capability.
                </span>
              </div>
            </div>

            {/* Right: Phone Mockup Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-[340px] w-full p-2 bg-[#1b1e26] border border-[#363c4a] shadow-2xl rounded-2xl">
                <img
                  src={IMAGES.APP_MOCKUP_PHONE}
                  alt="MWFITNESS Companion App Interface"
                  className="w-full h-auto rounded-xl object-cover filter contrast-110"
                />
                <div className="absolute -bottom-3 -right-3 bg-[#ff5500] text-black font-mono font-bold text-[10px] uppercase px-3 py-1 shadow-lg">
                  LIVE APP SYNC
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SAMPLE LIVE MICROCYCLE PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border-b border-[#22252e] pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ SAMPLE MICROCYCLE ]
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">
              INTERACTIVE TRAINING SHEET PREVIEW
            </h2>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2">
            {(['MON', 'WED', 'FRI', 'SAT'] as const).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold uppercase border transition-all ${
                  selectedDay === day
                    ? 'bg-[#ff5500] text-black border-[#ff5500]'
                    : 'bg-[#15171d] text-zinc-400 border-[#262a33] hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day View */}
        <div className="bg-[#121419] border border-[#232732] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#1c1f26] gap-2">
            <div>
              <span className="text-xs font-mono text-[#ff5500] uppercase font-bold">
                {sampleMicrocycle[selectedDay].volume}
              </span>
              <h3 className="font-display text-2xl text-white uppercase tracking-wide">
                {sampleMicrocycle[selectedDay].title}
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-[#191c24] px-3 py-1 border border-[#242833]">
              BLOCK 02: INTENSIFICATION
            </span>
          </div>

          <div className="space-y-3">
            {sampleMicrocycle[selectedDay].exercises.map((ex, i) => (
              <div
                key={i}
                className="p-4 bg-[#16181f] border border-[#21242d] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="text-sm text-white font-bold font-mono">
                    0{i + 1}. {ex.name}
                  </div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Coach Directive: {ex.notes}
                  </div>
                </div>
                <div className="text-[#ff5500] font-bold text-xs bg-[#1f222b] px-3 py-1.5 border border-[#2b303d] shrink-0">
                  {ex.sets}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
