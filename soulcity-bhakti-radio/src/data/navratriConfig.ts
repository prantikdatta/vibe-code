import { NavratriDayConfig, NavratriSettings } from '../types.ts';
import durgaImg from '../assets/images/deity_durga_1790943872256.jpg';

export const LOCAL_STORAGE_NAVRATRI_KEY = 'soulcity_bhakti_radio_navratri_settings_v1';

export const DEFAULT_NAVRATRI_DAYS_2026: NavratriDayConfig[] = [
  {
    dayNumber: 1,
    dateString: '2026-10-11',
    dayLabel: 'Navratri Day 1 · Pratipada',
    tithi: 'Pratipada',
    deviForm: 'Maa Shailputri',
    deviHindi: 'माँ शैलपुत्री',
    colorName: 'Royal Saffron Orange',
    colorHex: '#ea580c',
    mantra: 'वन्दे वाञ्छितलाभाय चन्द्रार्धकृतशेखराम्। वृषारूढां शूलधरां शैलपुत्रीं यशस्विनीम्॥',
    significance: 'Daughter of the Himalayas, seated upon Nandi with Trishula and Lotus, bestower of spiritual resolve and unwavering purity.',
    associatedCategories: ['Aarti', 'Stotram', 'Mantra'],
    artwork: durgaImg,
  },
  {
    dayNumber: 2,
    dateString: '2026-10-12',
    dayLabel: 'Navratri Day 2 · Dwitiya',
    tithi: 'Dwitiya',
    deviForm: 'Maa Brahmacharini',
    deviHindi: 'माँ ब्रह्मचारिणी',
    colorName: 'Pavitra Golden White',
    colorHex: '#fef08a',
    mantra: 'दधाना करपद्माभ्यामक्षमालाकमण्डलू। देवी प्रसीदतु मयि ब्रह्मचारिण्यनुत्तमा॥',
    significance: 'The ascetic goddess who practices deep tapasya, holding Japa Mala and Kamandalu, granting immense penance, virtue, and self-restraint.',
    associatedCategories: ['Mantra', 'Stotram', 'Bhajan'],
    artwork: durgaImg,
  },
  {
    dayNumber: 3,
    dateString: '2026-10-13',
    dayLabel: 'Navratri Day 3 · Tritiya',
    tithi: 'Tritiya',
    deviForm: 'Maa Chandraghanta',
    deviHindi: 'माँ चंद्रघंटा',
    colorName: 'Radiant Sindoor Red',
    colorHex: '#ef4444',
    mantra: 'पिण्डजप्रवरारूढा चण्डकोपास्त्रकैर्युता। प्रसीदं तनुते मह्यं चन्द्रघण्टेति विश्रुता॥',
    significance: 'Adorned with a bell-shaped half-moon on her forehead, riding a tigress with ten weapons, vanquishing evil and bestowing unyielding courage.',
    associatedCategories: ['Aarti', 'Chalisa', 'Bhajan'],
    artwork: durgaImg,
  },
  {
    dayNumber: 4,
    dateString: '2026-10-14',
    dayLabel: 'Navratri Day 4 · Chaturthi',
    tithi: 'Chaturthi',
    deviForm: 'Maa Kushmanda',
    deviHindi: 'माँ कूष्मांडा',
    colorName: 'Celestial Royal Blue',
    colorHex: '#3b82f6',
    mantra: 'सुरासम्पूर्णकलशं रुधिराप्लुतमेव च। दधाना हस्तपद्माभ्यां कूष्माण्डा शुभदास्तु मे॥',
    significance: 'Creator of the cosmic universe with her radiant smile, dwelling at the core of the Sun God, dispelling darkness and disease.',
    associatedCategories: ['Stotram', 'Mantra', 'Bhajan'],
    artwork: durgaImg,
  },
  {
    dayNumber: 5,
    dateString: '2026-10-15',
    dayLabel: 'Navratri Day 5 · Panchami',
    tithi: 'Panchami',
    deviForm: 'Maa Skandamata',
    deviHindi: 'माँ स्कन्दमाता',
    colorName: 'Auspicious Surya Yellow',
    colorHex: '#eab308',
    mantra: 'सिंहासनगता नित्यं पद्माश्रितकरद्वया। शुभदास्तु सदा देवी स्कन्दमाता यशस्विनी॥',
    significance: 'Mother of Lord Kartikeya (Skanda), seated on a lion holding lotuses and her infant child, bestowing motherly grace and spiritual illumination.',
    associatedCategories: ['Aarti', 'Bhajan', 'Chalisa'],
    artwork: durgaImg,
  },
  {
    dayNumber: 6,
    dateString: '2026-10-16',
    dayLabel: 'Navratri Day 6 · Shashthi',
    tithi: 'Shashthi',
    deviForm: 'Maa Katyayani',
    deviHindi: 'माँ कात्यायनी',
    colorName: 'Sacred Emerald Green',
    colorHex: '#10b981',
    mantra: 'चन्द्रहासोज्ज्वलकरा शार्दूलवरवाहना। कात्यायनी शुभं दद्याद्देवी दानवघातिनी॥',
    significance: 'Born of Sage Katyayana, radiant warrior goddess holding the shining Chandrahasa sword, annihilator of Mahishasura.',
    associatedCategories: ['Mantra', 'Stotram', 'Aarti'],
    artwork: durgaImg,
  },
  {
    dayNumber: 7,
    dateString: '2026-10-17',
    dayLabel: 'Navratri Day 7 · Saptami',
    tithi: 'Saptami',
    deviForm: 'Maa Kalaratri',
    deviHindi: 'माँ कालरात्रि',
    colorName: 'Mystic Night Slate',
    colorHex: '#64748b',
    mantra: 'एकवेणी जपाकर्णपूरा नग्ना खरास्थिता। लम्बोष्ठी कर्णिकाकर्णी तैलाभ्यक्तशरीरिणी॥',
    significance: 'Dark-complexioned fearsome dispeller of ghosts, demons, and ignorance, granting Shubhankari (auspicious) fearlessness to true devotees.',
    associatedCategories: ['Stotram', 'Mantra', 'Aarti'],
    artwork: durgaImg,
  },
  {
    dayNumber: 8,
    dateString: '2026-10-18',
    dayLabel: 'Navratri Day 8 · Ashtami (Maha Ashtami)',
    tithi: 'Ashtami',
    deviForm: 'Maa Mahagauri',
    deviHindi: 'माँ महागौरी',
    colorName: 'Devi Magenta Purple',
    colorHex: '#d946ef',
    mantra: 'श्वेते वृषे समारूढा श्वेताम्बरधरा शुचिः। महागौरी शुभं दद्यान्महादेवप्रमोददा॥',
    significance: 'Radiant with snow-white brilliance, riding a white bull, embodying absolute purity and granting forgiveness of all sins.',
    associatedCategories: ['Aarti', 'Chalisa', 'Bhajan'],
    artwork: durgaImg,
  },
  {
    dayNumber: 9,
    dateString: '2026-10-19',
    dayLabel: 'Navratri Day 9 · Navami (Maha Navami)',
    tithi: 'Navami',
    deviForm: 'Maa Siddhidatri',
    deviHindi: 'माँ सिद्धिदात्री',
    colorName: 'Peacock Ocean Cyan',
    colorHex: '#06b6d4',
    mantra: 'सिद्धगन्धर्वयक्षाद्यैरसुरैरमरैरपि। सेव्यमाना सदा भूयात् सिद्धिदा सिद्धिदायिनी॥',
    significance: 'Granter of all 18 mystical siddhis (supreme spiritual treasures) and blessings, worshipped by devas, rishis, and seekers alike.',
    associatedCategories: ['Stotram', 'Mantra', 'Aarti'],
    artwork: durgaImg,
  },
  {
    dayNumber: 10,
    dateString: '2026-10-20',
    dayLabel: 'Day 10 · Vijayadashami (Dussehra)',
    tithi: 'Dashami',
    deviForm: 'Maa Durga Vijaya',
    deviHindi: 'माँ दुर्गा विजयादशमी',
    colorName: 'Royal Crimson Gold',
    colorHex: '#f43f5e',
    mantra: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    significance: 'Triumphant victory of righteousness over evil, celebration of Durga Visarjan and Bhagwan Rama vanquishing Ravana.',
    associatedCategories: ['Aarti', 'Bhajan', 'Stotram'],
    artwork: durgaImg,
  },
];

