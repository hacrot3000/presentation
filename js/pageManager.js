// Page Manager - Quản lý nhiều trang
const PageManager = {
    pages: {},
    currentPageId: null,
    pageOrder: [], // Mảng lưu thứ tự các trang [pageId1, pageId2, ...]
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

        // Khởi tạo pageOrder từ storage hoặc từ keys của pages
        this.loadPageOrder();

        const savedCurrentPage = StorageManager.loadCurrentPage();
        if (savedCurrentPage && this.pages[savedCurrentPage]) {
            this.currentPageId = savedCurrentPage;
        } else {
            this.currentPageId = this.pageOrder[0] || Object.keys(this.pages)[0];
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
            title: '', // Tiêu đề trang, để trống sẽ dùng mặc định "Trang X"
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

        // Đảm bảo pageId có trong pageOrder
        if (!this.pageOrder.includes(pageId)) {
            this.pageOrder.push(pageId);
            this.savePageOrder();
        }

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
        const currentIndex = this.pageOrder.indexOf(this.currentPageId);
        if (currentIndex > 0) {
            this.goToPage(this.pageOrder[currentIndex - 1]);
        }
    },

    // Chuyển đến trang sau
    nextPage() {
        const currentIndex = this.pageOrder.indexOf(this.currentPageId);
        if (currentIndex < this.pageOrder.length - 1) {
            this.goToPage(this.pageOrder[currentIndex + 1]);
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
        const currentIndex = this.pageOrder.indexOf(this.currentPageId) + 1;
        const totalPages = this.pageOrder.length;
        const pageText = LanguageManager.t('page');
        const ofText = LanguageManager.t('of');
        $('#pageInfo').text(`${pageText} ${currentIndex} ${ofText} ${totalPages}`);

        // Cập nhật tiêu đề trang
        const page = this.pages[this.currentPageId];
        const pageTitle = page && page.title ? page.title : `${pageText} ${currentIndex}`;
        $('#pageTitleInput').val(pageTitle);
        $('#pageTitleDisplay').text(pageTitle);

        // Đảm bảo hiển thị đúng: label hiển thị, input và button ẩn
        $('#pageTitleDisplay').show();
        $('#pageTitleEditBtn').show();
        $('#pageTitleInput').hide();
    },

    // Lưu tiêu đề trang
    savePageTitle(title) {
        if (!this.currentPageId) return;

        if (!this.pages[this.currentPageId]) {
            this.pages[this.currentPageId] = {};
        }

        this.pages[this.currentPageId].title = title || '';

        // Lưu vào storage
        StorageManager.savePage(this.currentPageId, this.pages[this.currentPageId]);

        // Đánh dấu có thay đổi
        this.hasUnsavedChanges = true;
        this.updateSaveButtonState();

        // Cập nhật hiển thị
        this.updatePageInfo();
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

    // Load thứ tự trang từ storage
    loadPageOrder() {
        const savedOrder = localStorage.getItem('presentation_page_order');
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                // Kiểm tra xem tất cả pageId trong order có tồn tại không
                const validOrder = order.filter(pageId => this.pages[pageId]);
                // Thêm các pageId mới (nếu có) vào cuối
                const allPageIds = Object.keys(this.pages);
                allPageIds.forEach(pageId => {
                    if (!validOrder.includes(pageId)) {
                        validOrder.push(pageId);
                    }
                });
                this.pageOrder = validOrder;
            } catch (e) {
                // Nếu parse lỗi, tạo order từ keys
                this.pageOrder = Object.keys(this.pages).sort();
            }
        } else {
            // Nếu chưa có order, tạo từ keys
            this.pageOrder = Object.keys(this.pages).sort();
        }
        this.savePageOrder();
    },

    // Lưu thứ tự trang vào storage
    savePageOrder() {
        localStorage.setItem('presentation_page_order', JSON.stringify(this.pageOrder));
    },

    // Thêm trang mới (chèn vào sau trang hiện tại)
    addNewPage() {
        const newPageId = this.createPage();

        // Tìm index của trang hiện tại trong pageOrder
        const currentIndex = this.pageOrder.indexOf(this.currentPageId);

        // Chèn trang mới vào sau trang hiện tại
        if (currentIndex >= 0) {
            this.pageOrder.splice(currentIndex + 1, 0, newPageId);
        } else {
            // Nếu không tìm thấy, thêm vào cuối
            this.pageOrder.push(newPageId);
        }

        this.savePageOrder();
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

            // Xóa khỏi pageOrder
            const index = this.pageOrder.indexOf(pageId);
            if (index >= 0) {
                this.pageOrder.splice(index, 1);
            }
            this.savePageOrder();

            if (this.currentPageId === pageId) {
                // Chuyển đến trang trước đó hoặc trang đầu tiên
                if (index > 0) {
                    this.goToPage(this.pageOrder[index - 1]);
                } else if (this.pageOrder.length > 0) {
                    this.goToPage(this.pageOrder[0]);
                }
            }

            this.updatePageInfo();
            return true;
        }
        return false;
    },

    // Di chuyển trang lên trên
    movePageUp() {
        const currentIndex = this.pageOrder.indexOf(this.currentPageId);
        if (currentIndex > 0) {
            // Đổi chỗ với trang trước đó
            [this.pageOrder[currentIndex - 1], this.pageOrder[currentIndex]] =
            [this.pageOrder[currentIndex], this.pageOrder[currentIndex - 1]];
            this.savePageOrder();
            this.updatePageInfo();
            this.hasUnsavedChanges = true;
            this.updateSaveButtonState();
            return true;
        }
        return false;
    },

    // Di chuyển trang xuống dưới
    movePageDown() {
        const currentIndex = this.pageOrder.indexOf(this.currentPageId);
        if (currentIndex < this.pageOrder.length - 1) {
            // Đổi chỗ với trang sau đó
            [this.pageOrder[currentIndex], this.pageOrder[currentIndex + 1]] =
            [this.pageOrder[currentIndex + 1], this.pageOrder[currentIndex]];
            this.savePageOrder();
            this.updatePageInfo();
            this.hasUnsavedChanges = true;
            this.updateSaveButtonState();
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
            currentPage: this.currentPageId,
            pageOrder: this.pageOrder || Object.keys(savedPages || this.pages).sort()
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

            // Khôi phục pageOrder từ data hoặc tạo mới
            if (data.pageOrder && Array.isArray(data.pageOrder)) {
                // Kiểm tra xem tất cả pageId trong order có tồn tại không
                const validOrder = data.pageOrder.filter(pageId => this.pages[pageId]);
                // Thêm các pageId mới (nếu có) vào cuối
                const allPageIds = Object.keys(this.pages);
                allPageIds.forEach(pageId => {
                    if (!validOrder.includes(pageId)) {
                        validOrder.push(pageId);
                    }
                });
                this.pageOrder = validOrder;
            } else {
                // Nếu không có pageOrder, tạo từ keys
                this.pageOrder = Object.keys(this.pages).sort();
            }
            this.savePageOrder();

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
