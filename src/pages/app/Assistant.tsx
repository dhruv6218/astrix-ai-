'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { Send, Sparkles, User, Loader2, Bot } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { api } from '../../lib/api';
import type { Opportunity, Account, Decision, Invoice } from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

export const Assistant = () => {
  const { activeWorkspace } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: (
        <div className="space-y-2">
          <p>Hello! I&apos;m your Astrix Assistant. I can help you query your workspace data.</p>
          <p className="text-sm text-gray-500">Try asking me about opportunities, affected accounts, or recent decisions.</p>
        </div>
      )
    }
  ]);

  const suggestions = [
    "Show top 3 opportunities",
    "Which accounts are affected by SAML SSO?",
    "What was the verdict on the last launch?",
    "Show decisions marked Build"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let responseContent: React.ReactNode =
      "I couldn't find specific data for that query in your workspace.";

    if (!activeWorkspace?.id) {
      responseContent = 'Select a workspace first, then ask your query.';
    } else {
      await new Promise(r => setTimeout(r, 1000));
      const lower = text.toLowerCase();
      let innerContent: React.ReactNode = 'No matching results found in workspace data.';

      if (lower.includes('opportunit')) {
        const opps: Opportunity[] = await api.opportunities.list(activeWorkspace.id);
        if (opps.length > 0) {
          innerContent = (
            <div className="space-y-2">
              <p className="font-bold text-gray-900 mb-2">Top {Math.min(3, opps.length)} Opportunities:</p>
              {opps.slice(0, 3).map((opp: Opportunity, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-700">
                    <span className="font-bold text-gray-900">{opp.problems?.title}:</span> Score {opp.opportunity_score}, Recommended: {opp.recommended_action}
                  </div>
                </div>
              ))}
            </div>
          );
        }
      } else if (lower.includes('account')) {
        const accounts: Account[] = await api.accounts.list(activeWorkspace.id);
        if (accounts.length > 0) {
          innerContent = (
            <div className="space-y-2">
              <p className="font-bold text-gray-900 mb-2">Accounts ({accounts.length}):</p>
              {accounts.slice(0, 5).map((acc: Account, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-700">
                    <span className="font-bold text-gray-900">{acc.name}:</span> ARR ${acc.arr.toLocaleString()}, Plan: {acc.plan || 'Standard'}
                  </div>
                </div>
              ))}
            </div>
          );
        }
      } else if (lower.includes('decision')) {
        const decisions: Decision[] = await api.decisions.list(activeWorkspace.id);
        if (decisions.length > 0) {
          innerContent = (
            <div className="space-y-2">
              <p className="font-bold text-gray-900 mb-2">Recent Decisions:</p>
              {decisions.slice(0, 3).map((dec: Decision, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-700">
                    <span className="font-bold text-gray-900">{dec.title}:</span> Action: {dec.action}
                  </div>
                </div>
              ))}
            </div>
          );
        }
      } else {
        const invoices: Invoice[] = await api.invoices.list(activeWorkspace.id);
        const pending = invoices.filter((i: Invoice) => i.status === 'pending');
        innerContent = `You have ${pending.length} pending invoices totaling $${pending.reduce((s: number, i: Invoice) => s + i.amount, 0).toLocaleString()}.`;
      }

      responseContent = innerContent;
    }

    const assistantMsg: Message = { id: Date.now().toString(), role: 'assistant', content: responseContent };
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  return (
    <AppLayout 
      title="Ask Assistant" 
      subtitle="Query your workspace data using natural language."
    >
      <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-astrix-teal text-white shadow-sm'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-astrix-teal text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-astrix-teal" />
                <span className="text-sm text-gray-500 font-medium">Searching workspace...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          {/* Suggestions */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-astrix-teal hover:text-astrix-teal text-gray-600 text-xs font-bold rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="relative flex items-center"
          >
            <div className="absolute left-4 text-astrix-teal">
              <Sparkles className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about opportunities, accounts, or decisions..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-14 text-sm outline-none focus:ring-2 focus:ring-astrix-teal focus:bg-white transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-astrix-teal text-white rounded-lg hover:bg-astrix-darkTeal disabled:opacity-50 disabled:bg-gray-300 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Assistant retrieves data strictly from your workspace</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Assistant;
