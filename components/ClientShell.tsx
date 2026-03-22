"use client";

import type { ReactNode } from "react";
import { AudioProvider, useAudio } from "./AudioProvider";
import NowPlayingBar from "./NowPlayingBar";

function NowPlayingConnected() {
  const {
    mixes, currentMixId, isPlaying, currentTime,
    duration, volume, handleToggle, handleSeek,
    handleVolumeChange, handleNext, handlePrev,
  } = useAudio();
  const currentMix = mixes.find((m) => m.id === currentMixId) ?? null;
  return (
    <NowPlayingBar
      mix={currentMix}
      isPlaying={isPlaying}
      volume={volume}
      currentTime={currentTime}
      duration={duration}
      onToggle={() => currentMix && handleToggle(currentMix.id, currentMix.file_url)}
      onVolumeChange={handleVolumeChange}
      onSeek={handleSeek}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <AudioProvider>
      {children}
      <NowPlayingConnected />
    </AudioProvider>
  );
}
