// Page Manager - Quản lý nhiều trang
const PageManager = {
    pages: {},
    currentPageId: null,

    // Khởi tạo
    init() {
        this.loadFromStorage();
        if (Object.keys(this.pages).length === 0) {
            this.createPage('page_1');
        }
        const savedCurrentPage = StorageManager.loadCurrentPage();
        if (savedCurrentPage && this.pages[savedCurrentPage]) {
            this.currentPageId = savedCurrentPage;
        } else {
            this.currentPageId = Object.keys(this.pages)[0];
        }
        this.renderCurrentPage();
    },

    // Tạo trang mới
    createPage(pageId) {
        if (!pageId) {
            const pageNum = Object.keys(this.pages).length + 1;
            pageId = `page_${pageNum}`;
        }

        this.pages[pageId] = {
            objects: [],
            script: [],
            background: {
                color: '#f5f5f5',
                imageUrl: '',
                imageRepeat: 'no-repeat',
                imageSize: 'cover'
            }
        };

        StorageManager.savePage(pageId, this.pages[pageId]);
        return pageId;
    },

    // Chuyển đến trang
    goToPage(pageId) {
        if (!this.pages[pageId]) return false;

        // Lưu trang hiện tại trước khi chuyển
        this.saveCurrentPage();

        this.currentPageId = pageId;
        StorageManager.saveCurrentPage(pageId);
        this.renderCurrentPage();
        this.updatePageInfo();
        return true;
    },

    // Trang trước
    prevPage() {
        const pageIds = Object.keys(this.pages).sort();
        const currentIndex = pageIds.indexOf(this.currentPageId);
        if (currentIndex > 0) {
            this.goToPage(pageIds[currentIndex - 1]);
        }
    },

    // Trang sau
    nextPage() {
        const pageIds = Object.keys(this.pages).sort();
        const currentIndex = pageIds.indexOf(this.currentPageId);
        if (currentIndex < pageIds.length - 1) {
            this.goToPage(pageIds[currentIndex + 1]);
        }
    },

    // Render trang hiện tại
    renderCurrentPage() {
        const page = this.pages[this.currentPageId];
        if (!page) return;

        const $canvas = $('#canvas');
        $canvas.empty();

        // Apply background
        this.applyBackground(page.background);

        // Load objects
        ObjectManager.loadObjects(page.objects, $canvas);

        // Load script
        ScriptRunner.loadScript(page.script);

        // Kiểm tra và ẩn các objects cần ẩn mặc định
        ScriptRunner.initializeObjectVisibility(page.script);
    },

    // Áp dụng background cho canvas
    applyBackground(background) {
        if (!background) {
            background = {
                color: '#f5f5f5',
                imageUrl: '',
                imageRepeat: 'no-repeat',
                imageSize: 'cover'
            };
        }

        const $canvas = $('#canvas');
        let cssBackground = background.color || '#f5f5f5';

        if (background.imageUrl && background.imageUrl.trim() !== '') {
            const imageSize = background.imageSize || 'cover';
            const imageRepeat = background.imageRepeat || 'no-repeat';
            cssBackground = `${cssBackground} url('${background.imageUrl}') ${imageRepeat}`;
            $canvas.css({
                'background-color': background.color || '#f5f5f5',
                'background-image': `url('${background.imageUrl}')`,
                'background-repeat': imageRepeat,
                'background-size': imageSize,
                'background-position': 'center'
            });
        } else {
            $canvas.css({
                'background-color': cssBackground,
                'background-image': 'none',
                'background-repeat': 'no-repeat',
                'background-size': 'cover',
                'background-position': 'center'
            });
        }
    },

    // Lưu trang hiện tại
    saveCurrentPage() {
        if (!this.currentPageId) return;

        const pageData = {
            objects: ObjectManager.exportObjects(),
            script: ScriptRunner.currentScript,
            background: this.pages[this.currentPageId].background || {
                color: '#f5f5f5',
                imageUrl: '',
                imageRepeat: 'no-repeat',
                imageSize: 'cover'
            }
        };

        this.pages[this.currentPageId] = pageData;
        StorageManager.savePage(this.currentPageId, pageData);
    },

    // Cập nhật thông tin trang
    updatePageInfo() {
        const pageIds = Object.keys(this.pages).sort();
        const currentIndex = pageIds.indexOf(this.currentPageId) + 1;
        const totalPages = pageIds.length;
        const pageText = LanguageManager.t('page');
        const ofText = LanguageManager.t('of');
        $('#pageInfo').text(`${pageText} ${currentIndex} ${ofText} ${totalPages}`);
    },

    // Load từ storage
    loadFromStorage() {
        const savedPages = StorageManager.loadAllPages();
        if (savedPages && Object.keys(savedPages).length > 0) {
            this.pages = savedPages;

            // Đảm bảo mỗi trang có background (tương thích ngược)
            Object.keys(this.pages).forEach(pageId => {
                if (!this.pages[pageId].background) {
                    this.pages[pageId].background = {
                        color: '#f5f5f5',
                        imageUrl: '',
                        imageRepeat: 'no-repeat',
                        imageSize: 'cover'
                    };
                }
            });
        }
    },

    // Thêm trang mới
    addNewPage() {
        const newPageId = this.createPage();
        this.goToPage(newPageId);
    },

    // Xóa trang
    deletePage(pageId) {
        if (Object.keys(this.pages).length <= 1) {
            alert(LanguageManager.t('cannotDeleteLastPage'));
            return false;
        }

        if (confirm(LanguageManager.t('confirmDeletePage', { pageId: pageId }))) {
            delete this.pages[pageId];
            StorageManager.deletePage(pageId);

            if (this.currentPageId === pageId) {
                const pageIds = Object.keys(this.pages).sort();
                this.goToPage(pageIds[0]);
            }

            this.updatePageInfo();
            return true;
        }
        return false;
    },

    // Export toàn bộ dữ liệu
    exportData() {
        return {
            pages: this.pages,
            currentPage: this.currentPageId
        };
    },

    // Import dữ liệu
    importData(data) {
        if (data && data.pages) {
            this.pages = data.pages;

            // Đảm bảo mỗi trang có background
            Object.keys(this.pages).forEach(pageId => {
                if (!this.pages[pageId].background) {
                    this.pages[pageId].background = {
                        color: '#f5f5f5',
                        imageUrl: '',
                        imageRepeat: 'no-repeat',
                        imageSize: 'cover'
                    };
                }
            });

            this.currentPageId = data.currentPage || Object.keys(this.pages)[0];

            // Lưu vào storage
            Object.keys(this.pages).forEach(pageId => {
                StorageManager.savePage(pageId, this.pages[pageId]);
            });
            StorageManager.saveCurrentPage(this.currentPageId);

            this.renderCurrentPage();
            this.updatePageInfo();
            return true;
        }
        return false;
    }
};
