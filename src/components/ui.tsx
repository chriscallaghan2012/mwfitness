import React from 'react';
import { Star } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, sub, align = 'center' }) => {
  const alignCls = align === 'center' ? 'text-center mx-auto' : '';
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <span className="inline-block mb-3 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-semibold uppercase tracking-wider">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink tracking-tight">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base sm:text-lg text-brand-body leading-relaxed">{sub}</p>}
    </div>
  );
};

interface StarsProps {
  rating: number;
}

export const Stars: React.FC<StarsProps> = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < full ? 'fill-brand-orange text-brand-orange' : 'fill-[#d9d4cc] text-[#d9d4cc]'}`}
        />
      ))}
    </div>
  );
};