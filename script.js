// =========================================
// script.js (高端瀑布流藝術藝廊版 + JPG 路徑修正版)
// =========================================

// 📍 關鍵修改：定義一個變數來存放 Masonry 實體
let msnry;

// 1. 自動生成照片網址的機器 (防呆修正版：確保 prefix 空格與自定義副檔名)
function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    // 📍 防呆：如果張數小於或等於 0，直接回傳空陣列
    if (count <= 0) return photoArray; 

    for (let i = 1; i <= count; i++) {
        // 📍 關鍵修正點：
        // A. folderName 指向大寫開頭資料夾 (People, Things, Place)
        // B.我在 `${prefix}` 和 `(${i})` 之間加上了空白鍵，對齊你的命名習慣：people (1).jpg
        // C. 我幫副檔名加上了自定義參數 (${ext})，對齊 Things 資料夾的大寫 .JPG
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

// 2. 定義資料庫 (張數請根據你實際的照片填寫)
const photoDatabase = {
    // 例如：你在 images/People 資料夾放了 11 張照片，命名為 people (1).jpg ~ people (11).jpg
    people: generatePhotoList('People', 'people', 11),

    // 例如：你在 images/Things 資料夾放了 1 張照片，命名為 Things (1).JPG
    // 📍 關鍵修正點：根據你的截圖，我幫副檔名加上了參數 'JPG' (大寫)
    // 提醒：你說 things 改回從 1 編號了，所以這裡設定張數即可 (請根據你實際張數填寫，範例設為 1)
    things: generatePhotoList('Things', 'Things', 1, 'JPG'),

    // 例如：你在 images/Place 資料夾放了 1 張照片，命名為 place (1).jpg
    // 📍 提醒：如果資料夾是空的，請務必把張數設為 0，以免程式報錯
    place: generatePhotoList('Place', 'place', 1) 
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
const logoBtn = document.getElementById('logo-btn'); 

// ============================================================
// 📍 關鍵修改：定義初始化 Masonry 的通用動作
// ============================================================
function initMasonry() {
    // 📍 防呆：只在 galleryContainer 存在時初始化
    if (!galleryContainer) return;

    // 📍 關鍵動作：調用 imagesLoaded 庫，確保圖片載入完成後才進行 Masonry 排版
    // 這樣可以防止圖片高度未定導致的排版錯誤 (重疊)
    imagesLoaded(galleryContainer, function() {
        // 📍 如果 Masonry 實體已存在，先銷毀它 (分類切換時需要)
        if (msnry) msnry.destroy();

        // 📍 初始化 Masonry
        msnry = new Masonry(galleryContainer, {
            itemSelector: '.photo-card', // 指定瀑布流物件類別
            columnWidth: '.grid-sizer', // 使用 grid-sizer 確定列寬
            percentPosition: true, // 使用百分比定位
            transitionDuration: '0.4s', // 切換分類時的過渡動畫
            gutter: 0 // 間距已在 CSS 中設定 padding 即可
        });
    });
}

// ============================================================
// 📍 渲染照片 (瀑布流版)
// ============================================================
function renderPhotos(photoArray) {
    galleryContainer.innerHTML = ''; 

    // 如果沒照片，就顯示一句話
    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 50px; width: 100%; color: #888;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card'; // Masonry 識別這個類別進行定位

        const img = document.createElement('img');
        img.src = src;

        card.appendChild(img);
        galleryContainer.appendChild(card);

        // 圖片載入完成後的淡入效果
        img.onload = () => {
            img.style.opacity = 1; 
        };
    });

    // 📍 關鍵動作：照片生成後，初始化 Masonry 進行排版
    initMasonry();
}

// ============================================================
// 📍 載入隨機照片 (全明星陣容)
// ============================================================
function loadRandomPhotos() {
    filterLinks.forEach(nav => nav.classList.remove('active'));
    // 將全明星陣列送去洗牌
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    renderPhotos(shuffledPhotos);
}

// ============================================================
// 事件監聽
// ============================================================

// 📍 監聽：點擊分類選單 (只載入該分類特定照片)
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的白色底線
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 讀取點擊的分類，並呼叫渲染函數重新畫圖
        const targetCategory = this.getAttribute('data-target');
        renderPhotos(photoDatabase[targetCategory] || []);
    });
});

// 📍 監聽：點擊「太海」Logo 時觸發回到首頁隨機狀態
if (logoBtn) {
    logoBtn.addEventListener('click', function() {
        // 點擊 Logo 等同於回到首頁隨機狀態並重新洗牌
        loadRandomPhotos();
    });
}

// ============================================================
// 📍 初始化載入
// ============================================================
// 網頁一打開，預設載入合併洗牌後的隨機照片流
loadRandomPhotos();