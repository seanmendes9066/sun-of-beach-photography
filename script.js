// 1. 自動生成照片網址的機器
// 參數說明： folderName (子資料夾名稱), prefix (照片檔名前綴), count (照片總數)
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    for (let i = 1; i <= count; i++) {
        // 根據你的要求，根目錄固定為 images
        photoArray.push(`./images/${folderName}/${prefix}-${i}.jpg`);
    }
    return photoArray;
}

// 2. 你的個人專屬影像資料庫
// 你未來只要在這裡改最後面的「數字」，網頁就會自動幫你畫出對應數量的格子！
const photoDatabase = {
    // 假設你在 images/latest/ 資料夾放了 4 張連號照片 (latest-1.jpg ~ latest-4.jpg)
    latest: generatePhotoList('latest', 'latest', 4),

    // 假設你在 images/perthLife/ 資料夾放了 4 張連號照片 (perth-1.jpg ~ perth-4.jpg)
    perthLife: generatePhotoList('perthLife', 'perth', 4),

    // 假設你在 images/automotive/ 資料夾放了 4 張連號照片 (auto-1.jpg ~ auto-4.jpg)
    automotive: generatePhotoList('automotive', 'auto', 4),
    
    // 假設你在 images/fitness/ 資料夾放了 4 張連號照片 (fit-1.jpg ~ fit-4.jpg)
    fitness: generatePhotoList('fitness', 'fit', 4)
};

// 3. 取得網頁元素
const navLinks = document.querySelectorAll('#category-nav a');
const galleryContainer = document.getElementById('gallery');

// 4. 定義「渲染照片」的動作
function renderPhotos(category) {
    // 先把畫廊清空
    galleryContainer.innerHTML = ''; 
    const photos = photoDatabase[category];

    // 利用迴圈，自動把照片一張一張塞進畫廊裡
    photos.forEach((src) => {
        // 創造一個格子 <div class="photo-card">
        const card = document.createElement('div');
        card.className = 'photo-card';

        // 創造一張圖片 <img>
        const img = document.createElement('img');
        img.src = src;

        // 把圖片放進格子，再把格子放進畫廊
        card.appendChild(img);
        galleryContainer.appendChild(card);

        // 圖片載入完成後，執行淡入特效 (透明度變成 1)
        img.onload = () => {
            img.style.opacity = 1;
        };
    });
}

// 5. 點擊分類選單的切換邏輯
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        // 切換按鈕的白色發光狀態
        navLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 讀取點擊的分類，並呼叫渲染函數重新畫圖
        const targetCategory = this.getAttribute('data-target');
        renderPhotos(targetCategory);
    });
});

// 6. 網頁一打開時，預設先載入 'latest' 分類的照片
renderPhotos('latest');
