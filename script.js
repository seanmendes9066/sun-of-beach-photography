gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.2,       
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

// =========================================
// 照片資料庫生成
// =========================================
function generatePhotoList(folderName, prefix, maxCount, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push({ src: `./images/${folderName}/${prefix} (${i}).${ext}`, category: folderName });
    }
    return photoArray;
}

// =========================================
// 🚨 終極修復：請在這裡填入你「真實的照片數量」！
// =========================================
// 請去你的資料夾看，People 有幾張就填幾，Things 有幾張就填幾。
// 這樣電腦就不會產生「幽靈照片」導致往下滾時版面錯亂了！
const photoDatabase = {
    people: { photos: generatePhotoList('people', 'people', 12, 'jpg'), word: 'RESONANT' }, // 👈 把 20 改成你真實的數量
    things: { photos: generatePhotoList('things', 'things', 13, 'JPG'), word: 'INTENTIONAL' }, // 👈 把 20 改成你真實的數量
    place: { photos: generatePhotoList('place', 'place', 23, 'JPG'), word: 'INTIMATE' }   // 👈 把 20 改成你真實的數量
};

// =========================================
// 🌟 首頁 VIP 精選 (自訂文字)
// =========================================
const featuredPhotos = [
    { src: './images/people/people (3).jpg', category: 'people', title: '街角的旋律', collection: 'COLLECTION / PEOPLE', resonantWord: 'HARMONY' },
    { src: './images/things/things (3).JPG', category: 'things', title: '靜物', collection: 'COLLECTION / THINGS', resonantWord: 'OBSERVANT' },
    { src: './images/place/place (10).JPG', category: 'place', title: '城市餘光', collection: 'COLLECTION / PLACE', resonantWord: 'ETERNAL' },
    { src: './images/people/people (4).jpg', category: 'people', title: '凝視', collection: 'COLLECTION / PEOPLE', resonantWord: 'SILENT' },
    { src: './images/place/place (2).JPG', category: 'place', title: '無人知曉的清晨', collection: 'COLLECTION / PLACE', resonantWord: 'AWAKENING' },
    { src: './images/things/things (1).JPG', category: 'things', title: '歲月的痕跡', collection: 'COLLECTION / THINGS', resonantWord: 'NOSTALGIA' }
];

// 🚨 原生交叉觀察器 (優雅浮現)
if (window.galleryObserver) window.galleryObserver.disconnect();

window.galleryObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            gsap.to(entry.target, {
                y: 0, 
                autoAlpha: 1, 
                duration: 1.2, 
                ease: "power2.out"
            });
            observer.unobserve(entry.target); 
        }
    });
}, { rootMargin: "0px 0px 30px 0px", threshold: 0.05 });


// =========================================
// 核心渲染引擎 
// =========================================
function renderPhotos(photoArray, isFeatured = false) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 
    ScrollTrigger.getAll().forEach(t => t.kill()); 
    window.galleryObserver.disconnect(); 

    if (isFeatured) {
        gallery.classList.add('featured-mode');
    } else {
        gallery.classList.remove('featured-mode');
    }

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; color: #888;">尚未發現照片。</p>';
        return;
    }

    const cards = [];

    photoArray.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        
        gsap.set(card, { y: 40, autoAlpha: 0 });

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `${photo.category} photography`;
        
        if (index < 6) {
            img.loading = "eager"; 
        } else {
            img.loading = "lazy";
        }
        
        // 如果依然有副檔名大小寫錯誤，這裡還是會幫你自動修正，但不會再引發幽靈大排版了
        img.onerror = function() {
            if (!this.dataset.retried) {
                this.dataset.retried = true; 
                let currentExt = photo.src.split('.').pop();
                let newExt = currentExt === 'jpg' ? 'JPG' : 'jpg';
                this.src = photo.src.replace('.' + currentExt, '.' + newExt);
            } else {
                card.remove(); 
            }
        };

        const displayTitle = photo.title || (photo.category.charAt(0).toUpperCase() + photo.category.slice(1));
        const displayCollection = photo.collection || (`COLLECTION / ${displayTitle.toUpperCase()}`);
        const displayWord = photo.resonantWord || (photoDatabase[photo.category]?.word || '');

        const details = document.createElement('div');
        details.className = 'item-details';
        details.innerHTML = `<h3>${displayTitle}</h3><p class="collection-text">${displayCollection}</p><p class="resonant-word">${displayWord}</p>`;

        card.addEventListener('click', () => {
            if (!card.classList.contains('preview-active')) {
                document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('preview-active'));
                card.classList.add('preview-active');
            } else {
                const lightbox = document.getElementById('lightbox');
                document.getElementById('lightbox-img').src = img.src; 
                lightbox.classList.add('show');
                lenis.stop();
            }
        });

        card.appendChild(img);
        card.appendChild(details); 
        gallery.appendChild(card);
        cards.push(card);
    });

    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    let imagesLoaded = 0;
    const initialCards = cards.slice(0, 6);
    
    if (initialCards.length === 0) return;

    initialCards.forEach(card => {
        const img = card.querySelector('img');
        if (img.complete) {
            imagesLoaded++;
            checkAllLoaded();
        } else {
            img.addEventListener('load', () => { imagesLoaded++; checkAllLoaded(); });
            img.addEventListener('error', () => { imagesLoaded++; checkAllLoaded(); }); 
        }
    });

    function checkAllLoaded() {
        if (imagesLoaded === initialCards.length) {
            ScrollTrigger.refresh();
            
            gsap.to(initialCards, {
                y: 0, 
                autoAlpha: 1, 
                duration: 1.0, 
                stagger: 0.05, 
                ease: "power2.out"
            });

            const restCards = cards.slice(6);
            restCards.forEach(card => window.galleryObserver.observe(card));
        }
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.gallery-item') && !e.target.closest('.lightbox')) {
        document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('preview-active'));
    }
});

