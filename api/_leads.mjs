import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Website lead storage is not configured.');
  }
  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
}

/**
 * Persist website enquiries before sending an email notification.
 * DATABASE_URL is server-only; no privileged database credential reaches the browser.
 */
export async function saveWebsiteLead(lead) {
  const sql = getSql();
  const rows = await sql`
    insert into public.website_leads
      (kind, name, email, phone, interest, goal, times, message, page)
    values
      (${lead.kind}, ${lead.name}, ${lead.email}, ${lead.phone || null},
       ${lead.interest || null}, ${lead.goal || null}, ${JSON.stringify(lead.times ?? [])}::jsonb,
       ${lead.message || null}, ${lead.page || null})
    returning id
  `;
  if (!rows?.[0]?.id) throw new Error('Website enquiry could not be saved.');
  return { id: rows[0].id };
}
