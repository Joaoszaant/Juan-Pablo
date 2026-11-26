import QRCode from 'qrcode'
import { useEffect, useLayoutEffect, useRef, useState, type Ref } from 'react'
import { EVENT } from '../config/event'
import { formatEventDate, formatEventTime, formatVenue } from '../domain/format'
import { sideLabel } from '../domain/seats'
import type { Ticket } from '../domain/types'

export const TICKET_W = 880
export const TICKET_H = 340
const STUB_W = 250
const NOTCH = 18

export function useQrCode(text: string) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(text, { margin: 0, width: 240, errorCorrectionLevel: 'M', color: { dark: '#1c0910', light: '#00000000' } })
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  }, [text])
  return src
}

/** Linhas onduladas tipo guilhoché (padrão de segurança de ingressos antigos). */
function Guilloche() {
  const paths = Array.from({ length: 16 }, (_, k) => {
    const amp = 10 + k * 1.4
    const y0 = 20 + k * 19
    let d = `M0 ${y0}`
    for (let x = 0; x <= TICKET_W - STUB_W; x += 10) d += ` L${x} ${(y0 + Math.sin(x / 38 + k * 0.7) * amp).toFixed(1)}`
    return <path key={k} d={d} fill="none" stroke="#d6ac57" strokeWidth="0.6" opacity={0.12 + (k % 3) * 0.03} />
  })
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${TICKET_W - STUB_W} ${TICKET_H}`} preserveAspectRatio="none" aria-hidden="true">
      {paths}
    </svg>
  )
}

function Field({ label, value, big = false, className = '' }: { label: string; value: string; big?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div style={{ fontFamily: 'Josefin Sans', fontSize: 9, letterSpacing: '0.32em', color: 'rgba(232,200,120,.7)', textTransform: 'uppercase' }}>{label}</div>
      <div
        style={{
          fontFamily: 'Playfair Display', fontVariantNumeric: 'lining-nums',
          fontSize: big ? 26 : 15,
          fontWeight: big ? 700 : 400,
          color: '#fbf0cf',
          marginTop: 4,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export function TicketCard({ ticket, nodeRef }: { ticket: Ticket; nodeRef?: Ref<HTMLDivElement> }) {
  const qr = useQrCode(`${EVENT.showName.toUpperCase()}|${ticket.id}|${ticket.seatId}|SIMULACAO-SEM-VALOR`)
  const mainW = TICKET_W - STUB_W
  const notchMask = `radial-gradient(circle ${NOTCH}px at ${mainW}px 0, transparent 97%, #000 100%) top / 100% 51% no-repeat, radial-gradient(circle ${NOTCH}px at ${mainW}px 100%, transparent 97%, #000 100%) bottom / 100% 51% no-repeat`

  return (
    <div
      ref={nodeRef}
      data-ticket-id={ticket.id}
      style={{
        width: TICKET_W,
        height: TICKET_H,
        position: 'relative',
        display: 'flex',
        WebkitMask: notchMask,
        mask: notchMask,
      }}
    >
      {/* Corpo principal */}
      <div
        style={{
          width: mainW,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 80% 90% at 30% 40%, #6d1426 0%, #4b0e1c 45%, #2a0d16 100%)',
        }}
      >
        <Guilloche />
        {/* Moldura dupla */}
        <div style={{ position: 'absolute', inset: 12, border: '1.5px solid #d6ac57' }} />
        <div style={{ position: 'absolute', inset: 17, border: '0.75px solid rgba(214,172,87,.55)' }} />
        {/* Cantos */}
        {[
          { top: 8, left: 8 },
          { top: 8, right: 8 },
          { bottom: 8, left: 8 },
          { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 14, height: 14, transform: 'rotate(45deg)', background: '#d6ac57', border: '3px solid #2a0d16' }} />
        ))}

        <div style={{ position: 'absolute', inset: '30px 40px 28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Josefin Sans', fontSize: 10, letterSpacing: '0.4em', color: '#e8c878', textTransform: 'uppercase' }}>
            <span>★ Admite um · Admit one ★</span>
            <span style={{ letterSpacing: '0.2em' }}>VIP · Plateia</span>
          </div>

          <div style={{ marginTop: 16, fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 17, color: 'rgba(242,230,204,.8)' }}>
            {EVENT.host} apresenta
          </div>
          <div
            style={{
              fontFamily: 'Limelight',
              fontSize: 50,
              lineHeight: 1,
              marginTop: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              background: 'linear-gradient(176deg, #fff3cf 0%, #f0d38a 25%, #c1913e 50%, #f6dc96 65%, #a87a2e 90%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            {EVENT.showName}
          </div>
          <div style={{ marginTop: 6, height: 1, width: 230, background: 'linear-gradient(90deg,#d6ac57,transparent)' }} />

          <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '2.1fr 0.8fr 0.8fr', columnGap: 22, rowGap: 14 }}>
            <Field label="Participante" value={ticket.holderName} />
            <Field label="Fileira" value={ticket.row} big />
            <Field label="Assento" value={String(ticket.number)} big />
            <Field label="Data" value={formatEventDate('short')} />
            <Field label="Horário" value={formatEventTime()} />
            <Field label="Lado" value={sideLabel(ticket.side).replace('Lado ', '')} />
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: 'Josefin Sans', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(242,230,204,.55)', textTransform: 'uppercase' }}>
            <span style={{ whiteSpace: 'nowrap' }}>Local: {formatVenue()}</span>
            <span style={{ whiteSpace: 'nowrap' }}>Ingresso fictício</span>
          </div>
        </div>
      </div>

      {/* Perfuração */}
      <div style={{ position: 'absolute', left: mainW - 1, top: NOTCH + 4, bottom: NOTCH + 4, borderLeft: '2px dashed rgba(28,9,16,.55)', zIndex: 2 }} />

      {/* Canhoto */}
      <div
        style={{
          width: STUB_W,
          height: '100%',
          position: 'relative',
          background: 'radial-gradient(ellipse at 30% 20%, #fbf3dd, #efe0bd 60%, #e2cc9c)',
          color: '#1c0910',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '26px 22px 20px',
        }}
      >
        <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(122,19,38,.45)' }} />
        <div style={{ fontFamily: 'Josefin Sans', fontSize: 9, letterSpacing: '0.35em', color: '#7a1326', textTransform: 'uppercase' }}>Assento</div>
        <div style={{ fontFamily: 'Playfair Display', fontVariantNumeric: 'lining-nums', fontWeight: 900, fontSize: 44, lineHeight: 1, marginTop: 4, color: '#4b0e1c' }}>{ticket.seatId}</div>
        <div style={{ marginTop: 12, width: 112, height: 112, padding: 6, border: '1px solid rgba(28,9,16,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {qr ? <img src={qr} alt={`QR Code do ingresso ${ticket.id}`} style={{ width: 100, height: 100 }} /> : <div style={{ width: 100, height: 100, background: 'rgba(28,9,16,.08)' }} />}
        </div>
        <div style={{ marginTop: 10, fontFamily: 'Josefin Sans', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em' }}>{ticket.id}</div>
        <div style={{ marginTop: 'auto', fontFamily: 'Josefin Sans', fontSize: 7.5, letterSpacing: '0.2em', textAlign: 'center', color: 'rgba(28,9,16,.6)', textTransform: 'uppercase', lineHeight: 1.5 }}>
          Assento ilustrativo
          <br />
          Lugares livres no dia
        </div>
      </div>
    </div>
  )
}

/** Exibe o ingresso escalado para caber no container, mantendo o nó original intacto para exportação. */
export function ScaledTicket({ ticket, nodeRef }: { ticket: Ticket; nodeRef?: Ref<HTMLDivElement> }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / TICKET_W))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={wrap} className="w-full" style={{ height: TICKET_H * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: TICKET_W, filter: 'drop-shadow(0 18px 28px rgba(0,0,0,.55))' }}>
        <TicketCard ticket={ticket} nodeRef={nodeRef} />
      </div>
    </div>
  )
}
