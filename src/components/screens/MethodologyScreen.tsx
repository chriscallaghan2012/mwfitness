import React, { useState } from 'react';
import { IMAGES, METHODOLOGY_PHASES, FAQS } from '../../data/mockData';
import { 
  Compass, 
  Activity, 
  Layers, 
  Maximize2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Gauge,
  Sliders
} from 'lucide-react';

interface MethodologyScreenProps {
  onOpenConsultation: () => void;
}

export const MethodologyScreen: React.FC<MethodologyScreenProps> = ({ onOpenConsultation }) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [activeLift, setActiveLift] = useState<'squat' | 'bench' | 'deadlift'>('squat');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activePhase = METHODOLOGY_PHASES[activePhaseIndex];

  const liftTelemetry = {
    squat: {
      name: 'Competition Low-Bar Squat',
      meanVelocity: '0.44 m/s',
      peakPower: '2,840 Watts',
      barPathDeviation: '±1.2 cm (Vertical Axis)',
      stickingPoint: '2-4 inches above parallel',
      cue: 'Drive traps into the bar out of the hole. Maintain foot tripod rooting to prevent knee valgus shift.'
    },
    bench: {
      name: 'Competition Paused Bench Press',
      meanVelocity: '0.36 m/s',
      peakPower: '1,920 Watts',
      barPathDeviation: 'J-curve trajectory (Optimal)',
      stickingPoint: '1-2 inches off sternum',
      cue: 'Retract and depress scapulae into the bench. Flare elbows slightly past the sticking point toward the rack.'
    },
    deadlift: {
      name: 'Conventional Competition Deadlift',
      meanVelocity: '0.32 m/s',
      peakPower: '3,210 Watts',
      barPathDeviation: '0.8 cm horizontal drift',
      stickingPoint: 'Mid-shin to knee transition',
      cue: 'Pull slack out of the barbell until the plates click. Engage lats to keep the bar pinned against shins.'
    }
  };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.COACHING_PROCESS_HERO}
            alt="Chalked Barbell Platform Methodology"
            className="w-full h-full object-cover object-center filter brightness-60 contrast-125 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e] via-[#0b0c0e]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c0e] via-[#0b0c0e]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ SCIENTIFIC RIGOR & PERIODIZATION ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              THE 4-PHASE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5500] to-white">
                PERIODIZATION PIPELINE.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              Strength is not an accident. We dismantle the compound movements into motor unit recruitment, velocity-loss thresholds, and phase-potentiation mathematics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={onOpenConsultation}
                className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-4 flex items-center gap-3 transition-transform active:scale-95"
              >
                <span>Request Biomechanics Audit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE INTERACTIVE 4-PHASE PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
              [ MACROCYCLE ARCHITECTURE ]
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
              INTERACTIVE 14-WEEK PROGRESSION
            </h2>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            Select a phase to analyze parameters & volume curves
          </div>
        </div>

        {/* Phase Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {METHODOLOGY_PHASES.map((p, idx) => (
            <button
              key={p.phase}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-4 text-left font-mono border transition-all ${
                activePhaseIndex === idx
                  ? 'bg-[#181b24] border-[#ff5500] text-white shadow-[0_0_20px_rgba(255,85,0,0.15)]'
                  : 'bg-[#121419] border-[#22252e] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#ff5500] font-bold">{p.phase}</span>
                <span className="text-[11px] text-zinc-500">{p.duration}</span>
              </div>
              <div className="font-display text-lg uppercase tracking-wide text-white truncate">
                {p.name.split('&')[0]}
              </div>
            </button>
          ))}
        </div>

        {/* Active Phase Card */}
        <div className="bg-[#121419] border border-[#262a34] p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5500]/5 pointer-events-none rounded-full blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#ff5500] uppercase font-bold mb-2">
                  <span>{activePhase.phase}</span>
                  <span>•</span>
                  <span>{activePhase.duration}</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-white uppercase tracking-wide">
                  {activePhase.name}
                </h3>
              </div>

              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                  Primary Neuromuscular Objective
                </div>
                <p className="text-sm font-sans text-zinc-200 leading-relaxed bg-[#171a22] p-4 border-l-2 border-[#ff5500]">
                  {activePhase.objective}
                </p>
              </div>

              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5">
                  Targeted Stimulus & Technical Variables
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activePhase.focus.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-mono text-zinc-300 p-2.5 bg-[#15171d] border border-[#20242e]">
                      <span className="text-[#ff5500] font-bold">›</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Phase Telemetry Sidebar */}
            <div className="lg:col-span-4 bg-[#161820] border border-[#262b36] p-6 space-y-4 font-mono text-xs">
              <div className="text-white font-bold uppercase tracking-wider border-b border-[#222733] pb-2 flex items-center justify-between">
                <span>Phase Metrics</span>
                <Gauge className="w-4 h-4 text-[#ff5500]" />
              </div>

              <div className="space-y-3 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Volume Level:</span>
                  <span className="text-white font-bold">
                    {activePhaseIndex === 0 ? 'HIGH (18-24 sets/wk)' : activePhaseIndex === 1 ? 'MODERATE (12-16 sets/wk)' : activePhaseIndex === 2 ? 'LOW (6-10 sets/wk)' : 'MINIMAL (4 sets/wk)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target Intensity:</span>
                  <span className="text-[#ff5500] font-bold">
                    {activePhaseIndex === 0 ? '68% - 76% 1RM' : activePhaseIndex === 1 ? '80% - 87.5% 1RM' : activePhaseIndex === 2 ? '90% - 97.5% 1RM' : '50% - 60% 1RM'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">RPE Band:</span>
                  <span className="text-white font-bold">
                    {activePhaseIndex === 0 ? 'RPE 6.5 - 7.5' : activePhaseIndex === 1 ? 'RPE 8 - 8.5' : activePhaseIndex === 2 ? 'RPE 8.5 - 9.5' : 'RPE 5 - 6'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Velocity Loss Threshold:</span>
                  <span className="text-emerald-400 font-bold">
                    {activePhaseIndex === 0 ? '25% Loss' : activePhaseIndex === 1 ? '15% Loss' : activePhaseIndex === 2 ? '< 10% Loss' : 'Zero Fatigue Loss'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE BAR PATH & KINEMATICS SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-8">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ BIOMECHANICAL AUDIT SIMULATOR ]
          </div>
          <h2 className="font-display text-4xl text-white uppercase tracking-tight">
            FRAME-BY-FRAME VELOCITY & TRAJECTORY ANALYSIS
          </h2>
        </div>

        <div className="bg-[#121419] border border-[#232732] p-6 md:p-8">
          {/* Lift Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {(['squat', 'bench', 'deadlift'] as const).map((lift) => (
              <button
                key={lift}
                onClick={() => setActiveLift(lift)}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase border transition-all ${
                  activeLift === lift
                    ? 'bg-[#ff5500] text-black border-[#ff5500]'
                    : 'bg-[#16181f] text-zinc-400 border-[#262b36] hover:text-white'
                }`}
              >
                {lift.toUpperCase()} AUDIT
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Vector Simulator */}
            <div className="lg:col-span-5 bg-[#0a0b0e] border border-[#20242e] p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="text-xs font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>Transducer Stream</span>
                <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
              </div>

              {/* Simulated Graph / Bar Vector */}
              <div className="py-12 flex flex-col items-center justify-center relative">
                <div className="w-1 h-44 bg-gradient-to-t from-[#ff5500] to-emerald-400 relative">
                  {/* Sticking point indicator */}
                  <div className="absolute top-1/2 -left-16 right-auto bg-[#ff5500] text-black text-[9px] font-mono font-bold px-1.5 py-0.5 whitespace-nowrap">
                    STICKING POINT
                  </div>
                  {/* Optimal bar path line */}
                  <div className="absolute top-6 -right-2 w-4 h-4 rounded-full border-2 border-emerald-400 animate-ping"></div>
                  <div className="absolute top-6 -right-2 w-4 h-4 rounded-full bg-emerald-400"></div>
                </div>
                <div className="w-48 h-0.5 bg-zinc-700 mt-2"></div>
                <span className="text-[10px] font-mono text-zinc-500 mt-1">CENTER OF MASS / MIDFOOT</span>
              </div>

              <div className="text-[11px] font-mono text-zinc-400 border-t border-[#1a1d24] pt-2 flex justify-between">
                <span>SAMPLE: 120 FPS</span>
                <span>DEVIATION: ±0.4°</span>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-display text-2xl text-white uppercase tracking-wide">
                {liftTelemetry[activeLift].name}
              </h3>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-[#171a22] border border-[#242833]">
                  <span className="text-[10px] text-zinc-500 uppercase block">Mean Concentric Velocity</span>
                  <span className="text-lg font-bold text-emerald-400 font-display">
                    {liftTelemetry[activeLift].meanVelocity}
                  </span>
                </div>
                <div className="p-3.5 bg-[#171a22] border border-[#242833]">
                  <span className="text-[10px] text-zinc-500 uppercase block">Peak Kinetic Power</span>
                  <span className="text-lg font-bold text-white font-display">
                    {liftTelemetry[activeLift].peakPower}
                  </span>
                </div>
                <div className="p-3.5 bg-[#171a22] border border-[#242833]">
                  <span className="text-[10px] text-zinc-500 uppercase block">Horizontal Bar Drift</span>
                  <span className="text-lg font-bold text-zinc-200 font-display">
                    {liftTelemetry[activeLift].barPathDeviation}
                  </span>
                </div>
                <div className="p-3.5 bg-[#171a22] border border-[#242833]">
                  <span className="text-[10px] text-zinc-500 uppercase block">Mechanical Bottleneck</span>
                  <span className="text-xs font-bold text-[#ff5500]">
                    {liftTelemetry[activeLift].stickingPoint}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#181a22] border border-[#262a34]">
                <div className="text-xs font-mono text-[#ff5500] uppercase tracking-wider mb-1 font-bold">
                  Coach Tactical Cue & Biomechanical Remedy
                </div>
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">
                  {liftTelemetry[activeLift].cue}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="border-b border-[#22252e] pb-4 mb-8">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ CLARIFICATION PROTOCOL ]
          </div>
          <h2 className="font-display text-4xl text-white uppercase tracking-tight">
            FREQUENTLY ANSWERED INQUIRIES
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-[#121419] border border-[#22252e] transition-colors">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-mono text-sm text-white hover:text-[#ff5500] transition-colors focus:outline-none"
                >
                  <span className="font-bold">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#ff5500]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-zinc-500" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 font-sans text-xs text-zinc-300 leading-relaxed border-t border-[#1c1f26] pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
