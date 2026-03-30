// =========================================
// script.js (智能副檔名切換 + 自動置頂)
// =========================================

// 1. 生成路徑 (加入 ext 參數，預設小寫 .jpg)
function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

// 📍 2. 資料庫 (根據你的網址精確設定大小寫)
const photoDatabase = {
    // people 是小寫 .jpg
    people: generatePhotoList('people', 'people', 30, 'jpg'),
    // things 根據你給的網址是大寫 .JPG
    things: generatePhotoList('things', 'things', 30, 'JPG'),
    // place 根據你給的網址是大寫 .JPG
    place: generatePhotoList('place', 'place', 30, 'JPG') 
};

const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const galleryContainer = document.getElementById('gallery');
const filterLinks = document.querySelectorAll('.filter-link');
const logoBtn = document.getElementById('logo-btn'); 
const aboutBtn = document.getElementById('about-btn');
const aboutSection = document.getElementById('about-section');
const gallerySection = document.getElementById('gallery-section');
const frontpageSection = document.getElementById('frontpage');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

let msnry;

function initMasonry() {
    if (!galleryContainer) return;
    imagesLoaded(galleryContainer, function() {
        if (msnry) msnry.destroy(); 
        msnry = new Masonry(galleryContainer, {
            itemSelector: '.photo-card', 
            columnWidth: '.grid-sizer', 
            percentPosition: true, 
            transitionDuration: '0.4s'
        });
    });
}

// 3. 渲染照片
function renderPhotos(photoArray) {
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); 

    if (!photoArray || photoArray.length === 0) return;

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card'; 

        const img = document.createElement('img');
        img.src = src;

        // 📍 終極防爆機制：小寫找不到找大寫，大寫找不到才刪除
        img.onerror = function() {
            if (!this.dataset.retried) {
                this.dataset.retried = "true";
                if (this.src.endsWith('.jpg')) {
                    this.src = this.src.replace('.jpg', '.JPG');
                } else if (this.src.endsWith('.JPG')) {
                    this.src = this.src.replace('.JPG', '.jpg');
                }
            } else {
                card.remove(); 
                initMasonry();
            }
        };

        // 聚光燈功能 (Requirement)
        card.addEventListener('click', () => {
            lightboxImg.src = this.querySelector('img').src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden'; 
        });

        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry();
        };

        card.appendChild(img);
        galleryContainer.appendChild(card);
    });
}

function loadHome() {
    gallerySection.style.display = 'block';
    aboutSection.style.display = 'none';
    frontpageSection.style.display = 'flex';
    filterLinks.forEach(nav => nav.classList.remove('active'));
    aboutBtn.classList.remove('active');
    
    // 首頁展示全部照片洗牌
    renderPhotos(shuffleArray(allPhotosArray));
}

// 📍 事件監聽與置頂 (Requirement 2)
filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 顯示藝廊，隱藏自我介紹
        gallerySection.style.display = 'block';
        aboutSection.style.display = 'none';
        frontpageSection.style.display = 'flex';

        filterLinks.forEach(nav => nav.classList.remove('active'));
        aboutBtn.classList.remove('active');
        this.classList.add('active');

        // 📍 置頂到照片第一排 (扣除導覽列高度)
        const offsetTop = gallerySection.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });

        const targetCategory = this.getAttribute('data-target');
        renderPhotos(photoDatabase[targetCategory] || []);
    });
});

if (aboutBtn) {
    aboutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        gallerySection.style.display = 'none';
        frontpageSection.style.display = 'none';
        aboutSection.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (logoBtn) {
    logoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadHome();
    });
}

// 關閉燈箱
lightbox.addEventListener('click', function(e) {
    if (e.target !== lightboxImg) {
        lightbox.classList.remove('show');
        document.body.style.overflow = ''; 
    }
});
document.querySelector('.close-btn').addEventListener('click', () => {
    lightbox.classList.remove('show');
    document.body.style.overflow = ''; 
});

// 初始化
loadHome();