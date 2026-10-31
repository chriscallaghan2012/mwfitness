// demoData.ts — Fully populated in-memory dataset for Staff HQ demo mode.
// Row shapes mirror the live Neon tables the staff HQ components read and write,
// so demo mode runs the exact same components and queries as live mode.
// All dates are generated relative to "now" so the history always looks recent.
// Nothing here ever touches Neon: writes stay in memory for the browser session.
export type DemoRow = Record<string, any>;
export type DemoTables = Record<string, DemoRow[]>;

const DAY_MS = 86_400_000;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const isoTime = (date: Date) => date.toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);
const daysAhead = (days: number) => new Date(Date.now() + days * DAY_MS);

/** Deterministic pseudo-random generator so the demo history is stable per seed. */
function makeRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

const round1 = (value: number) => Math.round(value * 10) / 10;
const between = (rng: () => number, min: number, max: number) => min + rng() * (max - min);

/** Small branded SVG stand-in for private progress photos (valid data URI image). */
function demoPhotoDataUri(label: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="480" height="640" fill="url(#g)"/><text x="240" y="300" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle">${label}</text><text x="240" y="345" font-family="Arial, sans-serif" font-size="16" fill="#ffd9bd" text-anchor="middle">DEMO PROGRESS PHOTO</text></svg>`;
  return `data:image/svg+xml;base64,${typeof btoa === 'function' ? btoa(svg) : Buffer.from(svg).toString('base64')}`;
}

const MEAL_SECTION = (name: string, calories: number, protein: number, carbs: number, fats: number) =>
  ({ title: name, items: [{ name, calories, protein, carbs, fats }] });

