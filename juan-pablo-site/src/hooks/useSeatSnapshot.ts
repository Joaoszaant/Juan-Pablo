import { useCallback, useEffect, useState } from 'react'
import type { SeatSnapshot } from '../domain/types'
import { repository, sessionId, usingSharedDatabase } from '../services'

const EMPTY: SeatSnapshot = { occupied: new Set(), heldByOthers: new Set(), heldByMe: new Set(), myHoldExpiresAt: null }

/** Estado dos assentos, sincronizado com outras abas e com expiração das reservas. */
export function useSeatSnapshot() {
  const [snapshot, setSnapshot] = useState<SeatSnapshot>(EMPTY)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await repository.getSnapshot(sessionId))
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const unsub = repository.subscribe(() => void refresh())
    const timer = window.setInterval(() => void refresh(), usingSharedDatabase ? 8_000 : 15_000)
    return () => {
      unsub()
      window.clearInterval(timer)
    }
  }, [refresh])

  return { snapshot, loading, error, refresh }
}

export function useTickets() {
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof repository.listTickets>>>([])
  useEffect(() => {
    const load = () => void repository.listTickets().then(setTickets).catch(() => {})
    load()
    return repository.subscribe(load)
  }, [])
  return tickets
}
