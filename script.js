// =========================================
// script.js (高端瀑布流 + 燈箱放大 + 分頁控制 VER.20.1)
// =========================================

// 📍 關鍵修改：定義一個變數來存放 Masonry 實體
let msnry;

// 1. 自動生成照片網址的機器 (防呆修正版：確保 prefix 小寫)
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    if (count <= 0) return photoArray; 

    for (let i = 1; i <= count; i++) {
        //📍這裡的 folderName 必須和 GitHub 上實際資料夾大小寫一致 (如 people, Things, Place)
        // Prefix 和檔名維持小寫，jpg 維持小寫。例如：./images/people/people (1).jpg
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 (張數請根據你實際拖進去的照片填寫)
const photoDatabase = {
    //📍對齊你「全小寫」的設定 (如果有的話)
    people: generatePhotoList('people', 'people', 11),
    things: generatePhotoList('things', 'things', 3), 
    place: generatePhotoList('place', 'place', 1) 
};

// ============================================================
// 📍 合併所有照片 (創造全明星陣容) - 防呆版
// ============================================================
// 我們利用展開運算子 (...) 把三個陣列扁平化合併成一個超大陣列
const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

// ============================================================
// 📍 神級洗牌演算法 (Fisher-Yates Shuffle)
// ============================================================
// 這是一個統計學上證明最完美的公平洗牌演算法。
function shuffleArray(array) {
    // 複製一份陣列，以免弄亂原始資料
    let currentIndex = array.length;
    let randomIndex;

    // 當還有元素等待洗牌...
    while (currentIndex != 0) {
        // 挑選一個剩餘的元素...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 並將它與當前元素交換位置。
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// ============================================================
// 取得網頁元素
// ============================================================
const galleryContainer = document.getElementById('gallery');
const filterLinks = document.querySelectorAll('.filter-link');
const aboutLink = document.querySelector('a[target-page="about-section"]');
const logoBtn = document.getElementById('logo-btn'); 

const frontpageSection = document.getElementById('frontpage');
const gallerySection = document.getElementById('gallery-section');
const aboutSection = document.getElementById('about-section');

// 📍 取得燈箱放大相關元素
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close-btn');

// ============================================================
// 📍 初始化 Masonry 瀑布流排版 (底層貼齊不裁切)
// ============================================================
function initMasonry() {
    if (!galleryContainer) return;

    // 📍 關鍵動作：調用 imagesLoaded 庫，確保圖片載入完成後才進行 Masonry 排版
    // 這樣可以防止圖片高度未定導致的排版錯誤 (重疊)
    imagesLoaded(galleryContainer, function() {
        if (msnry) msnry.destroy(); // 銷毀舊實體防止衝突

        msnry = new Masonry(galleryContainer, {
            itemSelector: '.photo-card', // 📍 指定瀑布流物件類別
            columnWidth: '.grid-sizer', // 使用 grid-sizer 確定列寬
            percentPosition: true, // 使用百分比定位
            transitionDuration: '0.4s', // 藝術切換動畫
            gutter: 0 // 間距在 CSS 中設定 padding
        });
    });
}

// ============================================================
// 📍 渲染照片 (不裁切、底層貼齊瀑布流版)
// ============================================================
function renderPhotos(photoArray) {
    // 清空畫廊 (但保留 grid-sizer)
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); // 把 grid-sizer 放回去

    // 如果沒照片，就顯示一句話
    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p class="quote" style="grid-column: 1/-1; text-align:center;">尚無照片內容。</p>';
        return;
    }

    photoArray.forEach((src) => {
        // 1. 創造卡片容器
        const card = document.createElement('div');
        card.className = 'photo-card'; // 📍 Masonry 依靠這個類別排版

        // 2. 創造圖片
        const img = document.createElement('img');
        img.src = src;

        // 📍 要求 2: 回歸：聚光燈效果邏輯
        card.addEventListener('click', () => {
            // 打開燈箱，將點擊的照片路徑塞入燈箱大圖 src
            lightboxImg.src = src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden'; // 📍 鎖定背景捲動
        });

        // 3. 組合
        card.appendChild(img);
        galleryContainer.appendChild(card);

        // 圖片載入完成後的淡入效果
        img.onload = () => {
            img.style.opacity = 1; 
        };
    });

    // 📍 4. 照片生成後，初始化 Masonry 排版
    initMasonry();
}

// =========================================
// 關閉燈箱的邏輯
// =========================================
if (closeBtn) {
    closeBtn.addEventListener('click', function() {
        lightbox.classList.remove('show');
        document.body.style.overflow = ''; // 恢復背景捲動
    });
}

if (lightbox) {
    // 監聽：點擊半透明黑背景時，關閉燈箱
    lightbox.addEventListener('click', function(e) {
        // 📍 確保點擊的是背景 (flex置中時的容器)，而非圖片本身
        if (e.target !== lightboxImg) {
            lightbox.classList.remove('show');
            document.body.style.overflow = ''; // 恢復背景捲動
        }
    });
}

// ============================================================
// 📍 要求 4: 真正的「Section 切換」邏輯
// ============================================================
const allSections = document.querySelectorAll('.section-container, #frontpage');

function switchToSection(targetSectionId) {
    // 1. 隱藏所有 Section
    allSections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('section-hidden');
    });

    // 2. 顯示目標 Section
    const target = document.getElementById(targetSectionId);
    if (target) {
        target.classList.remove('section-hidden');
        target.classList.add('active-section');
    }

    // 📍 如果切換到藝廊，需要重新初始化 Masonry
    if (targetSectionId === 'gallery-section') {
        initMasonry();
    }
}

