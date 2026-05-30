# 01 - 客户选择与身份管理

> **所属模块**: 开单收银页
> **功能点数**: 9项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 1.1 选择会员

| 属性 | 说明 |
|-----|------|
| 功能描述 | 打开会员搜索/选择弹窗（iframe嵌入），搜索并选择会员 |
| 触发方式 | 点击"选择会员"按钮 |
| 实现方式 | 通过iframe加载 `popup-find-customer.html` |
| 核心程度 | **核心** |

**实现细节**:
- 点击按钮触发 `openMemberModal()` 函数
- 弹窗以 `show` class控制显示/隐藏
- 会员选择后调用 `selectMember(member, element)` 记录选中状态

---

### 1.2 散客开单

| 属性 | 说明 |
|-----|------|
| 功能描述 | 非会员快速开单模式，跳过会员关联 |
| 触发方式 | 点击"散客开单"按钮 |
| 确认机制 | 弹出确认提示框，确认后切换为散客模式 |
| 核心程度 | **核心** |

**实现细节**:
- 点击按钮触发 `handleWalkInCustomer()` 函数
- 调用 `showConfirmModal()` 显示确认提示
- 确认后调用 `switchToGuestCashier()` 切换模式
- 切换后显示 Toast 提示"已切换为散客收银模式"

---

### 1.3 散客/会员身份切换

| 属性 | 说明 |
|-----|------|
| 功能描述 | 切换时弹出确认提示 |
| 确认时机 | 从会员切换到散客时必须确认 |
| 核心程度 | 辅助 |

---

### 1.4 会员信息面板

| 属性 | 说明 |
|-----|------|
| 功能描述 | 左侧栏显示会员姓名、类型标签（新客/体验客/会员）、手机号 |
| 展示区域 | 控制栏中的 `memberInfoPanel` |
| 核心程度 | 展示 |

**实现细节**:
```javascript
updateMemberInfo(member) {
    // 显示会员信息区域
    memberInfoPanel.style.display = 'flex';
    guestCashierStatus.style.display = 'none';
    memberDetails.style.display = 'flex';

    // 更新会员详细信息
    memberName.textContent = member.name;
    memberTag.textContent = member.level || '会员';
    memberPhone.textContent = member.phone;
}
```

---

### 1.5 钱包余额显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 左侧栏显示会员钱包余额 |
| 元素选择器 | `.member-balance-value` (第一个) |
| 核心程度 | 展示 |

**数据来源**: `member.walletBalance` 或 `member.balance`

---

### 1.6 金额卡余额显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 左侧栏显示会员金额卡总余额 |
| 元素选择器 | `.member-balance-value` (第二个) |
| 核心程度 | 展示 |

**数据来源**: `member.cardBalance`

---

### 1.7 欠款显示

| 属性 | 说明 |
|-----|------|
| 功能描述 | 左侧栏显示会员欠款信息 |
| 元素选择器 | `.member-balance-value.debt` |
| 显示条件 | 欠款 > 0 时显示，否则隐藏整个欠款区域 |
| 核心程度 | 展示 |

**实现逻辑**:
```javascript
const hasDebt = member.debt && member.debt !== '¥0.00' && member.debt !== '0' && member.debt !== '';
if (hasDebt) {
    balanceItems[2].textContent = member.debt;
    debtSection.style.display = 'flex';
} else {
    debtSection.style.display = 'none';
}
```

---

### 1.8 还款入口

| 属性 | 说明 |
|-----|------|
| 功能描述 | 左侧栏还款按钮，快速跳转还款功能 |
| 触发方式 | 点击"还款"按钮 |
| 当前实现 | 显示 Toast 提示"还款功能" |
| 核心程度 | **核心** |

---

### 1.9 会员详情跳转

| 属性 | 说明 |
|-----|------|
| 功能描述 | 点击跳转至 customer-detail-pad.html |
| 触发方式 | 点击"会员详情 >"按钮 |
| 跳转方式 | `window.location.href='customer-detail-pad.html'` |
| 核心程度 | 辅助 |

---

## 状态管理

### 会员状态对象

```javascript
let selectedMember = null;  // 当前选中的会员对象

// 模拟会员数据结构
const mockMembers = [
    {
        id: 1,
        name: '张兰',
        phone: '13812348888',
        level: '新客',        // 新客/体验客/会员
        points: '2560',
        walletBalance: '¥1280.00',
        cardBalance: '¥0.00',
        debt: '¥0.00'
    },
    // ...
];
```

### 模式切换

| 模式 | CSS类 | 可见列 |
|-----|-------|-------|
| 会员模式 | 无额外类名 | 显示"使用卡项"列 |
| 散客模式 | `guest-mode` (添加到 `#orderMain`) | 隐藏"使用卡项"列 |

---

## 关联文件

| 文件 | 说明 |
|-----|------|
| `popup-find-customer.html` | 会员搜索选择弹窗 (iframe加载) |
| `customer-detail-pad.html` | 会员详情页面 |

---

## 后续文档

- 下一模块: [02 - 商品添加模块](./AIGen-02-商品添加模块.md)
