export interface ParsedBankMessage {
  amount: number | null
  merchant: string | null
}

// Ordered most-specific-first so e.g. "SAR 45.50" wins over a bare "45.50".
const AMOUNT_PATTERNS = [
  /(?:SAR|SR)\s*([\d,]+\.\d{1,2})/i,
  /([\d,]+\.\d{1,2})\s*(?:SAR|SR)\b/i,
  /(?:SAR|SR)\s*([\d,]+)\b/i,
  /([\d,]+)\s*(?:SAR|SR)\b/i,
  /(?:ريال\s*سعودي|ريال|ر\.س|﷼)\s*([\d,]+\.\d{1,2})/,
  /([\d,]+\.\d{1,2})\s*(?:ريال\s*سعودي|ريال|ر\.س|﷼)/,
  /(?:ريال\s*سعودي|ريال|ر\.س|﷼)\s*([\d,]+)/,
  /([\d,]+)\s*(?:ريال\s*سعودي|ريال|ر\.س|﷼)/,
]

function extractAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const value = Number(match[1].replace(/,/g, ''))
      if (!Number.isNaN(value) && value > 0) return value
    }
  }
  return null
}

// Longest/most specific phrases first so "لدى التاجر" wins over the bare "لدى".
const MERCHANT_KEYWORDS = [
  'لدى التاجر',
  'اسم التاجر',
  'التاجر:',
  'التاجر',
  'في متجر',
  'من متجر',
  'بمحل',
  'لدى',
  'merchant:',
  'merchant',
  'at',
  'from',
  'في',
  'من',
]

const MERCHANT_STOP_WORDS = [
  'بتاريخ',
  'تاريخ',
  'الرصيد',
  'رصيدك',
  'رصيد الحساب',
  'الساعة',
  'رقم البطاقة',
  'رقم الحساب',
  ' on ',
  'date',
  'balance',
  'available',
  'card ending',
]

function extractMerchant(text: string): string | null {
  const lower = text.toLowerCase()
  for (const keyword of MERCHANT_KEYWORDS) {
    const idx = lower.indexOf(keyword.toLowerCase())
    if (idx === -1) continue

    let rest = text.slice(idx + keyword.length).trim()
    let cut = rest.length
    const restLower = rest.toLowerCase()
    for (const stop of MERCHANT_STOP_WORDS) {
      const stopIdx = restLower.indexOf(stop.toLowerCase())
      if (stopIdx !== -1 && stopIdx < cut) cut = stopIdx
    }
    const newlineIdx = rest.search(/[\n\r]/)
    if (newlineIdx !== -1 && newlineIdx < cut) cut = newlineIdx

    rest = rest
      .slice(0, cut)
      .replace(/^[:\-\s]+/, '')
      .replace(/[.,;:\s]+$/, '')
      .trim()

    if (rest.length >= 2 && rest.length <= 40) return rest
  }
  return null
}

/** Best-effort extraction from a pasted bank SMS/notification. Never throws — a field stays null if not found. */
export function parseBankMessage(text: string): ParsedBankMessage {
  return { amount: extractAmount(text), merchant: extractMerchant(text) }
}
