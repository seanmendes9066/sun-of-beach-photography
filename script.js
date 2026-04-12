gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    duration: 1.5,       
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smoothWheel: true,   
    wheelMultiplier: 1,  
    smoothTouch: false,  
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const resizeObserver = new ResizeObserver(() => {
    ScrollTrigger.refresh();
});
resizeObserver.observe(document.body);

function generatePhotoList(folderName, prefix, maxCount, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        // 新增 failed 屬性，用來標記實際上不存在的照片
        photoArray.push({ src: `./images/${folderName}/${prefix} (${i}).${ext}`, category: folderName, failed: false });
    }
    return photoArray;
}

// 🚨 修改 1：將最高上限提升到 100 張，確保涵蓋你所有的照片
const photoDatabase = {
    people: { photos: generatePhotoList('people', 'people', 100, 'jpg') }, 
    things: { photos: generatePhotoList('things', 'things', 100, 'JPG') },
    place: { photos: generatePhotoList('place', 'place', 100, 'JPG') }  
};

const featuredPhotos = [
    { src: './images/people/people (3).jpg', category: 'people', failed: false },
    { src: './images/things/things (3).JPG', category: 'things', failed: false },
    { src: './images/place/place (10).JPG', category: 'place', failed: false },
    { src: './images/people/people (4).jpg', category: 'people', failed: false },
    { src: './images/place/place (2).JPG', category: 'place', failed: false },
    { src: './images/things/things (1).JPG', category: 'things', failed: false }
];

if (window.simpleObserver) window.simpleObserver.disconnect();

window.simpleObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const card = entry.target;
            const img = card.querySelector('img');

            gsap.to(card, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" });

            if (img) {
                gsap.fromTo(img, 
                    { "--ink-size": "0%" },
                    { "--ink-size": "150%", duration: 1.0, ease: "power2.out" }
                );
            }
            observer.unobserve(card); 
        }
    });
}, { rootMargin: "50px 0px", threshold: 0.05 });


// 🚨 修改 2：實作分頁 / 載入更多機制
let currentPhotoList = []; 
let activePhotoIndex = 0;  
let currentPage = 1;
const itemsPerPage = 15; // 每次載入 15 張

function renderPhotos(photoArray, isFeatured = false, isLoadMore = false) {
    const gallery = document.getElementById('gallery');
    
    // 如果不是按「載入更多」，就清空畫廊重新開始
    if (!isLoadMore) {
        gallery.innerHTML = ''; 
        window.simpleObserver.disconnect(); 
        currentPhotoList = photoArray; 
        currentPage = 1;
        // 重置所有失敗標記
        photoArray.forEach(p => p.failed = false); 
    }

    if (isFeatured) { gallery.classList.add('featured-mode'); } 
    else { gallery.classList.remove('featured-mode'); }

    if (!photoArray || photoArray.length === 0) { 
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; color: #888;">尚未發現照片。</p>'; 
        return; 
    }

    // 計算這一批要載入的照片範圍
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const batch = photoArray.slice(startIndex, endIndex);

    batch.forEach((photo, index) => {
        const globalIndex = startIndex + index;
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        gsap.set(card, { y: 40, autoAlpha: 0 });

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
                photo.failed = true; // 標記這張照片不存在，讓 Lightbox 略過它
            }
        };

        card.addEventListener('click', () => {
            activePhotoIndex = globalIndex; 
            openLightbox(img.src); 
        });

        card.appendChild(img);
        gallery.appendChild(card);
        window.simpleObserver.observe(card);
    });

    if (!isLoadMore) {
        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });
    }

    manageLoadMoreButton(photoArray.length, endIndex);
}

