let msnry;

function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = 1; i <= count; i++) {
        // 📍 這裡幫你處理了大小寫問題與空格
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('People', 'people', 11, 'jpg'),
    // 📍 修正點： prefix 改成大寫 'Things'，ext 改成大寫 'JPG'
    // 這裡設為 11 是為了確保能抓到你最新的 Things (11).JPG
    things: generatePhotoList('Things', 'Things', 11, 'JPG'), 
    place: generatePhotoList('Place', 'place', 5, 'jpg') 
};

let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

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

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        const img = document.createElement('img');
        img.src = src;
        // 📍 如果圖片載入失敗，就隱藏它，不會留下空白格子
        img.onerror = () => card.remove(); 
        img.onload = () => { img.style.opacity = 1; initMasonry(); };
        card.appendChild(img);
        gallery.appendChild(card);
    });
}

document.querySelectorAll('.filter-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        renderPhotos(photoDatabase[this.getAttribute('data-target')] || []);
    });
});

document.getElementById('logo-btn').addEventListener('click', () => renderPhotos(allPhotosArray));

// 初始化
renderPhotos(allPhotosArray);