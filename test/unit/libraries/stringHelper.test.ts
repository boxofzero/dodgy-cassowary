import { describe, it, expect } from 'vitest'
import { capitalize, startCase } from '../../../app/libraries/stringHelper'

describe('capitalize', () => {
  it('should capitalize first letter and lowercase rest', () => {
    expect(capitalize('hello')).toBe('Hello')
    expect(capitalize('HELLO')).toBe('Hello')
    expect(capitalize('hELLO')).toBe('Hello')
  })

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A')
    expect(capitalize('A')).toBe('A')
  })

  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle string with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })

  it('should handle null/undefined gracefully', () => {
    expect(capitalize(null as any)).toBe('')
    expect(capitalize(undefined as any)).toBe('')
  })
})

describe('startCase', () => {
  it('should convert camelCase to start case', () => {
    expect(startCase('camelCase')).toBe('Camel Case')
    expect(startCase('thisIsATest')).toBe('This Is A Test')
  })

  it('should convert snake_case to start case', () => {
    expect(startCase('snake_case')).toBe('Snake Case')
    expect(startCase('this_is_a_test')).toBe('This Is A Test')
  })

  it('should convert kebab-case to start case', () => {
    expect(startCase('kebab-case')).toBe('Kebab Case')
    expect(startCase('this-is-a-test')).toBe('This Is A Test')
  })

  it('should handle multiple separators', () => {
    expect(startCase('mixed-Format_withStuff')).toBe('Mixed Format With Stuff')
  })

  it('should handle single word', () => {
    expect(startCase('word')).toBe('Word')
  })

  it('should handle already start case', () => {
    expect(startCase('Start Case')).toBe('Start Case')
  })

  it('should trim extra spaces', () => {
    expect(startCase('  extra   spaces  ')).toBe('Extra Spaces')
  })

  it('should handle empty string', () => {
    expect(startCase('')).toBe('')
  })
})
