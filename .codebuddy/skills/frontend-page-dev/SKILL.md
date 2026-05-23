---
name: frontend-page-dev
description: >
  This skill should be used when creating, modifying, or reviewing HTML pages
  in the 克丽缇娜 (Chlitina) admin system. It provides the project's UI conventions,
  tech stack detection rules, reusable component patterns, and page templates.
  Trigger when the user asks to build a new page, add a feature to an existing page,
  modify the UI layout, create a modal/form/table, or when working with files in
  the credit-product/, order-sales-dashboard/, store_goal_mgmt/, or new-order-project/
  directories.
---

# 克丽缇娜 Frontend Page Development

## Purpose

Develop and maintain HTML pages for the 克丽缇娜 multi-module admin and dashboard system. This skill ensures
consistency with project conventions across two distinct tech stacks and four layout patterns.

## Tech Stack Detection

Before modifying or creating any page, identify which tech stack applies:

| Stack | Indicator | Directories | Colors |
|-------|-----------|-------------|--------|
| **Stack A (Tailwind)** | `<script src="...tailwind.js">` in head | `credit-product/` | Blue `#409EFF` |
| **Stack B (Vanilla CSS)** | `:root { ... }` CSS variables, no Tailwind | `order-sales-dashboard/`, `store_goal_mgmt/`, `new-order-project/` | Pink `#E87C9A` |

## Shared CDN Dependencies (Stack A only)

For all credit-product pages, include these CDN links in `<head>`:

```html
<link href="https://static.mastergo.com/static/ai/resource/html/googleapis/css2" rel="stylesheet">
<script src="https://static.mastergo.com/static/ai/resource/html/tailwind/tailwind.js"></script>
<link rel="stylesheet" href="https://static.mastergo.com/static/ai/resource/html/font-awesome/css/all.min.css">
```

And configure Tailwind:

```html
<script>
tailwind.config = {
    theme: {
        extend: {
            colors: { primary: '#409EFF', secondary: '#6B7280' },
            borderRadius: {
                'none': '0px', 'sm': '2px', DEFAULT: '4px', 'md': '8px',
                'lg': '12px', 'xl': '16px', '2xl': '20px', '3xl': '24px',
                'full': '9999px', 'button': '4px'
            }
        }
    }
}
</script>
```

## Layout Patterns

### Layout A: Admin Sidebar (credit-product)

Used for all management pages. Structure:

```
body.flex.bg-gray-100
├── div.w-64.bg-[#1E2C40].min-h-screen.flex.flex-col (Sidebar)
│   ├── Logo: i.fas.fa-check-circle.text-green-500 + "克丽缇娜"
│   └── nav: Menu items with i.fas icons, chevron indicators
└── div.flex-1.p-6 (Content)
    ├── Breadcrumb: span.text-gray-500 / i.fas.fa-chevron-right
    └── div.bg-white.rounded-xl.shadow-sm.border
        ├── Filter area: p-6.border-b.bg-gray-50
        ├── Table: overflow-x-auto > table.w-full
        └── Pagination: p-6.border-t.flex.justify-between
```

### Layout B: Top Nav Dashboard (order-sales-dashboard)

header > tabs > filter-bar > stat-cards-grid > chart-area

### Layout C: Single Page with Tabs (store_goal_mgmt)

header > tab-bar > filter-row > side-summary + main-grid

### Layout D: Three-Column App (new-order-project)

action-column(140px) + content-area + sidebar-cart

For complete layout details, read [references/credit-product-patterns.md](references/credit-product-patterns.md) (Stack A) or
[references/vanilla-css-patterns.md](references/vanilla-css-patterns.md) (Stack B).

## Component Recipes

### Modal Dialog (Stack A)

```html
<div id="xxxModal" class="modal-overlay" style="display: none;">
    <div class="modal">
        <div class="modal-header">
            <h2 class="modal-title">标题</h2>
            <button class="close-btn" onclick="closeXxxModal()">×</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label class="form-label">字段名</label>
                <input type="text" class="form-input" placeholder="请输入">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-cancel" onclick="closeXxxModal()">取消</button>
            <button class="btn-save" onclick="saveXxx()">保存</button>
        </div>
    </div>
</div>
```

CSS classes (add to `<style>`):
- `.modal-overlay`: fixed, rgba(0,0,0,0.5), flex center, z-1000
- `.modal`: white bg, rounded 8px, p-24, w-90%, max-w-500px
- `.modal-header`: flex space-between, mb-20, pb-12, border-bottom
- `.form-group`: mb-16
- `.form-label`: block, mb-6, font-500, color #333
- `.form-input`: w-full, p-8-12, border #d1d5db, rounded-4, focus blue ring
- `.modal-footer`: flex justify-end, gap-12, mt-24, pt-16, border-top
- `.btn-cancel`: p-8-16, border #d1d5db, rounded-4, white bg
- `.btn-save`: p-8-16, bg #409EFF, white, rounded-4

