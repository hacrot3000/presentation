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
        $('#btnLangVI').removeClass('active');
        $('#btnLangEN').removeClass('active');
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

        $('#btnSaveState').on('click', () => {
            PageManager.saveCurrentPage();
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

        $('#btnScriptEditor').on('click', () => {
            PageManager.saveCurrentPage();
            const page = PageManager.pages[PageManager.currentPageId];
            $('#scriptTextarea').val(JSON.stringify(page.script || [], null, 2));
            const modal = new bootstrap.Modal($('#scriptEditorModal')[0]);
            modal.show();
        });

        $('#btnShowAll').on('click', () => {
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
                $objectList.html('<small class="text-muted">Không có object nào trong slide này</small>');
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
            const currentValue = $targetInput.val().trim();

            if (currentValue === '') {
                $targetInput.val(objectId);
            } else {
                // Check if objectId already exists
                const existingIds = currentValue.split(',').map(id => id.trim());
                if (!existingIds.includes(objectId)) {
                    $targetInput.val(currentValue + ', ' + objectId);
                }
            }

            // Visual feedback
            $(this).addClass('btn-primary').removeClass('btn-outline-primary');
            setTimeout(() => {
                $(this).addClass('btn-outline-primary').removeClass('btn-primary');
            }, 300);
        });

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

                const modal = bootstrap.Modal.getInstance($('#addActionModal')[0]);
                modal.hide();
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

        // Language switcher
        $('#btnLangVI, #btnLangEN').on('click', function() {
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
