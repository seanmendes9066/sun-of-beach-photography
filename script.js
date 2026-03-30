let msnry;

// 生成機器：支援大寫副檔名與正確空格
function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        //例如：./images/Things/Things (1).JPG
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('people', 'people', 11, 'jpg'), //
    // 📍 修正：對齊 GitHub 大寫路徑與 .JPG，張數設為 11 確保抓到 Things (11)
    things: generatePhotoList('Things', 'Things', 11, 'JPG'), 
    // 📍 按照 Things 邏輯設定 Place
    place: generatePhotoList('Place', 'Place', 5, 'JPG') 
};

let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[arr.length - 1]] = [arr[arr.length - 1], arr[i]];
    }
    return arr;
}

function initMasonry() {
    const gallery = document.getElementById('gallery');
    imagesLoaded(gallery, function() {
        if (msnry) msnry.destroy();
        msnry = new Masonry(gallery, { itemSelector: '.photo-card', columnWidth: '.grid-sizer', percentPosition: true });
    });
}

function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    const sizer = gallery.querySelector('.grid-sizer');
    gallery.innerHTML = ''; 
    gallery.appendChild(sizer);

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;
        img.onerror = () => card.remove(); // 抓不到圖就隱藏
        img.onload = () => { img.style.opacity = 1; initMasonry(); };
        // 📍 點擊放大邏輯
        card.addEventListener('click', () => {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.add('show');
        });
        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// 📍 首頁：隨機挑選 5 張
function loadHome() {
    renderPhotos(shuffleArray(allPhotosArray).slice(0, 5));
}

document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        renderPhotos(photoDatabase[this.getAttribute('data-target')] || []);
    });
});

document.getElementById('logo-btn').addEventListener('click', (e) => { e.preventDefault(); loadHome(); });
document.getElementById('lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').classList.remove('show');
});

loadHome();