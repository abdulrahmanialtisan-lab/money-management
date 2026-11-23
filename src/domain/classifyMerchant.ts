import type { Importance } from './types'

/**
 * A coarse spending kind we can infer from a merchant name. Each kind maps to
 * one of the default category icon keys (see `KIND_ICON`) so we can link the
 * guess to whichever seeded/renamed category carries that icon, independent of
 * the category's display name or language.
 */
export type CategoryKind = 'food' | 'transport' | 'bills' | 'shopping' | 'health' | 'entertainment' | 'other'

/** Kind -> the icon key used by the matching default category. */
export const KIND_ICON: Record<CategoryKind, string> = {
  food: 'food',
  transport: 'car',
  bills: 'receipt',
  shopping: 'shopping',
  health: 'health',
  entertainment: 'film',
  other: 'other',
}

/** A sensible default importance for each kind; the user can always override. */
const KIND_IMPORTANCE: Record<CategoryKind, Importance> = {
  food: 'important',
  transport: 'important',
  bills: 'important',
  health: 'important',
  shopping: 'not_important',
  entertainment: 'not_important',
  other: 'not_important',
}

export interface MerchantClassification {
  kind: CategoryKind
  iconKey: string
  importance: Importance
}

/** Fold Arabic orthography variants + case so keyword matching is forgiving. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ً-ْٰ]/g, '') // harakat / diacritics
    .replace(/ـ/g, '') // tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

// Ordered most-specific-first: the first keyword found in the text wins, so
// multi-word / subscription keywords must come before bare brand names
// (e.g. "amazon prime" before "amazon", "apple.com/bill" before "apple").
const RULES: Array<{ kind: CategoryKind; keywords: string[] }> = [
  {
    kind: 'bills',
    keywords: [
      // Telecom
      'stc', 'اس تي سي', 'سوا', 'sawa', 'جوي', 'jawwy', 'موبايلي', 'mobily', 'زين', 'zain',
      'فرجن', 'virgin', 'ليبارا', 'lebara', 'redbull mobile', 'فايبر', 'fiber', 'الاتصالات',
      // Utilities / government bills
      'كهرباء', 'الكهرباء', 'electricity', 'المياه', 'مياه', 'water', 'الغاز', 'غاز',
      'سداد', 'sadad', 'فاتوره', 'فاتورة', 'bill', 'نت', 'internet', 'انترنت',
      // Streaming / app subscriptions
      'netflix', 'نتفلكس', 'shahid', 'شاهد', 'osn', 'starzplay', 'ستارز', 'disney',
      'spotify', 'سبوتيفاي', 'anghami', 'انغامي', 'youtube premium', 'amazon prime', 'prime video',
      'apple.com/bill', 'apple music', 'icloud', 'ايكلاود', 'google storage', 'google one',
      'microsoft', 'مايكروسوفت', 'office 365', 'adobe', 'chatgpt', 'openai', 'اشتراك', 'subscription',
    ],
  },
  {
    kind: 'transport',
    keywords: [
      // Fuel
      'بنزين', 'وقود', 'محطه', 'محطة', 'ساسكو', 'sasco', 'ارامكو', 'aramco', 'بترومين',
      'petromin', 'نفط', 'fuel', 'gas station', 'ادنوك', 'adnoc',
      // Ride hailing / taxi / transit
      'كريم', 'careem', 'اوبر', 'uber', 'بولت', 'bolt', 'تاكسي', 'taxi', 'جيني', 'jeeny',
      'مترو', 'metro', 'قطار', 'سار', 'sar', 'سابتكو', 'saptco', 'نقل', 'مواقف', 'parking',
      'درب', 'darb', 'تمم', 'tamam', 'سلطانه', 'سلطانة',
      // Travel core
      'الخطوط السعوديه', 'saudia', 'طيران ناس', 'flynas', 'طيران اديل', 'flyadeal',
      'الاتحاد', 'etihad', 'طيران', 'airlines', 'airport', 'مطار',
    ],
  },
  {
    kind: 'health',
    keywords: [
      'صيدليه', 'صيدلية', 'pharmacy', 'النهدي', 'nahdi', 'الدواء', 'dawaa', 'whites', 'وايتس',
      'مستشفى', 'مستشفي', 'hospital', 'عياده', 'عيادة', 'clinic', 'طبيب', 'doctor', 'dr ',
      'مختبر', 'lab', 'البرج', 'الحبيب', 'المواساه', 'المواساة', 'مغربي', 'بوبا', 'bupa', 'تاونيات',
      'نادي', 'جيم', 'gym', 'fitness', 'لياقه', 'لياقة', 'بي فيت', 'bfit',
    ],
  },
  {
    kind: 'entertainment',
    keywords: [
      'سينما', 'cinema', 'vox', 'فوكس', 'muvi', 'موفي', 'amc', 'ملاهي', 'العاب', 'games',
      'بلايستيشن', 'playstation', 'psn', 'steam', 'ستيم', 'xbox', 'nintendo', 'جرير جيمنج',
      'بوليفارد', 'boulevard', 'موسم', 'season', 'webook', 'ويبوك', 'تذاكر', 'tickets',
      'فندق', 'hotel', 'booking', 'بوكينق', 'بوكنق', 'airbnb', 'منتجع', 'resort',
    ],
  },
  {
    kind: 'food',
    keywords: [
      // Grocery / hypermarkets
      'بنده', 'بندة', 'panda', 'العثيم', 'othaim', 'التميمي', 'tamimi', 'كارفور', 'carrefour',
      'لولو', 'lulu', 'المزرعه', 'المزرعة', 'نستو', 'nesto', 'دانوب', 'danube', 'سبار', 'spar',
      'بقاله', 'بقالة', 'سوبر ماركت', 'supermarket', 'هايبر', 'hyper', 'تموينات', 'الدانوب',
      // Restaurants / cafes / delivery
      'هنقرستيشن', 'hungerstation', 'جاهز', 'jahez', 'مرسول', 'mrsool', 'ninja', 'نينجا',
      'the chefz', 'شيفز', 'توصيل', 'ماكدونالدز', 'mcdonald', 'ماك', 'كودو', 'kudo', 'هرفي',
      'herfy', 'البيك', 'albaik', 'baik', 'كنتاكي', 'kfc', 'برجر', 'burger', 'بيتزا', 'pizza',
      'دومينوز', 'domino', 'شورما', 'شاورما', 'مطعم', 'restaurant', 'كافيه', 'cafe', 'coffee',
      'قهوه', 'قهوة', 'ستاربكس', 'starbucks', 'دانكن', 'dunkin', 'باريستا', 'barista', 'صب واي',
      'subway', 'كشري', 'شاي', 'مخبز', 'bakery', 'حلويات', 'بسكين', 'baskin', 'دجاج',
    ],
  },
  {
    kind: 'shopping',
    keywords: [
      'جرير', 'jarir', 'اكسترا', 'extra', 'نون', 'noon', 'امازون', 'amazon', 'علي اكسبريس',
      'aliexpress', 'ايكيا', 'ikea', 'سنتربوينت', 'centrepoint', 'ماكس', 'max fashion', 'ساكو',
      'saco', 'هوم سنتر', 'home centre', 'زارا', 'zara', 'h&m', 'نايك', 'nike', 'اديداس',
      'adidas', 'سيفورا', 'sephora', 'ذا بودي شوب', 'namshi', 'نمشي', 'شي ان', 'shein',
      'عبداللطيف جميل', 'ملابس', 'clothing', 'fashion', 'ازياء', 'احذيه', 'احذية', 'شوز',
      'store', 'متجر', 'عطور', 'perfume', 'الكترونيات', 'electronics', 'جوال', 'موبايل',
      'مول', 'mall', 'سوق', 'market place', 'apple store',
      'apple', 'ابل', 'google play', 'app store',
    ],
  },
]

// Pre-normalize keywords once at module load.
const NORMALIZED_RULES = RULES.map((r) => ({ kind: r.kind, keywords: r.keywords.map(normalize) }))

/**
 * Best-effort merchant → category guess. Scans the text (a merchant name, or a
 * whole bank SMS) for the earliest matching keyword. Returns null when nothing
 * is recognised, so the caller can leave the expense unclassified.
 */
export function classifyMerchant(text: string | null | undefined): MerchantClassification | null {
  if (!text) return null
  const hay = normalize(text)
  if (!hay) return null

  let best: { kind: CategoryKind; index: number } | null = null
  for (const rule of NORMALIZED_RULES) {
    for (const keyword of rule.keywords) {
      if (!keyword) continue
      const idx = hay.indexOf(keyword)
      if (idx === -1) continue
      // Prefer the keyword that appears earliest in the text; on a tie the
      // rule order (bills > transport > health > entertainment > food >
      // shopping) breaks it, matching the most-specific-first intent.
      if (best === null || idx < best.index) {
        best = { kind: rule.kind, index: idx }
      }
      break // first keyword hit for this rule is enough
    }
  }

  if (!best) return null
  return {
    kind: best.kind,
    iconKey: KIND_ICON[best.kind],
    importance: KIND_IMPORTANCE[best.kind],
  }
}
