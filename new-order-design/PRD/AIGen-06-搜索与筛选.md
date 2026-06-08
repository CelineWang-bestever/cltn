# 06 - 搜索与筛选

> **所属模块**: 开单收银页
> **功能点数**: 10项
> **核心程度**: 混合

---

## 功能清单

### 6.1 权益弹窗内搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 搜索会员已有权益/卡项 |
| 搜索框ID | `benefitSearchInput` |
| 清除按钮 | `benefitSearchClear` |
| 核心程度 | 辅助 |

**搜索范围**:
- 卡项名称
- 权益项目名称

**实现逻辑**:
```javascript
function renderBenefitCards(searchKeyword = '') {
    var keyword = searchKeyword.toLowerCase();

    sortedCards.forEach(function (card) {
        // 过滤：如果有搜索关键词，只显示匹配的卡项或权益
        var filteredBenefits = card.benefits.filter(function (b) {
            return !keyword ||
                card.name.toLowerCase().includes(keyword) ||
                b.name.toLowerCase().includes(keyword);
        });
    });
}
```

---

### 6.2 最近搜索记录

| 属性 | 说明 |
|-----|------|
| 功能描述 | 权益弹窗中的最近搜索标签（最多8条） |
| 容器ID | `benefitRecentTags` |
| 最大条数 | 8条 |
| 核心程度 | UI交互 |

**存储结构**:
```javascript
var benefitRecentSearches = [];  // 最多8条

function addToBenefitRecentSearches(keyword) {
    if (!keyword || keyword.trim() === '') return;

    var trimmed = keyword.trim();
    // 移除已存在的相同记录
    benefitRecentSearches = benefitRecentSearches.filter(item => item !== trimmed);
    // 添加到开头
    benefitRecentSearches.unshift(trimmed);
    // 最多保留8条
    if (benefitRecentSearches.length > 8) {
        benefitRecentSearches = benefitRecentSearches.slice(0, 8);
    }
    renderBenefitRecentSearches();
}
```

**点击标签搜索**:
```javascript
function searchFromBenefitRecent(keyword) {
    if (benefitSearchInput) {
        benefitSearchInput.value = keyword;
    }
    renderBenefitCards(keyword);
    updateSearchClearButton();
}
```

---

### 6.3 单次护理搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 按商品名称搜索单次护理 |
| 搜索框ID | `addServiceSearchInput` |
| 最近搜索ID | `addServiceRecentList` |
| 核心程度 | **核心** |

---

### 6.4 产品搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 按商品名称搜索产品 + 表格列排序 |
| 搜索框ID | `addProductSearchInput` |
| 最近搜索ID | `addProductRecentList` |
| 核心程度 | **核心** |

**表格排序功能**:
- 可排序列：商品名称、规格、库存、价格
- 触发方式：点击列头的排序图标

---

### 6.5 卡项搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 按名称搜索卡项 |
| 搜索框ID | `addCardItemSearchInput` |
| 最近搜索ID | `addCardItemRecentList` |
| 核心程度 | **核心** |

---

### 6.6 疗程卡搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 按名称搜索疗程卡 |
| 搜索框ID | `addCourseSearchInput` |
| 最近搜索ID | `addCourseRecentList` |
| 核心程度 | **核心** |

---

### 6.7 升卡卡项搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 搜索目标升卡卡项 |
| 搜索框ID | `upgradeNewCardSearchInput` |
| 最近搜索ID | `upgradeNewCardRecentList` |
| 核心程度 | 辅助 |

---

### 6.8 分类标签筛选

| 属性 | 说明 |
|-----|------|
| 功能描述 | 服务/产品/卡项各类弹窗中的分类Tab切换 |
| 实现方式 | 点击分类标签，切换 `active` class |
| 核心程度 | UI交互 |

**各弹窗分类Tab**:

| 弹窗 | 分类选项 |
|-----|---------|
| 添加单次护理 | 全部 / 面部护理 / 身体护理 / SPA / 特殊护理 |
| 添加产品 | 全部 / 护肤品 / 彩妆 / 工具 / 套装 |
| 添加卡项 | 全部 / 有限次卡 / 通卡 / 金额卡 |
| 添加疗程卡 | 全部 / 有限次卡 / 通卡 |
| 升卡选择 | 有限次卡 / 通卡 / 金额卡 |

---

### 6.9 美容师搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 批量/单行美容师弹窗内搜索 |
| 批量弹窗 | `beauticianSearchInput` |
| 单行弹窗 | `rowBeauticianSearchInput` |
| 核心程度 | 辅助 |

---

### 6.10 搜索清除

| 属性 | 说明 |
|-----|------|
| 功能描述 | 各搜索框的清除/重置功能 |
| 显示条件 | 搜索框有内容时显示清除按钮 |
| 核心程度 | UI交互 |

**实现逻辑**:
```javascript
function setBeauticianClearVisible() {
    const has = !!(beauticianSearchInput && beauticianSearchInput.value.trim());
    if (beauticianSearchClear) {
        beauticianSearchClear.style.display = has ? 'flex' : 'none';
    }
}

beauticianSearchInput?.addEventListener('input', function () {
    setBeauticianClearVisible();
    renderBeauticianGrid();
});

beauticianSearchClear?.addEventListener('click', function () {
    if (!beauticianSearchInput) return;
    beauticianSearchInput.value = '';
    setBeauticianClearVisible();
    renderBeauticianGrid();
    beauticianSearchInput.focus();
});
```

---

## 搜索交互规范

### 统一交互流程
1. 用户在搜索框输入关键词
2. 实时过滤列表内容
3. 显示清除按钮（当有内容时）
4. 点击清除按钮 → 清空搜索框 → 重置列表
5. 点击最近搜索标签 → 自动填入搜索框 → 执行搜索

### 空状态处理
当搜索无结果时，显示空状态提示：
```html
<div class="beautician-empty" id="beauticianEmptyState">
    <svg><!-- 无匹配图标 --></svg>
    <div>暂无匹配的美容师</div>
</div>
```

---

## 后续文档

- 下一模块: [07 - 价格与优惠管理](./AIGen-07-价格与优惠管理.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
