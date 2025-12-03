// Main App - Khởi tạo và kết nối tất cả modules
const App = {
    init() {
        // Khởi tạo LanguageManager trước
        LanguageManager.init();

        // Khởi tạo các managers
        PageManager.init();
        DragDropManager.init($('#canvas'));
        ContextMenuManager.init();

        // Khôi phục trạng thái sidebar
        this.restoreSidebarState();

        // Bind events
        this.bindEvents();

        // Cập nhật UI
        PageManager.updatePageInfo();

        // Cập nhật trạng thái nút ngôn ngữ
        this.updateLanguageButtons();

        // Cập nhật trạng thái nút Lưu
        PageManager.updateSaveButtonState();
    },

    restoreSidebarState() {
        const sidebarVisible = localStorage.getItem('sidebarVisible');
        const $sidebar = $('#sidebar');
        if (sidebarVisible === 'true') {
            $sidebar.show();
        } else {
            $sidebar.hide();
        }
    },

    toggleSidebar() {
        const $sidebar = $('#sidebar');
        const isVisible = $sidebar.is(':visible');
        if (isVisible) {
            $sidebar.hide();
            localStorage.setItem('sidebarVisible', 'false');
        } else {
            $sidebar.show();
            localStorage.setItem('sidebarVisible', 'true');
        }
    },

    updateLanguageButtons() {
        const currentLang = LanguageManager.getCurrentLanguage();
        $('#btnLangVI, #btnLangEN').removeClass('active');
        if (currentLang === 'vi') {
            $('#btnLangVI').addClass('active');
        } else {
            $('#btnLangEN').addClass('active');
        }
    },

    bindEvents() {
        // Toggle Sidebar
        $('#btnToggleSidebar').on('click', (e) => {
            e.preventDefault();
            this.toggleSidebar();
        });

        // Sidebar - Thêm object
        $('#sidebar .list-group-item').on('click', (e) => {
            e.preventDefault();
            const type = $(e.currentTarget).data('type');
            if (type) {
                const object = ObjectManager.createObject(type);
                ObjectManager.addObjectToCanvas(object, $('#canvas'));

                // Tự động mở edit dialog sau khi thêm object
                setTimeout(() => {
                    ContextMenuManager.showEditModal(object);
                }, 100);

                // Đánh dấu có thay đổi chưa lưu
                PageManager.hasUnsavedChanges = true;
                PageManager.updateSaveButtonState();
                PageManager.saveCurrentPage();
            }
        });

        // Toolbar buttons
        $('#btnPrev').on('click', () => {
            PageManager.prevPage();
        });

        $('#btnNext').on('click', () => {
            PageManager.nextPage();
        });

        $('#btnAddPage').on('click', () => {
            PageManager.addNewPage();
        });

        // Quick Save - chỉ lưu vào storage, không mở popup
        $('#btnQuickSave').on('click', () => {
            PageManager.saveCurrentPage();
        });

        // Save State - lưu và mở popup
        $('#btnSaveState').on('click', (e) => {
            e.preventDefault();
            // Export dữ liệu đã lưu từ storage (không phải trạng thái hiện tại đang animation)
            // Điều này đảm bảo file tải xuống chứa dữ liệu gốc đúng, không bị ảnh hưởng bởi animation đang chạy
            const data = PageManager.exportData();
            $('#saveStateTextarea').val(JSON.stringify(data, null, 2));
            const modal = new bootstrap.Modal($('#saveStateModal')[0]);
            modal.show();
        });

        $('#btnDownloadJSON').on('click', () => {
            PageManager.saveCurrentPage();
            const data = PageManager.exportData();
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'presentation-config.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        $('#btnScriptEditor').on('click', (e) => {
            e.preventDefault();
            PageManager.saveCurrentPage();
            const page = PageManager.pages[PageManager.currentPageId];
            $('#scriptTextarea').val(JSON.stringify(page.script || [], null, 2));
            const modal = new bootstrap.Modal($('#scriptEditorModal')[0]);
            modal.show();
        });

        $('#btnShowAll').on('click', (e) => {
            e.preventDefault();
            // Hiển thị tất cả objects, bỏ qua script actions
            const objects = ObjectManager.getAllObjects();
            objects.forEach(obj => {
                ObjectManager.updateObject(obj.id, { visible: true });
                $(`.canvas-object[data-id="${obj.id}"]`).removeClass('hidden');
            });
        });

        $('#btnSaveScript').on('click', () => {
            try {
                const scriptText = $('#scriptTextarea').val();
                const script = JSON.parse(scriptText);
                PageManager.pages[PageManager.currentPageId].script = script;
                ScriptRunner.loadScript(script);
                // Đánh dấu có thay đổi chưa lưu
                PageManager.hasUnsavedChanges = true;
                PageManager.updateSaveButtonState();
                PageManager.saveCurrentPage();
                const modal = bootstrap.Modal.getInstance($('#scriptEditorModal')[0]);
                modal.hide();
            } catch (e) {
                alert(LanguageManager.t('jsonError', { error: e.message }));
            }
        });

        $('#btnAddAction').on('click', () => {
            // Clear previous values
            $('#actionTarget').val('');
            $('#actionX').val('');
            $('#actionY').val('');
            $('#actionTime').val('2000');
            $('#actionEffect').val('none');
            $('#actionDuration').val('500');
            $('#moveParams').hide();
            $('#effectParams').hide();

            // Populate object list
            const objects = ObjectManager.getAllObjects();
            const $objectList = $('#objectList');

            if (objects.length === 0) {
                $objectList.html(`<small class="text-muted">${LanguageManager.t('noObjectsInSlide')}</small>`);
            } else {
                let html = '<div class="d-flex flex-wrap gap-2">';
                objects.forEach(obj => {
                    // Get display name based on object type
                    let displayName = obj.id;
                    if (obj.props) {
                        if (obj.props.text) {
                            displayName += ` (${obj.props.text.substring(0, 20)}${obj.props.text.length > 20 ? '...' : ''})`;
                        } else if (obj.props.imageUrl) {
                            displayName += ' (Image)';
                        } else if (obj.props.icon) {
                            displayName += ` (${obj.props.icon})`;
                        }
                    }
                    html += `<button type="button" class="btn btn-sm btn-outline-primary object-select-btn" data-object-id="${obj.id}" title="Type: ${obj.type}">${displayName}</button>`;
                });
                html += '</div>';
                $objectList.html(html);
            }

            const modal = new bootstrap.Modal($('#addActionModal')[0]);
            modal.show();
        });

        $('#actionType').on('change', function() {
            const actionType = $(this).val();
            if (actionType === 'move') {
                $('#moveParams').show();
                $('#effectParams').hide();
                // Nếu đã có nhiều objects được chọn, chỉ giữ lại object đầu tiên
                const target = $('#actionTarget').val().trim();
                if (target) {
                    const firstTarget = target.split(',')[0].trim();
                    $('#actionTarget').val(firstTarget);
                }
            } else if (actionType === 'show' || actionType === 'hide') {
                $('#moveParams').hide();
                $('#effectParams').show();
            } else {
                $('#moveParams').hide();
                $('#effectParams').hide();
            }
        });

        // Trigger change event khi mở modal để hiển thị đúng params
        $('#addActionModal').on('show.bs.modal', function() {
            const actionType = $('#actionType').val();
            if (actionType === 'show' || actionType === 'hide') {
                $('#effectParams').show();
            }
        });

        // Handle object selection in addActionModal
        $(document).on('click', '.object-select-btn', function() {
            const objectId = $(this).data('object-id');
            const $targetInput = $('#actionTarget');
            const actionType = $('#actionType').val();
            const currentValue = $targetInput.val().trim();

            // Nếu là move, chỉ cho phép chọn 1 object
            if (actionType === 'move') {
                $targetInput.val(objectId);
            } else {
                // show/hide có thể chọn nhiều
                if (currentValue === '') {
                    $targetInput.val(objectId);
                } else {
                    // Check if objectId already exists
                    const existingIds = currentValue.split(',').map(id => id.trim());
                    if (!existingIds.includes(objectId)) {
                        $targetInput.val(currentValue + ', ' + objectId);
                    }
                }
            }

            // Visual feedback
            $(this).addClass('btn-primary').removeClass('btn-outline-primary');
            setTimeout(() => {
                $(this).addClass('btn-outline-primary').removeClass('btn-primary');
            }, 300);
        });

        // Visual Positioning Mode
        let visualPositioningState = {
            active: false,
            selectedObjectId: null,
            originalStates: {},
            originalZIndexes: {},
            scriptEditorModalInstance: null // Lưu reference đến modal Script Editor
        };

        $('#btnVisualPosition').on('click', () => {
            const target = $('#actionTarget').val().trim();
            if (!target) {
                alert('Vui lòng chọn object trước');
                return;
            }

            // Lấy object ID (nếu có nhiều, lấy cái đầu tiên)
            const objectId = target.split(',')[0].trim();
            const object = ObjectManager.getObject(objectId);
            if (!object) {
                alert('Object không tồn tại');
                return;
            }

            // Lưu trạng thái ban đầu
            visualPositioningState.active = true;
            visualPositioningState.selectedObjectId = objectId;
            visualPositioningState.originalStates = {};
            visualPositioningState.originalZIndexes = {};

            // Lưu trạng thái của tất cả objects
            const allObjects = ObjectManager.getAllObjects();
            allObjects.forEach(obj => {
                const $obj = $(`.canvas-object[data-id="${obj.id}"]`);
                visualPositioningState.originalStates[obj.id] = {
                    visible: obj.visible,
                    x: obj.x,
                    y: obj.y,
                    zIndex: obj.zIndex || 1,
                    draggable: obj.draggable !== false
                };
                visualPositioningState.originalZIndexes[obj.id] = $obj.css('z-index') || obj.zIndex || 1;
            });

            // Ẩn 2 modal và lưu reference
            const addActionModal = bootstrap.Modal.getInstance($('#addActionModal')[0]);
            if (addActionModal) addActionModal.hide();
            const scriptEditorModal = bootstrap.Modal.getInstance($('#scriptEditorModal')[0]);
            if (scriptEditorModal) {
                visualPositioningState.scriptEditorModalInstance = scriptEditorModal;
                scriptEditorModal.hide();
            } else {
                // Nếu chưa có instance, tạo mới
                visualPositioningState.scriptEditorModalInstance = new bootstrap.Modal($('#scriptEditorModal')[0]);
            }

            // Hiển thị tất cả objects
            allObjects.forEach(obj => {
                const $obj = $(`.canvas-object[data-id="${obj.id}"]`);
                $obj.removeClass('hidden').css({ display: 'block', opacity: '', visibility: 'visible' });
                ObjectManager.updateObject(obj.id, { visible: true });
            });

            // Đánh dấu object được chọn và đưa lên trên cùng
            const $selectedObj = $(`.canvas-object[data-id="${objectId}"]`);
            $selectedObj.addClass('visual-positioning-selected');
            const maxZIndex = Math.max(...allObjects.map(o => parseInt(visualPositioningState.originalZIndexes[o.id]) || 1));
            $selectedObj.css('z-index', maxZIndex + 1000);

            // Hiển thị overlay
            $('#visualPositionOverlay').show();

            // Đảm bảo object có thể kéo được
            const selectedObject = ObjectManager.getObject(objectId);
            if (!selectedObject.draggable) {
                // Tạm thời enable draggable
                ObjectManager.updateObject(objectId, { draggable: true });
            }
        });

        $('#btnConfirmPosition').on('click', () => {
            if (!visualPositioningState.active || !visualPositioningState.selectedObjectId) return;

            const object = ObjectManager.getObject(visualPositioningState.selectedObjectId);
            if (object) {
                // Lấy tọa độ hiện tại
                $('#actionX').val(object.x);
                $('#actionY').val(object.y);
            }

            // Restore trạng thái
            restoreVisualPositioningState();

            // Hiển thị lại cả 2 modal
            const addActionModal = new bootstrap.Modal($('#addActionModal')[0]);
            addActionModal.show();

            // Hiển thị lại modal Script Editor nếu có
            if (visualPositioningState.scriptEditorModalInstance) {
                visualPositioningState.scriptEditorModalInstance.show();
            }
        });

        $('#btnCancelPosition').on('click', () => {
            restoreVisualPositioningState();

            // Hiển thị lại cả 2 modal
            const addActionModal = new bootstrap.Modal($('#addActionModal')[0]);
            addActionModal.show();

            // Hiển thị lại modal Script Editor nếu có
            if (visualPositioningState.scriptEditorModalInstance) {
                visualPositioningState.scriptEditorModalInstance.show();
            }
        });

        function restoreVisualPositioningState() {
            if (!visualPositioningState.active) return;

            // Restore trạng thái của tất cả objects
            Object.keys(visualPositioningState.originalStates).forEach(objId => {
                const originalState = visualPositioningState.originalStates[objId];
                const originalZIndex = visualPositioningState.originalZIndexes[objId];
                const $obj = $(`.canvas-object[data-id="${objId}"]`);

                // Restore position và draggable
                ObjectManager.updateObject(objId, {
                    x: originalState.x,
                    y: originalState.y,
                    visible: originalState.visible,
                    zIndex: originalState.zIndex,
                    draggable: originalState.draggable
                });

                // Restore CSS
                $obj.css({
                    left: originalState.x + 'px',
                    top: originalState.y + 'px',
                    zIndex: originalZIndex
                });

                // Restore draggable class
                if (!originalState.draggable) {
                    $obj.addClass('not-draggable');
                } else {
                    $obj.removeClass('not-draggable');
                }

                // Restore visibility
                if (!originalState.visible) {
                    $obj.addClass('hidden').css({ display: 'none' });
                } else {
                    $obj.removeClass('hidden');
                }
            });

            // Remove visual positioning class
            $(`.canvas-object.visual-positioning-selected`).removeClass('visual-positioning-selected');

            // Ẩn overlay
            $('#visualPositionOverlay').hide();

            // Reset state (giữ lại scriptEditorModalInstance để có thể hiển thị lại)
            visualPositioningState.active = false;
            visualPositioningState.selectedObjectId = null;
            visualPositioningState.originalStates = {};
            visualPositioningState.originalZIndexes = {};
            // Không reset scriptEditorModalInstance ở đây, sẽ reset sau khi đóng modal
        }

        $('#btnAddActionConfirm').on('click', () => {
            const type = $('#actionType').val();
            const target = $('#actionTarget').val();
            let action = { type: type };

            if (type === 'move') {
                action.target = target;
                action.x = parseInt($('#actionX').val()) || 0;
                action.y = parseInt($('#actionY').val()) || 0;
                action.time = parseInt($('#actionTime').val()) || 2000;
            } else {
                // show/hide có thể nhận array
                const targets = target.split(',').map(t => t.trim()).filter(t => t);
                action.target = targets.length === 1 ? targets[0] : targets;

                // Thêm effect và duration nếu có
                const effect = $('#actionEffect').val();
                const duration = parseInt($('#actionDuration').val()) || 500;
                if (effect && effect !== 'none') {
                    action.effect = effect;
                    action.duration = duration;
                }
            }

            // Thêm vào script textarea
            try {
                const currentScript = JSON.parse($('#scriptTextarea').val() || '[]');
                currentScript.push(action);
                $('#scriptTextarea').val(JSON.stringify(currentScript, null, 2));

                // Đóng modal "Thêm Hành động"
                const addActionModal = bootstrap.Modal.getInstance($('#addActionModal')[0]);
                if (addActionModal) addActionModal.hide();

                // Đảm bảo modal "Trình chỉnh sửa Script" vẫn hiển thị
                // Kiểm tra xem modal có đang hiển thị không
                const scriptEditorModal = bootstrap.Modal.getInstance($('#scriptEditorModal')[0]);
                if (!scriptEditorModal || !$('#scriptEditorModal').hasClass('show')) {
                    // Nếu không có instance hoặc không đang hiển thị, hiển thị lại
                    const newScriptEditorModal = new bootstrap.Modal($('#scriptEditorModal')[0]);
                    newScriptEditorModal.show();
                }
            } catch (e) {
                alert(LanguageManager.t('jsonError', { error: e.message }));
            }
        });

        // Save object edit
        $('#btnSaveObject').on('click', () => {
            ContextMenuManager.saveEdit();
        });

        // Save background edit
        $('#btnSaveBackground').on('click', () => {
            ContextMenuManager.saveBackground();
        });

        // Auto advance page checkbox
        // Load giá trị từ localStorage
        const savedAutoAdvance = localStorage.getItem('autoAdvancePage');
        if (savedAutoAdvance !== null) {
            $('#chkAutoAdvancePage').prop('checked', savedAutoAdvance === 'true');
        }

        $('#chkAutoAdvancePage').on('change', function() {
            localStorage.setItem('autoAdvancePage', $(this).is(':checked') ? 'true' : 'false');
        });

        // Language switcher
        $('#btnLangVI, #btnLangEN').on('click', function(e) {
            e.preventDefault();
            const lang = $(this).data('lang');
            LanguageManager.setLanguage(lang);
            App.updateLanguageButtons();
        });

        // Listen for language change event
        $(document).on('languageChanged', () => {
            // Cập nhật lại các text động trong các module
            PageManager.updatePageInfo();
            // Cập nhật context menu nếu đang mở
            // Các modal sẽ tự động cập nhật khi mở lại
        });

        // Click vào object để select
        $(document).on('click', '.canvas-object', (e) => {
            e.stopPropagation();
            const id = $(e.currentTarget).data('id');
            ObjectManager.selectObject(id);
        });

        // Canvas click để chạy script và deselect
        $('#canvas').on('click', (e) => {
            // Chỉ chạy script nếu click vào canvas, không phải object
            if ($(e.target).is('#canvas') || ($(e.target).closest('.canvas-object').length === 0 && !$(e.target).hasClass('canvas-object'))) {
                ObjectManager.selectObject(null);
                ScriptRunner.runNext();
            }
        });

        // Handlers cho modal xác nhận thay đổi chưa lưu
        $('#btnStayOnPage').on('click', () => {
            const modal = bootstrap.Modal.getInstance($('#confirmUnsavedModal')[0]);
            if (modal) modal.hide();
            PageManager.pendingNavigation = null;
        });

        $('#btnSaveToTemp').on('click', () => {
            // Lưu trạng thái tạm và chuyển trang
            PageManager.savePageStateToTemp();
            const targetPage = PageManager.pendingNavigation;
            PageManager.pendingNavigation = null;
            const modal = bootstrap.Modal.getInstance($('#confirmUnsavedModal')[0]);
            if (modal) modal.hide();
            if (targetPage) {
                PageManager.goToPage(targetPage, true);
            }
        });

        $('#btnSaveToStorage').on('click', () => {
            // Lưu vào storage và chuyển trang
            PageManager.saveCurrentPage();
            const targetPage = PageManager.pendingNavigation;
            PageManager.pendingNavigation = null;
            const modal = bootstrap.Modal.getInstance($('#confirmUnsavedModal')[0]);
            if (modal) modal.hide();
            if (targetPage) {
                PageManager.goToPage(targetPage, true);
            }
        });

        // Load file JSON (drag & drop hoặc input)
        // Thêm input file ẩn để import
        const $fileInput = $('<input type="file" accept=".json" style="display:none;" id="importFile">');
        $('body').append($fileInput);

        // Nút import
        $('#btnImportState').on('click', () => {
            // Cảnh báo người dùng về việc ghi đè dữ liệu
            if (confirm(LanguageManager.t('importConfirm'))) {
                $fileInput.click();
            }
        });

        $fileInput.on('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (PageManager.importData(data)) {
                            alert(LanguageManager.t('importSuccess'));
                            // Reload trang để hiển thị dữ liệu mới
                            location.reload();
                        } else {
                            alert(LanguageManager.t('importError'));
                        }
                    } catch (err) {
                        alert(LanguageManager.t('fileReadError', { error: err.message }));
                    }
                    // Reset input để có thể chọn lại file cùng tên
                    $fileInput.val('');
                };
                reader.onerror = function() {
                    alert(LanguageManager.t('fileReadError', { error: 'Không thể đọc file' }));
                    $fileInput.val('');
                };
                reader.readAsText(file);
            }
        });
    }
};

// Khởi động app khi DOM ready
$(document).ready(() => {
    App.init();
});