// 建立或管理「LOAD MORE」按鈕
// 建立或管理「LOAD MORE」按鈕
// 建立或管理「LOAD MORE」按鈕
function manageLoadMoreButton(totalItems, currentIndex) {
    let btnContainer = document.getElementById('load-more-container');
    
    // 如果已經載入完全部（或超過上限），移除按鈕
    if (currentIndex >= totalItems) {
        if (btnContainer) btnContainer.remove();
        return;
    }

    // 如果按鈕還不存在，建立一個
    if (!btnContainer) {
        btnContainer = document.createElement('div');
        btnContainer.id = 'load-more-container';
        btnContainer.style.cssText = "text-align: center; margin: 60px 0 20px 0; width: 100%; clear: both;"; 
        
        const btn = document.createElement('button');
        btn.id = 'load-more-btn';
        btn.textContent = 'LOAD MORE';
        btn.style.cssText = "background: transparent; border: 1px solid var(--color-text); color: var(--color-text); padding: 12px 40px; font-family: var(--font-body); font-size: 1rem; cursor: pointer; transition: all 0.3s ease; letter-spacing: 0.15em; text-transform: uppercase;";
        
        btn.onmouseover = () => { btn.style.background = 'var(--color-text)'; btn.style.color = 'var(--color-bg)'; };
        btn.onmouseout = () => { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text)'; };

        btn.addEventListener('click', function() {
            // 視覺回饋：改為 Loading 狀態
            this.textContent = 'LOADING...';
            this.style.opacity = '0.5';
            this.style.pointerEvents = 'none'; // 防止連續點擊

            // 極短暫延遲讓畫面更新按鈕狀態，然後原地載入新照片
            setTimeout(() => {
                currentPage++;
                renderPhotos(currentPhotoList, document.getElementById('gallery').classList.contains('featured-mode'), true);
                
                // 恢復按鈕狀態，新照片會自然把按鈕往下推
                this.textContent = 'LOAD MORE';
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';

                // 刷新滾動高度，讓 GSAP 知道頁面變長了
                ScrollTrigger.refresh();
            }, 100); 
        });

        btnContainer.appendChild(btn);
        const gallery = document.getElementById('gallery');
        gallery.parentNode.insertBefore(btnContainer, gallery.nextSibling);
    }
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = src; 
    
    // 每次開啟時重置狀態
    delete lightboxImg.dataset.retried;
    
    lightbox.classList.add('show');
    gsap.set(lightboxImg, { opacity: 1 }); 
    lenis.stop(); 
}

function changePhoto(direction) {
    let nextIndex = activePhotoIndex;
    let attempts = 0;
    const maxAttempts = currentPhotoList.length;

    // 🚨 修改 3：智慧跳過不存在的照片，防止 Lightbox 當機或破圖
    do {
        nextIndex = (nextIndex + direction + currentPhotoList.length) % currentPhotoList.length;
        attempts++;
        if (attempts > maxAttempts) return; // 避免極端情況下的無窮迴圈
    } while (currentPhotoList[nextIndex].failed); 

    activePhotoIndex = nextIndex;
    const newPhoto = currentPhotoList[activePhotoIndex];
    const lightboxImg = document.getElementById('lightbox-img');
    
    gsap.to(lightboxImg, { opacity: 0, duration: 0.15, onComplete: () => {
        delete lightboxImg.dataset.retried; // 換照片前重置
        lightboxImg.src = newPhoto.src;
        
        lightboxImg.onerror = function() {
            if (!this.dataset.retried) {
                this.dataset.retried = true;
                let currentExt = newPhoto.src.split('.').pop();
                let newExt = currentExt === 'jpg' ? 'JPG' : 'jpg';
                this.src = newPhoto.src.replace('.' + currentExt, '.' + newExt);
            } else {
                currentPhotoList[activePhotoIndex].failed = true; // 還是失敗，標記並自動跳下一張
                changePhoto(direction); 
            }
        };

        gsap.to(lightboxImg, { opacity: 1, duration: 0.3, ease: "power2.out" });
    }});
}

const prevBtn = document.getElementById('lightbox-prev');
const nextBtn = document.getElementById('lightbox-next');
const closeBtn = document.getElementById('close-lightbox');

