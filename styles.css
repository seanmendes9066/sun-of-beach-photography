// 1. 自動生成照片網址的機器
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        photoArray.push(`./images/${folderName}/${prefix}-${i}.jpg`);
    }
    return photoArray;
}

// 2. 你的新版影像資料庫 (對應 People / Things / Place)
const photoDatabase = {
    // 假設你在 images/people/ 資料夾放了 4 張連號照片 (people-1.jpg ~ people-4.jpg)
    people: generatePhotoList('people', 'people', 4),

    // 假設你在 images/things/ 資料夾放了 4 張連號照片 (things-1.jpg ~ things-4.jpg)
    things: generatePhotoList('things', 'things', 4),

    // 假設你在 images/place/ 資料夾放了 4 張連號照片 (place-1.jpg ~ place-4.jpg)
    place: generatePhotoList('place', 'place', 4)
};

// 3. 取得網頁元素 (這次只抓取帶有 filter-link 的按鈕)
const filterLinks = document.querySelectorAll('.filter-link');
const galleryContainer = document.getElementById('gallery');

// 4. 定義「渲染照片」的動作
function renderPhotos(category) {
    galleryContainer.innerHTML = ''; 
    const photos = photoDatabase[category];

    photos.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const img = document.createElement('img');
        img.src = src;

        card.appendChild(img);
        galleryContainer.appendChild(card);

        img.onload = () => {
            img.style.opacity = 1;
        };
    });
}

// 5. 點擊照片分類選單的切換邏輯
filterLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的黑體發光狀態
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 讀取點擊的分類，並呼叫渲染函數重新畫圖
        const targetCategory = this.getAttribute('data-target');
        renderPhotos(targetCategory);
    });
});

// 6. 網頁一打開時，預設先載入 'people' 分類的照片
renderPhotos('people');
