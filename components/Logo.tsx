"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import lottie from "lottie-web";

interface LogoProps {
  href?: string;
}

export default function Logo({ href }: LogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/TransientRadio-LogoAnimation-V1.0.json",
    });
    return () => anim.destroy();
  }, []);

  const animation = (
    <div
      ref={containerRef}
      aria-hidden
      className="logo-animation"
    />
  );

  if (!href) return <div aria-label="Transient Radio">{animation}</div>;

  return (
    <Link
      href={href}
      className="block transition-opacity duration-200 hover:opacity-60"
      aria-label="Transient Radio"
    >
      {animation}
    </Link>
  );
}
