// =========================================
// script.js (全小寫對齊 + 智能防爆 + 自動置頂版)
// =========================================

// 1. 自動生成照片網址 (完全對齊你設定的「全小寫」)
function generatePhotoList(folderName, prefix, count) {
    let photoArray = [];
    if (count <= 0) return photoArray; 
    for (let i = 1; i <= count; i++) {
        // 📍 預設尋找全小寫路徑
        photoArray.push(`./images/${folderName}/${prefix} (${i}).jpg`);
    }
    return photoArray;
}

// 2. 定義資料庫 (張數我幫你設多一點，找不到的會自動過濾)
const photoDatabase = {
    // 📍 資料夾與檔名前綴全部設定為小寫
    people: generatePhotoList('people', 'people', 15),
    things: generatePhotoList('things', 'things', 15), 
    place: generatePhotoList('place', 'place', 15) 
};

// 合併所有照片用於首頁全展示
const allPhotosArray = [
    ...photoDatabase.people,
    ...photoDatabase.things,
    ...photoDatabase.place
];

// 3. 洗牌演算法
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 取得網頁元素
const filterLinks = document.querySelectorAll('.filter-link');
const galleryContainer = document.getElementById('gallery');
const logoBtn = document.getElementById('logo-btn'); 

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

// 4. 渲染照片 (加入智能偵測)
function renderPhotos(photoArray) {
    const sizer = galleryContainer.querySelector('.grid-sizer');
    galleryContainer.innerHTML = ''; 
    if (sizer) galleryContainer.appendChild(sizer); 

    if (!photoArray || photoArray.length === 0) {
        galleryContainer.innerHTML += '<p class="quote" style="grid-column: 1/-1; text-align:center;">資料夾中尚無照片。</p>';
        return;
    }

    photoArray.forEach((src) => {
        const card = document.createElement('div');
        card.className = 'photo-card'; 

        const img = document.createElement('img');
        img.src = src;

        // 📍 終極智能防爆機制：處理 .jpg 與 .JPG 的混亂
        img.onerror = function() {
            // 如果小寫 .jpg 找不到，程式自動換成大寫 .JPG 試試看
            if (this.src.endsWith('.jpg')) {
                this.src = this.src.replace('.jpg', '.JPG');
            } 
            // 如果連大寫 .JPG 都找不到，代表真的沒這張照片，才安全移除格子
            else if (this.src.endsWith('.JPG')) {
                card.remove(); 
                initMasonry(); // 移除後重新排版
            }
        };

        // 圖片成功載入後淡入顯示
        img.onload = () => { 
            img.style.opacity = 1; 
            initMasonry(); 
        };

        card.appendChild(img);
        galleryContainer.appendChild(card);
    });
}

// 5. 首頁載入全部照片
function loadRandomPhotos() {
    filterLinks.forEach(nav => nav.classList.remove('active'));
    const shuffledPhotos = shuffleArray([...allPhotosArray]); 
    renderPhotos(shuffledPhotos);
}

// 6. 監聽：點擊分類選單
filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // 防止預設跳轉
        filterLinks.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // 📍 滿足 Requirement 2: 每次切換分類，平滑滾動到網頁最上方照片第一排
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        const targetCategory = this.getAttribute('data-target');
        renderPhotos(photoDatabase[targetCategory] || []);
    });
});

// 7. 監聽：點擊「太海」Logo 按鈕時
if (logoBtn) {
    logoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 點擊 Logo 回首頁時，也平滑滾動到最上方
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        loadRandomPhotos();
    });
}

// 初始化載入
loadRandomPhotos();