// =========================================
// script.js (全小寫優化 + 展示全部照片版)
// =========================================

let msnry;

// 1. 自動生成連結 (全小寫邏輯)
function generatePhotoList(folderName, prefix, maxCount = 100) {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        // 📍 這裡根據你的截圖設定：資料夾、檔名、副檔名全部小寫
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 (自動嘗試抓取 1-100 號，不存在的會被 onerror 濾掉)
const photoDatabase = {
    people: generatePhotoList('people', 'people', 50),
    things: generatePhotoList('things', 'things', 50),
    place: generatePhotoList('place', 'place', 50) 
};

// 合併所有照片用於首頁
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

// 3. 洗牌演算法
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 4. 初始化瀑布流
function initMasonry() {
    const gallery = document.getElementById('gallery');
    imagesLoaded(gallery, function() {
        if (msnry) msnry.destroy();
        msnry = new Masonry(gallery, {
            itemSelector: '.photo-card',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            transitionDuration: '0.4s'
        });
    });
}

// 5. 渲染照片 (核心優化：展示全部)
function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    const sizer = gallery.querySelector('.grid-sizer');
    gallery.innerHTML = ''; 
    if (sizer) gallery.appendChild(sizer);

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML += '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;

        // 📍 防呆機制：如果圖片路徑不存在 (例如編號超出了你實際擁有的)，就移除該卡片
        img.onerror = () => card.remove(); 
        
        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry(); 
        };

        // 點擊放大
        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// 6. 事件監聽
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        // 📍 分類頁面展示該分類的「所有」照片
        renderPhotos(photoDatabase[target]);
    });
});

// Logo 點擊：回到首頁展示「全部照片」隨機洗牌
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    renderPhotos(shuffleArray(allPhotosArray));
});

// 燈箱關閉
document.getElementById('lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('show');
    document.body.style.overflow = '';
});

// 7. 啟動 (首頁預設展示全部照片洗牌)
renderPhotos(shuffleArray(allPhotosArray));