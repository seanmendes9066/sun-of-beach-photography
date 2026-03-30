// =========================================
// script.js (藝廊隨機洗牌 + Section切換 + 自動置頂版)
// =========================================

function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('people', 'people', 11),
    things: generatePhotoList('Things', 'things', 3), 
    place: generatePhotoList('Place', 'place', 1) 
};

const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

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

const galleryContainer = document.getElementById('gallery');
const filterLinks = document.querySelectorAll('.filter-link');
const aboutLink = document.querySelector('a[target-page="about-section"]');
const logoBtn = document.getElementById('logo-btn'); 

const allSections = document.querySelectorAll('.section-container, #frontpage');

let msnry;

function initMasonry() {
    if (!galleryContainer) return;
    imagesLoaded(galleryContainer, function() {
        if (msnry) msnry.destroy(); 
        msnry = new Masonry(galleryContainer, {
            itemSelector: '.photo-card', 
            columnWidth: '.grid-sizer', 
            percentPosition: true, 
            transitionDuration: '0.4s', 
            gutter: 0 
        });
    });
}

function renderPhotos(photoArray) {
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); 

    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p class="quote" style="grid-column: 1/-1; text-align:center;">尚無照片內容。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card'; 

        const img = document.createElement('img');
        img.src = src;

        card.appendChild(img);
        galleryContainer.appendChild(card);

        img.onload = () => { img.style.opacity = 1; };
    });

    initMasonry();
}

function switchToSection(targetSectionId) {
    allSections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('section-hidden');
    });

    const target = document.getElementById(targetSectionId);
    if (target) {
        target.classList.remove('section-hidden');
        target.classList.add('active-section');
    }

    if (targetSectionId === 'gallery-section') {
        initMasonry();
    }
}

function loadRandomPhotosAndShowGallery() {
    switchToSection('frontpage');
    filterLinks.forEach(nav => nav.classList.remove('active'));
    if(aboutLink) aboutLink.classList.remove('active'); 

    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    renderPhotos(shuffledPhotos);
}

// ============================================================
// 📍 事件監聽與「自動置頂」邏輯
// ============================================================

// 1. 監聽：點擊分類選單
filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // 防止預設跳轉

        filterLinks.forEach(nav => nav.classList.remove('active'));
        if(aboutLink) aboutLink.classList.remove('active'); 
        this.classList.add('active');

        const targetPage = this.getAttribute('target-page');
        switchToSection(targetPage); 

        if (targetPage === 'gallery-section') {
            const targetCategory = this.getAttribute('data-target');
            renderPhotos(photoDatabase[targetCategory]);
        }

        // 📍 關鍵新增：每次切換分類，平滑滾動到網頁最上方
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 2. 監聽：點擊 About Me
if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
        e.preventDefault(); 
        filterLinks.forEach(nav => nav.classList.remove('active')); 
        this.classList.add('active');
        switchToSection('about-section');

        // 📍 關鍵新增：切換到 About Me 時，也平滑滾動到最上方
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 3. 監聽：點擊 Logo 按鈕
if (logoBtn) {
    logoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loadRandomPhotosAndShowGallery();

        // 📍 關鍵新增：點擊 Logo 回首頁時，平滑滾動到最上方
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 初始化載入
loadRandomPhotosAndShowGallery();