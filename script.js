/* --- 0. 載入 Google 字體 --- */
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap');

/* --- 1. 基礎設定 --- */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    scroll-behavior: smooth; /* 點擊 Logo 回首頁時會平滑捲動 */
}

body {
    background-color: #ffffff; 
    color: #111111; 
    line-height: 1.8;
}

/* --- 2. 導覽列 --- */
nav {
    display: flex;
    justify-content: flex-start; 
    align-items: center; 
    padding: 30px 40px;
    background-color: rgba(255, 255, 255, 0.98);
    position: sticky;
    top: 0;
    z-index: 100;
}

/* --- 📍 3. 「太海」Logo 與紅色筆刷 --- */
.logo-link {
    text-decoration: none;
    margin-right: 50px; 
}

.logo {
    font-family: 'Special Elite', cursive; 
    color: #111111;
    font-size: 2rem; 
    font-weight: normal; 
    letter-spacing: 4px; 
    position: relative; /* 為了讓紅色筆刷可以對齊 */
    display: inline-block;
    z-index: 2;
}

/* 用 CSS 畫出來的不規則紅色筆刷 */
.logo::after {
    content: '';
    position: absolute;
    bottom: 2px; /* 筆刷高度 */
    left: -5px; /* 稍微往左凸出去一點比較隨性 */
    width: calc(100% + 10px);
    height: 12px; /* 筆刷粗細 */
    background-color: #d32f2f; /* 經典印章紅 */
    /* 創造不規則的邊緣，像真的筆刷 */
    border-radius: 5px 15px 5px 20px / 10px 5px 15px 5px; 
    z-index: -1; /* 墊在文字正下方 */
    transform: rotate(-3deg); /* 微微傾斜更有藝術感 */
}

/* --- 4. 選單按鈕 --- */
.nav-menu {
    list-style: none;
    display: flex;
    gap: 35px; 
    flex-wrap: wrap;
}

.nav-menu a {
    font-family: 'Courier Prime', monospace;
    color: #888888;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 700; 
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.3s ease;
    padding-bottom: 5px;
}

.nav-menu a:hover, .nav-menu a.active {
    color: #111111;
}

.nav-menu a.filter-link.active {
    border-bottom: 2px solid #111111;
}

/* --- 📍 5. 滿版首頁 (Frontpage) --- */
#frontpage {
    height: 100vh; /* 滿版視窗高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    /* 為了扣掉上方導覽列的高度，讓文字完美置中 */
    margin-top: -95px; 
}

.hero-content h1 {
    font-size: 4rem; /* 標題超級放大 */
    font-weight: 800;
    letter-spacing: 8px;
    text-transform: uppercase;
    margin-bottom: 20px;
    color: #111111;
}

.hero-content p {
    color: #777777;
    font-size: 1.2rem;
    letter-spacing: 4px;
    text-transform: uppercase;
}

/* --- 6. 照片網格 --- */
#gallery-section {
    padding: 20px 20px 100px;
    max-width: 1200px;
    margin: 0 auto;
}

.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr; 
    gap: 15px; 
}

.photo-card {
    position: relative;
    overflow: hidden;
    background-color: #f9f9f9; 
    aspect-ratio: 1;
}

.photo-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: transform 0.8s ease, opacity 0.6s ease;
}

.photo-card:hover img {
    transform: scale(1.03);
}

/* --- 7. About Me 故事區 --- */
#about {
    background-color: #fdfdfd; 
    padding: 120px 20px;
    text-align: center;
}

.about-content {
    max-width: 650px; 
    margin: 0 auto;
}

.about-content h2 {
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 10px;
}

.subtitle {
    color: #999999;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 5px;
    margin-bottom: 50px;
}

.main-text {
    color: #333333;
    font-size: 1.05rem;
    margin-bottom: 25px;
    text-align: justify; 
}

.divider {
    width: 40px;
    border: 0;
    border-top: 2px solid #111111;
    margin: 50px auto;
}

.quote {
    font-family: 'Georgia', 'Times New Roman', serif; 
    font-style: italic;
    color: #555555;
    font-size: 1.3rem;
    line-height: 1.8;
}

/* --- 8. 頁尾 --- */
footer {
    text-align: center;
    padding: 40px;
    color: #bbbbbb;
    font-size: 0.75rem;
    letter-spacing: 2px;
    text-transform: uppercase;
}