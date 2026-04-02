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
function generatePhotoList(folderName, prefix, maxCount = 100, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push({ src: `./images/${folderName}/${prefix} (${i}).${ext}`, category: folderName });
    }
    return photoArray;
}

const photoDatabase = {
    people: { photos: generatePhotoList('people', 'people', 100, 'jpg'), word: 'RESONANT' },
    things: { photos: generatePhotoList('things', 'things', 100, 'JPG'), word: 'INTENTIONAL' },
    place: { photos: generatePhotoList('place', 'place', 100, 'JPG'), word: 'INTIMATE' } 
};
let allPhotosArray = [...photoDatabase.people.photos, ...photoDatabase.things.photos, ...photoDatabase.place.photos];

// =========================================
// 🌟 你的首頁專屬精選照片 (VIP 名單 - 5張)
// =========================================
const featuredPhotos = [
    { src: './images/people/people (3).jpg', category: 'people' },
    { src: './images/place/place (2).JPG', category: 'place' },
    { src: './images/things/things (3).JPG', category: 'things' },
    { src: './images/people/people (4).jpg', category: 'people' },
    { src: './images/place/place (10).JPG', category: 'place' }
];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// =========================================
// 核心渲染引擎
// =========================================
// 🚨 加入 isFeatured 參數，預設為 false
function renderPhotos(photoArray, isFeatured = false) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 
    ScrollTrigger.getAll().forEach(t => t.kill()); 

    // 🌟 關鍵邏輯：如果是首頁精選，就加上 featured-mode 啟動 CSS 的「上2下3」排版
    if (isFeatured) {
        gallery.classList.add('featured-mode');
    } else {
        gallery.classList.remove('featured-mode');
    }

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; grid-column: 1/-1; color: #888;">尚未發現照片。</p>';
        return;
    }

    // 這裡我們不使用 limit 了，因為如果是 featured 就是 5 張，不是的話就是全部
    photoArray.forEach((photo, index) => {
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `${photo.category} photography`;
        img.loading = "lazy"; 
        
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

        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        const titleText = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        let word = photoDatabase[photo.category]?.word || '';
        
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
            <p class="resonant-word">${word}</p>
        `;

        card.addEventListener('click', (e) => {
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
        card.appendChild(overlay);
        gallery.appendChild(card);
    });

    requestAnimationFrame(() => {
        gallery.offsetHeight; 
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();

        gsap.utils.toArray('.gallery-item').forEach((item, index) => {
            let isLeft = index % 2 === 0;
            let startDelay = index < 6 ? (index * 0.15) : 0;
            
            gsap.fromTo(item, 
                { yPercent: 20, xPercent: isLeft ? -10 : 10, autoAlpha: 0, scale: 0.9, rotation: isLeft ? -2 : 2 },
                {
                    scrollTrigger: { 
                        trigger: item, 
                        start: "top 100%", 
                        toggleActions: "play none none none" 
                    },
                    yPercent: 0, xPercent: 0, autoAlpha: 1, scale: 1, rotation: 0, 
                    duration: 1.2, ease: "power3.out", delay: startDelay
                }
            );
        });
    });
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
            // 如果你還有保留圖文大標區，就解除隱藏
            if(frontpage) frontpage.classList.remove('hide');
            // 🚨 傳入 true，啟用首頁精選排版
            renderPhotos(featuredPhotos, true); 
        } else {
            // 隱藏大標區
            if(frontpage) frontpage.classList.add('hide');
            // 🚨 傳入 false，恢復一般網格排版
            renderPhotos(photoDatabase[target].photos, false);
        }
    });
});

document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const frontpage = document.getElementById('frontpage');
    if(frontpage) frontpage.classList.remove('hide');
    
    // 🚨 傳入 true，啟用首頁精選排版
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

// =========================================
// 首頁大標區進場動畫
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // 🚨 初始載入時傳入 true，啟用首頁精選排版
    renderPhotos(featuredPhotos, true); 
    
    // 如果你已經把 HTML 的大標區刪了，這段動畫會找不到元素，但不會報錯
    const tl = gsap.timeline();
    tl.fromTo(".hero-left-image", 
        { yPercent: 30, xPercent: -10, autoAlpha: 0, rotation: -2 }, 
        { yPercent: 0, xPercent: 0, autoAlpha: 1, rotation: 0, duration: 1.5, ease: "power3.out", delay: 0.2 }
    )
    .fromTo(".gsap-hero-title", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "power3.out" }, "-=0.8")
    .fromTo(".gsap-keyword", { y: 20, autoAlpha: 0, x: -10 }, { y: 0, autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }, "-=0.6")
    .fromTo(".gsap-hero-subtitle", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, "-=0.4");
});

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => { if (e.target.tagName.toLowerCase() === 'img') e.preventDefault(); });
document.addEventListener('keydown', e => { if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'I' || e.key === 'i' || e.key === 'S' || e.key === 's'))) e.preventDefault(); });