import { Check } from 'lucide-react'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { LAYOUT, MAX_COLS_PER_SIDE, SEAT_BY_ID, SEATS_PER_SIDE, sideLabel } from '../domain/seats'
import type { SeatDef, SeatSnapshot, SeatStatus, Side } from '../domain/types'
import { useMediaQuery } from '../hooks/useMediaQuery'

export const STATUS_LABEL: Record<SeatStatus, string> = {
  available: 'disponível',
  selected: 'selecionado',
  held: 'em processo de compra',
  occupied: 'ocupado',
}

export function seatStatus(id: string, snap: SeatSnapshot, selected: Set<string>): SeatStatus {
  if (snap.occupied.has(id)) return 'occupied'
  if (selected.has(id)) return 'selected'
  if (snap.heldByOthers.has(id) || snap.heldByMe.has(id)) return 'held'
  return 'available'
}

interface Props {
  snapshot: SeatSnapshot
  selected: Set<string>
  onToggle: (seat: SeatDef) => void
}

function Stage() {
  return (
    <div className="relative mx-auto mt-8 w-full max-w-[640px]" aria-hidden="true">
      <svg viewBox="0 0 640 70" className="w-full">
        <defs>
          <linearGradient id="stageFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b0e1c" />
            <stop offset="1" stopColor="#1c0910" />
          </linearGradient>
          <linearGradient id="stageEdge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7d5a20" />
            <stop offset=".5" stopColor="#f6dc96" />
            <stop offset="1" stopColor="#7d5a20" />
          </linearGradient>
        </defs>
        <path d="M20 66h600V40c-80-30-200-36-300-36S100 10 20 40z" fill="url(#stageFill)" stroke="url(#stageEdge)" strokeWidth="1.5" />
        <text x="320" y="46" textAnchor="middle" fontFamily="Josefin Sans, sans-serif" fontSize="13" letterSpacing="9" fill="#e8c878" fontWeight="600">
          PALCO
        </text>
      </svg>
      <div className="absolute inset-x-[20%] -top-6 h-10 rounded-[50%] bg-gold-200/10 blur-xl" />
    </div>
  )
}