// ============================================================
// 📍 首頁邏輯 (滿版大標 + 全明星洗牌)
// ============================================================
function loadRandomPhotosAndShowGallery() {
    // 回到 Frontpage 首頁滿版大標
    switchToSection('frontpage');
    
    // 移除分類按鈕的 active 狀態
    filterLinks.forEach(nav => nav.classList.remove('active'));
    aboutLink.classList.remove('active'); // About Me 也拿掉

    // 將全明星陣列洗牌
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    
    // 渲染，但不顯示 Gallery Section，讓它在背景準備好
    renderPhotos(shuffledPhotos);
}

// ============================================================
// 事件監聽 (分類與 Logo)
// ============================================================

// 📍 監聽：點擊分類選單 (People, Things, Place)
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的 active 狀態
        filterLinks.forEach(nav => nav.classList.remove('active'));
        aboutLink.classList.remove('active'); // About Me 也拿掉
        this.classList.add('active');

        // 判斷目標 Section
        const targetPage = this.getAttribute('target-page');
        switchToSection(targetPage); // 切換頁面

        // 如果是藝廊頁面，渲染該分類特定照片陣列 (不會混搭)
        if (targetPage === 'gallery-section') {
            const targetCategory = this.getAttribute('data-target');
            renderPhotos(photoDatabase[targetCategory]);
        }
    });
});

// 📍 要求 4: 監聽：點擊 About Me (不放在每一頁)
if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
        e.preventDefault(); // 防止超連結網頁跳轉

        filterLinks.forEach(nav => nav.classList.remove('active')); // 其他分類拿掉
        this.classList.add('active');

        // 📍 切換到 About Me Section，它現在是獨立出現的
        switchToSection('about-section');
    });
}

// 📍 監聽：點擊「太海」Logo 按鈕時觸發重新洗牌
if (logoBtn) {
    logoBtn.addEventListener('click', function() {
        // 點擊 Logo 等同於回到首頁隨機狀態並重新洗牌
        loadRandomPhotosAndShowGallery();
    });
}

// ============================================================
// 📍 初始化載入
// ============================================================
// 網頁一打開，預設載入合併洗牌後的「全明星陣列」
loadRandomPhotosAndShowGallery();