import { DeityId, DeityInfo } from '../types.ts';

import shivaImg from '../assets/images/deity_shiva_1790943828321.jpg';
import hanumanImg from '../assets/images/deity_hanuman_1790943843090.jpg';
import ganeshImg from '../assets/images/deity_ganesh_1790943858973.jpg';
import vishnuImg from '../assets/images/deity_vishnu_1790943910848.jpg';
import durgaImg from '../assets/images/deity_durga_1790943872256.jpg';
import shaniImg from '../assets/images/deity_shani_1790943923828.jpg';
import suryaImg from '../assets/images/deity_surya_1790943935124.jpg';
import krishnaImg from '../assets/images/deity_krishna_1790952933092.jpg';
import lakshmiImg from '../assets/images/deity_lakshmi_1790952948791.jpg';
import saraswatiImg from '../assets/images/deity_saraswati_1790953001602.jpg';

export const DEITIES: Record<DeityId, DeityInfo> = {
  shiva: {
    id: 'shiva',
    name: 'Lord Shiva',
    hindiName: 'भगवान शिव',
    day: 'Monday',
    dayHindi: 'सोमवार',
    mantra: 'ॐ नमः शिवाय',
    title: 'Mahadev · The Supreme Transformer & Lord of Kailash',
    image: shivaImg,
    significance: 'Monday is sacred to Lord Shiva, the embodiment of cosmic stillness, inner peace, and divine transformation.',
    colorHex: '#38bdf8'
  },
  hanuman: {
    id: 'hanuman',
    name: 'Lord Hanuman',
    hindiName: 'श्री हनुमान',
    day: 'Tuesday',
    dayHindi: 'मंगलवार',
    mantra: 'ॐ हं हनुमते नमः',
    title: 'Bajrangbali · Dispeller of Fears & Divine Protector',
    image: hanumanImg,
    significance: 'Tuesday is dedicated to Pawanputra Hanuman, bestower of immense strength, fearless devotion, and protection from all perils.',
    colorHex: '#f97316'
  },
  ganesh: {
    id: 'ganesh',
    name: 'Lord Ganesh',
    hindiName: 'श्री गणेश',
    day: 'Wednesday',
    dayHindi: 'बुधवार',
    mantra: 'ॐ गं गणपतये नमः',
    title: 'Vighnaharta · Remover of Obstacles & Bestower of Buddhi',
    image: ganeshImg,
    significance: 'Wednesday is consecrated to Pratham Pujya Shri Ganesha, master of wisdom, intellect, new beginnings, and auspicious endeavors.',
    colorHex: '#eab308'
  },
  vishnu: {
    id: 'vishnu',
    name: 'Lord Vishnu',
    hindiName: 'भगवान विष्णु',
    day: 'Thursday',
    dayHindi: 'गुरुवार',
    mantra: 'ॐ नमो भगवते वासुदेवाय',
    title: 'Jagadishwara · The Sustainer & Guardian of the Universe',
    image: vishnuImg,
    significance: 'Thursday is devoted to Lord Vishnu (Brihaspati Var), embodiment of righteous cosmic order, supreme grace, and spiritual abundance.',
    colorHex: '#facc15'
  },
  durga: {
    id: 'durga',
    name: 'Maa Durga',
    hindiName: 'माँ दुर्गा',
    day: 'Friday',
    dayHindi: 'शुक्रवार',
    mantra: 'ॐ दुं दुर्गायै नमः',
    title: 'Mahishasuramardini · Divine Mother of Courage & Shakti',
    image: durgaImg,
    significance: 'Friday celebrates Maa Durga and the Divine Feminine Shakti, vanquisher of darkness, granting boundless motherly blessings.',
    colorHex: '#ec4899'
  },
  shani: {
    id: 'shani',
    name: 'Lord Shani Dev',
    hindiName: 'शनि देव',
    day: 'Saturday',
    dayHindi: 'शनिवार',
    mantra: 'ॐ शं शनैश्चराय नमः',
    title: 'Karmaphal Daata · Arbiter of Justice, Discipline & Truth',
    image: shaniImg,
    significance: 'Saturday belongs to Lord Shani, the revered deity of karma and righteous discipline who purifies life and grants inner fortitude.',
    colorHex: '#818cf8'
  },
  surya: {
    id: 'surya',
    name: 'Lord Surya',
    hindiName: 'भगवान सूर्य',
    day: 'Sunday',
    dayHindi: 'रविवार',
    mantra: 'ॐ सूर्याय नमः',
    title: 'Bhaskar · Source of Cosmic Light, Vitality & Radiant Life',
    image: suryaImg,
    significance: 'Sunday is celebrated for the Radiant Sun God Surya, who illuminates our world with health, supreme vitality, and golden radiance.',
    colorHex: '#fbbf24'
  },
  krishna: {
    id: 'krishna',
    name: 'Lord Krishna',
    hindiName: 'श्री कृष्ण',
    day: 'Wednesday / Janmashtami',
    dayHindi: 'नित्योपासना',
    mantra: 'ॐ क्लीं कृष्णाय नमः',
    title: 'Murlimanohar · Supreme Embodiment of Divine Love & Gita',
    image: krishnaImg,
    significance: 'Lord Krishna, the divine flutist of Vrindavan and charioteer of the Bhagavad Gita, guides souls to unconditional love and devotion.',
    colorHex: '#0284c7'
  },
  lakshmi: {
    id: 'lakshmi',
    name: 'Maa Lakshmi',
    hindiName: 'माँ लक्ष्मी',
    day: 'Friday / Diwali',
    dayHindi: 'वैभव शुक्रवार',
    mantra: 'ॐ श्रीं ह्रीं क्लीं श्रीं सिद्धलक्ष्म्यै नमः',
    title: 'Mahalakshmi · Bestower of Spiritual Wealth & Saubhagya',
    image: lakshmiImg,
    significance: 'Goddess Lakshmi showers spiritual liberation, divine grace, peace, and auspicious abundance upon sincere seekers.',
    colorHex: '#f43f5e'
  },
  saraswati: {
    id: 'saraswati',
    name: 'Maa Saraswati',
    hindiName: 'माँ सरस्वती',
    day: 'Basant Panchami',
    dayHindi: 'ज्ञानदायिनी',
    mantra: 'ॐ ऐं सरस्वत्यै नमः',
    title: 'Vagdevi · Embodiment of Sacred Wisdom, Music & Fine Arts',
    image: saraswatiImg,
    significance: 'Goddess Saraswati, seated upon the pure white lotus holding the divine veena, grants spiritual intellect, vidya, and creative mastery.',
    colorHex: '#fde047'
  }
};