export const DEFAULT_NAVRATRI_SETTINGS: NavratriSettings = {
  isEnabled: true,
  manualOverrideDay: 1, // Default preview Day 1 so users can explore Navratri right now even before Oct 11!
  days: DEFAULT_NAVRATRI_DAYS_2026,
};

/**
 * Returns current date in Asia/Kolkata as 'YYYY-MM-DD'
 */
export function getIndiaDateFormatted(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Determines whether current live date or configuration activates Navratri mode
 */
export function getEffectiveNavratriStatus(settings: NavratriSettings): {
  isActive: boolean;
  currentDay: NavratriDayConfig;
  isManualPreview: boolean;
  indiaDate: string;
} {
  const indiaDate = getIndiaDateFormatted();

  // If globally disabled by admin
  if (!settings.isEnabled) {
    return {
      isActive: false,
      currentDay: settings.days[0],
      isManualPreview: false,
      indiaDate,
    };
  }

  // If manual preview day is selected (1-10)
  if (settings.manualOverrideDay !== null && settings.manualOverrideDay >= 1 && settings.manualOverrideDay <= 10) {
    const selectedDay = settings.days.find((d) => d.dayNumber === settings.manualOverrideDay) || settings.days[0];
    return {
      isActive: true,
      currentDay: selectedDay,
      isManualPreview: true,
      indiaDate,
    };
  }

  // Check if live date in Asia/Kolkata falls within configured Navratri days
  const matchedDay = settings.days.find((d) => d.dateString === indiaDate);
  if (matchedDay) {
    return {
      isActive: true,
      currentDay: matchedDay,
      isManualPreview: false,
      indiaDate,
    };
  }

  // If outside actual Navratri dates and no manual override
  return {
    isActive: false,
    currentDay: settings.days[0],
    isManualPreview: false,
    indiaDate,
  };
}
