"use client";

import Image from "next/image";

interface LogoProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function Logo({ src, alt, size = 40, className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-lg p-1 shrink-0 ${className}`}
      style={{ width: size + 8, height: size + 8 }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          // Replace broken image with a dashed fallback box
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent && !parent.querySelector(".logo-fallback")) {
            const fallback = document.createElement("span");
            fallback.className =
              "logo-fallback flex items-center justify-center border-2 border-dashed border-foreground/30 rounded text-[9px] font-mono text-foreground/50 text-center leading-tight px-0.5";
            fallback.style.width = `${size}px`;
            fallback.style.height = `${size}px`;
            fallback.textContent = alt.slice(0, 6);
            parent.appendChild(fallback);
          }
        }}
      />
    </span>
  );
}
