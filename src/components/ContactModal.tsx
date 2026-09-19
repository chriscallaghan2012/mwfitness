import React, { useEffect } from 'react';
import { ContactKind } from '../types';
import { EnquiryForm } from './EnquiryForm';
import { X } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  kind: ContactKind;
  defaultInterest?: string;
  source?: string;
  onClose: () => void;
}

const MODAL_META: Record<ContactKind, { title: string; intro: string }> = {
  enquiry: {
    title: 'Send an enquiry',
    intro: 'Fill this in and it goes straight to my inbox. No form spam, just a real message.',
  },
  'book-call': {
    title: 'Book a free chat',
    intro: 'Tell me a bit about you and I\'ll come back with some times that work. No pressure, no hard sell.',
  },
  waitlist: {
    title: 'Join the app waitlist',
    intro: 'Leave your details and I\'ll email you the moment the MWFitnessUK app is ready.',
  },
  shwag: {
    title: 'SHWAG order request',
    intro: 'Tell me what you\'re after and I\'ll get back to you with the latest prices — 10% off for MWFitnessUK clients.',
  },
};

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  kind,
  defaultInterest,
  source,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const meta = MODAL_META[kind];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={meta.title}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl card-shadow-hover p-6 md:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-ink">{meta.title}</h2>
            <p className="text-sm text-brand-muted mt-1">{meta.intro}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-full text-brand-muted hover:text-brand-ink hover:bg-brand-orange-soft transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <EnquiryForm
          kind={kind}
          variant="compact"
          defaultInterest={defaultInterest}
          page={source || 'Website'}
          heading=""
        />
      </div>
    </div>
  );
};