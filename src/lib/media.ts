import { useEffect, useState } from 'react'

export const MOBILE_QUERY = '(max-width: 759px)'
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function matches(query: string) {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => matches(query))
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatch(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return match
}

export const useIsMobile = () => useMedia(MOBILE_QUERY)
