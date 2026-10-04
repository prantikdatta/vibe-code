import React from 'react';
import { Play, Sparkles, Calendar, Volume2, Flame, Radio, Music } from 'lucide-react';
import { DeityInfo, Aarti, NavratriDayConfig } from '../types.ts';
import { DiyaDecoration } from './DiyaDecoration.tsx';
import sanctumHeroBg from '../assets/images/temple_sanctum_hero_1790943808459.jpg';

interface HeroSanctumProps {
  selectedDeity: DeityInfo;
  todayDeity: DeityInfo;
  indiaDay: string;
  indiaDate: string;
  indiaTime: string;
  deityAartis: Aarti[];
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onPlayAarti: (aarti: Aarti) => void;
  onSelectDeity: (deity: DeityInfo) => void;
  navratriActiveDay?: NavratriDayConfig | null;
  isNavratriActive?: boolean;
}

// Devotional greetings mapped by deity ID
const DEITY_GREETINGS: Record<string, string> = {
  shiva: 'ॐ नमः शिवाय · हर हर महादेव! May Lord Shiva bless your day with tranquil meditation, inner strength, and supreme peace.',
  hanuman: 'जय श्री राम · जय बजरंगबली! May Pawanputra Hanuman grant you fearless courage, unwavering devotion, and total protection.',
  ganesh: 'ॐ गं गणपतये नमः · श्री गणेशाय नमः! May Lord Ganesha remove all obstacles and shower auspicious wisdom upon all your beginnings.',
  vishnu: 'ॐ नमो भगवते वासुदेवाय! May Lord Vishnu preserve righteousness, abundance, and blissful harmony in your life.',
  durga: 'जय माता दी · ॐ दुं दुर्गायै नमः! May Divine Mother Durga shield you from all negativity and illuminate your soul with Shakti.',
  shani: 'ॐ शं शनैश्चराय नमः! May Lord Shani Dev guide you on the path of truth, righteous karma, perseverance, and justice.',
  surya: 'ॐ सूर्याय नमः! May the divine Surya Dev illuminate your mind with vibrant energy, health, and radiant spiritual light.',
  krishna: 'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे! May Lord Krishna fill your heart with supreme divine love, joy, and peace.',
  lakshmi: 'ॐ श्रीं महालक्ष्म्यै नमः! May Goddess Lakshmi bestow sacred abundance, pure contentment, and spiritual prosperity.',
  saraswati: 'ॐ ऐं सरस्वत्यै नमः! May Goddess Saraswati awaken divine intellect, artistic grace, and transcendent wisdom within you.',
};

