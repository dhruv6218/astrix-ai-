import React, { useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const EngineSection = () => {
  const { ref, isVisible } = useScrollReveal(0.3);
  const [escalationLevel, setEscalationLevel] = useState(5);
  
  // Interactive Math
  const baseScore = 72; // Recovery probability
  const dynamicScore = Math.min(100, Math.round(baseScore + (escalationLevel * 2.8)));

  return (
    <section className="py-24 md:py-40 bg-gray-50 text-gray-900 relative overflow-hidden border-t border-gray-200" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-10 items-center">
        
        {/* Left: The Math */}
        <div className="lg:col-span-5 relative z-10">
          <div className="text-brand-yellow font-mono text-sm tracking-widest uppercase mb-6 flex items-center gap-4 font-bold">
            <span className="w-8 h-[2px] bg-brand-yellow"></span> Total Transparency
          </div>
          <h2 className="font-heading text-fluid-1 leading-[1] tracking-tighter mb-10">
            No Guesswork. <br/>
            <span className="text-gray-300 text-stroke">Just Results.</span>
          </h2>
          
          <div className="font-mono text-base md:text-xl space-y-4 text-gray-500 border-l-2 border-gray-200 pl-6 md:pl-8 font-medium">
            <div className="text-gray-900 font-bold mb-6">Recovery Probability =</div>
            <div className="flex justify-between hover:text-brand-blue transition-colors group"><span className="group-hover:translate-x-2 transition-transform">Invoice Age</span> <span>× 0.25</span></div>
            <div className="flex justify-between hover:text-brand-blue transition-colors group"><span className="group-hover:translate-x-2 transition-transform">Client History</span> <span>× 0.20</span></div>
            <div className="flex justify-between text-yellow-600 font-bold group"><span className="group-hover:translate-x-2 transition-transform">Amount</span> <span>× 0.20</span></div>
            <div className="flex justify-between hover:text-brand-blue transition-colors group"><span className="group-hover:translate-x-2 transition-transform">Tone Match</span> <span>× 0.15</span></div>
            
            {/* Interactive Slider */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex justify-between text-brand-blue font-bold mb-2">
                <label htmlFor="escalation">Escalation Level</label> 
                <span>{escalationLevel}/10</span>
              </div>
              <input 
                id="escalation"
                type="range" 
                min="1" 
                max="10" 
                value={escalationLevel} 
                onChange={(e) => setEscalationLevel(parseInt(e.target.value))}
                className="w-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded-full"
                aria-label="Adjust escalation level to see recovery probability"
              />
              <p className="text-xs text-gray-400 mt-2">Drag to see how tone affects recovery</p>
            </div>
          </div>
        </div>

        {/* Right: The UI Representation */}
        <div className="lg:col-span-7 relative">
          <div className={`bg-white border border-gray-200 shadow-2xl shadow-gray-200/60 p-6 md:p-12 rounded-[2rem] transform transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="flex justify-between items-end border-b border-gray-100 pb-6 mb-8">
              <div className="text-sm font-mono text-gray-500 font-bold">Recovery Dashboard</div>
              <div className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live
              </div>
            </div>

            <div className="space-y-8">
              {/* Dynamic Item */}
              <div className="group">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-lg md:text-2xl font-bold text-brand-blue">Acme Corp Invoice</div>
                    <div className="text-xs md:text-sm font-mono text-gray-500 mt-1 flex gap-2 md:gap-4 font-semibold flex-wrap">
                      <span>$2,400</span>
                      <span className="text-gray-300 hidden md:inline">•</span>
                      <span className="uppercase tracking-widest text-brand-blue">Recovery Likely</span>
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-heading font-black text-brand-blue transition-all duration-300">{dynamicScore}%</div>
                </div>
                <div className="w-full h-[4px] bg-gray-100 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full rounded-full bg-brand-blue transition-all duration-300 ease-out" style={{ width: `${dynamicScore}%` }}></div>
                </div>
              </div>

              {/* Static Items */}
              {[
                { name: "TechStart Invoice", score: 78, amount: "€1,800", action: "Follow Up", color: "bg-brand-yellow" },
                { name: "DataFlow Invoice", score: 64, amount: "$890", action: "Monitor", color: "bg-gray-300" }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-lg md:text-2xl font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs md:text-sm font-mono text-gray-500 mt-1 flex gap-2 md:gap-4 font-semibold flex-wrap">
                        <span>{item.amount}</span>
                        <span className="text-gray-300 hidden md:inline">•</span>
                        <span className="uppercase tracking-widest">{item.action}</span>
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-heading font-black text-gray-900">{item.score}%</div>
                  </div>
                  <div className="w-full h-[4px] bg-gray-100 rounded-full relative overflow-hidden">
                    <div className={`absolute top-0 left-0 h-full rounded-full ${item.color} transition-all duration-700 ease-out`} style={{ width: isVisible ? `${item.score}%` : '0%', transitionDelay: `${i * 150}ms` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
