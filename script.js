// =========================================
// script.js (神人級藝廊隨機展示版)
// =========================================

// 1. 自動生成照片網址的機器 
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 
const photoDatabase = {
    people: generatePhotoList('people', 'people', 11),
    things: generatePhotoList('things', 'things', 3),
    place: generatePhotoList('place', 'place', 1) 
};

// 3. 合併所有照片 
const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

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
        renderPhotos(photoDatabase[targetCategory]);
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