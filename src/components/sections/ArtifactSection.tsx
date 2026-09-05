import React, { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { FileText, ArrowRight } from 'lucide-react';

export const ArtifactSection = () => {
  const { ref, isVisible } = useScrollReveal(0.5);
  const [text, setText] = useState('');
  const [hasRun, setHasRun] = useState(false);
  
  const fullText = `## AI-Generated Reminder

**Invoice:** #1042 for Acme Corp
**Amount:** $2,400
**Days Overdue:** 14 days

**Draft:**
"Hey! Just bumping this to the top of your inbox. Let me know if you need anything else from my end to process this. Here's a quick link to pay: pay.astrix.ai/1042"

**Tone:** Friendly (Level 2)
**Next Step:** Send now or schedule for tomorrow morning.
`;

  useEffect(() => {
    if (isVisible && !hasRun) {
      let i = 0;
      const interval = setInterval(() => {
        setText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setHasRun(true);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [isVisible, hasRun]);

  return (
    <section className="py-24 md:py-40 bg-gray-50 relative overflow-hidden border-t border-gray-200" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        
        {/* Left: Artifact Generation */}
        <div className={`relative z-10 bg-white shadow-xl shadow-gray-200/50 border border-gray-200 rounded-2xl p-6 md:p-8 h-[400px] md:h-[450px] flex flex-col transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <FileText className="w-5 h-5 text-brand-blue" />
            <span className="font-mono text-xs md:text-sm text-gray-500 font-bold">Tone Studio / AI Draft</span>
          </div>
          <div className="font-mono text-xs md:text-sm text-gray-700 whitespace-pre-wrap flex-1 overflow-hidden font-medium leading-relaxed">
            {text}
            {!hasRun && <span className="inline-block w-2 h-4 bg-brand-blue animate-pulse ml-1 align-middle"></span>}
          </div>
          
          {hasRun && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center animate-[fadeIn_0.3s_ease-out]">
              <span className="text-xs text-green-600 font-mono font-bold">✓ Draft ready</span>
              <button className="bg-brand-blue text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 outline-none">
                Send Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Narrative */}
        <div className={`relative z-10 transition-all duration-700 delay-150 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          <div className="text-brand-blue font-mono text-sm tracking-widest uppercase mb-6 flex items-center gap-4 font-bold">
            <span className="w-8 h-[2px] bg-brand-blue"></span> The Output
          </div>
          <h2 className="font-heading text-fluid-2 leading-[0.9] tracking-tighter text-gray-900 mb-8">
            One Click. <br/>
            <span className="text-gray-300 text-stroke">Reminder Sent.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-medium mb-8">
            Stop writing the same emails over and over. AI drafts personalized reminders in your voice — friendly, firm, or somewhere in between — with embedded 1-click payment links.
          </p>
        </div>

      </div>
    </section>
  );
};
