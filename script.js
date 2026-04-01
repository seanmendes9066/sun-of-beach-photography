// =========================================
// 🌟 啟動 Lenis 慣性絲滑滾動引擎
// =========================================
const lenis = new Lenis({
  duration: 1.2,       // 數值越大，滑動越緩慢、越絲滑
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
  smooth: true,        
  smoothTouch: false,  // 手機版保留原生手勢，體驗最好
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// =========================================
// 照片資料庫與渲染邏輯
// =========================================
function generatePhotoList(folderName, prefix, maxCount = 100, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push({
            src: `./images/${folderName}/${prefix} (${i}).${ext}`, 
            category: folderName
        });
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('people', 'people', 100, 'jpg'),
    things: generatePhotoList('things', 'things', 100, 'JPG'),
    place: generatePhotoList('place', 'place', 100, 'JPG') 
};

let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; grid-column: 1/-1; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((photo) => {
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `${photo.category} photography`;

        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        
        const titleText = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
        `;

        img.onerror = () => { card.remove(); };
        img.onload = () => { img.style.opacity = 1; };

        // 兩段式點擊邏輯
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('preview-active')) {
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.classList.remove('preview-active');
                });
                card.classList.add('preview-active');
            } else {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = photo.src;
                lightbox.classList.add('show');
                
                // 開啟燈箱時暫停 Lenis 滾動
                lenis.stop();
            }
        });

        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 點擊空白處取消預覽狀態
document.addEventListener('click', (e) => {
    if (!e.target.closest('.gallery-item') && !e.target.closest('.lightbox')) {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('preview-active');
        });
    }
});

// 過濾按鈕與隱藏標題邏輯
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.id === 'about-btn') {
            // 使用 Lenis 專屬的滾動方法前往 About 區塊
            lenis.scrollTo('#about', { offset: -100 });
            return;
        }

        if (this.getAttribute('target') === '_blank') return;

        e.preventDefault();
        
        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        const target = this.getAttribute('data-target');
        if (!target) return; 

        const frontpage = document.getElementById('frontpage');

        if (target === 'all') {
            frontpage.classList.remove('hide');
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            frontpage.classList.add('hide');
            renderPhotos(photoDatabase[target]);
        }

        // 瞬間置頂
        window.scrollTo(0, 0); 
    });
});

// Logo 點擊回到首頁
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('frontpage').classList.remove('hide');
    renderPhotos(shuffleArray(allPhotosArray));
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    
    // 瞬間置頂
    window.scrollTo(0, 0); 
});

// 燈箱關閉
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        
        // 關閉燈箱時恢復 Lenis 滾動
        lenis.start();
    }
});

// 啟動渲染
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});

// =========================================
// 防護罩：防右鍵、防拖曳、防偷看原始碼
// =========================================
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
document.addEventListener('dragstart', function(e) { if (e.target.tagName.toLowerCase() === 'img') e.preventDefault(); });
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) e.preventDefault();
});