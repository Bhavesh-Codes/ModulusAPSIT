"use client";

import { useState } from "react";
import Image from "next/image";

interface LogoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

// Institution logo in a white chip so it stays legible in dark mode.
// Falls back to a dashed placeholder if the file is missing.
export default function Logo({ src, alt, width, height, className = "" }: LogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      {failed ? (
        <span
          role="img"
          aria-label={alt}
          className="flex h-8 w-12 items-center justify-center rounded border border-dashed border-neutral-400 font-mono text-[10px] text-neutral-500 dark:bg-neutral-700"
        >
          Logo
        </span>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          onError={() => setFailed(true)}
          className="h-9 sm:h-11 w-auto max-w-[4.5rem] sm:max-w-[7.5rem] object-contain"
        />
      )}
    </span>
  );
}
