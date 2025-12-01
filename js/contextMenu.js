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
            const id = $(e.currentTarget).data('id');
            this.showMenu(e.pageX, e.pageY, id);
        });

        // Right click trên canvas (thêm object)
        $(document).on('contextmenu', '#canvas', (e) => {
            e.preventDefault();
            this.showCanvasMenu(e.pageX, e.pageY, e);
        });

        // Click để đóng menu (nhưng không đóng khi click vào menu)
        $(document).on('click', (e) => {
            if (!$(e.target).closest('.context-menu').length) {
                this.hideMenu();
            }
        });

        // Menu actions
        $(document).on('click', '.context-menu [data-action]', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const action = $(e.currentTarget).data('action');
            this.handleAction(action);
            this.hideMenu();
        });
    },

    showMenu(x, y, objectId) {
        this.currentObjectId = objectId;
        ObjectManager.selectObject(objectId);

        // Đảm bảo menu có đầy đủ các action với translation
        this.updateContextMenu();

        this.$menu.css({
            left: x + 'px',
            top: y + 'px',
            display: 'block'
        });
    },

    updateContextMenu() {
        // Cập nhật translation cho context menu
        const menuHtml = `
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action" data-action="edit">${LanguageManager.t('edit')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="delete">${LanguageManager.t('delete')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="bringToFront">${LanguageManager.t('bringToFront')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="sendToBack">${LanguageManager.t('sendToBack')}</a>
                <a href="#" class="list-group-item list-group-item-action" data-action="toggleDraggable">${LanguageManager.t('toggleDraggable')}</a>
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
        const types = ['text', 'image', 'icon', 'button', 'checkbox', 'dropdown', 'toggle', 'toggle3state'];
        const typeKeys = {
            text: 'text',
            image: 'image',
            icon: 'icon',
            button: 'button',
            checkbox: 'checkbox',
            dropdown: 'dropdown',
            toggle: 'toggle',
            toggle3state: 'toggle3state'
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
            PageManager.saveCurrentPage();
            return;
        }

        if (action === 'edit-background') {
            this.showBackgroundModal();
            return;
        }

        if (!this.currentObjectId) return;

        const object = ObjectManager.getObject(this.currentObjectId);
        if (!object) return;

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
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('imageUrl')}</label>
                        <input type="text" class="form-control" id="editImageUrl" value="${object.props.imageUrl || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('width')}</label>
                        <input type="number" class="form-control" id="editWidth" value="${object.props.width || 200}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('height')}</label>
                        <input type="number" class="form-control" id="editHeight" value="${object.props.height || 150}">
                    </div>
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
                const toggleTexts = object.props.texts || { off: 'Toggle', on: 'Toggle' };
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">Text khi OFF</label>
                        <input type="text" class="form-control" id="editTextOff" value="${toggleTexts.off || 'Toggle'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Text khi ON</label>
                        <input type="text" class="form-control" id="editTextOn" value="${toggleTexts.on || 'Toggle'}">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="editActive" ${object.props.active ? 'checked' : ''}>
                            <label class="form-check-label" for="editActive">${LanguageManager.t('active')}</label>
                        </div>
                    </div>
                `;
                break;

            case 'toggle3state':
                const stateTexts = object.props.texts || {
                    0: '3-State Toggle',
                    1: '3-State Toggle',
                    2: '3-State Toggle'
                };
                formHtml = `
                    <div class="mb-3">
                        <label class="form-label">Text State 0 (Red)</label>
                        <input type="text" class="form-control" id="editTextState0" value="${stateTexts[0] || '3-State Toggle'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Text State 1 (Yellow)</label>
                        <input type="text" class="form-control" id="editTextState1" value="${stateTexts[1] || '3-State Toggle'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Text State 2 (Green)</label>
                        <input type="text" class="form-control" id="editTextState2" value="${stateTexts[2] || '3-State Toggle'}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">${LanguageManager.t('state')}</label>
                        <input type="number" class="form-control" id="editState" value="${object.props.state || 0}" min="0" max="2">
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
                updates.props.imageUrl = $('#editImageUrl').val();
                updates.props.width = parseInt($('#editWidth').val()) || 200;
                updates.props.height = parseInt($('#editHeight').val()) || 150;
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
