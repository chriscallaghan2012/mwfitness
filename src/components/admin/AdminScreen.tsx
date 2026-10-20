// AdminScreen — MWFitnessUK staff HQ. Sign-in + management for customers,
// plans, memberships, nutrition, workouts, check-ins and progress.
// Same shared Neon project as the mobile app.
import { FormEvent, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { neon } from '../../lib/neon';
import { UsersAdmin } from './UsersAdmin';
import { PlansAdmin } from './PlansAdmin';
import { MembershipsAdmin } from './MembershipsAdmin';
import { NutritionAdmin } from './NutritionAdmin';
import { WorkoutsAdmin } from './WorkoutsAdmin';
import { CheckinsAdmin, ProgressAdmin } from './ProgressAdmin';
import { MessagesAdmin } from './MessagesAdmin';
import { LeadsAdmin } from './LeadsAdmin';
import { ClientRecordsAdmin } from './ClientRecordsAdmin';
import { VideosAdmin } from './VideosAdmin';
import { ProgrammesAdmin } from './ProgrammesAdmin';
import { PasswordRecovery } from './PasswordRecovery';
import { MemberActivityAdmin } from './MemberActivityAdmin';
import { CommunicationsAdmin } from './CommunicationsAdmin';
import { AdminTable, Row, btn, btnGhost, card, inp } from './fields';

type Tab = 'overview' | 'users' | 'client-records' | 'plans' | 'memberships' | 'nutrition' | 'workouts' | 'programmes' | 'videos' | 'checkins' | 'progress' | 'messages' | 'leads' | 'member-activity' | 'communications';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'client-records', label: 'Client app data' },
  { id: 'plans', label: 'Plans & pricing' },
  { id: 'memberships', label: 'Memberships' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'workouts', label: 'Workouts' },
  { id: 'programmes', label: 'Coaching programmes' },
  { id: 'videos', label: 'Videos' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'progress', label: 'Progress' },
  { id: 'messages', label: 'Messages' },
  { id: 'leads', label: 'Website leads' },
  { id: 'member-activity', label: 'Member activity' },
  { id: 'communications', label: 'Notifications & email' },
];

type DemoTab = Exclude<Tab, 'overview'>;

const AUTHORISED_ADMIN_EMAILS = new Set(['instantonlinesuccess@gmail.com', 'mwfitnessukonline@gmail.com']);
const isAuthorisedAdminEmail = (email: string | null | undefined) => AUTHORISED_ADMIN_EMAILS.has(String(email || '').trim().toLowerCase());

