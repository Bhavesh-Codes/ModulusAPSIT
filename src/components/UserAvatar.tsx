"use client"

import { useEffect, useState } from "react"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  /** Tile container classes (size, background, border, rounding). */
  className?: string
  /** Classes for the fallback initial letter. */
  letterClassName?: string
  /** Classes for the image itself. */
  imgClassName?: string
}

/**
 * Avatar that never shows the browser's broken-image glyph.
 * Renders the photo while it loads; falls back to the user's initial if the
 * URL fails (e.g. expired/rotated Google avatar URLs).
 */
export default function UserAvatar({
  src,
  name,
  className = "",
  letterClassName = "",
  imgClassName = "w-full h-full object-cover",
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false)

  // Reset when a new URL arrives (e.g. the user changed their photo).
  useEffect(() => {
    setFailed(false)
  }, [src])

  const showPhoto = !!src && !failed
  const initial = (name ?? "").trim().charAt(0).toUpperCase() || "?"

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {showPhoto ? (
        <img
          src={src ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      ) : (
        <span className={letterClassName}>{initial}</span>
      )}
    </div>
  )
}
