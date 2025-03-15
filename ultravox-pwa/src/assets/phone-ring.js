// Simple utility to play a phone ring sound
export function playRingSound() {
  // Create audio element
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-classic-short-phone-ring-1357.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio play failed:', e));
  
  return audio;
} 