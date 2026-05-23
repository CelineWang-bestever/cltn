# Stack B: Vanilla CSS Dashboard Patterns

## Color Palette (Pink Theme)

```css
:root {
    /* Primary (Pink) */
    --primary: #E87C9A;
    --primary-dark: #D66B85;
    --primary-50: #FEF2F5;
    --primary-100: #FDE4EA;
    --primary-200: #FBC9D5;
    --primary-300: #F8A3B8;
    --primary-400: #F47D9B;
    --primary-500: #E87C9A;
    --primary-600: #D66B85;
    --primary-700: #C45A70;

    /* Neutral (Gray Scale) */
    --neutral-50: #FAFAFA;
    --neutral-100: #F5F5F5;
    --neutral-200: #EEEEEE;
    --neutral-300: #E0E0E0;
    --neutral-400: #BDBDBD;
    --neutral-500: #9E9E9E;
    --neutral-600: #757575;
    --neutral-700: #616161;
    --neutral-800: #424242;
    --neutral-900: #212121;

    /* Metrics Colors */
    --sales-color: #E85D75;
    --consume-color: #1ABC9C;
    --people-color: #3498DB;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.2s ease;
    --transition-slow: 0.3s ease;

    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

## Layout B: Dashboard (order-sales-dashboard)

```html
<body>
    <!-- Sticky Header -->
    <header class="header">
        <div class="header-brand">克丽缇娜</div>
        <nav class="header-breadcrumb">首页 > 数据分析</nav>
        <div class="header-user">管理员</div>
    </header>

    <!-- Tab Navigation -->
    <div class="tab-bar">
        <button class="tab-btn active">会员分析</button>
        <button class="tab-btn">经营分析</button>
        <button class="tab-btn">员工分析</button>
    </div>

    <!-- Time Filter -->
    <div class="filter-bar">
        <button class="filter-btn active">今日</button>
        <button class="filter-btn">昨日</button>
        <button class="filter-btn">本周</button>
        <button class="filter-btn">本月</button>
        <input type="date" class="date-input">
        <span>至</span>
        <input type="date" class="date-input">
    </div>

    <!-- Stat Cards Grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-label">销售额</div>
            <div class="stat-value">¥XXX</div>
            <div class="stat-change positive">+X%</div>
        </div>
    </div>

    <!-- Charts -->
    <div class="charts-row">
        <div class="chart-card"><canvas id="pieChart"></canvas></div>
        <div class="chart-card"><canvas id="barChart"></canvas></div>
    </div>
</body>
```

Chart.js initialization pattern:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: { labels: [...], datasets: [{ data: [...], backgroundColor: [...] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
});
```

## Layout C: Single Page with Tabs (store_goal_mgmt)

```html
<body>
    <!-- Header -->
    <header class="header">
        <h1 class="header-title">目标管理</h1>
        <button class="mobile-menu-btn">☰</button>
    </header>

    <!-- Tabs -->
    <div class="tab-navigation">
        <button class="tab-item active" data-tab="sales">销售目标</button>
        <button class="tab-item" data-tab="member">会员目标</button>
        <button class="tab-item" data-tab="product">商品目标</button>
        <button class="tab-item" data-tab="service">服务目标</button>
        <button class="tab-item" data-tab="activity">活动目标</button>
    </div>

    <!-- Year Selector -->
    <div class="year-selector">
        <button class="year-arrow">&lt;</button>
        <span class="year-display">2024</span>
        <button class="year-arrow">&gt;</button>
    </div>

    <!-- Content: Side Summary + Month Grid -->
    <div class="content-layout">
        <aside class="year-summary">
            <div class="ring-progress">...</div>
            <div class="summary-stats">年度目标 / 已完成</div>
        </aside>
        <main class="month-grid">
            <div class="month-card">1月</div>
            <!-- ... 12 months -->
        </main>
    </div>
</body>
```

Tab switching pattern:
```javascript
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        renderMonthGrid(this.dataset.tab);
    });
});
```

## Toast System (store_goal_mgmt)

```css
#toastContainer {
    position: fixed; top: 20px; right: 20px;
    z-index: 9999;
    display: flex; flex-direction: column; gap: 8px;
}
.toast {
    padding: 12px 20px; border-radius: 8px;
    color: white; font-size: 14px;
    box-shadow: var(--shadow-md);
    animation: slideIn 0.3s ease;
    display: flex; align-items: center; gap: 8px;
}
.toast.success { background-color: #10b981; }
.toast.error { background-color: #ef4444; }
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
```

## Ring Progress (CSS conic-gradient)

```css
.ring-progress {
    width: 160px; height: 160px;
    border-radius: 50%;
    background: conic-gradient(var(--primary) 0% 65%, #f0f0f0 65% 100%);
    display: flex; align-items: center; justify-content: center;
    position: relative;
}
.ring-progress::after {
    content: '';
    width: 120px; height: 120px;
    border-radius: 50%;
    background: white;
    position: absolute;
}
.ring-progress .ring-text {
    position: relative; z-index: 1;
    text-align: center;
}
```

## Responsive Breakpoints

```css
@media (max-width: 1200px) { /* Tablet landscape adjustments */ }
@media (max-width: 1024px) { /* Tablet portrait: stack layouts */ }
@media (max-width: 768px)  { /* Mobile: single column, hide sidebar */ }
@media (max-width: 480px)  { /* Small mobile: compact cards */ }
```
