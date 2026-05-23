# Stack A: Tailwind Admin Page Patterns (credit-product)

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#409EFF` | Buttons, links, focus rings, active states |
| `secondary` | `#6B7280` | Secondary text |
| Page BG | `#f8fafc` | `body` background |
| Table Header BG | `#f1f5f9` | `.table-header` |
| Stripe Even | `#f8fafc` | `.table-row:nth-child(even)` |
| Stripe Odd | `white` | `.table-row:nth-child(odd)` |
| Sidebar BG | `#1E2C40` | Left navigation background |
| Pagination Active | `#ef4444` | Current page number |
| Success | `#10b981` | Signed/active status |
| Warning | `#f59e0b` | Pending/unsigned status |
| Danger | `#ef4444` | Expired/inactive status |

## Sidebar Navigation Structure

```html
<div class="w-64 bg-[#1E2C40] min-h-screen flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-gray-700">
        <i class="fas fa-check-circle text-green-500 mr-3 text-xl"></i>
        <span class="text-white font-bold text-lg font-['Pacifico']">克丽缇娜</span>
    </div>
    <nav class="flex-1 py-4">
        <!-- Menu items -->
        <div class="mb-1 px-4 py-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center justify-between">
            <div class="flex items-center">
                <i class="fas fa-{icon} text-gray-300 mr-3"></i>
                <span class="text-gray-200">菜单名</span>
            </div>
            <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
        </div>
        <!-- Active parent: add bg-gray-700, text-white font-medium -->
        <!-- Active child: add ml-6, bg-blue-800 -->
    </nav>
</div>
```

Full menu list (standard across credit-product):
1. 首页 (fa-home)
2. 系统管理 (fa-cog)
3. 活动管理 (fa-calendar-alt)
4. 报名活动 (fa-user-plus)
5. 门店信息 (fa-store)
6. 会员信息 (fa-users)
7. 商品管理 (fa-box)
8. 订单管理 (fa-file-invoice)
9. AI 机器人 (fa-robot)
10. 寄售铺货 (fa-truck-loading) ← expandable, children below

## Breadcrumb

```html
<nav class="flex items-center mb-6">
    <span class="text-gray-500">首页</span>
    <i class="fas fa-chevron-right mx-2 text-gray-400 text-sm"></i>
    <span class="text-gray-500">父级</span>
    <i class="fas fa-chevron-right mx-2 text-gray-400 text-sm"></i>
    <span class="text-gray-800 font-medium">当前页</span>
</nav>
```

## Status Tags

```css
.status-tag {
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
}
```

Common status colors (inline or via class):
- Signed: `bg-green-100 text-green-800`
- Unsigned: `bg-yellow-100 text-yellow-800`
- Expired: `bg-red-100 text-red-800`

## Side Modal (admin_storelist_v1 pattern)

```css
.side-modal {
    position: fixed;
    top: 0; right: -1200px;
    width: 1200px; height: 100%;
    background: white;
    box-shadow: -2px 0 8px rgba(0,0,0,0.15);
    transition: right 0.3s ease;
    z-index: 1001;
    overflow-y: auto;
}
.side-modal.active { right: 0; }
```

## File Upload Pattern

```html
<div class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
    <i class="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
    <p class="text-gray-600 mb-2">点击或拖拽文件到此处上传</p>
    <p class="text-gray-400 text-sm">支持 Excel 文件格式 (.xlsx, .xls)</p>
    <input type="file" class="hidden" id="fileUpload" accept=".xlsx,.xls">
</div>
<button onclick="document.getElementById('fileUpload').click()">选择文件</button>
<span id="fileName">未选择文件</span>
```

File change handler:
```javascript
document.getElementById('fileUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    document.getElementById('fileName').textContent = file ? file.name : '未选择文件';
});
```

## Page Navigation

Between credit-product pages:
```javascript
function goToPage() {
    window.location.href = 'admin_batch_detail.html?param=value';
}
```

## Important: Selector Patterns

When manipulating table rows in Stack A pages, note these selectors:
- `td:first-child` → batch/store ID
- `td:nth-child(2)` → batch/store name
- Actions are always in the last `td`, use `querySelector('button')` or inline `onclick`
