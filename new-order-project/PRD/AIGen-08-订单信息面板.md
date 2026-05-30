# 08 - 订单信息面板

> **所属模块**: 开单收银页
> **功能点数**: 6项
> **核心程度**: 混合

---

## 功能清单

### 8.1 下单时间选择

| 属性 | 说明 |
|-----|------|
| 功能描述 | datetime-local 输入选择下单日期时间 |
| 输入类型 | `<input type="datetime-local">` |
| 核心程度 | 辅助 |

---

### 8.2 批量分配美容师

| 属性 | 说明 |
|-----|------|
| 功能描述 | 为所有商品统一分配美容师（最多5人） |
| 输入框ID | `orderBeauticianInput` |
| 触发方式 | 点击输入框，弹出美容师选择弹窗 |
| 核心程度 | **核心** |

**实现逻辑**:
```javascript
orderBeauticianInput?.addEventListener('click', openBeauticianModal);
orderBeauticianInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openBeauticianModal();
});

function syncBeauticianInputs() {
    const text = formatBeauticianText(persistedBeauticianIds);
    if (orderBeauticianInput) orderBeauticianInput.value = text;
}
```

---

### 8.3 优惠金额

| 属性 | 说明 |
|-----|------|
| 功能描述 | 订单级优惠金额输入 |
| 输入控件 | `orderDiscountAmountInput` |
| 触发 | 弹出数字键盘输入 |
| 核心程度 | **核心** |

---

### 8.4 应付金额

| 属性 | 说明 |
|-----|------|
| 功能描述 | 订单级应付金额输入 |
| 输入控件 | `orderPayableAmountInput` |
| 触发 | 弹出数字键盘输入 |
| 核心程度 | **核心** |

---

### 8.5 备注

| 属性 | 说明 |
|-----|------|
| 功能描述 | 订单备注文本输入 |
| 触发方式 | 点击备注区域，弹出备注弹窗 |
| 弹窗ID | `remarkModalOverlay` |
| 文本域ID | `remarkModalTextarea` |
| 核心程度 | 辅助 |

---

### 8.6 面板展开/收起

| 属性 | 说明 |
|-----|------|
| 功能描述 | 折叠面板切换 |
| 切换方式 | 点击面板头部切换显示状态 |
| 核心程度 | UI交互 |

---

## 面板布局结构

```
┌─────────────────────────────────────────────────────────┐
│  订单信息                                         [▼]  │
├─────────────────────────────────────────────────────────┤
│  下单时间: [2026-05-30 10:00        ]                   │
│                                                         │
│  美容师:    [选择美容师...]                             │
│                                                         │
│  优惠金额:  [¥0.00              ]                       │
│  应付金额:  [¥0.00              ]                       │
│                                                         │
│  备注:      [点击添加备注...]                           │
└─────────────────────────────────────────────────────────┘
```

---

## 表单数据存储

```javascript
const orderFormData = {
    orderDate: '',
    beauticianIds: [],
    discountAmount: 0,
    payableAmount: 0,
    remark: ''
};
```

---

## 后续文档

- 下一模块: [09 - 底部支付汇总栏](./AIGen-09-底部支付汇总栏.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
