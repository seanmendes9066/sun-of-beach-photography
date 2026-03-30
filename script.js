// =========================================
// script.js (原汁原味路徑 + 靜默移除空圖版)
// =========================================

// 1. 完全遵照你原本的路徑規則 (包含空格與副檔名)
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

// 2. 嚴格對應你設定的大小寫
const photoDatabase = {
    people: generatePhotoList('people', 'people', 100, 'jpg'), 
    things: generatePhotoList('things', 'things', 100, 'JPG'), 
    place: generatePhotoList('place', 'place', 100, 'JPG')     
};

let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 3. 渲染邏輯：抓不到的圖會「徹底刪除節點」，不會留白洞
function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 

    photoArray.forEach((photo) => {
        const card = document.createElement('div');
        card.className = `gallery-item ${photo.category}`;
        
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `${photo.category} photography`;

        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        const titleText = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
        `;

        // 🚨 核心 Debug：如果 GitHub 回傳 404 (找不到這張照片)，直接把整個相框拔掉
        img.onerror = () => {
            card.remove(); 
        };
        
        // 載入成功才淡入顯示
        img.onload = () => { 
            img.style.opacity = 1; 
        };

        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = img.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 事件監聽：分類按鈕
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        
        if (target === null && this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        if (target === 'all') {
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            renderPhotos(photoDatabase[target]);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 事件監聽：Logo 點擊回首頁
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    renderPhotos(shuffleArray(allPhotosArray));
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 事件監聽：關閉燈箱
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        document.body.style.overflow = '';
    }
});

// 網頁初始啟動：載入全部並洗牌
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});