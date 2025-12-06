# Quick Reference - DocterBee Theme Colors

## 🎨 Light Theme Color System

### Untuk Developer: Copy-paste ready CSS variables

```css
/* ========================================
   DocterBee Light Theme - Color Variables
   ======================================== */

/* Backgrounds */
.bg-main {
  background: #f9fafb;
}
.bg-card {
  background: #ffffff;
}
.bg-subtle {
  background: #fafafa;
}
.bg-hover {
  background: #f1f5f9;
}
.bg-orange-tint {
  background: #fef3f2;
}

/* Text */
.text-primary {
  color: #0f172a;
}
.text-secondary {
  color: #475569;
}
.text-muted {
  color: #64748b;
}

/* Orange Accent (Primary Brand) */
.orange-500 {
  color: #f97316;
}
.orange-600 {
  color: #ea580c;
}
.bg-orange-gradient {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

/* Borders */
.border-light {
  border-color: rgba(148, 163, 184, 0.2);
}
.border-medium {
  border-color: rgba(148, 163, 184, 0.3);
}
.border-orange {
  border-color: rgba(234, 88, 12, 0.3);
}

/* Shadows */
.shadow-light {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.shadow-orange {
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
}

/* State Colors (Preserved) */
.success {
  color: #10b981;
}
.error {
  color: #ef4444;
}
```

## 📋 Common Patterns

### Button Styles

```html
<!-- Default Button -->
<button
  class="bg-white border border-[#ea580c] text-slate-900 hover:bg-[#fef3f2]"
>
  Click Me
</button>

<!-- Primary Button (Orange Gradient) -->
<button
  class="bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white shadow-lg"
>
  Submit
</button>

<!-- Success State (Green) -->
<button class="bg-gradient-to-br from-[#10b981] to-[#059669] text-white">
  Yes
</button>

<!-- Error State (Red) -->
<button class="bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white">
  No
</button>
```

### Card Styles

```html
<!-- White Card -->
<div
  class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md"
>
  Card Content
</div>

<!-- Subtle Card -->
<div class="bg-[#fafafa] border border-gray-200 rounded-lg p-4">
  Subtle Background
</div>
```

### Navigation

```html
<!-- Header -->
<header class="bg-white/95 backdrop-blur border-b border-gray-200">
  <!-- Nav content -->
</header>

<!-- Nav Link -->
<a class="text-[#475569] hover:text-[#ea580c] transition-colors"> Link </a>
```

## 🔄 Migration Cheat Sheet

### Jika Menambah Halaman Baru:

1. Copy structure dari `index.html`
2. Pastikan `<body class="bg-gray-50 text-slate-900">`
3. Link ke `css/style.css`
4. Header: `class="bg-white/95 backdrop-blur border-b border-gray-200"`

### Jika Menambah Component Baru:

- Background: `bg-white` atau `bg-[#fafafa]`
- Border: `border-gray-200`
- Text: `text-slate-900`
- Accent: `#ea580c` atau `#f97316`
- Hover: `hover:bg-[#fef3f2]`

## ⚠️ Don't Touch!

- `admin-dashboard.html` - Keep dark theme
- `css/landing-page.css` - Landing page only
- Green/Red button states - Color-coded for Yes/No

## 🎯 Quick Test

```powershell
# Verify light theme pada halaman baru
$content = Get-Content "your-file.html" -Raw
if ($content -match 'bg-gray-50') {
  Write-Host "✓ Light theme OK"
}
```

## 📞 Color Codes Reference

### Tailwind Classes → Hex

| Tailwind        | Hex Code | Usage             |
| --------------- | -------- | ----------------- |
| bg-gray-50      | #f9fafb  | Main background   |
| bg-white        | #ffffff  | Cards, containers |
| text-slate-900  | #0f172a  | Primary text      |
| text-slate-700  | #334155  | Secondary text    |
| border-gray-200 | #e5e7eb  | Light borders     |
| orange-500      | #f97316  | Accent (light)    |
| orange-600      | #ea580c  | Accent (dark)     |

### Orange Gradient (Most Used)

```css
background: linear-gradient(135deg, #f97316, #ea580c);
```

## 🚀 Quick Start untuk Fitur Baru

1. **Clone existing page structure**
2. **Use these base classes:**

   - Body: `bg-gray-50 text-slate-900`
   - Header: `bg-white/95 backdrop-blur border-b border-gray-200`
   - Card: `bg-white border border-gray-200 rounded-lg p-4`
   - Button: `bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white`

3. **Test hover states:**
   - All hover should use `#fef3f2` background
   - Border hover: `border-orange-500`

That's it! 🎉
