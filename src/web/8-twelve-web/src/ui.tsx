import { useEffect, useRef, type ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  analytics: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2" /></>,
  transactions: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  products: <><path d="M4 7 12 3l8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10" /></>,
  inventory: <><path d="M3 7h18v13H3zM5 7V4h14v3M9 11h6" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" /><circle cx="12" cy="12" r="8" /></>,
  logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9M10 21h4" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /></>,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
}

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.dashboard}</svg>
}

export function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? 'brand-light' : ''}`}><img className="brand-mark" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" /><span><b>8-Twelve</b><small>KIOSK MANAGEMENT</small></span></div>
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key === 'Tab' && ref.current) {
        const elements = ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], textarea:not(:disabled)')
        if (!elements.length) return
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.removeEventListener('keydown', keydown); previous?.focus() }
  }, [])
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref}>
      <div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
      {children}
    </div>
  </div>
}

export function Badge({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' | 'gray' }) {
  return <span className={`badge ${tone}`}><span />{children}</span>
}

export function Empty({ text }: { text: string }) {
  return <div className="empty"><span>⌕</span><strong>Nothing to show</strong><p>{text}</p></div>
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="search-field"><Icon name="search" size={17} /><span className="sr-only">{placeholder}</span><input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>{action}</div>
}
