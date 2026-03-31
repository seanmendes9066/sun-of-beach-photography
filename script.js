// =========================================
// script.js (乾淨 Grid 渲染 + 標題動態隱藏)
// =========================================

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

function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; 

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; grid-column: 1/-1; color: #888;">尚未發現照片。</p>';
        return;
    }

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

        img.onerror = () => { card.remove(); };
        img.onload = () => { img.style.opacity = 1; };

        // 兩段式點擊邏輯
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('preview-active')) {
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.classList.remove('preview-active');
                });
                card.classList.add('preview-active');
            } else {
                const lightbox = document.getElementById('lightbox');
                const lightboxImg = document.getElementById('lightbox-img');
                lightboxImg.src = photo.src;
                lightbox.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });

        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 點擊空白處取消預覽狀態
document.addEventListener('click', (e) => {
    if (!e.target.closest('.gallery-item') && !e.target.closest('.lightbox')) {
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.remove('preview-active');
        });
    }
});

// 過濾按鈕 (🚨 加入動態隱藏標題邏輯)
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        if (this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (this.getAttribute('target') === '_blank') return;

        e.preventDefault();
        
        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        const target = this.getAttribute('data-target');
        if (!target) return; 

        const frontpage = document.getElementById('frontpage');

        if (target === 'all') {
            // 點擊 ALL WORKS：顯示大標題
            frontpage.classList.remove('hide');
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            // 點擊特定分類：隱藏大標題，讓畫廊貼齊頂部
            frontpage.classList.add('hide');
            renderPhotos(photoDatabase[target]);
        }

        // 滾動到最上方 (隱藏標題後，最上方就是照片排)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Logo 點擊回到首頁 (🚨 加入恢復標題邏輯)
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    
    // 點擊 Logo 恢復大標題
    document.getElementById('frontpage').classList.remove('hide');
    
    renderPhotos(shuffleArray(allPhotosArray));
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 燈箱關閉
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        document.body.style.overflow = '';
    }
});

// 啟動渲染
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});

// =========================================
// 防護罩：防右鍵、防拖曳、防偷看原始碼
// =========================================
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
document.addEventListener('dragstart', function(e) { if (e.target.tagName.toLowerCase() === 'img') e.preventDefault(); });
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) e.preventDefault();
});