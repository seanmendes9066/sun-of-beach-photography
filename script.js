// =========================================
// script.js (結合 Premium UI 結構與動態加載邏輯)
// =========================================

// 生成器：支援不同副檔名
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

// 照片資料庫
const photoDatabase = {
    people: generatePhotoList('people', 'people', 100, 'jpg'),
    things: generatePhotoList('things', 'things', 100, 'JPG'),
    place: generatePhotoList('place', 'place', 100, 'JPG') 
};

// 合併所有照片
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 渲染照片邏輯 (結合新版的 HTML 結構)
function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; padding: 50px; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((photo) => {
        // 創建外層容器
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        
        // 創建圖片
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `${photo.category} photography`;

        // 創建懸停漸層與文字區塊
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        
        // 根據分類給予優雅的標題
        const titleText = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
        `;

        // 防呆：圖片讀取失敗時自動移除該格子，保持版面整潔
        img.onerror = () => {
            card.remove();
        };
        
        // 讀取成功時淡入顯示
        img.onload = () => { 
            img.style.opacity = 1; 
        };

        // 點擊觸發燈箱
        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = photo.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        // 組裝 DOM
        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 導覽列過濾與事件監聽
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = this.getAttribute('data-target');
        
        // 處理 About 錨點跳轉
        if (target === null && this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // 狀態更新：切換 active 視覺
        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        // 動態渲染對應照片
        if (target === 'all') {
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            renderPhotos(