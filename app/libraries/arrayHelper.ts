export function orderBy<T>(
  array: T[],
  keys: (keyof T)[],
  orders?: ('asc' | 'desc')[]
): T[] {
  return [...array].sort((a, b) => {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const order = (orders?.[i] || 'asc').toLowerCase() as 'asc' | 'desc'
      const valA = (a as any)[key]
      const valB = (b as any)[key]

      if (valA === valB) continue

      const compare = valA > valB ? 1 : -1
      return order === 'desc' ? -compare : compare
    }
    return 0
  })
}