export function SeatMap({ snapshot, selected, onToggle }: Props) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [mobileSide, setMobileSide] = useState<Side>('left')
  const [focusId, setFocusId] = useState<string>(LAYOUT[0].left[LAYOUT[0].left.length - 1].id)
  const [hovered, setHovered] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  const visibleSides: Side[] = isMobile ? [mobileSide] : ['left', 'right']

  // Linhas com os assentos visíveis, em ordem de coluna — base da navegação por teclado.
  const grid = useMemo(
    () => LAYOUT.map((r) => [...(visibleSides.includes('left') ? r.left : []), ...(visibleSides.includes('right') ? r.right : [])]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMobile, mobileSide],
  )

  const effectiveFocus = grid.flat().some((s) => s.id === focusId) ? focusId : grid[0][grid[0].length - 1].id

  const moveFocus = (id: string) => {
    setFocusId(id)
    refs.current.get(id)?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, seat: SeatDef) => {
    const row = grid[seat.rowIndex]
    const idx = row.findIndex((s) => s.id === seat.id)
    let next: SeatDef | undefined
    const nearestIn = (r: SeatDef[]) => r.reduce((best, s) => (Math.abs(s.col - seat.col) < Math.abs(best.col - seat.col) ? s : best), r[0])
    switch (e.key) {
      case 'ArrowRight': next = row[idx + 1]; break
      case 'ArrowLeft': next = row[idx - 1]; break
      case 'ArrowUp': next = grid[seat.rowIndex - 1] && nearestIn(grid[seat.rowIndex - 1]); break
      case 'ArrowDown': next = grid[seat.rowIndex + 1] && nearestIn(grid[seat.rowIndex + 1]); break
      case 'Home': next = row[0]; break
      case 'End': next = row[row.length - 1]; break
      default: return
    }
    e.preventDefault()
    if (next) moveFocus(next.id)
  }

  const countSelected = (side: Side) => [...selected].filter((id) => SEAT_BY_ID.get(id)?.side === side).length

  const renderSeat = (seat: SeatDef) => {
    const status = seatStatus(seat.id, snapshot, selected)
    const blocked = status === 'occupied' || status === 'held'
    return (
      <button
        key={seat.id}
        ref={(el) => {
          if (el) refs.current.set(seat.id, el)
          else refs.current.delete(seat.id)
        }}
        type="button"
        role="gridcell"
        tabIndex={seat.id === effectiveFocus ? 0 : -1}
        aria-label={`Assento ${seat.id}, fileira ${seat.row}, ${sideLabel(seat.side).toLowerCase()}, ${STATUS_LABEL[status]}`}
        aria-pressed={status === 'selected'}
        aria-disabled={blocked || undefined}
        data-seat={seat.id}
        data-status={status}
        className={`seat seat-${status} ${isMobile ? '!w-[28px] !h-[25px]' : ''}`}
        onClick={() => {
          setFocusId(seat.id)
          if (!blocked) onToggle(seat)
        }}
        onKeyDown={(e) => onKeyDown(e, seat)}
        onMouseEnter={() => setHovered(seat.id)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(seat.id)}
      >
        {status === 'selected' && <Check size={12} strokeWidth={3} aria-hidden="true" />}
        {status === 'occupied' && <span className="h-px w-2 bg-[#5c5053]" aria-hidden="true" />}
      </button>
    )
  }

  // Espaços vazios para alinhar os assentos ao corredor.
  const pad = (n: number) => Array.from({ length: n }, (_, i) => <span key={`p${i}`} aria-hidden="true" className={isMobile ? 'w-[28px] shrink-0' : 'w-[26px] shrink-0'} />)

  const hoveredSeat = hovered ? SEAT_BY_ID.get(hovered) : null

  return (
    <div>
      {isMobile && (
        <div role="tablist" aria-label="Escolha o lado da sala" className="mb-6 grid grid-cols-2 border border-gold-500/40">
          {(['left', 'right'] as Side[]).map((side) => (
            <button
              key={side}
              role="tab"
              type="button"
              aria-selected={mobileSide === side}
              onClick={() => setMobileSide(side)}
              className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${
                mobileSide === side ? 'bg-gold-400 text-ink' : 'text-gold-200 hover:bg-gold-400/10'
              }`}
            >
              {sideLabel(side)}
              {countSelected(side) > 0 && (
                <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] ${mobileSide === side ? 'bg-ink text-gold-200' : 'bg-scarlet text-cream'}`}>
                  {countSelected(side)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}


      <div className="overflow-x-auto pb-2">
        <div role="grid" aria-label="Mapa de assentos do auditório" className="mx-auto w-max">
          {!isMobile && (
            <div className="mb-3 flex items-center text-[0.6rem] font-semibold tracking-[0.35em] text-cream/45 uppercase" aria-hidden="true">
              <span className="w-7" />
              <span className="text-center" style={{ width: MAX_COLS_PER_SIDE * 30 }}>Lado esquerdo</span>
              <span className="w-14 text-center">Corredor</span>
              <span className="text-center" style={{ width: MAX_COLS_PER_SIDE * 30 }}>Lado direito</span>
            </div>
          )}
          {LAYOUT.map((row) => (
            <div key={row.letter} role="row" className={`flex items-center ${isMobile ? 'mb-2.5' : 'mb-2'}`}>
              <span aria-hidden="true" className={`${isMobile ? 'w-5' : 'w-7'} shrink-0 font-serif text-xs text-gold-400/70`}>{row.letter}</span>
              {visibleSides.includes('left') && (
                <div className={`flex ${isMobile ? 'gap-[4px]' : 'gap-1'}`}>
                  {pad(MAX_COLS_PER_SIDE - row.left.length)}
                  {row.left.map(renderSeat)}
                </div>
              )}
              {!isMobile && (
                <span aria-hidden="true" className="flex w-14 shrink-0 justify-center font-serif text-[0.65rem] text-gold-400/35">
                  {row.letter}
                </span>
              )}
              {visibleSides.includes('right') && (
                <div className={`flex ${isMobile ? 'gap-[4px]' : 'gap-1'}`}>
                  {row.right.map(renderSeat)}
                  {pad(MAX_COLS_PER_SIDE - row.right.length)}
                </div>
              )}
              <span aria-hidden="true" className={`${isMobile ? 'w-5' : 'w-7'} shrink-0 text-right font-serif text-xs text-gold-400/70`}>{row.letter}</span>
            </div>
          ))}
        </div>
      </div>

      <Stage />

      <p className="mt-4 min-h-6 text-center text-sm text-cream/60" aria-live="polite">
        {hoveredSeat ? (
          <>
            <span className="font-serif text-gold-200">Assento {hoveredSeat.id}</span> · Fileira {hoveredSeat.row} ·{' '}
            {sideLabel(hoveredSeat.side)} · {STATUS_LABEL[seatStatus(hoveredSeat.id, snapshot, selected)]}
          </>
        ) : (
          <span className="hidden sm:inline">Use o mouse ou as setas do teclado para navegar pelos assentos.</span>
        )}
      </p>
      <p className="sr-only">{SEATS_PER_SIDE} lugares por lado.</p>
    </div>
  )
}

export function Legend() {
  const items: { status: SeatStatus; label: string }[] = [
    { status: 'available', label: 'Disponível' },
    { status: 'selected', label: 'Selecionado' },
    { status: 'held', label: 'Em processo de compra' },
    { status: 'occupied', label: 'Ocupado' },
  ]
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3" aria-label="Legenda do mapa de assentos">
      {items.map(({ status, label }) => (
        <li key={status} className="flex items-center gap-2.5 text-xs tracking-[0.15em] text-cream/75 uppercase">
          <span className={`seat seat-${status} !cursor-default !animate-none`} aria-hidden="true">
            {status === 'selected' && <Check size={12} strokeWidth={3} />}
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}
