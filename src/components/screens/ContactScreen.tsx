import React from 'react';
import { CONTACT } from '../../data/siteData';
import { SectionHeading } from '../ui';
import { EnquiryForm } from '../EnquiryForm';
import { Mail, Instagram, Facebook, MapPin, CalendarClock } from 'lucide-react';

export const ContactScreen: React.FC = () => {
  return (
    <div className="space-y-20 md:space-y-24">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionHeading
          eyebrow="Get in touch"
          title="Say hello — I'd love to hear from you"
          sub={`${CONTACT.responseNote} Whether you're ready to start or just curious, drop me a message and we'll take it from there.`}
        />
      </section>

      {/* Form + details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Inquiry form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-brand-border card-shadow p-7 md:p-9">
            <h2 className="font-display text-2xl font-bold text-brand-ink">Send an enquiry</h2>
            <p className="text-sm text-brand-muted mt-2">
              Fill this in and it goes straight to my inbox. No form spam — just a real message with your real details.
            </p>

            <div className="mt-8">
              <EnquiryForm kind="enquiry" variant="full" page="Contact page" heading="" />
            </div>
          </div>

          {/* Contact details */}
          <aside className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl border border-brand-border card-shadow p-6">
              <h3 className="font-display text-xl font-bold text-brand-ink mb-5">Contact details</h3>
              <ul className="space-y-3 text-[15px] text-brand-ink">
                <li className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-brand-orange-soft flex items-center justify-center shrink-0"><Mail className="w-4.5 h-4.5 text-brand-orange" /></span>
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-brand-orange transition-colors">{CONTACT.email}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-brand-orange-soft flex items-center justify-center shrink-0"><Instagram className="w-4.5 h-4.5 text-brand-orange" /></span>
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">@{CONTACT.instagramHandle}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-brand-orange-soft flex items-center justify-center shrink-0"><Facebook className="w-4.5 h-4.5 text-brand-orange" /></span>
                  <a href={CONTACT.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">{CONTACT.facebookName}</a>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border card-shadow p-6">
              <h3 className="font-display text-xl font-bold text-brand-ink mb-5">Where &amp; when</h3>
              <ul className="space-y-3 text-[15px] text-brand-ink">
                <li className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-brand-orange-soft flex items-center justify-center shrink-0"><MapPin className="w-4.5 h-4.5 text-brand-orange" /></span>
                  <span>{CONTACT.location}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-brand-orange-soft flex items-center justify-center shrink-0"><CalendarClock className="w-4.5 h-4.5 text-brand-orange" /></span>
                  <span>{CONTACT.sessions}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-brand-orange p-6 text-white">
              <h3 className="font-display text-xl font-bold mb-3">Prefer to cut to the chase?</h3>
              <p className="text-sm leading-relaxed">
                Just email {CONTACT.email} with your name and what you're after, and I'll reply personally — usually within 24 hours.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};