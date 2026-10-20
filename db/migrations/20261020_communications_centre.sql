-- MW Fitness communications centre foundation.
-- Prepared migration only: DO NOT apply to shared/production Neon without approval.

CREATE TABLE IF NOT EXISTS public.communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','push','in_app')),
  category text NOT NULL CHECK (category IN ('transactional','service','marketing','internal')),
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  html_body text NOT NULL DEFAULT '',
  text_body text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key text NOT NULL UNIQUE,
  name text NOT NULL,
  trigger_key text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','push','in_app')),
  template_key text NOT NULL REFERENCES public.communication_templates(template_key) ON UPDATE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  audience_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  delay_minutes integer NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text,
  source text NOT NULL CHECK (source IN ('automation','manual','system')),
  channel text NOT NULL CHECK (channel IN ('email','push','in_app')),
  category text NOT NULL CHECK (category IN ('transactional','service','marketing','internal')),
  template_key text REFERENCES public.communication_templates(template_key) ON UPDATE CASCADE ON DELETE SET NULL,
  template_version integer,
  subject text NOT NULL DEFAULT '',
  body_snapshot text NOT NULL DEFAULT '',
  audience_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('draft','queued','processing','accepted','partial','failed','cancelled')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS communication_events_created_at_idx ON public.communication_events (created_at DESC);
