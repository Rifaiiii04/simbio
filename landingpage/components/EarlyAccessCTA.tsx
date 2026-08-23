'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Clock } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function EarlyAccessCTA() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '-60px' }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white p-8 sm:p-16 border border-slate-800 shadow-2xl overflow-hidden text-center space-y-8"
      >
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Pioneer the Future of Skill Barter?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl mx-auto">
            Reserve your early access spot on Simbioly today to establish your skill profile, exchange knowledge you have mastered, and connect with complementary study peers at zero cost.
          </p>
        </div>

        {/* Waitlist Form */}
        <div className="relative z-10 max-w-2xl mx-auto pt-4 w-full">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (isSubmitting) return;
              
              setIsSubmitting(true);
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name');
              const profession = formData.get('profession');
              const email = formData.get('email');
              
              try {
                const res = await fetch('http://127.0.0.1:3001/api/v1/waitlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, profession, email })
                });
                
                if (res.ok) {
                  toast.success('Thank you for joining our waitlist! We will notify you when Simbioly is ready.');
                  (e.target as HTMLFormElement).reset();
                } else {
                  const err = await res.json();
                  toast.error(err.error || 'Something went wrong, please try again.');
                }
              } catch (err) {
                toast.error('Failed to connect to the server. Please try again later.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="flex flex-col gap-3 bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-800"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                name="name" 
                required 
                disabled={isSubmitting}
                placeholder="Your Name" 
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50"
              />
              <input 
                type="text" 
                name="profession" 
                required 
                disabled={isSubmitting}
                placeholder="Profession" 
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                name="email" 
                required 
                disabled={isSubmitting}
                placeholder="Email Address" 
                className="flex-1 px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
              </button>
            </div>
          </form>
        </div>

        {/* Micro Trust Points */}
        <div className="relative z-10 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free & Reciprocal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-orange-400" />
            <span>Collaborative Community</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Powered by Simbi AI Copilot</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
