// =========================================
// script.js (全明星洗牌 + 分類置頂 + 展示全部版)
// =========================================

// 1. 自動生成照片網址的機器 (防呆修正版：確保 prefix 小寫)
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    if (count <= 0) return photoArray; 

    for (let i = 1; i <= count; i++) {
        //📍這裡的 folderName 必須和 GitHub 上實際資料夾大小寫一致
        //例如：./images/People/people (1).jpg
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 (張數請根據你實際拖進去的照片填寫)
const photoDatabase = {
    // 📍 根據你的截圖設定路徑 (資料夾大寫首字，Prefix 小寫)
    people: generatePhotoList('People', 'people', 11),
    // 提醒：如果你在 images/Things 放了 3 張照片
    things: generatePhotoList('Things', 'things', 3), 
    // 提醒：如果你在 images/Place 放了 1 張照片
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
const filterLinks = document.querySelectorAll('.filter-link');
const galleryContainer = document.getElementById('gallery');
const logoBtn = document.getElementById('logo-btn'); 

// ============================================================
// 📍 渲染照片 (不裁切照片，底層貼齊瀑布流版)
// ============================================================
function renderPhotos(photoArray) {
    // 清空畫廊 (但保留 grid-sizer)
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); // 把 grid-sizer 放回去

    // 如果沒照片，就顯示一句話
    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p class="quote" style="grid-column: 1/-1; text-align:center;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        // 1. 創造卡片容器 (Masonry 依靠這個類別排版)
        const card = document.createElement('div');
        card.className = 'photo-card'; 

        // 2. 創造圖片
        const img = document.createElement('img');
        img.src = src;

        // 📍 防呆機制：如果圖片路徑不存在 (例如編號超出了你實際擁有的)，就移除該卡片
        img.onerror = () => {
            card.remove(); 
        };

        // 3. 組合
        card.appendChild(img);
        galleryContainer.appendChild(card);

        // 圖片載入完成後的淡入效果
        img.onload = () => {
            img.style.opacity = 1; 
        };
    });
}

// ============================================================
// 📍 載入隨機照片 (全明星陣容) - 核心修正：全展示
// ============================================================
function loadRandomPhotos() {
    // 移除分類按鈕的 active 狀態
    filterLinks.forEach(nav => nav.classList.remove('active'));
    
    // 將全明星陣列洗牌
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    
    // 📍 修正點：移除原本的 .slice(0, 5)，展示洗牌後的「所有」照片
    renderPhotos(shuffledPhotos);
}

// ============================================================
// 📍 要求 2: 事件監聽與分類自動置頂
// ============================================================

// 監聽：點擊分類選單
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的白色底線
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 如果點擊了選單，就需要自動捲動回最上方，確保看到第一排照片
        // 📍 關鍵新增：平滑滾動到網頁最上方
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 讀取點擊的分類，並呼叫渲染函數重新畫圖
        const targetCategory = this.getAttribute('data-target');
        renderPhotos(photoDatabase[targetCategory]);
    });
});

// 📍 監聽：點擊「太海」Logo 按鈕時觸發重新洗牌
if (logoBtn) {
    logoBtn.addEventListener('click', function() {
        // 點擊 Logo 等同於回到首頁隨機狀態並重新洗牌
        loadRandomPhotos();
    });
}

// ============================================================
// 初始化載入
// ============================================================
// 網頁一打開，預設載入合併洗牌後的「全明星陣列」
loadRandomPhotos();