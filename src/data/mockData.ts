import { Coach, EquipmentItem, PricingTier, Programme, Testimonial } from '../types';

export const IMAGES = {
  HERO_KETTLEBELL: '/images/main-hero.jpg',
  FACILITY_CONTACT: '/images/facility-gym.jpg',
  PT_SLED_PUSH: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50WSZ-7SjcYGPGdQjzFqvrB8VupoZUSByCKX2TCONR7ABEKiJ_IrU-CelKazTvJPZCm_McoE6mFPonrciwOIcc9chva0cuD32bh-mC2yRGkMR8eml9ZXG2EC_1QVxGJrzffdpmB5ucXRghurXk5IkxhCcaxWoL-OdoLVW-BmlpR1Qe0LrZqdr2suYZTn7OtFbQn1maruaViSI5BLz0SJBom2-Mmye-p09gO7Z0oJBRwL4RPjZLsiU',
  ONLINE_COACHING_GYM: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATnJaAgusVmZHj3HKWYTF7Bhs43mZuDkyggX1mp4QDXrT9QMx_ayNEv3FzLqbhy9fPVD2phQFmMhGIvarNFhDozJIlv0xwGg784fzqUqEFgeIatxdwhqnO5t6EZZwdsNeCcWt9yFoza0vscg9MNg2YAv8_eZ6epjraQ5xLGuBMuEIHa3aKv3fF97PuwJzx31SVH-IsxWzFp29iPYRwNJAugbc7pTK0ql8XUUZLV0SaraayBMecpvww',
  COACHING_PROCESS_HERO: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbhOk8FQi6vzrzTZkM1o8T5n65rxph7WGf_RuI76oftF-s7WQe87ap1dG_RrE2x3HlLZ-ANesgp2Hjs8xUMnt1T-X3h8PLNwebSw1eKnsXmRG9DREobW9F5MzioZHuFqCU0lW_BTpNStuIj0E35hGxOj_2JsxBzvK-2BJ5I540f9oDFasUavQYc8zkk1xlqdYlQHoe4PHfaqZ7Ds9FI6OSkWs8ss1aSq-6xwRDwgF81Bmht6NNkHDp',
  APP_MOCKUP_PHONE: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd8ns_LYn8cET0LSaBZqWnhp3OizYZGZMjz-TElaVS5-V4saONa5kZAk4ldFOqwot0RFLJ34QhArOgLrLCsoUIZdkgRKjAoJP66hCW3tWKeEiLVkolGsmYX_53svrwrQiDC5eyCb7q_OLj5DUKv1V6gkiU7THEyeI6vxdh87A6pxztnyDMqxzi6ubijQoR7lj654BClBci4is_tCHPMoLbG5Wz9L7z-JSJRRDBszska1p4F2kLVC0g',
  GOLD_PACKAGE_HERO: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWUKajc9XHPtAtZIfQSbx-nqIU-mScqJgGDEEELWFA73z9oNXyShbKBvIlNV4fEqjXokxAImA_B2S-GZzj3WcjIZUFFJJqe-JyuQhebK6bqv-aZjMJGvYZNngBCeSa2EHtYHwYzhTZXcfy1BZe8MOyMGU_WE9wF-R1y7478-KMjmWO6twNHORKU3l4Kgb2xJkx-zbIg99PAkK00jk0kYAp5R4ASiit3-PcoWZD-WprMvQQKfJlVO4o',
  BARBELL_PLATES_ARMORY: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC30TOCbTXBPyyPzmirLtG4ppDuTXzMTVNAiz6nwysc7eO_hVikSEq8qXwlEt97IN0ius5rt9-28VKqXy-cx8ckrm50EIIaLEFU3qiOCl_Gf3R4kFrGSDoyhCD42pheuAdm3xazmdGiPNr0bZ0E4CIF-o9kxyRWsuIMhNNv78UyFA3Zybgxv4jtuHvQV0C03UtGT4--f4_NxIgFuI4BU_JeobJj46l3jPgLH-owNcGj47Y8Ug2qgaDR',
  PROGRAMMES_HERO: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjvCf_xYzAVDOXRXdX-A7ZoDCLzNCvlZnDMW9o3PbmFApQqDUkq9JFyITE02jMloXqh7yod9vZK4Qx9lJMCkDf-vCfS72zZODQw3Vm_Zb57lRXyqEpPA0FXaG-H4XYbcVj4gfpYEbqocY6ck6rY2x_DXSHeFaPJ_0sBUQAMMXMqIb_XMrDt-V5yHu8aCOTUQrI51V3CDacTeonPVOSFQOhlT9W_JUyshaI4MioGp195Gl1r4UQ77_B',
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'bronze',
    name: 'BRONZE',
    tag: 'FOUNDATION BLOCK',
    price: 120,
    originalPrice: 140,
    badge: 'ENTRY PROTOCOL',
    description: 'Four 1-2-1 personal training sessions plus nutritional advice. The ideal launchpad for new lifters.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Session-by-session programme tracking',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport'
    ],
    omittedFeatures: [
      'Calorie-controlled meal preparation ideas',
      'BMR calculation & macronutrient breakdown',
      'Weekly exercise programme for other training days'
    ],
    ctaText: 'ENROLL IN BRONZE'
  },
  {
    id: 'silver',
    name: 'SILVER',
    tag: 'TRAINING + NUTRITION',
    price: 150,
    originalPrice: 180,
    badge: 'SAVE £30',
    description: 'Everything in Bronze, plus calorie-controlled meal preparation ideas to keep your nutrition on track all week.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal preparation ideas',
      'Session-by-session programme tracking',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport'
    ],
    omittedFeatures: [
      'BMR calculation & macronutrient breakdown',
      'Weekly exercise programme for other training days'
    ],
    ctaText: 'ENROLL IN SILVER'
  },
  {
    id: 'gold',
    name: 'GOLD',
    tag: 'FULL NUTRITION BREAKDOWN',
    price: 175,
    originalPrice: 200,
    badge: 'MOST POPULAR',
    isPopular: true,
    description: 'Everything in Silver, plus BMR calculations and a full macronutrient breakdown so you know exactly what to eat.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal preparation ideas',
      'BMR calculation & macronutrient breakdown',
      'Session-by-session programme tracking',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport'
    ],
    omittedFeatures: [
      'Weekly exercise programme for other training days'
    ],
    ctaText: 'JOIN GOLD'
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    tag: 'FULL IMMERSION',
    price: 200,
    originalPrice: 250,
    badge: 'UNLOCK ALL COACHING',
    description: 'Everything in Gold, plus a weekly exercise programme for your 3-4 other training days. Our complete coaching package.',
    features: [
      '4 x 1-2-1 personal training sessions',
      'Nutritional advice tailored to your goals',
      'Calorie-controlled meal preparation ideas',
      'BMR calculation & macronutrient breakdown',
      'Weekly exercise programme for 3-4 extra training days',
      'Morning, evening & weekend slots',
      'Based at Pure Gym Hazel Grove, Stockport'
    ],
    ctaText: 'APPLY FOR PLATINUM'
  }
];

