// Cache DOM elements for better performance
const bgMusic = document.getElementById('bgMusic');
const endGif = document.getElementById('endGif');
const copiedNotification = document.getElementById('copiedNotification');
const preloader = document.getElementById('preloader');

let musicStarted = false;

// Copy crypto address function with error handling and accessibility
function copyAddress(address, cryptoName) {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    fallbackCopyToClipboard(address, cryptoName);
    return;
  }

  navigator.clipboard.writeText(address).then(() => {
    showNotification(`${cryptoName} address copied!`);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy address', true);
  });
}

// Fallback copy method for browsers without clipboard API
function fallbackCopyToClipboard(text, cryptoName) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.setAttribute('aria-hidden', 'true');
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showNotification(`${cryptoName} address copied!`);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showNotification('Failed to copy address', true);
  }
  
  document.body.removeChild(textArea);
}

// Show notification with better UX
function showNotification(message, isError = false) {
  if (!copiedNotification) return;
  
  copiedNotification.textContent = message;
  copiedNotification.classList.add('show');
  
  if (isError) {
    copiedNotification.style.background = '#dc3545';
  } else {
    copiedNotification.style.background = '#1a1a1a';
  }
  
  setTimeout(() => {
    copiedNotification.classList.remove('show');
  }, 2500);
}

// Add keyboard support for crypto cards
document.addEventListener('DOMContentLoaded', () => {
  const cryptoCards = document.querySelectorAll('.crypto-card');
  
  cryptoCards.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
});

// Set initial music volume
if (bgMusic) {
  bgMusic.volume = 0;
  
  // Add error handling for audio
  bgMusic.addEventListener('error', (e) => {
    console.warn('Audio loading error:', e);
  });
}

// Try to enable autoplay on any user interaction
const unlockAudio = () => {
  if (!bgMusic) return;
  
  bgMusic.play().then(() => {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }).catch(() => {
    // Silent fail - user interaction needed
  });
  
  document.removeEventListener('scroll', unlockAudio);
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('touchstart', unlockAudio);
};

document.addEventListener('scroll', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio, { passive: true });

// Handle scroll to adjust volume with throttling for better performance
let scrollTimeout;
const handleScroll = () => {
  if (!bgMusic) return;
  
  if (scrollTimeout) {
    return;
  }
  
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate the middle of the page
    const middleOfPage = (documentHeight - windowHeight) / 2;
    
    // Only start increasing volume after middle of page
    if (scrollTop > middleOfPage) {
      // Calculate progress from middle to bottom (0 to 1)
      const progressFromMiddle = (scrollTop - middleOfPage) / (documentHeight - windowHeight - middleOfPage);
      
      // Set volume from 0 to 0.7 based on scroll progress
      const volume = Math.min(progressFromMiddle * 0.7, 0.7);
      bgMusic.volume = volume;
      
      // Start playing music when passing middle
      if (!musicStarted && volume > 0) {
        bgMusic.play().catch(() => {
          // Silent fail - autoplay blocked
        });
        musicStarted = true;
      }
    } else {
      // Before middle of page, keep volume at 0
      bgMusic.volume = 0;
      if (musicStarted) {
        bgMusic.pause();
        musicStarted = false;
      }
    }
  }, 100); // Throttle to 100ms
};

window.addEventListener('scroll', handleScroll, { passive: true });

// Observe when the end section comes into view
const endSection = document.querySelector('.end-section');
if (endSection && endGif) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        endGif.classList.add('visible');
        
        // Play music automatically if not already playing
        if (bgMusic && !musicStarted) {
          bgMusic.play().catch(() => {
            // Silent fail - autoplay blocked
          });
          musicStarted = true;
        }
      } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        // Pause when scrolling back up away from the section
        if (bgMusic) {
          bgMusic.pause();
          musicStarted = false;
        }
      }
    });
  }, { 
    threshold: 0.3,
    rootMargin: '0px'
  });

  observer.observe(endSection);
}

// Preloader handling with better performance
window.addEventListener('load', () => {
  // Minimum loading time for better UX
  const minLoadTime = 800;
  const startTime = performance.now();
  
  const removePreloader = () => {
    const elapsedTime = performance.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsedTime);
    
    setTimeout(() => {
      document.body.classList.add('loaded');
      
      if (preloader) {
        preloader.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
          preloader.remove();
        }, 600);
      }
    }, remainingTime);
  };
  
  // If all resources are loaded, remove preloader
  if (document.readyState === 'complete') {
    removePreloader();
  } else {
    // Wait for all resources
    window.addEventListener('load', removePreloader, { once: true });
  }
});

// Performance monitoring (optional - can be removed in production)
if ('PerformanceObserver' in window) {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      }
    });
    
    perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silently fail if observer not supported
  }
}

// Service Worker Registration for PWA (optional - create sw.js separately)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - SW not critical
    });
  });
}