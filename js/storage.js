// Storage Manager - Quản lý localStorage
const StorageManager = {
    STORAGE_KEY: 'presentation_app_data',

    // Lưu toàn bộ dữ liệu
    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    // Load toàn bộ dữ liệu
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    },

    // Lưu trang cụ thể
    savePage(pageId, pageData) {
        const data = this.load() || { pages: {}, currentPage: pageId };
        data.pages[pageId] = pageData;
        return this.save(data);
    },

    // Load trang cụ thể
    loadPage(pageId) {
        const data = this.load();
        return data && data.pages[pageId] ? data.pages[pageId] : null;
    },

    // Lưu currentPage
    saveCurrentPage(pageId) {
        const data = this.load() || { pages: {}, currentPage: pageId };
        data.currentPage = pageId;
        return this.save(data);
    },

    // Load currentPage
    loadCurrentPage() {
        const data = this.load();
        return data ? data.currentPage : null;
    },

    // Load tất cả pages
    loadAllPages() {
        const data = this.load();
        return data ? data.pages : {};
    },

    // Xóa trang
    deletePage(pageId) {
        const data = this.load();
        if (data && data.pages[pageId]) {
            delete data.pages[pageId];
            return this.save(data);
        }
        return false;
    },

    // Clear tất cả
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};
