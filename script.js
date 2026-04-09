gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
});

function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

function generatePhotoList(folderName, prefix, maxCount, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push({ src: `./images/${folderName}/${prefix} (${i}).${ext}`, category: folderName });
    }
    return photoArray;
}

const photoDatabase = {
    people: { photos: generatePhotoList('people', 'people', 20, 'jpg') },
    things: { photos: generatePhotoList('things', 'things', 20, 'JPG') },
    place:  { photos: generatePhotoList('place',  'place',  20, 'JPG') }
};

const featuredPhotos = [
    { src: './images/people/people (3).jpg',  category: 'people' },
    { src: './images/things/things (3).JPG',  category: 'things' },
    { src: './images/place/place (10).JPG',   category: 'place'  },
    { src: './images/people/people (4).jpg',  category: 'people' },
    { src: './images/place/place (2).JPG',    category: 'place'  },
    { src: './images/things/things (1).JPG',  category: 'things' }
];

if (window.simpleObserver) window.simpleObserver.disconnect();

window.simpleObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const img  = card.querySelector('img');
            // GSAP handles card float-in
            gsap.to(card, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" });
            // CSS transition handles ink reveal — more reliable than GSAP for CSS custom properties
            if (img) {
                requestAnimationFrame(() => img.classList.add('ink-reveal'));
            }
            observer.unobserve(card);
        }
    });
}, { rootMargin: "50px 0px", threshold: 0.05 });

let currentPhotoList = [];
let activePhotoIndex = 0;

// FIX: sync active state across both main nav and side nav
function setActiveNav(target) {
    document.querySelectorAll('header nav .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === target);
    });
    document.querySelectorAll('.side-nav .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === target);
    });
}

function renderPhotos(photoArray, isFeatured = false) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    window.simpleObserver.disconnect();
    currentPhotoList = photoArray;

    if (isFeatured) { gallery.classList.add('featured-mode'); }
    else            { gallery.classList.remove('featured-mode'); }

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((photo, index) => {
        const card     = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        gsap.set(card, { y: 40, opacity: 0 });

        const img   = document.createElement('img');
        img.src     = photo.src;
        img.alt     = `${photo.category} photography`;
        img.loading = "lazy";

        img.onerror = function() {
            if (!this.dataset.retried) {
                this.dataset.retried = true;
                const currentExt = photo.src.split('.').pop();
                const newExt     = currentExt === 'jpg' ? 'JPG' : 'jpg';
                this.src = photo.src.replace('.' + currentExt, '.' + newExt);
            } else {
                card.remove();
            }
        };

        card.addEventListener('click', () => {
            activePhotoIndex = index;
            openLightbox(photo.src);
        });

        card.appendChild(img);
        gallery.appendChild(card);
        window.simpleObserver.observe(card);
    });

    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
}

function openLightbox(src) {
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src   = src;
    lightbox.classList.add('show');
    gsap.set(lightboxImg, { autoAlpha: 1 });
    lenis.stop();
}

function changePhoto(direction) {
    activePhotoIndex  = (activePhotoIndex + direction + currentPhotoList.length) % currentPhotoList.length;
    const newPhoto    = currentPhotoList[activePhotoIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    gsap.to(lightboxImg, {
        autoAlpha: 0, duration: 0.15, onComplete: () => {
            lightboxImg.src = newPhoto.src;
            gsap.to(lightboxImg, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
        }
    });
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
    lenis.start();
}

const prevBtn  = document.getElementById('lightbox-prev');
const nextBtn  = document.getElementById('lightbox-next');
const closeBtn = document.getElementById('close-lightbox');

if (prevBtn)  prevBtn.addEventListener('click',  (e) => { e.stopPropagation(); changePhoto(-1); });
if (nextBtn)  nextBtn.addEventListener('click',  (e) => { e.stopPropagation(); changePhoto(1);  });
if (closeBtn) closeBtn.addEventListener('click', ()  => closeLightbox());

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('show')) return;
    if      (e.key === 'ArrowLeft')  changePhoto(-1);
    else if (e.key === 'ArrowRight') changePhoto(1);
    else if (e.key === 'Escape')     closeLightbox();
});

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (
        e.target !== document.getElementById('lightbox-img') &&
        e.target !== document.getElementById('lightbox-prev') &&
        e.target !== document.getElementById('lightbox-next')
    ) { closeLightbox(); }
});

// Header nav buttons
document.querySelectorAll('header nav .filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.id === 'about-btn') { lenis.scrollTo('#about', { offset: -100 }); return; }
        if (this.getAttribute('target') === '_blank') return;
        e.preventDefault();

        const target = this.getAttribute('data-target');
        if (!target) return;

        setActiveNav(target);

        const frontpage = document.getElementById('frontpage');
        if (target === 'all') {
            if (frontpage) frontpage.classList.remove('hide');
            renderPhotos(featuredPhotos, true);
        } else {
            if (frontpage) frontpage.classList.add('hide');
            renderPhotos(photoDatabase[target].photos, false);
        }
    });
});

