/**
 * Kibblings - Sound Effects Utility
 * 
 * Plays coin sound effect when quests are completed
 */

let audioElement: HTMLAudioElement | null = null;

/**
 * Loads the coin sound audio element
 */
function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    // Try to load from public folder first, fallback to utils if user put it there
    audioElement = new Audio('/coin-sound.mp3');
    audioElement.volume = 0.5; // Set volume to 50%
    audioElement.preload = 'auto';
  }
  return audioElement;
}

/**
 * Plays a coin sound effect
 */
export function playCoinSound(): void {
  try {
    const audio = getAudioElement();
    // Reset to beginning and play
    audio.currentTime = 0;
    audio.play().catch((error) => {
      // Silently fail if audio can't play (e.g., user hasn't interacted yet)
      console.debug("Could not play coin sound:", error);
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
