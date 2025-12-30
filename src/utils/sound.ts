/**
 * Get Kraken - Sound Effects Utility
 *
 * Plays water drop sound effect when quests are completed
 */

import { WATER_DROP_SOUND_PATH, AUDIO_VOLUME } from "../constants";

let audioElement: HTMLAudioElement | null = null;

/**
 * Loads the water drop sound audio element
 */
function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    // Use direct path to public folder to avoid import issues
    audioElement = new Audio(WATER_DROP_SOUND_PATH);
    audioElement.volume = AUDIO_VOLUME;
    audioElement.preload = "auto";
    // Handle range request issues by loading the full file
    audioElement.addEventListener('error', (e) => {
      console.error("Audio error:", e);
      // Try reloading without range requests
      audioElement = new Audio(WATER_DROP_SOUND_PATH);
      audioElement.volume = AUDIO_VOLUME;
    });
  }
  return audioElement;
}

/**
 * Plays a water drop sound effect
 */
export function playCoinSound(): void {
  try {
    const audio = getAudioElement();
    // Reset to beginning and play
    audio.currentTime = 0;
    audio.play().catch((error) => {
      // Silently fail if audio can't play (e.g., user hasn't interacted yet)
      console.debug("Could not play water drop sound:", error);
    });
  } catch (error) {
    console.debug("Could not play coin sound:", error);
  }
}

/**
 * Preloads audio by creating the audio element
 * Call this after user interaction to avoid autoplay restrictions
 */
export function preloadAudio(): void {
  try {
    getAudioElement();
  } catch (error) {
    console.debug("Could not preload audio:", error);
  }
}
