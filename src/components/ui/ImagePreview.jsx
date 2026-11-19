import { useState } from 'react'

// Shows an image URL with an explicit failure state instead of a broken-image icon.
// Remembering the failed src (not a boolean) means editing the URL retries automatically.
export default function ImagePreview({ src, alt = '', className = '', announce = false }) {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src) return null

  if (failedSrc === src) {
    return (
      <p
        role={announce ? 'status' : undefined}
        className={`flex items-center justify-center rounded-lg border border-dashed border-rule bg-paper px-3 text-center text-sm text-ink-muted ${className}`}
      >
        Couldn't load this image — check the URL.
      </p>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />
}
