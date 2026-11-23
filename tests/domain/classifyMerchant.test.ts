import { describe, expect, it } from 'vitest'
import { classifyMerchant } from '../../src/domain/classifyMerchant'

describe('classifyMerchant', () => {
  it('returns null for empty / unknown input', () => {
    expect(classifyMerchant('')).toBeNull()
    expect(classifyMerchant(null)).toBeNull()
    expect(classifyMerchant('شركة غير معروفة xyz')).toBeNull()
  })

  it('classifies Saudi grocery + restaurants as food (important)', () => {
    expect(classifyMerchant('بنده')?.kind).toBe('food')
    expect(classifyMerchant('العثيم مول')?.kind).toBe('food')
    expect(classifyMerchant('STARBUCKS RIYADH')?.kind).toBe('food')
    const c = classifyMerchant('هنقرستيشن')
    expect(c?.kind).toBe('food')
    expect(c?.importance).toBe('important')
    expect(c?.iconKey).toBe('food')
  })

  it('classifies fuel + ride hailing as transport', () => {
    expect(classifyMerchant('محطة ساسكو')?.kind).toBe('transport')
    expect(classifyMerchant('CAREEM')?.kind).toBe('transport')
    expect(classifyMerchant('اوبر')?.kind).toBe('transport')
  })

  it('classifies telecom + streaming as bills', () => {
    expect(classifyMerchant('STC')?.kind).toBe('bills')
    expect(classifyMerchant('NETFLIX.COM')?.kind).toBe('bills')
    expect(classifyMerchant('فاتورة الكهرباء')?.kind).toBe('bills')
  })

  it('classifies retail as shopping (not important)', () => {
    const c = classifyMerchant('JARIR BOOKSTORE')
    expect(c?.kind).toBe('shopping')
    expect(c?.importance).toBe('not_important')
    expect(classifyMerchant('نون')?.kind).toBe('shopping')
  })

  it('classifies pharmacies + clinics as health', () => {
    expect(classifyMerchant('صيدلية النهدي')?.kind).toBe('health')
    expect(classifyMerchant('مستشفى الحبيب')?.kind).toBe('health')
  })

  it('classifies cinema + games as entertainment', () => {
    expect(classifyMerchant('VOX CINEMAS')?.kind).toBe('entertainment')
    expect(classifyMerchant('PLAYSTATION NETWORK')?.kind).toBe('entertainment')
  })

  it('prefers the subscription reading of amazon prime over bare amazon', () => {
    expect(classifyMerchant('AMAZON PRIME')?.kind).toBe('bills')
    expect(classifyMerchant('AMAZON.SA')?.kind).toBe('shopping')
  })

  it('is forgiving of Arabic orthography variants', () => {
    // alef-hamza, ta-marbuta, tatweel
    expect(classifyMerchant('صيدليّة الدواء')?.kind).toBe('health')
    expect(classifyMerchant('مطعـم البيك')?.kind).toBe('food')
  })
})
