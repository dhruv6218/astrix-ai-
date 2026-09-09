import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Search, Filter, AlertCircle } from 'lucide-react';

export const ToneCloningSection = () => {
  const { ref, isVisible } = useScrollReveal(0.2);

  const invoices = [
    { source: "Stripe", text: "Invoice #1042 for Acme Corp - $2,400 overdue by 14 days.", sentiment: "Overdue", severity: "High", area: "Design" },
    { source: "Manual", text: "Invoice #1039 for TechStart GmbH - €1,800 overdue by 7 days.", sentiment: "Pending", severity: "Medium", area: "Development" },
    { source: "Razorpay", text: "Invoice #1035 for DataFlow Ltd - $890 paid on time.", sentiment: "Paid", severity: "Low", area: "Consulting" },
  ];

  return (
    <section id="features" className="py-24 md:py-40 bg-white relative overflow-hidden border-t border-gray-100" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="mb-12 md:mb-20 text-center">
          <div className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-6 flex items-center justify-center gap-4 font-bold">
            <span className="w-8 h-[2px] bg-gray-300"></span> Feature 01: Tone Studio <span className="w-8 h-[2px] bg-gray-300"></span>
          </div>
          <h2 className="font-heading text-fluid-2 leading-[0.9] tracking-tighter text-gray-900">
            Your Voice. <br/>
            <span className="text-brand-blue">On Autopilot.</span>
          </h2>
        </div>

        {/* Realistic Invoice Dashboard Mockup */}
        <div 
          className={`relative max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 bg-gray-50/50 gap-4 sm:gap-0">
            <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-1.5 rounded-md w-full sm:w-1/2 shadow-sm focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search 47 invoices..." className="font-mono text-sm text-gray-900 w-full focus:outline-none bg-transparent placeholder-gray-400" />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button className="flex items-center justify-center w-full sm:w-auto gap-2 font-mono text-xs text-gray-600 font-bold hover:text-brand-blue transition-colors bg-white border border-gray-200 px-4 py-2 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                <Filter className="w-3 h-3"/> Filter
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 font-mono text-xs text-gray-500 uppercase tracking-wider p-4 border-b border-gray-100 bg-gray-50 font-semibold">
            <div className="col-span-2">Source</div>
            <div className="col-span-5">Invoice Details</div>
            <div className="col-span-5 flex justify-between">
              <span>Status</span>
              <span>Severity</span>
              <span>Service</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {invoices.map((inv, i) => (
              <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center p-4 hover:bg-gray-50 transition-colors group cursor-pointer" tabIndex={0} role="button" aria-label={`View invoice from ${inv.source}`}>
                <div className="md:col-span-2 font-mono text-sm text-gray-900 font-medium">{inv.source}</div>
                <div className="md:col-span-5 text-sm text-gray-600 md:truncate pr-4 w-full">{inv.text}</div>
                <div className="md:col-span-5 flex flex-wrap md:flex-nowrap justify-start md:justify-between items-center gap-2 w-full mt-2 md:mt-0">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${inv.sentiment === 'Overdue' ? 'bg-brand-red/10 text-brand-red' : inv.sentiment === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{inv.sentiment}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 ${inv.severity === 'High' ? 'bg-brand-yellow/20 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {inv.severity === 'High' && <AlertCircle className="w-3 h-3" />} {inv.severity}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-brand-blue/10 text-brand-blue">{inv.area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