export const CONTACT = {
  email: 'mikeptonline@gmail.com',
  instagramHandle: 'michael_whitworth85',
  instagramUrl: 'https://instagram.com/michael_whitworth85',
  facebookName: 'Michael Whitworth',
  facebookUrl: 'https://www.facebook.com/search/top?q=Michael%20Whitworth',
  location: 'Pure Gym Hazel Grove, Stockport',
  locationShort: 'Pure Gym Hazel Grove',
  note: 'Inbox for more details',
  sessions: 'Morning, evening & weekend sessions from September 2026'
};

export const PROGRAMMES: Programme[] = [
  {
    id: 'iron-mw-16',
    title: 'MWFITNESS 16-WEEK S&C',
    category: 'Powerlifting',
    duration: '16 Weeks',
    frequency: '4 Days / Week',
    difficulty: 'Advanced',
    price: 79,
    description: 'Our flagship 4-phase periodized powerlifting protocol engineered to shatter PRs in the Squat, Bench Press, and Deadlift through accumulated volume and peaked neurological drive.',
    highlights: [
      'Phase 1: Volume Accumulation & Muscular Density (Weeks 1-5)',
      'Phase 2: Transition & Rate of Force Development (Weeks 6-9)',
      'Phase 3: Realization & Neurological Peak (Weeks 10-14)',
      'Phase 4: Meet Taper & 1RM Testing Week (Weeks 15-16)'
    ],
    weeklyBreakdown: [
      { week: 'Week 01-04', focus: 'Accumulation', sampleSession: 'Squat 5x5 @ 72.5%, Paused Bench 4x6 @ 70%, RDL 3x8 @ RPE 7' },
      { week: 'Week 05-08', focus: 'Hypertrophy-Strength Bridge', sampleSession: 'Squat 4x4 @ 78%, Close-Grip Bench 4x5 @ 75%, Deficit Deadlift 3x5' },
      { week: 'Week 09-12', focus: 'Intensification & Velocity', sampleSession: 'Squat 3x3 @ 85%, Comp Bench 3x3 @ 86%, Comp Deadlift 2x2 @ 88%' },
      { week: 'Week 13-16', focus: 'Peaking & 1RM Execution', sampleSession: 'Squat 1x1 @ 92% + 2x2 @ 84%, Bench 1x1 @ 94%, Rest & Test Day' }
    ]
  },
  {
    id: 'savage-mass-12',
    title: 'SAVAGE MASS HYPERTROPHY',
    category: 'Hypertrophy',
    duration: '12 Weeks',
    frequency: '5 Days / Week',
    difficulty: 'Intermediate',
    price: 69,
    description: 'Pure structural muscle building optimized by length-tension curves, metabolite accumulation, and mechanical tension on priority muscle groups.',
    highlights: [
      'Upper / Lower / Torso / Limb split architecture',
      'Targeted 10-20 weekly sets per muscle group',
      'Lengthened partials and peak tension angles',
      'Detailed dietary surplus & surplus recovery protocol'
    ],
    weeklyBreakdown: [
      { week: 'Week 01-04', focus: 'Mechanical Tension Focus', sampleSession: 'Incline DB Press 3x8-10, Chest-Supported Row 4x10, Hack Squat 3x8' },
      { week: 'Week 05-08', focus: 'Metabolic & Volume Spikes', sampleSession: 'Barbell RDL 4x8, Leg Press Myo-reps, Cable Lateral Raises 4x15-20' },
      { week: 'Week 09-12', focus: 'Intensity Techniques & Overload', sampleSession: 'Weighted Dips 3x6-8, Seal Row 4x8, Sissy Squats with loaded vest' }
    ]
  },
  {
    id: 'metabolic-engine-8',
    title: 'METABOLIC ENGINE: TACTICAL CONDITIONING',
    category: 'Conditioning',
    duration: '8 Weeks',
    frequency: '3 Days / Week',
    difficulty: 'Intermediate',
    price: 59,
    description: 'Relentless anaerobic capacity, VO2 max elevation, and lactic acid tolerance utilizing heavy sled pushes, assault bikes, and kettlebell complexes.',
    highlights: [
      'Lactate threshold buffering intervals',
      'Heavy sled sprint & prowler push intervals',
      'Zero joint-impact aerobic base building',
      'Engineered for tactical athletes and martial artists'
    ],
    weeklyBreakdown: [
      { week: 'Week 01-02', focus: 'Aerobic Base (Zone 2)', sampleSession: '45min Rogue Echo Bike @ 135-145 BPM + 4x100m Sled Drag' },
      { week: 'Week 03-05', focus: 'Lactate Threshold', sampleSession: '10 rounds: 30s All-Out Row, 60s KB Farmer Walk, 90s Rest' },
      { week: 'Week 06-08', focus: 'Max Anaerobic Capacity', sampleSession: 'EMOM 20: Odd min Sled Sprint 25m, Even min 12 Burpee Box Jumps' }
    ]
  },
  {
    id: 'tactical-resilience',
    title: 'TACTICAL LONGEVITY & MOBILITY',
    category: 'Mobility',
    duration: '6 Weeks',
    frequency: 'Daily (20 mins)',
    difficulty: 'Intermediate',
    price: 45,
    description: 'Bulletproof your shoulders, hips, and lower back. Engineered to eliminate chronic lifting impingements and open up deep hip flexion.',
    highlights: [
      'Active CARs (Controlled Articular Rotations)',
      'Thoracic spine extension and rotational drills',
      'Deep hip adductor and capsule decompression',
      'Rotator cuff and scapular stabilization matrix'
    ],
    weeklyBreakdown: [
      { week: 'Week 01-02', focus: 'Pelvic & Lumbar Integrity', sampleSession: '90/90 Hip Flow, Couch Stretch, McGill Big 3 Core Bracing' },
      { week: 'Week 03-04', focus: 'Shoulder Capsule Expansion', sampleSession: 'Prone Trap Y/T/W, Dead Hangs, Banded Shoulder Dislocates' },
      { week: 'Week 05-06', focus: 'Integrated Deep Squat Mobility', sampleSession: 'Ankle Dorsiflexion loading, Cossack Squats, Loaded Jefferson Curls' }
    ]
  }
];

