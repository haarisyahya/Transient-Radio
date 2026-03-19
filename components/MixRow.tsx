"use client";

import { useState } from "react";
import type { Mix } from "@/lib/mixes";

interface MixRowProps {
  mix: Mix;
  isActive: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}

export default function MixRow({ mix, isActive, isPlaying, onToggle }: MixRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--tr-border)",
        backgroundColor: isActive
          ? "var(--tr-surface)"
          : isHovered
          ? "#0f0f0f"
          : "transparent",
        transition: "background-color 0.1s ease",
      }}
    >
      {/* Row */}
      <div
        className="flex items-center gap-4 select-none cursor-pointer"
        style={{ padding: "20px 0" }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) =>
          e.key === "Enter" || e.key === " " ? onToggle() : undefined
        }
        aria-label={`${isPlaying ? "Pause" : "Play"} ${mix.artist} — ${mix.title}`}
      >
        {/* Large ghost index number — becomes ▶/■ when active */}
        <span
          className="tabular-nums shrink-0"
          style={{
            fontSize: "24px",
            lineHeight: "1",
            width: "4.5rem",
            paddingLeft: "2px",
            color: isActive ? "var(--tr-accent)" : "#242424",
            transition: "color 0.2s ease",
          }}
        >
          {isActive ? (isPlaying ? "■" : "▶") : mix.index}
        </span>

        {/* Stacked: Title / Artist */}
        <div className="flex-1 min-w-0">
          <div
            style={{
              color: isActive ? "var(--tr-accent)" : "var(--tr-text)",
              fontSize: "13px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.15s ease",
            }}
          >
            {mix.title}
          </div>
          <div
            style={{
              color: isActive ? "var(--tr-text-muted)" : "var(--tr-text-dim)",
              fontSize: "11px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "3px",
              transition: "color 0.15s ease",
            }}
          >
            {mix.artist}
          </div>
        </div>

        {/* Date — hidden when active (time is shown in now-playing bar) */}
        {mix.date && !isActive && (
          <span
            className="tabular-nums shrink-0"
            style={{
              color: "var(--tr-text-dim)",
              fontSize: "11px",
            }}
          >
            {mix.date}
          </span>
        )}

        {/* "+" expand button */}
        {mix.description && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((v) => !v);
            }}
            style={{
              color: isExpanded ? "var(--tr-accent)" : "var(--tr-text-dim)",
              fontSize: "18px",
              width: "1.5rem",
              textAlign: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              flexShrink: 0,
              transition: "color 0.15s ease",
              fontFamily: "inherit",
            }}
            aria-label={isExpanded ? "Collapse mix info" : "Expand mix info"}
          >
            {isExpanded ? "−" : "+"}
          </button>
        )}
      </div>

      {/* Expanded description */}
      {isExpanded && mix.description && (
        <div
          style={{
            padding: "0 0 20px calc(4.5rem + 1rem)",
            color: "var(--tr-text-muted)",
            fontSize: "12px",
            lineHeight: "1.8",
            maxWidth: "560px",
          }}
        >
          {mix.description}
        </div>
      )}
    </div>
  );
}