// =========================================
// 分類導覽與首頁載入邏輯
// =========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.id === 'about-btn') { lenis.scrollTo('#about', { offset: -100 }); return; }
        if (this.getAttribute('target') === '_blank') return;
        e.preventDefault();
        
        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        if (!target) return; 

        const frontpage = document.getElementById('frontpage');
        
        if (target === 'all') {
            if(frontpage) frontpage.classList.remove('hide');
            renderPhotos(featuredPhotos, true); 
        } else {
            if(frontpage) frontpage.classList.add('hide');
            renderPhotos(photoDatabase[target].photos, false);
        }
    });
});

document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const frontpage = document.getElementById('frontpage');
    if(frontpage) frontpage.classList.remove('hide');
    renderPhotos(featuredPhotos, true); 
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
});

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        lenis.start();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(featuredPhotos, true); 
    const tl = gsap.timeline();
    tl.fromTo(".hero-left-image", { yPercent: 30, xPercent: -10, autoAlpha: 0, rotation: -2 }, { yPercent: 0, xPercent: 0, autoAlpha: 1, rotation: 0, duration: 1.5, ease: "power3.out", delay: 0.2 })
      .fromTo(".gsap-hero-title", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, "-=0.8")
      .fromTo(".gsap-keyword", { y: 20, autoAlpha: 0, x: -10 }, { y: 0, autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }, "-=0.6")
      .fromTo(".gsap-hero-subtitle", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, "-=0.4");
});

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => { if (e.target.tagName.toLowerCase() === 'img') e.preventDefault(); });
document.addEventListener('keydown', e => { if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'I' || e.key === 'i' || e.key === 'S' || e.key === 's'))) e.preventDefault(); });

document.addEventListener('DOMContentLoaded', () => {
    const fabMenu = document.getElementById('fab-menu');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    const sideNav = document.querySelector('.side-nav');
    const mainNav = document.querySelector('header nav');

    if (!fabMenu || !sideMenu || !mainNav || !sideNav) return;

    sideNav.innerHTML = mainNav.innerHTML;

    sideNav.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const mainBtn = document.querySelector(`header nav [data-target="${targetId}"]`);
                if(mainBtn) mainBtn.click();
            } else if (this.id === 'about-btn') {
                const aboutBtn = document.getElementById('about-btn');
                if(aboutBtn) aboutBtn.click();
            }
            sideMenu.classList.remove('open');
        });
    });

    fabMenu.addEventListener('click', () => sideMenu.classList.add('open'));
    if(closeMenu) { closeMenu.addEventListener('click', () => sideMenu.classList.remove('open')); }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) { fabMenu.classList.add('visible'); } 
        else { fabMenu.classList.remove('visible'); sideMenu.classList.remove('open'); }
    });
});