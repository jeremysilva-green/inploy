/**
 * Simple sound player utility
 * Plays button click sound for check-in actions
 */

let clickSound: HTMLAudioElement | null = null;
let lunchSound: HTMLAudioElement | null = null;

export const initializeSound = () => {
  if (typeof window !== 'undefined') {
    // Initialize click sound for Entrada/Salida
    if (!clickSound) {
      try {
        const soundFile = require('../../assets/soundclick.mp3');
        const soundUrl = typeof soundFile === 'string' ? soundFile : soundFile?.default || soundFile;

        clickSound = new Audio(soundUrl);
        clickSound.preload = 'auto';
        clickSound.volume = 0.7; // Set volume to 70%

        clickSound.addEventListener('loadeddata', () => {
          console.log('✅ Click sound loaded successfully');
        });

        clickSound.addEventListener('error', (e) => {
          console.error('❌ Error loading click sound:', e);
        });
      } catch (error) {
        console.error('❌ Failed to initialize click sound:', error);
      }
    }

    // Initialize lunch sound for Almuerzo
    if (!lunchSound) {
      try {
        const lunchFile = require('../../assets/lunchclick.mp3');
        const lunchUrl = typeof lunchFile === 'string' ? lunchFile : lunchFile?.default || lunchFile;

        lunchSound = new Audio(lunchUrl);
        lunchSound.preload = 'auto';
        lunchSound.volume = 0.7; // Set volume to 70%

        lunchSound.addEventListener('loadeddata', () => {
          console.log('✅ Lunch sound loaded successfully');
        });

        lunchSound.addEventListener('error', (e) => {
          console.error('❌ Error loading lunch sound:', e);
        });
      } catch (error) {
        console.error('❌ Failed to initialize lunch sound:', error);
      }
    }
  }
};

export const playClickSound = () => {
  if (!clickSound) {
    console.warn('⚠️ Click sound not initialized, initializing now...');
    initializeSound();
  }

  if (clickSound) {
    console.log('🔊 Playing click sound...');
    clickSound.currentTime = 0;
    clickSound.play()
      .then(() => {
        console.log('✅ Click sound played successfully!');
      })
      .catch((error) => {
        console.error('❌ Failed to play click sound:', error.message);
        if (error.name === 'NotAllowedError') {
          console.error('⚠️ Browser blocked autoplay. This is normal for the first interaction.');
        }
      });
  }
};

export const playLunchSound = () => {
  if (!lunchSound) {
    console.warn('⚠️ Lunch sound not initialized, initializing now...');
    initializeSound();
  }

  if (lunchSound) {
    console.log('🔊 Playing lunch sound...');
    lunchSound.currentTime = 0;
    lunchSound.play()
      .then(() => {
        console.log('✅ Lunch sound played successfully!');
      })
      .catch((error) => {
        console.error('❌ Failed to play lunch sound:', error.message);
        if (error.name === 'NotAllowedError') {
          console.error('⚠️ Browser blocked autoplay. This is normal for the first interaction.');
        }
      });
  }
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeSound();
}
