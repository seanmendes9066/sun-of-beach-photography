// =========================================
// script.js (神人級藝廊隨機展示版)
// =========================================

// 1. 自動生成照片網址的機器 (保持不變)
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix}-${i}.jpg`);
    }
    return photoArray;
}

// ============================================================
// 📍 關鍵區塊一：定義資料庫 (請根據你實際拖進去的照片張數修改數字)
// ============================================================
const photoDatabase = {
    // 例如：你在 images/people 資料夾放了 11 張照片
    people: generatePhotoList('people', 'people', 11),

    // 例如：你在 images/things 資料夾放了 3 張照片
    things: generatePhotoList('things', 'things', 3),

    // 例如：你在 images/place 資料夾放了 0 張照片 (建了資料夾沒放圖)
    // 注意：如果張數為 0，網頁可能會報錯，請至少放一張測試。
    place: generatePhotoList('place', 'place', 1) 
};

// ============================================================
// 📍 關鍵區塊二：合併所有照片 (創造全明星陣容)
// ============================================================
// 我們利用展開運算子 (...) 把三個陣列扁平化合併成一個超大陣列
const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

// ============================================================
// 📍 關鍵區塊三：神級洗牌演算法 (Fisher-Yates Shuffle)
// ============================================================
// 這是一個統計學上證明最完美的公平洗牌演算法，比 random() - 0.5 好太多了。
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
// 3. 取得網頁元素
// ============================================================
const filterLinks = document.querySelectorAll('.filter-link');
const galleryContainer = document.getElementById('gallery');
const logoLink = document.querySelector('.logo'); // 取得「太海」Logo

// ============================================================
// 4. 定義「渲染照片」的通用動作 (保持不變，它只負責畫圖)
// ============================================================
function renderPhotos(photoArray) {
    galleryContainer.innerHTML = ''; // 清空畫廊

    // 如果沒照片，就顯示一句話
    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML = '<p class="subtitle" style="grid-column: 1/-1; text-align:center;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const img = document.createElement('img');
        img.src = src;

        card.appendChild(img);
        galleryContainer.appendChild(card);

        img.onload = () => {
            img.style.opacity = 1; // 滑順淡入
        };
    });
}

// ============================================================
// 📍 關鍵區塊四：定義「載入隨機照片」的動作
// ============================================================
function loadRandomPhotos() {
    // 1. 移除所有分類連結的白色底線 (active 狀態)
    filterLinks.forEach(nav => nav.classList.remove('active'));

    // 2. 將全明星陣列送去洗牌
    const shuffledPhotos = shuffleArray([...allPhotosArray]); // 再次複製陣列去洗

    // 3. 渲染洗牌後的隨機結果 (會混搭 PEOPLE, THINGS, PLACE 的照片)
    renderPhotos(shuffledPhotos);
}

// ============================================================
// 5. 事件監聽 (整合原本邏輯與新隨機邏輯)
// ============================================================

// 📍 監聽：點擊分類選單 (只載入該分類的特定照片)
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的白色底線
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 讀取點擊的分類名稱 (如 'automotive')
        const targetCategory = this.getAttribute('data-target');
        
        // 渲染該分類特定的照片陣列 (不會混搭)
        renderPhotos(photoDatabase[targetCategory]);
    });
});

// 📍 監聽：點擊「太海」Logo (回到隨機流模式)
if (logoLink) {
    logoLink.addEventListener('click', function() {
        // 點擊 Logo 等同於回到首頁隨機狀態
        loadRandomPhotos();
    });
}

// ============================================================
// 📍 關鍵區塊五：初始化 (點進去時)
// ============================================================
// 網頁一打開，預設載入隨機照片流
loadRandomPhotos();