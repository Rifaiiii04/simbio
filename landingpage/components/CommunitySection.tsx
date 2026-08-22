'use client';

import Image from 'next/image';
import { ArrowRight, Users, Sparkles } from 'lucide-react';
import peopleLearnImg from '@/assets/people/people-learn_chatroom.webp';
import Link from 'next/link';

export function CommunitySection() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <section className="w-full pt-4 pb-16 sm:pt-8 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-sm border border-slate-200/60 overflow-hidden relative">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            
            {/* Left: Image */}
            <div className="relative w-full h-full max-w-lg mx-auto lg:max-w-none">
              <div className="w-full h-full min-h-[350px] sm:min-h-[450px] lg:min-h-[500px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl relative">
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
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Master any skill <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF5A00] to-[#FF9F00]">
                  together, for free.
                </span>
              </h2>
              
              <div className="space-y-4 mb-8 text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                <p>
                  Join a dedicated community of learners who believe in mutual growth. Exchange your expertise, learn something new, and achieve your goals with passionate partners from around the world.
                </p>
                <p>
                  As an early member, you get exclusive access to our Beta platform, priority matchmaking, and the unique opportunity to shape the future of reciprocal education alongside our team.
                </p>
              </div>

              <Link
                href={`${APP_URL}/register`}
                className="group relative inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold text-sm sm:text-base transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <span>Join the Early Access</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
