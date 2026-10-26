import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { test } from 'node:test';

// This suite deliberately requires a separate Neon test branch URL.
// It never falls back to DATABASE_URL, which may point at production.
const testDatabaseUrl = process.env.RELEASE_TEST_DATABASE_URL;
const skipReason = testDatabaseUrl
  ? false
  : 'Set RELEASE_TEST_DATABASE_URL to a disposable Neon test branch; production DATABASE_URL is never used.';

test('disposable Neon branch supports real insert/read/update/delete round-trip', { skip: skipReason }, async () => {
  assert.notEqual(testDatabaseUrl, process.env.DATABASE_URL, 'release integration tests must not use the production DATABASE_URL');
  const sql = neon(testDatabaseUrl!);
  await sql`CREATE TABLE IF NOT EXISTS mwfitness_release_test_records (
    id text PRIMARY KEY,
    label text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  const id = randomUUID();
  try {
    const inserted = await sql`INSERT INTO mwfitness_release_test_records (id, label)
      VALUES (${id}, 'created')
      RETURNING id, label`;
    assert.equal(inserted.length, 1);
    assert.equal(inserted[0].label, 'created');

    const read = await sql`SELECT id, label FROM mwfitness_release_test_records WHERE id = ${id}`;
    assert.equal(read.length, 1);
    assert.equal(read[0].label, 'created');

    const updated = await sql`UPDATE mwfitness_release_test_records
      SET label = 'updated', updated_at = now()
      WHERE id = ${id}
      RETURNING id, label`;
    assert.equal(updated.length, 1);
    assert.equal(updated[0].label, 'updated');

    const deleted = await sql`DELETE FROM mwfitness_release_test_records WHERE id = ${id} RETURNING id`;
    assert.equal(deleted.length, 1);
    const afterDelete = await sql`SELECT id FROM mwfitness_release_test_records WHERE id = ${id}`;
    assert.equal(afterDelete.length, 0);
  } finally {
    await sql`DELETE FROM mwfitness_release_test_records WHERE id = ${id}`;
  }
});
