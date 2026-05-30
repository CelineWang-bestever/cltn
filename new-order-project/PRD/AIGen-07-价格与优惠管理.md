# 07 - 价格与优惠管理

> **所属模块**: 开单收银页
> **功能点数**: 9项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 7.1 整单改价

| 属性 | 说明 |
|-----|------|
| 功能描述 | 弹出整单改价面板，输入整单优惠金额 |
| 触发方式 | 点击"改价"按钮 |
| 核心程度 | **核心** |

**实现逻辑**:
- 展开整单改价面板
- 输入优惠金额
- 实时计算应付金额

---

### 7.2 整单改价最低限制提示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 显示最低改价金额/最低折扣提示 |
| 显示位置 | 整单改价面板内 |
| 核心程度 | 辅助 |

---

### 7.3 移除整单改价优惠

| 属性 | 说明 |
|-----|------|
| 功能描述 | 清除整单改价，恢复原价 |
| 触发方式 | 点击"移除"或恢复默认 |
| 核心程度 | 辅助 |

---

### 7.4 移除商品优惠

| 属性 | 说明 |
|-----|------|
| 功能描述 | 清除逐商品优惠 |
| 实现方式 | 重置折扣为100或清空折后价 |
| 核心程度 | 辅助 |

---

### 7.5 整单与逐行改价互斥

| 属性 | 说明 |
|-----|------|
| 功能描述 | 整单改价时禁止逐行改价，反之亦然 |
| 核心程度 | **核心** |

**互斥逻辑**:
```javascript
// 整单改价时
function enableWholeOrderDiscount() {
    // 禁用逐行折扣输入
    document.querySelectorAll('input[data-field="discount"]').forEach(input => {
        input.disabled = true;
    });
}

// 逐行改价时
function enableRowDiscount() {
    // 禁用整单改价
    wholeOrderDiscountInput.disabled = true;
}
```

---

### 7.6 优惠金额输入

| 属性 | 说明 |
|-----|------|
| 功能描述 | 订单折叠面板中的优惠金额字段 |
| 触发 | 弹出数字键盘输入 |
| 核心程度 | **核心** |

---

### 7.7 应付金额联动

| 属性 | 说明 |
|-----|------|
| 功能描述 | 修改应付金额时优惠金额同步调整 |
| 核心程度 | **核心** |

**联动公式**:
```
优惠金额 = 原价总额 - 应付金额
```

---

### 7.8 折扣/折后价冲突校验

| 属性 | 说明 |
|-----|------|
| 功能描述 | 输入冲突时弹出提示 |
| 冲突场景 | 折后价 > 原价 或 折扣 > 100% |
| 核心程度 | 辅助 |

---

### 7.9 金额卡支付

| 属性 | 说明 |
|-----|------|
| 功能描述 | 选择金额卡抵扣订单金额 |
| 弹窗ID | `moneyCardModalOverlay` |
| 核心程度 | **核心** |

**支付数据结构**:
```javascript
function buildCheckoutMoneyCardSummary() {
    const map = new Map();
    const moneyCardRows = document.querySelectorAll('tr.item-row[data-moneycards]');

    moneyCardRows.forEach(row => {
        const apps = getRowMoneyCards(row);
        apps.forEach(app => {
            const cardId = String(app?.cardId || '').trim();
            const amt = roundMoney2(Number(app?.amount || 0));
            // 累加同卡项金额
            const cur = map.get(cardId) || { cardId, name: '', amount: 0 };
            cur.amount = roundMoney2(cur.amount + amt);
            map.set(cardId, cur);
        });
    });

    const cards = Array.from(map.values()).filter(x => x.amount > 0.000001);
    const total = roundMoney2(cards.reduce((s, x) => s + x.amount, 0));

    return { total, cards };
}
```

---

## 金额计算函数

### 精度处理
```javascript
function roundMoney2(num) {
    return Math.round((Number(num) || 0) * 100) / 100;
}
```

### 折扣计算
```javascript
// 折后价 = 原价 × (折扣 / 100)
// 优惠 = 原价 - 折后价
```

---

## 订单汇总数据结构

```javascript
{
    // 整单信息
    orderDate: '2026-05-30T10:00',
    beauticianBatchIds: ['b-001', 'b-002'],
    remark: '客户要求加时',

    // 商品明细
    items: [
        {
            itemType: 'service',
            itemId: 's-001',
            buyQty: 1,
            giftQty: 0,
            discount: 100,
            finalPrice: 299.00,
            beauticianIds: ['b-001']
        },
        {
            itemType: 'product',
            itemId: 'p-001',
            buyQty: 2,
            giftQty: 0,
            discount: 80,
            finalPrice: 159.20,
            beauticianIds: ['b-002']
        },
        // ...
    ]
}
```

---

## 后续文档

- 下一模块: [08 - 订单信息面板](./AIGen-08-订单信息面板.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
