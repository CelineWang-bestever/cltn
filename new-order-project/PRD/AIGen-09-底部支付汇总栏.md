# 09 - 底部支付汇总栏

> **所属模块**: 开单收银页
> **功能点数**: 6项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 9.1 待收款显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 当前应收总额实时汇总 |
| 计算方式 | 所有商品折后价之和 - 优惠金额 |
| 显示位置 | 底部栏核心区域 |
| 核心程度 | **核心** |

**计算公式**:
```
待收款 = Σ(单次护理折后价) + Σ(产品折后价) + Σ(疗程卡折后价) + Σ(金额卡折后价) - 整单优惠
```

---

### 9.2 金额卡支付显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 金额卡支付汇总信息 |
| 数据结构 | `{ total, cards }` |
| 核心程度 | 展示 |

**数据结构**:
```javascript
{
    total: 500.00,           // 金额卡总支付
    cards: [
        { cardId: 'c-001', name: '储值卡A', amount: 300.00 },
        { cardId: 'c-002', name: '储值卡B', amount: 200.00 }
    ],
    hasAvailableMoneyCards: true
}
```

---

### 9.3 共优惠显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 总优惠金额汇总 |
| 计算方式 | 原价总额 - 应付金额 |
| 核心程度 | 展示 |

---

### 9.4 提交订单按钮

| 属性 | 说明 |
|-----|------|
| 功能描述 | 触发订单提交流程 |
| 按钮ID | `checkoutBtn` |
| 核心程度 | **核心** |

**点击处理**:
```javascript
checkoutBtn?.addEventListener('click', async function () {
    // 1. 校验必填项
    if (selectedAmountCards.some(c => !String(c?.name || '').trim())) {
        showToast('金额卡名称不能为空');
        return;
    }

    // 2. 校验充值金额
    const rechargeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]');
    for (const module of rechargeModules) {
        const item = getRechargeItem(cardId);
        if (item.rechargeAmount <= 0) {
            showToast('请输入充值金额');
            return;
        }
    }

    // 3. 构建提交数据
    const payload = buildCheckoutPayload();

    // 4. 提交到API
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.log('checkout payload (mock)', payload);
    }

    // 5. 跳转支付页面
    const url = './payment.html?orderId=' + orderId + '&payable=' + payable + '&discount=' + discount;
    window.location.href = url;
});
```

---

### 9.5 核销按钮

| 属性 | 说明 |
|-----|------|
| 功能描述 | 扫码核销功能入口 |
| 按钮类 | `btn-verify` |
| 当前实现 | 显示 Toast 提示"扫码核销" |
| 核心程度 | 辅助 |

---

### 9.6 取单按钮

| 属性 | 说明 |
|-----|------|
| 功能描述 | 获取已有订单功能入口 |
| 按钮类 | `btn-fetch` |
| 当前实现 | 显示 Toast 提示"取单功能" |
| 核心程度 | 辅助 |

---

## 底部栏布局

```
┌─────────────────────────────────────────────────────────────────┐
│  待收款 ¥0.00  │  金额卡 ¥0.00  │  共优惠 ¥0.00  │  [提交订单]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 实时汇总更新

所有汇总数据在以下操作后实时更新：

| 触发操作 | 更新内容 |
|---------|---------|
| 添加商品 | 待收款 += 商品折后价 |
| 修改折扣 | 待收款 = 重新计算 |
| 修改数量 | 待收款 = 重新计算 |
| 应用整单优惠 | 共优惠 = 原价 - 应付 |
| 使用金额卡 | 金额卡支付 = 累加卡金额 |

---

## 后续文档

- 下一模块: [10 - 订单提交流程](./AIGen-10-订单提交流程.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
