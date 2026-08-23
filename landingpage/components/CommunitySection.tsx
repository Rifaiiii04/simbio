'use client';

import Image from 'next/image';
import { ArrowRight, Users, Sparkles } from 'lucide-react';
import peopleLearnImg from '@/assets/people/people-learn_chatroom.webp';
import Link from 'next/link';

import { motion } from 'framer-motion';

export function CommunitySection() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <section className="w-full pt-4 pb-16 sm:pt-8 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-50px' }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-10 lg:p-16 shadow-sm border border-slate-200/60 overflow-hidden relative">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-sky-100/50 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center relative z-10">
            
            {/* Left: Image */}
            <div className="relative w-full h-full max-w-lg mx-auto md:max-w-none">
              <div className="w-full h-full min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl relative">
                <Image
                  src={peopleLearnImg}
                  alt="People learning together"
                  fill
                  className="object-cover object-center"
                  placeholder="blur"
                />
              </div>
            </div>

            {/* Right: Text & CTA */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 md:mb-6">
                Master any skill <br className="hidden md:block" />
                <span className="text-orange-500">together, for free.</span>
              </h2>
              
              <div className="space-y-4 md:space-y-5 mb-6 md:mb-8 text-xs sm:text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                <p>
                  Join a dedicated community of learners who believe in mutual growth. Exchange your expertise, learn something new, and achieve your goals with passionate partners from around the world.
                </p>
                <p>
                  As an early member, you get exclusive access to our Beta platform, priority matchmaking, and the unique opportunity to shape the future of reciprocal education alongside our team.
                </p>
              </div>

              <Link 
                href={`${APP_URL}/register`}
                className="group relative inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 text-xs sm:text-sm"
              >
                Join the Early Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}
