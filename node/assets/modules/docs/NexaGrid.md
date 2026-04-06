# NexaGrid - JavaScript Grid System Documentation

NexaGrid adalah JavaScript Grid System untuk Ngorei NesxaUI yang memungkinkan pembuatan layout grid secara programmatis menggunakan JavaScript. Grid system ini otomatis memuat CSS `grid.css` dan menyediakan API yang mudah digunakan untuk membuat layout responsif.

## 📋 Daftar Isi

- [Instalasi & Setup](#instalasi--setup)
- [Akses melalui NXUI](#akses-melalui-nxui)
- [Penggunaan di Route](#penggunaan-di-route)
- [API Reference](#api-reference)
- [Contoh Penggunaan](#contoh-penggunaan)
- [Breakpoints](#breakpoints)
- [Utility Classes](#utility-classes)
- [Padding & Margin](#-padding--margin)

---

## 🚀 Instalasi & Setup

NexaGrid sudah terdaftar di `Nexa.js` dan tersedia secara global melalui `NXUI.grid`.

### Import (ES6 Modules)

```javascript


const grid = new NXUI;
```

### Akses Global

```javascript
// Menggunakan instance yang sudah tersedia
const myGrid2 = new NXUI.Grid();
```

---

## 🎯 Akses melalui NXUI

NexaGrid tersedia melalui `NXUI` dengan beberapa cara:

### 1. Instance Siap Pakai (`NXUI.grid`)

```javascript
// Langsung gunakan instance yang sudah tersedia
const container = NXUI.grid.createContainer({ nx: true, parent: document.body });
const row = NXUI.grid.createRow({ nx: true, parent: container });
const col = NXUI.grid.createCol({ cols: 6, content: 'Content' });
```

### 2. Class untuk Instance Baru

```javascript
// Buat instance baru
const grid = new NXUI.NexaGrid();
const grid2 = new NXUI.Grid(); // Alias

// Gunakan instance
const container = grid.createContainer({ nx: true });
```

### 3. Method Helper di NexaRoute

```javascript
// Di dalam route handler
route.register('about', async (routeName, container, routeInfo, style) => {
  // Menggunakan helper method dari route
  await route.applyGridStyle(container, style);
  
  // Atau menggunakan method sederhana
  route.createGridLayout(container, [
    {
      columns: [
        { cols: 12, content: '<h1>Title</h1>' }
      ]
    }
  ]);
});
```

---

## 🛣️ Penggunaan di Route

NexaGrid terintegrasi dengan `NexaRoute` dan dapat digunakan melalui parameter `style` saat register route.

### Format Dasar

```javascript
export async function about(page, route) {
  route.register(page, async (routeName, container, routeInfo = {}, style) => {
    // Gunakan parameter style untuk apply grid layout
    if (style) {
      await route.applyGridStyle(container, style);
    }
  }, {
    // Style config sebagai parameter ketiga
    useContainer: true,
    container: { nx: true },
    rows: [
      {
        columns: [
          { cols: 12, content: '<h1>About Page</h1>', textAlign: 'center' }
        ]
      }
    ]
  });
}
```

### Contoh Lengkap

```javascript
// dev/templates/theme/app/about.js
export async function about(page, route) {
  route.register(page, async (routeName, container, routeInfo = {}, style) => {
    // Apply grid style jika ada
    if (style && style.rows && style.rows.length > 0) {
      await route.applyGridStyle(container, style);
    } else {
      // Fallback jika style tidak ada
      container.innerHTML = '<h1>About Page</h1>';
    }
  }, {
    // Style configuration
    useContainer: true,
    container: { nx: true },
    rows: [
      {
        columns: [
          { cols: 12, content: '<h1>About Page</h1>', textAlign: 'center' }
        ]
      },
      {
        columns: [
          { 
            cols: 8, 
            content: `
              <h2>Welcome</h2>
              <p>Main content area</p>
            `
          },
          { 
            cols: 4, 
            content: '<div class="sidebar">Sidebar</div>' 
          }
        ]
      },
      {
        columns: [
          { cols: 4, content: '<p>Info 1</p>', textAlign: 'center' },
          { cols: 4, content: '<p>Info 2</p>', textAlign: 'center' },
          { cols: 4, content: '<p>Info 3</p>', textAlign: 'center' }
        ]
      }
    ]
  });
}
```

### Method Helper di Route

#### `route.applyGridStyle(container, style)`

Menerapkan grid style ke container menggunakan konfigurasi style object.

```javascript
route.register('about', async (routeName, container, routeInfo, style) => {
  await route.applyGridStyle(container, {
    useContainer: true,
    container: { nx: true },
    rows: [
      {
        columns: [
          { cols: 12, content: '<h1>Title</h1>' }
        ]
      }
    ]
  });
});
```

#### `route.createGridLayout(container, rows, options)`

Method sederhana untuk membuat grid layout tanpa style object lengkap.

```javascript
route.register('about', async (routeName, container, routeInfo, style) => {
  await route.createGridLayout(container, [
    {
      columns: [
        { cols: 12, content: '<h1>Title</h1>' }
      ]
    },
    {
      columns: [
        { cols: 6, content: '<p>Left</p>' },
        { cols: 6, content: '<p>Right</p>' }
      ]
    }
  ], { 
    useContainer: true, 
    nx: true 
  });
});
```

---

## 📚 API Reference

### Constructor

```javascript
const grid = new NexaGrid();
```

Membuat instance baru NexaGrid. CSS `grid.css` akan otomatis dimuat saat instance dibuat.

### Methods

#### `createContainer(options)`

Membuat container element.

**Parameters:**
- `options.nx` (boolean) - Gunakan `nx-container` instead of `container` (default: false)
- `options.parent` (HTMLElement) - Parent element untuk append container
- `options.padding` (string|number) - Padding shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.paddingTop` (string|number) - Padding top
- `options.paddingRight` (string|number) - Padding right
- `options.paddingBottom` (string|number) - Padding bottom
- `options.paddingLeft` (string|number) - Padding left
- `options.margin` (string|number) - Margin shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.marginTop` (string|number) - Margin top
- `options.marginRight` (string|number) - Margin right
- `options.marginBottom` (string|number) - Margin bottom
- `options.marginLeft` (string|number) - Margin left

**Returns:** `HTMLElement` - Container element

**Example:**
```javascript
// Basic usage
const container = NXUI.grid.createContainer({
  nx: true,
  parent: document.body
});

// Dengan padding dan margin
const container2 = NXUI.grid.createContainer({
  nx: true,
  padding: '1rem 2rem',
  margin: '0 auto',
  parent: document.body
});

// Dengan individual properties
const container3 = NXUI.grid.createContainer({
  nx: true,
  paddingTop: '1rem',
  paddingRight: '2rem',
  paddingBottom: '1rem',
  paddingLeft: '2rem',
  marginTop: '2rem',
  marginBottom: '2rem',
  parent: document.body
});

// Menggunakan angka (otomatis menjadi px)
const container4 = NXUI.grid.createContainer({
  nx: true,
  padding: 16, // menjadi '16px'
  margin: '0 auto'
});
```

#### `createRow(options)`

Membuat row element.

**Parameters:**
- `options.nx` (boolean) - Gunakan `nx-row` instead of `row` (default: true)
- `options.spacing` (string) - Row spacing: `'xs'`, `'sm'`
- `options.spacingSm` (string) - Responsive spacing untuk breakpoint sm
- `options.spacingMd` (string) - Responsive spacing untuk breakpoint md
- `options.spacingLg` (string) - Responsive spacing untuk breakpoint lg
- `options.spacingXl` (string) - Responsive spacing untuk breakpoint xl
- `options.justify` (string) - Justify content: `'center'`, `'start'`, `'end'`, `'between'`, `'around'` (hanya untuk nx-row)
- `options.align` (string) - Align items: `'center'`, `'start'`, `'end'` (hanya untuk nx-row)
- `options.parent` (HTMLElement) - Parent element untuk append row
- `options.padding` (string|number) - Padding shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.paddingTop` (string|number) - Padding top
- `options.paddingRight` (string|number) - Padding right
- `options.paddingBottom` (string|number) - Padding bottom
- `options.paddingLeft` (string|number) - Padding left
- `options.margin` (string|number) - Margin shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.marginTop` (string|number) - Margin top
- `options.marginRight` (string|number) - Margin right
- `options.marginBottom` (string|number) - Margin bottom
- `options.marginLeft` (string|number) - Margin left

**Returns:** `HTMLElement` - Row element

**Example:**
```javascript
// Basic usage
const row = NXUI.grid.createRow({
  nx: true,
  spacing: 'sm',
  justify: 'center',
  align: 'center',
  parent: container
});

// Dengan padding dan margin
const row2 = NXUI.grid.createRow({
  nx: true,
  padding: '1rem',
  marginBottom: '2rem',
  parent: container
});

// Format lengkap (atas kanan bawah kiri)
const row3 = NXUI.grid.createRow({
  nx: true,
  padding: '1rem 2rem 3rem 4rem', // top right bottom left
  margin: '0.5rem 1rem',
  parent: container
});
```

#### `createCol(options)`

Membuat column element.

**Parameters:**
- `options.cols` (number) - Column width 1-12 (default: 12)
- `options.nx` (boolean) - Gunakan `nx-col` instead of `col-md` (default: true)
- `options.responsive` (object) - Responsive breakpoints: `{ sm: 6, md: 4, lg: 3, xl: 2 }`
- `options.offset` (number) - Column offset 0-6
- `options.offsetResponsive` (object) - Responsive offsets: `{ sm: 1, md: 2, lg: 3, xl: 4 }`
- `options.textAlign` (string) - Text alignment: `'left'`, `'center'`, `'right'`
- `options.content` (string|HTMLElement) - Content untuk column
- `options.parent` (HTMLElement) - Parent element untuk append column
- `options.padding` (string|number) - Padding shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.paddingTop` (string|number) - Padding top
- `options.paddingRight` (string|number) - Padding right
- `options.paddingBottom` (string|number) - Padding bottom
- `options.paddingLeft` (string|number) - Padding left
- `options.margin` (string|number) - Margin shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
- `options.marginTop` (string|number) - Margin top
- `options.marginRight` (string|number) - Margin right
- `options.marginBottom` (string|number) - Margin bottom
- `options.marginLeft` (string|number) - Margin left

**Returns:** `HTMLElement` - Column element

**Example:**
```javascript
// Basic usage
const col = NXUI.grid.createCol({
  cols: 6,
  responsive: { sm: 12, md: 6, lg: 4 },
  offset: 1,
  textAlign: 'center',
  content: '<p>Column content</p>',
  parent: row
});

// Dengan padding dan margin
const col2 = NXUI.grid.createCol({
  cols: 6,
  padding: '1rem',
  marginBottom: '1rem',
  content: '<p>Content with spacing</p>',
  parent: row
});

// Menggunakan angka (otomatis menjadi px)
const col3 = NXUI.grid.createCol({
  cols: 4,
  padding: 16, // menjadi '16px'
  marginTop: 20, // menjadi '20px'
  content: '<p>Content</p>',
  parent: row
});
```

#### `createRowWithCols(options)`

Membuat row dengan multiple columns sekaligus.

**Parameters:**
- `options.nx` (boolean) - Gunakan nx-row (default: true)
- `options.spacing` (string) - Row spacing
- `options.justify` (string) - Justify content
- `options.align` (string) - Align items
- `options.columns` (array) - Array konfigurasi columns
- `options.parent` (HTMLElement) - Parent element
- `options.padding` (string|number) - Padding shorthand untuk row
- `options.paddingTop` (string|number) - Padding top untuk row
- `options.paddingRight` (string|number) - Padding right untuk row
- `options.paddingBottom` (string|number) - Padding bottom untuk row
- `options.paddingLeft` (string|number) - Padding left untuk row
- `options.margin` (string|number) - Margin shorthand untuk row
- `options.marginTop` (string|number) - Margin top untuk row
- `options.marginRight` (string|number) - Margin right untuk row
- `options.marginBottom` (string|number) - Margin bottom untuk row
- `options.marginLeft` (string|number) - Margin left untuk row

**Returns:** `Object` - `{ row, columns }`

**Example:**
```javascript
// Basic usage
const { row, columns } = NXUI.grid.createRowWithCols({
  nx: true,
  parent: container,
  columns: [
    { cols: 8, content: '<p>Left</p>' },
    { cols: 4, content: '<p>Right</p>' }
  ]
});

// Dengan padding dan margin di row
const { row: row2, columns: cols2 } = NXUI.grid.createRowWithCols({
  nx: true,
  padding: '1rem',
  marginBottom: '2rem',
  parent: container,
  columns: [
    { cols: 6, content: '<p>Left</p>' },
    { cols: 6, content: '<p>Right</p>' }
  ]
});

// Dengan padding dan margin di setiap column
const { row: row3, columns: cols3 } = NXUI.grid.createRowWithCols({
  nx: true,
  parent: container,
  columns: [
    { 
      cols: 6, 
      padding: '1rem',
      marginRight: '1rem',
      content: '<p>Left</p>' 
    },
    { 
      cols: 6, 
      padding: '1rem',
      content: '<p>Right</p>' 
    }
  ]
});
```

#### `createGrid(config)`

Membuat complete grid layout dengan container dan rows.

**Parameters:**
- `config.parent` (HTMLElement) - Parent element (default: document.body)
- `config.useContainer` (boolean) - Wrap dalam container (default: true)
- `config.container` (object) - Container options: `{ nx: boolean }`
- `config.rows` (array) - Array konfigurasi rows dengan columns

**Returns:** `HTMLElement` - Root element (container atau parent)

**Example:**
```javascript
const gridRoot = await NXUI.grid.createGrid({
  parent: container,
  useContainer: true,
  container: { nx: true },
  rows: [
    {
      columns: [
        { cols: 12, content: '<h1>Title</h1>' }
      ]
    },
    {
      columns: [
        { cols: 6, content: '<p>Left</p>' },
        { cols: 6, content: '<p>Right</p>' }
      ]
    }
  ]
});
```

#### `applySpacing(element, spacing)`

Menerapkan padding dan margin ke element. Method ini digunakan secara internal oleh method-method lain, tetapi juga dapat dipanggil langsung untuk menerapkan spacing ke element custom.

**Parameters:**
- `element` (HTMLElement) - Element untuk diterapkan spacing
- `spacing` (object) - Spacing options:
  - `padding` (string|number) - Padding shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
  - `paddingTop` (string|number) - Padding top
  - `paddingRight` (string|number) - Padding right
  - `paddingBottom` (string|number) - Padding bottom
  - `paddingLeft` (string|number) - Padding left
  - `margin` (string|number) - Margin shorthand: `'1rem'`, `'1rem 2rem'`, `'1rem 2rem 3rem 4rem'` (atas kanan bawah kiri), atau angka (otomatis menjadi px)
  - `marginTop` (string|number) - Margin top
  - `marginRight` (string|number) - Margin right
  - `marginBottom` (string|number) - Margin bottom
  - `marginLeft` (string|number) - Margin left

**Returns:** `HTMLElement` - Element dengan spacing yang diterapkan

**Example:**
```javascript
// Menerapkan spacing ke element custom
const customElement = document.createElement('div');
NXUI.grid.applySpacing(customElement, {
  padding: '1rem 2rem',
  margin: '0 auto'
});

// Menggunakan individual properties
const element2 = document.createElement('div');
NXUI.grid.applySpacing(element2, {
  paddingTop: '1rem',
  paddingRight: '2rem',
  paddingBottom: '1rem',
  paddingLeft: '2rem',
  marginTop: '2rem',
  marginBottom: '2rem'
});

// Menggunakan angka (otomatis menjadi px)
const element3 = document.createElement('div');
NXUI.grid.applySpacing(element3, {
  padding: 16, // menjadi '16px'
  margin: 20   // menjadi '20px'
});
```

#### `addUtilities(element, utilities)`

Menambahkan utility classes ke element.

**Parameters:**
- `element` (HTMLElement) - Element untuk ditambahkan utilities
- `utilities` (object) - Utility options:
  - `textAlign` (string) - `'left'`, `'center'`, `'right'`
  - `textAlignForce` (boolean) - Force text alignment
  - `textItalic` (boolean) - Text italic
  - `textNormal` (boolean) - Text normal style
  - `textNowrap` (boolean) - Text no wrap
  - `float` (string) - `'left'`, `'right'`
  - `displayFlex` (boolean) - Display flex
  - `justifyContent` (string) - Justify content
  - `align` (string) - Align items
  - `marginLeftAuto` (boolean) - Margin left auto
  - `marginRightAuto` (boolean) - Margin right auto
  - `flexPullRight` (boolean) - Flex pull right
  - `flexPullLeft` (boolean) - Flex pull left
  - `sticky` (boolean) - Sticky position
  - `hideMobile` (boolean) - Hide on mobile
  - `showMobile` (boolean) - Show on mobile

**Returns:** `HTMLElement` - Element dengan utilities

**Example:**
```javascript
const element = document.createElement('div');
NXUI.grid.addUtilities(element, {
  textAlign: 'center',
  displayFlex: true,
  justifyContent: 'between'
});
```

#### `getCurrentBreakpoint()`

Mendapatkan breakpoint saat ini berdasarkan window width.

**Returns:** `string` - Breakpoint name: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`

**Example:**
```javascript
const breakpoint = NXUI.grid.getCurrentBreakpoint();
console.log('Current breakpoint:', breakpoint); // 'md'
```

#### `isBreakpoint(breakpoint)`

Mengecek apakah viewport saat ini sesuai dengan breakpoint tertentu.

**Parameters:**
- `breakpoint` (string) - Breakpoint untuk dicek: `'sm'`, `'md'`, `'lg'`, `'xl'`

**Returns:** `boolean` - True jika sesuai

**Example:**
```javascript
if (NXUI.grid.isBreakpoint('md')) {
  console.log('Viewport is medium or larger');
}
```

#### `responsiveCol(sizes)`

Helper untuk membuat responsive column configuration.

**Parameters:**
- `sizes` (object) - Column sizes untuk setiap breakpoint:
  - `xs` (number) - Extra small (default: 12)
  - `sm` (number) - Small
  - `md` (number) - Medium
  - `lg` (number) - Large
  - `xl` (number) - Extra large

**Returns:** `Object` - Column configuration dengan responsive

**Example:**
```javascript
const colConfig = NXUI.grid.responsiveCol({
  xs: 12,
  sm: 6,
  md: 4,
  lg: 3,
  xl: 2
});

// Gunakan di createCol
const col = NXUI.grid.createCol({
  ...colConfig,
  content: '<p>Responsive column</p>'
});
```

---

## 💡 Contoh Penggunaan

### Contoh 1: Layout Sederhana

```javascript
// Menggunakan NXUI.grid langsung
const container = NXUI.grid.createContainer({ nx: true, parent: document.body });

const { row } = NXUI.grid.createRowWithCols({
  nx: true,
  parent: container,
  columns: [
    { cols: 6, content: '<h2>Left Column</h2>' },
    { cols: 6, content: '<h2>Right Column</h2>' }
  ]
});
```

### Contoh 2: Layout dengan Multiple Rows

```javascript
const gridRoot = await NXUI.grid.createGrid({
  parent: document.getElementById('main'),
  useContainer: true,
  container: { nx: true },
  rows: [
    {
      columns: [
        { cols: 12, content: '<h1>Header</h1>', textAlign: 'center' }
      ]
    },
    {
      columns: [
        { cols: 3, content: '<nav>Sidebar</nav>' },
        { cols: 9, content: '<main>Main Content</main>' }
      ]
    },
    {
      columns: [
        { cols: 12, content: '<footer>Footer</footer>', textAlign: 'center' }
      ]
    }
  ]
});
```

### Contoh 3: Responsive Columns

```javascript
const { row } = NXUI.grid.createRowWithCols({
  nx: true,
  parent: container,
  columns: [
    {
      cols: 12,
      responsive: { md: 6, lg: 4 },
      content: '<div>Col 1 - 12/6/4</div>'
    },
    {
      cols: 12,
      responsive: { md: 6, lg: 4 },
      content: '<div>Col 2 - 12/6/4</div>'
    },
    {
      cols: 12,
      responsive: { md: 12, lg: 4 },
      content: '<div>Col 3 - 12/12/4</div>'
    }
  ]
});
```

### Contoh 4: Menggunakan di Route dengan Style Parameter

```javascript
// dev/templates/theme/app/guides.js
export async function guides(page, route) {
  route.register(page, async (routeName, container, routeInfo, style) => {
    if (style) {
      await route.applyGridStyle(container, style);
    }
  }, {
    useContainer: true,
    container: { nx: true },
    rows: [
      {
        columns: [
          { cols: 12, content: '<h1>Guides</h1>' }
        ]
      },
      {
        columns: [
          { 
            cols: 3, 
            content: '<div class="sidebar">Navigation</div>' 
          },
          { 
            cols: 9, 
            content: '<div class="content">Guide Content</div>' 
          }
        ]
      }
    ]
  });
}
```

### Contoh 5: Dynamic Grid dengan Content dari API

```javascript
route.register('dashboard', async (routeName, container, routeInfo, style) => {
  // Load data dari API
  const data = await NXUI.nexaFetch.get('/api/dashboard');
  
  // Buat grid dengan data dinamis
  await route.createGridLayout(container, [
    {
      columns: [
        { cols: 12, content: `<h1>${data.title}</h1>` }
      ]
    },
    {
      columns: data.cards.map(card => ({
        cols: 4,
        responsive: { sm: 12, md: 6, lg: 4 },
        content: `
          <div class="card">
            <h3>${card.title}</h3>
            <p>${card.description}</p>
          </div>
        `
      }))
    }
  ]);
});
```

### Contoh 6: Grid dengan Offset

```javascript
const { row } = NXUI.grid.createRowWithCols({
  nx: true,
  parent: container,
  columns: [
    {
      cols: 6,
      offset: 3, // Offset 3 columns dari kiri
      content: '<p>Centered column (6 cols dengan offset 3)</p>'
    }
  ]
});
```

### Contoh 7: Grid dengan Utilities

```javascript
const col = NXUI.grid.createCol({
  cols: 6,
  content: '<p>Content</p>',
  parent: row
});

// Tambahkan utilities
NXUI.grid.addUtilities(col, {
  textAlign: 'center',
  displayFlex: true,
  justifyContent: 'between',
  sticky: true
});
```

### Contoh 8: Grid dengan Padding & Margin

```javascript
// Container dengan padding
const container = NXUI.grid.createContainer({
  nx: true,
  padding: '2rem',
  margin: '0 auto',
  parent: document.body
});

// Row dengan margin bottom
const { row } = NXUI.grid.createRowWithCols({
  nx: true,
  marginBottom: '2rem',
  padding: '1rem',
  parent: container,
  columns: [
    { 
      cols: 6, 
      padding: '1rem',
      marginRight: '1rem',
      content: '<p>Left column with spacing</p>' 
    },
    { 
      cols: 6, 
      padding: '1rem',
      content: '<p>Right column with spacing</p>' 
    }
  ]
});

// Column dengan padding individual
const col = NXUI.grid.createCol({
  cols: 12,
  paddingTop: '2rem',
  paddingRight: '1rem',
  paddingBottom: '2rem',
  paddingLeft: '1rem',
  marginBottom: '1rem',
  content: '<h2>Title with custom spacing</h2>',
  parent: row
});
```

### Contoh 9: Complete Grid Layout dengan Spacing

```javascript
const gridRoot = await NXUI.grid.createGrid({
  parent: document.getElementById('main'),
  useContainer: true,
  container: { 
    nx: true,
    padding: '2rem'  // Container padding
  },
  rows: [
    {
      marginBottom: '2rem',  // Row margin
      columns: [
        { 
          cols: 12, 
          padding: '1rem',
          content: '<h1>Header</h1>',
          textAlign: 'center'
        }
      ]
    },
    {
      marginBottom: '2rem',
      columns: [
        { 
          cols: 3, 
          padding: '1rem',
          marginRight: '1rem',
          content: '<nav>Sidebar</nav>' 
        },
        { 
          cols: 9, 
          padding: '1rem',
          content: '<main>Main Content</main>' 
        }
      ]
    },
    {
      columns: [
        { 
          cols: 12, 
          padding: '1rem',
          marginTop: '2rem',
          content: '<footer>Footer</footer>',
          textAlign: 'center'
        }
      ]
    }
  ]
});
```

### Contoh 10: Menggunakan Numeric Values untuk Pixel

```javascript
// Menggunakan angka (otomatis dikonversi ke px)
const container = NXUI.grid.createContainer({
  nx: true,
  padding: 20,        // menjadi '20px'
  margin: '0 auto',
  parent: document.body
});

const { row } = NXUI.grid.createRowWithCols({
  nx: true,
  marginBottom: 16,  // menjadi '16px'
  parent: container,
  columns: [
    { 
      cols: 6, 
      padding: 12,    // menjadi '12px'
      content: '<p>Left</p>' 
    },
    { 
      cols: 6, 
      padding: 12,    // menjadi '12px'
      content: '<p>Right</p>' 
    }
  ]
});
```

---

## 📱 Breakpoints

NexaGrid menggunakan breakpoint system berikut:

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `xs` | 0px | Extra small devices (default) |
| `sm` | ≥576px | Small devices (tablets) |
| `md` | ≥768px | Medium devices (desktops) |
| `lg` | ≥992px | Large devices (large desktops) |
| `xl` | ≥1200px | Extra large devices |

### Menggunakan Breakpoints

```javascript
// Cek breakpoint saat ini
const current = NXUI.grid.getCurrentBreakpoint();
console.log('Current:', current); // 'md'

// Cek apakah viewport sesuai breakpoint
if (NXUI.grid.isBreakpoint('md')) {
  // Kode untuk medium dan lebih besar
}

// Responsive columns
const col = NXUI.grid.createCol({
  cols: 12,        // Default untuk xs
  responsive: {
    sm: 6,         // 6 columns di sm
    md: 4,         // 4 columns di md
    lg: 3,         // 3 columns di lg
    xl: 2          // 2 columns di xl
  },
  content: '<p>Responsive</p>'
});
```

---

## 🎨 Utility Classes

NexaGrid menyediakan berbagai utility classes yang dapat ditambahkan melalui method `addUtilities()`:

### Text Alignment

```javascript
NXUI.grid.addUtilities(element, {
  textAlign: 'center',  // tx-center
  textAlignForce: true  // tx-center-f (force)
});
```

### Text Style

```javascript
NXUI.grid.addUtilities(element, {
  textItalic: true,     // tx-italic
  textNormal: true,     // tx-style-normal
  textNowrap: true      // tx-nowrap
});
```

### Float

```javascript
NXUI.grid.addUtilities(element, {
  float: 'left'  // pull-left
});
```

### Flexbox

```javascript
NXUI.grid.addUtilities(element, {
  displayFlex: true,
  justifyContent: 'between',  // justify-between
  align: 'center'             // align-center
});
```

### Margin

```javascript
NXUI.grid.addUtilities(element, {
  marginLeftAuto: true,   // ml-auto
  marginRightAuto: true   // mr-auto
});
```

### Visibility

```javascript
NXUI.grid.addUtilities(element, {
  hideMobile: true,   // nx-hide-mobile
  showMobile: true    // nx-show-mobile
});
```

---

## 📏 Padding & Margin

NexaGrid menyediakan kontrol penuh atas padding dan margin untuk semua elemen grid (container, row, dan column). Fitur ini memungkinkan Anda mengatur spacing dengan fleksibel sesuai kebutuhan.

### Format Padding & Margin

#### 1. Shorthand Format

Menggunakan format CSS shorthand standar:

```javascript
// Satu nilai (semua sisi)
padding: '1rem'        // top=right=bottom=left=1rem
margin: '1rem'          // top=right=bottom=left=1rem

// Dua nilai (vertikal horizontal)
padding: '1rem 2rem'   // top=bottom=1rem, left=right=2rem
margin: '1rem 2rem'    // top=bottom=1rem, left=right=2rem

// Tiga nilai (top horizontal bottom)
padding: '1rem 2rem 3rem'  // top=1rem, left=right=2rem, bottom=3rem
margin: '1rem 2rem 3rem'   // top=1rem, left=right=2rem, bottom=3rem

// Empat nilai (atas kanan bawah kiri)
padding: '1rem 2rem 3rem 4rem'  // top=1rem, right=2rem, bottom=3rem, left=4rem
margin: '1rem 2rem 3rem 4rem'   // top=1rem, right=2rem, bottom=3rem, left=4rem
```

#### 2. Individual Properties

Mengatur setiap sisi secara terpisah:

```javascript
{
  paddingTop: '1rem',
  paddingRight: '2rem',
  paddingBottom: '3rem',
  paddingLeft: '4rem',
  marginTop: '1rem',
  marginRight: '2rem',
  marginBottom: '3rem',
  marginLeft: '4rem'
}
```

#### 3. Numeric Values (Auto-convert to px)

Menggunakan angka, akan otomatis dikonversi menjadi pixel:

```javascript
{
  padding: 16,        // menjadi '16px'
  paddingTop: 20,    // menjadi '20px'
  margin: 10,        // menjadi '10px'
  marginBottom: 30   // menjadi '30px'
}
```

### Contoh Penggunaan Padding & Margin

#### Container dengan Padding

```javascript
const container = NXUI.grid.createContainer({
  nx: true,
  padding: '2rem',
  parent: document.body
});
```

#### Row dengan Margin Bottom

```javascript
const row = NXUI.grid.createRow({
  nx: true,
  marginBottom: '2rem',
  parent: container
});
```

#### Column dengan Padding Individual

```javascript
const col = NXUI.grid.createCol({
  cols: 6,
  paddingTop: '1rem',
  paddingRight: '2rem',
  paddingBottom: '1rem',
  paddingLeft: '2rem',
  content: '<p>Content with custom padding</p>',
  parent: row
});
```

#### Grid Layout dengan Spacing

```javascript
await NXUI.grid.createGrid({
  parent: document.body,
  useContainer: true,
  container: { 
    nx: true,
    padding: '2rem'  // Container padding
  },
  rows: [
    {
      marginBottom: '1rem',  // Row margin
      columns: [
        { 
          cols: 12, 
          padding: '1rem',    // Column padding
          content: '<h1>Title</h1>' 
        }
      ]
    },
    {
      columns: [
        { 
          cols: 6, 
          padding: '1rem',
          marginRight: '1rem',  // Column margin
          content: '<p>Left</p>' 
        },
        { 
          cols: 6, 
          padding: '1rem',
          content: '<p>Right</p>' 
        }
      ]
    }
  ]
});
```

#### Menggunakan di Route dengan Style Parameter

```javascript
export async function about(page, route) {
  route.register(page, async (routeName, container, routeInfo, style) => {
    if (style) {
      await route.applyGridStyle(container, style);
    }
  }, {
    useContainer: true,
    container: { 
      nx: true,
      padding: '2rem'  // Container padding
    },
    rows: [
      {
        marginBottom: '2rem',  // Row margin
        columns: [
          { 
            cols: 12, 
            padding: '1rem',   // Column padding
            content: '<h1>About Page</h1>',
            textAlign: 'center'
          }
        ]
      },
      {
        columns: [
          { 
            cols: 8, 
            padding: '1rem',
            marginRight: '1rem',  // Column margin
            content: '<p>Main content</p>'
          },
          { 
            cols: 4, 
            padding: '1rem',
            content: '<div class="sidebar">Sidebar</div>'
          }
        ]
      }
    ]
  });
}
```

### Tips Padding & Margin

1. **Prioritaskan Shorthand**: Gunakan format shorthand untuk kemudahan dan konsistensi
   ```javascript
   // ✅ Lebih mudah
   padding: '1rem 2rem'
   
   // ❌ Lebih verbose
   paddingTop: '1rem',
   paddingRight: '2rem',
   paddingBottom: '1rem',
   paddingLeft: '2rem'
   ```

2. **Gunakan Numeric untuk Pixel**: Jika menggunakan pixel, gunakan angka langsung
   ```javascript
   // ✅ Lebih mudah
   padding: 16  // otomatis menjadi '16px'
   
   // ❌ Tidak perlu
   padding: '16px'
   ```

3. **Konsistensi Spacing**: Gunakan spacing yang konsisten di seluruh layout
   ```javascript
   const spacing = '1rem';
   const container = NXUI.grid.createContainer({
     padding: spacing,
     parent: document.body
   });
   ```

4. **Responsive Spacing**: Pertimbangkan spacing yang berbeda untuk breakpoint berbeda (gunakan CSS media queries atau conditional logic)

---

## 🔧 Tips & Best Practices

### 1. Selalu Gunakan `await` untuk `createGrid()`

Karena `createGrid()` adalah async method (menunggu CSS dimuat), selalu gunakan `await`:

```javascript
// ✅ Benar
await NXUI.grid.createGrid(config);

// ❌ Salah
NXUI.grid.createGrid(config); // CSS mungkin belum dimuat
```

### 2. Gunakan Parameter `style` di Route

Untuk route yang menggunakan grid, gunakan parameter `style` untuk konfigurasi yang lebih terorganisir:

```javascript
route.register(page, async (routeName, container, routeInfo, style) => {
  if (style) {
    await route.applyGridStyle(container, style);
  }
}, {
  // Style config di sini
  useContainer: true,
  rows: [...]
});
```

### 3. Responsive Design

Selalu pertimbangkan responsive design dengan menggunakan `responsive` option:

```javascript
{
  cols: 12,
  responsive: {
    sm: 6,
    md: 4,
    lg: 3
  }
}
```

### 4. Gunakan Helper Methods

Gunakan helper methods dari `route` untuk kemudahan:

```javascript
// ✅ Lebih mudah
await route.applyGridStyle(container, style);

// Atau
await route.createGridLayout(container, rows, options);
```

### 5. Penggunaan Padding & Margin

Gunakan padding dan margin untuk spacing yang lebih fleksibel:

```javascript
// ✅ Gunakan shorthand untuk kemudahan
padding: '1rem 2rem'  // top=bottom=1rem, left=right=2rem

// ✅ Gunakan angka untuk pixel (otomatis dikonversi)
padding: 16  // menjadi '16px'

// ✅ Gunakan individual properties jika perlu kontrol spesifik
{
  paddingTop: '2rem',
  paddingRight: '1rem',
  paddingBottom: '2rem',
  paddingLeft: '1rem'
}
```

---

## 📝 Catatan Penting

1. **CSS Auto-load**: CSS `grid.css` akan otomatis dimuat saat instance `NexaGrid` dibuat pertama kali
2. **Async Methods**: `createGrid()` adalah async method karena menunggu CSS dimuat
3. **Default NX**: Default menggunakan class `nx-*` (nx-container, nx-row, nx-col)
4. **12 Column System**: Grid menggunakan sistem 12 kolom standar
5. **Responsive First**: Selalu pertimbangkan responsive design saat membuat layout
6. **Padding & Margin**: Padding dan margin dapat diatur untuk semua elemen grid (container, row, column) menggunakan format shorthand CSS standar atau individual properties. Nilai numerik akan otomatis dikonversi menjadi pixel (px)

---

## 🔗 Lihat Juga

- [grid.css](../Grid/grid.css) - CSS Grid System
- [NexaRoute.js](../Route/NexaRoute.js) - Route System dengan dukungan style parameter
- [NexaUI.js](../NexaUI.js) - Global NXUI initialization

---

**Copyright 2024-2025 The Ngorei NesxaUI Authors**  
**Licensed under MIT**

