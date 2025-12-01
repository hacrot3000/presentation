// Drag & Drop Manager
const DragDropManager = {
    isDragging: false,
    dragObject: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,

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

        // Mouse move
        $(document).on('mousemove', (e) => {
            if (!this.isDragging || !this.dragObject) return;

            const canvasOffset = this.$canvas.offset();
            const newX = e.pageX - canvasOffset.left - this.offsetX;
            const newY = e.pageY - canvasOffset.top - this.offsetY;

            // Giới hạn trong canvas
            const canvasWidth = this.$canvas.width();
            const canvasHeight = this.$canvas.height();
            const clampedX = Math.max(0, Math.min(newX, canvasWidth - 50));
            const clampedY = Math.max(0, Math.min(newY, canvasHeight - 50));

            ObjectManager.updateObject(this.dragObject.id, {
                x: clampedX,
                y: clampedY
            });

            const $obj = $(`.canvas-object[data-id="${this.dragObject.id}"]`);
            $obj.css({
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
        });
    }
};