export const COACHES: Coach[] = [
  {
    id: 'michael-whitworth',
    name: 'MICHAEL WHITWORTH',
    role: 'OWNER & PERSONAL TRAINER',
    credentials: ['Personal Trainer', 'Online Coaching', 'Nutrition & Meal Prep'],
    specialty: '1-2-1 Personal Training, Online Coaching & Nutritional Advice',
    bio: 'Personal trainer based at Pure Gym Hazel Grove, Stockport. Specialising in 1-2-1 personal training, online coaching, nutritional advice and calorie-controlled meal preparation ideas to help you hit your goals.',
    availability: 'Morning, evening & weekend sessions from September 2026'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'DARBY L., ONLINE COACHING CLIENT',
    metric: '-8KG IN 12 WEEKS',
    quote: 'The programme was simple to follow and the meal prep guidance made staying on track genuinely easy. Coaching felt personal from day one.',
    programme: 'Platinum Package',
    avatarText: 'DL'
  },
  {
    id: '2',
    name: 'SAM R., 1-2-1 CLIENT',
    metric: '+15KG SQUAT IN 8 WEEKS',
    quote: 'Form has never felt this dialled in. Sessions are structured, tough, and actually tailored to how I train. Can’t recommend Mike enough.',
    programme: 'Gold Package',
    avatarText: 'SR'
  },
  {
    id: '3',
    name: 'CHRIS W., 1-2-1 & NUTRITION',
    metric: 'STRONGER & LEANER',
    quote: 'Honest advice, no fluff. The BMR and macro breakdown finally made nutrition click for me, and the results followed.',
    programme: 'Silver Package',
    avatarText: 'CW'
  }
];