export const WEEKDAY_ORDER: DeityId[] = [
  'shiva',
  'hanuman',
  'ganesh',
  'vishnu',
  'durga',
  'shani',
  'surya'
];

/**
 * 8 Major Deities for the Horizontal Mandir Deity Explorer
 */
export const EXPLORER_DEITIES: DeityId[] = [
  'shiva',
  'ganesh',
  'hanuman',
  'durga',
  'krishna',
  'vishnu',
  'lakshmi',
  'saraswati'
];

/**
 * Returns the Deity for the current day of the week in India (Asia/Kolkata timezone).
 */
export function getFeaturedDeityForToday(): DeityInfo {
  const indiaDay = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  }).format(new Date());

  const dayMap: Record<string, DeityId> = {
    Monday: 'shiva',
    Tuesday: 'hanuman',
    Wednesday: 'ganesh',
    Thursday: 'vishnu',
    Friday: 'durga',
    Saturday: 'shani',
    Sunday: 'surya'
  };

  const deityId = dayMap[indiaDay] || 'shiva';
  return DEITIES[deityId];
}

/**
 * Formats current date and time in India (Asia/Kolkata).
 */
export function getIndiaLiveInfo(): { day: string; formattedDate: string; time: string } {
  const now = new Date();
  
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  }).format(now);

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(now);

  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(now);

  return { day, formattedDate, time };
}
