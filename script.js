// =========================================
// script.js (藝廊隨機展示 + 防呆版)
// =========================================

// 1. 自動生成照片網址的機器 
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    // 📍 防呆：如果張數小於或等於 0，直接回傳空陣列
    if (count <= 0) return photoArray; 

    for (let i = 1; i <= count; i++) {
        // 📍 修正點：確保指向大寫開頭的資料夾 (People, Things, Place)
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 (請根據你實際拖進去的照片張數修改數字)
const photoDatabase = {
    // 例如：你在 images/People 資料夾放了 11 張照片
    people: generatePhotoList('People', 'people', 11),

    // 例如：你在 images/Things 資料夾放了 0 張照片
    // 📍 修正點：如果資料夾是空的，請務必把數量設為 0
    things: generatePhotoList('Things', 'things', 0),

    // 例如：你在 images/Place 資料夾放了 1 張照片
    place: generatePhotoList('Place', 'place', 1) 
};

// 📍 修正點：只合併「非空」的資料庫，以免 randomArray 合併空陣列
const availableDatabase = {};
Object.keys(photoDatabase).forEach(category => {
    if (photoDatabase[category] && photoDatabase[category].length > 0) {
        availableDatabase[category] = photoDatabase[category];
    }
});

// 3. 合併所有可用的照片 
const allPhotosArray = Object.values(availableDatabase).flat();

// 4. 洗牌演算法
function shuffleArray(array) {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 5. 取得網頁元素
const filterLinks = document.querySelectorAll('.filter-link');
const galleryContainer = document.getElementById('gallery');
const logoBtn = document.getElementById('logo-btn'); // 取得 Logo 超連結按鈕

// 6. 渲染照片
function renderPhotos(photoArray) {
    galleryContainer.innerHTML = ''; 
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
            img.style.opacity = 1; 
        };
    });
}

// 7. 載入隨機照片
function loadRandomPhotos() {
    filterLinks.forEach(nav => nav.classList.remove('active'));
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    renderPhotos(shuffledPhotos);
}

// 8. 事件監聽
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        const targetCategory = this.getAttribute('data-target');
        // 📍 修正點：防呆，如果分類沒照片，顯示無照片文字
        renderPhotos(availableDatabase[targetCategory] || []);
    });
});

// 📍 監聽：點擊「太海」Logo 時觸發重新洗牌
if (logoBtn) {
    logoBtn.addEventListener('click', function() {
        loadRandomPhotos();
    });
}

// 9. 初始化載入隨機照片
loadRandomPhotos();