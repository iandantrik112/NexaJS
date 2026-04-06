# NexaUI Scroll CSS - Usage Examples

## Basic Scroll Classes

### 1. Basic Vertical Scroll (`.nx-scroll`)

```html
<div class="nx-scroll" style="height: 200px; mr">
  <div style="height: 500px; padding: 20px;">
    <p>Content yang panjang...</p>
    <p>Akan muncul scrollbar vertikal</p>
    <p>Dengan styling custom</p>
  </div>
</div>
```

### 2. Horizontal Scroll (`.nx-scroll-x`)

```html
<div class="nx-scroll-x" style="width: 300px;">
  <div style="width: 800px; padding: 20px; white-space: nowrap;">
    <span
      >Content horizontal yang panjang sekali dan akan scroll ke samping</span
    >
  </div>
</div>
```

## Custom Scroll Styles

### 3. Rounded Scrollbar (`.nx-scroll-rounded`)

```html
<div class="nx-scroll nx-scroll-rounded" style="height: 250px;">
  <div style="height: 600px; padding: 20px;">
    <h3>Scrollbar dengan border radius</h3>
    <p>Scrollbar akan terlihat lebih rounded dan modern</p>
  </div>
</div>
```

### 4. Hidden Scrollbar (`.nx-scroll-hidden`)

```html
<div class="nx-scroll-hidden" style="height: 200px;">
  <div style="height: 500px; padding: 20px;">
    <p>Content bisa di-scroll tapi scrollbar tidak terlihat</p>
    <p>Cocok untuk design yang clean</p>
  </div>
</div>
```

### 5. Auto Hide Scrollbar (`.nx-scroll-autohide`)

```html
<div class="nx-scroll-autohide" style="height: 200px;">
  <div style="height: 500px; padding: 20px;">
    <p>Scrollbar akan muncul saat hover</p>
    <p>Dan hilang saat tidak digunakan</p>
  </div>
</div>
```

## Table Scroll

### 6. Table with Fixed Header (`.nx-scroll-table`)

```html
<div class="nx-scroll-table">
  <table style="width: 100%;">
    <thead style="position: sticky; top: 0; background: #f8f9fa;">
      <tr>
        <th>Nama</th>
        <th>Email</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@email.com</td>
        <td>Active</td>
      </tr>
      <tr>
        <td>Jane Smith</td>
        <td>jane@email.com</td>
        <td>Inactive</td>
      </tr>
      <!-- Tambahkan banyak row untuk testing scroll -->
    </tbody>
  </table>
</div>
```

### 7. Smooth Scroll (`.nx-scroll-smooth`)

```html
<div class="nx-scroll-smooth" style="height: 300px;">
  <div style="height: 800px; padding: 20px;">
    <h3>Smooth Scrolling</h3>
    <p>Scroll akan bergerak dengan halus</p>
    <a href="#bottom">Scroll ke bawah</a>
    <div style="height: 400px;"></div>
    <p id="bottom">Target scroll</p>
  </div>
</div>
```

## Advanced Effects

### 8. Fade Effect Scroll (`.nx-scroll-fade`)

```html
<div class="nx-scroll-fade" style="height: 250px;">
  <div style="height: 600px; padding: 20px;">
    <h3>Fade Effect</h3>
    <p>Ada gradient fade di atas dan bawah</p>
    <p>Memberikan efek visual yang menarik</p>
    <p>Content akan fade in/out saat scroll</p>
  </div>
</div>
```

### 9. Shadow Effect Scroll (`.nx-scroll-shadow`)

```html
<div class="nx-scroll-shadow" style="height: 250px;">
  <div style="height: 600px; padding: 20px;">
    <h3>Shadow Effect</h3>
    <p>Ada shadow di dalam container</p>
    <p>Memberikan depth pada scroll area</p>
  </div>
</div>
```

## Custom Scrollbar Sizes

### 10. Thin Scrollbar (`.nx-scroll-thin`)

