// Context Menu Manager
const ContextMenuManager = {
    $menu: null,
    currentObjectId: null,

    init() {
        this.$menu = $('#contextMenu');
        this.bindEvents();
    },

    bindEvents() {
        // Right click trên object
        $(document).on('contextmenu', '.canvas-object', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = $(e.currentTarget).data('id');
            console.log('Right click on object:', id);
            this.showMenu(e.pageX, e.pageY, id);
        });

        // Right click trên canvas (thêm object)
        $(document).on('contextmenu', '#canvas', (e) => {
            e.preventDefault();
            this.showCanvasMenu(e.pageX, e.pageY, e);
        });

        // Click để đóng menu (nhưng không đóng khi click vào menu)
        $(document).on('click', (e) => {
            // Không đóng nếu click vào menu hoặc item trong menu
            if (!$(e.target).closest('.context-menu').length &&
                !$(e.target).is('.context-menu') &&
                !$(e.target).closest('[data-action]').length) {
                this.hideMenu();
            }
        });

        // Menu actions - sử dụng click với stopPropagation
        // Sử dụng event delegation với selector cụ thể hơn
        $(document).on('click', '#contextMenu [data-action]', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const action = $(e.currentTarget).data('action');
            console.log('Context menu action clicked:', action, 'currentObjectId:', this.currentObjectId);
            this.handleAction(action);
            this.hideMenu();
            return false;
        });
    },

    showMenu(x, y, objectId) {
        console.log('showMenu called with objectId:', objectId, 'at', x, y);
        this.currentObjectId = objectId;
        ObjectManager.selectObject(objectId);

        // Đảm bảo menu có đầy đủ các action với translation
        this.updateContextMenu();

        // Đảm bảo menu có z-index cao và hiển thị đúng
        this.$menu.css({
            left: x + 'px',
            top: y + 'px',
            display: 'block',
            zIndex: 10001
        });

        console.log('Context menu displayed, HTML:', this.$menu.html());
    },

    updateContextMenu() {
        // Lấy object hiện tại để kiểm tra trạng thái draggable
        const object = this.currentObjectId ? ObjectManager.getObject(this.currentObjectId) : null;
        const isDraggable = object ? (object.draggable !== false) : true;
        const draggableCheck = isDraggable ? '<i class="fas fa-check ms-2"></i>' : '';

        // Cập nhật translation cho context menu
        const menuHtml = `
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action" data-action="edit">${LanguageManager.t('edit')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="delete">${LanguageManager.t('delete')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="bringToFront">${LanguageManager.t('bringToFront')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="sendToBack">${LanguageManager.t('sendToBack')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="toggleDraggable">${LanguageManager.t('toggleDraggable')}${draggableCheck}</a>
            </div>
        `;
        this.$menu.html(menuHtml);
    },

    showCanvasMenu(x, y, e) {
        // Menu thêm object tại vị trí click
        const $canvas = $('#canvas');
        const canvasOffset = $canvas.offset();
        const clickX = e.pageX - canvasOffset.left;
        const clickY = e.pageY - canvasOffset.top;

        // Tạo menu động với các loại object
        let menuHtml = '<div class="list-group">';
        menuHtml += `<div class="list-group-item fw-bold">${LanguageManager.t('addObjectHere')}</div>`;
        const types = ['text', 'image', 'icon', 'button', 'checkbox', 'dropdown', 'toggle', 'toggle3state', 'rectangle', 'circle', 'ellipse'];
        const typeKeys = {
            text: 'text',
            image: 'image',
            icon: 'icon',
            button: 'button',
            checkbox: 'checkbox',
            dropdown: 'dropdown',
            toggle: 'toggle',
            toggle3state: 'toggle3state',
            rectangle: 'rectangle',
            circle: 'circle',
            ellipse: 'ellipse'
        };

        types.forEach(type => {
            const label = LanguageManager.t(typeKeys[type]);
            menuHtml += `<a href="#" class="list-group-item list-group-item-action" data-action="add-${type}" data-x="${clickX}" data-y="${clickY}">${label}</a>`;
        });
        menuHtml += '<div class="list-group-item border-top mt-2"></div>';
        menuHtml += `<a href="#" class="list-group-item list-group-item-action" data-action="edit-background"><i class="fas fa-palette me-2"></i>${LanguageManager.t('editBackground')}</a>`;
        menuHtml += '</div>';

        this.$menu.html(menuHtml);
        this.currentObjectId = null;

        this.$menu.css({
            left: x + 'px',
            top: y + 'px',
            display: 'block'
        });
    },

    hideMenu() {
        this.$menu.hide();
        this.currentObjectId = null;
    },

    handleAction(action) {
        if (action.startsWith('add-')) {
            // Thêm object mới
            const type = action.replace('add-', '');
            const $item = this.$menu.find(`[data-action="${action}"]`);
            const x = parseInt($item.data('x')) || 50;
            const y = parseInt($item.data('y')) || 50;

            const object = ObjectManager.createObject(type, x, y);
            ObjectManager.addObjectToCanvas(object, $('#canvas'));

            // Tự động mở edit dialog sau khi thêm object
            setTimeout(() => {
                this.showEditModal(object);
            }, 100);

            PageManager.saveCurrentPage();
            return;
        }

        if (action === 'edit-background') {
            this.showBackgroundModal();
            return;
        }

        if (!this.currentObjectId) {
            console.log('No currentObjectId for action:', action);
            return;
        }

        const object = ObjectManager.getObject(this.currentObjectId);
        if (!object) {
            console.log('Object not found:', this.currentObjectId);
            return;
        }

        switch(action) {
            case 'edit':
                this.showEditModal(object);
                break;
            case 'delete':
                if (confirm(LanguageManager.t('confirmDelete'))) {
                    ObjectManager.deleteObject(this.currentObjectId);
                    PageManager.saveCurrentPage();
                }
                break;
            case 'bringToFront':
                const maxZ = Math.max(...ObjectManager.getAllObjects().map(o => o.zIndex || 1));
                ObjectManager.updateObject(this.currentObjectId, { zIndex: maxZ + 1 });
                $(`.canvas-object[data-id="${this.currentObjectId}"]`).css('zIndex', maxZ + 1);
                PageManager.saveCurrentPage();
                break;
            case 'sendToBack':
                ObjectManager.updateObject(this.currentObjectId, { zIndex: 0 });
                $(`.canvas-object[data-id="${this.currentObjectId}"]`).css('zIndex', 0);
                PageManager.saveCurrentPage();
                break;
            case 'toggleDraggable':
                const newDraggable = !object.draggable;
                ObjectManager.updateObject(this.currentObjectId, { draggable: newDraggable });
                const $obj = $(`.canvas-object[data-id="${this.currentObjectId}"]`);
                if (newDraggable) {
                    $obj.removeClass('not-draggable');
                } else {
                    $obj.addClass('not-draggable');
                }
                PageManager.saveCurrentPage();
                break;
        }
    },

    showEditModal(object) {
        if (!object || !object.id) {
            console.error('Invalid object passed to showEditModal:', object);
            return;
        }

        this.editingObjectId = object.id;
        const $modal = $('#editObjectModal');
        const $form = $('#editObjectForm');
        $form.empty();

        // Tạo form động theo type
        let formHtml = '';

        switch(object.type) {
            case 'text':
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textLabel')}</label>
                        <input type="text" class="form-control" id="editText" value="${object.props.text || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('color')}</label>
                        <input type="color" class="form-control form-control-color" id="editColor" value="${object.props.color || '#000000'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('fontSize')}</label>
                        <input type="number" class="form-control" id="editFontSize" value="${object.props.fontSize || 16}">
                    </div>
                `;
                break;

            case 'image':
                // Đảm bảo imageUrl được hiển thị đúng
                const imageUrl = object.props.imageUrl || '';
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('imageUrl')}</label>
                        <input type="text" class="form-control" id="editImageUrl" value="${imageUrl.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('width')} (để trống để tự động scale)</label>
                        <input type="number" class="form-control" id="editWidth" value="${object.props.width !== null && object.props.width !== undefined ? object.props.width : ''}" placeholder="Tự động">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('height')} (để trống để tự động scale)</label>
                        <input type="number" class="form-control" id="editHeight" value="${object.props.height !== null && object.props.height !== undefined ? object.props.height : ''}" placeholder="Tự động">
                    </div>
                    <small class="text-muted">Nếu để trống một trong hai, cái còn lại sẽ tự scale theo tỷ lệ gốc. Nếu để trống cả hai, hiển thị kích thước gốc.</small>
                `;
                break;

            case 'icon':
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('iconClass')}</label>
                        <select class="form-select" id="editIcon">
                            ${config.commonIcons.map(icon =>
                                `<option value="${icon}" ${icon === object.props.icon ? 'selected' : ''}>${icon}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('color')}</label>
                        <input type="color" class="form-control form-control-color" id="editColor" value="${object.props.color || '#000000'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('fontSize')}</label>
                        <input type="number" class="form-control" id="editFontSize" value="${object.props.fontSize || 24}">
                    </div>
                `;
                break;

            case 'button':
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textLabel')}</label>
                        <input type="text" class="form-control" id="editText" value="${object.props.text || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('backgroundColor')}</label>
                        <input type="color" class="form-control form-control-color" id="editBgColor" value="${object.props.backgroundColor || '#007bff'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textColor')}</label>
                        <input type="color" class="form-control form-control-color" id="editColor" value="${object.props.color || '#ffffff'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('fontSize')}</label>
                        <input type="number" class="form-control" id="editFontSize" value="${object.props.fontSize || 14}">
                    </div>
                `;
                break;

            case 'checkbox':
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textLabel')}</label>
                        <input type="text" class="form-control" id="editText" value="${object.props.text || ''}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editChecked" ${object.props.checked ? 'checked' : ''}>
                            <label class="form-check-label" for="editChecked">${LanguageManager.t('checked')}</label>
                        </div>
                    </div>
                `;
                break;

            case 'dropdown':
                const options = object.props.options || ['Option 1', 'Option 2', 'Option 3'];
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('options')}</label>
                        <textarea class="form-control" id="editOptions" rows="5">${options.join('\n')}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('selectedIndex')}</label>
                        <input type="number" class="form-control" id="editSelectedIndex" value="${object.props.selectedIndex || 0}" min="0">
                    </div>
                `;
                break;

            case 'toggle':
                // Đảm bảo texts được khởi tạo đúng
                if (!object.props.texts) {
                    object.props.texts = { off: 'Toggle', on: 'Toggle' };
                }
                const toggleTexts = object.props.texts;
                const toggleActive = object.props.active === true;
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textWhenOff')}</label>
                        <input type="text" class="form-control" id="editTextOff" value="${(toggleTexts.off || 'Toggle').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textWhenOn')}</label>
                        <input type="text" class="form-control" id="editTextOn" value="${(toggleTexts.on || 'Toggle').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editActive" ${toggleActive ? 'checked' : ''}>
                            <label class="form-check-label" for="editActive">${LanguageManager.t('active')}</label>
                        </div>
                    </div>
                `;
                break;

            case 'toggle3state':
                // Đảm bảo texts được khởi tạo đúng
                if (!object.props.texts) {
                    object.props.texts = {
                        0: '3-State Toggle',
                        1: '3-State Toggle',
                        2: '3-State Toggle'
                    };
                }
                const stateTexts = object.props.texts;
                const currentState = object.props.state !== undefined ? object.props.state : 0;
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textState0')}</label>
                        <input type="text" class="form-control" id="editTextState0" value="${(stateTexts[0] || '3-State Toggle').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textState1')}</label>
                        <input type="text" class="form-control" id="editTextState1" value="${(stateTexts[1] || '3-State Toggle').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('textState2')}</label>
                        <input type="text" class="form-control" id="editTextState2" value="${(stateTexts[2] || '3-State Toggle').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('state')}</label>
                        <input type="number" class="form-control" id="editState" value="${currentState}" min="0" max="2">
                    </div>
                `;
                break;

            case 'rectangle':
                const rectHasBg = object.props.hasBackground !== false;
                const rectHasBorder = object.props.hasBorder !== false;
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('width')}</label>
                        <input type="number" class="form-control" id="editWidth" value="${object.props.width || object.width || 200}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('height')}</label>
                        <input type="number" class="form-control" id="editHeight" value="${object.props.height || object.height || 150}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBackground" ${rectHasBg ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBackground">Có nền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('backgroundColor')}</label>
                        <input type="color" class="form-control form-control-color" id="editBgColor" value="${object.props.backgroundColor || '#007bff'}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBorder" ${rectHasBorder ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBorder">Có viền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Màu viền</label>
                        <input type="color" class="form-control form-control-color" id="editBorderColor" value="${object.props.borderColor || '#0056b3'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Độ dày viền</label>
                        <input type="number" class="form-control" id="editBorderWidth" value="${object.props.borderWidth || 2}" min="0">
                    </div>
                `;
                break;

            case 'circle':
                const circleHasBg = object.props.hasBackground !== false;
                const circleHasBorder = object.props.hasBorder !== false;
                const circleSize = object.props.width || object.width || 150;
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">Kích thước (width = height)</label>
                        <input type="number" class="form-control" id="editSize" value="${circleSize}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBackground" ${circleHasBg ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBackground">Có nền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('backgroundColor')}</label>
                        <input type="color" class="form-control form-control-color" id="editBgColor" value="${object.props.backgroundColor || '#28a745'}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBorder" ${circleHasBorder ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBorder">Có viền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Màu viền</label>
                        <input type="color" class="form-control form-control-color" id="editBorderColor" value="${object.props.borderColor || '#1e7e34'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Độ dày viền</label>
                        <input type="number" class="form-control" id="editBorderWidth" value="${object.props.borderWidth || 2}" min="0">
                    </div>
                `;
                break;

            case 'ellipse':
                const ellipseHasBg = object.props.hasBackground !== false;
                const ellipseHasBorder = object.props.hasBorder !== false;
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('width')}</label>
                        <input type="number" class="form-control" id="editWidth" value="${object.props.width || object.width || 200}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('height')}</label>
                        <input type="number" class="form-control" id="editHeight" value="${object.props.height || object.height || 150}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBackground" ${ellipseHasBg ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBackground">Có nền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('backgroundColor')}</label>
                        <input type="color" class="form-control form-control-color" id="editBgColor" value="${object.props.backgroundColor || '#ffc107'}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editHasBorder" ${ellipseHasBorder ? 'checked' : ''}>
                            <label class="form-check-label" for="editHasBorder">Có viền</label>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Màu viền</label>
                        <input type="color" class="form-control form-control-color" id="editBorderColor" value="${object.props.borderColor || '#e0a800'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Độ dày viền</label>
                        <input type="number" class="form-control" id="editBorderWidth" value="${object.props.borderWidth || 2}" min="0">
                    </div>
                `;
                break;
        }

        $form.html(formHtml);
        this.editingObjectId = object.id;

        const modal = new bootstrap.Modal($modal[0]);
        modal.show();
    },

    saveEdit() {
        if (!this.editingObjectId) return;

        const object = ObjectManager.getObject(this.editingObjectId);
        if (!object) return;

        const updates = { props: {} };

        switch(object.type) {
            case 'text':
                updates.props.text = $('#editText').val();
                updates.props.color = $('#editColor').val();
                updates.props.fontSize = parseInt($('#editFontSize').val()) || 16;
                break;

            case 'image':
                const imageUrlVal = $('#editImageUrl').val().trim();
                // Chỉ update imageUrl nếu có giá trị, không thì giữ nguyên
                if (imageUrlVal !== '') {
                    updates.props.imageUrl = imageUrlVal;
                } else {
                    // Giữ lại imageUrl hiện tại nếu input trống
                    updates.props.imageUrl = object.props.imageUrl || '';
                }
                const widthVal = $('#editWidth').val().trim();
                const heightVal = $('#editHeight').val().trim();
                updates.props.width = widthVal === '' ? null : parseInt(widthVal);
                updates.props.height = heightVal === '' ? null : parseInt(heightVal);
                break;

            case 'icon':
                updates.props.icon = $('#editIcon').val();
                updates.props.color = $('#editColor').val();
                updates.props.fontSize = parseInt($('#editFontSize').val()) || 24;
                break;

            case 'button':
                updates.props.text = $('#editText').val();
                updates.props.backgroundColor = $('#editBgColor').val();
                updates.props.color = $('#editColor').val();
                updates.props.fontSize = parseInt($('#editFontSize').val()) || 14;
                break;

            case 'checkbox':
                updates.props.text = $('#editText').val();
                updates.props.checked = $('#editChecked').is(':checked');
                break;

            case 'dropdown':
                const optionsText = $('#editOptions').val();
                updates.props.options = optionsText.split('\n').filter(o => o.trim());
                updates.props.selectedIndex = parseInt($('#editSelectedIndex').val()) || 0;
                break;

            case 'toggle':
                updates.props.texts = {
                    off: $('#editTextOff').val() || 'Toggle',
                    on: $('#editTextOn').val() || 'Toggle'
                };
                updates.props.active = $('#editActive').is(':checked');
                break;

            case 'toggle3state':
                updates.props.texts = {
                    0: $('#editTextState0').val() || '3-State Toggle',
                    1: $('#editTextState1').val() || '3-State Toggle',
                    2: $('#editTextState2').val() || '3-State Toggle'
                };
                updates.props.state = parseInt($('#editState').val()) || 0;
                break;

            case 'rectangle':
                updates.props.width = parseInt($('#editWidth').val()) || 200;
                updates.props.height = parseInt($('#editHeight').val()) || 150;
                updates.props.hasBackground = $('#editHasBackground').is(':checked');
                updates.props.backgroundColor = $('#editBgColor').val() || '#007bff';
                updates.props.hasBorder = $('#editHasBorder').is(':checked');
                updates.props.borderColor = $('#editBorderColor').val() || '#0056b3';
                updates.props.borderWidth = parseInt($('#editBorderWidth').val()) || 2;
                break;

            case 'circle':
                const size = parseInt($('#editSize').val()) || 150;
                updates.props.width = size;
                updates.props.height = size;
                updates.props.hasBackground = $('#editHasBackground').is(':checked');
                updates.props.backgroundColor = $('#editBgColor').val() || '#28a745';
                updates.props.hasBorder = $('#editHasBorder').is(':checked');
                updates.props.borderColor = $('#editBorderColor').val() || '#1e7e34';
                updates.props.borderWidth = parseInt($('#editBorderWidth').val()) || 2;
                break;

            case 'ellipse':
                updates.props.width = parseInt($('#editWidth').val()) || 200;
                updates.props.height = parseInt($('#editHeight').val()) || 150;
                updates.props.hasBackground = $('#editHasBackground').is(':checked');
                updates.props.backgroundColor = $('#editBgColor').val() || '#ffc107';
                updates.props.hasBorder = $('#editHasBorder').is(':checked');
                updates.props.borderColor = $('#editBorderColor').val() || '#e0a800';
                updates.props.borderWidth = parseInt($('#editBorderWidth').val()) || 2;
                break;
        }

        // Đảm bảo giữ lại tất cả props cũ khi update
        const currentObject = ObjectManager.getObject(this.editingObjectId);
        if (currentObject && currentObject.props) {
            // Merge với props hiện tại để không mất dữ liệu
            updates.props = { ...currentObject.props, ...updates.props };
        }

        ObjectManager.updateObject(this.editingObjectId, updates);

        // Re-render object
        const $oldObj = $(`.canvas-object[data-id="${this.editingObjectId}"]`);
        const newObject = ObjectManager.getObject(this.editingObjectId);
        const $newObj = ObjectManager.renderObject(newObject);
        $oldObj.replaceWith($newObj);

        PageManager.saveCurrentPage();

        const modal = bootstrap.Modal.getInstance($('#editObjectModal')[0]);
        modal.hide();
    },

    showBackgroundModal() {
        const page = PageManager.pages[PageManager.currentPageId];
        const background = page.background || {
            color: '#f5f5f5',
            imageUrl: '',
            imageRepeat: 'no-repeat',
            imageSize: 'cover'
        };

        $('#editBackgroundColor').val(background.color || '#f5f5f5');
        $('#editBackgroundImageUrl').val(background.imageUrl || '');
        $('#editBackgroundRepeat').val(background.imageRepeat || 'no-repeat');
        $('#editBackgroundSize').val(background.imageSize || 'cover');

        const modal = new bootstrap.Modal($('#editBackgroundModal')[0]);
        modal.show();
    },

    saveBackground() {
        const background = {
            color: $('#editBackgroundColor').val() || '#f5f5f5',
            imageUrl: $('#editBackgroundImageUrl').val() || '',
            imageRepeat: $('#editBackgroundRepeat').val() || 'no-repeat',
            imageSize: $('#editBackgroundSize').val() || 'cover'
        };

        PageManager.pages[PageManager.currentPageId].background = background;
        PageManager.applyBackground(background);
        PageManager.saveCurrentPage();

        const modal = bootstrap.Modal.getInstance($('#editBackgroundModal')[0]);
        modal.hide();
    }
};
