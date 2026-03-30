// =========================================
// script.js (首頁精選 5 張隨機照片版)
// =========================================

let msnry;

// 1. 自動生成照片網址的機器
function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = 1; i <= count; i++) {
        // 📍 對齊你的命名習慣：首字母大寫資料夾、空格、大寫或小寫副檔名
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

// 2. 定義資料庫 (張數請根據你實際的照片填寫)
const photoDatabase = {
    people: generatePhotoList('People', 'people', 11, 'jpg'),
    // 📍 修正 Things 沒吃到的問題：前綴大寫 'Things'，副檔名大寫 'JPG'
    things: generatePhotoList('Things', 'Things', 11, 'JPG'), 
    place: generatePhotoList('Place', 'place', 1, 'jpg') 
};

// 合併所有可用照片
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

// 4. 初始化瀑布流 (Masonry)
function initMasonry() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    
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

// 5. 渲染照片到畫面
function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    const sizer = gallery.querySelector('.grid-sizer');
    gallery.innerHTML = ''; 
    if (sizer) gallery.appendChild(sizer);

    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;
        
        // 📍 防呆：圖片載入失敗時自動移除該卡片
        img.onerror = () => card.remove(); 
        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry(); 
        };
        
        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// ============================================================
// 📍 關鍵修改區：首頁隨機挑 5 張
// ============================================================
function loadRandomPhotos() {
    // 1. 移除選單所有 active 狀態
    document.querySelectorAll('.filter-link').forEach(nav => nav.classList.remove('active'));
    
    // 2. 將全明星陣列洗牌
    const shuffled = shuffleArray([...allPhotosArray]);
    
    // 3. 【關鍵】使用 .slice(0, 5) 只取前五張照片
    const curatedFive = shuffled.slice(0, 5); 
    
    // 4. 渲染這 5 張精選照片
    renderPhotos(curatedFive);
}

// 6. 事件監聽
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        renderPhotos(photoDatabase[target] || []);
    });
});

// 監聽：點擊「太海」Logo 時觸發重新隨機挑 5 張
const logoBtn = document.getElementById('logo-btn');
if (logoBtn) {
    logoBtn.addEventListener('click', function() {
        loadRandomPhotos();
    });
}

// 7. 初始化啟動
loadRandomPhotos();