// Logo click — go home
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const frontpage = document.getElementById('frontpage');
    if (frontpage) frontpage.classList.remove('hide');
    renderPhotos(featuredPhotos, true);
    setActiveNav('all');
});

// FIX: single DOMContentLoaded for hero animation + FAB menu + about text
// NOTE: renderPhotos is called OUTSIDE this listener because the script loads
// at the bottom of <body> — the DOM is already ready at that point, so
// DOMContentLoaded would never fire for it. Everything else (animations, menu
// setup) is safely inside since it doesn't depend on this timing issue.
renderPhotos(featuredPhotos, true);

document.addEventListener('DOMContentLoaded', () => {

    // Hero entrance animation
    const tl = gsap.timeline();
    tl.fromTo(".hero-left-image",
            { yPercent: 30, xPercent: -10, autoAlpha: 0, rotation: -2 },
            { yPercent: 0,  xPercent: 0,   autoAlpha: 1, rotation: 0,  duration: 2,   ease: "power3.out", delay: 0.2 })
      .fromTo(".gsap-hero-title",
            { y: 30, autoAlpha: 0 },
            { y: 0,  autoAlpha: 1, duration: 1.5, ease: "power3.out" }, "-=1.2")
      .fromTo(".gsap-keyword",
            { y: 20, autoAlpha: 0, x: -10 },
            { y: 0,  autoAlpha: 1, x: 0,   duration: 1, stagger: 0.15, ease: "power2.out" }, "-=1")
      .fromTo(".gsap-hero-subtitle",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");

    // FIX: clone side nav then strip all IDs — prevents duplicate-ID bug
    // where getElementById('about-btn') would silently grab the wrong element
    const fabMenu   = document.getElementById('fab-menu');
    const sideMenu  = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    const sideNav   = document.querySelector('.side-nav');
    const mainNav   = document.querySelector('header nav');

    if (fabMenu && sideMenu && mainNav && sideNav) {
        sideNav.innerHTML = mainNav.innerHTML;
        sideNav.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

        sideNav.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    const mainBtn = document.querySelector(`header nav [data-target="${targetId}"]`);
                    if (mainBtn) mainBtn.click();
                } else {
                    const aboutBtn = document.querySelector('header nav #about-btn');
                    if (aboutBtn) aboutBtn.click();
                }
                sideMenu.classList.remove('open');
            });
        });

        fabMenu.addEventListener('click', () => sideMenu.classList.add('open'));
        if (closeMenu) closeMenu.addEventListener('click', () => sideMenu.classList.remove('open'));

        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                fabMenu.classList.add('visible');
            } else {
                fabMenu.classList.remove('visible');
                sideMenu.classList.remove('open');
            }
        });
    }

    // About text ink-reveal animation
    // On mobile, skip the animation entirely — ScrollTrigger scrub range
    // doesn't reach the end of short sections, leaving text permanently hidden.
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const aboutTexts = document.querySelectorAll('#about .main-text');

    if (isMobile) {
        // Mobile: just show text normally, no animation
        aboutTexts.forEach(p => { p.style.opacity = 1; p.style.color = '#111111'; });
    } else {
        aboutTexts.forEach(p => {
            let html = '';
            p.childNodes.forEach(node => {
                if (node.nodeType === 3) {
                    node.nodeValue.split('').forEach(char => {
                        html += char === ' ' ? '&nbsp;' : `<span class="ink-char">${char}</span>`;
                    });
                } else if (node.nodeType === 1) {
                    let innerHtml = '';
                    (node.innerText || '').split('').forEach(char => {
                        innerHtml += char === ' ' ? '&nbsp;' : `<span class="ink-char">${char}</span>`;
                    });
                    html += `<${node.tagName.toLowerCase()}>${innerHtml}</${node.tagName.toLowerCase()}>`;
                }
            });
            p.innerHTML = html;

            gsap.to(p.querySelectorAll('.ink-char'), {
                scrollTrigger: {
                    trigger: p,
                    start: "top 85%",
                    end: "bottom 55%",
                    scrub: 1,
                },
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                rotation: 0,
                stagger: 0.05,
                color: "#111111",
                ease: "none"
            });
        });
    }
});

// Right-click / drag / devtools protection
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => { if (e.target.tagName.toLowerCase() === 'img') e.preventDefault(); });
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'I' || e.key === 'i' || e.key === 'S' || e.key === 's')))
        e.preventDefault();
});