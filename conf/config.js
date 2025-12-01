// Cấu hình mặc định
const config = {
    defaultObjectPosition: { x: 50, y: 50 },
    defaultTextProps: {
        text: "Text",
        color: "#000000",
        fontSize: 16
    },
    defaultImageProps: {
        imageUrl: "./img/images_placeholder.jpg",
        width: null, // null để tự động scale
        height: null // null để tự động scale
    },
    defaultRectangleProps: {
        width: 200,
        height: 150,
        hasBackground: true,
        backgroundColor: "#007bff",
        hasBorder: true,
        borderColor: "#0056b3",
        borderWidth: 2
    },
    defaultCircleProps: {
        width: 150,
        height: 150,
        hasBackground: true,
        backgroundColor: "#28a745",
        hasBorder: true,
        borderColor: "#1e7e34",
        borderWidth: 2
    },
    defaultEllipseProps: {
        width: 200,
        height: 150,
        hasBackground: true,
        backgroundColor: "#ffc107",
        hasBorder: true,
        borderColor: "#e0a800",
        borderWidth: 2
    },
    defaultIconProps: {
        icon: "fa-solid fa-user",
        fontSize: 24,
        color: "#000000"
    },
    defaultButtonProps: {
        text: "Button",
        color: "#007bff",
        backgroundColor: "#007bff",
        fontSize: 14
    },
    defaultCheckboxProps: {
        text: "Checkbox",
        checked: false
    },
    defaultDropdownProps: {
        options: ["Option 1", "Option 2", "Option 3"],
        selectedIndex: 0
    },
    defaultToggleProps: {
        texts: {
            off: "Toggle",
            on: "Toggle"
        },
        active: false
    },
    defaultToggle3StateProps: {
        texts: {
            0: "3-State Toggle",
            1: "3-State Toggle",
            2: "3-State Toggle"
        },
        state: 0 // 0: red, 1: yellow, 2: green
    },
    commonIcons: [
        "fa-solid fa-user",
        "fa-solid fa-user-circle",
        "fa-solid fa-clock",
        "fa-solid fa-arrow-right",
        "fa-solid fa-arrow-left",
        "fa-solid fa-home",
        "fa-solid fa-star",
        "fa-solid fa-heart",
        "fa-solid fa-envelope",
        "fa-solid fa-phone"
    ]
};
