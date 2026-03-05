/**
 * Generates a branded initials avatar for a reseller.
 * No external images needed — derives a consistent color from the company name.
 */

// Rich color pairs: [background, text]
const PALETTE: [string, string][] = [
  ['#0F172A', '#00C896'],
  ['#0C4A6E', '#7DD3FC'],
  ['#14532D', '#86EFAC'],
  ['#3B0764', '#D8B4FE'],
  ['#7C2D12', '#FED7AA'],
  ['#4A044E', '#F0ABFC'],
  ['#1E3A5F', '#93C5FD'],
  ['#422006', '#FDE68A'],
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0
  }
  return h
}

function getInitials(name: string): string {
  // Strip legal suffixes, split on spaces/caps
  const cleaned = name
    .replace(/\b(lda|sa|sl|ltd|inc|llc|gmbh)\b/gi, '')
    .trim()

  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  // First letter of first two meaningful words
  return (words[0][0] + words[1][0]).toUpperCase()
}

interface LogoAvatarProps {
  name: string
  size?: number
  className?: string
}

export function LogoAvatar({ name, size = 40, className = '' }: LogoAvatarProps) {
  const idx = hashName(name) % PALETTE.length
  const [bg, fg] = PALETTE[idx]
  const initials = getInitials(name)
  const fontSize = Math.round(size * 0.36)
  const borderRadius = Math.round(size * 0.28)

  return (
    <div
      className={`shrink-0 flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
        background: bg,
        color: fg,
        fontSize,
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