export const HeroSanctum: React.FC<HeroSanctumProps> = ({
  selectedDeity,
  todayDeity,
  indiaDay,
  indiaDate,
  indiaTime,
  deityAartis,
  currentAarti,
  isPlaying,
  onPlayAarti,
  navratriActiveDay,
  isNavratriActive = false,
}) => {
  const isTodayDeity = selectedDeity.id === todayDeity.id;
  const primaryAarti = deityAartis[0] || currentAarti;
  const isThisAartiPlaying = isPlaying && currentAarti?.id === primaryAarti?.id;
  const greeting = DEITY_GREETINGS[selectedDeity.id] || `जय श्री ${selectedDeity.name}! Blessings of today's consecration.`;

  const heroAccentColor = isNavratriActive && navratriActiveDay
    ? navratriActiveDay.colorHex
    : selectedDeity.colorHex || '#f59e0b';

  return (
    <section id="sanctum" className="relative overflow-hidden pt-4 pb-12 sm:pb-16 border-b border-amber-950/70 scroll-mt-20 sm:scroll-mt-24">
      {/* Background Sanctum Backdrop with ambient dark scrim & light rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={sanctumHeroBg}
          alt="Temple Sanctum Altar"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        {/* Soft Vignette and Rich Deep Temple Charcoal Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0705]/95 via-[#0e0907]/90 to-[#0a0705]" />
        
        {/* Subtle Golden Celestial Light Rays from Altar Ceiling */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[550px] opacity-20 pointer-events-none blur-3xl"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${heroAccentColor} 0%, rgba(245,158,11,0.2) 40%, transparent 75%)`,
          }}
        />

        {/* Ambient Marigold Garland Floral Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600/30 via-amber-400 to-amber-600/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Panchang Live India Clock Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-800/40 bg-[#16100c]/85 px-4 py-2.5 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2.5 text-xs text-amber-200/90">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              India (IST · Asia/Kolkata): <strong className="text-amber-300 font-semibold">{indiaDay}, {indiaDate}</strong> · {indiaTime}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {isNavratriActive && navratriActiveDay ? (
              <span
                className="inline-flex items-center gap-1.5 font-bold text-stone-950 px-3 py-0.5 rounded-full shadow-sm"
                style={{ backgroundColor: navratriActiveDay.colorHex }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{navratriActiveDay.dayLabel}: {navratriActiveDay.deviForm}</span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5 text-stone-300">
                <span className="text-stone-400">Today&apos;s Consecrated Deity:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-300 bg-amber-950/80 border border-amber-700/40 px-2.5 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {todayDeity.name} ({todayDeity.dayHindi})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sanctum Mandap Presentation Container */}
        <div
          className="relative rounded-3xl border bg-gradient-to-b from-[#18110c]/95 via-[#130d09]/95 to-[#0b0806]/98 p-6 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-500 overflow-hidden"
          style={{
            borderColor: `${heroAccentColor}44`,
          }}
        >
          {/* Subtle Decorative Golden Border Pattern */}
          <div className="absolute top-2 left-2 right-2 bottom-2 border border-amber-500/10 rounded-[22px] pointer-events-none" />

          {/* Golden Corner Mandir Accents */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400/60" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400/60" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400/60" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400/60" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Sacred Deity Portrait Framed in Temple Mandap with Flanking Diyas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Flanking Left Brass Diya */}
                <div className="absolute -left-6 sm:-left-12 bottom-2 z-10">
                  <DiyaDecoration size="md" />
                </div>

                {/* Central Consecrated Deity Portrait with Golden Mandala Halo */}
                <div className="relative group">
                  {/* Radiant Aura Behind Artwork */}
                  <div
                    className="absolute -inset-4 rounded-full opacity-60 blur-2xl transition-all duration-700 group-hover:opacity-90"
                    style={{
                      background: `radial-gradient(circle, ${heroAccentColor}66 0%, rgba(245,158,11,0.25) 50%, transparent 70%)`,
                    }}
                  />

                  {/* Golden Mandala Frame Border */}
                  <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full p-2.5 bg-gradient-to-tr from-amber-700 via-amber-300 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
                    {/* Ornamental Inner Ring */}
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-950 bg-stone-950 relative">
                      <img
                        src={selectedDeity.image}
                        alt={selectedDeity.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Subtle golden shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Sacred Tilak / Day Consecration Ribbon */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-950 via-[#3a180b] to-amber-950 border border-amber-500/60 px-4 py-1 text-xs font-semibold text-amber-200 shadow-lg">
                    {selectedDeity.day} · {selectedDeity.dayHindi}
                  </div>
                </div>

                {/* Flanking Right Brass Diya */}
                <div className="absolute -right-6 sm:-right-12 bottom-2 z-10">
                  <DiyaDecoration size="md" />
                </div>
              </div>

              {/* Sanskrit Mantra Ribbon */}
              <div className="mt-8 max-w-sm rounded-xl border border-amber-700/30 bg-[#160e0a]/90 px-4 py-2.5 text-center shadow-inner">
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  Maha Mantra
                </span>
                <p className="text-sm sm:text-base font-bold text-amber-100 font-serif-temple">
                  {selectedDeity.mantra}
                </p>
              </div>
            </div>

            {/* Right Column: TODAY'S BHAKTI, Devotional Greeting, START RADIO */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              {/* Header Kicker: TODAY'S BHAKTI */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  TODAY&apos;S BHAKTI
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-xs font-semibold text-stone-300">
                  {selectedDeity.day} {isTodayDeity ? '(Current Weekday)' : '(Darshan View)'}
                </span>
              </div>

              {/* Title & Hindi Name */}
              <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-gold-gradient font-serif-temple leading-tight">
                {selectedDeity.name}
              </h1>
              <p className="mt-1 text-base sm:text-lg text-amber-300/90 font-medium">
                {selectedDeity.hindiName} · {selectedDeity.title}
              </p>

              {/* Devotional Greeting & Significance */}
              <div className="mt-4 p-4 rounded-xl border border-amber-900/40 bg-[#1b120d]/80 text-sm sm:text-base leading-relaxed text-stone-200">
                <p className="font-serif-temple italic text-amber-200/95 font-medium">
                  &ldquo;{greeting}&rdquo;
                </p>
                <p className="mt-2 text-xs sm:text-sm text-stone-400">
                  {selectedDeity.significance}
                </p>
              </div>

              {/* CTAs: [ START RADIO ] & [ Current Track ] */}
              <div className="mt-6 pt-5 border-t border-amber-900/40 flex flex-wrap items-center gap-4">
                {primaryAarti ? (
                  <button
                    type="button"
                    onClick={() => onPlayAarti(primaryAarti)}
                    className="flex items-center gap-2.5 rounded-xl px-7 py-3 text-sm font-bold text-stone-950 transition-all cursor-pointer active:scale-95 shadow-lg hover:shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, #f59e0b, ${heroAccentColor}, #ea580c)`,
                      boxShadow: `0 0 30px ${heroAccentColor}66`,
                    }}
                  >
                    {isThisAartiPlaying ? (
                      <>
                        <Volume2 className="w-5 h-5 text-stone-950 animate-pulse" />
                        <span>RADIO PLAYING · PAUSE</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-stone-950 text-stone-950" />
                        <span>START RADIO</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-amber-300/70">
                    No tracks loaded for this deity yet.
                  </span>
                )}

                {/* Current Track Preview Pill */}
                {primaryAarti && (
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/60 border border-amber-800/40 text-xs">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                        Current Track
                      </span>
                      <span className="text-stone-200 font-semibold truncate block max-w-[200px] sm:max-w-xs">
                        {primaryAarti.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
