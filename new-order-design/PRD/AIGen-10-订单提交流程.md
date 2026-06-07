# 10 - 订单提交流程

> **所属模块**: 开单收银页
> **功能点数**: 4项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 10.1 数据构建

| 属性 | 说明 |
|-----|------|
| 功能描述 | 构建订单提交 payload 数据结构 |
| 核心函数 | `buildCheckoutPayload()` |
| 核心程度 | **核心** |

**Payload 结构**:
```javascript
{
    beauticianBatchIds: ['b-001', 'b-002', ...],
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
        {
            itemType: 'course',
            itemId: 'c-001',
            buyQty: 1,
            giftQty: 0,
            beauticianIds: ['b-001'],
            benefits: {
                care: [{ name: '护理项目', duration: 60, price: 299, buyQty: 1, giftQty: 0 }],
                home: [{ name: '居家产品', spec: '100ml', price: 199, buyQty: 1, giftQty: 0 }],
                card: [{ name: '附加权益', cardType: '次卡', price: 0, giftQty: 2 }]
            }
        },
        {
            itemType: 'benefitConsume',
            benefitId: 'b-001',
            cardId: 'card-001',
            useQty: 1,
            beauticianIds: ['b-001']
        },
        {
            itemType: 'recharge',
            cardId: 'card-002',
            rechargeAmount: 1000,
            giftAmount: 100,
            beauticianIds: ['b-001'],
            giftBenefits: {
                care: [],
                home: [{ name: '赠送产品', spec: '50ml', price: 99, giftQty: 1 }],
                card: []
            }
        }
    ]
}
```

---

### 10.2 提交验证

| 属性 | 说明 |
|-----|------|
| 功能描述 | 提交前校验必填项和数据完整性 |
| 校验项 | 金额卡名称、充值金额等 |
| 核心程度 | **核心** |

**校验逻辑**:
```javascript
// 1. 金额卡名称校验
if (selectedAmountCards.some(c => !String(c?.name || '').trim())) {
    showToast('金额卡名称不能为空');
    return;
}

// 2. 充值金额校验
const rechargeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]');
for (const module of rechargeModules) {
    const amt = parseInt(String(item.rechargeAmount || '0'), 10) || 0;
    if (amt <= 0) {
        showToast('请输入充值金额');
        return;
    }
}
```

---

### 10.3 API 提交

| 属性 | 说明 |
|-----|------|
| 功能描述 | 提交订单数据到后端 API |
| API 端点 | `/api/checkout` |
| 请求方法 | POST |
| Content-Type | application/json |
| 核心程度 | **核心** |

**请求示例**:
```javascript
try {
    const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    showToast('提交成功，跳转支付页');
} catch (e) {
    console.log('checkout payload (mock)', payload);
    showToast('已生成提交数据（模拟），跳转支付页');
}
```

**Mock 模式**:
- 当 API 请求失败时，降级为本地存储模拟
- 数据存储到 `localStorage.latest_checkout_payload`

---

### 10.4 跳转支付页面

| 属性 | 说明 |
|-----|------|
| 功能描述 | 提交成功后跳转到支付页面 |
| 目标页面 | `payment.html` |
| 参数传递 | URL Query String |
| 核心程度 | **核心** |

**URL 参数**:
| 参数 | 说明 | 示例 |
|-----|------|------|
| orderId | 订单ID | `ORDER_1748572800000` |
| payable | 应付金额 | `458.20` |
| discount | 优惠金额 | `41.80` |

**跳转代码**:
```javascript
const orderId = 'ORDER_' + Date.now();
const payable = parseFloat(String(document.getElementById('orderPayableAmountInput')?.value || '0')) || 0;
const discount = parseFloat(String(document.getElementById('orderDiscountAmountInput')?.value || '0')) || 0;

const url = './payment.html?orderId=' + encodeURIComponent(orderId) +
    '&payable=' + encodeURIComponent(String(payable.toFixed(2))) +
    '&discount=' + encodeURIComponent(String(discount.toFixed(2)));
window.location.href = url;
```

**金额卡数据传递**:
```javascript
const summary = buildCheckoutMoneyCardSummary();
localStorage.setItem('checkout_moneycards_' + String(orderId), JSON.stringify(summary));
localStorage.setItem('latest_checkout_moneycards', JSON.stringify({ orderId, ...summary }));
```

---

## 提交流程图

```
┌─────────────────────────────────────────────────────────────┐
│                        提交订单                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 数据校验                                                 │
│     - 金额卡名称不能为空                                      │
│     - 充值金额必须 > 0                                       │
│     - 其他业务规则校验                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (校验通过)
┌─────────────────────────────────────────────────────────────┐
│  2. 构建 Payload                                            │
│     - 收集所有商品数据                                        │
│     - 收集美容师分配                                         │
│     - 收集优惠信息                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. 提交到 API                                               │
│     - POST /api/checkout                                    │
│     - Content-Type: application/json                         │
│     - 保存金额卡汇总到 localStorage                           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼ (失败/Mock)
              ┌──────────┐       ┌──────────────┐
              │ 成功提示  │       │ 模拟模式      │
              │ 跳转支付  │       │ 本地存储数据   │
              └──────────┘       └──────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 跳转到 payment.html                                      │
│     ?orderId=ORDER_xxx                                      │
│     &payable=458.20                                         │
│     &discount=41.80                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 本地存储 Key

| Key | 内容 | 用途 |
|-----|------|------|
| `latest_checkout_payload` | 最近一次提交的订单数据 | 调试/恢复 |
| `checkout_moneycards_{orderId}` | 指定订单的金额卡汇总 | 支付页显示 |
| `latest_checkout_moneycards` | 最近一次金额卡汇总 | 支付页备用 |

---

## 后续文档

- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
