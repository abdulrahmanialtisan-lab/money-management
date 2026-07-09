const CURRENCY_LOCALE: Record<string, string> = {
  SAR: 'ar-SA',
  USD: 'en-US',
  AED: 'ar-AE',
  KWD: 'ar-KW',
  BHD: 'ar-BH',
  QAR: 'ar-QA',
  OMR: 'ar-OM',
  EGP: 'ar-EG',
  EUR: 'en-GB',
  GBP: 'en-GB',
}

export const SUPPORTED_CURRENCIES = ['SAR', 'USD', 'AED', 'KWD', 'BHD', 'QAR', 'OMR', 'EGP', 'EUR', 'GBP']

export function formatAmount(amount: number, currency: string, language: 'en' | 'ar'): string {
  const locale = language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export function formatNumber(amount: number, language: 'en' | 'ar', fractionDigits = 0): string {
  const locale = language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

export function localeForCurrency(currency: string): string {
  return CURRENCY_LOCALE[currency] ?? 'en-US'
}
