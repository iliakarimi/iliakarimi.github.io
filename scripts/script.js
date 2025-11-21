const bgMusic = document.getElementById('bgMusic');
const endGif = document.getElementById('endGif');
let musicStarted = false;

// Copy crypto address function
function copyAddress(address, cryptoName) {
    navigator.clipboard.writeText(address).then(() => {
    const notification = document.getElementById('copiedNotification');
    notification.textContent = `${cryptoName} address copied!`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
    }).catch(err => {
    console.error('Failed to copy:', err);
    });
}

// Set initial music volume
bgMusic.volume = 0;

// Try to enable autoplay on any user interaction
const unlockAudio = () => {
    bgMusic.play().then(() => {
    bgMusic.pause();
    bgMusic.currentTime = 0;
    }).catch(() => {});
    
    document.removeEventListener('scroll', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
};

document.addEventListener('scroll', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio, { passive: true });

// Handle scroll to adjust volume
const handleScroll = () => {
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
        bgMusic.play().catch(() => {});
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
};

window.addEventListener('scroll', handleScroll, { passive: true });

// Observe when the end section comes into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
    if (entry.isIntersecting) {
        endGif.classList.add('visible');
        
        // Play music automatically if not already playing
        if (!musicStarted) {
        bgMusic.play().catch(() => {});
        musicStarted = true;
        }
    } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
        // Pause when scrolling back up away from the section
        bgMusic.pause();
        musicStarted = false;
    }
    });
}, { threshold: 0.3 });

observer.observe(document.querySelector('.end-section'));

window.addEventListener('load', () => {
    setTimeout(() => {
    document.body.classList.add('loaded');
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 600);
    }
    }, 800);
});