export const EQUIPMENT_LIST: EquipmentItem[] = [
  { name: 'Free Weights Zone', brand: 'Pure Gym Hazel Grove', spec: 'Olympic barbells, squat racks, benches and dumbbells up to 50kg', category: 'Barbells & Plates' },
  { name: 'Plate-Loaded & Pin-Loaded Machines', brand: 'Pure Gym Hazel Grove', spec: 'Full-machine range for leg press, chest, back, shoulders and arms', category: 'Barbells & Plates' },
  { name: 'Functional & Cross-Training Rig', brand: 'Pure Gym Hazel Grove', spec: 'Suspension trainers, battle ropes, kettlebells, sleds and slam balls', category: 'Racks & Platforms' },
  { name: 'Power Racks & Smith Platforms', brand: 'Pure Gym Hazel Grove', spec: 'Multiple power racks and platforms for safe heavy lifting', category: 'Racks & Platforms' },
  { name: 'Cardio Zone', brand: 'Pure Gym Hazel Grove', spec: 'Treadmills, cross-trainers, rowers, spin bikes and assault bikes', category: 'Conditioning' },
  { name: 'Mobility & Stretching Area', brand: 'Pure Gym Hazel Grove', spec: 'Mat space, foam rollers and mobility aids for warm-up and recovery', category: 'Conditioning' },
  { name: 'Group Exercise Studio', brand: 'Pure Gym Hazel Grove', spec: 'Open studio floor for classes, circuits and conditioning work', category: 'Recovery' },
  { name: 'Recovery & Drying Zone', brand: 'Pure Gym Hazel Grove', spec: 'Stretch zone and lockers with full changing facilities', category: 'Recovery' }
];

