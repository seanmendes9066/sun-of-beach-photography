let msnry;

// 生成器：支援自定義前綴、張數、起始編號與副檔名
function generatePhotoList(folderName, prefix, count, start = 1, ext = 'jpg') {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = start; i < start + count; i++) {
        // 📍 對齊 GitHub：People 使用小寫 jpg，Things 使用大寫 JPG
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('People', 'people', 11, 1, 'jpg'),
    // 📍 修正點：根據你的網址，Things 要大寫 T，副檔名要大寫 JPG
    // 如果你只有一張 (11)，就設 count=1, start=11。如果你想抓 1-11 張，就如下設定：
    things: generatePhotoList('Things', 'Things', 11, 1, 'JPG'), 
    place: generatePhotoList('Place', 'place', 1, 1, 'jpg') 
};

// 合併所有可用照片
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

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
    gallery.appendChild(sizer);

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML += '<p style="text-align:center; padding: 50px; width: 100%; color: #888;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;
        // 防呆：如果圖片路徑不存在，就移除格子
        img.onerror = () => card.remove(); 
        img.onload = () => { img.style.opacity = 1; initMasonry(); };
        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// 📍 首頁邏輯：隨機挑選 5 張
function loadHome() {
    document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
    const shuffled = shuffleArray([...allPhotosArray]);
    renderPhotos(shuffled.slice(0, 5));
}

// 事件監聽
document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        const target = this.getAttribute('data-target');
        renderPhotos(photoDatabase[target] || []);
    });
});

document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault(); // 防止網頁跳轉
    loadHome();
});

// 啟動
loadHome();