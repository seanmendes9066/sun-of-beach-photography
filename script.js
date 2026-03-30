// =========================================
// script.js (原汁原味路徑 + 完美結合高階網格版)
// =========================================

// 1. 生成器：支援不同副檔名
// 【重要升級】因為新版需要懸停標題，我們將陣列改為存「物件」，同時記錄路徑與分類
function generatePhotoList(folderName, prefix, maxCount = 100, ext = 'jpg') {
    let photoArray = [];
    for (let i = 1; i <= maxCount; i++) {
        photoArray.push({
            src: `./images/${folderName}/${prefix} (${i}).${ext}`, // 100% 保留你原有的路徑邏輯與空格
            category: folderName
        });
    }
    return photoArray;
}

// 2. 照片資料庫：完全依照你的大小寫設定
const photoDatabase = {
    // people 分類是小寫 .jpg
    people: generatePhotoList('people', 'people', 100, 'jpg'),
    // things 分類是大寫 .JPG
    things: generatePhotoList('things', 'things', 100, 'JPG'),
    // place 分類是大寫 .JPG
    place: generatePhotoList('place', 'place', 100, 'JPG') 
};

// 合併所有照片用於首頁展示
let allPhotosArray = [...photoDatabase.people, ...photoDatabase.things, ...photoDatabase.place];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// 3. 核心渲染邏輯 (對接新版 HTML 結構，移除 Masonry)
function renderPhotos(photoArray) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // 清空畫廊

    if (!photoArray || photoArray.length === 0) {
        gallery.innerHTML = '<p style="text-align:center; grid-column: 1 / -1; padding: 50px; color: #888;">尚未發現照片。</p>';
        return;
    }

    photoArray.forEach((item) => {
        // 建立相框容器
        const card = document.createElement('div');
        card.className = `gallery-item ${item.category}`;

        // 建立圖片
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.category;

        // 建立懸停漸層與標題資訊
        const overlay = document.createElement('div');
        overlay.className = 'item-overlay';
        const titleText = item.category.charAt(0).toUpperCase() + item.category.slice(1); // 首字母大寫
        overlay.innerHTML = `
            <h3>${titleText}</h3>
            <p>Collection / ${titleText}</p>
        `;

        // 🚨 防呆機制：抓不到圖就直接移除相框節點，不留痕跡
        img.onerror = () => {
            card.remove(); 
        };
        
        // 載入成功才淡入顯示
        img.onload = () => { 
            img.style.opacity = 1; 
        };

        // 點擊觸發燈箱
        card.addEventListener('click', () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            lightboxImg.src = item.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        // 組裝 DOM
        card.appendChild(img);
        card.appendChild(overlay);
        gallery.appendChild(card);
    });
}

// 4. 事件監聽：導覽列按鈕 (只選取 button，避免干擾 IG 聯絡連結)
document.querySelectorAll('button.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 處理 About Me 滑動
        if (this.id === 'about-btn') {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const target = this.getAttribute('data-target');
        if (!target) return;

        // 切換按鈕 active 狀態
        document.querySelectorAll('button.filter-btn').forEach(n => n.classList.remove('active'));
        this.classList.add('active');
        
        // 過濾渲染
        if (target === 'all') {
            renderPhotos(shuffleArray(allPhotosArray));
        } else {
            renderPhotos(photoDatabase[target]);
        }

        // 過濾後平滑捲動回頂部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// 5. Logo 點擊：展示「全部照片」隨機洗牌
document.getElementById('logo-btn').addEventListener('click', (e) => {
    e.preventDefault();
    // 重設按鈕狀態
    document.querySelectorAll('button.filter-btn').forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="all"]').classList.add('active');
    
    // 渲染並回到頂部
    renderPhotos(shuffleArray(allPhotosArray));
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 6. 燈箱關閉
document.getElementById('lightbox').addEventListener('click', (e) => {
    // 點擊圖片以外的地方才關閉
    if (e.target !== document.getElementById('lightbox-img')) {
        document.getElementById('lightbox').classList.remove('show');
        document.body.style.overflow = '';
    }
});

// 7. 啟動：首頁展示全部照片並洗牌
document.addEventListener('DOMContentLoaded', () => {
    renderPhotos(shuffleArray(allPhotosArray));
});