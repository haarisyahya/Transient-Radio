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

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [mixesLoading, setMixesLoading] = useState(true);
  const [currentMixId, setCurrentMixId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

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
        if (isPlaying) { audio.pause(); setIsPlaying(false); }
        else { audio.play().catch(() => setIsPlaying(false)); setIsPlaying(true); }
      } else {
        audio.pause();
        audio.src = src;
        audio.load();
        setCurrentMixId(mixId);
        setCurrentTime(0);
        setDuration(0);
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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
    navigator.mediaSession.metadata = new MediaMetadata({
      title: mix.title,
      artist: mix.artist,
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
