import React, { useEffect, useState } from 'react';
import { SHWAG, CONTACT } from '../../data/mockData';
import { postEnquiry } from '../../lib/mail';
import { Shirt, CheckCircle, ArrowRight, Sparkles, ExternalLink, Instagram } from 'lucide-react';
import { StoreBadges } from '../StoreBadges';

type SwagProduct = { id: string; slug: string; name: string; description: string; category: string; price: number; compare_at_price: number | null; image_url: string; product_url: string; sizes: string[]; stock_status: string };
const FALLBACK_PRODUCTS: SwagProduct[] = SHWAG.products.map((product, index) => ({
  id: 'fallback-' + index,
  slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name: product.name,
  description: 'Price and availability on request. Send an enquiry to confirm current options and stock.',
  category: 'apparel',
  price: 0,
  compare_at_price: null,
  image_url: '',
  product_url: '',
  sizes: [],
  stock_status: 'enquiry_only',
}));

interface ShwagScreenProps {
  onOpenBookCall: () => void;
}

export const ShwagScreen: React.FC<ShwagScreenProps> = () => {
  const [products, setProducts] = useState<SwagProduct[]>(FALLBACK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/products').then(async (response) => {
      const result = await response.json() as { products?: SwagProduct[]; error?: string };
      if (!response.ok) throw new Error(result.error || 'The swag catalogue is temporarily unavailable.');
      if (active) {
        const nextProducts = Array.isArray(result.products) ? result.products : [];
        setProducts(nextProducts);
        setItem((current) => nextProducts.some((product) => product.name === current) ? current : nextProducts[0]?.name || 'Something else');
      }
    }).catch((err) => { if (active) setProductsError(err instanceof Error ? err.message : 'The swag catalogue is temporarily unavailable.'); })
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, []);
  const chooseProduct = (productName: string) => {
    setItem(productName);
    document.getElementById('swag-order-enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [item, setItem] = useState('Classic SHWAG T-Shirt');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    const result = await postEnquiry({
      kind: 'shwag',
      name,
      email,
      interest: item,
      message,
      page: 'shwag',
    });
    setSending(false);
    if (result.ok) setDone(true);
    else setError(result.error || 'Something went wrong. Please try again.');
  };

  const inputClass =
    'w-full bg-[#16181d] border border-[#262930] text-zinc-200 px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#ff5500] placeholder:text-zinc-600';

  return (
    <div className="page-layout">
      {/* 1. HERO */}
      <section className="page-hero relative min-h-[40vh] flex items-center justify-center overflow-hidden border-b border-[#262930]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0b0c0e]"></div>
          <div className="absolute inset-0 bg-dots-pattern opacity-60"></div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#ff5500]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16181e]/90 border border-[#ff5500]/60 text-xs font-mono text-[#ff5500] uppercase tracking-widest backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ff5500] animate-pulse"></span>
              <span>[ SHWAG ]</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase leading-[0.9] font-black">
              SHWAG.
            </h1>

            <p className="text-base sm:text-lg font-sans text-zinc-300 leading-relaxed max-w-2xl">
              {SHWAG.intro}
            </p>
            <div className="mt-6 space-y-3"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">MWFitnessUK app · coming soon</p><StoreBadges /></div>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="industrial-stripe industrial-stripe--divider" />

      {/* 2. WHAT SHWAG STANDS FOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#121419] border border-[#20232b] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl text-white uppercase">What SHWAG stands for</div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{SHWAG.meaning}</p>
          </div>

          <div className="bg-[#121419] border border-[#20232b] p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ff5500]/15 border border-[#ff5500] flex items-center justify-center text-[#ff5500]">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="font-display text-2xl text-white uppercase">SHWAG & MWFitnessUK</div>
            </div>
            <p className="text-sm font-sans text-zinc-300 leading-relaxed">{SHWAG.whyItWorks}</p>
          </div>
        </div>
      </section>

      {/* 3. PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#22252e] pb-4 mb-10">
          <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
            [ THE RANGE ]
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight">
            WEAR THE ATTITUDE.
          </h2>
        </div>

        {productsLoading ? <p className="text-sm text-zinc-400">Loading the latest SHWAG range…</p> : null}
        {productsError ? <p role="status" className="mb-4 border border-orange-500/20 bg-orange-500/5 p-3 text-sm text-zinc-300">{productsError} You can still send an order enquiry below.</p> : null}
        {!productsLoading && products.length === 0 ? <div className="border border-dashed border-[#30333b] bg-[#121419] p-8 text-center"><Shirt className="mx-auto mb-3 h-8 w-8 text-[#ff5500]/60" /><h3 className="font-display text-xl text-white uppercase">New drops coming soon</h3><p className="mt-2 text-sm text-zinc-400">Ask Mike about available sizes, colours and upcoming SHWAG.</p></div> : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <article key={product.id} className="bg-[#121419] border border-[#20232b] p-5 flex flex-col hover:border-[#ff5500]/50 transition-all duration-300">
              <div className="aspect-square bg-[#16181d] border border-[#262930] flex items-center justify-center mb-4 overflow-hidden">
                {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover" /> : <Shirt className="w-12 h-12 text-[#ff5500]/40" />}
              </div>
              <h3 className="font-display text-xl text-white uppercase tracking-wider mb-1">{product.name}</h3>
              {product.description ? <p className="text-sm text-zinc-400 leading-relaxed mb-3">{product.description}</p> : null}
              <p className="font-mono text-lg text-[#ff5500] mb-2">{Number(product.price) > 0 ? '£' + Number(product.price).toFixed(2) : 'Price on request'}{Number(product.price) > 0 && product.compare_at_price != null && product.compare_at_price > product.price ? <span className="ml-2 text-xs text-zinc-500 line-through">£{Number(product.compare_at_price).toFixed(2)}</span> : null}</p>
              {product.sizes?.length ? <p className="text-[11px] text-zinc-500 mb-3">Sizes: {product.sizes.join(', ')}</p> : null}
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-4">{(product.stock_status === 'enquiry_only' ? 'enquiry only' : String(product.stock_status).replace('_', ' '))}</p>
              <div className="mt-auto">
                {product.product_url && product.stock_status !== 'sold_out' ? <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 bg-[#ff5500] px-4 py-3 text-xs font-mono font-bold uppercase text-black">View product <ExternalLink className="h-3.5 w-3.5" /></a> : <button type="button" disabled={product.stock_status === 'sold_out'} onClick={() => chooseProduct(product.name)} className="inline-flex w-full items-center justify-center gap-2 border border-[#ff5500]/60 px-4 py-3 text-xs font-mono font-bold uppercase text-[#ff5500] disabled:opacity-40">{product.stock_status === 'sold_out' ? 'Sold out' : 'Enquire about item'} <ArrowRight className="h-3.5 w-3.5" /></button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ORDER ENQUIRY */}
      <section id="swag-order-enquiry" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#121419] border border-[#242833] p-8 md:p-10">
          {done ? (
            <div className="space-y-5 text-center py-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#181d19] border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">Order request sent</div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wider">
                Nice one, {name.split(' ')[0] || 'there'}!
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed max-w-md mx-auto">
                Mike will be in touch with prices and availability for your SHWAG order.
              </p>

              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#ff5500] font-mono text-xs uppercase transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#ff5500]" />
                Follow @{CONTACT.instagramHandle} for SHWAG drops
              </a>
            </div>
          ) : (
            <>
              <div className="text-xs font-mono text-[#ff5500] uppercase tracking-widest mb-1">
                [ ORDER ENQUIRY ]
              </div>
              <h2 className="font-display text-3xl text-white uppercase tracking-wide mb-2">
                GET YOUR SHWAG
              </h2>
              <p className="text-sm font-sans text-zinc-400 leading-relaxed mb-6">
                Interested in a piece? Drop your details and which item you're after, and we'll sort the rest.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Your name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Which item?</label>
                  <select value={item} onChange={(e) => setItem(e.target.value)} className={inputClass}>
                    {products.map((product) => (
                      <option key={product.id} value={product.name}>{product.name}</option>
                    ))}
                    <option value="Something else">Something else</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Anything else? (size, colour, quantity)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div className="bg-[#2a1414] border border-red-500/50 text-red-300 text-sm px-4 py-3 font-mono">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-7 py-3.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95 disabled:opacity-60"
                >
                  {sending ? 'Sending...' : 'Send order enquiry'}
                  {!sending && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};