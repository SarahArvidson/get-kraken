/**
 * Get Kraken - Sound Effects Utility
 *
 * Plays water drop sound effect when quests are completed
 */

import waterDropSoundUrl from "/water-drop-85731.mp3";

let audioElement: HTMLAudioElement | null = null;

/**
 * Loads the water drop sound audio element
 */
function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    // Load the sound file using the imported URL
    audioElement = new Audio(waterDropSoundUrl);
    audioElement.volume = 0.5; // Set volume to 50%
    audioElement.preload = "auto";
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