const DEMO_TABLES: Record<DemoTab, { columns: { key: string; label: string }[]; rows: Row[] }> = {
  users: {
    columns: [{ key: 'name', label: 'Customer' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'tier', label: 'Tier' }],
    rows: [
      { id: 'demo-user-1', name: 'Alex Morgan', email: 'alex@example.test', role: 'athlete', tier: 'Gold', phone: '07700 900101', goal: 'Build strength', startWeight: '86.4', currentWeight: '81.6', goalWeight: '78', joined: '2026-06-02', status: 'Active', notes: 'Consistent training; review sleep routine.' },
      { id: 'demo-user-2', name: 'Jamie Reed', email: 'jamie@example.test', role: 'athlete', tier: 'Online', phone: '07700 900102', goal: 'Improve fitness', startWeight: '94', currentWeight: '91.2', goalWeight: '85', joined: '2026-07-14', status: 'Active', notes: 'Prefers evening sessions.' },
      { id: 'demo-user-3', name: 'Taylor Brooks', email: 'taylor@example.test', role: 'athlete', tier: 'Starter', phone: '07700 900103', goal: 'Fat loss', startWeight: '78', currentWeight: '76.8', goalWeight: '70', joined: '2026-08-01', status: 'Onboarding', notes: 'Needs initial check-in.' },
      { id: 'demo-user-4', name: 'Morgan Ellis', email: 'morgan@example.test', role: 'athlete', tier: 'Elite', phone: '07700 900104', goal: 'Hypertrophy', startWeight: '73', currentWeight: '74.1', goalWeight: '78', joined: '2026-05-21', status: 'At risk', notes: 'Missed two check-ins; follow up.' },
      { id: 'demo-user-5', name: 'Casey Patel', email: 'casey@example.test', role: 'athlete', tier: 'Online Coaching', phone: '07700 900105', goal: 'Return to consistent training', startWeight: '88', currentWeight: '86.9', goalWeight: '82', joined: '2026-09-09', status: 'Active', notes: 'Training around a busy work schedule.' },
    ],
  },
  'client-records': {
    columns: [{ key: 'client', label: 'Client' }, { key: 'source', label: 'App data' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-record-1', client: 'Alex Morgan', source: 'Weekly check-in', status: 'Needs review', lastSync: '2026-10-17', detail: 'Sleep 8/10, energy 7/10; asks for meal-prep ideas.' }, { id: 'demo-record-2', client: 'Jamie Reed', source: 'Nutrition log', status: 'Up to date', lastSync: '2026-10-18', detail: 'Training-day targets and meals logged.' }, { id: 'demo-record-3', client: 'Taylor Brooks', source: 'Workout session', status: 'Awaiting sync', lastSync: '2026-10-16', detail: 'Full Body A session completed.' }, { id: 'demo-record-4', client: 'Morgan Ellis', source: 'Progress photo', status: 'Needs review', lastSync: '2026-10-15', detail: 'New progress photos awaiting coach review.' }],
  },
  plans: {
    columns: [{ key: 'name', label: 'Plan' }, { key: 'price', label: 'Price' }, { key: 'kind', label: 'Type' }, { key: 'status', label: 'Status' }],
    rows: [
      { id: 'demo-plan-1', name: 'Gold Coaching', price: '£175.00', kind: 'PT', billing: 'Monthly', status: 'Active', description: 'Personal coaching with structured progression.', features: 'Monthly review\\nTraining plan\\nCoach messaging' },
      { id: 'demo-plan-2', name: '12-week Online', price: '£399.99', kind: 'Online', billing: '12 weeks', status: 'Active', description: 'Remote coaching and accountability.', features: 'Workout plan\\nNutrition guidance\\nWeekly check-in' },
      { id: 'demo-plan-3', name: 'PT 4 Sessions', price: '£140.00', kind: 'PT', billing: 'One-off', status: 'Active', description: 'Four in-person sessions.', features: '4 coached sessions\\nTechnique review' },
      { id: 'demo-plan-4', name: 'Online Essentials', price: '£89.00', kind: 'Online', billing: 'Monthly', status: 'Draft', description: 'A lighter-touch online plan.', features: 'Monthly programme\\nProgress tracking' },
    ],
  },
  memberships: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }, { key: 'renewal', label: 'Next renewal' }],
    rows: [{ id: 'demo-membership-1', customer: 'Alex Morgan', plan: 'Gold Coaching', status: 'Active', started: '2026-06-02', renewal: '2026-11-12', amount: '175', notes: 'Renewal confirmed.' }, { id: 'demo-membership-2', customer: 'Jamie Reed', plan: 'Online Coaching', status: 'Active', started: '2026-07-14', renewal: '2026-11-14', amount: '89', notes: 'Monthly online plan.' }, { id: 'demo-membership-3', customer: 'Taylor Brooks', plan: 'PT 4 Sessions', status: 'Trial', started: '2026-10-01', renewal: '2026-10-31', amount: '140', notes: 'Trial conversion follow-up.' }],
  },
  nutrition: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'plan', label: 'Nutrition plan' }, { key: 'calories', label: 'Daily target' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-nutrition-1', customer: 'Alex Morgan', plan: 'Training day', calories: '2,250 kcal', protein: '165', carbs: '245', fats: '65', water: '3500', status: 'Assigned', meals: 'Breakfast: oats, yoghurt, berries\\nLunch: chicken rice bowl\\nDinner: salmon, potatoes, vegetables' }, { id: 'demo-nutrition-2', customer: 'Jamie Reed', plan: 'Rest day', calories: '2,050 kcal', protein: '160', carbs: '190', fats: '70', water: '3000', status: 'Assigned', meals: 'Higher-fibre meals; keep snacks planned.' }, { id: 'demo-nutrition-3', customer: 'Taylor Brooks', plan: 'Starter plan', calories: '1,900 kcal', protein: '140', carbs: '205', fats: '60', water: '2500', status: 'Needs review', meals: 'Awaiting food preferences.' }],
  },
  workouts: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'session', label: 'Session' }, { key: 'date', label: 'Scheduled' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-workout-1', customer: 'Jamie Reed', session: 'Full body A', date: '2026-10-21', status: 'Planned', duration: '55', location: 'Gym', notes: 'Focus on controlled tempo.' }, { id: 'demo-workout-2', customer: 'Alex Morgan', session: 'Upper body B', date: '2026-10-20', status: 'Completed', duration: '48', location: 'Gym', notes: 'Progressed row load.' }, { id: 'demo-workout-3', customer: 'Taylor Brooks', session: 'Beginner conditioning', date: '2026-10-22', status: 'Needs reschedule', duration: '35', location: 'Home', notes: 'Client requested a new time.' }],
  },
  programmes: {
    columns: [{ key: 'name', label: 'Programme' }, { key: 'duration', label: 'Duration' }, { key: 'training', label: 'Training' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-programme-1', name: '12-week strength builder', duration: '12 weeks', training: '4 days/week', focus: 'Strength', status: 'Active', description: 'Progressive compound lifts and accessories.' }, { id: 'demo-programme-2', name: 'Beginner foundations', duration: '8 weeks', training: '3 days/week', focus: 'Beginner foundations', status: 'Active', description: 'Build technique, confidence and consistency.' }, { id: 'demo-programme-3', name: 'Lean & athletic', duration: '10 weeks', training: '4 days/week', focus: 'Fat loss', status: 'Draft', description: 'Strength training with conditioning.' }],
  },
  videos: {
    columns: [{ key: 'title', label: 'Video' }, { key: 'category', label: 'Category' }, { key: 'duration', label: 'Duration' }, { key: 'status', label: 'Visibility' }],
    rows: [{ id: 'demo-video-1', title: 'Squat technique basics', category: 'Technique', duration: '04:20', url: 'https://example.test/squat-technique', status: 'Hidden', description: 'Bracing, depth and safe setup.' }, { id: 'demo-video-2', title: 'Warm-up flow', category: 'Warm-up', duration: '03:10', url: 'https://example.test/warm-up', status: 'Visible', description: 'Five-minute general warm-up.' }, { id: 'demo-video-3', title: 'Hip hinge walkthrough', category: 'Technique', duration: '05:45', url: 'https://example.test/hip-hinge', status: 'Draft', description: 'Learn the hinge pattern.' }],
  },
  checkins: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'date', label: 'Submitted' }, { key: 'scores', label: 'Wellbeing' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-checkin-1', customer: 'Alex Morgan', date: '2026-10-18', sleep: '8', energy: '7', mood: '8', adherence: '90', scores: 'Sleep 8 · Energy 7', status: 'Needs review', notes: 'Good week overall; discuss weekend routine.' }, { id: 'demo-checkin-2', customer: 'Jamie Reed', date: '2026-10-17', sleep: '7', energy: '8', mood: '7', adherence: '85', scores: 'Sleep 7 · Energy 8', status: 'Reviewed', notes: 'Keep current plan.' }, { id: 'demo-checkin-3', customer: 'Morgan Ellis', date: '2026-10-16', sleep: '5', energy: '4', mood: '5', adherence: '55', scores: 'Sleep 5 · Energy 4', status: 'Follow up required', notes: 'Missed sessions; coach follow-up needed.' }],
  },
  progress: {
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'date', label: 'Recorded' }, { key: 'weight', label: 'Weight' }, { key: 'note', label: 'Note' }],
    rows: [{ id: 'demo-progress-1', customer: 'Alex Morgan', date: '2026-10-18', weight: '81.6', bodyFat: '19.8', waist: '86', steps: '9200', note: 'Down 0.4 kg this week; strength maintained.' }, { id: 'demo-progress-2', customer: 'Jamie Reed', date: '2026-10-17', weight: '91.2', bodyFat: '25.1', waist: '99', steps: '8100', note: 'Consistency improving.' }, { id: 'demo-progress-3', customer: 'Taylor Brooks', date: '2026-10-16', weight: '76.8', bodyFat: '28.4', waist: '91', steps: '7400', note: 'Baseline measurements recorded.' }],
  },
  messages: {
    columns: [{ key: 'customer', label: 'Athlete' }, { key: 'from', label: 'From' }, { key: 'message', label: 'Message' }, { key: 'status', label: 'Push status' }],
    rows: [{ id: 'demo-message-1', customer: 'Alex Morgan', from: 'Coach', message: 'Great work staying consistent this week. Keep your water target in focus.', sentAt: '2026-10-18', status: 'Read' }, { id: 'demo-message-2', customer: 'Jamie Reed', from: 'Coach', message: 'I have updated your next workout. Let me know how it feels.', sentAt: '2026-10-17', status: 'Sent' }, { id: 'demo-message-3', customer: 'Taylor Brooks', from: 'Client', message: 'Can we move Thursday to Friday evening?', sentAt: '2026-10-16', status: 'Queued' }],
  },
  'member-activity': {
    columns: [{ key: 'member', label: 'Member' }, { key: 'activity', label: 'Activity' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-activity-1', member: 'Alex Morgan', activity: 'Steps', value: '9,200 steps', date: '2026-10-18', status: 'Complete', notes: 'Daily target achieved.' }, { id: 'demo-activity-2', member: 'Jamie Reed', activity: 'Cardio', value: '25 min cycling', date: '2026-10-18', status: 'Complete', notes: 'Moderate effort.' }, { id: 'demo-activity-3', member: 'Taylor Brooks', activity: 'Hydration', value: '1.8 L / 2.5 L', date: '2026-10-18', status: 'In progress', notes: 'Remind to drink through the afternoon.' }, { id: 'demo-activity-4', member: 'Morgan Ellis', activity: 'Workout', value: 'Upper body session', date: '2026-10-17', status: 'Missed', notes: 'Follow-up recommended.' }],
  },
  communications: {
    columns: [{ key: 'name', label: 'Workspace' }, { key: 'status', label: 'Status' }, { key: 'detail', label: 'Details' }],
    rows: [{ id: 'demo-communications-1', name: 'Notification centre', status: 'Planned', detail: 'Automation rules, broadcasts and delivery history' }, { id: 'demo-communications-2', name: 'Branded email studio', status: 'Planned', detail: 'Editable versioned templates and HTML preview' }],
  },
  leads: {
    columns: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'interest', label: 'Interested in' }, { key: 'status', label: 'Status' }],
    rows: [{ id: 'demo-lead-1', name: 'Jordan Taylor', email: 'jordan@example.test', phone: '07700 900201', interest: 'Free consultation', source: 'Website', status: 'New', followUp: '2026-10-20', notes: 'Asked about online coaching.' }, { id: 'demo-lead-2', name: 'Sam Carter', email: 'sam@example.test', phone: '07700 900202', interest: 'Personal training', source: 'Referral', status: 'Contacted', followUp: '2026-10-21', notes: 'Prefers weekday mornings.' }, { id: 'demo-lead-3', name: 'Riley James', email: 'riley@example.test', phone: '07700 900203', interest: 'Nutrition', source: 'Instagram', status: 'Booked', followUp: '2026-10-22', notes: 'Consultation booked.' }],
  },
};