```html
<div class="nx-scroll nx-scroll-thin" style="height: 200px;">
  <div style="height: 500px; padding: 20px;">
    <p>Scrollbar yang lebih tipis (6px)</p>
    <p>Cocok untuk space yang terbatas</p>
  </div>
</div>
```

### 11. Thick Scrollbar (`.nx-scroll-thick`)

```html
<div class="nx-scroll nx-scroll-thick" style="height: 200px;">
  <div style="height: 500px; padding: 20px;">
    <p>Scrollbar yang lebih tebal (12px)</p>
    <p>Lebih mudah untuk di-grab</p>
  </div>
</div>
```

### 12. Primary Color Scrollbar (`.nx-scroll-primary`)

```html
<div class="nx-scroll nx-scroll-primary" style="height: 200px;">
  <div style="height: 500px; padding: 20px;">
    <p>Scrollbar dengan warna primary theme</p>
    <p>Sesuai dengan brand color</p>
  </div>
</div>
```

## Kombinasi Classes

### 13. Multiple Classes

```html
<!-- Kombinasi smooth scroll dengan fade effect -->
<div
  class="nx-scroll-smooth nx-scroll-fade nx-scroll-thin"
  style="height: 300px;"
>
  <div style="height: 700px; padding: 20px;">
    <h3>Kombinasi Effects</h3>
    <p>Smooth scroll + Fade effect + Thin scrollbar</p>
  </div>
</div>

<!-- Auto hide dengan rounded scrollbar -->
<div class="nx-scroll-autohide nx-scroll-rounded" style="height: 250px;">
  <div style="height: 600px; padding: 20px;">
    <h3>Auto Hide + Rounded</h3>
    <p>Scrollbar rounded yang auto hide</p>
  </div>
</div>
```

## Responsive Usage

### 14. Responsive Scroll Container

```html
<div class="nx-scroll" style="height: 50vh; max-height: 400px;">
  <div style="padding: 20px;">
    <h3>Responsive Container</h3>
    <p>Height menggunakan viewport height</p>
    <p>Dengan max-height sebagai fallback</p>
  </div>
</div>
```

## Chat/Message Container Example

### 15. Chat Container

```html
<div
  class="nx-scroll-autohide nx-scroll-smooth"
  style="height: 400px; border: 1px solid #e5e7eb; border-radius: 8px;"
>
  <div style="padding: 15px;">
    <div
      style="margin-bottom: 10px; padding: 10px; background: #f3f4f6; border-radius: 6px;"
    >
      <strong>User 1:</strong> Hello there!
    </div>
    <div
      style="margin-bottom: 10px; padding: 10px; background: #dbeafe; border-radius: 6px;"
    >
      <strong>User 2:</strong> Hi! How are you?
    </div>
    <!-- Tambahkan lebih banyak message -->
  </div>
</div>
```

## Dark Mode Support

Semua class scroll mendukung dark mode secara otomatis ketika `body` memiliki class `dark-mode-grid`.

```html
<body class="dark-mode-grid">
  <div class="nx-scroll-table">
    <!-- Table content akan menggunakan dark mode styling -->
  </div>
</body>
```

## CSS Variables yang Digunakan

Beberapa class menggunakan CSS variables yang dapat dikustomisasi:

```css
:root {
  --nx-primary-dark: #1e40af;
  --border-primary: #374151;
  --main-code-bg: #1f2937;
  --bg-primary: #111827;
  --menu-hover-bg: #374151;
}
```

## Tips Penggunaan

1. **Untuk content panjang**: Gunakan `.nx-scroll` atau `.nx-scroll-autohide`
2. **Untuk tabel**: Gunakan `.nx-scroll-table` dengan sticky header
3. **Untuk design minimal**: Gunakan `.nx-scroll-hidden`
4. **Untuk efek visual**: Kombinasikan dengan `.nx-scroll-fade` atau `.nx-scroll-shadow`
5. **Untuk mobile**: Gunakan `.nx-scroll-thin` untuk menghemat space
6. **Untuk smooth navigation**: Tambahkan `.nx-scroll-smooth`
