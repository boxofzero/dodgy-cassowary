export const transactionViewOptions = ['Yearly', 'Monthly', 'Daily'] as const
export const categories = ['Food', 'Housing', 'Car', 'Entertainment'] as const
export const types = ['Income', 'Expense', 'Saving', 'Investment'] as const

export const MAX_STAMINA = 240

export const getSecondsPerStamina = (): number => {
  if (import.meta.dev || import.meta?.env?.TEST?.toLowerCase?.() === 'true') {
    return 5
  }
  return 6 * 60
}