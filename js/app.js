// Main App - Khởi tạo và kết nối tất cả modules
const App = {
    init() {
        // Khởi tạo LanguageManager trước
        LanguageManager.init();

        // Khởi tạo các managers
        PageManager.init();
        DragDropManager.init($('#canvas'));
        ContextMenuManager.init();

        // Bind events
        this.bindEvents();

        // Cập nhật UI
        PageManager.updatePageInfo();

        // Cập nhật trạng thái nút ngôn ngữ
        this.updateLanguageButtons();
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
        // Sidebar - Thêm object
        $('#sidebar .list-group-item').on('click', (e) => {
            e.preventDefault();
            const type = $(e.currentTarget).data('type');
            if (type) {
                const object = ObjectManager.createObject(type);
                ObjectManager.addObjectToCanvas(object, $('#canvas'));
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
            const modal = new bootstrap.Modal($('#addActionModal')[0]);
            modal.show();
        });

        $('#actionType').on('change', function() {
            if ($(this).val() === 'move') {
                $('#moveParams').show();
            } else {
                $('#moveParams').hide();
            }
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

        // Có thể thêm nút import nếu cần
        // $('#btnImportJSON').on('click', () => {
        //     $fileInput.click();
        // });

        $fileInput.on('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (PageManager.importData(data)) {
                            alert(LanguageManager.t('importSuccess'));
                        } else {
                            alert(LanguageManager.t('importError'));
                        }
                    } catch (err) {
                        alert(LanguageManager.t('fileReadError', { error: err.message }));
                    }
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
