# 05 - 美容师管理

> **所属模块**: 开单收银页
> **功能点数**: 3项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 5.1 批量美容师选择弹窗

| 属性 | 说明 |
|-----|------|
| 功能描述 | 搜索美容师、多选（最多5人）、一键分配 |
| 弹窗ID | `beauticianSelectModalOverlay` |
| 搜索框 | `beauticianSearchInput` |
| 美容师网格 | `beauticianGrid` |
| 确认按钮 | `beauticianModalConfirm` |
| 核心程度 | **核心** |

**数据结构**:
```javascript
const beauticianOptions = [
    { id: 'b-001', name: '张美容师' },
    { id: 'b-002', name: '李美容师' },
    // ... 最多支持12位美容师
];
const beauticianById = new Map(beauticianOptions.map(b => [b.id, b]));
const beauticianByName = new Map(beauticianOptions.map(b => [b.name, b]));
```

**状态管理**:
```javascript
let persistedBeauticianIds = [];  // 已保存的美容师ID列表
let draftBeauticianIds = [];      // 当前弹窗中选择的ID列表
```

**交互流程**:
1. 点击"选择美容师"按钮 → 打开弹窗
2. 点击美容师卡片 → 切换选中状态
3. 点击确认 → 保存选择，批量应用到所有商品行
4. 点击取消 → 放弃更改

**数量限制**:
- 最多选择 5 位美容师
- 超出时显示 Toast 提示："最多只能选择5位美容师"

---

### 5.2 单行美容师选择弹窗

| 属性 | 说明 |
|-----|------|
| 功能描述 | 为特定商品行独立选择美容师 |
| 弹窗ID | `rowBeauticianModalOverlay` |
| 标题区域 | `rowBeauticianModalTitle` |
| 搜索框 | `rowBeauticianSearchInput` |
| 美容师网格 | `rowBeauticianGrid` |
| 确认按钮 | `rowBeauticianModalConfirm` |
| 核心程度 | 辅助 |

**特殊交互**:
- 弹窗标题动态显示商品名称："为「商品名称」设置美容师"
- 支持获取当前行已选的美容师ID
- 单独应用选择到指定行

**状态管理**:
```javascript
let rowBeauticianTargetBtn = null;      // 当前操作的目标按钮
let rowBeauticianDraftIds = [];          // 当前弹窗中选择的ID列表
let rowBeauticianOriginalIds = [];       // 原始ID列表（用于取消时恢复）
```

---

### 5.3 美容师搜索

| 属性 | 说明 |
|-----|------|
| 功能描述 | 批量/单行弹窗内搜索美容师 |
| 搜索方式 | 按美容师名称关键词过滤 |
| 清除按钮 | `beauticianSearchClear` / `rowBeauticianSearchClear` |
| 空状态 | 显示"暂无匹配的美容师" |
| 核心程度 | 辅助 |

**搜索逻辑**:
```javascript
function filterBeauticians(keyword) {
    const k = (keyword || '').trim();
    if (!k) return beauticianOptions.slice();
    return beauticianOptions.filter(b => b.name.includes(k));
}
```

---

## 美容师显示格式

**多选显示**:
```javascript
function formatBeauticianText(ids) {
    return (ids || []).map(id => beauticianById.get(id)?.name).filter(Boolean).join(',');
}
// 示例: '张美容师, 李美容师, 王美容师'
```

**按钮显示逻辑**:
```javascript
function setRowBeauticianValue(row, beauticianIds) {
    const text = formatBeauticianText(ids);
    const btn = row.querySelector('.row-beautician-btn');
    if (btn) {
        btn.textContent = text ? text : '选择美容师';
        btn.setAttribute('data-value', text || '');
        btn.setAttribute('data-ids', ids.join(','));
    }
}
```

---

## 批量应用逻辑

点击批量美容师弹窗的确认按钮后：

```javascript
beauticianModalConfirm?.addEventListener('click', function () {
    if (draftBeauticianIds.length === 0) {
        showToast('请至少选择一位美容师');
        return;
    }
    persistedBeauticianIds = draftBeauticianIds.slice();
    syncBeauticianInputs();
    applyBeauticianToAllSelectedItems(persistedBeauticianIds);
    closeBeauticianModal(false);
});
```

**应用范围**:
```javascript
function applyBeauticianToAllSelectedItems(beauticianIds) {
    // 单次护理表格
    document.querySelectorAll('#service-table-body tr.item-row').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    // 产品表格
    document.querySelectorAll('#product-table-body tr.item-row').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    // 权益消耗表格
    document.querySelectorAll('#benefit-consume-table-body tr').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    // 疗程卡表格
    document.querySelectorAll('#course-table-body tr.item-row').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    // 金额卡表格
    document.querySelectorAll('#amount-card-table-body tr.item-row').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });
}
```

---

## 获取行的美容师ID

```javascript
function getRowBeauticianIds(row) {
    const btn = row?.querySelector('.row-beautician-btn');
    const idsStr = btn?.getAttribute('data-ids') || '';
    return idsStr ? idsStr.split(',').filter(Boolean) : [];
}
```

---

## 提交美容师绑定

```javascript
async function submitRowBeauticianBinding(row, beauticianIds) {
    const payload = {
        itemType: row?.getAttribute('data-item-type') || '',
        itemId: row?.getAttribute('data-item-id') || '',
        benefitId: row?.getAttribute('data-benefit-id') || '',
        cardId: row?.getAttribute('data-card-id') || '',
        beauticianIds: (beauticianIds || []).slice()
    };

    try {
        const res = await fetch('/api/item/beauticians', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.log('row beautician binding payload (mock)', payload);
    }
}
```

---

## 后续文档

- 下一模块: [06 - 搜索与筛选](./AIGen-06-搜索与筛选.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
