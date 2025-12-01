// Language Manager - Quản lý đa ngôn ngữ
const LanguageManager = {
    currentLang: 'vi', // 'vi' hoặc 'en'
    translations: {
        vi: {
            // App
            appTitle: 'Ứng dụng Trình diễn',

            // Toolbar
            prev: 'Prev',
            next: 'Next',
            addPage: 'Thêm trang mới',
            saveState: 'Lưu trạng thái',
            scriptEditor: 'Script Editor',
            page: 'Trang',
            of: '/',

            // Sidebar
            addObject: 'Thêm Object',
            text: 'Text',
            image: 'Image',
            icon: 'Icon',
            button: 'Button',
            checkbox: 'Checkbox',
            dropdown: 'Dropdown',
            toggle: 'Toggle Button',
            toggle3state: '3/4-state Toggle',

            // Context Menu
            edit: 'Chỉnh sửa',
            delete: 'Xóa',
            bringToFront: 'Bring to Front',
            sendToBack: 'Send to Back',
            toggleDraggable: 'Toggle Draggable',
            addObjectHere: 'Thêm object tại đây:',
            editBackground: 'Chỉnh sửa Background',

            // Modals
            editObject: 'Chỉnh sửa Object',
            close: 'Đóng',
            save: 'Lưu',
            scriptEditorTitle: 'Script Editor',
            addAction: 'Thêm Action',
            saveScript: 'Lưu Script',
            addActionTitle: 'Thêm Action',
            actionType: 'Loại Action',
            target: 'Target (Object ID, cách nhau bằng dấu phẩy cho show/hide)',
            x: 'X',
            y: 'Y',
            time: 'Time (ms)',
            add: 'Thêm',
            saveStateTitle: 'Lưu trạng thái',
            downloadJSON: 'Tải xuống file JSON',
            editBackgroundTitle: 'Chỉnh sửa Background',
            backgroundColor: 'Màu nền',
            backgroundImageUrl: 'Hình nền (URL)',
            backgroundImageUrlHint: 'Để trống nếu không muốn dùng hình nền',
            backgroundRepeat: 'Lặp lại hình nền',
            backgroundSize: 'Kích thước hình nền',
            noRepeat: 'Không lặp',
            repeat: 'Lặp lại',
            repeatX: 'Lặp theo chiều ngang',
            repeatY: 'Lặp theo chiều dọc',
            cover: 'Cover (phủ toàn bộ)',
            contain: 'Contain (giữ nguyên tỷ lệ)',
            auto: 'Auto (kích thước gốc)',
            stretch: '100% x 100% (kéo dãn)',

            // Object Properties
            textLabel: 'Text',
            color: 'Color',
            fontSize: 'Font Size',
            imageUrl: 'Image URL',
            width: 'Width',
            height: 'Height',
            iconClass: 'Icon Class',
            backgroundColor: 'Background Color',
            textColor: 'Text Color',
            checked: 'Checked',
            options: 'Options (mỗi option một dòng)',
            selectedIndex: 'Selected Index',
            active: 'Active',
            state: 'State (0: Red, 1: Yellow, 2: Green)',

            // Messages
            confirmDelete: 'Bạn có chắc muốn xóa object này?',
            confirmDeletePage: 'Bạn có chắc muốn xóa trang {pageId}?',
            cannotDeleteLastPage: 'Không thể xóa trang cuối cùng!',
            jsonError: 'Lỗi JSON: {error}',
            importSuccess: 'Import thành công!',
            importError: 'Dữ liệu không hợp lệ!',
            fileReadError: 'Lỗi đọc file: {error}',

            // Action Types
            show: 'Show',
            hide: 'Hide',
            move: 'Move'
        },
        en: {
            // App
            appTitle: 'Presentation Application',

            // Toolbar
            prev: 'Prev',
            next: 'Next',
            addPage: 'Add New Page',
            saveState: 'Save State',
            scriptEditor: 'Script Editor',
            page: 'Page',
            of: '/',

            // Sidebar
            addObject: 'Add Object',
            text: 'Text',
            image: 'Image',
            icon: 'Icon',
            button: 'Button',
            checkbox: 'Checkbox',
            dropdown: 'Dropdown',
            toggle: 'Toggle Button',
            toggle3state: '3/4-state Toggle',

            // Context Menu
            edit: 'Edit',
            delete: 'Delete',
            bringToFront: 'Bring to Front',
            sendToBack: 'Send to Back',
            toggleDraggable: 'Toggle Draggable',
            addObjectHere: 'Add object here:',
            editBackground: 'Edit Background',

            // Modals
            editObject: 'Edit Object',
            close: 'Close',
            save: 'Save',
            scriptEditorTitle: 'Script Editor',
            addAction: 'Add Action',
            saveScript: 'Save Script',
            addActionTitle: 'Add Action',
            actionType: 'Action Type',
            target: 'Target (Object ID, comma-separated for show/hide)',
            x: 'X',
            y: 'Y',
            time: 'Time (ms)',
            add: 'Add',
            saveStateTitle: 'Save State',
            downloadJSON: 'Download JSON File',
            editBackgroundTitle: 'Edit Background',
            backgroundColor: 'Background Color',
            backgroundImageUrl: 'Background Image (URL)',
            backgroundImageUrlHint: 'Leave empty if not using background image',
            backgroundRepeat: 'Image Repeat',
            backgroundSize: 'Image Size',
            noRepeat: 'No Repeat',
            repeat: 'Repeat',
            repeatX: 'Repeat Horizontally',
            repeatY: 'Repeat Vertically',
            cover: 'Cover (cover entire canvas)',
            contain: 'Contain (maintain aspect ratio)',
            auto: 'Auto (original size)',
            stretch: '100% x 100% (stretch)',

            // Object Properties
            textLabel: 'Text',
            color: 'Color',
            fontSize: 'Font Size',
            imageUrl: 'Image URL',
            width: 'Width',
            height: 'Height',
            iconClass: 'Icon Class',
            backgroundColor: 'Background Color',
            textColor: 'Text Color',
            checked: 'Checked',
            options: 'Options (one per line)',
            selectedIndex: 'Selected Index',
            active: 'Active',
            state: 'State (0: Red, 1: Yellow, 2: Green)',

            // Messages
            confirmDelete: 'Are you sure you want to delete this object?',
            confirmDeletePage: 'Are you sure you want to delete page {pageId}?',
            cannotDeleteLastPage: 'Cannot delete the last page!',
            jsonError: 'JSON Error: {error}',
            importSuccess: 'Import successful!',
            importError: 'Invalid data!',
            fileReadError: 'File read error: {error}',

            // Action Types
            show: 'Show',
            hide: 'Hide',
            move: 'Move'
        }
    },

    // Khởi tạo
    init() {
        // Load ngôn ngữ từ localStorage hoặc dùng mặc định
        const savedLang = localStorage.getItem('presentation_lang');
        if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
            this.currentLang = savedLang;
        }
        this.applyLanguage();
    },

    // Lấy translation
    t(key, params = {}) {
        const translation = this.translations[this.currentLang][key] || key;
        // Thay thế params
        return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    },

    // Chuyển đổi ngôn ngữ
    setLanguage(lang) {
        if (lang === 'vi' || lang === 'en') {
            this.currentLang = lang;
            localStorage.setItem('presentation_lang', lang);
            this.applyLanguage();
        }
    },

    // Áp dụng ngôn ngữ lên UI
    applyLanguage() {
        // Cập nhật title
        const title = this.t('appTitle');
        $('title').text(title);
        document.title = title;

        // Cập nhật tất cả elements có data-i18n attribute
        $('[data-i18n]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('i18n');
            const text = this.t(key);
            // Nếu là option trong select, chỉ cập nhật text
            if ($el.is('option')) {
                $el.text(text);
            } else {
                $el.text(text);
            }
        });

        // Cập nhật placeholders
        $('[data-i18n-placeholder]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('i18n-placeholder');
            const text = this.t(key);
            $el.attr('placeholder', text);
        });

        // Cập nhật titles
        $('[data-i18n-title]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('i18n-title');
            const text = this.t(key);
            $el.attr('title', text);
        });

        // Cập nhật HTML content (cho các element có HTML)
        $('[data-i18n-html]').each((index, element) => {
            const $el = $(element);
            const key = $el.data('i18n-html');
            const text = this.t(key);
            $el.html(text);
        });

        // Trigger custom event để các module khác có thể cập nhật
        $(document).trigger('languageChanged', [this.currentLang]);
    },

    // Lấy ngôn ngữ hiện tại
    getCurrentLanguage() {
        return this.currentLang;
    }
};
