'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, X } from 'lucide-react';

export const KeyboardShortcuts = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === '?') { setIsOpen(true); return; }
      if (e.key === 'Escape') {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('close-modals'));
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        window.dispatchEvent(new CustomEvent('open-upload-modal'));
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-10 h-10 bg-sidebar-dark text-gray-400 border border-slate-700 rounded-full shadow-lg flex items-center justify-center hover:text-white hover:bg-sidebar-hover transition-colors z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astrix-teal"
        title="Keyboard Shortcuts (?)">
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-heading text-xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 font-mono text-sm">
              {[
                { label: 'Add Invoice', key: 'N' },
                { label: 'Close Modals', key: 'Esc' },
                { label: 'Show Shortcuts', key: '?' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold">{item.label}</span>
                  <kbd className="bg-gray-100 border border-gray-200 text-gray-900 px-2 py-1 rounded shadow-sm">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
