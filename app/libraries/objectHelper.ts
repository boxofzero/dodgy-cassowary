const hasOwnProperty = Object.prototype.hasOwnProperty

export function has(obj: any, key: string): boolean {
  if (!obj) return false
  const keyParts = key.split('.')
  const firstKey = keyParts[0] as string
  if (keyParts.length > 1) {
    return has(obj[firstKey], keyParts.slice(1).join('.'))
  }
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function mergeWithSum(...sources: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      result[key] = (result[key] || 0) + (value || 0)
    }
  }

  return result
}

export function pickBy(obj: Record<string, unknown>, predicate: (value: unknown, key: string) => boolean): Record<string, unknown> {
  return Object.keys(obj).reduce((result, key) => {
    const value = obj[key]
    if (predicate(value, key)) {
      (result as any)[key] = value
    }
    return result
  }, {} as Record<string, unknown>)
}

export function omit(obj: Record<string, unknown>, ...keysToOmit: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (!keysToOmit.includes(key)) {
      (result as any)[key] = value
    }
  }

  return result
}