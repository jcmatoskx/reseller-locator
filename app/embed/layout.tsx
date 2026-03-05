/**
 * Embed layout — no header nav, no extra padding, full height.
 * Used for iframe embedding on evolt.pt.
 */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