### Data Table (Stack A)

```html
<table class="w-full">
    <thead>
        <tr class="table-header">
            <th class="py-4 px-6 text-left text-gray-600 font-medium">列名</th>
        </tr>
    </thead>
    <tbody>
        <tr class="table-row">
            <td class="py-4 px-6 text-gray-800">数据</td>
            <td class="py-4 px-6">
                <button class="text-primary hover:text-blue-700 font-medium mr-4" onclick="editXxx('id')">编辑</button>
                <button class="text-primary hover:text-blue-700 font-medium" onclick="viewXxx('id')">查看</button>
            </td>
        </tr>
    </tbody>
</table>
```

CSS: `.table-header { background-color: #f1f5f9; }`, `.table-row:nth-child(even) { background-color: #f8fafc; }`

### Filter Bar (Stack A)

```html
<div class="p-6 border-b border-gray-200 bg-gray-50">
    <div class="flex items-center space-x-4 flex-wrap">
        <div class="flex items-center space-x-2">
            <label class="text-gray-700 font-medium">筛选条件</label>
            <input type="text" id="searchInput" class="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-40" placeholder="请输入">
        </div>
        <button class="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap" onclick="filterData()">筛选</button>
        <button class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors !rounded-button whitespace-nowrap" onclick="resetFilter()">重置</button>
    </div>
    <div class="mt-4">
        <button class="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap" onclick="openAddModal()">新增XXX</button>
    </div>
</div>
```

### Pagination (Stack A)

```html
<div class="p-6 border-t border-gray-200 flex items-center justify-between">
    <div class="text-gray-600">共 N 条记录，每页显示 10 条</div>
    <div class="flex items-center space-x-2">
        <button class="pagination-btn text-gray-600 hover:bg-gray-100 rounded-md" disabled>
            <i class="fas fa-chevron-left text-sm"></i>
        </button>
        <button class="pagination-btn active">1</button>
        <button class="pagination-btn text-gray-600 hover:bg-gray-100" disabled>
            <i class="fas fa-chevron-right text-sm"></i>
        </button>
    </div>
</div>
```

CSS: `.pagination-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }`
`.pagination-btn.active { background-color: #ef4444; color: white; }`

### Toast Notification (Stack B, store_goal_mgmt pattern)

```javascript
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="toast-icon">${type === 'success' ? '✓' : '✕'}</i>${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}
```

## JavaScript Conventions

### Function Naming
- `open*Modal()` / `close*Modal()` — modal lifecycle
- `save*()` / `submit*()` — form submission
- `show*()` / `hide*()` — visibility toggle
- `edit*(id)` / `view*(id)` — row actions
- `render*()` — re-render views
- `filter*()` / `reset*()` — filter controls
- `format*()` — data formatting

### Validation Pattern (Stack A)
```javascript
function saveXxx() {
    const field = document.getElementById('fieldId').value;
    if (!field) { alert('请填写XXX'); return; }
    if (new Date(endDate) < new Date(startDate)) { alert('结束日期不能早于开始日期'); return; }
    alert('保存成功！');
    closeXxxModal();
}
```

### Modal Lifecycle Pattern (Stack A)
```javascript
function openXxxModal() { document.getElementById('xxxModal').style.display = 'flex'; }
function closeXxxModal() {
    document.getElementById('xxxModal').style.display = 'none';
    // Reset all form fields
    document.getElementById('field1').value = '';
    document.getElementById('field2').value = '';
}
```

### Initialization
- Stack A: execute functions directly or via inline `onclick`
- Stack B: wrap in `DOMContentLoaded` event listener

## Page Creation Workflow

1. **Identify target directory and tech stack** — Use detection rules above
2. **Select layout pattern** — A (admin sidebar), B (dashboard), C (single-page tabs), D (three-column)
3. **For Stack A**: Copy from [assets/admin-page-template.html](assets/admin-page-template.html), populate with components
4. **For Stack B**: Use [references/vanilla-css-patterns.md](references/vanilla-css-patterns.md) for CSS variable definitions
5. **Add required components** — Use component recipes above for modals, tables, filters, pagination
6. **Wire JavaScript** — Follow naming conventions and validation patterns
7. **Test with dev server** — Run `node test_server.js` and preview at `http://localhost:9018/`

## Page Modification Workflow

1. Read the existing file to understand current structure
2. Preserve layout pattern and tech stack choices
3. Add/modify only the target component using the same conventions
4. Match existing CSS class naming and JavaScript function patterns
5. Ensure new elements follow the same indentation and formatting style
