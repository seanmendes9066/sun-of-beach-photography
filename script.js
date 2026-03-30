// =========================================
// script.js (高端瀑布流 + 燈箱放大 + Place 整合版)
// =========================================

let msnry; // 存放瀑布流實體

// 1. 自動生成照片網址的機器 (防呆修正版：確保 prefix 空格與自定義副檔名)
function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = 1; i <= count; i++) {
        // 對齊你的命名習慣：單字和括號中間「有一個空格」，如 people (1).jpg
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

// ============================================================
// 📍 2. 定義資料庫 (關鍵修正區)
// ============================================================
const photoDatabase = {
    // People 資料夾：11張, 小寫 .jpg
    people: generatePhotoList('People', 'people', 11, 'jpg'),

    // Things 資料夾：11張, 📍前綴大寫 'Things', 副檔名大寫 'JPG'
    things: generatePhotoList('Things', 'Things', 11, 'JPG'), 

    // Place 資料夾：📍 按照 Things 邏輯加進去
    // 請確認你在 images 目錄下建立了大寫開頭的 'Place' 資料夾
    // 檔案命名為 Place (1).JPG, Place (2).JPG...
    place: generatePhotoList('Place', 'Place', 5, 'JPG') // 範例設為 5 張，請根據實際張數修改
};

// 合併所有可用照片 (創造全明星陣容)
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

// 3. 洗牌演算法 (Fisher-Yates Shuffle)
function shuffleArray(array) {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 4. 取得網頁元素
const galleryContainer = document.getElementById('gallery');
const filterLinks = document.querySelectorAll('.filter-link');
const logoBtn = document.getElementById('logo-btn'); 

// 📍 5. 新增：燈箱 (Lightbox) 相關元素
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');

// ============================================================
// 📍 6. 燈箱 (Lightbox) 邏輯函數
// ============================================================
function openLightbox(imgSrc) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc; // 將點擊的照片路徑塞入燈箱
    lightbox.classList.add('show'); // 顯示燈箱
    document.body.style.overflow = 'hidden'; // 鎖定背景捲動
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('show'); // 隱藏燈箱
    document.body.style.overflow = ''; // 恢復背景捲動
    // 稍微延遲清空 src，防止關閉動畫看到破圖
    setTimeout(() => lightboxImg.src = '', 400); 
}

// 📍 監聽：點擊燈箱背景或關閉按鈕時關閉
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        // 如果點擊的是背景 (不是圖片本身) 就關閉
        if (e.target !== lightboxImg) {
            closeLightbox();
        }
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
}

// 📍 監聽：按下鍵盤 Esc 鍵時關閉燈箱
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('show')) {
        closeLightbox();
    }
});

// ============================================================
// 7. 瀑布流 (Masonry) 排版邏輯
// ============================================================
function initMasonry() {
    if (!galleryContainer) return;
    imagesLoaded(galleryContainer, function() {
        if (msnry) msnry.destroy(); // 銷毀舊實體防止衝突
        msnry = new Masonry(galleryContainer, {
            itemSelector: '.photo-card',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            transitionDuration: '0.4s',
            gutter: 0 // 間距在 CSS 中設定 padding
        });
    });
}

// 8. 渲染照片到畫面
function renderPhotos(photoArray) {
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); // 保留 sizer

    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        const img = document.createElement('img');
        img.src = src;
        
        // 📍 核心修改：為每一張動態生成的照片卡片加入「點擊放大」監聽器
        card.addEventListener('click', () => {
            openLightbox(src); // 傳遞目前照片的路徑
        });
        
        // 防呆：圖片載入失敗時自動移除該卡片
        img.onerror = () => card.remove(); 
        img.onload = () => { 
            img.style.opacity = 1; // 圖片載入完成後淡入
            initMasonry(); // 觸發瀑布流重新排版
        };
        
        card.appendChild(img);
        galleryContainer.appendChild(card);
    });
}

// 9. 首頁邏輯 (精選 5 張隨機照片)
function loadHome() {
    filterLinks.forEach(nav => nav.classList.remove('active'));
    // 將全明星陣列洗牌
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    // 只取洗牌後的前五張照片渲染
    renderPhotos(shuffledPhotos.slice(0, 5));
}

// ============================================================
// 10. 事件監聽 (分類與 Logo)
// ============================================================
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        const targetCategory = this.getAttribute('data-target');
        renderPhotos(photoDatabase[targetCategory] || []);
    });
});

if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
        e.preventDefault(); // 防止超連結網頁跳轉
        loadHome(); // 回到首頁精選模式
    });
}

// ============================================================
// 11. 初始化啟動
// ============================================================
loadHome();