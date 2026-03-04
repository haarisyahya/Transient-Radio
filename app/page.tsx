"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import MixRow from "@/components/MixRow";
import NowPlayingBar from "@/components/NowPlayingBar";
import { mixes } from "@/lib/mixes";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentMixId, setCurrentMixId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [search, setSearch] = useState("");
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () =>
      setDuration(isNaN(audio.duration) ? 0 : audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const handleToggle = useCallback(
    (mixId: string, src: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentMixId === mixId) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      } else {
        audio.pause();
        audio.src = src;
        audio.load();
        setCurrentMixId(mixId);
        setCurrentTime(0);
        setDuration(0);
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    },
    [currentMixId, isPlaying]
  );

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = v;
    setVolume(v);
  }, []);

  const filteredMixes = mixes.filter((mix) => {
    const q = search.toLowerCase();
    return (
      mix.title.toLowerCase().includes(q) ||
      mix.artist.toLowerCase().includes(q)
    );
  });

  const currentMix = mixes.find((m) => m.id === currentMixId) ?? null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--tr-bg)" }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* TOP LEFT — animation goes here once received from Max.
          Recommended format: Lottie (.json / .lottie) or WebM video.
          The Logo below is a temporary stand-in; replace it with the animation component. */}
      <div style={{ position: "fixed", top: "24px", left: "32px", zIndex: 10 }}>
        <Logo href="/about" />
      </div>

      {/* Main content */}
      <main
        id="main-content"
        style={{
          padding: "120px 32px 80px",
          maxWidth: "860px",
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
          Transient Radio is a nomadic, internet-based archive exploring music
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
          {filteredMixes.length > 0 ? (
            filteredMixes.map((mix) => (
              <MixRow
                key={mix.id}
                mix={mix}
                isActive={currentMixId === mix.id}
                isPlaying={currentMixId === mix.id && isPlaying}
                onToggle={() => handleToggle(mix.id, mix.src)}
              />
            ))
          ) : (
            <p
              style={{
                color: "var(--tr-text-dim)",
                fontSize: "12px",
                padding: "24px 0",
              }}
            >
              No mixes found.
            </p>
          )}
        </div>
      </main>

      {/* Now playing bar — slides up from bottom when a mix is active */}
      <NowPlayingBar
        mix={currentMix}
        isPlaying={isPlaying}
        volume={volume}
        currentTime={currentTime}
        duration={duration}
        onToggle={() => currentMix && handleToggle(currentMix.id, currentMix.src)}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
      />
    </div>
  );
}
