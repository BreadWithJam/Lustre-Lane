import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to environment variables', () => {
    // This test ensures our environment is set up correctly
    expect(process.env.NODE_ENV).toBeDefined()
  })
})