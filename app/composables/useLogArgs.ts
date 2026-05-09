/**
 * Log key/value pairs of an argument object for debugging.
 *
 * The function is a no‑op in production builds.
 *
 * @param argsObj - An object whose properties will be logged.
 */
export default function useLogArgs(
  argsObj: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production') return;

  for (const [key, value] of Object.entries(argsObj)) {
    const serialized =
      typeof value === 'object' && value !== null
        ? JSON.stringify(value)
        : String(value)
    console.log(`${key}: ${serialized}`)
  }
}