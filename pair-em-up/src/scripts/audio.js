import { createStorage } from './storage';

let audioContext;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function playSound(type) {
  const storage = createStorage();
  const settings = storage.loadSettings();

  if (!settings.isAudioEnabled) return;
  initAudio();

  let frequency, duration, typeOsc;

  switch (type) {
    case 'select':
      frequency = 550;
      duration = 0.025;
      typeOsc = 'triangle';
      break;
    case 'valid':
      frequency = [660, 880];
      duration = 0.1;
      typeOsc = 'triangle';
      break;
    case 'invalid':
      frequency = 110;
      duration = 0.2;
      typeOsc = 'sawtooth';
      break;
    case 'assist':
      frequency = 784;
      duration = 0.08;
      typeOsc = 'square';
      break;
    case 'win':
      frequency = [1047, 1319, 1568];
      duration = 0.5;
      typeOsc = 'sine';
      break;
    case 'lose':
      frequency = [330, 165];
      duration = 0.4;
      typeOsc = 'sawtooth';
      break;
    default:
      return;
  }

  if (Array.isArray(frequency)) {
    frequency.forEach((f, i) => {
      setTimeout(
        () => {
          generateTone(f, duration, typeOsc);
        },
        i * duration * 1000 * 0.5
      );
    });
  } else {
    generateTone(frequency, duration, typeOsc);
  }
}

export function generateTone(frequency, duration, typeOsc) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = typeOsc;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + duration
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}