type DemoField = { key: string; label: string; type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'; options?: string[]; placeholder?: string };
const DEMO_FIELDS: Record<DemoTab, DemoField[]> = {
  users: [
    { key: 'name', label: 'Full name', placeholder: 'Client full name' },
    { key: 'email', label: 'Email address', type: 'email', placeholder: 'client@example.test' },
    { key: 'role', label: 'Account role', type: 'select', options: ['athlete', 'coach', 'admin'] },
    { key: 'tier', label: 'Membership tier', type: 'select', options: ['Starter', 'Online', 'Gold', 'Elite', 'Online Coaching'] },
    { key: 'phone', label: 'Phone number', placeholder: '+44…' },
    { key: 'goal', label: 'Primary goal', placeholder: 'Build strength, lose fat…' },
    { key: 'startWeight', label: 'Starting weight (kg)', type: 'number' },
    { key: 'currentWeight', label: 'Current weight (kg)', type: 'number' },
    { key: 'goalWeight', label: 'Goal weight (kg)', type: 'number' },
    { key: 'joined', label: 'Joined', type: 'date' },
    { key: 'status', label: 'Account status', type: 'select', options: ['Active', 'Onboarding', 'Paused', 'At risk'] },
    { key: 'notes', label: 'Coach notes', type: 'textarea' },
  ],
  'client-records': [
    { key: 'client', label: 'Client', placeholder: 'Client name' },
    { key: 'source', label: 'Record type', type: 'select', options: ['Weekly check-in', 'Nutrition log', 'Workout session', 'Progress photo', 'Daily metrics', 'Coach message'] },
    { key: 'status', label: 'Status', type: 'select', options: ['Up to date', 'Needs review', 'Awaiting sync', 'Sample only'] },
    { key: 'lastSync', label: 'Last synced', type: 'date' },
    { key: 'detail', label: 'Record summary', type: 'textarea' },
  ],
  plans: [
    { key: 'name', label: 'Plan name', placeholder: 'e.g. Gold Coaching' },
    { key: 'price', label: 'Price (£)', type: 'number' },
    { key: 'kind', label: 'Plan type', type: 'select', options: ['PT', 'Online', 'Hybrid', 'Nutrition'] },
    { key: 'billing', label: 'Billing cadence', type: 'select', options: ['One-off', 'Weekly', 'Monthly', '12 weeks'] },
    { key: 'status', label: 'Visibility', type: 'select', options: ['Active', 'Draft', 'Hidden'] },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'features', label: 'Included features', type: 'textarea', placeholder: 'One feature per line' },
  ],
  memberships: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'plan', label: 'Plan', type: 'select', options: ['Gold Coaching', 'Online Coaching', '12-week Strength', 'PT 4 Sessions'] },
    { key: 'status', label: 'Membership status', type: 'select', options: ['Active', 'Trial', 'Paused', 'Past due', 'Cancelled'] },
    { key: 'started', label: 'Start date', type: 'date' },
    { key: 'renewal', label: 'Next renewal', type: 'date' },
    { key: 'amount', label: 'Recurring amount (£)', type: 'number' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  nutrition: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'plan', label: 'Nutrition plan', placeholder: 'Training day / rest day' },
    { key: 'calories', label: 'Calories (kcal)', type: 'number' },
    { key: 'protein', label: 'Protein (g)', type: 'number' },
    { key: 'carbs', label: 'Carbohydrates (g)', type: 'number' },
    { key: 'fats', label: 'Fats (g)', type: 'number' },
    { key: 'water', label: 'Water target (ml)', type: 'number' },
    { key: 'status', label: 'Assignment status', type: 'select', options: ['Assigned', 'Draft', 'Needs review'] },
    { key: 'meals', label: 'Meals / food notes', type: 'textarea' },
  ],
  workouts: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'session', label: 'Workout / session', placeholder: 'Full body A' },
    { key: 'date', label: 'Scheduled date', type: 'date' },
    { key: 'status', label: 'Session status', type: 'select', options: ['Planned', 'Completed', 'Skipped', 'Needs reschedule'] },
    { key: 'duration', label: 'Duration (minutes)', type: 'number' },
    { key: 'location', label: 'Location', placeholder: 'Gym / home / remote' },
    { key: 'notes', label: 'Coach notes', type: 'textarea' },
  ],
  programmes: [
    { key: 'name', label: 'Programme name', placeholder: 'Programme title' },
    { key: 'duration', label: 'Duration', placeholder: '12 weeks' },
    { key: 'training', label: 'Training frequency', placeholder: '4 days/week' },
    { key: 'focus', label: 'Primary focus', type: 'select', options: ['Strength', 'Fat loss', 'Hypertrophy', 'Beginner foundations', 'Mobility'] },
    { key: 'status', label: 'Programme status', type: 'select', options: ['Draft', 'Active', 'Archived', 'Sample only'] },
    { key: 'description', label: 'Programme overview', type: 'textarea' },
  ],
  videos: [
    { key: 'title', label: 'Video title', placeholder: 'Squat technique basics' },
    { key: 'category', label: 'Category', type: 'select', options: ['Technique', 'Warm-up', 'Strength', 'Mobility', 'Nutrition', 'Recovery'] },
    { key: 'duration', label: 'Duration', placeholder: '04:20' },
    { key: 'url', label: 'Video URL', placeholder: 'https://…' },
    { key: 'status', label: 'Visibility', type: 'select', options: ['Visible', 'Hidden', 'Draft'] },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  checkins: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'date', label: 'Submitted date', type: 'date' },
    { key: 'sleep', label: 'Sleep score (1–10)', type: 'number' },
    { key: 'energy', label: 'Energy score (1–10)', type: 'number' },
    { key: 'mood', label: 'Mood score (1–10)', type: 'number' },
    { key: 'adherence', label: 'Plan adherence (%)', type: 'number' },
    { key: 'status', label: 'Review status', type: 'select', options: ['Needs review', 'Reviewed', 'Follow up required'] },
    { key: 'notes', label: 'Client update / coach response', type: 'textarea' },
  ],
  progress: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'date', label: 'Recorded date', type: 'date' },
    { key: 'weight', label: 'Weight (kg)', type: 'number' },
    { key: 'bodyFat', label: 'Body fat (%)', type: 'number' },
    { key: 'waist', label: 'Waist (cm)', type: 'number' },
    { key: 'steps', label: 'Average daily steps', type: 'number' },
    { key: 'note', label: 'Progress note', type: 'textarea' },
  ],
  messages: [
    { key: 'customer', label: 'Customer', placeholder: 'Client name' },
    { key: 'from', label: 'Sender', type: 'select', options: ['Coach', 'Client', 'System'] },
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'sentAt', label: 'Sent date', type: 'date' },
    { key: 'status', label: 'Delivery status', type: 'select', options: ['Draft', 'Queued', 'Sent', 'Read', 'Failed'] },
  ],
  leads: [
    { key: 'name', label: 'Full name', placeholder: 'Lead name' },
    { key: 'email', label: 'Email address', type: 'email' },
    { key: 'phone', label: 'Phone number' },
    { key: 'interest', label: 'Interested in', type: 'select', options: ['Free consultation', 'Personal training', 'Online coaching', 'Nutrition', 'App'] },
    { key: 'source', label: 'Lead source', type: 'select', options: ['Website', 'Instagram', 'Referral', 'Facebook', 'Other'] },
    { key: 'status', label: 'Lead status', type: 'select', options: ['New', 'Contacted', 'Booked', 'Converted', 'Not proceeding'] },
    { key: 'followUp', label: 'Follow-up date', type: 'date' },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
  communications: [
    { key: 'name', label: 'Workspace', placeholder: 'Communications centre' },
    { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In progress', 'Blocked', 'Ready for testing'] },
    { key: 'detail', label: 'Details', type: 'textarea' },
  ],
  'member-activity': [
    { key: 'member', label: 'Member', placeholder: 'Client name' },
    { key: 'activity', label: 'Activity', type: 'select', options: ['Steps', 'Cardio', 'Hydration', 'Workout', 'Sleep', 'Nutrition log'] },
    { key: 'value', label: 'Value / result', placeholder: 'e.g. 8,400 steps' },
    { key: 'date', label: 'Activity date', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: ['Complete', 'In progress', 'Missed', 'Sample only'] },
    { key: 'notes', label: 'Notes', type: 'textarea' },
  ],
};

function createDemoRows(): Record<DemoTab, Row[]> {
  return Object.fromEntries(
    Object.entries(DEMO_TABLES).map(([key, table]) => [key, table.rows.map((row) => ({ ...row }))]),
  ) as Record<DemoTab, Row[]>;
}

export function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<{ users: number; activeUsers: number; plans: number; activePlans: number; memberships: number; activeMemberships: number; leads: number; newLeads: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [demoRows, setDemoRows] = useState<Record<DemoTab, Row[]>>(createDemoRows);
  const [demoEditorOpen, setDemoEditorOpen] = useState(false);
  const [demoEditId, setDemoEditId] = useState<string | null>(null);
  const [demoDraft, setDemoDraft] = useState<Row>({});
  const [demoNotice, setDemoNotice] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    if (!neon) return;
    neon.auth
      .getSession({ query: {} })
      .then(async ({ data }) => {
        const user = data.user;
        if (!user) return;
        const { data: profile, error } = await neon.from('profiles').select('role').eq('id', user.id).maybeSingle();
        const emailIsNamedAdmin = isAuthorisedAdminEmail(user.email);
        if (error || (profile?.role !== 'admin' && profile?.role !== 'coach') || (emailIsNamedAdmin && profile?.role !== 'admin')) {
          await neon.auth.signOut({});
          return;
        }
        setEmail(user.email ?? '');
        setSignedIn(true);
        void loadStats();
      })
      .catch(() => undefined);
  }, []);

  const loadStats = async () => {
    if (!neon) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    try {
      // Live mode reads the shared Neon records. Do not fall back to demo rows
      // or invent revenue when live queries fail.
      const [usersResult, plansResult, membershipsResult, leadsResult] = await Promise.all([
        neon.from('profiles').select('id,role,status', { count: 'exact' }),
        neon.from('plans').select('id,status,active', { count: 'exact' }),
        neon.from('memberships').select('id,status', { count: 'exact' }),
        neon.from('website_leads').select('id,status', { count: 'exact' }),
      ]);
      if (usersResult.error || plansResult.error || membershipsResult.error) {
        setError('We could not load the live dashboard totals from Neon. Check staff permissions and the profiles, plans and memberships table policies, then refresh.');
        setStats(null);
        return;
      }
      const users = usersResult.data ?? [];
      const plans = plansResult.data ?? [];
      const memberships = membershipsResult.data ?? [];
      const leads = leadsResult.error ? [] : (leadsResult.data ?? []);
      const isActive = (value: unknown) => String(value ?? '').trim().toLowerCase() === 'active';
      setStats({
        users: usersResult.count ?? users.length,
        activeUsers: users.filter((row) => isActive(row.status)).length,
        plans: plansResult.count ?? plans.length,
        activePlans: plans.filter((row) => isActive(row.status) || row.active === true).length,
        memberships: membershipsResult.count ?? memberships.length,
        activeMemberships: memberships.filter((row) => isActive(row.status)).length,
        leads: leadsResult.error ? 0 : (leadsResult.count ?? leads.length),
        newLeads: leads.filter((row) => String(row.status ?? '').toLowerCase() === 'new').length,
      });
      setError(null);
    } catch {
      setError('Could not reach the MW Fitness Neon backend. Live figures are unavailable until the connection is restored.');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!neon) {
      setError('Live sign-in is unavailable until the website Neon settings are configured.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await neon.auth.signIn.email({ email: email.trim(), password });
      if (error) throw error;
      const { data: profile, error: profileError } = await neon.from('profiles').select('role').eq('id', data.user!.id).maybeSingle();
      const emailIsNamedAdmin = isAuthorisedAdminEmail(data.user?.email ?? email);
      if (profileError || (profile?.role !== 'admin' && profile?.role !== 'coach') || (emailIsNamedAdmin && profile?.role !== 'admin')) {
        await neon.auth.signOut({});
        setError('This account does not have admin access.');
        return;
      }
      setDemoMode(false);
      setSignedIn(true);
      setEmail(data.user?.email ?? email.trim());
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    void neon?.auth.signOut({});
    setSignedIn(false);
    setDemoMode(false);
    setTab('overview');
    setStats(null);
    setPassword('');
  };

  const openDemo = () => {
    setDemoRows(createDemoRows());
    setDemoNotice('');
    setDemoMode(true);
    setSignedIn(false);
    setTab('overview');
    setStats(null);
    setError(null);
  };

  const exitDemo = () => {
    setDemoRows(createDemoRows());
    setDemoNotice('');
    setDemoEditorOpen(false);
    setDemoMode(false);
    setTab('overview');
  };

  const openDemoEditor = (row?: Row) => {
    if (tab === 'overview') return;
    const draft: Row = {};
    for (const field of DEMO_FIELDS[tab]) draft[field.key] = row?.[field.key] ?? '';
    setDemoDraft(draft);
    setDemoEditId(row ? String(row.id) : null);
    setDemoNotice('');
    setDemoEditorOpen(true);
  };

  const saveDemoRow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!demoMode || tab === 'overview') return;
    const currentTab = tab;
    const rowId = demoEditId ?? `demo-${currentTab}-${Date.now()}`;
    const savedRow = { ...demoDraft, id: rowId };
    setDemoRows((current) => ({
      ...current,
      [currentTab]: demoEditId
        ? current[currentTab].map((row) => row.id === demoEditId ? savedRow : row)
        : [...current[currentTab], savedRow],
    }));
    setDemoNotice('Sample change applied in this demo only. Nothing was sent to the database.');
    setDemoEditorOpen(false);
  };

  const removeDemoRow = (row: Row) => {
    if (!demoMode || tab === 'overview') return;
    const currentTab = tab;
    setDemoRows((current) => ({
      ...current,
      [currentTab]: current[currentTab].filter((item) => item.id !== row.id),
    }));
    setDemoNotice('Sample row removed in this demo only. Nothing was sent to the database.');
  };

  if (!signedIn && !demoMode && (forgotMode || new URLSearchParams(window.location.search).get('auth') === 'reset-password')) {
    return <PasswordRecovery onClose={() => { setForgotMode(false); setError(null); if (new URLSearchParams(window.location.search).has('auth')) window.history.replaceState({}, document.title, window.location.pathname); }} />;
  }

  if (!signedIn && !demoMode) {
    return (
      <div className="min-h-[70vh] w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-center">
        <div className="w-full max-w-md">
          <p className="font-mono text-[11px] text-orange-400 uppercase tracking-wider mb-2">Staff only</p>
          <h1 className="text-3xl font-bold text-white mb-1">MWFitnessUK HQ</h1>
          <p className="text-sm text-zinc-400 mb-8">Manage users, plans, nutrition and everything else — shared with the mobile app.</p>
          <form onSubmit={(e) => { e.preventDefault(); void handleSignIn(e); }} className="space-y-4">
            <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="you@mwfitness.co.uk" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            <input type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} placeholder="Password" className="w-full bg-[#121315] border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#ff5500]" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading || !neon} className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] disabled:opacity-50 text-black font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg active:scale-[0.98]">
              {loading ? 'Signing in…' : 'Sign in to HQ'}
            </button>
          </form>
          <div className="mt-3 text-right">
            <button type="button" onClick={() => { setForgotMode(true); setError(null); }} className="text-sm text-zinc-400 underline hover:text-white">Forgot password?</button>
          </div>
          <div className="mt-5 border-t border-zinc-800 pt-4">
            <button type="button" onClick={openDemo} className="w-full border border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg">
              Preview sample admin data
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">Try sample edits safely. Changes stay in this browser session and are never saved or sent.</p>
          </div>
        </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[60vh] w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-white">MWFitnessUK HQ</h1>
        {demoMode ? <span className="border border-orange-500/50 bg-orange-500/10 px-2 py-1 text-[10px] font-mono font-bold uppercase text-orange-300">Demo · sample data</span> : <span className="text-xs text-zinc-400">signed in as {email}</span>}
        <button onClick={demoMode ? exitDemo : signOut} className="text-xs text-zinc-500 underline">
          {demoMode ? 'Exit demo' : 'Sign out'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 lg:block">Workspace</p>
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:sticky lg:top-28 lg:flex lg:h-fit lg:flex-col lg:gap-1.5 lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[#131519] lg:p-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={
              tab === t.id
                ? 'flex w-full items-center justify-start rounded-xl bg-orange-500 px-3.5 py-3 text-left text-xs font-semibold text-black shadow-md shadow-orange-950/20 transition'
                : 'flex w-full items-center justify-start rounded-xl border border-transparent bg-white/[0.02] px-3.5 py-3 text-left text-xs font-medium text-zinc-400 transition hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400'
            }
          >
            {t.label}
          </button>
        ))}
      </div>
        </aside>
        <div className="min-w-0 space-y-5">


      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
          <Stat label="Customers" value={demoMode ? demoRows.users.length : statsLoading ? undefined : stats?.users} />
          <Stat label="Plans" value={demoMode ? demoRows.plans.length : statsLoading ? undefined : stats?.plans} />
          <Stat label="Memberships" value={demoMode ? demoRows.memberships.length : statsLoading ? undefined : stats?.memberships} />
        </div>
      )}
      {tab === 'overview' && !demoMode && (
        <div className="space-y-4">
          <section className={`${card} !border-white/[0.08] !bg-[#131519]`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Live business overview</p><h2 className="mt-1 text-xl font-semibold text-white">MW Fitness performance</h2><p className="mt-1 text-xs text-zinc-500">Live counts from Neon. No demo records are used in this view.</p></div>
              <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${stats ? 'bg-emerald-400' : 'bg-amber-400'}`} /><span className="text-xs text-zinc-400">{statsLoading ? 'Refreshing live data…' : stats ? 'Neon data loaded' : 'Live data unavailable'}</span><button type="button" onClick={() => void loadStats()} disabled={statsLoading} className={btnGhost}>{statsLoading ? 'Refreshing…' : 'Refresh'}</button></div>
            </div>
            {error ? <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</p> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Sign-ups / profiles', value: stats?.users, hint: 'Profiles in Neon', tab: 'users' as Tab, icon: '＋' },
                { label: 'Active memberships', value: stats?.activeMemberships, hint: `${stats?.memberships ?? '—'} total membership records`, tab: 'memberships' as Tab, icon: '●' },
                { label: 'Packages available', value: stats?.activePlans, hint: `${stats?.plans ?? '—'} total plans in Neon`, tab: 'plans' as Tab, icon: '↗' },
                { label: 'New enquiries', value: stats?.newLeads, hint: `${stats?.leads ?? '—'} total website leads`, tab: 'leads' as Tab, icon: '!' },
              ].map((stat) => (
                <button key={stat.label} type="button" onClick={() => setTab(stat.tab)} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1c21] to-[#111216] p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-500/35">
                  <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-orange-500/15 bg-orange-500/[0.08] text-sm text-orange-300">{stat.icon}</span><span className="text-xs font-medium text-zinc-400">{stat.label}</span><span className="mt-3 block text-3xl font-semibold tracking-tight text-white">{statsLoading || stat.value === undefined ? '—' : stat.value}</span><span className="mt-2 block text-xs text-zinc-500">{stat.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Member activation</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={stats && stats.users ? `${Math.round((stats.activeUsers / stats.users) * 100)} percent of live profiles marked active` : 'No live profile activation data'}>
                      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" />
                      <circle cx="50" cy="50" r="39" fill="none" stroke="#ff5500" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${stats && stats.users ? Math.min(1, stats.activeUsers / stats.users) * 245 : 0} 245`} />
                    </svg><span className="absolute text-lg font-semibold text-white">{stats && stats.users ? `${Math.round((stats.activeUsers / stats.users) * 100)}%` : '—'}</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Profiles marked active</p><p className="mt-1 text-xs leading-5 text-zinc-500">{stats ? `${stats.activeUsers} of ${stats.users} live profiles` : 'Waiting for live profile data.'}</p><button type="button" onClick={() => setTab('users')} className="mt-3 text-xs font-semibold text-orange-300">Review users ↗</button></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Package readiness</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={stats && stats.plans ? `${Math.round((stats.activePlans / stats.plans) * 100)} percent of live plans active` : 'No live plan data'}>
                      <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" />
                      <circle cx="50" cy="50" r="39" fill="none" stroke="#ff8a3d" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${stats && stats.plans ? Math.min(1, stats.activePlans / stats.plans) * 245 : 0} 245`} />
                    </svg><span className="absolute text-lg font-semibold text-white">{stats && stats.plans ? `${Math.round((stats.activePlans / stats.plans) * 100)}%` : '—'}</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Active plans</p><p className="mt-1 text-xs leading-5 text-zinc-500">{stats ? `${stats.activePlans} of ${stats.plans} live plans active` : 'Waiting for live plan data.'}</p><button type="button" onClick={() => setTab('plans')} className="mt-3 text-xs font-semibold text-orange-300">Manage plans ↗</button></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-zinc-500">Revenue and sales are intentionally omitted until a verified transaction source is connected. Website package defaults are not counted as sales, and frontend/demo defaults are never substituted for live database records.</p>
          </section>
          <section className={`${card} !border-white/[0.08] !bg-[#131519]`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange-300">Quick actions</p><h3 className="mt-1 text-lg font-semibold text-white">Run your coaching business</h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Review members', detail: 'Profiles and coaching tiers', tab: 'users' as Tab },
                { label: 'Manage plans & pricing', detail: 'Published packages and prices', tab: 'plans' as Tab },
                { label: 'Assign memberships', detail: 'Membership status and renewals', tab: 'memberships' as Tab },
                { label: 'Review check-ins', detail: 'Member feedback and follow-ups', tab: 'checkins' as Tab },
                { label: 'Review progress', detail: 'Weight and progress logs', tab: 'progress' as Tab },
                { label: 'Open website leads', detail: 'New enquiries and contact requests', tab: 'leads' as Tab },
              ].map((item) => <button key={item.label} type="button" onClick={() => setTab(item.tab)} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-orange-500/25 hover:bg-orange-500/[0.04]"><span className="block text-sm font-medium text-white">{item.label} <span className="text-orange-300">↗</span></span><span className="mt-1 block text-xs text-zinc-500">{item.detail}</span></button>)}
            </div>
          </section>
        </div>
      )}
      {demoMode && tab === 'overview' && (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#21170f] via-[#15171b] to-[#111216] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-orange-300">Coach workspace · sandbox</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your coaching command centre.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">Explore a populated example workspace, edit records and test the management flows. Everything here is fictional and stays in this browser session.</p>
              </div>
              <button type="button" onClick={() => setTab('users')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-950/30 transition hover:bg-orange-400">Open clients <span aria-hidden="true">↗</span></button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total sign-ups', value: demoRows.users.length, hint: 'Sample accounts created', tab: 'users' as Tab, icon: '＋' },
              { label: 'Active members', value: demoRows.users.filter((r) => r.status === 'Active').length, hint: 'Sample members marked active', tab: 'memberships' as Tab, icon: '●' },
              { label: 'Packages on sale', value: demoRows.plans.filter((r) => r.status === 'Active').length, hint: 'Active sample packages', tab: 'plans' as Tab, icon: '↗' },
              { label: 'Needs attention', value: demoRows.checkins.filter((r) => r.status === 'Needs review' || r.status === 'Follow up required').length + demoRows.leads.filter((r) => r.status === 'New').length, hint: 'Check-ins and new leads', tab: 'checkins' as Tab, icon: '!' },
            ].map((stat) => (
              <button key={stat.label} type="button" onClick={() => setTab(stat.tab)} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a1c21] to-[#111216] p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-500/35">
                <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-orange-500/15 bg-orange-500/[0.08] text-sm text-orange-300">{stat.icon}</span>
                <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
                <span className="mt-3 block text-3xl font-semibold tracking-tight text-white">{stat.value}</span>
                <span className="mt-2 block text-xs text-zinc-500">{stat.hint}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className={`${card} !rounded-2xl !border-white/[0.08] !bg-[#131519]`}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[0.18em] text-orange-300">MEMBER MOMENTUM</p><h3 className="mt-1 text-lg font-semibold text-white">Your coaching business at a glance</h3><p className="mt-1 text-xs text-zinc-500">Illustrative sandbox metrics · not live business figures</p></div><span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-300">Demo data</span></div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={`${Math.round((demoRows.users.filter((r) => r.status === "Active").length / Math.max(demoRows.users.length, 1)) * 100)} percent of sample members are active`}><circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" /><circle cx="50" cy="50" r="39" fill="none" stroke="#ff5500" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(demoRows.users.filter((r) => r.status === "Active").length / Math.max(demoRows.users.length, 1)) * 245} 245`} /></svg>
                    <span className="absolute text-lg font-semibold text-white">{Math.round((demoRows.users.filter((r) => r.status === "Active").length / Math.max(demoRows.users.length, 1)) * 100)}%</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Member activation</p><p className="mt-1 text-xs leading-5 text-zinc-500">{demoRows.users.filter((r) => r.status === 'Active').length} of {demoRows.users.length} sample accounts are active.</p><button type="button" onClick={() => setTab('users')} className="mt-3 text-xs font-semibold text-orange-300 hover:text-orange-200">View members ↗</button></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" role="img" aria-label={`${Math.round((demoRows.plans.filter((r) => r.status === "Active").length / Math.max(demoRows.plans.length, 1)) * 100)} percent of sample plans are active`}><circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/[0.07]" /><circle cx="50" cy="50" r="39" fill="none" stroke="#ff8a3d" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(demoRows.plans.filter((r) => r.status === "Active").length / Math.max(demoRows.plans.length, 1)) * 245} 245`} /></svg>
                    <span className="absolute text-lg font-semibold text-white">{Math.round((demoRows.plans.filter((r) => r.status === "Active").length / Math.max(demoRows.plans.length, 1)) * 100)}%</span>
                  </div>
                  <div><p className="text-sm font-medium text-white">Package readiness</p><p className="mt-1 text-xs leading-5 text-zinc-500">{demoRows.plans.filter((r) => r.status === 'Active').length} active sample packages in the catalogue.</p><button type="button" onClick={() => setTab('plans')} className="mt-3 text-xs font-semibold text-orange-300 hover:text-orange-200">Manage packages ↗</button></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-[#101114] p-4"><p className="text-xs text-zinc-500">Sample membership value</p><p className="mt-2 text-2xl font-semibold text-white">£{demoRows.memberships.filter((r) => r.status === "Active").reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString("en-GB")}</p><p className="mt-1 text-[11px] text-zinc-600">Illustrative recurring value from active sample memberships; not actual revenue.</p></div>
                <div className="rounded-xl border border-white/[0.06] bg-[#101114] p-4"><p className="text-xs text-zinc-500">New enquiries</p><p className="mt-2 text-2xl font-semibold text-white">{demoRows.leads.filter((r) => r.status === 'New').length}</p><p className="mt-1 text-[11px] text-zinc-600">Sample leads waiting for follow-up.</p><button type="button" onClick={() => setTab('leads')} className="mt-2 text-xs font-semibold text-orange-300">Open lead inbox ↗</button></div>
              </div>
            </section>
            <section className={`${card} !rounded-2xl !border-white/[0.08] !bg-[#131519]`}>
              <p className="text-xs text-zinc-500">COACH PRIORITIES</p><h3 className="mt-1 text-lg font-semibold text-white">Needs attention</h3>
              <div className="mt-4 space-y-3">
                {[
                  { title: 'Weekly check-ins', detail: 'Review client wellbeing and adherence.', count: demoRows.checkins.filter((r) => r.status === 'Needs review' || r.status === 'Follow up required').length, tab: 'checkins' as Tab },
                  { title: 'Lead follow-up', detail: 'Contact new enquiries and book consultations.', count: demoRows.leads.filter((r) => r.status === 'New').length, tab: 'leads' as Tab },
                  { title: 'Client progress', detail: 'Review measurements and coaching notes.', count: demoRows.progress.length, tab: 'progress' as Tab },
                ].map((item) => (
                  <button key={item.title} type="button" onClick={() => setTab(item.tab)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] p-3 text-left transition hover:border-orange-500/25 hover:bg-white/[0.025]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-sm font-semibold text-orange-300">{item.count}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-white">{item.title}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{item.detail}</span></span><span className="text-zinc-600">↗</span></button>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-orange-500/15 bg-orange-500/[0.05] p-3 text-xs leading-5 text-zinc-400">Sandbox only: edits are simulated locally. Sign in with staff credentials to work with live records.</p>
            </section>
          </div>
        </div>
      )}
      {demoMode && tab !== 'overview' && (
        <div className={`${card} !rounded-2xl !border-white/[0.08] !bg-[#131519] space-y-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase text-orange-300">{TABS.find((item) => item.id === tab)?.label} · sample records</p>
              <p className="mt-1 text-xs text-zinc-500">Edits are simulated locally and never reach Neon.</p>
            </div>
            <button type="button" onClick={() => openDemoEditor()} className={btn}><Plus className="h-4 w-4" aria-hidden="true" /> Add sample</button>
          </div>
          <AdminTable rows={demoRows[tab]} cols={DEMO_TABLES[tab].columns} empty="No sample records." onEdit={openDemoEditor} onDelete={removeDemoRow} />
          {demoNotice ? <p role="status" className="text-xs text-orange-200">{demoNotice}</p> : null}
        </div>
      )}
      {!demoMode && tab === 'users' && <UsersAdmin />}
      {!demoMode && tab === 'client-records' && <ClientRecordsAdmin />}
      {!demoMode && tab === 'plans' && <PlansAdmin />}
      {!demoMode && tab === 'memberships' && <MembershipsAdmin />}
      {!demoMode && tab === 'nutrition' && <NutritionAdmin />}
      {!demoMode && tab === 'workouts' && <WorkoutsAdmin />}
      {!demoMode && tab === 'programmes' && <ProgrammesAdmin />}
      {!demoMode && tab === 'videos' && <VideosAdmin />}
      {!demoMode && tab === 'checkins' && <CheckinsAdmin />}
      {!demoMode && tab === 'progress' && <ProgressAdmin />}
      {!demoMode && tab === 'messages' && <MessagesAdmin />}
      {!demoMode && tab === 'leads' && <LeadsAdmin />}
      {!demoMode && tab === 'member-activity' && <MemberActivityAdmin />}
      {!demoMode && tab === 'communications' && <CommunicationsAdmin />}
      {demoEditorOpen && demoMode && tab !== 'overview' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoEditorOpen(false); }}>
          <form onSubmit={saveDemoRow} role="dialog" aria-modal="true" aria-labelledby="demo-editor-title" className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-zinc-700 bg-[#121315] p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase text-orange-300">Demo only · not saved</p>
                <h2 id="demo-editor-title" className="mt-1 text-lg font-semibold text-white">{demoEditId ? 'Edit sample record' : 'Add sample record'}</h2>
              </div>
              <button type="button" onClick={() => setDemoEditorOpen(false)} className={btnGhost} aria-label="Close sample editor"><X className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {DEMO_FIELDS[tab].map((field) => (
                <label key={field.key} className={`grid gap-1.5 text-xs font-medium text-zinc-400 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                  <span>{field.label}</span>
                  {field.type === 'select' ? (
                    <select className={inp} value={String(demoDraft[field.key] ?? '')} onChange={(event) => setDemoDraft((draft) => ({ ...draft, [field.key]: event.target.value }))}>
                      <option value="">Choose…</option>
                      {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea rows={3} className={`${inp} resize-y`} placeholder={field.placeholder ?? ''} value={String(demoDraft[field.key] ?? '')} onChange={(event) => setDemoDraft((draft) => ({ ...draft, [field.key]: event.target.value }))} />
                  ) : (
                    <input type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} step={field.type === 'number' ? 'any' : undefined} className={inp} placeholder={field.placeholder ?? ''} value={String(demoDraft[field.key] ?? '')} onChange={(event) => setDemoDraft((draft) => ({ ...draft, [field.key]: event.target.value }))} />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setDemoEditorOpen(false)} className={btnGhost}>Cancel</button>
              <button type="submit" className={btn}>{demoEditId ? 'Apply sample edit' : 'Add sample record'}</button>
            </div>
          </form>
        </div>
      ) : null}
        </div>
      </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1b1d22] to-[#121316] p-4 transition hover:border-orange-500/25 sm:p-5">
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-orange-500/[0.06] blur-2xl transition group-hover:bg-orange-500/[0.12]" />
      <p className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value ?? '—'}</p>
      <p className="relative mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
    </div>
  );
}