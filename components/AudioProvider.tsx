"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Mix } from "@/lib/mixes";

interface AudioContextValue {
  mixes: Mix[];
  mixesLoading: boolean;
  currentMixId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  handleToggle: (mixId: string, src: string) => void;
  handleSeek: (time: number) => void;
  handleVolumeChange: (v: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

const FADE_MS = 1000;
const FADE_STEP_MS = 16; // ~60fps

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(1); // tracks desired volume independently of fade
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [mixesLoading, setMixesLoading] = useState(true);
  const [currentMixId, setCurrentMixId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const clearFade = useCallback(() => {
    if (fadeRef.current !== null) { clearInterval(fadeRef.current); fadeRef.current = null; }
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    clearFade();
    audio.volume = 0;
    const target = volumeRef.current;
    const steps = FADE_MS / FADE_STEP_MS;
    let step = 0;
    fadeRef.current = setInterval(() => {
      step++;
      audio.volume = Math.min((target / steps) * step, target);
      if (step >= steps) clearFade();
    }, FADE_STEP_MS);
  }, [clearFade]);

  const fadeOut = useCallback((audio: HTMLAudioElement, onDone: () => void) => {
    clearFade();
    const start = audio.volume;
    const steps = FADE_MS / FADE_STEP_MS;
    let step = 0;
    fadeRef.current = setInterval(() => {
      step++;
      audio.volume = Math.max(start - (start / steps) * step, 0);
      if (step >= steps) { clearFade(); onDone(); }
    }, FADE_STEP_MS);
  }, [clearFade]);

  // Fetch mixes once on mount
  useEffect(() => {
    fetch("/api/mixes")
      .then((r) => r.json())
      .then((data) => setMixes(Array.isArray(data) ? data : []))
      .catch(() => setMixes([]))
      .finally(() => setMixesLoading(false));
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(isNaN(audio.duration) ? 0 : audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
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
          // Fade out then pause
          setIsPlaying(false);
          fadeOut(audio, () => {
            audio.pause();
            audio.volume = volumeRef.current;
          });
        } else {
          // Fade in from silence
          audio.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
          fadeIn(audio);
        }
      } else {
        // Switch track: cut immediately, then fade in new track
        clearFade();
        audio.pause();
        audio.volume = 0;
        audio.src = src;
        audio.load();
        setCurrentMixId(mixId);
        setCurrentTime(0);
        setDuration(0);
        audio.play()
          .then(() => { setIsPlaying(true); fadeIn(audio); })
          .catch(() => setIsPlaying(false));
      }
    },
    [currentMixId, isPlaying, fadeIn, fadeOut, clearFade]
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
    volumeRef.current = v;
    audio.volume = v;
    setVolume(v);
  }, []);

  const handleNext = useCallback(() => {
    const idx = mixes.findIndex((m) => m.id === currentMixId);
    const next = mixes[idx + 1];
    if (next) handleToggle(next.id, next.file_url);
  }, [mixes, currentMixId, handleToggle]);

  const handlePrev = useCallback(() => {
    const idx = mixes.findIndex((m) => m.id === currentMixId);
    const prev = mixes[idx - 1];
    if (prev) handleToggle(prev.id, prev.file_url);
  }, [mixes, currentMixId, handleToggle]);

  // Media Session API — makes OS-level play/pause/next/prev controls work
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const mix = mixes.find((m) => m.id === currentMixId);
    if (!mix) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: mix.title,
      artist: mix.artist,
      artwork: [
        { src: `${origin}/TR-Icon-Transparent.png`, sizes: "512x512", type: "image/png" },
      ],
    });
  }, [currentMixId, mixes]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [handleNext, handlePrev]);

  return (
    <AudioCtx.Provider value={{
      mixes, mixesLoading, currentMixId, isPlaying,
      currentTime, duration, volume,
      handleToggle, handleSeek, handleVolumeChange,
      handleNext, handlePrev,
    }}>
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
      {children}
    </AudioCtx.Provider>
  );
}
