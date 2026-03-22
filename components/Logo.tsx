"use client";

import Link from "next/link";
import { useState } from "react";

interface LogoProps {
  href?: string;
}

export default function Logo({ href }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const image = !imageError ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/TR-Icon-DarkGrey.png"
      alt="Transient Radio"
      style={{ height: "28px", width: "auto" }}
      onError={() => setImageError(true)}
    />
  ) : (
    <span
      style={{
        color: "var(--tr-text)",
        fontSize: "11px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      Transient Radio
    </span>
  );

  if (!href) return <div aria-label="Transient Radio">{image}</div>;

  return (
    <Link
      href={href}
      className="block transition-opacity duration-200 hover:opacity-60"
      aria-label="Transient Radio"
    >
      {image}
    </Link>
  );
}