CREATE INDEX IF NOT EXISTS communication_events_channel_status_idx ON public.communication_events (channel,status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.communication_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.communication_events(id) ON DELETE CASCADE,
  recipient_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email text NOT NULL DEFAULT '',
  recipient_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','accepted','delivered','failed','no_device','skipped','bounced','complained','unsubscribed')),
  provider text NOT NULL DEFAULT '',
  provider_message_id text NOT NULL DEFAULT '',
  error_code text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
CREATE INDEX IF NOT EXISTS communication_deliveries_event_idx ON public.communication_deliveries (event_id,status);
CREATE INDEX IF NOT EXISTS communication_deliveries_email_idx ON public.communication_deliveries (lower(recipient_email));

CREATE TABLE IF NOT EXISTS public.communication_marketing_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  marketing_email_consent boolean NOT NULL DEFAULT false,
  marketing_push_consent boolean NOT NULL DEFAULT false,
  consent_source text NOT NULL DEFAULT '',
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  suppression_reason text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS communication_marketing_preferences_profile_idx ON public.communication_marketing_preferences (profile_id);
CREATE UNIQUE INDEX IF NOT EXISTS communication_marketing_preferences_email_lower_key ON public.communication_marketing_preferences (lower(email));

-- Only admin/coach profiles may use these tables through the authenticated Data API.
-- Dispatch endpoints must independently validate the session and role on the server.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['communication_templates','communication_automation_rules','communication_events','communication_deliveries','communication_marketing_preferences']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('DROP POLICY IF EXISTS "staff manage %s" ON public.%I',t,t);
    EXECUTE format(
      'CREATE POLICY "staff manage %s" ON public.%I FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''admin'',''coach''))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''admin'',''coach'')))',
      t,t
    );
    EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO authenticated',t);
  END LOOP;
END $$;

-- Starter email designs. All automation rules remain disabled until their event hook
-- and delivery path are implemented and tested end-to-end.
INSERT INTO public.communication_templates
(template_key,name,channel,category,subject,preheader,html_body,text_body)
VALUES
('website-enquiry-alert','Website enquiry alert (staff)','email','internal','New MW Fitness enquiry: {{name}}','A new enquiry needs your attention.','<h1>New enquiry received</h1><p>{{name}} · {{email}}</p><p>{{interest}}</p><p>{{message}}</p><a href="{{admin_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">Open Staff HQ</a>','New enquiry: {{name}} · {{email}} · {{interest}} · {{message}}'),
('website-enquiry-acknowledgement','Website enquiry acknowledgement','email','transactional','Thanks for contacting MW Fitness, {{name}}','We have received your message.','<h1 style="color:#17191d">Thanks for getting in touch, {{name}}</h1><p>We have received your message and will get back to you as soon as we can.</p><p style="color:#ff5500">MW Fitness · Training, nutrition and coaching built around you.</p>','Thanks for getting in touch, {{name}}. We have received your message and will get back to you as soon as we can.'),
('consultation-confirmation','Free consultation confirmation','email','transactional','Your MW Fitness consultation request','Your next step starts here.','<h1 style="color:#17191d">Let’s talk about your goals</h1><p>Hi {{name}}, we received your free consultation request and will contact you to agree a time.</p>','Hi {{name}}, we received your free consultation request and will contact you to agree a time.'),
('app-waitlist-acknowledgement','App waitlist acknowledgement','email','transactional','You’re on the MW Fitness app waitlist','We will let you know when there is news.','<h1 style="color:#17191d">You’re on the list, {{name}}</h1><p>Thanks for your interest in the MW Fitness app. We will contact you when there is an update.</p>','Thanks for your interest in the MW Fitness app, {{name}}. We will contact you when there is an update.'),
('app-ready-announcement','App launch announcement','email','marketing','The MW Fitness app is ready','Your training tools are ready when you are.','<h1 style="color:#17191d">Your training, in your pocket</h1><p>Hi {{name}}, the MW Fitness app is ready.</p><a href="{{app_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">Open the app</a><p>{{unsubscribe_url}}</p>','Hi {{name}}, the MW Fitness app is ready: {{app_url}}. Unsubscribe: {{unsubscribe_url}}'),
('member-welcome','Member welcome','email','transactional','Welcome to MW Fitness, {{name}}','Let’s get your training started.','<h1 style="color:#17191d">Welcome, {{name}}</h1><p>We’re glad to have you with MW Fitness. Sign in to view your plan and coaching updates.</p><a href="{{app_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">Open your member area</a>','Welcome to MW Fitness, {{name}}. Sign in: {{app_url}}'),
('programme-assigned','Coaching programme assigned','email','service','Your new training programme is ready','Your coach has updated your plan.','<h1 style="color:#17191d">Your programme is ready, {{name}}</h1><p>Your coach has assigned or updated {{programme_name}}.</p><a href="{{app_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">View programme</a>','Your coach has assigned or updated {{programme_name}}. View: {{app_url}}'),
('workout-reminder','Workout reminder','email','service','Your MW Fitness workout reminder','Your next session is coming up.','<h1 style="color:#17191d">Time to train, {{name}}</h1><p>Your next session is {{workout_name}} at {{workout_time}}.</p>','Your next session is {{workout_name}} at {{workout_time}}.'),
('checkin-reminder','Weekly check-in reminder','email','service','Your weekly check-in is ready','A few minutes to keep your progress on track.','<h1 style="color:#17191d">How has your week been, {{name}}?</h1><p>Your weekly check-in is ready.</p><a href="{{app_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">Complete check-in</a>','Your weekly check-in is ready, {{name}}. Open: {{app_url}}'),
('nutrition-plan-updated','Nutrition plan assigned or updated','email','service','Your nutrition plan has been updated','Your latest nutrition guidance is ready.','<h1 style="color:#17191d">Your nutrition plan is ready</h1><p>Hi {{name}}, your coach has updated your nutrition plan.</p><a href="{{app_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">View nutrition plan</a>','Hi {{name}}, your nutrition plan has been updated: {{app_url}}'),
('membership-renewal-reminder','Membership renewal reminder','email','transactional','Your MW Fitness membership renewal','A reminder about your upcoming renewal.','<h1 style="color:#17191d">Membership reminder</h1><p>Hi {{name}}, your {{plan_name}} membership is due to renew on {{renewal_date}}.</p>','Hi {{name}}, your {{plan_name}} membership is due to renew on {{renewal_date}}.'),
('payment-failed','Payment issue notification','email','transactional','Action needed for your MW Fitness membership','Please check your latest payment.','<h1 style="color:#17191d">Let’s sort out your payment</h1><p>Hi {{name}}, we could not confirm your latest membership payment. Please review your billing details or contact the team.</p><a href="{{billing_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">Review billing</a>','Hi {{name}}, we could not confirm your latest payment. Review billing: {{billing_url}}'),
('general-announcement','General member announcement','email','marketing','{{subject}}','{{preheader}}','<h1 style="color:#17191d">{{headline}}</h1><p>{{body}}</p><a href="{{cta_url}}" style="background:#ff5500;color:#fff;padding:12px 18px">{{cta_label}}</a><p>{{unsubscribe_url}}</p>','{{headline}}\n{{body}}\n{{cta_label}}: {{cta_url}}\nUnsubscribe: {{unsubscribe_url}}')
ON CONFLICT (template_key) DO NOTHING;

INSERT INTO public.communication_automation_rules (rule_key,name,trigger_key,channel,template_key,enabled)
VALUES
('website-enquiry-alert','Alert staff about new website enquiries','website_lead.created','email','website-enquiry-alert',false),
('website-enquiry-acknowledgement','Acknowledge website enquiries','website_lead.created','email','website-enquiry-acknowledgement',false),
('consultation-confirmation','Confirm consultation requests','consultation.requested','email','consultation-confirmation',false),
('app-waitlist-acknowledgement','Acknowledge app waitlist sign-ups','app_waitlist.created','email','app-waitlist-acknowledgement',false),
('app-ready-announcement','Announce app launch to consented members','app.launch_announced','email','app-ready-announcement',false),
('member-welcome','Welcome new members','member.created','email','member-welcome',false),
('programme-assigned','Notify member when programme assigned','programme.assigned','email','programme-assigned',false),
('workout-reminder','Remind members about upcoming workouts','workout.reminder_due','email','workout-reminder',false),
('checkin-reminder','Remind members to submit check-ins','checkin.reminder_due','email','checkin-reminder',false),
('nutrition-plan-updated','Notify members of nutrition plan changes','nutrition_plan.assigned_or_updated','email','nutrition-plan-updated',false),
('membership-renewal-reminder','Remind members about renewals','membership.renewal_due','email','membership-renewal-reminder',false),
('payment-failed','Notify members about payment failures','membership.payment_failed','email','payment-failed',false)
ON CONFLICT (rule_key) DO NOTHING;
