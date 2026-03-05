'use client'

import { useState } from 'react'
import { LogoAvatar } from './LogoAvatar'

interface ResellerDetailPhotoProps {
  src?: string
  name: string
}

export function ResellerDetailPhoto({ src, name }: ResellerDetailPhotoProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <LogoAvatar name={name} size={56} className="rounded-xl" />
  }

  return (
    <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-evolt-border bg-evolt-surface shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} storefront`}
        width={56}
        height={56}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
