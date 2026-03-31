// =========================================
// script.js (動態載入與 Grid 排版)
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
        gallery.innerHTML = '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">尚未發現照片。</p>';
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

        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = photo.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 事件監聽：過濾按鈕
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        const target = this.getAttribute('data-target');
        if (!target) return; 

        if (target === 'all') {
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            renderPhotos(photoDatabase[target]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 📍 Logo 點擊邏輯：回到首頁並將底線強制跳回 "ALL WORKS"
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    
    // 重新渲染全部照片並洗牌
    renderPhotos(shuffleArray(allPhotosArray));
    
    // 將所有按鈕取消 active，並強制把 active 加給 "ALL WORKS" (data-target="all")
    document.querySelectorAll('.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    
    // 平滑回到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 燈箱關閉邏輯
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        document.body.style.overflow = '';
    }
});

// 網頁初始啟動：首頁展示全部照片
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});