import React from 'react';
import { Flame, Music, Sparkles, BookOpen, Crown, ChevronRight } from 'lucide-react';
import { Aarti } from '../types.ts';

interface CategorySectionProps {
  aartis: Aarti[];
  onSelectCategory: (category: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  aartis,
  onSelectCategory,
}) => {
  const categories = [
    {
      id: 'Aarti',
      title: 'Aarti',
      hindi: 'आरती',
      desc: 'Sacred lamps, divine invocations and temple lighted offerings',
      icon: Flame,
      color: '#f59e0b',
      count: aartis.filter((a) => a.type === 'Aarti' || (!a.type && !a.id.includes('bhajan'))).length,
      targetSection: 'aartis',
    },
    {
      id: 'Bhajan',
      title: 'Bhajan',
      hindi: 'भजन',
      desc: 'Soulful kirtans, classical bhakti hymns and praises',
      icon: Music,
      color: '#38bdf8',
      count: aartis.filter((a) => a.type === 'Bhajan' || a.id.includes('bhajan') || /bhajan|kirtan/i.test(a.title)).length,
      targetSection: 'bhajans',
    },
    {
      id: 'Mantra',
      title: 'Mantra',
      hindi: 'मंत्र',
      desc: 'Potent Vedic seed syllables and japa for inner stillness',
      icon: Sparkles,
      color: '#a855f7',
      count: aartis.filter((a) => a.type === 'Mantra' || /mantra|jaap|chant/i.test(a.title)).length,
      targetSection: 'aartis-all',
    },
    {
      id: 'Chalisa',
      title: 'Chalisa',
      hindi: 'चालीसा',
      desc: 'Forty devotional verses of supreme glorification & protection',
      icon: BookOpen,
      color: '#ea580c',
      count: aartis.filter((a) => a.type === 'Chalisa' || /chalisa/i.test(a.title)).length,
      targetSection: 'aartis-all',
    },
    {
      id: 'Stotram',
      title: 'Stotram',
      hindi: 'स्तोत्रम्',
      desc: 'Exalted Sanskrit stotras, ashtakams and poetic laudations',
      icon: Crown,
      color: '#10b981',
      count: aartis.filter((a) => a.type === 'Stotram' || /stotram|stotra/i.test(a.title)).length,
      targetSection: 'aartis-all',
    },
    {
      id: 'Navratri',
      title: 'Navratri',
      hindi: 'नवरात्रि',
      desc: 'Nine sacred nights of Maa Durga & Navdurga Swaroop darshan',
      icon: Sparkles,
      color: '#f43f5e',
      count: aartis.filter((a) => a.festivalTags?.includes('Navratri') || a.deityId === 'durga').length,
      targetSection: 'navratri',
    },
  ];

  return (
    <section id="categories" className="py-12 border-b border-amber-950/70 bg-[#0a0705] relative scroll-mt-20 sm:scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>भक्ति विधाएं · Devotional Categories</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-gold-gradient font-serif-temple">
              Explore Devotional Genres
            </h2>
          </div>
          <p className="text-xs text-stone-400 max-w-md">
            Delve into authentic Hindu spiritual genres from eternal Sanskrit stotras to soulful bhajans.
          </p>
        </div>

        {/* 6 Large Premium Devotional Category Cards with Ornamental Frames */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.targetSection)}
                className="group relative flex flex-col justify-between rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#18110d] via-[#120c08] to-[#0c0805] p-6 text-left shadow-xl hover:border-amber-500/70 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 cursor-pointer active:scale-95"
              >
                {/* Ornamental Corner Filigree */}
                <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-amber-400/50" />
                <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-amber-400/50" />
                <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-amber-400/50" />
                <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-amber-400/50" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Devotional Icon Medallion */}
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-[#25160e] shadow-md group-hover:scale-105 transition-transform"
                      style={{ color: cat.color }}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>

                    {/* Hindi Scripture Tag */}
                    <span className="font-serif-temple text-lg font-bold text-amber-200/90 group-hover:text-amber-100">
                      {cat.hindi}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-100 group-hover:text-amber-300 font-serif-temple">
                    {cat.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-stone-400 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-950/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400/90">
                    {cat.count} {cat.count === 1 ? 'Sacred Track' : 'Sacred Tracks'}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
                    <span>Enter Darshan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
