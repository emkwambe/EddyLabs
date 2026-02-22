/**
 * Utility to clear corrupted Supabase sessions
 * Use this if you encounter session-related errors
 */

export function clearSupabaseSession() {
  if (typeof window === 'undefined') return

  try {
    // Clear localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Clear sessionStorage
    const sessionKeysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        sessionKeysToRemove.push(key)
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

    // Clear Supabase cookies
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name.startsWith('sb-') || name.includes('supabase')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })

    console.log('Supabase session cleared successfully')

    // Reload the page to reinitialize
    window.location.reload()
  } catch (error) {
    console.error('Error clearing session:', error)
  }
}

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).clearSupabaseSession = clearSupabaseSession
}
