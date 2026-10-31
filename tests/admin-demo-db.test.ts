import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { demoDb, resetDemoDb } from '../src/lib/admin/demoDb';

afterEach(() => {
  resetDemoDb();
});

test('demo Staff HQ starts with seeded plans and supports ordering', async () => {
  const result = await demoDb.from('plans').select('id,name,price').order('price');

  assert.equal(result.error, null);
  assert.ok((result.data?.length ?? 0) > 0);
  const prices = (result.data ?? []).map((row) => Number(row.price));
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

test('demo Staff HQ supports create, read, update and delete round trips', async () => {
  const created = await demoDb.from('plans').insert({
    id: 'release-test-plan',
    name: 'Release test plan',
    price: 10,
    active: true,
  }).select('id,name,price');

  assert.equal(created.error, null);
  assert.deepEqual(created.data?.[0], {
    id: 'release-test-plan',
    name: 'Release test plan',
    price: 10,
  });

  const updated = await demoDb.from('plans').update({
    name: 'Updated release test plan',
    price: 15,
  }).eq('id', 'release-test-plan').select('id,name,price');

  assert.equal(updated.error, null);
  assert.deepEqual(updated.data?.[0], {
    id: 'release-test-plan',
    name: 'Updated release test plan',
    price: 15,
  });

  const deleted = await demoDb.from('plans').delete()
    .eq('id', 'release-test-plan')
    .select('id');

  assert.equal(deleted.error, null);
  assert.deepEqual(deleted.data, [{ id: 'release-test-plan' }]);

  const afterDelete = await demoDb.from('plans').select('id')
    .eq('id', 'release-test-plan');

  assert.equal(afterDelete.error, null);
  assert.deepEqual(afterDelete.data, []);
});

test('demo Staff HQ resolves embedded profile and plan relations', async () => {
  const inserted = await demoDb.from('memberships').insert({
    id: 'release-test-membership',
    profile_id: 'demo-coach-mike',
    plan_id: 'pt-single',
    status: 'active',
  }).select('id');

  assert.equal(inserted.error, null);

  const membership = await demoDb.from('memberships')
    .select('id,status,profiles(full_name,email),plans(name,price)')
    .eq('id', 'release-test-membership')
    .maybeSingle();

  assert.equal(membership.error, null);
  assert.equal(membership.data?.profiles?.full_name, 'Mike Whitworth');
  assert.equal(membership.data?.plans?.name, 'Single PT session');
  assert.equal(membership.data?.plans?.price, 45);
});

test('demo Staff HQ workout library, schedules and performance remain editable', async () => {
  const templateExercise = await demoDb.from('workout_template_exercises')
    .select('exercise_name,workout_exercises(name),workout_templates(name)')
    .eq('id', 'wte-upper-bench')
    .maybeSingle();
  assert.equal(templateExercise.error, null);
  assert.equal(templateExercise.data?.workout_exercises?.name, 'Barbell Bench Press');
  assert.equal(templateExercise.data?.workout_templates?.name, 'Upper body A');

  const schedule = await demoDb.from('workout_schedules').insert({
    id: 'release-test-workout-schedule',
    profile_id: 'demo-coach-mike',
    template_id: 'wt-upper-a',
    weekdays: [1, 3],
    starts_on: '2026-10-31',
    ends_on: null,
    active: true,
  }).select('id,weekdays,starts_on');
  assert.deepEqual(schedule.data?.[0], {
    id: 'release-test-workout-schedule',
    weekdays: [1, 3],
    starts_on: '2026-10-31',
  });

  const session = await demoDb.from('workout_sessions').insert({
    id: 'release-test-workout-session',
    profile_id: 'demo-coach-mike',
    template_id: 'wt-upper-a',
    scheduled_on: '2026-10-31',
    status: 'completed',
    exercises: [{ exercise_id: 'we-bench', name: 'Barbell Bench Press' }],
    performance: { exercises: [{ exercise_id: 'we-bench', name: 'Barbell Bench Press', values: { reps: '8', load: '80' } }] },
  }).select('id,performance');
  assert.equal(session.error, null);
  assert.equal(session.data?.[0].performance.exercises[0].values.load, '80');

  const updated = await demoDb.from('workout_sessions').update({ scheduled_on: '2026-11-01' })
    .eq('id', 'release-test-workout-session').select('id,scheduled_on');
  assert.equal(updated.data?.[0].scheduled_on, '2026-11-01');

  const deleted = await demoDb.from('workout_schedules').delete()
    .eq('id', 'release-test-workout-schedule').select('id');
  assert.deepEqual(deleted.data, [{ id: 'release-test-workout-schedule' }]);
});

test('demo Staff HQ reset discards changes from the previous demo session', async () => {
  const inserted = await demoDb.from('plans').insert({
    id: 'release-test-reset',
    name: 'Temporary test plan',
    price: 1,
  }).select('id');

  assert.equal(inserted.error, null);
  resetDemoDb();

  const result = await demoDb.from('plans').select('id')
    .eq('id', 'release-test-reset');

  assert.equal(result.error, null);
  assert.deepEqual(result.data, []);
});

test('demo Staff HQ reports an unknown table instead of silently returning empty data', async () => {
  const result = await demoDb.from('not_a_real_table').select('*');

  assert.equal(result.data, null);
  assert.equal(result.error?.code, '42P01');
  assert.match(result.error?.message ?? '', /does not exist/);
});
