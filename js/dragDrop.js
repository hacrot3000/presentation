// Drag & Drop Manager
const DragDropManager = {
    isDragging: false,
    isResizing: false,
    dragObject: null,
    resizeObject: null,
    resizeHandle: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,

    init($canvas) {
        this.$canvas = $canvas;
        this.bindEvents();
    },

    bindEvents() {
        // Mouse down trên object
        $(document).on('mousedown', '.canvas-object', (e) => {
            if (e.button !== 0) return; // Chỉ xử lý left click

            // Không drag nếu click vào các element tương tác
            if ($(e.target).is('input, select, .object-toggle-switch, .object-toggle-3state-switch')) {
                return;
            }

            // Kiểm tra nếu click vào resize handle
            if ($(e.target).hasClass('resize-handle')) {
                this.startResize(e, $(e.target));
                return;
            }

            const $obj = $(e.currentTarget);
            const id = $obj.data('id');
            const object = ObjectManager.getObject(id);

            if (!object || !object.draggable) return;

            e.preventDefault();
            e.stopPropagation();

            this.isDragging = true;
            this.dragObject = object;
            $obj.addClass('dragging');

            const canvasOffset = this.$canvas.offset();
            this.startX = e.pageX;
            this.startY = e.pageY;
            this.offsetX = e.pageX - canvasOffset.left - object.x;
            this.offsetY = e.pageY - canvasOffset.top - object.y;

            ObjectManager.selectObject(id);
        });

        // Resize handle events
        $(document).on('mousedown', '.resize-handle', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startResize(e, $(e.target));
        });

        // Mouse move
        $(document).on('mousemove', (e) => {
            if (this.isResizing && this.resizeObject) {
                this.handleResize(e);
                return;
            }

            if (!this.isDragging || !this.dragObject) return;

            const canvasOffset = this.$canvas.offset();
            const newX = e.pageX - canvasOffset.left - this.offsetX;
            const newY = e.pageY - canvasOffset.top - this.offsetY;

            // Giới hạn trong canvas - tính đến kích thước thực tế của object
            const canvasWidth = this.$canvas.width();
            const canvasHeight = this.$canvas.height();
            const $dragObj = $(`.canvas-object[data-id="${this.dragObject.id}"]`);

            // Tính kích thước object - ưu tiên lấy từ DOM, sau đó từ object data
            let objWidth = $dragObj.outerWidth();
            let objHeight = $dragObj.outerHeight();

            // Nếu không lấy được từ DOM hoặc giá trị không hợp lệ, lấy từ object data
            if (!objWidth || objWidth === 0 || isNaN(objWidth)) {
                // Ưu tiên lấy từ props, sau đó từ top level
                if (this.dragObject.type === 'image') {
                    // Image có thể có width/height null
                    objWidth = this.dragObject.props?.width;
                    if (objWidth === null || objWidth === undefined) {
                        // Nếu null, lấy từ DOM của img bên trong
                        const $img = $dragObj.find('img');
                        if ($img.length) {
                            objWidth = $img[0].naturalWidth || $img.width() || 200;
                        } else {
                            objWidth = 200;
                        }
                    }
                } else {
                    objWidth = this.dragObject.props?.width || this.dragObject.width;
                    if (!objWidth || objWidth === null) {
                        objWidth = 50;
                    }
                }
            }

            if (!objHeight || objHeight === 0 || isNaN(objHeight)) {
                if (this.dragObject.type === 'image') {
                    // Image có thể có width/height null
                    objHeight = this.dragObject.props?.height;
                    if (objHeight === null || objHeight === undefined) {
                        // Nếu null, lấy từ DOM của img bên trong
                        const $img = $dragObj.find('img');
                        if ($img.length) {
                            objHeight = $img[0].naturalHeight || $img.height() || 150;
                        } else {
                            objHeight = 150;
                        }
                    }
                } else {
                    objHeight = this.dragObject.props?.height || this.dragObject.height;
                    if (!objHeight || objHeight === null) {
                        objHeight = 50;
                    }
                }
            }

            // Đảm bảo objWidth và objHeight là số dương
            objWidth = Math.max(1, Math.round(objWidth));
            objHeight = Math.max(1, Math.round(objHeight));

            const clampedX = Math.max(0, Math.min(newX, canvasWidth - objWidth));
            const clampedY = Math.max(0, Math.min(newY, canvasHeight - objHeight));

            ObjectManager.updateObject(this.dragObject.id, {
                x: clampedX,
                y: clampedY
            });

            $dragObj.css({
                left: clampedX + 'px',
                top: clampedY + 'px'
            });
        });

        // Mouse up
        $(document).on('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.dragObject) {
                    $(`.canvas-object[data-id="${this.dragObject.id}"]`).removeClass('dragging');
                }
                this.dragObject = null;
            }

            if (this.isResizing) {
                this.isResizing = false;
                if (this.resizeObject) {
                    const $obj = $(`.canvas-object[data-id="${this.resizeObject.id}"]`);
                    $obj.removeClass('resizing');
                    $obj.find('.resize-handle').hide();
                    PageManager.saveCurrentPage();
                }
                this.resizeObject = null;
                this.resizeHandle = null;
            }
        });
    },

    startResize(e, $handle) {
        const $obj = $handle.closest('.canvas-object');
        const id = $obj.data('id');
        const object = ObjectManager.getObject(id);

        if (!object) return;

        this.isResizing = true;
        this.resizeObject = object;
        this.resizeHandle = $handle.data('position');
        $obj.addClass('resizing');

        const canvasOffset = this.$canvas.offset();
        this.startX = e.pageX;
        this.startY = e.pageY;
        this.startWidth = $obj.width();
        this.startHeight = $obj.height();
        this.startLeft = $obj.position().left;
        this.startTop = $obj.position().top;
    },

    handleResize(e) {
        if (!this.resizeObject || !this.resizeHandle) return;

        const $obj = $(`.canvas-object[data-id="${this.resizeObject.id}"]`);
        const canvasOffset = this.$canvas.offset();
        const deltaX = e.pageX - this.startX;
        const deltaY = e.pageY - this.startY;

        let newWidth = this.startWidth;
        let newHeight = this.startHeight;
        let newLeft = this.startLeft;
        let newTop = this.startTop;

        const position = this.resizeHandle;
        const minSize = 20;

        // Tính toán width và height dựa trên handle position
        switch(position) {
            case 'nw': // top-left
                newWidth = Math.max(minSize, this.startWidth - deltaX);
                newHeight = Math.max(minSize, this.startHeight - deltaY);
                newLeft = this.startLeft + (this.startWidth - newWidth);
                newTop = this.startTop + (this.startHeight - newHeight);
                break;
            case 'n': // top
                newHeight = Math.max(minSize, this.startHeight - deltaY);
                newTop = this.startTop + (this.startHeight - newHeight);
                break;
            case 'ne': // top-right
                newWidth = Math.max(minSize, this.startWidth + deltaX);
                newHeight = Math.max(minSize, this.startHeight - deltaY);
                newTop = this.startTop + (this.startHeight - newHeight);
                break;
            case 'e': // right
                newWidth = Math.max(minSize, this.startWidth + deltaX);
                break;
            case 'se': // bottom-right
                newWidth = Math.max(minSize, this.startWidth + deltaX);
                newHeight = Math.max(minSize, this.startHeight + deltaY);
                break;
            case 's': // bottom
                newHeight = Math.max(minSize, this.startHeight + deltaY);
                break;
            case 'sw': // bottom-left
                newWidth = Math.max(minSize, this.startWidth - deltaX);
                newHeight = Math.max(minSize, this.startHeight + deltaY);
                newLeft = this.startLeft + (this.startWidth - newWidth);
                break;
            case 'w': // left
                newWidth = Math.max(minSize, this.startWidth - deltaX);
                newLeft = this.startLeft + (this.startWidth - newWidth);
                break;
        }

        // Giới hạn trong canvas
        const canvasWidth = this.$canvas.width();
        const canvasHeight = this.$canvas.height();
        newLeft = Math.max(0, Math.min(newLeft, canvasWidth - newWidth));
        newTop = Math.max(0, Math.min(newTop, canvasHeight - newHeight));
        newWidth = Math.min(newWidth, canvasWidth - newLeft);
        newHeight = Math.min(newHeight, canvasHeight - newTop);

        // Cập nhật object
        const object = ObjectManager.getObject(this.resizeObject.id);
        const updates = {
            x: newLeft,
            y: newTop,
            width: newWidth,
            height: newHeight
        };

        // Đảm bảo giữ lại tất cả props hiện tại
        const currentProps = object.props || {};
        updates.props = { ...currentProps };

        // Cập nhật props theo type
        if (object.type === 'image') {
            // Image có thể có width/height null
            // Khi resize, luôn set cả width và height (không giữ null)
            // Nhưng giữ lại imageUrl và các props khác
            updates.props.width = newWidth;
            updates.props.height = newHeight;
        } else if (object.type === 'circle') {
            // Circle luôn giữ width = height
            const size = Math.min(newWidth, newHeight);
            updates.width = size;
            updates.height = size;
            updates.props.width = size;
            updates.props.height = size;
        } else {
            // Rectangle, ellipse, button - lưu vào cả top level và props
            updates.props.width = newWidth;
            updates.props.height = newHeight;
        }

        ObjectManager.updateObject(this.resizeObject.id, updates);

        // Cập nhật CSS
        $obj.css({
            left: newLeft + 'px',
            top: newTop + 'px',
            width: newWidth + 'px',
            height: newHeight + 'px'
        });

        // Đối với image, cần cập nhật cả img bên trong và container
        if (object.type === 'image') {
            const $img = $obj.find('img');
            if ($img.length) {
                // Cập nhật style của img để hiển thị đúng kích thước
                // Khi resize, cả width và height đều có giá trị (không null)
                $img.css({
                    width: newWidth + 'px',
                    height: newHeight + 'px',
                    maxWidth: 'none',
                    maxHeight: 'none'
                });
            }
            // Đảm bảo container cũng có kích thước đúng
            $obj.css({
                width: newWidth + 'px',
                height: newHeight + 'px'
            });
        }

        // Cập nhật lại handles
        ObjectManager.updateResizeHandles($obj);
    }
};
