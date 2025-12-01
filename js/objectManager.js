// Object Manager - Quản lý các object trên canvas
const ObjectManager = {
    objects: {},
    selectedObject: null,
    nextId: 1,

    // Tạo ID mới
    generateId() {
        return 'obj_' + this.nextId++;
    },

    // Khởi tạo ID từ danh sách objects
    initId(objects) {
        if (!objects || objects.length === 0) {
            this.nextId = 1;
            return;
        }
        let maxId = 0;
        objects.forEach(obj => {
            const match = obj.id.match(/obj_(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxId) maxId = num;
            }
        });
        this.nextId = maxId + 1;
    },

    // Tạo object mới
    createObject(type, x, y, props = {}) {
        const id = this.generateId();
        const defaultProps = this.getDefaultProps(type);

        // Merge props, đảm bảo texts được copy đúng (deep copy)
        const mergedProps = { ...defaultProps };
        if (defaultProps.texts) {
            mergedProps.texts = { ...defaultProps.texts };
        }
        Object.assign(mergedProps, props);
        if (props.texts) {
            mergedProps.texts = { ...props.texts };
        }

        const object = {
            id: id,
            type: type,
            x: x || config.defaultObjectPosition.x,
            y: y || config.defaultObjectPosition.y,
            width: null,
            height: null,
            draggable: true,
            visible: true,
            zIndex: 1,
            props: mergedProps
        };

        this.objects[id] = object;
        return object;
    },

    // Lấy default props theo type
    getDefaultProps(type) {
        switch(type) {
            case 'text':
                return { ...config.defaultTextProps };
            case 'image':
                return { ...config.defaultImageProps };
            case 'icon':
                return { ...config.defaultIconProps };
            case 'button':
                return { ...config.defaultButtonProps };
            case 'checkbox':
                return { ...config.defaultCheckboxProps };
            case 'dropdown':
                return { ...config.defaultDropdownProps };
            case 'toggle':
                return { ...config.defaultToggleProps };
            case 'toggle3state':
                return { ...config.defaultToggle3StateProps };
            default:
                return {};
        }
    },

    // Render object thành HTML
    renderObject(object) {
        const $obj = $('<div>')
            .addClass('canvas-object')
            .attr('data-id', object.id)
            .css({
                left: object.x + 'px',
                top: object.y + 'px',
                zIndex: object.zIndex
            });

        if (!object.draggable) {
            $obj.addClass('not-draggable');
        }

        if (!object.visible) {
            $obj.addClass('hidden');
        }

        // Render theo type
        switch(object.type) {
            case 'text':
                $obj.addClass('object-text')
                    .text(object.props.text || 'Text')
                    .css({
                        color: object.props.color || '#000',
                        fontSize: (object.props.fontSize || 16) + 'px'
                    });
                break;

            case 'image':
                $obj.addClass('object-image')
                    .css({
                        width: object.props.width || 200,
                        height: object.props.height || 150
                    })
                    .html(`<img src="${object.props.imageUrl || ''}" alt="Image">`);
                break;

            case 'icon':
                $obj.addClass('object-icon')
                    .html(`<i class="${object.props.icon || 'fa-solid fa-user'}"></i>`)
                    .css({
                        fontSize: (object.props.fontSize || 24) + 'px',
                        color: object.props.color || '#000'
                    });
                break;

            case 'button':
                $obj.addClass('object-button')
                    .text(object.props.text || 'Button')
                    .css({
                        backgroundColor: object.props.backgroundColor || '#007bff',
                        color: object.props.color || '#fff',
                        fontSize: (object.props.fontSize || 14) + 'px'
                    });
                break;

            case 'checkbox':
                const checked = object.props.checked ? 'checked' : '';
                const checkboxText = object.props.text || 'Checkbox';
                $obj.addClass('object-checkbox')
                    .html(`
                        <input type="checkbox" ${checked} data-object-id="${object.id}">
                        <span>${checkboxText}</span>
                    `);
                // Bind event để lưu state
                $obj.find('input[type="checkbox"]').on('change', function() {
                    const isChecked = $(this).is(':checked');
                    ObjectManager.updateObject(object.id, { props: { checked: isChecked } });
                    PageManager.saveCurrentPage();
                });
                break;

            case 'dropdown':
                const options = object.props.options || ['Option 1', 'Option 2', 'Option 3'];
                const selectedIndex = object.props.selectedIndex || 0;
                let optionsHtml = options.map((opt, idx) =>
                    `<option value="${idx}" ${idx === selectedIndex ? 'selected' : ''}>${opt}</option>`
                ).join('');
                $obj.addClass('object-dropdown')
                    .html(`<select data-object-id="${object.id}">${optionsHtml}</select>`);
                // Bind event để lưu state
                $obj.find('select').on('change', function() {
                    const selectedIdx = parseInt($(this).val());
                    ObjectManager.updateObject(object.id, { props: { selectedIndex: selectedIdx } });
                    PageManager.saveCurrentPage();
                });
                break;

            case 'toggle':
                // Đảm bảo texts được khởi tạo đúng
                if (!object.props.texts) {
                    object.props.texts = { off: 'Toggle', on: 'Toggle' };
                }
                const toggleActive = object.props.active === true; // Đảm bảo boolean
                const toggleTexts = object.props.texts;
                const toggleText = toggleActive ? toggleTexts.on : toggleTexts.off;
                const toggleClass = toggleActive ? 'active' : '';
                $obj.addClass('object-toggle')
                    .html(`
                        <span>${toggleText}</span>
                        <div class="object-toggle-switch ${toggleClass}" data-object-id="${object.id}"></div>
                    `);
                // Bind event để toggle
                $obj.find('.object-toggle-switch').on('click', function(e) {
                    e.stopPropagation();
                    const objId = $(this).data('object-id');
                    const obj = ObjectManager.getObject(objId);
                    if (obj) {
                        const newActive = !obj.props.active;
                        // Đảm bảo giữ lại texts khi update
                        const currentTexts = obj.props.texts || { off: 'Toggle', on: 'Toggle' };
                        ObjectManager.updateObject(objId, {
                            props: {
                                active: newActive,
                                texts: currentTexts // Giữ lại texts
                            }
                        });
                        // Re-render để cập nhật text và state
                        const $oldObj = $(`.canvas-object[data-id="${objId}"]`);
                        const updatedObj = ObjectManager.getObject(objId);
                        const $newObj = ObjectManager.renderObject(updatedObj);
                        $oldObj.replaceWith($newObj);
                        PageManager.saveCurrentPage();
                    }
                });
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
                const currentState = object.props.state !== undefined ? object.props.state : 0;
                const stateTexts = object.props.texts;
                const stateText = stateTexts[currentState] || stateTexts[0] || '3-State Toggle';
                const stateClass = `state-${currentState}`;
                $obj.addClass('object-toggle-3state')
                    .html(`
                        <span>${stateText}</span>
                        <div class="object-toggle-3state-switch ${stateClass}" data-object-id="${object.id}"></div>
                    `);
                // Bind event để cycle state
                $obj.find('.object-toggle-3state-switch').on('click', function(e) {
                    e.stopPropagation();
                    const objId = $(this).data('object-id');
                    const obj = ObjectManager.getObject(objId);
                    if (obj) {
                        const currentState = obj.props.state || 0;
                        const nextState = (currentState + 1) % 3; // Cycle 0 -> 1 -> 2 -> 0
                        // Đảm bảo giữ lại texts khi update
                        const currentTexts = obj.props.texts || {
                            0: '3-State Toggle',
                            1: '3-State Toggle',
                            2: '3-State Toggle'
                        };
                        ObjectManager.updateObject(objId, {
                            props: {
                                state: nextState,
                                texts: currentTexts // Giữ lại texts
                            }
                        });
                        // Re-render để cập nhật text và state
                        const $oldObj = $(`.canvas-object[data-id="${objId}"]`);
                        const updatedObj = ObjectManager.getObject(objId);
                        const $newObj = ObjectManager.renderObject(updatedObj);
                        $oldObj.replaceWith($newObj);
                        PageManager.saveCurrentPage();
                    }
                });
                break;
        }

        return $obj;
    },

    // Thêm object vào canvas
    addObjectToCanvas(object, $canvas) {
        const $obj = this.renderObject(object);
        $canvas.append($obj);
        return $obj;
    },

    // Cập nhật object
    updateObject(id, updates) {
        if (this.objects[id]) {
            Object.assign(this.objects[id], updates);
            if (updates.props) {
                // Merge props, đảm bảo giữ lại nested objects như texts
                const currentProps = this.objects[id].props || {};
                const newProps = { ...currentProps };

                // Merge từng property, đặc biệt xử lý nested objects
                Object.keys(updates.props).forEach(key => {
                    if (key === 'texts' && typeof updates.props[key] === 'object' && updates.props[key] !== null) {
                        // Deep merge cho texts - giữ lại tất cả các keys
                        newProps[key] = { ...currentProps[key], ...updates.props[key] };
                    } else {
                        newProps[key] = updates.props[key];
                    }
                });

                this.objects[id].props = newProps;
            }
            return this.objects[id];
        }
        return null;
    },

    // Xóa object
    deleteObject(id) {
        if (this.objects[id]) {
            delete this.objects[id];
            $(`.canvas-object[data-id="${id}"]`).remove();
            if (this.selectedObject === id) {
                this.selectedObject = null;
            }
            return true;
        }
        return false;
    },

    // Lấy object
    getObject(id) {
        return this.objects[id] || null;
    },

    // Lấy tất cả objects
    getAllObjects() {
        return Object.values(this.objects);
    },

    // Clear tất cả objects
    clear() {
        this.objects = {};
        this.selectedObject = null;
        this.nextId = 1;
    },

    // Load objects từ data
    loadObjects(objectsData, $canvas) {
        this.clear();
        if (!objectsData || objectsData.length === 0) {
            return;
        }

        this.initId(objectsData);

        objectsData.forEach(objData => {
            const props = objData.props || {};

            // Migration: Nếu toggle không có texts, tạo từ text cũ hoặc dùng default
            if (objData.type === 'toggle' && !props.texts) {
                const defaultText = props.text || 'Toggle';
                props.texts = {
                    off: defaultText,
                    on: defaultText
                };
                delete props.text; // Xóa prop cũ
            }

            // Migration: Nếu toggle3state không có texts, tạo từ text cũ hoặc dùng default
            if (objData.type === 'toggle3state' && !props.texts) {
                const defaultText = props.text || '3-State Toggle';
                props.texts = {
                    0: defaultText,
                    1: defaultText,
                    2: defaultText
                };
                delete props.text; // Xóa prop cũ
            }

            const object = {
                id: objData.id,
                type: objData.type,
                x: objData.x,
                y: objData.y,
                width: objData.width,
                height: objData.height,
                draggable: objData.draggable !== false,
                visible: objData.visible !== false,
                zIndex: objData.zIndex || 1,
                props: props
            };

            this.objects[object.id] = object;
            this.addObjectToCanvas(object, $canvas);
        });
    },

    // Export objects thành array
    exportObjects() {
        return this.getAllObjects().map(obj => ({
            id: obj.id,
            type: obj.type,
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            draggable: obj.draggable,
            visible: obj.visible,
            zIndex: obj.zIndex,
            props: { ...obj.props }
        }));
    },

    // Select object
    selectObject(id) {
        $('.canvas-object').removeClass('selected');
        if (id && this.objects[id]) {
            this.selectedObject = id;
            $(`.canvas-object[data-id="${id}"]`).addClass('selected');
        } else {
            this.selectedObject = null;
        }
    }
};
