// Script Runner - Chạy kịch bản click
const ScriptRunner = {
    currentScript: [],
    currentIndex: 0,

    // Load script cho trang
    loadScript(script) {
        this.currentScript = script || [];
        this.currentIndex = 0;
    },

    // Chạy action tiếp theo
    runNext() {
        if (this.currentIndex >= this.currentScript.length) {
            console.log('Script đã chạy hết');
            return;
        }

        const action = this.currentScript[this.currentIndex];
        this.executeAction(action);
        this.currentIndex++;
    },

    // Chạy action cụ thể
    executeAction(action) {
        if (!action || !action.type) return;

        switch(action.type) {
            case 'show':
                this.showObjects(action.target);
                break;
            case 'hide':
                this.hideObjects(action.target);
                break;
            case 'move':
                this.moveObject(action.target, action.x, action.y, action.time || 2000);
                break;
        }
    },

    // Hiển thị objects
    showObjects(targets) {
        const targetArray = Array.isArray(targets) ? targets : [targets];
        targetArray.forEach(targetId => {
            const object = ObjectManager.getObject(targetId);
            if (object) {
                ObjectManager.updateObject(targetId, { visible: true });
                $(`.canvas-object[data-id="${targetId}"]`).removeClass('hidden');
            }
        });
    },

    // Ẩn objects
    hideObjects(targets) {
        const targetArray = Array.isArray(targets) ? targets : [targets];
        targetArray.forEach(targetId => {
            const object = ObjectManager.getObject(targetId);
            if (object) {
                ObjectManager.updateObject(targetId, { visible: false });
                $(`.canvas-object[data-id="${targetId}"]`).addClass('hidden');
            }
        });
    },

    // Di chuyển object
    moveObject(targetId, x, y, time) {
        const object = ObjectManager.getObject(targetId);
        if (!object) return;

        const $obj = $(`.canvas-object[data-id="${targetId}"]`);
        const startX = object.x;
        const startY = object.y;

        // Animation đơn giản
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / time, 1);

            const currentX = startX + (x - startX) * progress;
            const currentY = startY + (y - startY) * progress;

            ObjectManager.updateObject(targetId, {
                x: currentX,
                y: currentY
            });

            $obj.css({
                left: currentX + 'px',
                top: currentY + 'px'
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                ObjectManager.updateObject(targetId, { x: x, y: y });
            }
        };

        animate();
    },

    // Reset script
    reset() {
        this.currentIndex = 0;
    }
};
