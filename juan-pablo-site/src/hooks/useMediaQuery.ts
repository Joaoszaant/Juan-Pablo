import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Segundos restantes até `expiresAt` (epoch ms); null se não houver. */
export function useCountdown(expiresAt: number | null, onExpire?: () => void) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (!expiresAt) {
      setLeft(null)
      return
    }
    let fired = false
    const tick = () => {
      const s = Math.max(0, Math.round((expiresAt - Date.now()) / 1000))
      setLeft(s)
      if (s === 0 && !fired) {
        fired = true
        onExpire?.()
      }
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt])
  return left
}
