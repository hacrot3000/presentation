# 📊 Ứng dụng Web Trình diễn

Ứng dụng web đơn giản để tạo và quản lý nhiều trang trình diễn với các object có thể kéo thả, chỉnh sửa và hiển thị theo kịch bản.

## 🚀 Tính năng

- ✅ **Nhiều trang trình diễn**: Tạo và quản lý nhiều trang trình diễn
- ✅ **Nhiều loại object**: Text, Image, Icon, Button, Checkbox, Dropdown, Toggle Button, 3/4-state Toggle Switch
- ✅ **Kéo thả**: Kéo thả object trên canvas
- ✅ **Chỉnh sửa**: Click phải để chỉnh sửa, xóa, thay đổi thuộc tính object
- ✅ **Kịch bản**: Tạo script với các action show/hide/move, click canvas để chạy
- ✅ **Lưu trữ**: Tự động lưu vào localStorage, export/import JSON
- ✅ **Background**: Tùy chỉnh màu nền và hình nền cho từng trang (màu nền, hình nền URL, repeat, size)
- ✅ **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh, chuyển đổi dễ dàng

## 📁 Cấu trúc thư mục

```
presentation/
├── index.html          # File HTML chính
├── css/
│   └── style.css      # CSS styling
├── js/
│   ├── app.js         # Main app - khởi tạo và kết nối modules
│   ├── storage.js     # Quản lý localStorage
│   ├── objectManager.js # Quản lý các object trên canvas
│   ├── dragDrop.js    # Chức năng kéo thả
│   ├── contextMenu.js # Menu chuột phải và chỉnh sửa
│   ├── scriptRunner.js # Chạy kịch bản
│   ├── pageManager.js # Quản lý nhiều trang
│   └── language.js    # Quản lý đa ngôn ngữ
├── conf/
│   └── config.js      # Cấu hình mặc định
├── README.md          # File hướng dẫn tiếng Việt
└── README_EN.md       # File hướng dẫn tiếng Anh
```

## 🎯 Hướng dẫn sử dụng

### 1. Khởi động ứng dụng

Mở file `index.html` trong trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari).

### 2. Giao diện

Ứng dụng có 3 khu vực chính:

- **Thanh công cụ trên cùng**:
  - Nút Prev/Next để chuyển trang
  - Nút "Thêm trang mới" để tạo trang mới
  - Hiển thị số trang hiện tại
  - Nút "Lưu trạng thái" để export JSON
  - Nút "Script Editor" để chỉnh sửa script

- **Sidebar bên trái**: Danh sách các loại object có thể thêm
- **Canvas bên phải**: Khu vực trình diễn, nơi hiển thị và chỉnh sửa objects

**Chuyển đổi ngôn ngữ**: Click vào nút VI/EN trên thanh công cụ để chuyển đổi giữa tiếng Việt và tiếng Anh. Ngôn ngữ được lưu tự động và sẽ được khôi phục khi reload trang.

### 3. Thêm Object

**Cách 1**: Click vào loại object trong sidebar → Object sẽ được thêm vào vị trí mặc định (50, 50)

**Cách 2**: Click phải vào canvas → Chọn loại object → Object sẽ được thêm tại vị trí click

### 4. Kéo thả Object

- Click và giữ chuột trái trên object để kéo thả
- Object sẽ được di chuyển theo con trỏ chuột
- Thả chuột để đặt object tại vị trí mới
- Object tự động được lưu khi thả chuột

### 5. Chỉnh sửa Object

**Click phải vào object** để hiện context menu với các tùy chọn:

- **Chỉnh sửa**: Mở dialog để chỉnh các thuộc tính của object
- **Xóa**: Xóa object khỏi canvas
- **Bring to Front**: Đưa object lên trên cùng (z-index cao nhất)
- **Send to Back**: Đưa object xuống dưới cùng (z-index thấp nhất)
- **Toggle Draggable**: Bật/tắt khả năng kéo thả của object

### 6. Chỉnh sửa Background trang

**Click phải vào canvas** (không phải object) → Chọn "Chỉnh sửa Background" để:

- **Màu nền**: Chọn màu nền cho trang (color picker)
- **Hình nền**: Nhập URL ảnh để làm hình nền (để trống nếu không muốn dùng)
- **Lặp lại hình nền**:
  - Không lặp (no-repeat)
  - Lặp lại (repeat)
  - Lặp theo chiều ngang (repeat-x)
  - Lặp theo chiều dọc (repeat-y)
- **Kích thước hình nền**:
  - Cover (phủ toàn bộ canvas)
  - Contain (giữ nguyên tỷ lệ)
  - Auto (kích thước gốc)
  - 100% x 100% (kéo dãn)

