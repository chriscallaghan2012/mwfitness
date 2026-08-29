import React, { useState } from 'react';
import { Calculator, Dumbbell, Flame, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface ToolsScreenProps {
  onOpenConsultation: () => void;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({ onOpenConsultation }) => {
  // 1RM State
  const [weight, setWeight] = useState<number>(140);
  const [reps, setReps] = useState<number>(5);

  // Plate Loader State
  const [targetBarbellWeight, setTargetBarbellWeight] = useState<number>(180);
  const [barWeight, setBarWeight] = useState<number>(20);

  // Macro State
  const [bodyweight, setBodyweight] = useState<number>(85);
  const [goal, setGoal] = useState<'surplus' | 'maintenance' | 'deficit'>('surplus');

  // 1RM Calculation (Epley formula: weight * (1 + reps / 30))
  const estimated1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30));
  const percentages = [
    { pct: 95, rpe: 'RPE 9.5', purpose: 'Peaking Singles' },
    { pct: 90, rpe: 'RPE 9.0', purpose: 'Heavy Over-warm Singles' },
    { pct: 85, rpe: 'RPE 8.0 - 8.5', purpose: 'Intensification Triples' },
    { pct: 80, rpe: 'RPE 7.5 - 8.0', purpose: 'Primary Volume Sets (4-5s)' },
    { pct: 75, rpe: 'RPE 7.0', purpose: 'Accumulation Hypertrophy (6-8s)' },
    { pct: 70, rpe: 'RPE 6.0', purpose: 'Speed / Dynamic Effort Day' },
  ];

  // Plate Loading Algorithm
  const availablePlates = [
    { weight: 25, color: '#dc2626', text: 'white', label: '25kg (Red)' },
    { weight: 20, color: '#2563eb', text: 'white', label: '20kg (Blue)' },
    { weight: 15, color: '#eab308', text: 'black', label: '15kg (Yellow)' },
    { weight: 10, color: '#16a34a', text: 'white', label: '10kg (Green)' },
    { weight: 5, color: '#f3f4f6', text: 'black', label: '5kg (White)' },
    { weight: 2.5, color: '#18181b', text: 'white', label: '2.5kg (Black)' },
    { weight: 1.25, color: '#71717a', text: 'white', label: '1.25kg (Chrome)' }
  ];

  const calculatePlatesPerSide = () => {
    let remainingPerSide = Math.max(0, (targetBarbellWeight - barWeight) / 2);
    const result: { weight: number; color: string; text: string; count: number }[] = [];

    for (const plate of availablePlates) {
      if (remainingPerSide >= plate.weight) {
        const count = Math.floor(remainingPerSide / plate.weight);
        result.push({ ...plate, count });
        remainingPerSide = Number((remainingPerSide - count * plate.weight).toFixed(2));
      }
    }
    return { plates: result, remainder: remainingPerSide };
  };

  const plateBreakdown = calculatePlatesPerSide();

  // Macro Calculation
  const baseKcalPerKg = goal === 'surplus' ? 38 : goal === 'deficit' ? 28 : 33;
  const targetKcal = Math.round(bodyweight * baseKcalPerKg);
  const proteinGrams = Math.round(bodyweight * 2.2); // 2.2g per kg
  const fatGrams = Math.round((targetKcal * 0.25) / 9);
  const carbGrams = Math.round((targetKcal - (proteinGrams * 4 + fatGrams * 9)) / 4);

  return (
    <div className="space-y-16 md:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. HEADER */}
      <div className="border-b border-[#22252e] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e] border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-3">
          <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
          <span>[ ATHLETE TOOLS & TELEMETRY ]</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-white uppercase tracking-tight">
          PERFORMANCE ENGINE & METRICS
        </h1>
        <p className="text-sm font-sans text-zinc-300 max-w-2xl mt-2 leading-relaxed">
          Calibrate your training loads, barbell sleeves, and macronutrient requirements with our high-precision athletic calculators.
        </p>
      </div>

      {/* 2. TOOL 1: 1-REP MAX CALCULATOR */}
      <section className="bg-[#121419] border border-[#242833] p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase font-bold mb-1">
          <Calculator className="w-4 h-4" />
          <span>Tool 01 // Epley 1RM Algorithmic Estimator</span>
        </div>
        <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">
          1-REP MAX & TRAINING INTENSITY ZONES
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-4 space-y-4 font-mono text-xs">
            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Load Lifted (KG)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                className="w-full bg-[#171922] border border-[#282d3b] px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Reps Performed (1 - 10)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={reps}
                onChange={(e) => setReps(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
                className="w-full bg-[#171922] border border-[#282d3b] px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div className="p-4 bg-[#181b24] border border-[#272b38] space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase block">Estimated 1RM</span>
              <div className="text-4xl font-display text-[#ff5500] font-bold">
                {estimated1RM} <span className="text-xl text-white">KG</span>
              </div>
              <span className="text-[11px] text-zinc-400 block pt-1">
                Equivalent to ~{Math.round(estimated1RM * 2.20462)} LBS
              </span>
            </div>
          </div>

          {/* Percentage Bands */}
          <div className="lg:col-span-8">
            <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-2">
              Auto-Regulated Working Load Bands
            </div>
            <div className="space-y-2">
              {percentages.map((p) => {
                const targetLoad = Math.round(estimated1RM * (p.pct / 100));
                return (
                  <div
                    key={p.pct}
                    className="p-3 bg-[#161820] border border-[#20242e] flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#ff5500] font-bold w-12">{p.pct}%</span>
                      <span className="text-white font-bold">{targetLoad} kg</span>
                      <span className="text-zinc-500 hidden sm:inline">({Math.round(targetLoad * 2.20462)} lbs)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400 text-[11px]">{p.purpose}</span>
                      <span className="text-zinc-500 text-[10px] bg-[#1d212b] px-2 py-0.5 border border-[#282d3a]">
                        {p.rpe}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOOL 2: VISUAL BARBELL PLATE LOADING CALCULATOR */}
      <section className="bg-[#121419] border border-[#242833] p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase font-bold mb-1">
          <Dumbbell className="w-4 h-4" />
          <span>Tool 02 // Calibrated Barbell Sleeve Calculator</span>
        </div>
        <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">
          VISUAL COMPETITION PLATE LOADER
        </h2>

        <div className="space-y-6">
          {/* Target Weight Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Target Barbell Total (KG)
              </label>
              <input
                type="number"
                step={2.5}
                value={targetBarbellWeight}
                onChange={(e) => setTargetBarbellWeight(Number(e.target.value) || 0)}
                className="w-full bg-[#171922] border border-[#282d3b] px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Barbell Collar Spec
              </label>
              <select
                value={barWeight}
                onChange={(e) => setBarWeight(Number(e.target.value))}
                className="w-full bg-[#171922] border border-[#282d3b] px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#ff5500]"
              >
                <option value={20}>20 KG // Men's Standard Power Bar</option>
                <option value={15}>15 KG // Women's Olympic Barbell</option>
                <option value={25}>25 KG // Safety Squat Bar / Giant Camber</option>
              </select>
            </div>

            <div className="p-3.5 bg-[#171922] border border-[#252a36] flex flex-col justify-center">
              <span className="text-[10px] text-zinc-500 uppercase">Load Per Sleeve</span>
              <span className="text-2xl font-display text-white font-bold">
                {Math.max(0, (targetBarbellWeight - barWeight) / 2)} KG / SIDE
              </span>
            </div>
          </div>

          {/* Visual Barbell Sleeve Representation */}
          <div className="p-6 bg-[#0a0b0e] border border-[#22252e] overflow-x-auto">
            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-3">
              One Side Barbell Sleeve Loading Order (Inside Out):
            </div>
            
            <div className="flex items-center gap-1.5 min-h-[90px] py-4">
              {/* Bar Shaft */}
              <div className="w-16 h-4 bg-zinc-600 rounded-l border border-zinc-500 flex items-center justify-center text-[9px] font-mono text-zinc-300">
                BAR
              </div>
              {/* Collar stop */}
              <div className="w-4 h-16 bg-zinc-400 border border-zinc-300"></div>

              {/* Plates Rendered */}
              {plateBreakdown.plates.length > 0 ? (
                plateBreakdown.plates.flatMap((p) =>
                  Array.from({ length: p.count }).map((_, idx) => (
                    <div
                      key={`${p.weight}-${idx}`}
                      style={{ backgroundColor: p.color, color: p.text }}
                      className={`h-24 w-6 sm:w-8 border border-black/40 flex flex-col items-center justify-center font-mono text-[9px] font-bold shadow-md`}
                      title={`${p.weight}kg plate`}
                    >
                      <span className="rotate-90 whitespace-nowrap">{p.weight}</span>
                    </div>
                  ))
                )
              ) : (
                <div className="text-zinc-600 font-mono text-xs italic px-4">
                  No plates needed for target weight.
                </div>
              )}

              {/* Bar Sleeve Tip */}
              <div className="w-20 h-5 bg-zinc-700 rounded-r border border-zinc-600 flex items-center justify-center text-[9px] font-mono text-zinc-400">
                COLLAR
              </div>
            </div>

            {/* Plate Count Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#1a1d24] font-mono text-xs">
              {plateBreakdown.plates.map((p) => (
                <div key={p.weight} className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }}></span>
                  <span>{p.count}x {p.weight}kg</span>
                </div>
              ))}
              {plateBreakdown.remainder > 0 && (
                <span className="text-[#ff5500] text-xs font-bold">
                  (Remainder: {plateBreakdown.remainder * 2}kg total required)
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOOL 3: CALORIC & MACRO TARGET CALCULATOR */}
      <section className="bg-[#121419] border border-[#242833] p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#ff5500] uppercase font-bold mb-1">
          <Flame className="w-4 h-4" />
          <span>Tool 03 // Biomechanical Fueling Matrix</span>
        </div>
        <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-6">
          MACRONUTRIENT & CALORIC REQUIREMENTS
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4 font-mono text-xs">
            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Current Athlete Bodyweight (KG)
              </label>
              <input
                type="number"
                value={bodyweight}
                onChange={(e) => setBodyweight(Number(e.target.value) || 1)}
                className="w-full bg-[#171922] border border-[#282d3b] px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-zinc-400 uppercase tracking-wider block mb-1.5">
                Training Phase Goal
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'surplus', label: 'Hypertrophy Massing (+15% Surplus)' },
                  { id: 'maintenance', label: 'Strength Peaking / Maintenance' },
                  { id: 'deficit', label: 'Competition Weight Cut (-15% Deficit)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id as any)}
                    className={`p-2.5 text-left font-mono text-xs border transition-all ${
                      goal === item.id
                        ? 'border-[#ff5500] bg-[#1a1815] text-white font-bold'
                        : 'border-[#242833] bg-[#15171e] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#161820] border border-[#242833] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Daily Caloric Target</span>
                <div className="font-display text-4xl text-white font-bold mt-1">
                  {targetKcal}
                </div>
                <span className="text-[11px] font-mono text-[#ff5500] uppercase block mt-1">
                  Kcal / Day
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-4 pt-3 border-t border-[#1e222b]">
                Energy floor to sustain heavy central nervous system firing.
              </p>
            </div>

            <div className="p-5 bg-[#161820] border border-[#242833] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Protein Floor (2.2g/kg)</span>
                <div className="font-display text-4xl text-emerald-400 font-bold mt-1">
                  {proteinGrams}g
                </div>
                <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                  ~{proteinGrams * 4} Kcal ({Math.round(((proteinGrams * 4) / targetKcal) * 100)}%)
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-4 pt-3 border-t border-[#1e222b]">
                Maximize muscle protein synthesis & microtrauma repair.
              </p>
            </div>

            <div className="p-5 bg-[#161820] border border-[#242833] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Carbohydrates & Fats</span>
                <div className="font-display text-4xl text-white font-bold mt-1">
                  {carbGrams}g <span className="text-xl text-zinc-400">/ {fatGrams}g</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                  Carbs // Fats
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-4 pt-3 border-t border-[#1e222b]">
                Consume 50% of carbs peri-workout (60-90m pre & post training).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. READY FOR A BESPOKE PROTOCOL? */}
      <section className="bg-[#121419] border border-[#242833] p-8 text-center space-y-4">
        <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-wide">
          WANT THESE CALCULATIONS APPLIED DIRECTLY TO YOUR PROTOCOL?
        </h2>
        <p className="text-xs font-mono text-zinc-400 max-w-xl mx-auto">
          Our coaching staff manages all load auto-regulation, microcycle wave loading, and nutrition targets directly for you.
        </p>
        <button
          onClick={onOpenConsultation}
          className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-8 py-3.5 tracking-wider transition-all inline-flex items-center gap-2"
        >
          <span>Commence Athlete Application</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
