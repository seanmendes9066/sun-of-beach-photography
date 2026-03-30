document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // 綁定點擊事件至所有過濾標籤
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // 阻止任何可能的預設點擊行為
            event.preventDefault();

            // 1. 狀態更新：切換按鈕的 active 視覺狀態
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. 獲取過濾目標字串 (all, people, things, place)
            const filterValue = button.getAttribute('data-filter');

            // 3. 執行 DOM 過濾邏輯與 CSS 漸變狀態切換
            galleryItems.forEach(item => {
                // 已修正原本程式碼中 | | 的排版錯誤
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    // 顯示符合條件的項目
                    item.classList.remove('hidden');
                } else {
                    // 隱藏不符合條件的項目，觸發 CSS opacity 與 transform 動畫
                    item.classList.add('hidden');
                }
            });

            // 4. 平滑捲動觸發：呼叫原生 Window 介面 API
            // 此動作確保過濾後，使用者視覺焦點能完美歸位至畫廊頂部
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        });
    });
});