export function createDemoTables(): DemoTables {
  const tables: DemoTables = {
    profiles: [
      {
        id: 'demo-coach-mike', full_name: 'Mike Whitworth', email: 'mwfitnessukonline@gmail.com',
        role: 'admin', member_tier: 'Coach', coach_name: 'Mike Whitworth', coach_role: 'Head coach',
        start_weight: null, current_weight: null, goal_weight: null,
        since: isoDate(daysAgo(400)), created_at: isoTime(daysAgo(400)),
      },
    ],
    plans: [
      { id: 'pt-single', name: 'Single PT session', tag: 'Pay as you go', price: 45, original_price: null, badge: null, is_popular: false, description: 'One-to-one personal training session, online or in person.', cta_text: 'Book a session', features: ['60-minute session', 'Tailored session plan', 'Progress notes'], kind: 'pt', active: true },
      { id: 'pt-block-4', name: 'PT block of 4', tag: 'Four sessions', price: 160, original_price: 180, badge: 'Save £20', is_popular: false, description: 'Four personal training sessions with a plan between visits.', cta_text: 'Start PT', features: ['4 × 60-minute sessions', 'Weekly plan', 'Message support'], kind: 'pt', active: true },
      { id: 'online-standard', name: 'Online coaching — Standard', tag: 'Monthly coaching', price: 65, original_price: null, badge: null, is_popular: false, description: 'Training and nutrition coaching delivered through the member app with weekly check-ins.', cta_text: 'Start coaching', features: ['Custom training plan', 'Nutrition targets', 'Weekly check-in', 'App access'], kind: 'online', active: true },
      { id: 'online-premium', name: 'Online coaching — Premium', tag: 'Weekly support', price: 95, original_price: null, badge: 'Most popular', is_popular: true, description: 'Everything in Standard plus plan revisions, video feedback and priority messaging.', cta_text: 'Start premium', features: ['Everything in Standard', 'Weekly plan revisions', 'Video form feedback', 'Priority messaging'], kind: 'online', active: true },
      { id: 'online-elite', name: 'Online coaching — Elite', tag: 'Full service', price: 150, original_price: null, badge: null, is_popular: false, description: 'The full coaching service with call reviews and competition prep support.', cta_text: 'Enquire now', features: ['Everything in Premium', 'Fortnightly calls', 'Contest / event prep', 'Direct daily support'], kind: 'online', active: true },
    ],
    memberships: [],
    nutrition_templates: [
      {
        id: 'tpl-cutting', name: 'High-protein cutting', description: 'Calorie-controlled high-protein plan for fat loss phases.',
        day_type: 'training', active: true, created_at: isoTime(daysAgo(120)),
        targets: { calories: 2100, protein: 170, carbs: 180, fats: 60, water_ml: 3500 },
        sections: [MEAL_SECTION('Breakfast', 450, 35, 45, 12), MEAL_SECTION('Lunch', 600, 45, 55, 18), MEAL_SECTION('Dinner', 700, 55, 60, 20), MEAL_SECTION('Snack', 350, 35, 20, 10)],
      },
      {
        id: 'tpl-lean-bulk', name: 'Lean bulk', description: 'Slight surplus with protein targets for muscle gain.',
        day_type: 'training', active: true, created_at: isoTime(daysAgo(120)),
        targets: { calories: 2900, protein: 190, carbs: 330, fats: 80, water_ml: 3500 },
        sections: [MEAL_SECTION('Breakfast', 700, 45, 80, 22), MEAL_SECTION('Lunch', 850, 60, 95, 24), MEAL_SECTION('Dinner', 950, 70, 100, 26), MEAL_SECTION('Shake', 400, 40, 55, 8)],
      },
      {
        id: 'tpl-maintenance', name: 'Busy-person maintenance', description: 'Simple maintenance plan built around a packed schedule.',
        day_type: 'non_training', active: true, created_at: isoTime(daysAgo(120)),
        targets: { calories: 2400, protein: 160, carbs: 250, fats: 75, water_ml: 3000 },
        sections: [MEAL_SECTION('Breakfast', 550, 40, 55, 16), MEAL_SECTION('Lunch', 750, 55, 70, 22), MEAL_SECTION('Dinner', 850, 55, 80, 25)],
      },
    ],
    nutrition_plans: [],
    workout_templates: [
      { id: 'wt-upper-a', name: 'Upper body A', description: 'Horizontal press focus with rowing accessories.', days_per_week: null, plan_id: null, created_at: isoTime(daysAgo(150)) },
      { id: 'wt-lower-a', name: 'Lower body A', description: 'Squat pattern with hamstring and calf accessories.', days_per_week: null, plan_id: null, created_at: isoTime(daysAgo(150)) },
      { id: 'wt-pull-day', name: 'Pull day', description: 'Vertical and horizontal pulling with rear delt work.', days_per_week: null, plan_id: null, created_at: isoTime(daysAgo(150)) },
      { id: 'wt-push-day', name: 'Push day', description: 'Overhead and incline pressing with triceps finishers.', days_per_week: null, plan_id: null, created_at: isoTime(daysAgo(150)) },
      { id: 'wt-full-body-express', name: 'Full body express', description: '30-minute full body session for busy weeks.', days_per_week: 3, plan_id: 'online-standard', created_at: isoTime(daysAgo(150)) },
      { id: 'wt-starter-hypertrophy', name: 'Hypertrophy session · starter', description: 'Starter template using the five exercise movements from the mobile workout preview.', days_per_week: 1, plan_id: null, created_at: isoTime(daysAgo(1)) },
    ],
    workout_exercises: [
      { id: 'we-bench', name: 'Barbell Bench Press', category: 'Chest', description: 'Horizontal barbell press.', coach_cues: 'Set the shoulder blades before the lift.', result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }], default_prescription: { sets: 4, reps: '6-8' }, sort_order: 10, active: true },
      { id: 'we-incline', name: 'Incline Dumbbell Press', category: 'Chest', description: 'Incline dumbbell press.', coach_cues: 'Use a controlled lowering phase.', result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }], default_prescription: { sets: 3, reps: '8-10' }, sort_order: 20, active: true },
      { id: 'we-row', name: 'Chest Supported T-Bar Row', category: 'Back', description: 'Chest-supported horizontal row.', coach_cues: 'Keep the chest supported throughout.', result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }], default_prescription: { sets: 4, reps: '10-12' }, sort_order: 30, active: true },
      { id: 'we-lateral', name: 'Standing Dumbbell Lateral Raise', category: 'Shoulders', description: 'Dumbbell lateral raise.', coach_cues: 'Raise under control without swinging.', result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }], default_prescription: { sets: 4, reps: '15' }, sort_order: 40, active: true },
      { id: 'we-rope', name: 'Overhead Rope Extension', category: 'Arms', description: 'Overhead cable triceps extension.', coach_cues: 'Keep the upper arms steady.', result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }], default_prescription: { sets: 3, reps: '12-15' }, sort_order: 50, active: true },
    ],
    workout_template_exercises: [
      { id: 'wte-upper-bench', template_id: 'wt-upper-a', exercise_id: 'we-bench', exercise_name: 'Barbell Bench Press', day_number: 1, sort_order: 10, prescription: { sets: 4, reps: '6-8' }, result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }] },
      { id: 'wte-upper-row', template_id: 'wt-upper-a', exercise_id: 'we-row', exercise_name: 'Chest Supported T-Bar Row', day_number: 1, sort_order: 20, prescription: { sets: 4, reps: '10-12' }, result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }] },
      { id: 'wte-push-lateral', template_id: 'wt-push-day', exercise_id: 'we-lateral', exercise_name: 'Standing Dumbbell Lateral Raise', day_number: 1, sort_order: 30, prescription: { sets: 4, reps: '15' }, result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }] },
      { id: 'wte-push-rope', template_id: 'wt-push-day', exercise_id: 'we-rope', exercise_name: 'Overhead Rope Extension', day_number: 1, sort_order: 40, prescription: { sets: 3, reps: '12-15' }, result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }] },
      ...[
        ['we-bench', 'Barbell Bench Press', { sets: 4, reps: '6-8' }],
        ['we-incline', 'Incline Dumbbell Press', { sets: 4, reps: '8-10' }],
        ['we-row', 'Chest Supported T-Bar Row', { sets: 4, reps: '10-12' }],
        ['we-lateral', 'Standing Dumbbell Lateral Raise', { sets: 4, reps: '15' }],
        ['we-rope', 'Overhead Rope Extension', { sets: 3, reps: '12-15' }],
      ].map(([exerciseId, exerciseName, prescribed], index) => ({
        id: `wte-starter-${index + 1}`, template_id: 'wt-starter-hypertrophy', exercise_id: exerciseId,
        exercise_name: exerciseName, day_number: 1, sort_order: (index + 1) * 10, prescription: prescribed,
        result_fields: [{ key: 'sets', label: 'Sets', type: 'number' }, { key: 'reps', label: 'Reps', type: 'number' }, { key: 'load', label: 'Load', type: 'number', unit: 'kg' }],
      })),
    ],
    workout_schedules: [],
    workout_sessions: [],
    checkins: [],
    progress_logs: [],
    nutrition_logs: [],
    nutrition_daily_logs: [],
    daily_metrics: [],
    cardio_logs: [],
    supplement_plans: [],
    coach_messages: [],
    progress_photos: [],
    coaching_programmes: [
      { id: 'prog-foundation', name: 'Foundation Strength · 8 weeks', description: 'Build strength on the big four lifts with simple progression.', duration_weeks: 8, days_per_week: 3, level: 'Beginner to intermediate', active: true, created_at: isoTime(daysAgo(90)) },
      { id: 'prog-fat-loss', name: 'Fat Loss Accelerator · 12 weeks', description: 'Training plus habit coaching for sustainable fat loss.', duration_weeks: 12, days_per_week: 4, level: 'All levels', active: true, created_at: isoTime(daysAgo(90)) },
      { id: 'prog-onboarding', name: 'App onboarding · 2 weeks', description: 'Get comfortable with check-ins, logging and weekly targets.', duration_weeks: 2, days_per_week: 2, level: 'Complete beginner', active: true, created_at: isoTime(daysAgo(90)) },
    ],
    coaching_programme_assignments: [],
    website_leads: [],
    communication_templates: [],
    communication_automation_rules: [],
    communication_events: [],
    coaching_videos: [
      { id: 'vid-squat', title: 'Squat setup in 60 seconds', description: 'Bracing, bar position and depth cues.', category: 'Technique', video_url: 'https://videos.mwfitnessuk.example/squat-setup.mp4', thumbnail_url: null, duration_seconds: 64, level: 'All levels', active: true, created_at: isoTime(daysAgo(40)) },
      { id: 'vid-hinge', title: 'Deadlift hinge pattern', description: 'How to hinge without rounding the lower back.', category: 'Technique', video_url: 'https://videos.mwfitnessuk.example/deadlift-hinge.mp4', thumbnail_url: null, duration_seconds: 96, level: 'All levels', active: true, created_at: isoTime(daysAgo(40)) },
      { id: 'vid-warmup', title: '5-minute warm-up', description: 'The warm-up routine to run before every session.', category: 'Preparation', video_url: 'https://videos.mwfitnessuk.example/warmup.mp4', thumbnail_url: null, duration_seconds: 305, level: 'All levels', active: true, created_at: isoTime(daysAgo(35)) },
      { id: 'vid-protein', title: 'Protein made simple', description: 'Working out protein targets without weighing everything.', category: 'Nutrition', video_url: 'https://videos.mwfitnessuk.example/protein.mp4', thumbnail_url: null, duration_seconds: 180, level: 'All levels', active: true, created_at: isoTime(daysAgo(28)) },
      { id: 'vid-steps', title: 'Why steps matter', description: 'NEAT, step targets and weekly cardio.', category: 'Habits', video_url: 'https://videos.mwfitnessuk.example/steps.mp4', thumbnail_url: null, duration_seconds: 142, level: 'All levels', active: false, created_at: isoTime(daysAgo(21)) },
      { id: 'vid-checkin', title: 'How to complete your weekly check-in', description: 'Getting the most out of your Sunday check-in.', category: 'App help', video_url: 'https://videos.mwfitnessuk.example/checkin.mp4', thumbnail_url: null, duration_seconds: 210, level: 'All levels', active: true, created_at: isoTime(daysAgo(14)) },
    ],
    swag_products: [
      { id: 'swag-tee', slug: 'mw-logo-tee', name: 'MW logo tee', description: 'Heavyweight cotton tee with chest MW logo.', category: 'apparel', price: 24, compare_at_price: null, image_url: '', product_url: 'https://instagram.com/shwag-mcr26', sizes: ['S', 'M', 'L', 'XL'], stock_status: 'available', active: true, sort_order: 10, updated_at: isoTime(daysAgo(10)) },
      { id: 'swag-hoodie', slug: 'mw-classic-hoodie', name: 'MW classic hoodie', description: 'Midweight hoodie with back print.', category: 'apparel', price: 42, compare_at_price: 50, image_url: '', product_url: 'https://instagram.com/shwag-mcr26', sizes: ['M', 'L', 'XL'], stock_status: 'available', active: true, sort_order: 20, updated_at: isoTime(daysAgo(10)) },
      { id: 'swag-shaker', slug: 'mw-shaker', name: 'MW shaker bottle', description: '700ml shaker with mixing grid.', category: 'accessories', price: 12, compare_at_price: null, image_url: '', product_url: 'https://instagram.com/shwag-mcr26', sizes: [], stock_status: 'available', active: true, sort_order: 30, updated_at: isoTime(daysAgo(8)) },
      { id: 'swag-cap', slug: 'mw-cap', name: 'MW cap', description: 'Structured cap with embroidered logo.', category: 'accessories', price: 18, compare_at_price: null, image_url: '', product_url: 'https://instagram.com/shwag-mcr26', sizes: [], stock_status: 'enquiry_only', active: false, sort_order: 40, updated_at: isoTime(daysAgo(6)) },
    ],
  };

  const members = [
    {
      id: 'demo-alex', name: 'Alex Morgan', email: 'alex@example.test', tier: 'Gold',
      start: 86.4, current: 81.6, goal: 78, sinceDays: 77, trainingDays: [1, 3, 5],
      kcal: 2250, protein: 165, steps: 9000, cardioPerWeek: 2,
    },
    {
      id: 'demo-jamie', name: 'Jamie Reed', email: 'jamie@example.test', tier: 'Online',
      start: 94, current: 91.2, goal: 85, sinceDays: 99, trainingDays: [2, 4, 6],
      kcal: 2400, protein: 170, steps: 8000, cardioPerWeek: 3,
    },
    {
      id: 'demo-taylor', name: 'Taylor Brooks', email: 'taylor@example.test', tier: 'Starter',
      start: 78, current: 76.8, goal: 70, sinceDays: 24, trainingDays: [1, 4],
      kcal: 1950, protein: 140, steps: 7000, cardioPerWeek: 1,
    },
    {
      id: 'demo-morgan', name: 'Morgan Ellis', email: 'morgan@example.test', tier: 'Elite',
      start: 73, current: 74.1, goal: 78, sinceDays: 91, trainingDays: [1, 2, 4, 5],
      kcal: 2900, protein: 190, steps: 10000, cardioPerWeek: 2,
    },
  ];
  const insert = (table: string, row: DemoRow) => { tables[table].push(row); return row; };
  let surrogate = 0;
  const uid = (table: string) => `demo-${table}-${++surrogate}`;

  for (const member of members) {
    const memberRng = makeRng(member.name.length * 7919 + member.sinceDays);
    const since = isoDate(daysAgo(member.sinceDays));
    const tierPlan = member.tier === 'Gold' ? 'online-premium' : member.tier === 'Elite' ? 'online-elite' : 'online-standard';

    insert('profiles', {
      id: member.id, full_name: member.name, email: member.email, role: 'athlete', member_tier: member.tier,
      coach_name: 'Mike Whitworth', coach_role: 'Head coach',
      start_weight: member.start, current_weight: member.current, goal_weight: member.goal,
      since, created_at: `${since}T08:00:00.000Z`,
    });
    insert('memberships', {
      id: uid('memberships'), profile_id: member.id, plan_id: tierPlan, status: 'active',
      created_at: `${since}T08:05:00.000Z`,
    });
    // Taylor started with a pay-as-you-go trial that lapsed before joining the app plan.
    if (member.id === 'demo-taylor') {
      insert('memberships', { id: uid('memberships'), profile_id: member.id, plan_id: 'pt-single', status: 'canceled', created_at: isoTime(daysAgo(60)) });
    }

    const templateId = member.id === 'demo-morgan' ? 'tpl-lean-bulk' : member.tier === 'Starter' ? 'tpl-maintenance' : 'tpl-cutting';
    const tplRow = tables.nutrition_templates.find((row) => row.id === templateId)!;
    insert('nutrition_plans', {
      id: uid('nutrition_plans'), profile_id: member.id, name: tplRow.name, description: tplRow.description,
      day_type: 'training', targets: { ...tplRow.targets }, sections: tplRow.sections, active: true,
      created_at: `${since}T08:10:00.000Z`,
    });
    insert('nutrition_plans', {
      id: uid('nutrition_plans'), profile_id: member.id, name: 'Rest-day targets', description: 'Non-training day targets from the first plan review.',
      day_type: 'non_training', targets: { calories: tplRow.targets.calories - 300, protein: tplRow.targets.protein, carbs: tplRow.targets.carbs - 60, fats: tplRow.targets.fats, water_ml: 3000 },
      sections: [MEAL_SECTION('Breakfast', 420, 35, 40, 12), MEAL_SECTION('Lunch', 560, 45, 45, 18), MEAL_SECTION('Dinner', 720, 55, 50, 22)],
      active: member.id !== 'demo-taylor', created_at: isoTime(daysAgo(Math.min(60, member.sinceDays - 1))),
    });

    insert('supplement_plans', { id: uid('supplement_plans'), profile_id: member.id, name: 'Creatine monohydrate', dosage_string: '5 g', timing: 'WITH_MEAL', active: true, created_at: isoTime(daysAgo(Math.min(60, member.sinceDays))) });
    insert('supplement_plans', { id: uid('supplement_plans'), profile_id: member.id, name: 'Vitamin D3', dosage_string: '25 µg daily', timing: 'AM', active: true, created_at: isoTime(daysAgo(Math.min(60, member.sinceDays))) });
    if (member.tier === 'Gold' || member.tier === 'Elite') {
      insert('supplement_plans', { id: uid('supplement_plans'), profile_id: member.id, name: 'Omega-3', dosage_string: '1 g with food', timing: 'with_meal', active: true, created_at: isoTime(daysAgo(Math.min(45, member.sinceDays))) });
    }
    const cardios = ['Incline walk', 'Run', 'Cycle', 'Rowing machine', 'Stair climber'];

    for (let offset = member.sinceDays; offset >= 0; offset--) {
      const date = daysAgo(offset);
      const dateStr = isoDate(date);
      const weekday = date.getDay();
      const training = member.trainingDays.includes(weekday);
      const progressFactor = offset / member.sinceDays;
      const weight = round1(member.current + (member.start - member.current) * progressFactor + between(memberRng, -0.4, 0.4));
      const calorieSwing = training ? between(memberRng, -80, 180) : between(memberRng, -180, 80);

      insert('nutrition_logs', {
        id: uid('nutrition_logs'), profile_id: member.id, logged_on: dateStr,
        calories: Math.round(member.kcal + calorieSwing),
        protein_grams: Math.round(member.protein + between(memberRng, -12, 15)),
        water_liters: round1(between(memberRng, 2.2, 3.8)),
        created_at: `${dateStr}T20:30:00.000Z`,
      });
      insert('nutrition_daily_logs', {
        id: uid('nutrition_daily_logs'), profile_id: member.id, log_date: dateStr, day_type: training ? 'training' : 'non_training',
        completed_day: memberRng() > 0.12,
        completed_meal_ids: training ? ['breakfast', 'lunch', 'dinner', 'snack'] : ['breakfast', 'lunch', 'dinner'],
        created_at: `${dateStr}T20:35:00.000Z`,
      });
      insert('daily_metrics', {
        id: uid('daily_metrics'), profile_id: member.id, metric_date: dateStr,
        water_litres: round1(between(memberRng, 1.8, 3.6)),
        steps: Math.round(between(memberRng, member.steps * 0.55, member.steps * 1.35) / 100) * 100,
        created_at: `${dateStr}T21:00:00.000Z`,
      });

      if (training && offset > 0) {
        const templatesForDay = ['wt-upper-a', 'wt-lower-a', 'wt-pull-day', 'wt-push-day', 'wt-full-body-express'];
        const missed = memberRng() < 0.1;
        insert('workout_sessions', {
          id: uid('workout_sessions'), profile_id: member.id,
          template_id: templatesForDay[member.trainingDays.indexOf(weekday)] ?? 'wt-full-body-express',
          scheduled_on: dateStr, status: missed ? 'missed' : 'completed',
          completed_on: missed ? null : dateStr,
          notes: missed ? 'Rescheduled around work.' : null,
          created_at: `${dateStr}T06:00:00.000Z`,
        });
      }
      if (offset % Math.max(1, Math.round(7 / member.cardioPerWeek)) === 0) {
        insert('cardio_logs', {
          id: uid('cardio_logs'), profile_id: member.id, completed_at: `${dateStr}T07:15:00.000Z`,
          activity: cardios[Math.floor(memberRng() * cardios.length)],
          duration_minutes: Math.round(between(memberRng, 20, 55)),
          average_heart_rate: Math.round(between(memberRng, 118, 152)),
          notes: null, created_at: `${dateStr}T07:20:00.000Z`,
        });
      }
      if (offset % 4 === 1) {
        insert('progress_logs', {
          id: uid('progress_logs'), profile_id: member.id, weight,
          recorded_on: dateStr, note: offset % 16 === 1 ? 'Morning weigh-in after check-in day.' : null,
          created_at: `${dateStr}T06:45:00.000Z`,
        });
      }

      // Weekly Sunday check-in.
      if (weekday === 0) {
        const reviewed = offset > 7;
        insert('checkins', {
          id: uid('checkins'), profile_id: member.id, checkin_date: dateStr,
          sleep: Math.round(between(memberRng, 5, 9)),
          energy: Math.round(between(memberRng, 5, 9)),
          stress: Math.round(between(memberRng, 2, 8)),
          soreness: Math.round(between(memberRng, 1, 7)),
          status: reviewed ? 'reviewed' : 'needs_review',
          client_notes: training ? 'Good training week, sessions felt strong.' : 'Busy week but stayed on plan with food.',
          coach_notes: reviewed ? 'Great work — keep protein steady and add 1,000 steps on rest days.' : null,
          coach_prescription: reviewed ? 'Repeat last week and log every session.' : null,
          created_at: `${dateStr}T19:00:00.000Z`,
        });
      }
    }

    // Forward-scheduled sessions for the week ahead.
    for (let ahead = 1; ahead <= 7; ahead++) {
      const date = daysAhead(ahead);
      if (member.trainingDays.includes(date.getDay())) {
        const dateStr = isoDate(date);
        insert('workout_sessions', {
          id: uid('workout_sessions'), profile_id: member.id,
          template_id: member.tier === 'Starter' ? 'wt-full-body-express' : 'wt-upper-a',
          scheduled_on: dateStr, status: 'planned', completed_on: null, notes: null,
          created_at: isoTime(daysAgo(1)),
        });
      }
    }
    // Coach conversation history.
    const thread = [
      { fromMember: false, body: `Welcome aboard ${member.name.split(' ')[0]} — your first week is set up in the app. Check in Sunday and we'll adjust from there.` },
      { fromMember: true, body: 'Thanks Mike, just logged my first weigh-in and this morning’s steps.' },
      { fromMember: false, body: 'Perfect. Nutrition targets are live in the app — hit protein first, the rest follows.' },
      { fromMember: true, body: 'Session done today, legs are wrecked in a good way.' },
      { fromMember: false, body: 'Nice one. Add 2.5kg on the squat next week if the last set felt clean.' },
      { fromMember: true, body: 'Food was off track on Friday, birthday dinner.' },
      { fromMember: false, body: 'One meal doesn’t break a week — straight back on plan Saturday. No guilt, just resume.' },
      { fromMember: false, body: 'Check-in looks good this week. Sleep is the next lever, aim for a consistent bedtime.' },
      { fromMember: true, body: 'Will do. Can we push the cardio a bit? Feeling ready for more.' },
      { fromMember: false, body: 'Yes — one extra 20-minute incline walk on the rest day. Let’s see how you recover.' },
    ];
    const step = Math.max(1, Math.floor(member.sinceDays / thread.length));
    thread.forEach((message, index) => {
      const at = daysAgo(Math.max(0, member.sinceDays - index * step - 1));
      insert('coach_messages', {
        id: uid('coach_messages'), athlete_profile_id: member.id,
        sender_profile_id: message.fromMember ? member.id : 'demo-coach-mike',
        body: message.body, delivery_status: message.fromMember ? 'read' : (index % 3 === 0 ? 'sent' : 'read'),
        created_at: isoTime(at),
      });
    });

    insert('progress_photos', {
      id: uid('progress_photos'), profile_id: member.id, recorded_on: isoDate(daysAgo(Math.min(30, member.sinceDays))),
      caption: 'Front pose — mid plan', mime_type: 'image/svg+xml', photo_data: demoPhotoDataUri(`${member.name.split(' ')[0]} · FRONT`, '#3a2415', '#0e1013'),
      created_at: isoTime(daysAgo(Math.min(30, member.sinceDays))),
    });
    insert('progress_photos', {
      id: uid('progress_photos'), profile_id: member.id, recorded_on: isoDate(daysAgo(Math.min(2, member.sinceDays))),
      caption: 'Side pose — latest', mime_type: 'image/svg+xml', photo_data: demoPhotoDataUri(`${member.name.split(' ')[0]} · SIDE`, '#2b1d13', '#14171c'),
      created_at: isoTime(daysAgo(Math.min(2, member.sinceDays))),
    });
  }

  const assignments = [
    { profile_id: 'demo-alex', programme_id: 'prog-foundation', starts_on: isoDate(daysAgo(24)), due_on: isoDate(daysAhead(32)), status: 'active' },
    { profile_id: 'demo-jamie', programme_id: 'prog-foundation', starts_on: isoDate(daysAgo(40)), due_on: isoDate(daysAhead(16)), status: 'active' },
    { profile_id: 'demo-taylor', programme_id: 'prog-onboarding', starts_on: isoDate(daysAgo(21)), due_on: isoDate(daysAhead(7)), status: 'active' },
    { profile_id: 'demo-morgan', programme_id: 'prog-fat-loss', starts_on: isoDate(daysAgo(70)), due_on: isoDate(daysAgo(14)), status: 'completed' },
  ];
  for (const assignment of assignments) {
    insert('coaching_programme_assignments', {
      id: uid('coaching_programme_assignments'), ...assignment, created_at: isoTime(daysAgo(24)),
    });
  }

  const leadSeeds = [
    { kind: 'contact', name: 'Sarah Doyle', email: 'sarah.doyle@example.test', phone: '07700 900201', interest: 'Online coaching', goal: 'Lose 8kg before summer', message: 'Hi Mike, I work shifts — is online coaching flexible enough for that?', page: '/online-coaching', status: 'new' },
    { kind: 'consultation', name: 'Dan Whitaker', email: 'dan.w@example.test', phone: '07700 900202', interest: 'Personal training', goal: 'Return to training after injury', message: 'Back squatting pain-free again, want a structured restart.', page: '/contact', status: 'contacted' },
    { kind: 'waitlist', name: 'Priya Nair', email: 'priya.nair@example.test', phone: '', interest: 'App', goal: 'Consistency', message: 'When does the app waitlist open?', page: '/app', status: 'contacted' },
    { kind: 'contact', name: 'Tom Fletcher', email: 'tom.f@example.test', phone: '07700 900204', interest: 'Nutrition', goal: 'Build muscle', message: 'Need help with meal planning around a desk job.', page: '/online-coaching', status: 'qualified' },
    { kind: 'swag', name: 'Katie Brooks', email: 'katie.b@example.test', phone: '', interest: 'SHWAG', goal: '', message: 'Is the hoodie available in a small?', page: '/shwag', status: 'closed' },
    { kind: 'contact', name: 'Ryan Clarke', email: 'ryan.c@example.test', phone: '07700 900206', interest: 'Online coaching', goal: 'Half marathon', message: 'Combining running with strength — can you coach both?', page: '/online-coaching', status: 'converted' },
    { kind: 'consultation', name: 'Lucy Grant', email: 'lucy.g@example.test', phone: '07700 900207', interest: 'Personal training', goal: 'First pull-up', message: 'Do you do in-person sessions at the weekend?', page: '/contact', status: 'new' },
    { kind: 'contact', name: 'Omar Said', email: 'omar.s@example.test', phone: '07700 900208', interest: 'App', goal: 'Track nutrition', message: 'Does the app sync with MyFitnessPal?', page: '/app', status: 'new' },
    { kind: 'contact', name: 'Hannah Price', email: 'hannah.p@example.test', phone: '07700 900209', interest: 'Online coaching', goal: 'Post-baby strength', message: 'Looking for something I can do at home with minimal kit.', page: '/online-coaching', status: 'qualified' },
    { kind: 'swag', name: 'Chris Nolan', email: 'chris.n@example.test', phone: '', interest: 'SHWAG', goal: '', message: 'Restock on the cap please!', page: '/shwag', status: 'new' },
  ];
  leadSeeds.forEach((lead, index) => {
    insert('website_leads', {
      id: uid('website_leads'), ...lead, goal: lead.goal || null,
      created_at: isoTime(daysAgo(index * 3 + 1)), times: index % 2 === 0 ? 1 : 2,
    });
  });

  return tables;
}
