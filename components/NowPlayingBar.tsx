"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import type { Mix } from "@/lib/mixes";

interface NowPlayingBarProps {
  mix: Mix | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "--:--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function NowPlayingBar({
  mix,
  isPlaying,
  volume,
  currentTime,
  duration,
  onToggle,
  onVolumeChange,
  onSeek,
  onNext,
  onPrev,
}: NowPlayingBarProps) {
  const seekBarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const displayProgress = dragProgress !== null ? dragProgress : (duration > 0 ? (currentTime / duration) * 100 : 0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onNext();
      else onPrev();
    }
  }, [onNext, onPrev]);

  const getPctFromClientX = useCallback((clientX: number): number | null => {
    if (!seekBarRef.current || !duration) return null;
    const rect = seekBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return x / rect.width;
  }, [duration]);

  const handleSeekMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    const pct = getPctFromClientX(e.clientX);
    if (pct !== null) setDragProgress(pct * 100);
  }, [getPctFromClientX]);

  const handleSeekTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    isDragging.current = true;
    const pct = getPctFromClientX(e.touches[0].clientX);
    if (pct !== null) setDragProgress(pct * 100);
  }, [getPctFromClientX]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const pct = getPctFromClientX(e.clientX);
      if (pct !== null) setDragProgress(pct * 100);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const pct = getPctFromClientX(e.clientX);
      if (pct !== null) onSeek(pct * duration);
      setDragProgress(null);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault(); // stop page scrolling while scrubbing
      const pct = getPctFromClientX(e.touches[0].clientX);
      if (pct !== null) setDragProgress(pct * 100);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const pct = getPctFromClientX(e.changedTouches[0].clientX);
      if (pct !== null) onSeek(pct * duration);
      setDragProgress(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [duration, getPctFromClientX, onSeek]);

  return (
    <div
      role="region"
      aria-label="Now playing"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--tr-surface)",
        borderTop: "1px solid var(--tr-border)",
        zIndex: 50,
        transform: mix ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s ease",
      }}
    >
      {mix && (
        <>
          {/* Info row — swipe left for next, swipe right for prev */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "16px 32px 10px",
            }}
          >
            {/* Play / Pause button */}
            <button
              onClick={onToggle}
              aria-label={isPlaying ? `Pause ${mix.artist}` : `Resume ${mix.artist}`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--tr-accent)",
                fontSize: "13px",
                flexShrink: 0,
                fontFamily: "inherit",
                lineHeight: 1,
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {isPlaying ? "■" : "▶"}
            </button>

            {/* Stacked artist / title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "var(--tr-accent)",
                  fontSize: "12px",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {mix.title}
              </div>
              <div
                style={{
                  color: "var(--tr-text-dim)",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginTop: "2px",
                }}
              >
                {mix.artist}
              </div>
            </div>

            {/* Time display */}
            <span
              className="tabular-nums"
              style={{
                color: "var(--tr-text-dim)",
                fontSize: "11px",
                flexShrink: 0,
              }}
            >
              {duration > 0
                ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                : "loading…"}
            </span>

            {/* Volume control */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {isVolumeOpen && (
                <input
                  type="range"
                  className="volume-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  aria-label="Volume"
                />
              )}
              <button
                onClick={() => setIsVolumeOpen((v) => !v)}
                aria-label={isVolumeOpen ? "Close volume control" : "Open volume control"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: volume === 0 ? "var(--tr-text-dim)" : "var(--tr-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  lineHeight: 1,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {volume === 0 ? (
                  /* Speaker with X — silent */
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : volume <= 0.5 ? (
                  /* Speaker with one wave — low volume */
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  /* Speaker with two waves — full volume */
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Seek bar — drag to scrub */}
          <div
            ref={seekBarRef}
            className="seek-bar"
            style={{ margin: "0 32px 14px", cursor: isDragging.current ? "grabbing" : "grab" }}
            onMouseDown={handleSeekMouseDown}
            onTouchStart={handleSeekTouchStart}
            role="slider"
            tabIndex={0}
            aria-label={`Seek — ${mix.artist} — ${mix.title}`}
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onKeyDown={(e) => {
              if (!duration) return;
              const step = duration * 0.02;
              if (e.key === "ArrowRight") onSeek(Math.min(currentTime + step, duration));
              if (e.key === "ArrowLeft") onSeek(Math.max(currentTime - step, 0));
              if (e.key === "Home") onSeek(0);
              if (e.key === "End") onSeek(duration);
            }}
          >
            <div className="seek-bar__track" />
            <div className="seek-bar__fill" style={{ width: `${displayProgress}%`, transition: dragProgress !== null ? "none" : undefined }} />
          </div>
        </>
      )}
    </div>
  );
}
