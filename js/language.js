// Language Manager - Quản lý đa ngôn ngữ
const LanguageManager = {
    currentLang: 'vi', // 'vi' hoặc 'en'
    translations: {
        vi: {
            // App
            appTitle: 'Ứng dụng Trình diễn',

            // Toolbar
            prev: 'Trước',
            next: 'Sau',
            addPage: 'Thêm trang',
            saveState: 'Lưu và tải xuống',
            scriptEditor: 'Trình chỉnh sửa Script',
            page: 'Trang',
            of: '/',
            movePageUp: 'Di chuyển trang lên',
            movePageDown: 'Di chuyển trang xuống',
            deletePage: 'Xóa trang',

            // Sidebar
            addObject: 'Thêm Object',
            text: 'Văn bản',
            image: 'Hình ảnh',
            icon: 'Biểu tượng',
            button: 'Nút bấm',
            checkbox: 'Hộp kiểm',
            dropdown: 'Danh sách thả xuống',
            toggle: 'Nút bật/tắt',
            toggle3state: 'Nút 3 trạng thái',
            rectangle: 'Hình chữ nhật',
            circle: 'Hình tròn',
            ellipse: 'Hình elip',

            // Context Menu
            edit: 'Chỉnh sửa',
            delete: 'Xóa',
            bringToFront: 'Đưa lên trên',
            sendToBack: 'Đưa xuống dưới',
            toggleDraggable: 'Bật/Tắt kéo thả',
            addObjectHere: 'Thêm object tại đây:',
            editBackground: 'Chỉnh sửa Background',

            // Modals
            editObject: 'Chỉnh sửa Object',
            close: 'Đóng',
            save: 'Lưu',
            scriptEditorTitle: 'Trình chỉnh sửa Script',
            addAction: 'Thêm Hành động',
            saveScript: 'Lưu Script',
            addActionTitle: 'Thêm Hành động',
            actionType: 'Loại Hành động',
            target: 'Đối tượng',
            x: 'X',
            y: 'Y',
            time: 'Thời gian (ms)',
            add: 'Thêm',
            saveStateTitle: 'Lưu và tải xuống',
            downloadJSON: 'Tải xuống file JSON',
            editBackgroundTitle: 'Chỉnh sửa Nền',
            backgroundColor: 'Màu nền',
            backgroundImageUrl: 'Hình nền (URL)',
            backgroundImageUrlHint: 'Để trống nếu không muốn dùng hình nền',
            backgroundRepeat: 'Lặp lại hình nền',
            backgroundSize: 'Kích thước hình nền',
            noRepeat: 'Không lặp',
            repeat: 'Lặp lại',
            repeatX: 'Lặp theo chiều ngang',
            repeatY: 'Lặp theo chiều dọc',
            cover: 'Phủ toàn bộ',
            contain: 'Giữ nguyên tỷ lệ',
            auto: 'Kích thước gốc',
            stretch: 'Kéo dãn 100% x 100%',

            // Object Properties
            textLabel: 'Văn bản',
            color: 'Màu sắc',
            fontSize: 'Cỡ chữ',
            imageUrl: 'URL ảnh',
            uploadImage: 'Tải ảnh lên',
            chooseFile: 'Chọn file',
            imageUrlPlaceholder: 'Nhập URL ảnh hoặc chọn file',
            imageInputHint: 'Nhập URL ảnh hoặc chọn file từ máy tính (sẽ được chuyển thành base64)',
            base64Image: '[Ảnh đã được nhúng]',
            iconClass: 'Lớp Icon',
            backgroundColor: 'Màu nền',
            textColor: 'Màu chữ',
            checked: 'Đã chọn',
            options: 'Tùy chọn (mỗi option một dòng)',
            selectedIndex: 'Chỉ mục được chọn',
            active: 'Kích hoạt',
            state: 'Trạng thái (0: Đỏ, 1: Vàng, 2: Xanh)',

            // Messages
            confirmDelete: 'Bạn có chắc muốn xóa object này?',
            confirmDeletePage: 'Bạn có chắc muốn xóa trang {pageId}?',
            cannotDeleteLastPage: 'Không thể xóa trang cuối cùng!',
            jsonError: 'Lỗi JSON: {error}',
            importSuccess: 'Import thành công!',
            importError: 'Dữ liệu không hợp lệ!',
            fileReadError: 'Lỗi đọc file: {error}',
            importConfirm: 'Bạn có chắc muốn import file JSON? Dữ liệu hiện tại sẽ bị ghi đè.',
            importState: 'Mở file data',

            // Action Types
            show: 'Hiển thị',
            hide: 'Ẩn',
            move: 'Di chuyển',

            // Toggle Text Labels
            textWhenOff: 'Văn bản khi TẮT',
            textWhenOn: 'Văn bản khi BẬT',
            textState0: 'Văn bản Trạng thái 0 (Đỏ)',
            textState1: 'Văn bản Trạng thái 1 (Vàng)',
            textState2: 'Văn bản Trạng thái 2 (Xanh)',

            // Header
            actions: 'Hành động',
            settings: 'Cài đặt',
            autoAdvancePage: 'Tự động chuyển trang',
            language: 'Ngôn ngữ',
            vietnamese: 'Tiếng Việt',
            english: 'English',
            showAll: 'Hiển thị tất cả',

            // Add Action Modal
            objectListTitle: 'Danh sách Objects trong slide hiện tại:',
            loading: 'Đang tải...',
            clickToAddTarget: 'Click vào object để thêm vào Target',
            effect: 'Hiệu ứng',
            effectNone: 'Không hiệu ứng (ngay lập tức)',
            effectFade: 'Fade (mờ dần)',
            effectSlide: 'Slide (trượt)',
            effectDuration: 'Thời gian hiệu ứng (ms)',
            visualPosition: 'Chọn vị trí trực quan',
            visualPositionInstruction: 'Kéo thả object để chọn vị trí',
            confirm: 'Xác nhận',
            cancel: 'Hủy',
            noObjectsInSlide: 'Không có object nào trong slide này',
            unsavedChangesTitle: 'Có thay đổi chưa lưu',
            unsavedChangesMessage: 'Trang hiện tại có thay đổi chưa được lưu. Bạn muốn làm gì?',
            stayOnPage: 'Ở lại trang',
            saveToTemp: 'Không lưu (lưu tạm)',
            saveToStorage: 'Lưu vào Storage'
        },
        en: {
            // App
            appTitle: 'Presentation Application',

            // Toolbar
            prev: 'Prev',
            next: 'Next',
            addPage: 'Add New Page',
            saveState: 'Save and Download',
            scriptEditor: 'Script Editor',
            page: 'Page',
            of: '/',
            movePageUp: 'Move Page Up',
            movePageDown: 'Move Page Down',
            deletePage: 'Delete Page',

            // Sidebar
            addObject: 'Add Object',
            text: 'Text',
            image: 'Image',
            icon: 'Icon',
            button: 'Button',
            checkbox: 'Checkbox',
            dropdown: 'Dropdown',
            toggle: 'Toggle Button',
            toggle3state: '3 State Toggle',
            rectangle: 'Rectangle',
            circle: 'Circle',
            ellipse: 'Ellipse',

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
            target: 'Target',
            x: 'X',
            y: 'Y',
            time: 'Time (ms)',
            add: 'Add',
            saveStateTitle: 'Save and Download',
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
            uploadImage: 'Upload Image',
            chooseFile: 'Choose File',
            imageUrlPlaceholder: 'Enter image URL or choose file',
            imageInputHint: 'Enter image URL or choose file from computer (will be converted to base64)',
            base64Image: '[Embedded Image]',
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
            importConfirm: 'Are you sure you want to import JSON file? Current data will be overwritten.',
            importState: 'Open data file',

            // Action Types
            show: 'Show',
            hide: 'Hide',
            move: 'Move',

            // Toggle Text Labels
            textWhenOff: 'Text when OFF',
            textWhenOn: 'Text when ON',
            textState0: 'Text State 0 (Red)',
            textState1: 'Text State 1 (Yellow)',
            textState2: 'Text State 2 (Green)',

            // Header
            actions: 'Actions',
            settings: 'Settings',
            autoAdvancePage: 'Auto advance page',
            language: 'Language',
            vietnamese: 'Vietnamese',
            english: 'English',
            showAll: 'Show All',
            // Add Action Modal
            objectListTitle: 'Objects in current slide:',
            loading: 'Loading...',
            clickToAddTarget: 'Click on object to add to Target',
            effect: 'Effect',
            effectNone: 'No effect (instant)',
            effectFade: 'Fade',
            effectSlide: 'Slide',
            effectDuration: 'Effect duration (ms)',
            visualPosition: 'Select position visually',
            visualPositionInstruction: 'Drag and drop object to select position',
            confirm: 'Confirm',
            cancel: 'Cancel',
            noObjectsInSlide: 'No objects in this slide',
            unsavedChangesTitle: 'Unsaved Changes',
            unsavedChangesMessage: 'Current page has unsaved changes. What would you like to do?',
            stayOnPage: 'Stay on Page',
            saveToTemp: 'Don\'t Save (Save to Temp)',
            saveToStorage: 'Save to Storage'
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
