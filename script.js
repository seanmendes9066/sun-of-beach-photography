// =========================================
// script.js (乾淨 Grid 渲染 + 兩段式點擊)
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
        // 注意：這裡必須對應 CSS 的 gallery-item
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

        // 防呆：圖片讀取失敗時自動移除該格子，Grid 會自動補齊空缺
        img.onerror = () => { card.remove(); };
        img.onload = () => { img.style.opacity = 1; };

        // 🌟 核心修改：兩段式點擊邏輯 (專為手機優化)
        card.addEventListener('click', (e) => {
            // 如果這張照片還沒有處於預覽狀態 (preview-active)
            if (!card.classList.contains('preview-active')) {
                // 先清除其他所有照片的預覽狀態
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.classList.remove('preview-active');
                });
                // 給這張照片加上預覽狀態 (顯示文字、放大)
                card.classList.add('preview-active');
            } else {
                // 如果已經處於預覽狀態，再點一下就會打開全畫面燈箱
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = photo.src;
                lightbox.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });

        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 點擊照片以外的空白處，取消所有的預覽狀態 (防呆)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.gallery-item') && !e.target.closest('.lightbox')) {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('preview-active');
        });
    }
});

// 事件監聽：過濾按鈕
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // 排除 IG 連結被 JavaScript 阻擋
        if (this.getAttribute('target') === '_blank') return;

        e.preventDefault();
        
        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        const target = this.getAttribute('data-target');
        if (!target) return; 

        if (target === 'all') {
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            renderPhotos(photoDatabase[target]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 📍 Logo 點擊邏輯：回到首頁並強制底線回 ALL WORKS
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    renderPhotos(shuffleArray(allPhotosArray));
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 燈箱關閉邏輯
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        document.body.style.overflow = '';
    }
});

// 網頁初始啟動：首頁展示全部照片
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});
// =========================================
// 防護罩：防右鍵、防拖曳、防偷看原始碼
// =========================================

// 1. 徹底禁用滑鼠右鍵 (阻止另存圖片選單)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 2. 雙重保險：再次強制禁用所有圖片的拖曳行為
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        e.preventDefault();
    }
});

// 3. 禁用常見的駭客/偷圖快捷鍵 (F12, Ctrl+Shift+I, Ctrl+S)
document.addEventListener('keydown', function(e) {
    // 禁用 F12
    if (e.key === 'F12') {
        e.preventDefault();
    }
    // 禁用 Ctrl+Shift+I (Windows) 或 Cmd+Option+I (Mac) 打開開發者工具
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
    }
    // 禁用 Ctrl+S 或 Cmd+S (另存網頁)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
    }
});