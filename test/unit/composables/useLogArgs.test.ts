import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useLogArgs from '../../../app/composables/useLogArgs'

describe('useLogArgs', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('should log key/value pairs in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development')

    useLogArgs({ name: 'test', value: 123 })
    
    expect(consoleLogSpy).toHaveBeenCalledTimes(2)
    expect(consoleLogSpy).toHaveBeenCalledWith('name: test')
    expect(consoleLogSpy).toHaveBeenCalledWith('value: 123')

    vi.unstubAllEnvs()
  })

  it('should not log in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production')

    useLogArgs({ name: 'test', value: 123 })
    
    expect(consoleLogSpy).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })

  it('should serialize objects as JSON', () => {
    vi.stubEnv('NODE_ENV', 'development')

    useLogArgs({ data: { a: 1, b: 2 } })
    
    expect(consoleLogSpy).toHaveBeenCalledWith('data: {"a":1,"b":2}')

    vi.unstubAllEnvs()
  })

  it('should handle null values', () => {
    vi.stubEnv('NODE_ENV', 'development')

    useLogArgs({ nullable: null })
    
    expect(consoleLogSpy).toHaveBeenCalledWith('nullable: null')

    vi.unstubAllEnvs()
  })

  it('should handle empty object', () => {
    vi.stubEnv('NODE_ENV', 'development')

    useLogArgs({})
    
    expect(consoleLogSpy).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })

  it('should handle array values', () => {
    vi.stubEnv('NODE_ENV', 'development')

    useLogArgs({ items: [1, 2, 3] })
    
    expect(consoleLogSpy).toHaveBeenCalledWith('items: [1,2,3]')

    vi.unstubAllEnvs()
  })
})
