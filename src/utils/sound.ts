/**
 * Kibblings - Sound Effects Utility
 * 
 * Plays coin sound effect when quests are completed
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Plays a coin sound effect
 * Uses Web Audio API to generate a simple coin drop sound
 */
export function playCoinSound(): void {
  try {
    const ctx = getAudioContext();
    
    // Create a simple coin drop sound using oscillators
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect oscillators to gain node
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Configure oscillators for a coin-like sound
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(1000, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
    
    // Envelope for quick attack and decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    // Start and stop oscillators
    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + 0.15);
    oscillator2.stop(ctx.currentTime + 0.15);
  } catch (error) {
    // Silently fail if audio context is not available
    // (e.g., user hasn't interacted with page yet)
    console.debug("Could not play coin sound:", error);
  }
}

/**
 * Preloads audio context by creating it
 * Call this after user interaction to avoid autoplay restrictions
 */
export function preloadAudio(): void {
  try {
    getAudioContext();
  } catch (error) {
    console.debug("Could not preload audio:", error);
  }
}

