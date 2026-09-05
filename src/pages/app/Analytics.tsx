import React from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { BarChart3, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Analytics = () => {
  return (
    <AppLayout title="Analytics" subtitle="Recovery performance & trends">
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-brand-blue" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-gray-900 mb-3">Analytics Coming Soon</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Detailed recovery reports, monthly trends, client payment patterns, and more. Available with the <strong>Solo</strong> plan upgrade.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: DollarSign, label: 'Recovery Trends', desc: 'Monthly & weekly charts' },
            { icon: TrendingUp, label: 'Client Scoring', desc: 'Who pays fastest' },
            { icon: Clock, label: 'Time to Payment', desc: 'Average recovery time' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 text-left shadow-sm">
              <div className="p-2 bg-gray-100 rounded-xl w-fit mb-3"><item.icon className="w-5 h-5 text-gray-600" /></div>
              <div className="font-bold text-gray-900 text-sm mb-1">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
        <Link to="/pricing" className="bg-brand-blue text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block shadow-sm">
          Upgrade to Unlock Analytics
        </Link>
      </div>
    </AppLayout>
  );
};
