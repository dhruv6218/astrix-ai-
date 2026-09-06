import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle2, CreditCard, FileText, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

const capabilities = [
  { icon: FileText, title: 'One recovery queue', description: 'See every overdue invoice, its latest reminder, and the next best action in one calm workspace.' },
  { icon: Bot, title: 'Your voice, on repeat', description: 'Teach Astrix how you write once. Every follow-up stays human, consistent, and unmistakably yours.' },
  { icon: CreditCard, title: 'One-click payment paths', description: 'Connect a gateway and put a clear payment link inside every reminder without rebuilding your invoice flow.' },
  { icon: Gauge, title: 'Recovery you can explain', description: 'Track recovered revenue, active chases, response rates, and the moments that move cash forward.' },
  { icon: ShieldCheck, title: 'Guardrails by default', description: 'Pause a chase, review a draft, or change the escalation rhythm before anything reaches a client.' },
  { icon: Sparkles, title: 'Less awkward work', description: 'Astrix handles the repetitive follow-up while you stay focused on the work that created the invoice.' },
];

export const Features: React.FC = () => (
  <div className="min-h-screen bg-[#f7f9fb] text-gray-900 font-sans">
    <header className="border-b border-gray-200 bg-white/90 px-6 py-5 backdrop-blur-xl md:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="font-heading text-xl font-black tracking-tight text-gray-950">ASTRIX<span className="text-brand-blue">.AI</span></Link>
        <nav className="flex items-center gap-4 text-sm font-bold text-gray-500"><Link to="/pricing" className="hover:text-gray-950">Pricing</Link><Link to="/login" className="hover:text-gray-950">Log in</Link><Link to="/signup" className="rounded-lg bg-gray-950 px-4 py-2 text-white">Start free</Link></nav>
      </div>
    </header>
    <main>
      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-40">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gray-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-astrix-teal" /> The recovery operating system
          </div>
          <h1 className="font-heading text-balance text-5xl font-black tracking-[-0.06em] text-gray-950 md:text-7xl">Get paid without becoming the collections department.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-gray-500 md:text-xl">Astrix turns overdue invoice follow-up into a thoughtful, measurable workflow that protects your relationships and your cash flow.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5">Start recovering revenue <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/pricing" className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:border-gray-300">See plans</Link>
          </div>
        </div>
      </section>
      <section className="px-6 pb-24 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-astrix-teal/10 text-astrix-teal"><Icon className="h-5 w-5" /></div>
              <h2 className="font-heading text-xl font-bold text-gray-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-gray-400"><CheckCircle2 className="h-4 w-4 text-astrix-teal" /> Built for calm operations</div>
            </article>
          ))}
        </div>
      </section>
    </main>
    <footer className="border-t border-gray-200 bg-white px-6 py-10 md:px-12"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between"><span className="font-heading font-black tracking-tight text-gray-950">ASTRIX.AI</span><span>Autonomous revenue recovery for modern teams.</span><div className="flex gap-4"><Link to="/privacy" className="hover:text-gray-950">Privacy</Link><Link to="/terms" className="hover:text-gray-950">Terms</Link></div></div></footer>
  </div>
);
