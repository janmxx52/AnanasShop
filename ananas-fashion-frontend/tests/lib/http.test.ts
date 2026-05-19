import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, beforeEach } from 'vitest'
import { http } from '@/lib/http'
import { setGuestToken } from '@/lib/storage'

function headerValue(config: InternalAxiosRequestConfig, key: string): string | undefined {
  const headers = config.headers as {
    get?: (name: string) => string | undefined
    [k: string]: unknown
  }

  if (typeof headers.get === 'function') {
    return headers.get(key)
  }

  const value = headers[key]
  return typeof value === 'string' ? value : undefined
}

describe('http guest token headers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('attaches X-Guest-Token to voucher check requests', async () => {
    setGuestToken('guest-test-token')

    await http.post(
      '/vouchers/check',
      { code: 'SALE10' },
      {
        adapter: async (config) => {
          expect(headerValue(config, 'X-Guest-Token')).toBe('guest-test-token')

          return {
            data: { success: true, data: {} },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          }
        },
      },
    )
  })
})