Background được lưu riêng cho từng trang và tự động áp dụng khi chuyển trang.

### 7. Tạo Script (Kịch bản)

1. Click nút **"Script Editor"** trên thanh công cụ
2. Trong textarea, nhập JSON script hoặc click **"Thêm Action"** để thêm từng action
3. Các loại action:
   - **show**: Hiển thị object(s)
     ```json
     { "type": "show", "target": ["obj_1", "obj_2"] }
     ```
   - **hide**: Ẩn object(s)
     ```json
     { "type": "hide", "target": ["obj_3"] }
     ```
   - **move**: Di chuyển object đến vị trí mới
     ```json
     { "type": "move", "target": "obj_4", "x": 500, "y": 200, "time": 2000 }
     ```
4. Click **"Lưu Script"** để lưu
5. Click vào canvas để chạy script (mỗi lần click chạy action tiếp theo)

### 8. Quản lý Trang

- **Thêm trang mới**: Click nút "Thêm trang mới"
- **Chuyển trang**: Click Prev/Next hoặc sử dụng phím tắt
- **Tự động lưu**: Trạng thái trang tự động được lưu khi chuyển trang
- **Khôi phục**: Khi reload trang, tất cả trang và object sẽ được khôi phục từ localStorage

### 9. Lưu và Export

- **Lưu trạng thái**: Click nút "Lưu trạng thái" → Xem JSON cấu hình → Click "Tải xuống file JSON"
- **Import**: (Tính năng có thể mở rộng) Load file JSON để import cấu hình

### 10. Các loại Object và thuộc tính

#### Text
- Text: Nội dung văn bản
- Color: Màu chữ
- Font Size: Kích thước chữ

#### Image
- Image URL: Đường dẫn ảnh
- Width: Chiều rộng
- Height: Chiều cao

#### Icon
- Icon Class: Class FontAwesome (ví dụ: `fa-solid fa-user`)
- Color: Màu icon
- Font Size: Kích thước icon

#### Button
- Text: Nội dung button
- Background Color: Màu nền
- Text Color: Màu chữ
- Font Size: Kích thước chữ

#### Checkbox
- Text: Nhãn checkbox
- Checked: Trạng thái checked/unchecked

#### Dropdown
- Options: Danh sách các option (mỗi option một dòng)
- Selected Index: Index của option được chọn

#### Toggle Button
- Text: Nhãn toggle
- Active: Trạng thái bật/tắt

#### 3/4-state Toggle Switch
- Text: Nhãn toggle
- State: 0 (đỏ), 1 (vàng), 2 (xanh)

## 💾 Lưu trữ dữ liệu

Dữ liệu được lưu tự động vào `localStorage` với cấu trúc:

```json
{
  "pages": {
    "page_1": {
      "objects": [...],
      "script": [...],
      "background": {
        "color": "#f5f5f5",
        "imageUrl": "",
        "imageRepeat": "no-repeat",
        "imageSize": "cover"
      }
    },
    "page_2": {
      "objects": [...],
      "script": [...],
      "background": {
        "color": "#ffffff",
        "imageUrl": "https://example.com/bg.jpg",
        "imageRepeat": "no-repeat",
        "imageSize": "cover"
      }
    }
  },
  "currentPage": "page_1"
}
```

## 🔧 Cấu hình

File `conf/config.js` chứa các cấu hình mặc định:

- Vị trí object mặc định
- Thuộc tính mặc định cho từng loại object
- Danh sách icon FontAwesome phổ biến

## 📝 Lưu ý

- Ứng dụng chỉ hoạt động trên trình duyệt hiện đại hỗ trợ localStorage
- Dữ liệu được lưu cục bộ trên trình duyệt, không có backend
- Khi xóa cache trình duyệt, dữ liệu sẽ bị mất (nên export JSON để backup)
- Hình ảnh phải là URL hợp lệ, không hỗ trợ upload file từ máy

## 🎨 Tùy chỉnh

Bạn có thể tùy chỉnh ứng dụng bằng cách:

1. **Thay đổi cấu hình mặc định**: Sửa file `conf/config.js`
2. **Thay đổi styling**: Sửa file `css/style.css`
3. **Thêm loại object mới**:
   - Thêm vào `objectManager.js` (method `renderObject`)
   - Thêm vào sidebar trong `index.html`
   - Thêm vào context menu trong `contextMenu.js`

## 🐛 Xử lý lỗi

- **Script không chạy**: Kiểm tra JSON syntax trong Script Editor
- **Object không kéo được**: Kiểm tra xem object có bị tắt draggable không (context menu)
- **Dữ liệu bị mất**: Kiểm tra localStorage của trình duyệt, hoặc import lại từ file JSON đã export

## 📄 License

Tự do sử dụng và chỉnh sửa.
