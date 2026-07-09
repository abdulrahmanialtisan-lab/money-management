import { describe, expect, it } from 'vitest'
import { parseBankMessage } from '../../src/domain/parseBankMessage'

describe('parseBankMessage', () => {
  it('parses an Arabic purchase message with "لدى"', () => {
    const result = parseBankMessage('عملية شراء بمبلغ 45.50 ريال سعودي لدى STARBUCKS COFFEE بتاريخ 09-07-2026')
    expect(result.amount).toBe(45.5)
    expect(result.merchant).toBe('STARBUCKS COFFEE')
  })

  it('parses an Arabic SAR-code message with thousands separator', () => {
    const result = parseBankMessage('تم خصم مبلغ SAR 1,200.00 من حسابك لدى CARREFOUR بتاريخ 09/07/2026 الساعة 14:30')
    expect(result.amount).toBe(1200)
    expect(result.merchant).toBe('CARREFOUR')
  })

  it('parses an English purchase message with "at" and trailing balance', () => {
    const result = parseBankMessage('Purchase of SAR 89.00 at AMAZON.SA on 09-Jul-2026. Available balance SAR 3,450.00')
    expect(result.amount).toBe(89)
    expect(result.merchant).toBe('AMAZON.SA')
  })

  it('parses a whole-number amount with "في متجر"', () => {
    const result = parseBankMessage('تم الدفع بمبلغ 25 ريال في متجر جرير بتاريخ اليوم')
    expect(result.amount).toBe(25)
    expect(result.merchant).toBe('جرير')
  })

  it('extracts an amount even without a recognizable merchant', () => {
    const result = parseBankMessage('سحب نقدي بمبلغ 500 ريال بتاريخ 09-07-2026')
    expect(result.amount).toBe(500)
  })

  it('returns nulls for unrelated text', () => {
    const result = parseBankMessage('مرحبا كيف حالك اليوم')
    expect(result.amount).toBeNull()
    expect(result.merchant).toBeNull()
  })

  it('prefers the currency-adjacent number over unrelated numbers in the message', () => {
    const result = parseBankMessage('رصيدك المتاح 10,000.00 - عملية شراء بمبلغ SAR 60.00 لدى NOON')
    expect(result.amount).toBe(60)
    expect(result.merchant).toBe('NOON')
  })

  it('handles the short "SR" currency code case-insensitively', () => {
    const result = parseBankMessage('purchase of sr 15 at PANDA')
    expect(result.amount).toBe(15)
    expect(result.merchant).toBe('PANDA')
  })

  it('does not truncate a merchant name that contains a stop-word substring', () => {
    const result = parseBankMessage('شراء بمبلغ 30 ريال لدى CARREFOUR بتاريخ اليوم')
    expect(result.merchant).toBe('CARREFOUR')
  })
})
