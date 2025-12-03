// Page Manager - Quản lý nhiều trang
const PageManager = {
    pages: {},
    currentPageId: null,
    // Lưu trạng thái tạm của từng trang (không lưu vào storage)
    pageStates: {}, // { pageId: { objectVisibility: {}, scriptIndex: 0, objectPositions: {} } }
    pendingNavigation: null, // Lưu pageId muốn chuyển đến khi có thay đổi chưa lưu
    hasUnsavedChanges: false, // Flag để kiểm tra có thay đổi chưa lưu

    // Khởi tạo
    init() {
        // Reset pageStates khi reload trang (chỉ reset khi reload, không reset khi chuyển trang)
        // Kiểm tra xem có phải là lần đầu load không (không có pageStates trong memory)
        if (!this.pageStates) {
            this.pageStates = {};
        }
        this.hasUnsavedChanges = false;
        this.pendingNavigation = null;

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
    goToPage(pageId, skipCheck = false) {
        if (!this.pages[pageId]) return false;

        // Kiểm tra có thay đổi chưa lưu (trừ khi skipCheck = true)
        if (!skipCheck && this.hasUnsavedChanges) {
            this.pendingNavigation = pageId;
            this.showUnsavedChangesDialog();
            return false;
        }

        // Lưu trạng thái tạm của trang hiện tại trước khi chuyển
        this.savePageStateToTemp();

        // Chuyển trang
        this.currentPageId = pageId;
        StorageManager.saveCurrentPage(pageId);
        this.renderCurrentPage();
        this.updatePageInfo();

        // Restore trạng thái tạm nếu có
        this.restorePageStateFromTemp();

        // Reset flag (trang mới chưa có thay đổi)
        this.hasUnsavedChanges = false;
        this.updateSaveButtonState();

        return true;
    },

    // Lưu trạng thái tạm của trang hiện tại
    savePageStateToTemp() {
        if (!this.currentPageId) return;

        const objects = ObjectManager.getAllObjects();
        const objectVisibility = {};
        const objectPositions = {};

        objects.forEach(obj => {
            objectVisibility[obj.id] = obj.visible !== false;
            objectPositions[obj.id] = { x: obj.x, y: obj.y };
        });

        this.pageStates[this.currentPageId] = {
            objectVisibility: objectVisibility,
            objectPositions: objectPositions,
            scriptIndex: ScriptRunner.currentIndex
        };
    },

    // Restore trạng thái tạm của trang
    restorePageStateFromTemp() {
        if (!this.currentPageId || !this.pageStates[this.currentPageId]) {
            // Nếu không có trạng thái tạm, khởi tạo từ đầu
            ScriptRunner.reset();
            ScriptRunner.initializeObjectVisibility(ScriptRunner.currentScript);
            return;
        }

        const state = this.pageStates[this.currentPageId];

        // Restore visibility
        Object.keys(state.objectVisibility).forEach(objId => {
            const visible = state.objectVisibility[objId];
            const $obj = $(`.canvas-object[data-id="${objId}"]`);
            if ($obj.length) {
                if (visible) {
                    $obj.removeClass('hidden').css({ display: 'block', opacity: '', visibility: 'visible' });
                } else {
                    $obj.addClass('hidden').css({ display: 'none' });
                }
                ObjectManager.updateObject(objId, { visible: visible });
            }
        });

        // Restore positions
        Object.keys(state.objectPositions).forEach(objId => {
            const pos = state.objectPositions[objId];
            const $obj = $(`.canvas-object[data-id="${objId}"]`);
            if ($obj.length) {
                ObjectManager.updateObject(objId, { x: pos.x, y: pos.y });
                $obj.css({ left: pos.x + 'px', top: pos.y + 'px' });
            }
        });

        // Restore script index
        ScriptRunner.currentIndex = state.scriptIndex || 0;
    },

    // Hiển thị dialog hỏi về thay đổi chưa lưu
    showUnsavedChangesDialog() {
        const modal = new bootstrap.Modal($('#confirmUnsavedModal')[0]);
        modal.show();
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

        // Nếu có thay đổi chưa lưu (do người dùng chỉnh sửa), cập nhật objects từ ObjectManager
        // Nếu không có thay đổi, giữ nguyên dữ liệu đã lưu (tránh lưu trạng thái đang animation)
        let objects = this.pages[this.currentPageId]?.objects || [];
        if (this.hasUnsavedChanges) {
            // Có thay đổi do người dùng, export trạng thái hiện tại
            objects = ObjectManager.exportObjects();
        }
        // Nếu không có thay đổi, giữ nguyên objects từ this.pages (dữ liệu đã lưu)

        const pageData = {
            objects: objects,
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

        // Reset flag sau khi lưu
        this.hasUnsavedChanges = false;

        // Cập nhật trạng thái nút Lưu
        this.updateSaveButtonState();
    },

    // Cập nhật trạng thái nút Lưu
    updateSaveButtonState() {
        const $btn = $('#btnQuickSave');
        if (this.hasUnsavedChanges) {
            $btn.prop('disabled', false);
        } else {
            $btn.prop('disabled', true);
        }
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
        // Export dữ liệu gốc từ storage, không phải từ trạng thái hiện tại
        // (tránh trường hợp animation đang chạy làm sai dữ liệu)
        const savedPages = StorageManager.loadAllPages();
        return {
            pages: savedPages || this.pages,
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
