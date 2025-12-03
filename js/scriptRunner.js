// Script Runner - Chạy kịch bản click
const ScriptRunner = {
    currentScript: [],
    currentIndex: 0,

    // Load script cho trang
    loadScript(script) {
        this.currentScript = script || [];
        this.currentIndex = 0;
    },

    // Kiểm tra và ẩn các objects cần ẩn mặc định khi load trang
    // Objects có action "show" mà trước đó không có "hide" sẽ được ẩn đi
    // Ví dụ: object1 có show -> ẩn mặc định
    //        object2 có hide rồi mới có show -> hiển thị mặc định
    initializeObjectVisibility(script) {
        if (!script || script.length === 0) return;

        // Track cho mỗi object: có hide trước show đầu tiên không
        const objectStates = {}; // { objectId: { hasHideBeforeFirstShow: boolean, firstShowIndex: number } }

        // Duyệt qua script để phân tích
        script.forEach((action, index) => {
            if (action.type === 'show' || action.type === 'hide') {
                const targets = Array.isArray(action.target) ? action.target : [action.target];

                targets.forEach(targetId => {
                    // Khởi tạo state cho object nếu chưa có
                    if (!objectStates[targetId]) {
                        objectStates[targetId] = {
                            hasHideBeforeFirstShow: false,
                            firstShowIndex: null
                        };
                    }

                    if (action.type === 'show') {
                        // Nếu đây là show đầu tiên của object này
                        if (objectStates[targetId].firstShowIndex === null) {
                            objectStates[targetId].firstShowIndex = index;
                        }
                    } else if (action.type === 'hide') {
                        // Nếu có hide trước show đầu tiên (hoặc chưa có show nào)
                        if (objectStates[targetId].firstShowIndex === null ||
                            index < objectStates[targetId].firstShowIndex) {
                            objectStates[targetId].hasHideBeforeFirstShow = true;
                        }
                    }
                });
            }
        });

        // Ẩn các objects có show mà không có hide trước đó
        Object.keys(objectStates).forEach(objectId => {
            const state = objectStates[objectId];
            // Nếu object có show (firstShowIndex !== null) và không có hide trước đó
            if (state.firstShowIndex !== null && !state.hasHideBeforeFirstShow) {
                const object = ObjectManager.getObject(objectId);
                if (object) {
                    ObjectManager.updateObject(objectId, { visible: false });
                    $(`.canvas-object[data-id="${objectId}"]`).addClass('hidden');
                }
            }
        });
    },

    // Chạy action tiếp theo
    runNext() {
        if (this.currentIndex >= this.currentScript.length) {
            // Kiểm tra xem có bật tự động chuyển trang không
            const autoAdvance = localStorage.getItem('autoAdvancePage') !== 'false'; // Mặc định là true
            if (autoAdvance) {
                // Tự động chuyển sang trang sau
                PageManager.nextPage();
            } else {
                console.log('Script đã chạy hết');
            }
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
                this.showObjects(action.target, action.effect, action.duration);
                break;
            case 'hide':
                this.hideObjects(action.target, action.effect, action.duration);
                break;
            case 'move':
                this.moveObject(action.target, action.x, action.y, action.time || 2000);
                break;
        }
    },

    // Hiển thị objects
    showObjects(targets, effect, duration) {
        const targetArray = Array.isArray(targets) ? targets : [targets];
        const effectType = effect || 'none';
        const effectDuration = duration || 500;

        targetArray.forEach(targetId => {
            const object = ObjectManager.getObject(targetId);
            if (!object) return;

            const $obj = $(`.canvas-object[data-id="${targetId}"]`);

            // Cập nhật state trước
            ObjectManager.updateObject(targetId, { visible: true });

            // Dừng mọi animation hiện tại và clear queue
            $obj.stop(true, true);

            // Xóa class hidden TRƯỚC (quan trọng vì CSS có !important)
            $obj.removeClass('hidden');

            // Force reflow để đảm bảo DOM đã update
            $obj[0].offsetHeight;

            // Áp dụng hiệu ứng
            switch(effectType) {
                case 'fade':
                    // Set display block và opacity 0
                    $obj.css({ display: 'block', opacity: 0 });
                    // Animate opacity từ 0 lên 1
                    $obj.animate({ opacity: 1 }, effectDuration, function() {
                        // Clear opacity sau khi animation xong để về giá trị mặc định
                        $obj.css('opacity', '');
                    });
                    break;
                case 'slide':
                    // slideDown sẽ tự động set display và animate height
                    $obj.css({ display: 'block' });
                    $obj.slideDown(effectDuration);
                    break;
                default:
                    // Không hiệu ứng
                    $obj.css({ display: 'block', opacity: '', height: '' });
                    break;
            }
        });
    },

    // Ẩn objects
    hideObjects(targets, effect, duration) {
        const targetArray = Array.isArray(targets) ? targets : [targets];
        const effectType = effect || 'none';
        const effectDuration = duration || 500;

        targetArray.forEach(targetId => {
            const object = ObjectManager.getObject(targetId);
            if (!object) return;

            const $obj = $(`.canvas-object[data-id="${targetId}"]`);

            // Dừng mọi animation hiện tại và xóa queue
            $obj.stop(true, false);

            // Áp dụng hiệu ứng trước khi ẩn
            switch(effectType) {
                case 'fade':
                    $obj.fadeOut(effectDuration, function() {
                        ObjectManager.updateObject(targetId, { visible: false });
                        $obj.addClass('hidden').css({ display: 'none', opacity: '' });
                    });
                    break;
                case 'slide':
                    $obj.slideUp(effectDuration, function() {
                        ObjectManager.updateObject(targetId, { visible: false });
                        $obj.addClass('hidden').css({ display: 'none', height: '' });
                    });
                    break;
                default:
                    // Không hiệu ứng
                    ObjectManager.updateObject(targetId, { visible: false });
                    $obj.addClass('hidden').css({ display: 'none' });
                    break;
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