export const METHODOLOGY_PHASES = [
  {
    phase: 'PHASE 01',
    name: 'HYPERTROPHY & WORK CAPACITY BASE',
    duration: 'Weeks 1-4',
    objective: 'Establish tendon resilience, structural cross-sectional muscle area, and work capacity to tolerate heavy neurological loading.',
    focus: ['Sub-maximal volume sets', 'Eccentric tempo manipulation', 'Movement pattern groove and motor unit recruitment', 'Baseline work capacity expansion']
  },
  {
    phase: 'PHASE 02',
    name: 'MAXIMAL STRENGTH & RATE OF FORCE (RFD)',
    duration: 'Weeks 5-8',
    objective: 'Transition muscular cross-sectional area into high-threshold motor unit synchronization and force production.',
    focus: ['Heavy compound intensity (80-87.5% 1RM)', 'Velocity loss profiling (<20% velocity threshold)', 'Comp lift technical perfection under fatigue', 'Accessory overload']
  },
  {
    phase: 'PHASE 03',
    name: 'NEUROLOGICAL PEAK & REALIZATION',
    duration: 'Weeks 9-12',
    objective: 'Dissipate accumulated fatigue while expressing peak neurological force outputs for target test day or competition.',
    focus: ['Top single over-warm singles @ RPE 8', 'Volume reduction with heightened intensity', 'Bar speed feedback and mental arousal state training', 'Specific meet/test timing']
  },
  {
    phase: 'PHASE 04',
    name: 'BIOMECHANICAL RESTORATION & DELOAD',
    duration: 'Weeks 13-14',
    objective: 'Restore nervous system autonomic balance, regenerate soft tissues, and evaluate progression metrics for the next training block.',
    focus: ['Deload volume cut by 50%', 'Unilateral joint realignment', 'Mobility & joint capsule decompression', 'Comprehensive block performance review']
  }
];

export const FAQS = [
  {
    q: 'How does online coaching work?',
    a: 'Whatever gym you have access to, I build an individual programme around your goals, equipment and schedule. You check in on your progress, and I adjust the coaching each week to keep you progressing.'
  },
  {
    q: 'What equipment and location do I need for in-person training?',
    a: 'In-person 1-2-1 sessions run at Pure Gym Hazel Grove, Stockport, using the full commercial floor — free weights, machines, cardio and functional areas. For online coaching I adapt the programme to whatever gym equipment you have available.'
  },
  {
    q: 'How do package sessions and rebooking work?',
    a: 'Packages are a one-off block of 4 x 1-2-1 sessions and go further with discounted 8-week and 12-week programme options. Let me know 24 hours in advance to reschedule a session so it keeps its slot in your block.'
  },
  {
    q: 'Do you offer nutrition and meal preparation guidance?',
    a: 'Yes. Nutritional advice is included in every package. Silver adds calorie-controlled meal preparation ideas, and Gold and Platinum add BMR calculations and a full macronutrient breakdown tailored to you.'
  }
];
