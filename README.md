# 📊 Web Presentation Application

A simple web application for creating and managing multiple presentation slides with draggable, editable objects that can be displayed according to scripts.

## 🚀 Features

- ✅ **Multiple Presentation Pages**: Create and manage multiple presentation pages
- ✅ **Multiple Object Types**: Text, Image, Icon, Button, Checkbox, Dropdown, Toggle Button, 3/4-state Toggle Switch
- ✅ **Drag & Drop**: Drag and drop objects on canvas
- ✅ **Edit**: Right-click to edit, delete, change object properties
- ✅ **Scripts**: Create scripts with show/hide/move actions, click canvas to run
- ✅ **Storage**: Auto-save to localStorage, export/import JSON
- ✅ **Background**: Customize background color and image for each page
- ✅ **Multi-language**: Support English and Vietnamese

## 📁 Directory Structure

```
presentation/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # CSS styling
├── js/
│   ├── app.js         # Main app - initialize and connect modules
│   ├── storage.js     # localStorage management
│   ├── objectManager.js # Manage objects on canvas
│   ├── dragDrop.js    # Drag and drop functionality
│   ├── contextMenu.js # Right-click menu and editing
│   ├── scriptRunner.js # Run scripts
│   ├── pageManager.js # Manage multiple pages
│   └── language.js    # Language management
├── conf/
│   └── config.js      # Default configuration
├── README.md          # English documentation (this file)
└── README_VI.md       # Vietnamese documentation
```

## 🎯 Usage Guide

### 1. Launch Application

Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, Safari).

### 2. Interface

The application has 3 main areas:

- **Top Toolbar**:
  - Prev/Next buttons to navigate pages
  - "Add New Page" button to create new page
  - Current page number display
  - "Save State" button to export JSON
  - "Script Editor" button to edit scripts
  - Language switcher (EN/VI)

- **Left Sidebar**: List of object types that can be added
- **Right Canvas**: Presentation area, where objects are displayed and edited

### 3. Add Object

**Method 1**: Click on object type in sidebar → Object will be added at default position (50, 50)

**Method 2**: Right-click on canvas → Select object type → Object will be added at click position

### 4. Drag & Drop Object

- Click and hold left mouse button on object to drag
- Object will follow mouse cursor
- Release mouse to place object at new position
- Object is automatically saved when released

### 5. Edit Object

**Right-click on object** to show context menu with options:

- **Edit**: Open dialog to edit object properties
- **Delete**: Remove object from canvas
- **Bring to Front**: Bring object to top (highest z-index)
- **Send to Back**: Send object to bottom (lowest z-index)
- **Toggle Draggable**: Enable/disable drag capability of object

### 6. Edit Page Background

**Right-click on canvas** (not on object) → Select "Edit Background" to:

- **Background Color**: Choose background color for page (color picker)
- **Background Image**: Enter image URL for background (leave empty if not using)
- **Image Repeat**:
  - No repeat (no-repeat)
  - Repeat (repeat)
  - Repeat horizontally (repeat-x)
  - Repeat vertically (repeat-y)
- **Image Size**:
  - Cover (cover entire canvas)
  - Contain (maintain aspect ratio)
  - Auto (original size)
  - 100% x 100% (stretch)

Background is saved separately for each page and automatically applied when switching pages.

### 7. Create Script

1. Click **"Script Editor"** button on toolbar
2. In textarea, enter JSON script or click **"Add Action"** to add actions one by one
3. Action types:
   - **show**: Show object(s)
     ```json
     { "type": "show", "target": ["obj_1", "obj_2"] }
     ```
   - **hide**: Hide object(s)
     ```json
     { "type": "hide", "target": ["obj_3"] }
     ```
   - **move**: Move object to new position
     ```json
     { "type": "move", "target": "obj_4", "x": 500, "y": 200, "time": 2000 }
     ```
4. Click **"Save Script"** to save
5. Click on canvas to run script (each click runs next action)

### 8. Page Management

- **Add New Page**: Click "Add New Page" button
- **Navigate Pages**: Click Prev/Next or use keyboard shortcuts
- **Auto-save**: Page state is automatically saved when switching pages
- **Restore**: When reloading page, all pages and objects will be restored from localStorage

### 9. Save and Export/Import

- **Save State**: Click "Save State" button → View JSON configuration → Click "Download JSON File"
- **Import**: Click "Import" button on toolbar → Select previously downloaded JSON file → Confirm import
  - **Note**: Import will overwrite all current data in localStorage
  - After successful import, the page will automatically reload to display new data

### 10. Object Types and Properties

#### Text
- Text: Text content
- Color: Text color
- Font Size: Font size

#### Image
- Image URL: Image path
- Width: Width
- Height: Height

#### Icon
- Icon Class: FontAwesome class (e.g., `fa-solid fa-user`)
- Color: Icon color
- Font Size: Icon size

#### Button
- Text: Button content
- Background Color: Background color
- Text Color: Text color
- Font Size: Font size

#### Checkbox
- Text: Checkbox label
- Checked: Checked/unchecked state

#### Dropdown
- Options: List of options (one per line)
- Selected Index: Index of selected option

#### Toggle Button
- Text: Toggle label
- Active: On/off state

#### 3/4-state Toggle Switch
- Text: Toggle label
- State: 0 (red), 1 (yellow), 2 (green)

## 💾 Data Storage

Data is automatically saved to `localStorage` with structure:

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

## 🔧 Configuration

The `conf/config.js` file contains default configurations:

- Default object position
- Default properties for each object type
- List of common FontAwesome icons

## 📝 Notes

- Application only works on modern browsers that support localStorage
- Data is saved locally in browser, no backend required
- When clearing browser cache, data will be lost (should export JSON for backup)
- Images must be valid URLs, file upload from computer is not supported

## 🎨 Customization

You can customize the application by:

1. **Change default configuration**: Edit `conf/config.js` file
2. **Change styling**: Edit `css/style.css` file
3. **Add new object types**:
   - Add to `objectManager.js` (method `renderObject`)
   - Add to sidebar in `index.html`
   - Add to context menu in `contextMenu.js`

## 🐛 Troubleshooting

- **Script not running**: Check JSON syntax in Script Editor
- **Object not draggable**: Check if object has draggable disabled (context menu)
- **Data lost**: Check browser localStorage, or import from exported JSON file

## 🌐 Language Support

The application supports two languages:
- **English (EN)**: Default language
- **Vietnamese (VI)**: Vietnamese translation

Switch language using the language selector in the top toolbar. Language preference is saved in localStorage.

## 📄 License

Free to use and modify.
