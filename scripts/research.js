window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const start = performance.now();
    setTimeout(() => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, 800 - elapsed);
    setTimeout(() => {
        document.body.classList.add('loaded');
        if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 600);
        }
    }, wait);
    }, 0);
});

const nav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });
