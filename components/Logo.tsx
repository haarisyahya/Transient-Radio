"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
}

export default function Logo({ href }: LogoProps) {
  const video = (
    <video
      src="/TransientRadio-LogoAnimation-V1.0.webm"
      autoPlay
      loop
      muted
      playsInline
      style={{ height: "110px", width: "auto", display: "block" }}
      aria-hidden
    />
  );

  if (!href) return <div aria-label="Transient Radio">{video}</div>;

  return (
    <Link
      href={href}
      className="block transition-opacity duration-200 hover:opacity-60"
      aria-label="Transient Radio"
    >
      {video}
    </Link>
  );
}
