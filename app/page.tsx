"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import MixRow from "@/components/MixRow";
import { useAudio } from "@/components/AudioProvider";

export default function Home() {
  const { mixes, mixesLoading, currentMixId, isPlaying, handleToggle } = useAudio();
  const [search, setSearch] = useState("");

  const filteredMixes = mixes.filter((mix) => {
    const q = search.toLowerCase();
    return (
      mix.title.toLowerCase().includes(q) ||
      mix.artist.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--tr-bg)" }}>
      {/* TOP LEFT — animation goes here once received from Max.
          Recommended format: Lottie (.json / .lottie) or WebM video.
          Replace <Logo> with the animation component when ready. */}
      <div style={{ position: "fixed", top: "24px", left: "32px", zIndex: 10 }}>
        <Logo />
      </div>

      <main
        id="main-content"
        style={{
          padding: "120px 32px 80px",
          paddingBottom: currentMixId ? "160px" : "80px",
          transition: "padding-bottom 0.3s ease",
        }}
      >
        <h1 className="sr-only">Transient Radio</h1>

        {/* Description */}
        <p
          style={{
            color: "var(--tr-text-muted)",
            fontSize: "13px",
            lineHeight: "1.8",
            maxWidth: "480px",
            marginBottom: "24px",
            marginTop: "24px",
          }}
        >
          Transient Radio is a nomadic, internet-based station exploring music
          beyond genre and geography. Broadcasting from Toronto to the world.
        </p>

        {/* Submit Your Mix link */}
        <div style={{ marginBottom: "56px" }}>
          <Link
            href="/submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--tr-text-muted)",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              border: "1px solid var(--tr-border)",
              padding: "8px 14px",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--tr-text)";
              e.currentTarget.style.borderColor = "var(--tr-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--tr-text-muted)";
              e.currentTarget.style.borderColor = "var(--tr-border)";
            }}
          >
            Submit Your Mix
            <span aria-hidden style={{ fontSize: "10px" }}>→</span>
          </Link>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "0" }}>
          <label htmlFor="mix-search" className="sr-only">Search mixes</label>
          <input
            id="mix-search"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--tr-border)",
              color: "var(--tr-text)",
              fontSize: "13px",
              fontFamily: "inherit",
              padding: "10px 0",
              marginBottom: "0",
            }}
          />
          <div aria-live="polite" className="sr-only">
            {search
              ? `${filteredMixes.length} mix${filteredMixes.length !== 1 ? "es" : ""} found`
              : ""}
          </div>
        </div>

        {/* Mixes list */}
        <div>
          {mixesLoading ? (
            <p style={{ color: "var(--tr-text-dim)", fontSize: "12px", padding: "24px 0" }}>
              Loading…
            </p>
          ) : filteredMixes.length > 0 ? (
            filteredMixes.map((mix) => (
              <MixRow
                key={mix.id}
                mix={mix}
                isActive={currentMixId === mix.id}
                isPlaying={currentMixId === mix.id && isPlaying}
                onToggle={() => handleToggle(mix.id, mix.file_url)}
              />
            ))
          ) : (
            <p style={{ color: "var(--tr-text-dim)", fontSize: "12px", padding: "24px 0" }}>
              No mixes found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
