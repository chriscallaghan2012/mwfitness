import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CtaButtonProps {
  onOpen: () => void;
  label?: string;
  variant?: 'solid' | 'outline' | 'white' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
}

const VARIANTS: Record<string, string> = {
  solid: 'bg-brand-orange hover:bg-brand-orange-dark text-white',
  outline: 'bg-white hover:bg-brand-orange-soft text-brand-ink border border-brand-border',
  white: 'bg-white hover:bg-brand-orange-soft text-brand-ink',
  ghost: 'bg-brand-orange/10 hover:bg-white/20 text-white border border-white/60',
};

const SIZES: Record<string, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

/**
 * The one CTA used everywhere on the site ("Book a free chat" / "Get in touch").
 * It opens the shared contact modal — pass an `onOpen` that opens the modal.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  onOpen,
  label = 'Book a free chat',
  variant = 'solid',
  size = 'md',
  className = '',
}) => (
  <button
    type="button"
    onClick={onOpen}
    className={`inline-flex items-center gap-2.5 font-semibold rounded-full transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
  >
    {label}
    <ArrowRight className="w-4 h-4" />
  </button>
);