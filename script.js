// =========================================
// script.js (精確副檔名配對 + 展示全部照片版)
// =========================================

let msnry;

// 生成器：支援不同副檔名
function generatePhotoList(folderName, prefix, maxCount = 100, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

// 📍 關鍵修正區：根據你提供的網址設定正確的副檔名
const photoDatabase = {
    // people 分類是小寫 .jpg
    people: generatePhotoList('people', 'people', 100, 'jpg'),
    // things 分類是大寫 .JPG
    things: generatePhotoList('things', 'things', 100, 'JPG'),
    // place 分類是大寫 .JPG
    place: generatePhotoList('place', 'place', 100, 'JPG') 
};

// 合併所有照片用於首頁展示
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function initMasonry() {
    const gallery = document.getElementById('gallery');
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

function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    const sizer = gallery.querySelector('.grid-sizer');
    gallery.innerHTML = ''; 
    if (sizer) gallery.appendChild(sizer);

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML += '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;

        // 防呆：抓不到圖就移除格子，重新排版
        img.onerror = () => {
            card.remove();
            initMasonry();
        };
        
        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry(); 
        };

        // 點擊放大
        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// 事件監聽
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        // 展示該分類的「所有」照片
        renderPhotos(photoDatabase[target]);
    });
});

// Logo 點擊：展示「全部照片」隨機洗牌
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    renderPhotos(shuffleArray(allPhotosArray));
});

// 燈箱關閉
document.getElementById('lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('show');
    document.body.style.overflow = '';
});

// 啟動：首頁展示全部照片
renderPhotos(shuffleArray(allPhotosArray));