if(prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); changePhoto(-1); });
if(nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); changePhoto(1); });

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('show')) return;
    
    if (e.key === 'ArrowLeft') { changePhoto(-1); } 
    else if (e.key === 'ArrowRight') { changePhoto(1); }
    else if (e.key === 'Escape') { closeLightbox(); } 
});

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('show');
    lenis.start();
}

document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img') && 
        e.target !== document.getElementById('lightbox-prev') && 
        e.target !== document.getElementById('lightbox-next')) {
        closeLightbox();
    }
});

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
        if (target === 'all') { if(frontpage) frontpage.classList.remove('hide'); renderPhotos(featuredPhotos, true); } 
        else { if(frontpage) frontpage.classList.add('hide'); renderPhotos(photoDatabase[target].photos, false); }
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

document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(featuredPhotos, true); 
    const tl = gsap.timeline();
    tl.fromTo(".hero-left-image", { yPercent: 30, xPercent: -10, autoAlpha: 0, rotation: -2 }, { yPercent: 0, xPercent: 0, autoAlpha: 1, rotation: 0, duration: 2, ease: "power3.out", delay: 0.2 }) 
      .fromTo(".gsap-hero-title", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, ease: "power3.out" }, "-=1.2")
      .fromTo(".gsap-keyword", { y: 20, autoAlpha: 0, x: -10 }, { y: 0, autoAlpha: 1, x: 0, duration: 1, stagger: 0.15, ease: "power2.out" }, "-=1")
      .fromTo(".gsap-hero-subtitle", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.5, ease: "power2.out" }, "-=0.8");
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
    sideNav.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

    sideNav.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) { 
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            if (targetId) { 
                const mainBtn = document.querySelector(`header nav [data-target="${targetId}"]`); 
                if(mainBtn) mainBtn.click(); 
            } else if (this.textContent.trim() === 'About Me') { 
                const aboutBtn = document.querySelector('header nav #about-btn'); 
                if(aboutBtn) aboutBtn.click(); 
            }
            sideMenu.classList.remove('open');
        });
    });
    
    fabMenu.addEventListener('click', () => sideMenu.classList.add('open'));
    if(closeMenu) { closeMenu.addEventListener('click', () => sideMenu.classList.remove('open')); }
    window.addEventListener('scroll', () => { if (window.scrollY > 200) { fabMenu.classList.add('visible'); } 
        else { fabMenu.classList.remove('visible'); sideMenu.classList.remove('open'); } });
});

document.addEventListener('DOMContentLoaded', () => {
    const aboutTexts = document.querySelectorAll('#about .main-text');
    
    aboutTexts.forEach(p => {
        let newHtml = '';
        
        p.childNodes.forEach(node => {
            if (node.nodeType === 3) { 
                const text = node.nodeValue;
                const words = text.split(/(\s+)/); 
                
                words.forEach(word => {
                    if (!word.trim()) {
                        newHtml += word; 
                    } else {
                        newHtml += `<span style="display:inline-block;">`;
                        word.split('').forEach(char => {
                            newHtml += `<span class="ink-char">${char}</span>`;
                        });
                        newHtml += `</span>`;
                    }
                });
            } else if (node.nodeType === 1) { 
                 const tagName = node.tagName.toLowerCase();
                 const text = node.innerText;
                 const words = text.split(/(\s+)/);
                 let innerHtml = '';
                 
                 words.forEach(word => {
                    if (!word.trim()) {
                        innerHtml += word;
                    } else {
                        innerHtml += `<span style="display:inline-block;">`;
                        word.split('').forEach(char => {
                            innerHtml += `<span class="ink-char">${char}</span>`;
                        });
                        innerHtml += `</span>`;
                    }
                 });
                 newHtml += `<${tagName}>${innerHtml}</${tagName}>`;
            }
        });
        
        p.innerHTML = newHtml;
        
        gsap.to(p.querySelectorAll('.ink-char'), {
            scrollTrigger: {
                trigger: p, 
                start: "top 95%", 
                end: "bottom 75%", 
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
});