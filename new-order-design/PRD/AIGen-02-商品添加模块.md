# 02 - 商品添加模块

> **所属模块**: 开单收银页
> **功能点数**: 5项
> **核心程度**: ⭐⭐⭐ 核心

---

## 功能清单

### 2.1 客户权益入口

| 属性 | 说明 |
|-----|------|
| 功能描述 | 消耗/升卡/充值已有权益（仅会员可见） |
| 触发方式 | 点击"客户权益"卡片 |
| 可见条件 | 仅在会员模式下显示（`.member-only-btn`） |
| 核心程度 | **核心** |

**实现细节**:
```javascript
// 打开客户权益弹窗
function openBenefitModal() {
    benefitModalOverlay.classList.add('show');
}
```

**权益弹窗功能**:
- 查看会员已有卡项及权益
- 消耗已有权益
- 升卡操作
- 充卡操作

---

### 2.2 添加单次护理

| 属性 | 说明 |
|-----|------|
| 功能描述 | 打开单次护理添加弹窗，按分类筛选并选入购物车 |
| 触发方式 | 点击"添加单次护理"卡片 |
| 弹窗ID | `addServiceModalOverlay` |
| 核心程度 | **核心** |

**实现细节**:
```javascript
function openAddServiceModal() {
    document.getElementById('addServiceModalOverlay').classList.add('show');
}
```

**弹窗功能**:
- 搜索商品名称
- 分类Tab筛选（全部/面部护理/身体护理/SPA/特殊护理）
- 已选列表管理
- 添加到订单

---

### 2.3 添加产品

| 属性 | 说明 |
|-----|------|
| 功能描述 | 打开产品添加弹窗，支持分类筛选和表格排序 |
| 触发方式 | 点击"添加产品"卡片 |
| 弹窗ID | `addProductModalOverlay` |
| 核心程度 | **核心** |

**实现细节**:
```javascript
function openAddProductModal() {
    document.getElementById('addProductModalOverlay').classList.add('show');
}
```

**弹窗功能**:
- 搜索商品名称
- 分类Tab筛选（全部/护肤品/彩妆/工具/套装）
- 表格列排序（商品名称/规格/库存/价格）
- 已选列表管理

---

### 2.4 添加疗程卡

| 属性 | 说明 |
|-----|------|
| 功能描述 | 打开疗程卡添加弹窗，仅会员可见 |
| 触发方式 | 点击"添加疗程卡"卡片 |
| 弹窗ID | `addCourseModalOverlay` |
| 可见条件 | 仅在会员模式下显示 |
| 核心程度 | **核心** |

**实现细节**:
```javascript
function openAddCourseModal(type) {
    addCourseModalKind = type === 'amountCard' ? 'amountCard' : 'course';
    setAddCourseModalKind(addCourseModalKind);
    document.getElementById('addCourseModalOverlay').classList.add('show');
}
```

**弹窗功能**:
- 搜索疗程名称
- 分类Tab筛选（全部/有限次卡/通卡）
- 左右面板布局（左侧列表 + 右侧详情）
- 自定义疗程卡入口

---

### 2.5 添加金额卡

| 属性 | 说明 |
|-----|------|
| 功能描述 | 打开金额卡添加弹窗，仅会员可见 |
| 触发方式 | 点击"添加金额卡"卡片 |
| 弹窗ID | `addCourseModalOverlay` (复用) |
| 可见条件 | 仅在会员模式下显示 |
| 核心程度 | **核心** |

**实现细节**:
```javascript
// 触发时传入 'amountCard' 参数
function openAddCourseModal('amountCard') {
    addCourseModalKind = 'amountCard';
    // ...
}
```

---

## 入口卡片布局

HTML结构位于 `.action-grid` 容器中：

```html
<div class="action-grid">
    <!-- 客户权益 - 仅会员可见 -->
    <div class="action-card benefit member-only-btn btn-primary" style="display: none;">
        <!-- 图标 + 文字 -->
    </div>

    <!-- 添加单次护理 -->
    <div class="action-card service btn-primary">
        <!-- 图标 + 文字 -->
    </div>

    <!-- 添加产品 -->
    <div class="action-card product btn-primary">
        <!-- 图标 + 文字 -->
    </div>

    <!-- 添加疗程卡 - 仅会员可见 -->
    <div class="action-card package member-only-btn btn-primary" style="display: none;">
        <!-- 图标 + 文字 -->
    </div>

    <!-- 添加金额卡 - 仅会员可见 -->
    <div class="action-card card member-only-btn btn-primary" style="display: none;">
        <!-- 图标 + 文字 -->
    </div>
</div>
```

---

## 会员专属入口控制

| 入口 | 会员可见 | 散客可见 |
|-----|:------:|:------:|
| 客户权益 | ✅ | ❌ |
| 添加单次护理 | ✅ | ✅ |
| 添加产品 | ✅ | ✅ |
| 添加疗程卡 | ✅ | ❌ |
| 添加金额卡 | ✅ | ❌ |

**控制逻辑**:
```javascript
// 切换到会员模式时
document.querySelectorAll('.member-only-btn').forEach(btn => {
    btn.style.display = '';  // 显示
});

// 切换到散客模式时
document.querySelectorAll('.member-only-btn').forEach(btn => {
    btn.style.display = 'none';  // 隐藏
});
```

---

## 关联弹窗

| 弹窗 | 对应功能 |
|-----|---------|
| `benefitModalOverlay` | 客户权益 |
| `addServiceModalOverlay` | 添加单次护理 |
| `addProductModalOverlay` | 添加产品 |
| `addCourseModalOverlay` | 添加疗程卡/金额卡 |

详细弹窗交互见: [04 - 弹窗模态框系统](./AIGen-04-弹窗模态框系统.md)

---

## 后续文档

- 下一模块: [03 - 已选商品管理](./AIGen-03-已选商品管理.md)
- 返回总览: [00 - 功能需求总览](./AIGen-00-功能需求总览.md)
