import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Receipt } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link } from 'react-router-dom';

export const RefundPolicy = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();

  return (
    <MainLayout>
      <div className="bg-gray-50 pt-24 md:pt-32 pb-16 border-b border-gray-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-noise"></div>
        <div className="max-w-[800px] mx-auto px-6 text-center relative z-10" ref={headerRef}>
          <div className={`inline-flex items-center justify-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-6 border border-brand-blue/20 transition-all duration-700 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Receipt className="w-4 h-4" /> Legal & Compliance
          </div>
          <h1 className={`font-heading text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight transition-all duration-700 delay-100 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Refund Policy
          </h1>
          <p className={`text-lg text-gray-500 font-medium transition-all duration-700 delay-200 ${headerVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-lg prose-blue max-w-none text-gray-600 font-medium">
          <p className="lead text-xl text-gray-900 font-bold mb-8">
            Astrix AI operates on an outcome-based pricing model. We believe in charging only when we deliver real, measurable value — when your invoices actually get paid.
          </p>

          <div className="bg-green-50 border border-green-100 p-6 rounded-2xl my-8">
            <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">Our Core Promise</h3>
            <p className="text-sm text-gray-700 m-0">
              The <strong>Hook (Free) plan</strong> charges nothing unless we successfully recover your first 3 invoices. You only pay when Astrix delivers results. This is not a trial — it&apos;s our standard offering for new users.
            </p>
          </div>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">1. Subscription Refunds</h2>
          <p className="mb-4">For paid plans (Solo and Agency):</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Annual Plans:</strong> If you cancel within 14 days of your initial annual subscription purchase and have not recovered more than 3 invoices through our platform, you are eligible for a full refund.</li>
            <li><strong>Monthly Plans:</strong> Monthly subscriptions are not eligible for refunds once a billing period has started. You may cancel at any time to prevent future charges.</li>
            <li><strong>Partial Month Refunds:</strong> We do not prorate or refund partial months under any circumstances.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">2. What Counts as a &quot;Successful Recovery&quot;</h2>
          <p className="mb-8">
            A successful recovery is defined as: a client paying an overdue invoice within 30 days of Astrix sending one or more AI-powered reminders on your behalf. If the client pays directly without using the Astrix checkout link, this does not count as a platform recovery.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">3. Eligibility for Refunds</h2>
          <p className="mb-4">You may be eligible for a refund if:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>You are an annual subscriber within your first 14 days AND have not yet had 3 successful recoveries.</li>
            <li>Astrix experienced a verifiable technical outage lasting more than 48 continuous hours during your billing period.</li>
            <li>You were charged in error due to a billing system fault on our side.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">4. Non-Refundable Situations</h2>
          <p className="mb-4">The following are not eligible for refunds:</p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li>You changed your mind after using the platform.</li>
            <li>Your clients refused to pay despite our reminders (outcome is not guaranteed).</li>
            <li>You connected an invalid payment gateway, preventing checkout link generation.</li>
            <li>You paused the AI for invoices and those invoices went unpaid as a result.</li>
            <li>You did not import or add any invoices to your workspace during the billing period.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">5. Payment Gateway Fees</h2>
          <p className="mb-8">
            Astrix does not control or refund fees charged by third-party payment gateways (Stripe, Razorpay, etc.). These fees are governed by your agreement with those providers and are the sole responsibility of you and your clients.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">6. How to Request a Refund</h2>
          <p className="mb-8">
            To request a refund, contact our support team at{' '}
            <a href="mailto:help.astrix@gmail.com" className="text-brand-blue font-bold hover:underline">help.astrix@gmail.com</a>{' '}
            with your account email, subscription start date, and a brief explanation. We aim to process all refund requests within 5 business days.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">7. Cancellations</h2>
          <p className="mb-8">
            You may cancel your subscription at any time from{' '}
            <Link to="/app/settings" className="text-brand-blue font-bold hover:underline">Settings &rarr; Billing</Link>. Upon cancellation, your access continues until the end of the current paid period. We do not charge any cancellation fees.
          </p>

          <h2 className="font-heading text-2xl font-bold text-gray-900 mt-12 mb-4">8. Contact</h2>
          <p>
            For any questions about this Refund Policy, please contact:{' '}
            <a href="mailto:help.astrix@gmail.com" className="text-brand-blue font-bold hover:underline">help.astrix@gmail.com</a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
