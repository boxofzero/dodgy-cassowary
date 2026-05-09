import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useCurrency } from '../../../app/composables/useCurrency'

describe('useCurrency', () => {
  it('should format plain number as USD currency', () => {
    const { currency } = useCurrency(1234.56)
    expect(currency.value).toBe('$1,234.56')
  })

  it('should format zero as USD currency', () => {
    const { currency } = useCurrency(0)
    expect(currency.value).toBe('$0.00')
  })

  it('should format negative numbers as USD currency', () => {
    const { currency } = useCurrency(-500)
    expect(currency.value).toBe('-$500.00')
  })

  it('should format Ref<number> as USD currency', () => {
    const amount = ref(999.99)
    const { currency } = useCurrency(amount)
    expect(currency.value).toBe('$999.99')
  })

  it('should reactively update when Ref<number> changes', () => {
    const amount = ref(100)
    const { currency } = useCurrency(amount)
    expect(currency.value).toBe('$100.00')

    amount.value = 200
    expect(currency.value).toBe('$200.00')
  })

  it('should format large numbers with proper separators', () => {
    const { currency } = useCurrency(1000000)
    expect(currency.value).toBe('$1,000,000.00')
  })
})
