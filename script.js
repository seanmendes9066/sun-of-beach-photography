let msnry;

function generatePhotoList(folderName, prefix, count, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix} (${i}).${ext}`);
    }
    return photoArray;
}

const photoDatabase = {
    people: generatePhotoList('People', 'people', 11, 'jpg'),
    // 📍 修正：對齊 GitHub 大寫路徑與大寫 .JPG
    things: generatePhotoList('Things', 'Things', 11, 'JPG'), 
    place: generatePhotoList('Place', 'Place', 11, 'JPG') 
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
        img.onerror = () => card.remove();
        img.onload = () => { img.style.opacity = 1; initMasonry(); };
        
        card.addEventListener('click', () => {
            document.getElementById('lightbox-img').src = src;
            document.getElementById('lightbox').classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        
        card.appendChild(img);
        gallery.appendChild(card);
    });
}

// 📍 首頁：隨機精選 5 張
function loadHome() {
    document.querySelectorAll('.filter-link').forEach(n => n.classList.remove('active'));
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
    document.body.style.overflow = '';
});

loadHome();