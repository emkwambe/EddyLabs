import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof window === 'undefined') return undefined
          try {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : undefined
          } catch (error) {
            console.warn('Failed to get cookie:', name, error)
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          if (typeof window === 'undefined') return
          const cookieOptions = {
            ...options,
            path: options?.path || '/',
            sameSite: options?.sameSite || 'lax',
          }
          const cookie = `${name}=${value}; path=${cookieOptions.path}; sameSite=${cookieOptions.sameSite}${
            cookieOptions.maxAge ? `; max-age=${cookieOptions.maxAge}` : ''
          }${cookieOptions.secure ? '; secure' : ''}`
          document.cookie = cookie
        },
        remove(name: string, options: any) {
          if (typeof window === 'undefined') return
          document.cookie = `${name}=; path=${options?.path || '/'}; max-age=0`
        },
      },
    }
  )
}
