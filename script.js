// =========================================
// script.js (兩段式點擊：先預覽，再全螢幕)
// =========================================

let msnry;

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

    photoArray.forEach((photo) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        const img = document.createElement('img');
        img.src = photo.src;

        // 建立懸停漸層與文字區塊
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        const titleText = photo.category.charAt(0).toUpperCase() + photo.category.slice(1);
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
        `;

        img.onerror = () => {
            card.remove();
            initMasonry();
        };
        
        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry(); 
        };

        // 🌟 核心修改：兩段式點擊邏輯
        card.addEventListener('click', (e) => {
            // 如果這張照片還沒有處於預覽狀態 (preview-active)
            if (!card.classList.contains('preview-active')) {
                // 先把其他所有照片的預覽狀態清除，確保畫面上只有一張亮起
                document.querySelectorAll('.photo-card').forEach(item => {
                    item.classList.remove('preview-active');
                });
                // 給這張照片加上預覽狀態 (顯示文字)
                card.classList.add('preview-active');
            } else {
                // 如果已經處於預覽狀態，再點一下就會打開全畫面燈箱
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = photo.src;
                lightbox.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });

        card.appendChild(img);
        card.appendChild(overlay); // 把文字蓋上去
        gallery.appendChild(card);
    });
}

// 🌟 額外優化：點擊照片以外的空白處，取消所有的預覽狀態
document.addEventListener('click', (e) => {
    if (!e.target.closest('.photo-card') && !e.target.closest('.lightbox')) {
        document.querySelectorAll('.photo-card').forEach(item => {
            item.classList.remove('preview-active');
        });
    }
});

// 事件監聽
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        renderPhotos(photoDatabase[target]);
    });
});

document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    renderPhotos(shuffleArray(allPhotosArray));
});

document.getElementById('lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('show');
    document.body.style.overflow = '';
});

// 啟動：首頁展示全部照片
renderPhotos(shuffleArray(allPhotosArray));