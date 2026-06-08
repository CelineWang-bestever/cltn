// 模拟会员数据
const mockMembers = [
    { id: 1, name: '张兰', phone: '13812348888', level: '新客', points: '2560', walletBalance: '¥1280.00', cardBalance: '¥0.00', debt: '¥0.00' },
    { id: 2, name: '李芳', phone: '13987654321', level: '体验客', points: '8900', walletBalance: '¥5600.00', cardBalance: '¥2000.00', debt: '¥0.00' },
    { id: 3, name: '王艳', phone: '13726216961', level: '体验客', points: '1200', walletBalance: '¥890.00', cardBalance: '¥500.00', debt: '¥0.00' },
    { id: 4, name: '赵静', phone: '13655667788', level: '新客', points: '15600', walletBalance: '¥12500.00', cardBalance: '¥8000.00', debt: '¥0.00' },
    { id: 5, name: '孙丽', phone: '13599887766', level: '会员', points: '4500', walletBalance: '¥3200.00', cardBalance: '¥10000.00', debt: '¥0.00' },
    { id: 6, name: '周婷', phone: '13488888888', level: '会员', points: '300', walletBalance: '¥150.00', cardBalance: '¥0.00', debt: '¥0.00' },
    { id: 7, name: '吴芳', phone: '13399990000', level: '会员', points: '35800', walletBalance: '¥28600.00', cardBalance: '¥15000.00', debt: '¥500.00' },
    { id: 8, name: '郑琳', phone: '13222223333', level: '新客', points: '2800', walletBalance: '¥1800.00', cardBalance: '¥3000.00', debt: '¥0.00' },
];

// DOM元素
const changeMemberBtn = document.getElementById('changeMemberBtn');
const memberModalOverlay = document.getElementById('memberModalOverlay');
const memberModalClose = document.getElementById('memberModalClose');
const memberModalSearchInput = document.getElementById('memberModalSearchInput');
const memberList = document.getElementById('memberList');
const memberModalCancel = document.getElementById('memberModalCancel');
const memberModalConfirm = document.getElementById('memberModalConfirm');
const orderFormHeader = document.getElementById('orderFormCollapseContent');
const orderFormContent = document.getElementById('orderFormContent');
const confirmModalOverlay = document.getElementById('confirmModalOverlay');
const confirmCancel = document.getElementById('confirmCancel');
const confirmOk = document.getElementById('confirmOk');
const orderBeauticianInput = document.getElementById('orderBeauticianInput');
const beauticianSelectModalOverlay = document.getElementById('beauticianSelectModalOverlay');
const beauticianModalClose = document.getElementById('beauticianModalClose');
const beauticianSearchInput = document.getElementById('beauticianSearchInput');
const beauticianSearchClear = document.getElementById('beauticianSearchClear');
const beauticianGrid = document.getElementById('beauticianGrid');
const beauticianEmptyState = document.getElementById('beauticianEmptyState');
const beauticianModalCancel = document.getElementById('beauticianModalCancel');
const beauticianModalConfirm = document.getElementById('beauticianModalConfirm');
const rowBeauticianModalOverlay = document.getElementById('rowBeauticianModalOverlay');
const rowBeauticianModalTitle = document.getElementById('rowBeauticianModalTitle');
const rowBeauticianModalClose = document.getElementById('rowBeauticianModalClose');
const rowBeauticianSearchInput = document.getElementById('rowBeauticianSearchInput');
const rowBeauticianSearchClear = document.getElementById('rowBeauticianSearchClear');
const rowBeauticianGrid = document.getElementById('rowBeauticianGrid');
const rowBeauticianEmptyState = document.getElementById('rowBeauticianEmptyState');
const rowBeauticianModalCancel = document.getElementById('rowBeauticianModalCancel');
const rowBeauticianModalConfirm = document.getElementById('rowBeauticianModalConfirm');

const checkoutBtn = document.getElementById('checkoutBtn');

let selectedMember = null;
const beauticianOptions = [
    { id: 'b-001', name: '张美容师' },
    { id: 'b-002', name: '李美容师' },
    { id: 'b-003', name: '王美容师' },
    { id: 'b-004', name: '赵美容师' },
    { id: 'b-005', name: '孙美容师' },
    { id: 'b-006', name: '周美容师' },
    { id: 'b-007', name: '吴美容师' },
    { id: 'b-008', name: '郑美容师' },
    { id: 'b-009', name: '钱美容师' },
    { id: 'b-010', name: '冯美容师' },
    { id: 'b-011', name: '陈美容师' },
    { id: 'b-012', name: '褚美容师' }
];
const beauticianById = new Map(beauticianOptions.map(b => [b.id, b]));
const beauticianByName = new Map(beauticianOptions.map(b => [b.name, b]));

let persistedBeauticianIds = [];
let draftBeauticianIds = [];

let rowBeauticianTargetBtn = null;
let rowBeauticianDraftIds = [];
let rowBeauticianOriginalIds = [];

function formatBeauticianText(ids) {
    return (ids || []).map(id => beauticianById.get(id)?.name).filter(Boolean).join(',');
}

function filterBeauticians(keyword) {
    const k = (keyword || '').trim();
    if (!k) return beauticianOptions.slice();
    return beauticianOptions.filter(b => b.name.includes(k));
}

function syncBeauticianInputs() {
    const text = formatBeauticianText(persistedBeauticianIds);
    if (orderBeauticianInput) orderBeauticianInput.value = text;
}

function setBeauticianClearVisible() {
    const has = !!(beauticianSearchInput && beauticianSearchInput.value.trim());
    if (beauticianSearchClear) beauticianSearchClear.style.display = has ? 'flex' : 'none';
}

function renderBeauticianGrid() {
    if (!beauticianGrid) return;
    const keyword = beauticianSearchInput ? beauticianSearchInput.value.trim() : '';
    const filtered = filterBeauticians(keyword);

    if (beauticianEmptyState) beauticianEmptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
    beauticianGrid.style.display = filtered.length === 0 ? 'none' : 'grid';

    beauticianGrid.innerHTML = filtered.map(item => {
        const selected = draftBeauticianIds.includes(item.id);
        return `
            <button type="button" class="beautician-card ${selected ? 'selected' : ''}" data-id="${item.id}">
                <span>${item.name}</span>
            </button>
        `;
    }).join('');
}

function openBeauticianModal() {
    if (!beauticianSelectModalOverlay) return;
    draftBeauticianIds = persistedBeauticianIds.slice();
    if (beauticianSearchInput) beauticianSearchInput.value = '';
    setBeauticianClearVisible();
    renderBeauticianGrid();
    beauticianSelectModalOverlay.classList.add('show');
    setTimeout(() => beauticianSearchInput?.focus(), 50);
}

function closeBeauticianModal(resetDraft = true) {
    beauticianSelectModalOverlay?.classList.remove('show');
    if (resetDraft) {
        draftBeauticianIds = persistedBeauticianIds.slice();
    }
    if (beauticianSearchInput) beauticianSearchInput.value = '';
    setBeauticianClearVisible();
    renderBeauticianGrid();
}

function toggleBeautician(id) {
    const idx = draftBeauticianIds.indexOf(id);
    if (idx > -1) {
        draftBeauticianIds.splice(idx, 1);
        renderBeauticianGrid();
        return;
    }
    if (draftBeauticianIds.length >= 5) {
        showToast('最多只能选择5位美容师');
        return;
    }
    draftBeauticianIds.push(id);
    renderBeauticianGrid();
}

orderBeauticianInput?.addEventListener('click', openBeauticianModal);
orderBeauticianInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openBeauticianModal();
});

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

beauticianGrid?.addEventListener('click', function (e) {
    const card = e.target.closest('.beautician-card');
    if (!card) return;
    const id = card.getAttribute('data-id') || '';
    if (!id) return;
    toggleBeautician(id);
});

beauticianModalCancel?.addEventListener('click', function () {
    closeBeauticianModal(true);
});

beauticianModalClose?.addEventListener('click', function () {
    closeBeauticianModal(true);
});

function setRowBeauticianValue(row, beauticianIds) {
    if (!row) return;
    const ids = Array.isArray(beauticianIds) ? beauticianIds : [];
    const text = formatBeauticianText(ids);
    const btn = row.querySelector('.row-beautician-btn');
    if (btn) {
        btn.textContent = text ? text : '选择美容师';
        btn.setAttribute('data-value', text || '');
        btn.setAttribute('data-ids', ids.join(','));
        return;
    }
    const select = row.querySelector('select[data-field="beautician"]');
    if (select) {
        if (text) {
            const existing = Array.from(select.options).some(opt => opt.value === text || opt.textContent === text);
            if (!existing) {
                const opt = document.createElement('option');
                opt.value = text;
                opt.textContent = text;
                select.appendChild(opt);
            }
            select.value = text;
        } else {
            select.value = '';
        }
    }
}

function applyBeauticianToAllSelectedItems(beauticianIds) {
    document.querySelectorAll('#service-table-body tr.item-row, #product-table-body tr.item-row').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    document.querySelectorAll('#benefit-consume-table-body tr').forEach(row => {
        setRowBeauticianValue(row, beauticianIds);
    });

    const courseRows = document.querySelectorAll('#course-table-body tr.item-row');
    courseRows.forEach(row => setRowBeauticianValue(row, beauticianIds));

    const amountCardRows = document.querySelectorAll('#amount-card-table-body tr.item-row');
    amountCardRows.forEach(row => setRowBeauticianValue(row, beauticianIds));

    if (typeof selectedCourseCards !== 'undefined' && Array.isArray(selectedCourseCards)) {
        const text = formatBeauticianText(beauticianIds);
        selectedCourseCards.forEach(card => {
            card.beautician = text;
            card.beauticianIds = beauticianIds.slice();
        });
        if (typeof renderSelectedCourseTable === 'function') {
            renderSelectedCourseTable();
        }
    }

    if (typeof selectedAmountCards !== 'undefined' && Array.isArray(selectedAmountCards)) {
        const text = formatBeauticianText(beauticianIds);
        selectedAmountCards.forEach(card => {
            card.beautician = text;
            card.beauticianIds = beauticianIds.slice();
        });
        if (typeof renderSelectedAmountCardTable === 'function') {
            renderSelectedAmountCardTable();
        }
    }

    const upgradeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="upgrade"]');
    upgradeModules.forEach(module => setRowBeauticianValue(module, beauticianIds));
    if (typeof upgradeCardList !== 'undefined' && Array.isArray(upgradeCardList)) {
        const text = formatBeauticianText(beauticianIds);
        upgradeCardList.forEach(item => {
            item.beautician = text;
            item.beauticianIds = beauticianIds.slice();
        });
    }

    const rechargeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]');
    rechargeModules.forEach(module => setRowBeauticianValue(module, beauticianIds));
    if (typeof rechargeCardList !== 'undefined' && Array.isArray(rechargeCardList)) {
        const text = formatBeauticianText(beauticianIds);
        rechargeCardList.forEach(item => {
            item.beautician = text;
            item.beauticianIds = beauticianIds.slice();
        });
    }
}

function setRowBeauticianClearVisibleByInput(inputEl, clearBtn) {
    const has = !!(inputEl && inputEl.value.trim());
    if (clearBtn) clearBtn.style.display = has ? 'flex' : 'none';
}

function renderRowBeauticianGrid() {
    if (!rowBeauticianGrid) return;
    const keyword = rowBeauticianSearchInput ? rowBeauticianSearchInput.value.trim() : '';
    const filtered = filterBeauticians(keyword);

    if (rowBeauticianEmptyState) rowBeauticianEmptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
    rowBeauticianGrid.style.display = filtered.length === 0 ? 'none' : 'grid';

    rowBeauticianGrid.innerHTML = filtered.map(item => {
        const selected = rowBeauticianDraftIds.includes(item.id);
        return `
            <button type="button" class="beautician-card ${selected ? 'selected' : ''}" data-id="${item.id}">
                <span>${item.name}</span>
            </button>
        `;
    }).join('');
}

function openRowBeauticianModal(btn) {
    if (!rowBeauticianModalOverlay || !btn) return;
    rowBeauticianTargetBtn = btn;
    const originalIdsStr = btn.getAttribute('data-ids') || '';
    if (originalIdsStr) {
        rowBeauticianOriginalIds = originalIdsStr.split(',').filter(Boolean);
    } else {
        const originalText = (btn.getAttribute('data-value') || '').trim();
        const names = originalText ? originalText.split(',').map(s => s.trim()).filter(Boolean) : [];
        rowBeauticianOriginalIds = names.map(n => beauticianByName.get(n)?.id).filter(Boolean);
    }
    rowBeauticianDraftIds = rowBeauticianOriginalIds.slice();

    const row = btn.closest('tr');
    const itemNameFromRow = (row?.querySelector('.col-name')?.textContent || '').replace(/\s+/g, ' ').trim();
    const itemName = itemNameFromRow || (btn.getAttribute('data-item-name') || '').trim();
    if (rowBeauticianModalTitle) rowBeauticianModalTitle.textContent = itemName ? `为「${itemName}」设置美容师` : '选择美容师';

    if (rowBeauticianSearchInput) rowBeauticianSearchInput.value = '';
    setRowBeauticianClearVisibleByInput(rowBeauticianSearchInput, rowBeauticianSearchClear);
    renderRowBeauticianGrid();
    rowBeauticianModalOverlay.classList.add('show');
    setTimeout(() => rowBeauticianSearchInput?.focus(), 50);
}

function closeRowBeauticianModal(resetDraft = true) {
    rowBeauticianModalOverlay?.classList.remove('show');
    if (resetDraft) rowBeauticianDraftIds = rowBeauticianOriginalIds.slice();
    if (rowBeauticianSearchInput) rowBeauticianSearchInput.value = '';
    setRowBeauticianClearVisibleByInput(rowBeauticianSearchInput, rowBeauticianSearchClear);
    renderRowBeauticianGrid();
}

function applyRowBeauticianToTarget(beauticianIds) {
    if (!rowBeauticianTargetBtn) return;
    const row = rowBeauticianTargetBtn.closest('tr');
    if (!row) {
        const module = rowBeauticianTargetBtn.closest('.upgrade-card-module');
        const moduleType = module?.getAttribute('data-module-type') || '';
        if (module && moduleType === 'upgrade') {
            const cardId = module.getAttribute('data-old-card-id') || '';
            if (cardId && Array.isArray(upgradeCardList)) {
                const item = upgradeCardList.find(x => String(x.cardId) === String(cardId));
                if (item) {
                    item.beauticianIds = beauticianIds.slice();
                    item.beautician = formatBeauticianText(beauticianIds);
                }
            }
            setRowBeauticianValue(module, beauticianIds);
        }
        if (module && moduleType === 'recharge') {
            const cardId = (module.id || '').replace('recharge-module-', '');
            if (cardId && Array.isArray(rechargeCardList)) {
                const item = rechargeCardList.find(x => String(x.cardId) === String(cardId));
                if (item) {
                    item.beauticianIds = beauticianIds.slice();
                    item.beautician = formatBeauticianText(beauticianIds);
                }
            }
            setRowBeauticianValue(module, beauticianIds);
        }
        return;
    }

    const itemType = row.getAttribute('data-item-type') || '';
    if (itemType === 'course') {
        const id = row.getAttribute('data-item-id') || '';
        if (typeof selectedCourseCards !== 'undefined' && Array.isArray(selectedCourseCards)) {
            const course = selectedCourseCards.find(c => String(c.id) === String(id));
            if (course) {
                course.beauticianIds = beauticianIds.slice();
                course.beautician = formatBeauticianText(beauticianIds);
            }
        }
    }
    if (itemType === 'amountCard') {
        const id = row.getAttribute('data-item-id') || '';
        if (typeof selectedAmountCards !== 'undefined' && Array.isArray(selectedAmountCards)) {
            const card = selectedAmountCards.find(c => String(c.id) === String(id));
            if (card) {
                card.beauticianIds = beauticianIds.slice();
                card.beautician = formatBeauticianText(beauticianIds);
            }
        }
    }

    setRowBeauticianValue(row, beauticianIds);
    submitRowBeauticianBinding(row, beauticianIds);
}

async function submitRowBeauticianBinding(row, beauticianIds) {
    const itemType = row?.getAttribute('data-item-type') || '';
    const itemId = row?.getAttribute('data-item-id') || '';
    const benefitId = row?.getAttribute('data-benefit-id') || '';
    const cardId = row?.getAttribute('data-card-id') || '';

    const payload = {
        itemType,
        itemId,
        benefitId,
        cardId,
        beauticianIds: (beauticianIds || []).slice()
    };

    try {
        const res = await fetch('/api/item/beauticians', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
    } catch (e) {
        console.log('row beautician binding payload (mock)', payload);
    }
}

rowBeauticianSearchInput?.addEventListener('input', function () {
    setRowBeauticianClearVisibleByInput(rowBeauticianSearchInput, rowBeauticianSearchClear);
    renderRowBeauticianGrid();
});

rowBeauticianSearchClear?.addEventListener('click', function () {
    if (!rowBeauticianSearchInput) return;
    rowBeauticianSearchInput.value = '';
    setRowBeauticianClearVisibleByInput(rowBeauticianSearchInput, rowBeauticianSearchClear);
    renderRowBeauticianGrid();
    rowBeauticianSearchInput.focus();
});

rowBeauticianGrid?.addEventListener('click', function (e) {
    const card = e.target.closest('.beautician-card');
    if (!card) return;
    const id = card.getAttribute('data-id') || '';
    if (!id) return;
    const idx = rowBeauticianDraftIds.indexOf(id);
    if (idx > -1) {
        rowBeauticianDraftIds.splice(idx, 1);
        renderRowBeauticianGrid();
        return;
    }
    if (rowBeauticianDraftIds.length >= 5) {
        showToast('最多只能选择5位美容师');
        return;
    }
    rowBeauticianDraftIds.push(id);
    renderRowBeauticianGrid();
});

rowBeauticianModalCancel?.addEventListener('click', function () {
    closeRowBeauticianModal(true);
});

rowBeauticianModalClose?.addEventListener('click', function () {
    closeRowBeauticianModal(true);
});

rowBeauticianModalConfirm?.addEventListener('click', function () {
    if (rowBeauticianDraftIds.length === 0) {
        showToast('请至少选择一位美容师');
        return;
    }
    applyRowBeauticianToTarget(rowBeauticianDraftIds);
    closeRowBeauticianModal(false);
});

rowBeauticianModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeRowBeauticianModal(true);
    }
});

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

function getRowBeauticianIds(row) {
    const btn = row?.querySelector('.row-beautician-btn');
    const idsStr = btn?.getAttribute('data-ids') || '';
    return idsStr ? idsStr.split(',').filter(Boolean) : [];
}

function buildCheckoutPayload() {
    const items = [];

    document.querySelectorAll('#service-table-body tr.item-row').forEach(row => {
        items.push({
            itemType: 'service',
            itemId: row.getAttribute('data-item-id') || '',
            buyQty: parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0,
            giftQty: parseInt(row.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0,
            consumeQty: parseInt(row.querySelector('input[data-field="consume"]')?.value || '0', 10) || 0,
            beauticianIds: getRowBeauticianIds(row)
        });
    });

    document.querySelectorAll('#product-table-body tr.item-row').forEach(row => {
        items.push({
            itemType: 'product',
            itemId: row.getAttribute('data-item-id') || '',
            buyQty: parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0,
            giftQty: parseInt(row.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0,
            consumeQty: parseInt(row.querySelector('input[data-field="consume"]')?.value || '0', 10) || 0,
            beauticianIds: getRowBeauticianIds(row)
        });
    });

    document.querySelectorAll('#amount-card-table-body tr.item-row').forEach(row => {
        items.push({
            itemType: 'amountCard',
            itemId: row.getAttribute('data-item-id') || '',
            buyQty: parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0,
            giftQty: parseInt(row.querySelector('input[data-field="giftQty"]')?.value || '0', 10) || 0,
            discount: parseFloat(row.querySelector('input[data-field="discount"]')?.value || '100') || 100,
            finalPrice: parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0,
            beauticianIds: getRowBeauticianIds(row)
        });
    });

    document.querySelectorAll('#course-table-body tr.item-row').forEach(row => {
        const id = row.getAttribute('data-item-id') || '';
        const course = (typeof selectedCourseCards !== 'undefined' && Array.isArray(selectedCourseCards))
            ? selectedCourseCards.find(c => String(c.id) === String(id))
            : null;
        const isCustom = course && typeof course.cardId === 'string' && course.cardId.startsWith('custom-');
        items.push({
            itemType: 'course',
            itemId: id,
            buyQty: parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0,
            giftQty: parseInt(row.querySelector('input[data-field="giftQty"]')?.value || '0', 10) || 0,
            beauticianIds: getRowBeauticianIds(row),
            benefits: isCustom ? {
                care: (course.products || []).map(p => ({ name: p.name, duration: p.duration, price: p.price, buyQty: p.buyQty, giftQty: p.giftQty })),
                home: (course.homeProducts || []).map(p => ({ name: p.name, spec: p.spec, price: p.price, buyQty: p.buyQty, giftQty: p.giftQty })),
                card: (course.cardItems || []).map(p => ({ name: p.name, cardType: p.cardType, price: p.price, giftQty: p.giftQty }))
            } : undefined
        });
    });

    document.querySelectorAll('#benefit-consume-table-body tr.item-row').forEach(row => {
        items.push({
            itemType: 'benefitConsume',
            benefitId: row.getAttribute('data-benefit-id') || '',
            cardId: row.getAttribute('data-card-id') || '',
            useQty: parseInt(row.querySelector('input[data-field="useQty"]')?.value || '0', 10) || 0,
            beauticianIds: getRowBeauticianIds(row)
        });
    });

    document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]').forEach(module => {
        const cardId = (module.id || '').replace('recharge-module-', '');
        const item = (typeof rechargeCardList !== 'undefined' && Array.isArray(rechargeCardList))
            ? rechargeCardList.find(x => String(x.cardId) === String(cardId))
            : null;
        if (!item) return;
        items.push({
            itemType: 'recharge',
            cardId: String(item.cardId || ''),
            rechargeAmount: parseInt(String(item.rechargeAmount || '0'), 10) || 0,
            giftAmount: parseInt(String(item.giftAmount || '0'), 10) || 0,
            beauticianIds: (item.beauticianIds || []).slice(),
            giftBenefits: item.giftBenefits ? {
                care: (item.giftBenefits.care || []).map(x => ({ name: x.name, spec: x.spec, duration: x.duration, price: x.price, giftQty: x.giftQty })),
                home: (item.giftBenefits.home || []).map(x => ({ name: x.name, spec: x.spec, price: x.price, giftQty: x.giftQty })),
                card: (item.giftBenefits.card || []).map(x => ({ name: x.name, cardType: x.cardType, price: x.price, giftQty: x.giftQty }))
            } : { care: [], home: [], card: [] }
        });
    });

    return {
        beauticianBatchIds: persistedBeauticianIds.slice(),
        items
    };
}

function buildCheckoutMoneyCardSummary() {
    const map = new Map();
    const moneyCardRows = document.querySelectorAll('tr.item-row[data-moneycards]');
    moneyCardRows.forEach(row => {
        const apps = getRowMoneyCards(row);
        apps.forEach(app => {
            const cardId = String(app?.cardId || '').trim();
            if (!cardId) return;
            const amt = roundMoney2(Number(app?.amount || 0));
            if (!(amt > 0.000001)) return;
            const cur = map.get(cardId) || { cardId, name: '', amount: 0 };
            cur.amount = roundMoney2(cur.amount + amt);
            if (!cur.name) {
                const card = moneyCardById.get(cardId);
                cur.name = String(card?.name || '').trim() || String(row.getAttribute('data-money-card-name') || '').trim();
            }
            map.set(cardId, cur);
        });
    });
    const cards = Array.from(map.values()).filter(x => x.amount > 0.000001);
    const total = roundMoney2(cards.reduce((s, x) => s + x.amount, 0));
    const hasAvailableMoneyCards = typeof MONEY_CARD_OPTIONS !== 'undefined' && Array.isArray(MONEY_CARD_OPTIONS) && MONEY_CARD_OPTIONS.length > 0;
    return { total, cards, hasAvailableMoneyCards };
}

checkoutBtn?.addEventListener('click', async function () {
    if (selectedAmountCards.some(c => !String(c?.name || '').trim())) {
        showToast('金额卡名称不能为空');
        return;
    }

    const rechargeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]');
    for (const module of rechargeModules) {
        const cardId = (module.id || '').replace('recharge-module-', '');
        const item = getRechargeItem(cardId);
        if (!item) continue;
        const amt = parseInt(String(item.rechargeAmount || '0'), 10) || 0;
        if (amt <= 0) {
            showToast('请输入充值金额');
            const input = document.getElementById('recharge-amount-input-' + cardId);
            if (input) input.focus();
            return;
        }
    }

    const payload = buildCheckoutPayload();
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

    try {
        localStorage.setItem('latest_checkout_payload', JSON.stringify(payload));
    } catch (e) { }

    const orderId = 'ORDER_' + Date.now();
    const payable = parseFloat(String(document.getElementById('orderPayableAmountInput')?.value || '0')) || 0;
    const discount = parseFloat(String(document.getElementById('orderDiscountAmountInput')?.value || '0')) || 0;
    try {
        const summary = buildCheckoutMoneyCardSummary();
        localStorage.setItem('checkout_moneycards_' + String(orderId), JSON.stringify(summary));
        localStorage.setItem('latest_checkout_moneycards', JSON.stringify({ orderId, ...summary }));
    } catch (e) { }
    const url = './payment.html?orderId=' + encodeURIComponent(orderId) +
        '&payable=' + encodeURIComponent(String(payable.toFixed(2))) +
        '&discount=' + encodeURIComponent(String(discount.toFixed(2)));
    window.location.href = url;
});

beauticianSelectModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeBeauticianModal(true);
    }
});

// 渲染会员列表
function renderMemberList(members) {
    memberList.innerHTML = '';
    members.forEach((member, index) => {
        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <div class="member-avatar">
                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <div class="member-info">
                <div class="member-name-row">
                    <span class="member-name">${member.name}</span>
                    <span class="member-level">${member.level}</span>
                </div>
                <div class="member-phone">${member.phone}</div>
            </div>
        `;
        item.addEventListener('click', () => selectMember(member, item));
        memberList.appendChild(item);

        // 默认选中第一个会员
        if (index === 0 && members.length > 0) {
            selectMember(member, item);
        }
    });
}

// 选择会员
function selectMember(member, element) {
    document.querySelectorAll('.member-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    selectedMember = member;
}

// 更新会员信息显示
function updateMemberInfo(member) {
    if (!member) return;
    applyCustomerAssignmentKey(getCustomerKeyForMember(member));

    const memberInfoPanel = document.getElementById('memberInfoPanel');
    const guestCashierStatus = document.getElementById('guestCashierStatus');
    const memberDetails = document.getElementById('memberDetails');

    // 显示会员信息区域
    if (memberInfoPanel) {
        memberInfoPanel.style.display = 'flex';
    }
    // 隐藏散客收银，显示会员详情
    if (guestCashierStatus) {
        guestCashierStatus.style.display = 'none';
    }
    if (memberDetails) {
        memberDetails.style.display = 'flex';
    }

    // 显示仅会员可见的按钮
    document.querySelectorAll('.member-only-btn').forEach(btn => {
        btn.style.display = '';
    });

    // 切换到会员模式，显示"使用卡项"列
    const orderMain = document.getElementById('orderMain');
    if (orderMain) {
        orderMain.classList.remove('guest-mode');
    }
    applyGuestModeQuantityRules();
    applyMemberModeProductConsumeSync();

    // 更新会员详细信息
    const memberName = memberDetails.querySelector('.member-name');
    const memberTag = memberDetails.querySelector('.member-tag');
    const memberPhone = memberDetails.querySelector('.member-phone');
    const memberNo = memberDetails.querySelector('.member-no');
    const memberPoints = memberDetails.querySelector('.member-points');

    if (memberName) memberName.textContent = member.name;
    if (memberTag) memberTag.textContent = member.level || '会员';
    if (memberPhone) memberPhone.textContent = member.phone;
    if (memberNo) memberNo.textContent = member.memberNo || '-';
    if (memberPoints) memberPoints.textContent = member.points || '0';

    const walletBalanceEl = memberDetails.querySelector('.member-balance-item[data-balance="wallet"] .member-balance-value');
    const moneyCardBalanceEl = memberDetails.querySelector('.member-balance-item[data-balance="moneycard"] .member-balance-value');
    const timesCardRemainValueEl = memberDetails.querySelector('.member-balance-item[data-balance="timescard"] .member-balance-value');
    const debtValueEl = memberDetails.querySelector('.member-balance-value.debt');

    if (walletBalanceEl) walletBalanceEl.textContent = member.walletBalance || member.balance || '¥0.00';
    if (moneyCardBalanceEl) moneyCardBalanceEl.textContent = member.cardBalance || '¥0.00';
    if (timesCardRemainValueEl) timesCardRemainValueEl.textContent = member.timesCardRemainingValue || '¥0.00';

    const debtSection = memberDetails.querySelector('.member-debt-section');
    if (debtSection) {
        const hasDebt = member.debt && member.debt !== '¥0.00' && member.debt !== '0' && member.debt !== '';
        if (hasDebt) {
            if (debtValueEl) debtValueEl.textContent = member.debt;
            debtSection.style.display = 'flex';
        } else {
            if (debtValueEl) debtValueEl.textContent = '';
            debtSection.style.display = 'none';
        }
    }

    // 更新选中状态
    selectedMember = member;
}

// 切换到散客收银状态


function switchToGuestCashier() {
    // 清空会员选择状态
    selectedMember = null;
    document.querySelectorAll('.member-item').forEach(item => item.classList.remove('selected'));

    const memberInfoPanel = document.getElementById('memberInfoPanel');
    const guestCashierStatus = document.getElementById('guestCashierStatus');
    const memberDetails = document.getElementById('memberDetails');

    // 显示会员信息区域和散客收银
    if (memberInfoPanel) {
        memberInfoPanel.style.display = 'flex';
    }
    if (guestCashierStatus) {
        guestCashierStatus.style.display = 'flex';
    }
    if (memberDetails) {
        memberDetails.style.display = 'none';
        // 清空会员详情内容
        const memberName = memberDetails.querySelector('.member-name');
        const memberTag = memberDetails.querySelector('.member-tag');
        const memberPhone = memberDetails.querySelector('.member-phone');
        if (memberName) memberName.textContent = '';
        if (memberTag) memberTag.textContent = '';
        if (memberPhone) memberPhone.textContent = '';
        const balanceItems = memberDetails.querySelectorAll('.member-balance-value');
        balanceItems.forEach(item => item.textContent = '');
    }

    // 隐藏仅会员可见的按钮
    document.querySelectorAll('.member-only-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // 切换到散客模式，隐藏"使用卡项"列
    const orderMain = document.getElementById('orderMain');
    if (orderMain) {
        orderMain.classList.add('guest-mode');
    }
    applyCustomerAssignmentKey('guest');
    applyGuestModeQuantityRules();
}

function isGuestModeActive() {
    const orderMain = document.getElementById('orderMain');
    return !!(orderMain && orderMain.classList.contains('guest-mode'));
}

var assignedCustomerKey = 'guest';
var customerResetInProgress = false;
var customerResetOk = true;

function getCustomerKeyForMember(member) {
    if (typeof window !== 'undefined' && window.SelectedItemsReset && typeof window.SelectedItemsReset.getCustomerKeyFromMember === 'function') {
        return window.SelectedItemsReset.getCustomerKeyFromMember(member);
    }
    if (!member) return '';
    const id = member.id || member.memberNo || member.phone || member.name || '';
    const key = String(id).trim();
    if (!key) return '';
    return 'member:' + key;
}

function resetSelectedItemsAreaForCustomerChange() {
    if (customerResetInProgress) return false;
    customerResetInProgress = true;
    customerResetOk = false;
    try {
        const api = (typeof window !== 'undefined') ? window.SelectedItemsReset : null;
        if (!api || typeof api.resetSelectedItemsArea !== 'function') return false;

        const ok = api.resetSelectedItemsArea({
            document: document,
            setUpgradeCardList(v) { upgradeCardList = v; },
            setRechargeCardList(v) { rechargeCardList = v; },
            setSelectedCourseCards(v) { selectedCourseCards = v; },
            setSelectedAmountCards(v) { selectedAmountCards = v; },
            setSelectedServices(v) { selectedServices = v; },
            setSelectedProducts(v) { selectedProducts = v; },
            clearWholeOrderChange() {
                if (wholeOrderChangeState && wholeOrderChangeState.enabled) {
                    removeWholeOrderChange();
                }
            },
            afterUpdate() {
                updateSelectedItemsEmptyStates();
                updateOrderSummary();
                updateOrderAndPaymentVisibility();
                normalizeAndRenderMoneyCards();
                applyGuestModeQuantityRules();
                applyMemberModeProductConsumeSync();
            }
        });

        customerResetOk = !!ok;
        return customerResetOk;
    } finally {
        customerResetInProgress = false;
    }
}

function applyCustomerAssignmentKey(nextKey) {
    const key = String(nextKey || '').trim();
    const prev = String(assignedCustomerKey || '').trim();
    const shouldReset = (typeof window !== 'undefined' && window.SelectedItemsReset && typeof window.SelectedItemsReset.shouldResetCustomerChange === 'function')
        ? window.SelectedItemsReset.shouldResetCustomerChange(prev, key)
        : (!!prev && !!key && prev !== key);
    if (shouldReset) {
        resetSelectedItemsAreaForCustomerChange();
    }
    if (key) assignedCustomerKey = key;
}

function sanitizeQty(value, min, max, fallback) {
    const raw = String(value ?? '').trim();
    const n = parseInt(raw, 10);
    const safe = Number.isFinite(n) ? n : fallback;
    const lo = Number.isFinite(min) ? min : 0;
    const hi = Number.isFinite(max) ? max : 999;
    return clampNumber(safe, lo, hi);
}

function syncConsumeToBuyForRow(row, buyQty) {
    if (!isGuestModeActive()) return;
    if (!row) return;
    const itemType = row.getAttribute('data-item-type') || '';
    if (itemType !== 'service' && itemType !== 'product') return;

    const consumeInput = row.querySelector('input[data-field="consume"]');
    if (!(consumeInput instanceof HTMLInputElement)) return;

    const v = Math.max(0, parseInt(String(buyQty || '0'), 10) || 0);
    consumeInput.value = String(v);
    consumeInput.setAttribute('value', String(v));
    consumeInput.readOnly = true;
    consumeInput.disabled = true;
    consumeInput.dataset.locked = '1';
    consumeInput.dispatchEvent(new Event('input', { bubbles: true }));
}

function applyMemberModeProductConsumeSync() {
    if (isGuestModeActive()) return;
    const rows = document.querySelectorAll('#product-table-body tr.item-row[data-item-type="product"]');
    rows.forEach(row => {
        const buyInput = row.querySelector('input[data-field="buy"]');
        const consumeInput = row.querySelector('input[data-field="consume"]');
        if (!(buyInput instanceof HTMLInputElement) || !(consumeInput instanceof HTMLInputElement)) return;
        const buyQty = sanitizeQty(buyInput.value, 1, 999, 1);
        buyInput.value = String(buyQty);
        consumeInput.value = String(buyQty);
        consumeInput.setAttribute('value', String(buyQty));
        consumeInput.readOnly = false;
        consumeInput.disabled = false;
        consumeInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

function applyGuestModeQuantityRules() {
    const guest = isGuestModeActive();
    const rows = document.querySelectorAll('#service-table-body tr.item-row, #product-table-body tr.item-row');
    rows.forEach(row => {
        const itemType = row.getAttribute('data-item-type') || '';
        if (itemType !== 'service' && itemType !== 'product') return;
        const consumeInput = row.querySelector('input[data-field="consume"]');
        if (!(consumeInput instanceof HTMLInputElement)) return;

        if (guest) {
            const buyInput = row.querySelector('input[data-field="buy"]');
            const buyQty = sanitizeQty(buyInput?.value, 0, 999, 0);
            consumeInput.value = String(buyQty);
            consumeInput.setAttribute('value', String(buyQty));
            consumeInput.readOnly = true;
            consumeInput.disabled = true;
            consumeInput.dataset.locked = '1';
            consumeInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            if (consumeInput.dataset && consumeInput.dataset.locked === '1') {
                delete consumeInput.dataset.locked;
            }
            consumeInput.readOnly = false;
            consumeInput.disabled = false;
        }
    });
}

document.addEventListener('blur', function (e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.getAttribute('data-field') !== 'consume') return;
    if (isGuestModeActive()) return;
    const row = el.closest('#product-table-body tr.item-row[data-item-type="product"]');
    if (!row) return;
    const safe = sanitizeQty(el.value, 0, 999, 0);
    el.value = String(safe);
    el.setAttribute('value', String(safe));
    updateOrderSummary();
}, true);

// 显示/隐藏会员弹窗
window.openMemberModal = function () {
    // 显示会员选择弹窗
    memberModalOverlay.classList.add('show');
};

window.hideMemberModal = function () {
    memberModalOverlay.classList.remove('show');
    // 如果没有选择会员，切换到散客收银状态
    if (!selectedMember) {
        const memberInfoPanel = document.getElementById('memberInfoPanel');
        const guestCashierStatus = document.getElementById('guestCashierStatus');
        const memberDetails = document.getElementById('memberDetails');

        if (memberInfoPanel) {
            memberInfoPanel.style.display = 'flex';
        }
        if (guestCashierStatus) {
            guestCashierStatus.style.display = 'flex';
        }
        if (memberDetails) {
            memberDetails.style.display = 'none';
        }
        // 隐藏仅会员可见的按钮
        document.querySelectorAll('.member-only-btn').forEach(btn => {
            btn.style.display = 'none';
        });

        // 切换到散客模式，隐藏"使用卡项"列
        const orderMain = document.getElementById('orderMain');
        if (orderMain) {
            orderMain.classList.add('guest-mode');
        }
        applyGuestModeQuantityRules();
    }
    selectedMember = null;
};

// 显示/隐藏确认弹窗
function showConfirmModal(title, desc, onConfirm) {
    const modalTitle = confirmModalOverlay.querySelector('.confirm-modal-title');
    const modalDesc = confirmModalOverlay.querySelector('.confirm-modal-desc');

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;

    // 保存确认回调函数
    confirmModalOverlay.dataset.hasCallback = onConfirm ? 'true' : '';

    confirmModalOverlay.classList.add('show');
    startConfirmModalViewportWatch();
    scheduleConfirmModalViewportPosition();
}

function showAlertModal(desc) {
    const modalTitle = confirmModalOverlay.querySelector('.confirm-modal-title');
    const modalDesc = confirmModalOverlay.querySelector('.confirm-modal-desc');
    if (modalTitle) modalTitle.textContent = '提示';
    if (modalDesc) modalDesc.innerHTML = desc;
    confirmModalOverlay.dataset.hasCallback = '';
    confirmModalOverlay.dataset.alertMode = '1';
    if (confirmCancel) confirmCancel.style.display = 'none';
    if (confirmOk) confirmOk.textContent = '确认';
    confirmModalOverlay.classList.add('show');
    startConfirmModalViewportWatch();
    scheduleConfirmModalViewportPosition();
}

function hideConfirmModal() {
    confirmModalOverlay.classList.remove('show');
    stopConfirmModalViewportWatch();
    resetConfirmModalViewportPosition();
    if (confirmModalOverlay.dataset.alertMode === '1') {
        confirmModalOverlay.dataset.alertMode = '';
        if (confirmCancel) confirmCancel.style.display = '';
        if (confirmOk) confirmOk.textContent = '确定';
    }
    if (confirmModalOverlay.dataset.context === 'card-op') {
        benefitModalUpgradeIntent = false;
        benefitModalRechargeIntent = false;
        if (benefitModalOverlay && benefitModalOverlay.classList.contains('show')) {
            var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
            renderBenefitCards(keyword);
            updateSearchClearButton();
        }
    }
    confirmModalOverlay.dataset.context = '';
}

let confirmModalViewportWatchBound = false;
let confirmModalViewportRaf = 0;
function scheduleConfirmModalViewportPosition() {
    if (!confirmModalOverlay?.classList.contains('show')) return;
    if (confirmModalViewportRaf) return;
    confirmModalViewportRaf = window.requestAnimationFrame(function () {
        confirmModalViewportRaf = 0;
        applyConfirmModalViewportPosition();
    });
}

function applyConfirmModalViewportPosition() {
    if (!confirmModalOverlay?.classList.contains('show')) return;
    const modal = confirmModalOverlay.querySelector('.confirm-modal');
    if (!(modal instanceof HTMLElement)) return;
    confirmModalOverlay.classList.add('viewport-positioned');
    const vv = window.visualViewport;
    const basePad = 12;
    const rect = modal.getBoundingClientRect();
    const height = vv ? Math.max(0, vv.height) : Math.max(0, window.innerHeight || 0);
    const offsetTop = vv ? Math.max(0, vv.offsetTop || 0) : 0;
    const top = Math.max(basePad, offsetTop + Math.max(basePad, (height - rect.height) / 2));
    confirmModalOverlay.style.paddingTop = `${top}px`;
    confirmModalOverlay.style.paddingBottom = `${basePad}px`;
}

function resetConfirmModalViewportPosition() {
    if (!confirmModalOverlay) return;
    confirmModalOverlay.classList.remove('viewport-positioned');
    confirmModalOverlay.style.paddingTop = '';
    confirmModalOverlay.style.paddingBottom = '';
}

function onConfirmModalViewportChange() {
    scheduleConfirmModalViewportPosition();
}

function startConfirmModalViewportWatch() {
    if (confirmModalViewportWatchBound) return;
    confirmModalViewportWatchBound = true;
    window.addEventListener('resize', onConfirmModalViewportChange);
    window.addEventListener('scroll', onConfirmModalViewportChange, true);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onConfirmModalViewportChange);
        window.visualViewport.addEventListener('scroll', onConfirmModalViewportChange);
    }
}

function stopConfirmModalViewportWatch() {
    if (!confirmModalViewportWatchBound) return;
    confirmModalViewportWatchBound = false;
    window.removeEventListener('resize', onConfirmModalViewportChange);
    window.removeEventListener('scroll', onConfirmModalViewportChange, true);
    if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onConfirmModalViewportChange);
        window.visualViewport.removeEventListener('scroll', onConfirmModalViewportChange);
    }
}

// 搜索会员
function searchMembers(query) {
    const filtered = mockMembers.filter(m =>
        m.name.includes(query) || m.phone.includes(query)
    );
    renderMemberList(filtered);
}

// 检查已选商品中是否有单次护理或产品
function hasServiceOrProduct() {
    // 在促销方案页面，不需要检查单次护理和产品
    return false;
}

// 清空所有已选商品
function clearAllItems() {
    // 在促销方案页面，不需要清空表格
    updateOrderSummary();
}



// 处理散客开单
function handleWalkInCustomer() {
    window.confirmCallback = function () {
        switchToGuestCashier();
        showToast('已切换为散客收银模式');
    };
    showConfirmModal(
        '确认散客开单',
        '散客开单将移除当前已选会员，切换为散客收银模式，确定继续？',
        window.confirmCallback
    );
}

// Toast提示
function showToast(message) {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ========== 客户权益弹窗功能 ==========
function escapeJsStringForSingleQuote(str) {
    return String(str ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r?\n/g, '\\n');
}

var benefitModalOverlay = document.getElementById('benefitModalOverlay');
var benefitSearchInput = document.getElementById('benefitSearchInput');
var benefitSearchClear = document.getElementById('benefitSearchClear');
var benefitRecentTags = document.getElementById('benefitRecentTags');
var benefitCardsList = document.getElementById('benefitCardsList');

// 最近搜索记录（最多8条）
var benefitRecentSearches = [];
var benefitModalUpgradeIntent = false;
var benefitModalRechargeIntent = false;

function isAnyUpgradeSelected() {
    if (document.querySelector('.upgrade-card-module')) return true;
    return Array.isArray(upgradeCardList) && upgradeCardList.length > 0;
}

function isAnyRechargeSelected() {
    if (document.querySelector('[data-module-type="recharge"]')) return true;
    if (document.querySelector('[id^="recharge-module-"]')) return true;
    return Array.isArray(rechargeCardList) && rechargeCardList.length > 0;
}

function isBenefitModalUpgradeLocked() {
    return !!benefitModalUpgradeIntent || isAnyUpgradeSelected();
}

function isBenefitModalRechargeLocked() {
    return !!benefitModalRechargeIntent || isAnyRechargeSelected();
}

// 模拟会员数据（页面初始化时展示）
var mockCurrentMember = {
    id: 1001,
    name: '李美美',
    tag: 'VIP会员',
    phone: '139****6789',
    walletBalance: '¥2,580.00',
    cardBalance: '¥5,000.00',
    debt: '¥0.00'
};

// 模拟客户权益数据
var mockBenefitData = {
    cards: [
        {
            id: 'card-001',
            type: '有限次卡',
            name: '面部护理卡',
            validDate: '永久有效',
            benefits: [
                { id: 'b-001', name: '深度放松精油SPA', used: 0, total: 3, isGift: false },
                { id: 'b-002', name: '艾地苯焕颜修护精华液', used: 2, total: 3, isGift: false }
            ]
        },
        {
            id: 'card-002',
            type: '金额卡',
            name: '储值卡',
            balance: '¥5,000.00',
            giftBalance: '¥500.00',
            discount: '居家产品 5折 | 服务疗程 5折 | 次卡 8折',
            validDate: '2026-04-16 至 2027-04-16',
            benefits: [
                { id: 'b-003', name: '素颜霜', used: 1, total: 8, isGift: true }
            ]
        },
        {
            id: 'card-003',
            type: '有限次卡',
            name: '全身护理年卡',
            validDate: '2026-01-01 至 2027-01-01',
            benefits: [
                { id: 'b-004', name: '全身SPA护理', used: 5, total: 24, isGift: false },
                { id: 'b-005', name: '面部深层清洁', used: 2, total: 12, isGift: false },
                { id: 'b-006', name: '肩颈按摩', used: 0, total: 6, isGift: false }
            ]
        }
    ]
};

// 渲染客户权益卡项列表
function renderBenefitCards(searchKeyword = '') {
    if (!benefitCardsList) return;

    var html = '';
    var keyword = searchKeyword.toLowerCase();

    // 对卡项排序：有限次卡优先，其次金额卡
    var sortedCards = mockBenefitData.cards.slice().sort(function (a, b) {
        if (a.type === '有限次卡' && b.type !== '有限次卡') return -1;
        if (a.type !== '有限次卡' && b.type === '有限次卡') return 1;
        return 0;
    });

    sortedCards.forEach(function (card) {
        // 过滤：如果有搜索关键词，只显示匹配的卡项或权益
        var filteredBenefits = card.benefits.filter(function (b) {
            return !keyword ||
                card.name.toLowerCase().includes(keyword) ||
                b.name.toLowerCase().includes(keyword);
        });

        // 如果卡项名称匹配，也要显示所有权益
        if (keyword && card.name.toLowerCase().includes(keyword)) {
            filteredBenefits = card.benefits;
        }

        // 如果没有匹配的权益，跳过此卡项
        if (filteredBenefits.length === 0) return;

        // 计算卡项是否显示（基于是否有匹配的权益）
        var hasMatch = filteredBenefits.length > 0;

        html += '<div class="benefit-card-item">';
        html += '    <div class="benefit-card-header">';
        html += '        <div class="benefit-card-header-left">';
        html += '            <span class="benefit-card-type">' + card.type + '</span>';
        html += '            <span class="benefit-card-name">' + card.name + '</span>';
        html += '        </div>';
        html += '        <div class="benefit-card-actions">';
        // 有限次卡类型隐藏充卡按钮
        if (card.type !== '有限次卡') {
            var rechargeReason = getCardOperationBlockReason(card.id, 'recharge');
            if (rechargeReason) {
                html += '            <span class="disabled-btn-wrap" data-disabled-reason="' + escapeHtmlAttr(rechargeReason) + '" onclick="showDisabledReason(this)"><button class="benefit-card-btn" disabled>充卡</button></span>';
            } else {
                html += '            <button class="benefit-card-btn" onclick="startRechargeFromBenefitModal(\'' + escapeJsStringForSingleQuote(card.id) + '\', \'' + escapeJsStringForSingleQuote(card.type) + '\', \'' + escapeJsStringForSingleQuote(card.name) + '\')">充卡</button>';
            }
        }
        var upgradeReason = getCardOperationBlockReason(card.id, 'upgrade');
        if (upgradeReason) {
            html += '            <span class="disabled-btn-wrap" data-disabled-reason="' + escapeHtmlAttr(upgradeReason) + '" onclick="showDisabledReason(this)"><button class="benefit-card-btn" disabled>升卡</button></span>';
        } else {
            html += '            <button class="benefit-card-btn" onclick="startUpgradeFromBenefitModal(\'' + escapeJsStringForSingleQuote(card.id) + '\', \'' + escapeJsStringForSingleQuote(card.type) + '\', \'' + escapeJsStringForSingleQuote(card.name) + '\')">升卡</button>';
        }
        html += '        </div>';
        html += '    </div>';

        // 金额卡显示详情行
        if (card.type === '金额卡' && card.balance) {
            html += '    <div class="benefit-card-detail-row">';
            html += '        <div class="benefit-card-detail-item">';
            html += '            <span class="benefit-card-detail-label">卡片余额</span>';
            html += '            <span class="benefit-card-detail-value">' + card.balance + '</span>';
            html += '        </div>';
            html += '        <div class="benefit-card-detail-divider"></div>';
            html += '        <div class="benefit-card-detail-item">';
            html += '            <span class="benefit-card-detail-label">赠金</span>';
            html += '            <span class="benefit-card-detail-value">' + card.giftBalance + '</span>';
            html += '        </div>';
            html += '        <div class="benefit-card-detail-divider"></div>';
            html += '        <div class="benefit-card-detail-item">';
            html += '            <span class="benefit-card-detail-label">' + card.discount + '</span>';
            html += '        </div>';
            html += '    </div>';
        } else if (card.validDate) {
            html += '    <div class="benefit-card-info">卡项有效期: ' + card.validDate + '</div>';
        }

        // 权益列表
        html += '    <div class="benefit-card-section">';
        filteredBenefits.forEach(function (benefit) {
            var progress = benefit.total > 0 ? ((benefit.total - benefit.used) / benefit.total * 100) : 0;
            var remaining = benefit.total - benefit.used;
            var isExhausted = remaining <= 0;
            var useOnclick = 'useBenefit(\'' + escapeJsStringForSingleQuote(benefit.id) + '\',\'' + escapeJsStringForSingleQuote(benefit.name) + '\',' + remaining + ',\'' + escapeJsStringForSingleQuote(card.id) + '\',\'' + escapeJsStringForSingleQuote(card.name) + '\')';
            var useDisabledReason = isExhausted ? '该权益已用完' : getCardOperationBlockReason(card.id, 'use');

            html += '        <div class="benefit-service-item">';
            html += '            <div class="benefit-item-left">';
            html += '                <div class="benefit-item-header">';
            if (benefit.isGift) {
                html += '                    <span class="benefit-item-gift">赠</span>';
            }
            html += '                    <span class="benefit-item-name">' + benefit.name + '</span>';
            html += '                </div>';
            html += '            </div>';
            html += '            <div class="benefit-item-center">';
            html += '                <div class="benefit-progress-bar">';
            html += '                    <div class="benefit-progress-fill" style="width:' + progress + '%"></div>';
            html += '                </div>';
            html += '                <span class="benefit-progress-text">剩余 ' + remaining + ' / 共 ' + benefit.total + '</span>';
            html += '            </div>';
            html += '            <div class="benefit-item-right">';
            html += '                <div class="benefit-item-actions">';
            if (useDisabledReason) {
                html += '                    <span class="disabled-btn-wrap" data-disabled-reason="' + escapeHtmlAttr(useDisabledReason) + '" onclick="showDisabledReason(this)"><button class="benefit-btn-use" disabled>使用</button></span>';
            } else {
                html += '                    <button class="benefit-btn-use" onclick="' + useOnclick + '">使用</button>';
            }
            html += '                </div>';
            html += '            </div>';
            html += '        </div>';
        });
        html += '    </div>';
        html += '</div>';
    });

    // 如果没有匹配的卡项
    if (html === '') {
        html = '<div style="padding: 40px 20px; text-align: center; color: var(--neutral-400);">未找到匹配的权益</div>';
    }

    benefitCardsList.innerHTML = html;
}

// 渲染最近搜索记录
function renderBenefitRecentSearches() {
    if (!benefitRecentTags) return;

    if (benefitRecentSearches.length === 0) {
        benefitRecentTags.innerHTML = '<span style="color: var(--neutral-400); font-size: 11px;">暂无最近搜索</span>';
        return;
    }

    var html = '';
    benefitRecentSearches.forEach(function (keyword) {
        html += '<button class="benefit-recent-tag" onclick="searchFromBenefitRecent(\'' + keyword + '\')">' + keyword + '</button>';
    });
    benefitRecentTags.innerHTML = html;
}

// 从最近搜索点击搜索
function searchFromBenefitRecent(keyword) {
    if (benefitSearchInput) {
        benefitSearchInput.value = keyword;
    }
    renderBenefitCards(keyword);
    updateSearchClearButton();
}

// 更新清除按钮显示状态
function updateSearchClearButton() {
    if (benefitSearchClear && benefitSearchInput) {
        benefitSearchClear.style.display = benefitSearchInput.value ? 'flex' : 'none';
    }
}

// 添加到最近搜索
function addToBenefitRecentSearches(keyword) {
    if (!keyword || keyword.trim() === '') return;

    var trimmed = keyword.trim();
    // 移除已存在的相同记录
    benefitRecentSearches = benefitRecentSearches.filter(function (item) {
        return item !== trimmed;
    });
    // 添加到开头
    benefitRecentSearches.unshift(trimmed);
    // 最多保留8条
    if (benefitRecentSearches.length > 8) {
        benefitRecentSearches = benefitRecentSearches.slice(0, 8);
    }
    renderBenefitRecentSearches();
}

// 打开客户权益弹窗
function openBenefitModal() {
    if (!benefitModalOverlay) return;
    benefitModalUpgradeIntent = false;
    benefitModalRechargeIntent = false;

    // 重置搜索
    if (benefitSearchInput) {
        benefitSearchInput.value = '';
    }
    updateSearchClearButton();

    // 渲染列表和最近搜索
    renderBenefitCards();
    renderBenefitRecentSearches();

    // 显示弹窗
    benefitModalOverlay.classList.add('show');
}

function startUpgradeFromBenefitModal(cardId, cardType, cardName) {
    const reason = getCardOperationBlockReason(cardId, 'upgrade');
    if (reason) {
        showToast(reason);
        return;
    }
    benefitModalUpgradeIntent = true;
    var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
    renderBenefitCards(keyword);
    updateSearchClearButton();
    handleUpgradeCard(cardId, cardType, cardName);
}

function startRechargeFromBenefitModal(cardId, cardType, cardName) {
    const reason = getCardOperationBlockReason(cardId, 'recharge');
    if (reason) {
        showToast(reason);
        return;
    }
    benefitModalRechargeIntent = true;
    showToast('充卡不能与其他商品一起下单，如需继续请先将充卡的卡片移除');
    var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
    renderBenefitCards(keyword);
    updateSearchClearButton();
    handleRechargeCard(cardId, cardType, cardName);
}

// 隐藏客户权益弹窗
function hideBenefitModal() {
    if (!benefitModalOverlay) return;
    benefitModalOverlay.classList.remove('show');
}

function onBenefitConsumeQtyInput(input) {
    const max = parseInt(input.max || '999', 10);
    const min = parseInt(input.min || '0', 10);
    const v = parseInt(input.value || '0', 10);
    if (!Number.isFinite(v)) {
        input.value = String(min);
        return;
    }
    input.value = String(Math.max(min, Math.min(max, v)));
}

function deleteBenefitConsumeRow(btn) {
    const tr = btn?.closest('tr');
    if (tr) tr.remove();
    updateSelectedItemsEmptyStates();
    updateOrderAndPaymentVisibility();
}

function addBenefitConsumeRow(payload) {
    const body = document.getElementById('benefit-consume-table-body');
    if (!body) return;

    const consumeMode = String(payload.consumeMode || 'use');
    const available = Number(payload.available || 0);
    if (!Number.isFinite(available) || available <= 0) {
        showToast('该权益已用完');
        return false;
    }

    const key = String(payload.cardId || '') + '__' + String(payload.benefitId || '');
    const existing = body.querySelector(`tr[data-benefit-key="${key}"]`);
    if (existing) {
        const input = existing.querySelector('input[data-field="useQty"]');
        const max = parseInt(input?.max || '999', 10);
        const current = parseInt(input?.value || '0', 10) || 0;
        if (input && current < max) {
            input.value = String(current + 1);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            updateSelectedItemsEmptyStates();
            updateOrderAndPaymentVisibility();
            return true;
        }
        showToast('已达到该权益可用上限');
        return false;
    }

    const tr = document.createElement('tr');
    tr.className = 'item-row';
    tr.setAttribute('data-benefit-key', key);
    tr.setAttribute('data-benefit-id', String(payload.benefitId || ''));
    tr.setAttribute('data-card-id', String(payload.cardId || ''));
    tr.setAttribute('data-available', String(available));
    tr.setAttribute('data-consume-mode', consumeMode);
    tr.setAttribute('data-benefit-type', String(payload.benefitType || ''));
    tr.innerHTML = `
        <td class="col-name"><span class="readonly-text">${payload.benefitName || ''}</span></td>
        <td class="col-card"><span class="readonly-text">${payload.cardName || ''}</span></td>
        <td><span class="readonly-text">${available}</span></td>
        <td class="col-qty">
            <div class="table-stepper">
                <div class="table-stepper-btn" onclick="tableStepDown(this)">
                    <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                </div>
                <input type="number" class="table-stepper-value" value="1" min="1" max="${available}" data-field="useQty" oninput="onBenefitConsumeQtyInput(this)">
                <div class="table-stepper-btn" onclick="tableStepUp(this)">
                    <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </div>
            </div>
        </td>
        <td class="col-beautician">
            <button type="button" class="row-beautician-btn" data-field="beautician" data-value="" onclick="openRowBeauticianModal(this)">选择美容师</button>
        </td>
        <td><button class="table-action-btn delete" onclick="deleteBenefitConsumeRow(this)">删除</button></td>
    `;

    body.appendChild(tr);
    updateSelectedItemsEmptyStates();
    updateOrderAndPaymentVisibility();
    return true;
}



function isCardInBenefitConsumeList(cardId) {
    const id = String(cardId || '');
    const body = document.getElementById('benefit-consume-table-body');
    if (!body) return false;
    const rows = body.querySelectorAll('tr.item-row');
    for (let i = 0; i < rows.length; i++) {
        if (String(rows[i].getAttribute('data-card-id') || '') === id) return true;
    }
    return false;
}

function isCardInUpgrade(cardId) {
    const id = String(cardId || '');
    if (document.getElementById('upgrade-module-' + id)) return true;
    return Array.isArray(upgradeCardList) && upgradeCardList.some(function (x) { return String(x.cardId) === id; });
}

function isCardInRecharge(cardId) {
    const id = String(cardId || '');
    if (document.getElementById('recharge-module-' + id)) return true;
    return Array.isArray(rechargeCardList) && rechargeCardList.some(function (x) { return String(x.cardId) === id; });
}

function escapeHtmlAttr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function showDisabledReason(el) {
    const reason = el?.getAttribute?.('data-disabled-reason') || '';
    if (reason) showToast(reason);
}

function getCardOperationBlockReason(cardId, action) {
    const id = String(cardId || '');
    const inUpgrade = isCardInUpgrade(id);
    const inRecharge = isCardInRecharge(id);
    const hasConsume = isCardInBenefitConsumeList(id);
    const globalRechargeLock = isBenefitModalRechargeLocked();
    const globalUpgradeLock = isBenefitModalUpgradeLocked();

    if (globalRechargeLock && action !== 'recharge') {
        return '充卡不能与其他商品一起下单，如需继续请先将充卡的卡片移除';
    }
    if (globalUpgradeLock && action !== 'upgrade') {
        return '升卡不能与其他商品一起下单，如需继续请先将升卡的卡片移除';
    }

    if (action === 'use') {
        if (inUpgrade) return '该卡项已选升卡，无法使用权益';
        if (inRecharge) return '该卡项已选充卡，无法使用权益';
        return '';
    }
    if (action === 'upgrade') {
        if (inRecharge) return '该卡项已选充卡，无法升卡';
        if (hasConsume) return '该卡项已产生权益使用记录，无法升卡';
        if (inUpgrade) return '该卡项已在升卡列表';
        return '';
    }
    if (action === 'recharge') {
        if (inUpgrade) return '该卡项已选升卡，无法充卡';
        if (hasConsume) return '该卡项已产生权益使用记录，无法充卡';
        if (inRecharge) return '该卡项已在充卡列表';
        return '';
    }
    return '';
}

const upgradeNewCardCatalog = [
    {
        id: 'new-limited-001',
        type: '有限次卡',
        name: '白金护理次卡',
        validDate: '自购买起1年有效',
        price: 1999,
        benefits: [
            { id: 'nb-001', name: '基础面部护理', total: 10, isGift: false },
            { id: 'nb-002', name: '焕亮面膜', total: 2, isGift: true }
        ]
    },
    {
        id: 'new-limited-002',
        type: '有限次卡',
        name: '面部抗衰次卡',
        validDate: '自首次消费起1年有效',
        price: 2999,
        benefits: [
            { id: 'nb-003', name: '抗衰紧致护理', total: 12, isGift: false },
            { id: 'nb-004', name: '肩颈放松护理', total: 4, isGift: true }
        ]
    },
    {
        id: 'new-unlimited-001',
        type: '通卡',
        name: '钻石通卡',
        validDate: '永久有效',
        price: 5999,
        benefits: [
            { id: 'nb-005', name: '全店项目7折', total: 1, isGift: false },
            { id: 'nb-006', name: '居家产品8折', total: 1, isGift: false }
        ]
    },
    {
        id: 'new-unlimited-002',
        type: '通卡',
        name: '黑金通卡',
        validDate: '自购买起2年有效',
        price: 8999,
        benefits: [
            { id: 'nb-007', name: '全店项目6折', total: 1, isGift: false },
            { id: 'nb-008', name: '次卡85折', total: 1, isGift: false }
        ]
    },
    {
        id: 'new-amount-001',
        type: '金额卡',
        name: '储值尊享卡',
        validDate: '自购买起2年有效',
        price: 3000,
        rechargeAmount: 3000,
        giftAmount: 200,
        benefits: [
            { id: 'nb-009', name: '深层清洁护理', total: 1, isGift: true },
            { id: 'nb-010', name: '卸妆湿巾', total: 2, isGift: true }
        ]
    },
    {
        id: 'new-amount-002',
        type: '金额卡',
        name: '储值钻石卡',
        validDate: '自购买起3年有效',
        price: 5000,
        rechargeAmount: 5000,
        giftAmount: 500,
        benefits: [
            { id: 'nb-011', name: '肩颈放松护理', total: 2, isGift: true }
        ]
    }
];

let upgradeNewCardRecentSearches = JSON.parse(localStorage.getItem('upgradeNewCardRecentSearches') || '[]');
let upgradeNewCardCategory = 'limited';
let upgradeNewCardTargetOldCardId = '';
let selectedUpgradeNewCardId = '';
let upgradeNewCardCommittedKeyword = '';

const upgradeNewCardModalOverlay = document.getElementById('upgradeNewCardModalOverlay');
const upgradeNewCardModalClose = document.getElementById('upgradeNewCardModalClose');
const upgradeNewCardCancel = document.getElementById('upgradeNewCardCancel');
const upgradeNewCardConfirm = document.getElementById('upgradeNewCardConfirm');
const upgradeNewCardSearchInput = document.getElementById('upgradeNewCardSearchInput');
const upgradeNewCardRecentList = document.getElementById('upgradeNewCardRecentList');
const upgradeNewCardCategoryList = document.getElementById('upgradeNewCardCategoryList');
const upgradeNewCardTableHead = document.getElementById('upgradeNewCardTableHead');
const upgradeNewCardTableBody = document.getElementById('upgradeNewCardTableBody');

const upgradeNewCardBenefitModalOverlay = document.getElementById('upgradeNewCardBenefitModalOverlay');
const upgradeNewCardBenefitModalClose = document.getElementById('upgradeNewCardBenefitModalClose');
const upgradeNewCardBenefitModalOk = document.getElementById('upgradeNewCardBenefitModalOk');
const upgradeNewCardBenefitModalTitle = document.getElementById('upgradeNewCardBenefitModalTitle');
const upgradeNewCardBenefitModalBody = document.getElementById('upgradeNewCardBenefitModalBody');

function getUpgradeNewCardTypeByCategory(category) {
    if (category === 'unlimited') return '通卡';
    if (category === 'amount') return '金额卡';
    return '有限次卡';
}

function getUpgradeNewCardById(id) {
    return upgradeNewCardCatalog.find(c => String(c.id) === String(id)) || null;
}

function getUpgradeNewCardsForCategory(category, keyword) {
    const type = getUpgradeNewCardTypeByCategory(category);
    const k = String(keyword || '').trim();
    return upgradeNewCardCatalog.filter(c => {
        if (c.type !== type) return false;
        if (!k) return true;
        return String(c.name || '').includes(k);
    });
}

function renderUpgradeNewCardRecentSearches() {
    if (!upgradeNewCardRecentList) return;
    const list = Array.isArray(upgradeNewCardRecentSearches) ? upgradeNewCardRecentSearches.slice(0, 8) : [];
    if (list.length === 0) {
        upgradeNewCardRecentList.innerHTML = '<span style="color:var(--neutral-400);font-size:12px;">暂无</span>';
        return;
    }
    upgradeNewCardRecentList.innerHTML = list.map(k => {
        const safe = String(k || '');
        const enc = encodeURIComponent(safe);
        return `<span class="upgrade-newcard-recent-item" data-k="${enc}">${safe}</span>`;
    }).join('');
}

function pushUpgradeNewCardRecent(keyword) {
    const k = String(keyword || '').trim();
    if (!k) return;
    upgradeNewCardRecentSearches = Array.isArray(upgradeNewCardRecentSearches) ? upgradeNewCardRecentSearches : [];
    upgradeNewCardRecentSearches = upgradeNewCardRecentSearches.filter(x => String(x) !== k);
    upgradeNewCardRecentSearches.unshift(k);
    upgradeNewCardRecentSearches = upgradeNewCardRecentSearches.slice(0, 8);
    localStorage.setItem('upgradeNewCardRecentSearches', JSON.stringify(upgradeNewCardRecentSearches));
    renderUpgradeNewCardRecentSearches();
}

function setUpgradeNewCardCategory(category) {
    upgradeNewCardCategory = category || 'limited';
    if (upgradeNewCardCategoryList) {
        Array.from(upgradeNewCardCategoryList.querySelectorAll('.upgrade-newcard-category')).forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-category') === upgradeNewCardCategory);
        });
    }
    renderUpgradeNewCardTable();
}

function renderUpgradeNewCardTable() {
    if (!upgradeNewCardTableHead || !upgradeNewCardTableBody) return;
    const keyword = String(upgradeNewCardSearchInput?.value || '').trim();
    const list = getUpgradeNewCardsForCategory(upgradeNewCardCategory, keyword);
    const isAmount = upgradeNewCardCategory === 'amount';

    upgradeNewCardTableHead.innerHTML = isAmount
        ? `<tr>
                <th style="width:22%;">卡项名称</th>
                <th style="width:18%;">有效期</th>
                <th style="width:14%;">售卡价格</th>
                <th style="width:14%;">充值金额</th>
                <th style="width:14%;">赠送金额</th>
                <th style="width:18%;">操作</th>
           </tr>`
        : `<tr>
                <th style="width:34%;">卡项名称</th>
                <th style="width:26%;">有效期</th>
                <th style="width:18%;">售卡价格</th>
                <th style="width:22%;">操作</th>
           </tr>`;

    if (list.length === 0) {
        upgradeNewCardTableBody.innerHTML = `<tr><td colspan="${isAmount ? 6 : 4}" style="color:var(--neutral-400);text-align:center;padding:24px 10px;">暂无匹配的卡项</td></tr>`;
        return;
    }

    upgradeNewCardTableBody.innerHTML = list.map(card => {
        const selected = String(card.id) === String(selectedUpgradeNewCardId);
        if (isAmount) {
            return `<tr class="${selected ? 'selected' : ''}" data-id="${card.id}">
                        <td style="width:22%;">${card.name}</td>
                        <td style="width:18%;">${card.validDate || '-'}</td>
                        <td style="width:14%;">¥${Number(card.price || 0).toFixed(2)}</td>
                        <td style="width:14%;">¥${Number(card.rechargeAmount || 0).toFixed(2)}</td>
                        <td style="width:14%;">¥${Number(card.giftAmount || 0).toFixed(2)}</td>
                        <td style="width:18%;"><button type="button" class="upgrade-newcard-action-btn" data-action="benefits" data-id="${card.id}">查看权益</button></td>
                    </tr>`;
        }
        return `<tr class="${selected ? 'selected' : ''}" data-id="${card.id}">
                    <td style="width:34%;">${card.name}</td>
                    <td style="width:26%;">${card.validDate || '-'}</td>
                    <td style="width:18%;">¥${Number(card.price || 0).toFixed(2)}</td>
                    <td style="width:22%;"><button type="button" class="upgrade-newcard-action-btn" data-action="benefits" data-id="${card.id}">查看权益</button></td>
                </tr>`;
    }).join('');
}

function closeUpgradeNewCardModal() {
    if (!selectedUpgradeNewCardId) {
        showToast('请选择一张新卡');
        return;
    }
    upgradeNewCardModalOverlay?.classList.remove('show');
}

let selectedUpgradeNewCardBenefitCards = [];
let upgradeNewCardModalMode = 'upgrade'; // 'upgrade' | 'benefit'

function openUpgradeNewCardModal(oldCardId) {
    upgradeNewCardTargetOldCardId = String(oldCardId || '');
    upgradeNewCardCommittedKeyword = '';
    upgradeNewCardModalMode = 'upgrade';
    const existing = Array.isArray(upgradeCardList) ? upgradeCardList.find(x => String(x.cardId) === upgradeNewCardTargetOldCardId) : null;
    selectedUpgradeNewCardId = existing?.newCardId ? String(existing.newCardId) : '';

    if (upgradeNewCardSearchInput) upgradeNewCardSearchInput.value = '';
    renderUpgradeNewCardRecentSearches();
    setUpgradeNewCardCategory(upgradeNewCardCategory || 'limited');
    toggleUpgradeNewCardSelectedSection(false);
    toggleUpgradeNewCardModalFooter(true);
    upgradeNewCardModalOverlay?.classList.add('show');
    setTimeout(() => upgradeNewCardSearchInput?.focus(), 50);
}

function openUpgradeNewCardModalForBenefit() {
    selectedUpgradeNewCardBenefitCards = [];
    upgradeNewCardCommittedKeyword = '';
    upgradeNewCardModalMode = 'benefit';
    if (upgradeNewCardSearchInput) upgradeNewCardSearchInput.value = '';
    renderUpgradeNewCardRecentSearches();
    setUpgradeNewCardCategory('limited');
    renderUpgradeNewCardSelectedList();
    toggleUpgradeNewCardSelectedSection(true);
    toggleUpgradeNewCardModalFooter(false);
    upgradeNewCardModalOverlay?.classList.add('show');
    setTimeout(() => upgradeNewCardSearchInput?.focus(), 50);
}

function toggleUpgradeNewCardSelectedSection(show) {
    const section = document.querySelector('#upgradeNewCardModalOverlay .add-service-selected-section');
    if (section) {
        section.style.display = show ? 'block' : 'none';
    }
}

function toggleUpgradeNewCardModalFooter(show) {
    const footer = document.querySelector('#upgradeNewCardModalOverlay .upgrade-newcard-modal-footer');
    if (footer) {
        footer.style.display = show ? 'flex' : 'none';
    }
}

function closeUpgradeNewCardModalForBenefit() {
    upgradeNewCardModalOverlay?.classList.remove('show');
}

function renderUpgradeNewCardSelectedList() {
    const listEl = document.getElementById('upgradeNewCardSelectedList');
    if (!listEl) return;
    if (selectedUpgradeNewCardBenefitCards.length === 0) {
        listEl.innerHTML = '<div class="add-service-empty-hint">点击卡项名称添加卡项</div>';
        return;
    }
    listEl.innerHTML = selectedUpgradeNewCardBenefitCards.map((card, idx) => {
        return `
            <div class="add-service-selected-item">
                <div class="add-service-selected-info">
                    <span class="add-service-selected-name">${card.name}</span>
                    <span class="add-service-selected-extra">¥${Number(card.price || 0).toFixed(2)}</span>
                </div>
                <span class="remove-btn" onclick="removeUpgradeNewCardFromBenefitList(${idx})">×</span>
            </div>
        `;
    }).join('');
}

function addUpgradeNewCardToBenefitList(card) {
    const existing = selectedUpgradeNewCardBenefitCards.find(c => String(c.id) === String(card.id));
    if (existing) {
        showToast('该卡项已选择');
        return;
    }
    selectedUpgradeNewCardBenefitCards.push(card);
    renderUpgradeNewCardSelectedList();
}

function removeUpgradeNewCardFromBenefitList(index) {
    selectedUpgradeNewCardBenefitCards.splice(index, 1);
    renderUpgradeNewCardSelectedList();
}

function clearUpgradeNewCardBenefitList() {
    selectedUpgradeNewCardBenefitCards = [];
    renderUpgradeNewCardSelectedList();
}

function confirmUpgradeNewCardBenefitSelection() {
    if (selectedUpgradeNewCardBenefitCards.length === 0) {
        showToast('请选择卡项');
        return;
    }
    addSelectedItemsToCustomCourse('card', selectedUpgradeNewCardBenefitCards, customCourseBenefitTargetMode);
    clearUpgradeNewCardBenefitList();
    closeUpgradeNewCardModalForBenefit();
    customCourseBenefitModalType = null;
    customCourseBenefitTargetMode = 'buy';
    showToast(`已选择 ${selectedUpgradeNewCardBenefitCards.length} 个卡项`);
}

function applyUpgradeNewCardSelection() {
    if (!upgradeNewCardTargetOldCardId) return;
    const card = getUpgradeNewCardById(selectedUpgradeNewCardId);
    if (!card) {
        showToast('请选择一张新卡');
        return;
    }
    if (upgradeNewCardCommittedKeyword) pushUpgradeNewCardRecent(upgradeNewCardCommittedKeyword);
    applyUpgradeNewCardToModule(upgradeNewCardTargetOldCardId, card);
    upgradeNewCardModalOverlay?.classList.remove('show');
}

function parseMoneyToNumber(text) {
    const v = String(text || '').replace(/[^\d.]/g, '');
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
}

function calcUpgradeOldDeduction(oldCardId, newCardPrice) {
    const oldCard = (mockBenefitData?.cards || []).find(c => String(c.id) === String(oldCardId));
    const price = Number(newCardPrice || 0);
    if (!oldCard || price <= 0) return 0;
    if (oldCard.type === '金额卡') {
        const bal = parseMoneyToNumber(oldCard.balance);
        const gift = parseMoneyToNumber(oldCard.giftBalance);
        return clampNumber((bal * 0.2) + (gift * 0.1), 0, price);
    }
    return clampNumber(price * 0.3, 0, price);
}

function getUpgradeState(oldCardId) {
    if (!Array.isArray(upgradeCardList)) return null;
    return upgradeCardList.find(x => String(x.cardId) === String(oldCardId)) || null;
}

function applyUpgradeNewCardToModule(oldCardId, newCard) {
    const state = getUpgradeState(oldCardId);
    if (!state) return;
    state.newCard = JSON.parse(JSON.stringify(newCard));
    state.newCardId = String(newCard.id);
    state.newCardCustomized = false;
    const newPrice = Number(newCard.price || 0);
    const oldDeduction = Number(calcUpgradeOldDeduction(oldCardId, newPrice).toFixed(2));
    const gap = Number(Math.max(0, newPrice - oldDeduction).toFixed(2));
    state.oldDeduction = oldDeduction;
    state.gapAmount = gap;
    state.discountPercent = 100;
    state.finalPrice = gap;

    renderUpgradeNewCardPanel(oldCardId);
    renderUpgradeFeePanel(oldCardId);
    updateOrderSummary();
}

function renderUpgradeNewCardPanel(oldCardId) {
    const panel = document.getElementById('upgrade-newcard-panel-' + oldCardId);
    const state = getUpgradeState(oldCardId);
    if (!panel || !state) return;
    if (!state.newCard) {
        panel.innerHTML =
            '<div class="upgrade-newcard-hotzone" onclick="openUpgradeNewCardModal(\'' + oldCardId + '\')">' +
            '   <div class="upgrade-newcard-plus">+</div>' +
            '   <span class="upgrade-newcard-label">添加新卡</span>' +
            '</div>';
        return;
    }

    const c = state.newCard;
    const isAmount = c.type === '金额卡';
    const priceText = `¥${Number(c.price || 0).toFixed(2)}`;
    const validText = String(c.validDate || '').trim() || '-';
    const meta = isAmount
        ? `有效期：${validText}<br>售卡价格：${priceText}<br>充值金额：¥${Number(c.rechargeAmount || 0).toFixed(2)}<br>赠送金额：¥${Number(c.giftAmount || 0).toFixed(2)}`
        : `有效期：${validText}<br>售卡价格：${priceText}`;
    const customizeTag = (isAmount && state.newCardCustomized) ? '<span class="upgrade-custom-tag">定制</span>' : '';
    const modifyBtn = isAmount ? ('<button type="button" class="upgrade-mini-btn primary" onclick="openUpgradeEditAmountModal(\'' + oldCardId + '\')">修改卡金</button>') : '';

    panel.innerHTML =
        '<button type="button" class="upgrade-mini-btn upgrade-newcard-benefit-btn" onclick="openUpgradeNewCardBenefitModal(\'' + String(c.id) + '\')">查看卡片权益</button>' +
        '<div class="upgrade-newcard-selected">' +
        '   <div>' +
        '       <div class="upgrade-newcard-selected-name">' + customizeTag + '<span class="upgrade-newcard-selected-name-text">' + (c.name || '') + '</span></div>' +
        '       <div class="upgrade-newcard-selected-meta">' + meta + '</div>' +
        '   </div>' +
        '   <div class="upgrade-newcard-selected-actions">' +
        '       <button type="button" class="upgrade-mini-btn primary" onclick="openUpgradeNewCardModal(\'' + oldCardId + '\')">更换</button>' +
        '       ' + modifyBtn +
        '   </div>' +
        '</div>';
}

let upgradeEditAmountTargetOldCardId = '';
const upgradeEditAmountModalOverlay = document.getElementById('upgradeEditAmountModalOverlay');
const upgradeEditAmountModalClose = document.getElementById('upgradeEditAmountModalClose');
const upgradeEditAmountCancel = document.getElementById('upgradeEditAmountCancel');
const upgradeEditAmountConfirm = document.getElementById('upgradeEditAmountConfirm');
const upgradeEditSalePriceInput = document.getElementById('upgradeEditSalePriceInput');
const upgradeEditRechargeAmountInput = document.getElementById('upgradeEditRechargeAmountInput');
const upgradeEditGiftAmountInput = document.getElementById('upgradeEditGiftAmountInput');

function resetUpgradeEditAmountForm() {
    if (upgradeEditSalePriceInput) upgradeEditSalePriceInput.value = '';
    if (upgradeEditRechargeAmountInput) upgradeEditRechargeAmountInput.value = '';
    if (upgradeEditGiftAmountInput) upgradeEditGiftAmountInput.value = '';
}

function closeUpgradeEditAmountModal() {
    upgradeEditAmountModalOverlay?.classList.remove('show');
    upgradeEditAmountTargetOldCardId = '';
    resetUpgradeEditAmountForm();
}

function openUpgradeEditAmountModal(oldCardId) {
    const id = String(oldCardId || '');
    const state = getUpgradeState(id);
    if (!state || !state.newCard) return;
    if (String(state.newCard.type || '') !== '金额卡') return;
    upgradeEditAmountTargetOldCardId = id;
    if (upgradeEditSalePriceInput) upgradeEditSalePriceInput.value = Number(state.newCard.price || 0).toFixed(2);
    if (upgradeEditRechargeAmountInput) upgradeEditRechargeAmountInput.value = Number(state.newCard.rechargeAmount || 0).toFixed(2);
    if (upgradeEditGiftAmountInput) upgradeEditGiftAmountInput.value = Number(state.newCard.giftAmount || 0).toFixed(2);
    upgradeEditAmountModalOverlay?.classList.add('show');
}

function parseRequiredMoneyInput(inputEl) {
    const raw = String((inputEl && 'value' in inputEl) ? inputEl.value : '').trim();
    const sanitized = sanitizePriceString(raw, 2);
    if (!sanitized) return null;
    const n = parseFloat(sanitized);
    if (!Number.isFinite(n)) return null;
    return roundMoney2(n);
}

function validateUpgradeEditAmounts(price, recharge, gift) {
    const MAX = 9999999.99;
    if (price === null) return { ok: false, msg: '请输入售卡金额' };
    if (recharge === null) return { ok: false, msg: '请输入充值金额' };
    if (gift === null) return { ok: false, msg: '请输入赠送金额' };
    if (price < 0.01) return { ok: false, msg: '售卡金额需大于 0' };
    if (recharge < 0.01) return { ok: false, msg: '充值金额需大于 0' };
    if (gift < 0) return { ok: false, msg: '赠送金额不可小于 0' };
    if (price > MAX || recharge > MAX || gift > MAX) return { ok: false, msg: '金额不可超过 9999999.99' };
    return { ok: true };
}

function applyUpgradeEditedAmounts() {
    const oldCardId = String(upgradeEditAmountTargetOldCardId || '');
    const state = getUpgradeState(oldCardId);
    if (!state || !state.newCard) return;
    if (String(state.newCard.type || '') !== '金额卡') return;

    const price = parseRequiredMoneyInput(upgradeEditSalePriceInput);
    const recharge = parseRequiredMoneyInput(upgradeEditRechargeAmountInput);
    const gift = parseRequiredMoneyInput(upgradeEditGiftAmountInput);
    const v = validateUpgradeEditAmounts(price, recharge, gift);
    if (!v.ok) {
        showAlertModal(v.msg);
        return;
    }

    state.newCard.price = price;
    state.newCard.rechargeAmount = recharge;
    state.newCard.giftAmount = gift;
    state.newCardCustomized = true;

    const newPrice = Number(price || 0);
    const oldDeduction = Number(calcUpgradeOldDeduction(oldCardId, newPrice).toFixed(2));
    const gap = Number(Math.max(0, newPrice - oldDeduction).toFixed(2));
    state.oldDeduction = oldDeduction;
    state.gapAmount = gap;

    if (gap <= 0) {
        state.discountPercent = 100;
        state.finalPrice = 0;
    } else {
        const discountPercent = clampNumber(parseFloat(state.discountPercent || 100) || 100, 0.01, 100);
        const finalPrice = Number((gap * (discountPercent / 100)).toFixed(2));
        state.discountPercent = Number(discountPercent.toFixed(2));
        state.finalPrice = clampNumber(finalPrice, 0, gap);
    }

    renderUpgradeNewCardPanel(oldCardId);
    renderUpgradeFeePanel(oldCardId);
    updateOrderSummary();
    closeUpgradeEditAmountModal();
    showToast('卡金已更新');
}

function renderUpgradeFeePanel(oldCardId) {
    const box = document.getElementById('upgrade-fee-section-' + oldCardId);
    const state = getUpgradeState(oldCardId);
    if (!box || !state) return;
    if (!state.newCard) {
        box.innerHTML = '<div style="color:var(--neutral-400);font-size:13px;">请选择新卡后自动计算升卡费用</div>';
        return;
    }

    const newPrice = Number(state.newCard.price || 0);
    const oldDeduction = Number(state.oldDeduction || 0);
    const gap = Number(state.gapAmount || 0);
    const discountPercent = clampNumber(parseFloat(state.discountPercent || 100) || 100, 0.01, 100);
    const finalPrice = clampNumber(parseFloat(state.finalPrice || 0) || 0, 0, gap);
    const discountAmount = Number(Math.max(0, gap - finalPrice).toFixed(2));

    state.discountPercent = Number(discountPercent.toFixed(2));
    state.finalPrice = Number(finalPrice.toFixed(2));

    const beauticianText = String(state.beautician || '').trim();
    const beauticianIds = Array.isArray(state.beauticianIds) ? state.beauticianIds : [];
    const beauticianBtnText = beauticianText ? beauticianText : '选择美容师';
    const beauticianItemName = state.newCard ? ('升卡 - ' + String(state.newCard.name || '').trim()) : '升卡';
    const remarkText = String(state.remark || '');

    box.innerHTML =
        '<div class="upgrade-fee-grid">' +
        '  <div class="upgrade-fee-table-wrap">' +
        '    <table class="upgrade-fee-table">' +
        '      <thead>' +
        '        <tr>' +
        '          <th>旧卡抵扣金额</th>' +
        '          <th>新卡零售价</th>' +
        '          <th>应补差价</th>' +
        '          <th>折扣</th>' +
        '          <th>折后价金额</th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' +
        '        <tr style="background: white;">' +
        '          <td><div class="upgrade-fee-cell-value">¥' + oldDeduction.toFixed(2) + '</div></td>' +
        '          <td><div class="upgrade-fee-cell-value">¥' + newPrice.toFixed(2) + '</div></td>' +
        '          <td><div class="upgrade-fee-cell-value upgrade-gap-highlight">¥' + gap.toFixed(2) + '</div></td>' +
        '          <td><input class="upgrade-fee-input" inputmode="decimal" type="text" value="' + discountPercent.toFixed(2) + '" oninput="onUpgradeDiscountPercentInput(this,\'' + oldCardId + '\')" onblur="onUpgradeDiscountPercentBlur(this,\'' + oldCardId + '\')"></td>' +
        '          <td><input class="upgrade-fee-input" inputmode="decimal" type="text" value="' + finalPrice.toFixed(2) + '" oninput="onUpgradeFinalPriceInput(this,\'' + oldCardId + '\')" onblur="onUpgradeFinalPriceBlur(this,\'' + oldCardId + '\')"></td>' +
        '        </tr>' +
        '        <tr class="upgrade-fee-meta-row" style="background: white;">' +
        '          <td colspan="5">' +
        '            <div class="upgrade-fee-meta">' +
        '              <div class="upgrade-fee-meta-item">' +
        '                <span class="upgrade-fee-meta-label">美容师</span>' +
        '                <button type="button" class="row-beautician-btn" data-item-name="' + beauticianItemName + '" data-ids="' + beauticianIds.join(',') + '" onclick="openRowBeauticianModal(this)">' + beauticianBtnText + '</button>' +
        '              </div>' +
        '              <div class="upgrade-fee-meta-item upgrade-fee-meta-remark">' +
        '                <span class="upgrade-fee-meta-label">备注</span>' +
        '                <input class="upgrade-remark-input" type="text" maxlength="200" placeholder="请输入备注（最多200字）" value="' + escapeHtmlAttr(remarkText) + '" oninput="onUpgradeRemarkInput(this,\'' + oldCardId + '\')">' +
        '              </div>' +
        '            </div>' +
        '          </td>' +
        '        </tr>' +
        '      </tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>';
}

function onUpgradeRemarkInput(input, oldCardId) {
    const state = getUpgradeState(oldCardId);
    if (!state || !input) return;
    const raw = String(input.value || '');
    const next = raw.length > 200 ? raw.slice(0, 200) : raw;
    if (next !== raw) input.value = next;
    state.remark = next;
}

function onUpgradeDiscountPercentInput(input, oldCardId) {
    const state = getUpgradeState(oldCardId);
    if (!state || !state.newCard) return;
    input.value = sanitizePriceString(input.value, 2);
    const discount = clampNumber(parseFloat(input.value || '0') || 0, 0.01, 100);
    const gap = Number(state.gapAmount || 0);
    const finalPrice = Number((gap * (discount / 100)).toFixed(2));
    state.discountPercent = Number(discount.toFixed(2));
    state.finalPrice = finalPrice;
    const moduleBox = document.getElementById('upgrade-fee-section-' + oldCardId);
    const finalInput = moduleBox?.querySelector('input[oninput*="onUpgradeFinalPriceInput"]');
    if (finalInput) finalInput.value = finalPrice.toFixed(2);
    updateOrderSummary();
}

function onUpgradeDiscountPercentBlur(input, oldCardId) {
    const v = clampNumber(parseFloat(input.value || '0') || 0, 0.01, 100);
    input.value = v.toFixed(2);
    onUpgradeDiscountPercentInput(input, oldCardId);
}

function onUpgradeFinalPriceInput(input, oldCardId) {
    const state = getUpgradeState(oldCardId);
    if (!state || !state.newCard) return;
    input.value = sanitizePriceString(input.value, 2);
    const gap = Number(state.gapAmount || 0);
    const finalPrice = clampNumber(parseFloat(input.value || '0') || 0, 0, gap);
    const discount = gap > 0 ? clampNumber((finalPrice / gap) * 100, 0.01, 100) : 100;
    state.finalPrice = Number(finalPrice.toFixed(2));
    state.discountPercent = Number(discount.toFixed(2));
    const moduleBox = document.getElementById('upgrade-fee-section-' + oldCardId);
    const discountInput = moduleBox?.querySelector('input[oninput*="onUpgradeDiscountPercentInput"]');
    if (discountInput) discountInput.value = discount.toFixed(2);
    updateOrderSummary();
}

function onUpgradeFinalPriceBlur(input, oldCardId) {
    const state = getUpgradeState(oldCardId);
    if (!state || !state.newCard) return;
    const gap = Number(state.gapAmount || 0);
    const v = clampNumber(parseFloat(input.value || '0') || 0, 0, gap);
    input.value = v.toFixed(2);
    onUpgradeFinalPriceInput(input, oldCardId);
}

function openUpgradeNewCardBenefitModal(cardId) {
    const card = getUpgradeNewCardById(cardId);
    if (!card) {
        showToast('未找到卡片权益');
        return;
    }
    if (upgradeNewCardBenefitModalTitle) upgradeNewCardBenefitModalTitle.textContent = card.name || '卡片权益';
    const isAmount = card.type === '金额卡';
    const typeBadgeClass = card.type === '有限次卡' ? 'badge-limited' : 'badge-unlimited';

    const header = `
        <div class="course-detail-header" style="padding-bottom:12px;margin-bottom:12px;">
            <div class="course-detail-image">
                <span class="course-card-badge ${typeBadgeClass}">${escapeHtmlAttr(card.type || '-')}</span>
            </div>
            <div class="course-detail-info">
                <div class="course-detail-name">${escapeHtmlAttr(card.name || '-')}</div>
                <div class="course-detail-validity">有效期：${escapeHtmlAttr(card.validDate || '-')}</div>
                <div class="course-detail-price-row">
                    <span class="course-detail-price-label">售卡价格</span>
                    <div class="course-detail-price-input-wrap">
                        <span class="course-detail-price-symbol">¥</span>
                        <span class="course-detail-price">${Number(card.price || 0).toFixed(2)}</span>
                    </div>
                </div>
                ${isAmount ? `
                    <div class="course-detail-price-row">
                        <span class="course-detail-price-label">充值金额</span>
                        <div class="course-detail-price-input-wrap">
                            <span class="course-detail-price-symbol">¥</span>
                            <span class="course-detail-price">${Number(card.rechargeAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="course-detail-price-row">
                        <span class="course-detail-price-label">赠送金额</span>
                        <div class="course-detail-price-input-wrap">
                            <span class="course-detail-price-symbol">¥</span>
                            <span class="course-detail-price">${Number(card.giftAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    const benefits = Array.isArray(card.benefits) ? card.benefits : [];
    const rows = benefits.map(b => {
        const total = Number(b.total || 0);
        const buyQty = b.isGift ? 0 : total;
        const giftQty = b.isGift ? total : 0;
        return `<tr>
            <td>${escapeHtmlAttr(b.name || '-')}</td>
            <td style="text-align:right;color:var(--neutral-600);">${buyQty}</td>
            <td style="text-align:right;color:var(--neutral-600);">${giftQty}</td>
        </tr>`;
    }).join('');

    const table = `
        <div class="course-detail-tables">
            <div class="course-table-section">
                <div class="course-table-title-row">
                    <div class="course-table-title">权益明细</div>
                </div>
                <table class="course-detail-table">
                    <thead>
                        <tr>
                            <th>权益名称</th>
                            <th style="text-align:right;width:120px;">购买数量</th>
                            <th style="text-align:right;width:120px;">赠送数量</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || `<tr><td colspan="3" style="padding:18px 10px;text-align:center;color:var(--neutral-400);">暂无权益</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    if (upgradeNewCardBenefitModalBody) upgradeNewCardBenefitModalBody.innerHTML = header + table;
    upgradeNewCardBenefitModalOverlay?.classList.add('show');
}

function closeUpgradeNewCardBenefitModal() {
    upgradeNewCardBenefitModalOverlay?.classList.remove('show');
}

upgradeNewCardCategoryList?.addEventListener('click', function (e) {
    const tab = e.target.closest('.upgrade-newcard-category');
    if (!tab) return;
    setUpgradeNewCardCategory(tab.getAttribute('data-category') || 'limited');
});

upgradeNewCardRecentList?.addEventListener('click', function (e) {
    const item = e.target.closest('.upgrade-newcard-recent-item');
    if (!item) return;
    let keyword = '';
    try { keyword = decodeURIComponent(item.getAttribute('data-k') || ''); } catch (err) { keyword = item.textContent || ''; }
    if (upgradeNewCardSearchInput) upgradeNewCardSearchInput.value = keyword;
    upgradeNewCardCommittedKeyword = keyword;
    renderUpgradeNewCardTable();
});

upgradeNewCardSearchInput?.addEventListener('input', function () {
    renderUpgradeNewCardTable();
});

upgradeNewCardSearchInput?.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const keyword = String(upgradeNewCardSearchInput.value || '').trim();
    upgradeNewCardCommittedKeyword = keyword;
    renderUpgradeNewCardTable();
});

upgradeNewCardTableBody?.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action="benefits"]');
    if (btn) {
        e.stopPropagation();
        const id = btn.getAttribute('data-id') || '';
        openUpgradeNewCardBenefitModal(id);
        return;
    }
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const id = tr.getAttribute('data-id') || '';
    if (upgradeNewCardModalMode === 'benefit') {
        const card = getUpgradeNewCardById(id);
        if (card) {
            addUpgradeNewCardToBenefitList(card);
        }
    } else {
        selectedUpgradeNewCardId = id;
        renderUpgradeNewCardTable();
    }
});

upgradeNewCardConfirm?.addEventListener('click', applyUpgradeNewCardSelection);
upgradeNewCardCancel?.addEventListener('click', function () {
    if (upgradeNewCardModalMode === 'benefit') {
        closeUpgradeNewCardModalForBenefit();
        customCourseBenefitModalType = null;
    } else {
        closeUpgradeNewCardModal();
    }
});
upgradeNewCardModalClose?.addEventListener('click', function () {
    if (upgradeNewCardModalMode === 'benefit') {
        closeUpgradeNewCardModalForBenefit();
        customCourseBenefitModalType = null;
    } else {
        closeUpgradeNewCardModal();
    }
});
upgradeNewCardModalOverlay?.addEventListener('click', function (e) {
    if (e.target !== this) return;
    if (upgradeNewCardModalMode === 'benefit') {
        closeUpgradeNewCardModalForBenefit();
        customCourseBenefitModalType = null;
    } else {
        closeUpgradeNewCardModal();
    }
});

document.getElementById('upgradeNewCardClearBtn')?.addEventListener('click', clearUpgradeNewCardBenefitList);
document.getElementById('upgradeNewCardConfirmBtn')?.addEventListener('click', confirmUpgradeNewCardBenefitSelection);



upgradeNewCardBenefitModalOk?.addEventListener('click', closeUpgradeNewCardBenefitModal);
upgradeNewCardBenefitModalClose?.addEventListener('click', closeUpgradeNewCardBenefitModal);
upgradeNewCardBenefitModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeUpgradeNewCardBenefitModal();
});

upgradeEditAmountCancel?.addEventListener('click', closeUpgradeEditAmountModal);
upgradeEditAmountModalClose?.addEventListener('click', closeUpgradeEditAmountModal);
upgradeEditAmountConfirm?.addEventListener('click', applyUpgradeEditedAmounts);
upgradeEditAmountModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeUpgradeEditAmountModal();
});

function assertCardOperationAllowed(cardId, action) {
    const reason = getCardOperationBlockReason(cardId, action);
    if (reason) {
        showToast(reason);
        return false;
    }
    return true;
}

// 使用权益
function useBenefit(benefitId, benefitName, remaining, cardId, cardName) {
    if (!assertCardOperationAllowed(cardId, 'use')) return;
    var card = null;
    for (var i = 0; i < mockBenefitData.cards.length; i++) {
        if (mockBenefitData.cards[i].id === cardId) {
            card = mockBenefitData.cards[i];
            break;
        }
    }
    const inferredBenefitType = normalizeItemType(card?.type) === '有限次卡' ? '单次护理' : '';
    var benefit = null;
    if (card && Array.isArray(card.benefits)) {
        for (var j = 0; j < card.benefits.length; j++) {
            if (card.benefits[j].id === benefitId) {
                benefit = card.benefits[j];
                break;
            }
        }
    }

    var total = benefit ? (parseInt(benefit.total || '0', 10) || 0) : 0;
    var used = benefit ? (parseInt(benefit.used || '0', 10) || 0) : 0;
    var remainingNow = Math.max(0, total - used);

    if (remainingNow <= 0) {
        showToast('该权益已用完');
        return;
    }

    const key = String(cardId || '') + '__' + String(benefitId || '');
    const body = document.getElementById('benefit-consume-table-body');
    const existing = body ? body.querySelector(`tr[data-benefit-key="${key}"]`) : null;
    if (existing) {
        const input = existing.querySelector('input[data-field="useQty"]');
        const max = parseInt(input?.max || '999', 10);
        const current = parseInt(input?.value || '0', 10) || 0;
        if (current >= max) {
            showToast('已达到该权益可用上限');
            return;
        }
    }

    if (benefit) {
        benefit.used = Math.min(total, used + 1);
    }

    const ok = addBenefitConsumeRow({
        benefitId: benefitId,
        benefitName: benefitName,
        available: remainingNow,
        cardId: cardId,
        cardName: cardName,
        benefitType: inferredBenefitType,
        consumeMode: 'use'
    });
    if (!ok) {
        if (benefit) benefit.used = used;
        return;
    }

    var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
    renderBenefitCards(keyword);
    updateSearchClearButton();

    showToast('已添加到消耗列表：' + benefitName);
}


function hasNonCardOpSelectedItems() {
    const selectedItemsArea = document.querySelector('.selected-items-area');
    if (!selectedItemsArea) return false;
    return selectedItemsArea.querySelectorAll(
        '#service-table-body tr.item-row, #product-table-body tr.item-row, #course-table-body tr.item-row, #benefit-consume-table-body tr.item-row, .selected-item-card, .promotion-card-section, .course-card-section'
    ).length > 0;
}

function clearSelectedItemsForCardOp() {
    const selectedItemsArea = document.querySelector('.selected-items-area');
    if (!selectedItemsArea) return;

    document.getElementById('service-table-body') && (document.getElementById('service-table-body').innerHTML = '');
    document.getElementById('product-table-body') && (document.getElementById('product-table-body').innerHTML = '');
    document.getElementById('course-table-body') && (document.getElementById('course-table-body').innerHTML = '');
    document.getElementById('benefit-consume-table-body') && (document.getElementById('benefit-consume-table-body').innerHTML = '');

    selectedItemsArea.querySelectorAll('.upgrade-card-module, .course-card-section, .selected-item-card, .promotion-card-section').forEach(el => el.remove());

    upgradeCardList = [];
    rechargeCardList = [];
    if (typeof selectedCourseCards !== 'undefined') selectedCourseCards = [];

    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
    normalizeAndRenderMoneyCards();
}

function guardAddEntryForCardOpConflict() {
    if (bypassCardOpGuardOnce) {
        bypassCardOpGuardOnce = false;
        return true;
    }
    const hasCardOp = isAnyUpgradeSelected() || isAnyRechargeSelected();
    if (!hasCardOp) return true;
    showToast('充卡或升卡业务不能与其他商品一起下单');
    return false;
}

function confirmCardOpThenRun(action) {
    const message = '升卡、充卡不能与其他商品一起下单，继续操作将清除当前已添加的所有商品，请确认是否继续？';
    if (!hasNonCardOpSelectedItems()) {
        action();
        return;
    }
    window.confirmCallback = function () {
        clearSelectedItemsForCardOp();
        action();
    };
    confirmModalOverlay.dataset.context = 'card-op';
    showConfirmModal('确认继续操作', message, window.confirmCallback);
}

// 升卡操作：关闭弹窗并在已选商品区添加升卡模块
function handleUpgradeCard(cardId, cardType, cardName) {
    if (!assertCardOperationAllowed(cardId, 'upgrade')) return;
    var cardData = null;
    for (var i = 0; i < mockBenefitData.cards.length; i++) {
        if (mockBenefitData.cards[i].id === cardId) {
            cardData = mockBenefitData.cards[i];
            break;
        }
    }
    if (!cardData) cardData = { id: cardId, type: cardType, name: cardName };

    confirmCardOpThenRun(function () {
        clearSelectedAmountCardsOnly();
        benefitModalUpgradeIntent = false;
        hideBenefitModal();
        renderUpgradeCardModule(cardData);
    });
}

function handleRechargeCard(cardId, cardType, cardName) {
    if (!assertCardOperationAllowed(cardId, 'recharge')) return;
    var cardData = null;
    for (var i = 0; i < mockBenefitData.cards.length; i++) {
        if (mockBenefitData.cards[i].id === cardId) {
            cardData = mockBenefitData.cards[i];
            break;
        }
    }
    if (!cardData) cardData = { id: cardId, type: cardType, name: cardName };
    confirmCardOpThenRun(function () {
        benefitModalRechargeIntent = false;
        hideBenefitModal();
        renderRechargeCardModule(cardData);
    });
}

function clearSelectedAmountCardsOnly() {
    const body = document.getElementById('amount-card-table-body');
    if (body) body.innerHTML = '';
    if (typeof selectedAmountCards !== 'undefined') selectedAmountCards = [];
    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
}

// 已存储的升卡数据（用于后续可能的扩展）
var upgradeCardList = [];
var rechargeCardList = [];
let bypassCardOpGuardOnce = false;
let rechargeGiftBenefitModalType = null;
let rechargeGiftTargetCardId = '';

function getRechargeItem(cardId) {
    const id = String(cardId || '');
    if (!Array.isArray(rechargeCardList)) rechargeCardList = [];
    return rechargeCardList.find(x => String(x.cardId) === id) || null;
}

function sanitizePositiveIntString(v) {
    return String(v || '').replace(/[^\d]/g, '');
}

function isInvalidEmptyValue(v) {
    if (v === null || v === undefined) return true;
    if (typeof v === 'string' && v.trim() === '') return true;
    return false;
}

function isRechargeGiftTableRowValid(tr, type) {
    if (!tr) return false;
    if (type === 'care') {
        const name = tr.getAttribute('data-name');
        const duration = tr.getAttribute('data-duration');
        const spec = tr.getAttribute('data-spec');
        return !(isInvalidEmptyValue(name) && isInvalidEmptyValue(duration) && isInvalidEmptyValue(spec));
    }
    if (type === 'home') {
        const name = tr.getAttribute('data-name');
        const spec = tr.getAttribute('data-spec');
        return !(isInvalidEmptyValue(name) && isInvalidEmptyValue(spec));
    }
    const name = tr.getAttribute('data-name');
    const cardType = tr.getAttribute('data-card-type');
    return !(isInvalidEmptyValue(name) && isInvalidEmptyValue(cardType));
}

function updateRechargeGiftTableHeadVisibility(cardId, type) {
    const id = String(cardId || '');
    const bodyIdMap = {
        care: 'rechargeGiftCareBody-',
        home: 'rechargeGiftHomeBody-',
        card: 'rechargeGiftCardBody-'
    };
    const tbody = document.getElementById(bodyIdMap[type] + id);
    const table = tbody?.closest?.('table');
    if (!table) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const hasValid = rows.some(tr => isRechargeGiftTableRowValid(tr, type));
    const shouldHide = rows.length === 0 || !hasValid;
    table.classList.toggle('table-head-hidden', shouldHide);
}

function updateRechargeGiftAllTableHeadVisibility(cardId) {
    updateRechargeGiftTableHeadVisibility(cardId, 'care');
    updateRechargeGiftTableHeadVisibility(cardId, 'home');
    updateRechargeGiftTableHeadVisibility(cardId, 'card');
}

function onRechargeAmountInput(input, cardId) {
    const item = getRechargeItem(cardId);
    if (!item || !input) return;
    input.value = sanitizePositiveIntString(input.value);
    item.rechargeAmount = parseInt(input.value || '0', 10) || 0;
    updateOrderSummary();
}

function onRechargeAmountBlur(input, cardId) {
    const item = getRechargeItem(cardId);
    if (!item || !input) return;
    input.value = sanitizePositiveIntString(input.value);
    const v = parseInt(input.value || '0', 10) || 0;
    input.value = String(v);
    item.rechargeAmount = v;
    updateOrderSummary();
}

function onRechargeGiftAmountInput(input, cardId) {
    const item = getRechargeItem(cardId);
    if (!item || !input) return;
    input.value = sanitizePositiveIntString(input.value);
    item.giftAmount = parseInt(input.value || '0', 10) || 0;
}

function onRechargeGiftAmountBlur(input, cardId) {
    const item = getRechargeItem(cardId);
    if (!item || !input) return;
    input.value = sanitizePositiveIntString(input.value);
    const v = parseInt(input.value || '0', 10) || 0;
    input.value = String(v);
    item.giftAmount = v;
}

function onRechargeRemarkInput(input, cardId) {
    const item = getRechargeItem(cardId);
    if (!item || !input) return;
    const raw = String(input.value || '');
    const next = raw.length > 200 ? raw.slice(0, 200) : raw;
    if (next !== raw) input.value = next;
    item.remark = next;
}

function applyRechargeQuickAmount(btn, cardId) {
    const item = getRechargeItem(cardId);
    if (!item) return;
    const v = parseInt(btn?.getAttribute?.('data-amt') || '0', 10) || 0;
    const input = document.getElementById('recharge-amount-input-' + cardId);
    if (input) {
        input.value = String(v);
        onRechargeAmountBlur(input, cardId);
    } else {
        item.rechargeAmount = v;
        updateOrderSummary();
    }
}



function openRechargeGiftBenefitModal(cardId, type) {
    rechargeGiftTargetCardId = String(cardId || '');
    rechargeGiftBenefitModalType = type;
    bypassCardOpGuardOnce = type === 'care' || type === 'home';
    openCustomCourseBenefitModal(type);
}

function resetRechargeGiftContext() {
    rechargeGiftBenefitModalType = null;
    rechargeGiftTargetCardId = '';
}

function addSelectedItemsToRechargeGift(type, items) {
    const item = getRechargeItem(rechargeGiftTargetCardId);
    if (!item) return;
    const benefits = item.giftBenefits || (item.giftBenefits = { care: [], home: [], card: [] });
    const list = Array.isArray(benefits[type]) ? benefits[type] : (benefits[type] = []);
    const existing = new Set(list.map(x => type === 'home' ? `${x.name}__${x.spec || ''}` : String(x.name || '')));
    let skipped = 0;
    let added = 0;

    items.forEach(it => {
        const name = String(it.name || '').trim();
        if (!name) return;
        const key = type === 'home' ? `${name}__${String(it.spec || '')}` : name;
        if (existing.has(key)) {
            skipped += 1;
            return;
        }
        existing.add(key);
        if (type === 'care') {
            list.push({
                name,
                spec: String(it.spec || ''),
                duration: String(it.duration || guessServiceDuration(it) || ''),
                price: Number(it.price || 0),
                giftQty: 1
            });
        } else if (type === 'home') {
            list.push({
                name,
                spec: String(it.spec || ''),
                price: Number(it.price || 0),
                giftQty: 1
            });
        } else {
            list.push({
                name,
                cardType: String(it.cardType || '有限次卡'),
                price: Number(it.price || 0),
                giftQty: 1
            });
        }
        added += 1;
    });

    if (skipped > 0) showToast(`已跳过重复项 ${skipped} 个`);
    else if (added > 0) showToast(`已添加 ${added} 条权益`);
    renderRechargeGiftTables(item.cardId);
}

function renderRechargeGiftTables(cardId) {
    const item = getRechargeItem(cardId);
    if (!item) return;
    const benefits = item.giftBenefits || (item.giftBenefits = { care: [], home: [], card: [] });

    const careBody = document.getElementById('rechargeGiftCareBody-' + cardId);
    const homeBody = document.getElementById('rechargeGiftHomeBody-' + cardId);
    const cardBody = document.getElementById('rechargeGiftCardBody-' + cardId);

    if (careBody) {
        careBody.innerHTML = (benefits.care || []).map(b => `
            <tr class="course-table-row" data-custom-type="care" data-name="${escapeHtmlAttr(b.name || '')}" data-spec="${escapeHtmlAttr(b.spec || '')}" data-duration="${escapeHtmlAttr(b.duration || '')}" data-price="${escapeHtmlAttr(String(Number(b.price || 0)))}">
                <td class="col-name">
                    <span class="readonly-text">${escapeHtmlAttr(b.name || '')}</span>
                    ${b.spec ? `<span class="sub-text">${escapeHtmlAttr(b.spec)}</span>` : ''}
                </td>
                <td class="col-duration"><span class="readonly-text">${escapeHtmlAttr(b.duration || '')}</span></td>
                <td class="col-price"><span class="readonly-text">¥${Number(b.price || 0).toFixed(2)}</span></td>
                <td class="col-qty">
                    <div class="table-stepper">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                            <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                        </div>
                        <input type="number" class="table-stepper-value" value="${parseInt(b.giftQty || 0, 10) || 0}" min="0" max="999" inputmode="numeric"
                               oninput="customCourseSanitizeQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" onblur="customCourseClampQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" data-field="gift">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </div>
                    </div>
                </td>
                <td class="col-action"><button class="table-action-btn delete" onclick="removeRechargeGiftRow(this,'${String(cardId)}')">删除</button></td>
            </tr>
        `).join('');
    }

    if (homeBody) {
        homeBody.innerHTML = (benefits.home || []).map(b => `
            <tr class="course-table-row" data-custom-type="home" data-name="${escapeHtmlAttr(b.name || '')}" data-spec="${escapeHtmlAttr(b.spec || '')}" data-price="${escapeHtmlAttr(String(Number(b.price || 0)))}">
                <td class="col-name"><span class="readonly-text">${escapeHtmlAttr(b.name || '')}</span></td>
                <td class="col-spec"><span class="readonly-text">${escapeHtmlAttr(b.spec || '')}</span></td>
                <td class="col-price"><span class="readonly-text">¥${Number(b.price || 0).toFixed(2)}</span></td>
                <td class="col-qty">
                    <div class="table-stepper">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                            <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                        </div>
                        <input type="number" class="table-stepper-value" value="${parseInt(b.giftQty || 0, 10) || 0}" min="0" max="999" inputmode="numeric"
                               oninput="customCourseSanitizeQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" onblur="customCourseClampQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" data-field="gift">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </div>
                    </div>
                </td>
                <td class="col-action"><button class="table-action-btn delete" onclick="removeRechargeGiftRow(this,'${String(cardId)}')">删除</button></td>
            </tr>
        `).join('');
    }

    if (cardBody) {
        cardBody.innerHTML = (benefits.card || []).map(b => `
            <tr class="course-table-row" data-custom-type="card" data-name="${escapeHtmlAttr(b.name || '')}" data-card-type="${escapeHtmlAttr(b.cardType || '有限次卡')}" data-price="${escapeHtmlAttr(String(Number(b.price || 0)))}">
                <td class="col-name"><span class="readonly-text">${escapeHtmlAttr(b.name || '')}</span></td>
                <td class="col-type"><span class="readonly-text">${escapeHtmlAttr(b.cardType || '有限次卡')}</span></td>
                <td class="col-price"><span class="readonly-text">¥${Number(b.price || 0).toFixed(2)}</span></td>
                <td class="col-qty">
                    <div class="table-stepper">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                            <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                        </div>
                        <input type="number" class="table-stepper-value" value="${parseInt(b.giftQty || 0, 10) || 0}" min="0" max="999" inputmode="numeric"
                               oninput="customCourseSanitizeQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" onblur="customCourseClampQtyInput(this);syncRechargeGiftFromDom('${String(cardId)}')" data-field="gift">
                        <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        </div>
                    </div>
                </td>
                <td class="col-action"><button class="table-action-btn delete" onclick="removeRechargeGiftRow(this,'${String(cardId)}')">删除</button></td>
            </tr>
        `).join('');
    }

    updateRechargeGiftAllTableHeadVisibility(cardId);
}

function syncRechargeGiftFromDom(cardId) {
    const item = getRechargeItem(cardId);
    if (!item) return;
    const benefits = item.giftBenefits || (item.giftBenefits = { care: [], home: [], card: [] });

    const careBody = document.getElementById('rechargeGiftCareBody-' + cardId);
    const homeBody = document.getElementById('rechargeGiftHomeBody-' + cardId);
    const cardBody = document.getElementById('rechargeGiftCardBody-' + cardId);

    if (careBody) {
        benefits.care = Array.from(careBody.querySelectorAll('tr')).map(tr => ({
            name: tr.dataset.name || (tr.querySelector('td.col-name .readonly-text')?.textContent || '').trim(),
            spec: tr.dataset.spec || (tr.querySelector('td.col-name .sub-text')?.textContent || '').trim(),
            duration: tr.dataset.duration || (tr.querySelector('td.col-duration')?.textContent || '').trim(),
            price: Number(tr.dataset.price || 0) || 0,
            giftQty: parseInt(tr.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0
        }));
    }
    if (homeBody) {
        benefits.home = Array.from(homeBody.querySelectorAll('tr')).map(tr => ({
            name: tr.dataset.name || (tr.querySelector('td.col-name')?.textContent || '').trim(),
            spec: tr.dataset.spec || (tr.querySelector('td.col-spec')?.textContent || '').trim(),
            price: Number(tr.dataset.price || 0) || 0,
            giftQty: parseInt(tr.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0
        }));
    }
    if (cardBody) {
        benefits.card = Array.from(cardBody.querySelectorAll('tr')).map(tr => ({
            name: tr.dataset.name || (tr.querySelector('td.col-name')?.textContent || '').trim(),
            cardType: tr.dataset.cardType || (tr.querySelector('td.col-type')?.textContent || '').trim(),
            price: Number(tr.dataset.price || 0) || 0,
            giftQty: parseInt(tr.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0
        }));
    }

    updateRechargeGiftAllTableHeadVisibility(cardId);
}

function removeRechargeGiftRow(btn, cardId) {
    const tr = btn?.closest('tr');
    if (tr) tr.remove();
    syncRechargeGiftFromDom(cardId);
    updateRechargeGiftAllTableHeadVisibility(cardId);
}

function ensureSelectedItemsSectionOrder() {
    const container = document.querySelector('.selected-items-area');
    if (!container) return;

    const emptyState = document.getElementById('main-empty-state');
    const orderedIds = ['benefitConsumeSection', 'serviceCategorySection', 'productCategorySection', 'courseCategorySection', 'amountCardCategorySection'];

    const fragment = document.createDocumentFragment();
    orderedIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentElement === container) fragment.appendChild(el);
    });

    container.appendChild(fragment);
    if (emptyState && emptyState.parentElement === container && container.firstElementChild !== emptyState) {
        container.insertBefore(emptyState, container.firstElementChild);
    }
}

function hasAnySelectedItemsContent() {
    const selectedItemsArea = document.querySelector('.selected-items-area');
    if (!selectedItemsArea) return false;
    return selectedItemsArea.querySelectorAll(
        '.upgrade-card-module, .course-card-section, .selected-item-card, .promotion-card-section, #service-table-body tr.item-row, #product-table-body tr.item-row, #amount-card-table-body tr.item-row, #course-table-body tr.item-row, #benefit-consume-table-body tr'
    ).length > 0;
}

// 更新订单信息和支付汇总的显示状态（有商品时显示，无商品时隐藏）
function updateOrderAndPaymentVisibility() {
    ensureSelectedItemsSectionOrder();
    var selectedItemsArea = document.querySelector('.selected-items-area');
    var orderFormPanel = document.getElementById('orderFormPanel');
    var paymentBar = document.getElementById('paymentBar');

    if (!selectedItemsArea || !orderFormPanel || !paymentBar) return;

    // 检查是否有任何已选商品（升卡、充卡、次卡、普通商品、产品等）
    var hasContent = hasAnySelectedItemsContent();

    if (hasContent) {
        orderFormPanel.classList.remove('hidden');
        paymentBar.classList.remove('hidden');
    } else {
        orderFormPanel.classList.add('hidden');
        paymentBar.classList.add('hidden');
    }
}

// 渲染升卡模块
function renderUpgradeCardModule(cardData) {
    var selectedItemsArea = document.querySelector('.selected-items-area');
    var emptyState = document.getElementById('main-empty-state');

    if (!selectedItemsArea) return;

    // 隐藏空状态
    if (emptyState) emptyState.style.display = 'none';

    // 构建卡片信息
    var typeText = cardData.type || '';
    var nameText = cardData.name || '';
    var validDate = cardData.validDate || '永久有效';

    var balanceHtml = '';
    if (cardData.type === '金额卡' && cardData.balance) {
        balanceHtml = '<div class="upgrade-card-info-row">' +
            '<span class="upgrade-info-label">剩余金额</span>' +
            '<span class="upgrade-info-value"><span class="upgrade-balance-highlight">' + cardData.balance + '</span> 元' +
            (cardData.giftBalance ? ' <span class="upgrade-balance-gift">(含赠金 ' + cardData.giftBalance.replace('¥', '') + ')</span>' : '') +
            '</span></div>';
    }

    // 创建DOM元素
    var moduleDiv = document.createElement('div');
    moduleDiv.className = 'upgrade-card-module';
    moduleDiv.id = 'upgrade-module-' + cardData.id;
    moduleDiv.setAttribute('data-module-type', 'upgrade');
    moduleDiv.setAttribute('data-old-card-id', cardData.id);

    moduleDiv.innerHTML =
        '<div class="upgrade-module-header">' +
        '    <span class="upgrade-module-title">升卡</span>' +
        '    <button class="upgrade-delete-btn" onclick="removeUpgradeModule(\'' + cardData.id + '\')">' +
        '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>' +
        '        删除' +
        '    </button>' +
        '</div>' +
        '<div class="upgrade-card-body">' +
        '    <div class="upgrade-current-card">' +
        '        <div class="upgrade-card-name-row">' +
        '            <span class="upgrade-card-type-tag">' +
        '                <svg class="upgrade-card-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' +
        '                ' + typeText +
        '            </span>' +
        '            <span class="upgrade-card-title-text">' + nameText + '</span>' +
        '        </div>' +
        '        <div class="upgrade-card-info-row">' +
        '            <span class="upgrade-info-label">使用期限</span>' +
        '            <span class="upgrade-info-value">' + validDate + '</span>' +
        '        </div>' +
        balanceHtml +
        '    </div>' +
        '' +
        '    <div class="upgrade-arrow-area">' +
        '        <span class="upgrade-arrow-text">升级为</span>' +
        '        <svg class="upgrade-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '    </div>' +
        '' +
        '    <div class="upgrade-newcard-panel" id="upgrade-newcard-panel-' + cardData.id + '">' +
        '        <div class="upgrade-newcard-hotzone" onclick="openUpgradeNewCardModal(\'' + cardData.id + '\')">' +
        '        <div class="upgrade-newcard-plus">+</div>' +
        '        <span class="upgrade-newcard-label">添加新卡</span>' +
        '        </div>' +
        '    </div>' +
        '</div>' +
        '<div class="upgrade-fee-section" id="upgrade-fee-section-' + cardData.id + '"></div>';

    selectedItemsArea.insertBefore(moduleDiv, emptyState);

    // 记录升卡数据
    upgradeCardList.push({
        cardId: cardData.id,
        cardType: cardData.type,
        cardName: cardData.name,
        timestamp: Date.now(),
        newCard: null,
        newCardId: '',
        oldDeduction: 0,
        gapAmount: 0,
        discountPercent: 100,
        finalPrice: 0,
        beauticianIds: [],
        beautician: '',
        remark: ''
    });

    showToast('已添加升卡：' + nameText);
    if (typeof renderUpgradeFeePanel === 'function') {
        renderUpgradeFeePanel(cardData.id);
    }
    updateOrderAndPaymentVisibility();
}

function renderRechargeCardModule(cardData) {
    var selectedItemsArea = document.querySelector('.selected-items-area');
    var emptyState = document.getElementById('main-empty-state');

    if (!selectedItemsArea) return;
    if (emptyState) emptyState.style.display = 'none';

    var typeText = cardData.type || '';
    var nameText = cardData.name || '';
    var validDate = cardData.validDate || '永久有效';
    var balanceText = String(cardData.balance || '');
    var giftBalanceText = String(cardData.giftBalance || '');

    var balanceHtml = '';
    if (cardData.type === '金额卡' && cardData.balance) {
        balanceHtml =
            '<div class="upgrade-card-info-row">' +
            '    <span class="upgrade-info-label">当前剩余余额</span>' +
            '    <span class="upgrade-info-value"><span class="upgrade-balance-highlight">' + cardData.balance + '</span></span>' +
            '</div>' +
            (cardData.giftBalance ? (
                '<div class="upgrade-card-info-row">' +
                '    <span class="upgrade-info-label">赠金余额</span>' +
                '    <span class="upgrade-info-value"><span class="upgrade-balance-highlight">' + cardData.giftBalance + '</span></span>' +
                '</div>'
            ) : '');
    }

    var existingItem = getRechargeItem(cardData.id);
    if (!existingItem) {
        rechargeCardList.push({
            cardId: cardData.id,
            cardType: cardData.type,
            cardName: cardData.name,
            validDate: validDate,
            balance: balanceText,
            giftBalance: giftBalanceText,
            rechargeAmount: 0,
            giftAmount: 0,
            remark: '',
            beauticianIds: [],
            beautician: '',
            giftBenefits: { care: [], home: [], card: [] },
            timestamp: Date.now()
        });
        existingItem = getRechargeItem(cardData.id);
    } else {
        existingItem.cardType = cardData.type;
        existingItem.cardName = cardData.name;
        existingItem.validDate = validDate;
        existingItem.balance = balanceText;
        existingItem.giftBalance = giftBalanceText;
    }

    var quickAmounts = [500, 1000, 2000, 3000, 5000];

    var moduleDiv = document.createElement('div');
    moduleDiv.className = 'upgrade-card-module';
    moduleDiv.id = 'recharge-module-' + cardData.id;
    moduleDiv.setAttribute('data-module-type', 'recharge');

    moduleDiv.innerHTML =
        '<div class="upgrade-module-header">' +
        '    <span class="upgrade-module-title">充卡</span>' +
        '    <button class="upgrade-delete-btn" onclick="removeRechargeModule(\'' + cardData.id + '\')">' +
        '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>' +
        '        删除' +
        '    </button>' +
        '</div>' +
        '<div class="upgrade-card-body" style="align-items:stretch;">' +
        '    <div class="upgrade-current-card">' +
        '        <div class="upgrade-card-name-row">' +
        '            <span class="upgrade-card-type-tag">' +
        '                <svg class="upgrade-card-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' +
        '                ' + typeText +
        '            </span>' +
        '            <span class="upgrade-card-title-text">' + nameText + '</span>' +
        '        </div>' +
        '        <div class="upgrade-card-info-row">' +
        '            <span class="upgrade-info-label">使用期限</span>' +
        '            <span class="upgrade-info-value">' + validDate + '</span>' +
        '        </div>' +
        balanceHtml +
        '    </div>' +
        '' +
        '    <div class="upgrade-arrow-area">' +
        '        <span class="upgrade-arrow-text">充值</span>' +
        '        <svg class="upgrade-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="12" width="18" height="9" rx="2"/><path d="M12 3v8"/><path d="M8 8l4 4 4-4"/><path d="M3 16h18"/></svg>' +
        '    </div>' +
        '' +
        '    <div class="upgrade-newcard-panel" style="display:flex;flex-direction:column;gap:12px;">' +
        '        <div class="upgrade-newcard-selected" style="flex:1;display:flex;flex-direction:column;gap:10px;align-items:stretch;">' +
        '            <div style="display:flex;gap:12px;align-items:flex-start;">' +
        '                <div style="flex:1;min-width:0;">' +
        '                    <div style="font-size:13px;color:var(--neutral-600);font-weight:600;margin-bottom:6px;">充值金额</div>' +
        '                    <div style="display:flex;align-items:center;gap:8px;">' +
        '                        <input id="recharge-amount-input-' + cardData.id + '" class="upgrade-fee-input" type="text" inputmode="decimal" value="' + String(existingItem.rechargeAmount || 0) + '" placeholder="0"' +
        '                               oninput="onRechargeAmountInput(this,\'' + cardData.id + '\')" onblur="onRechargeAmountBlur(this,\'' + cardData.id + '\')">' +
        '                    </div>' +
        '                </div>' +
        '                <div style="flex:1;min-width:0;">' +
        '                    <div style="font-size:13px;color:var(--neutral-600);font-weight:600;margin-bottom:6px;">赠送金额</div>' +
        '                    <input id="recharge-gift-amount-input-' + cardData.id + '" class="upgrade-fee-input" type="text" inputmode="decimal" value="' + String(existingItem.giftAmount || 0) + '" placeholder="0"' +
        '                           oninput="onRechargeGiftAmountInput(this,\'' + cardData.id + '\')" onblur="onRechargeGiftAmountBlur(this,\'' + cardData.id + '\')">' +
        '                </div>' +
        '            </div>' +
        '            <div style="display:flex;flex-wrap:wrap;gap:8px;">' +
                        quickAmounts.map(function (amt) {
                            return '<button type="button" class="benefit-recent-tag" data-amt="' + amt + '" onclick="applyRechargeQuickAmount(this,\'' + cardData.id + '\')">¥' + amt + '</button>';
                        }).join('') +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>' +
        '<div class="course-detail-tables" style="margin-top:12px;padding: 12px 12px;">' +
        '    <div class="course-table-section">' +
        '        <div class="course-table-title-row">' +
        '            <div class="course-table-title"><span class="gift-badge">赠</span>单次护理</div>' +
        '            <button class="course-table-add-btn" onclick="openRechargeGiftBenefitModal(\'' + cardData.id + '\',\'care\')">+ 添加权益</button>' +
        '        </div>' +
        '        <table class="course-detail-table custom-course-table recharge-gift-table" data-custom-table="care">' +
        '            <thead><tr>' +
        '                <th class="col-name">商品名称</th>' +
        '                <th class="col-duration">服务时长</th>' +
        '                <th class="col-price">服务价格</th>' +
        '                <th class="col-qty">赠送数量</th>' +
        '                <th class="col-action">操作</th>' +
        '            </tr></thead>' +
        '            <tbody id="rechargeGiftCareBody-' + cardData.id + '"></tbody>' +
        '        </table>' +
        '    </div>' +
        '    <div class="course-table-section">' +
        '        <div class="course-table-title-row">' +
        '            <div class="course-table-title"><span class="gift-badge">赠</span>居家产品</div>' +
        '            <button class="course-table-add-btn" onclick="openRechargeGiftBenefitModal(\'' + cardData.id + '\',\'home\')">+ 添加权益</button>' +
        '        </div>' +
        '        <table class="course-detail-table custom-course-table recharge-gift-table" data-custom-table="home">' +
        '            <thead><tr>' +
        '                <th class="col-name">商品名称</th>' +
        '                <th class="col-spec">规格</th>' +
        '                <th class="col-price">售卖价格</th>' +
        '                <th class="col-qty">赠送数量</th>' +
        '                <th class="col-action">操作</th>' +
        '            </tr></thead>' +
        '            <tbody id="rechargeGiftHomeBody-' + cardData.id + '"></tbody>' +
        '        </table>' +
        '    </div>' +
        '    <div class="course-table-section">' +
        '        <div class="course-table-title-row">' +
        '            <div class="course-table-title"><span class="gift-badge">赠</span>卡项</div>' +
        '            <button class="course-table-add-btn" onclick="openRechargeGiftBenefitModal(\'' + cardData.id + '\',\'card\')">+ 添加权益</button>' +
        '        </div>' +
        '        <table class="course-detail-table custom-course-table recharge-gift-table" data-custom-table="card">' +
        '            <thead><tr>' +
        '                <th class="col-name">卡项名称</th>' +
        '                <th class="col-type">卡项类型</th>' +
        '                <th class="col-price">卡项价格</th>' +
        '                <th class="col-qty">赠送数量</th>' +
        '                <th class="col-action">操作</th>' +
        '            </tr></thead>' +
        '            <tbody id="rechargeGiftCardBody-' + cardData.id + '"></tbody>' +
        '        </table>' +
        '    </div>' +
        '</div>' +
        '<div class="upgrade-bottom-section" style="flex-wrap:wrap;gap:10px;margin-top:12px;margin-bottom:12px;">' +
        '    <div class="upgrade-bottom-left" style="flex:1;min-width:260px;">' +
        '        <span class="upgrade-bottom-label">美容师</span>' +
        '        <button type="button" class="row-beautician-btn" data-item-name="充卡 - ' + escapeHtmlAttr(nameText) + '" data-ids="' + (existingItem.beauticianIds || []).join(',') + '" data-value="' + escapeHtmlAttr(existingItem.beautician || '') + '" onclick="openRowBeauticianModal(this)">' + (existingItem.beautician ? escapeHtmlAttr(existingItem.beautician) : '选择美容师') + '</button>' +
        '    </div>' +
        '    <div class="upgrade-bottom-right" style="flex:2;min-width:320px;display:flex;align-items:center;gap:10px;">' +
        '        <span class="upgrade-bottom-label" style="width:auto;">备注</span>' +
        '        <input id="recharge-remark-input-' + cardData.id + '" class="upgrade-remark-input" type="text" maxlength="200" placeholder="请输入备注（最多200字）" value="' + escapeHtmlAttr(existingItem.remark || '') + '" oninput="onRechargeRemarkInput(this,\'' + cardData.id + '\')">' +
        '    </div>' +
        '</div>';

    selectedItemsArea.insertBefore(moduleDiv, emptyState);

    showToast('已添加充卡：' + nameText);
    renderRechargeGiftTables(cardData.id);
    updateOrderAndPaymentVisibility();
}

function removeRechargeModule(cardId) {
    var el = document.getElementById('recharge-module-' + cardId);
    if (el) {
        el.remove();
        rechargeCardList = rechargeCardList.filter(function (item) { return item.cardId !== cardId; });
    }

    var selectedItemsArea = document.querySelector('.selected-items-area');
    var emptyState = document.getElementById('main-empty-state');
    if (selectedItemsArea && emptyState) {
        emptyState.style.display = hasAnySelectedItemsContent() ? 'none' : 'flex';
    }

    updateOrderAndPaymentVisibility();
    updateOrderSummary();
    benefitModalRechargeIntent = false;
    if (benefitModalOverlay && benefitModalOverlay.classList.contains('show')) {
        var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
        renderBenefitCards(keyword);
        updateSearchClearButton();
    }
}

// 移除升卡模块
function removeUpgradeModule(cardId) {
    var el = document.getElementById('upgrade-module-' + cardId);
    if (el) {
        el.remove();
        // 从列表中移除
        upgradeCardList = upgradeCardList.filter(function (item) { return item.cardId !== cardId; });
    }

    // 如果没有已选内容了，显示空状态
    var selectedItemsArea = document.querySelector('.selected-items-area');
    var emptyState = document.getElementById('main-empty-state');
    if (selectedItemsArea && emptyState) {
        emptyState.style.display = hasAnySelectedItemsContent() ? 'none' : 'flex';
    }

    // 更新订单信息和支付汇总的显示状态
    updateOrderAndPaymentVisibility();
    if (benefitModalOverlay && benefitModalOverlay.classList.contains('show')) {
        var keyword = benefitSearchInput ? (benefitSearchInput.value || '') : '';
        renderBenefitCards(keyword);
        updateSearchClearButton();
    }
}

// 绑定搜索事件
if (benefitSearchInput) {
    benefitSearchInput.addEventListener('input', function () {
        var keyword = this.value;
        renderBenefitCards(keyword);
        updateSearchClearButton();
    });

    benefitSearchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addToBenefitRecentSearches(this.value);
        }
    });
}

// 绑定清除按钮事件
if (benefitSearchClear) {
    benefitSearchClear.addEventListener('click', function () {
        if (benefitSearchInput) {
            benefitSearchInput.value = '';
            renderBenefitCards();
            updateSearchClearButton();
        }
    });
}

// 点击遮罩关闭弹窗
if (benefitModalOverlay) {
    benefitModalOverlay.addEventListener('click', function (e) {
        if (e.target === benefitModalOverlay) {
            hideBenefitModal();
        }
    });
}

// 事件绑定
if (changeMemberBtn) {
    changeMemberBtn.addEventListener('click', openMemberModal);
}
if (memberModalClose) {
    memberModalClose.addEventListener('click', hideMemberModal);
}
if (memberModalCancel) {
    memberModalCancel.addEventListener('click', hideMemberModal);
}
if (memberModalConfirm) {
    memberModalConfirm.addEventListener('click', () => {
        if (selectedMember) {
            updateMemberInfo(selectedMember);
            showToast(`已选择会员: ${selectedMember.name}`);
            hideMemberModal();
        }
    });
}
if (memberModalSearchInput) {
    memberModalSearchInput.addEventListener('input', (e) => searchMembers(e.target.value));
}
memberModalOverlay.addEventListener('click', (e) => {
    if (e.target === memberModalOverlay) hideMemberModal();
});
confirmModalOverlay.addEventListener('click', (e) => {
    if (e.target === confirmModalOverlay) hideConfirmModal();
});
confirmCancel.addEventListener('click', hideConfirmModal);
confirmOk.addEventListener('click', function () {
    // 如果有自定义回调，执行回调
    if (confirmModalOverlay.dataset.hasCallback === 'true' && window.confirmCallback) {
        window.confirmCallback();
        window.confirmCallback = null;
    }
    hideConfirmModal();
});


// 监听来自iframe的消息
window.addEventListener('message', (e) => {
    if (e.data.type === 'closeFindCustomer' || e.data.type === 'closeMemberModal') {
        hideMemberModal();
    } else if (e.data.type === 'searchCustomer') {
        // 处理查找会员弹窗的搜索
        handleCustomerSearch(e.data.keyword, e.data.field);
    } else if (e.data.type === 'newMember') {
        // 处理新建会员
        showToast('新建会员功能');
    } else if (e.data.type === 'selectMember') {
        // 处理会员选择
        const memberData = e.data.data;
        if (memberData) {
            // 实时更新会员信息到页面
            updateMemberInfo(memberData);
            // 显示成功提示
            showToast(`已选择会员: ${memberData.name}`);
            // 关闭会员选择弹窗
            hideMemberModal();
        }
    }
});

// 处理会员搜索结果
function handleCustomerSearch(keyword, field) {
    // 如果keyword为空，不处理
    if (!keyword) return;

    // 模拟搜索延迟（不超过300ms）
    setTimeout(() => {
        // 过滤匹配的会员
        const filteredMembers = mockMembers.filter(member => {
            const searchLower = String(keyword || '').toLowerCase();
            const nameLower = String(member?.name || '').toLowerCase();
            const memberNoLower = String(member?.memberNo || '').toLowerCase();
            const phoneStr = String(member?.phone || '');
            return nameLower.includes(searchLower) ||
                phoneStr.includes(String(keyword)) ||
                memberNoLower.includes(searchLower);
        });

        // 发送搜索结果到iframe
        const iframe = document.getElementById('memberModalIframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'searchResult',
                members: filteredMembers
            }, '*');
        }
    }, Math.min(200, keyword.length * 30)); // 响应时间不超过300ms
}

// 订单信息折叠
const orderFormHeaderToggle = document.getElementById('orderFormHeaderToggle');
orderFormHeaderToggle.addEventListener('click', () => {
    orderFormHeader.classList.toggle('expanded');
    orderFormContent.classList.toggle('expanded');
    const toggleText = orderFormHeaderToggle.querySelector('span');
    toggleText.textContent = orderFormHeader.classList.contains('expanded') ? '收起' : '展开';
});

// 全部消耗/拿走按钮
document.getElementById('consume-all-btn')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const text = this.classList.contains('active') ? '取消全部' : '全部消耗';
    this.textContent = text;
    showToast(this.classList.contains('active') ? '已设置全部疗程消耗' : '已取消全部消耗');
});

document.getElementById('take-all-btn')?.addEventListener('click', function () {
    this.classList.toggle('active');
    const text = this.classList.contains('active') ? '取消全部' : '全部拿走';
    this.textContent = text;
    showToast(this.classList.contains('active') ? '已设置全部产品拿走' : '已取消全部拿走');
});

// 初始化（仅在 memberList 元素存在时执行）
if (memberList) {
    renderMemberList(mockMembers);
}

// ========== 表格步进器功能 ==========
function tableStepUp(btn) {
    const container = btn.closest('.table-stepper');
    const input = container.querySelector('input[type="number"]');
    if (input && (input.readOnly || input.disabled || input.dataset.locked === '1')) return;
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || 999;
    let value = parseInt(input.value) || min;
    value = Math.min(max, value + 1);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function tableStepDown(btn) {
    const container = btn.closest('.table-stepper');
    const input = container.querySelector('input[type="number"]');
    if (input && (input.readOnly || input.disabled || input.dataset.locked === '1')) return;
    const min = parseInt(input.min) || 0;
    let value = parseInt(input.value) || min;
    if (value > min) {
        value--;
        input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

// ========== 折扣与折后价互算 ==========
var suppressMoneyCardConflict = false;
function sanitizeIntString(value) {
    const v = String(value ?? '').replace(/[^\d]/g, '');
    if (!v) return '';
    return String(parseInt(v, 10));
}

function clampNumber(n, min, max) {
    const v = Number.isFinite(Number(n)) ? Number(n) : 0;
    return Math.min(max, Math.max(min, v));
}

function sanitizePriceString(value, decimals) {
    let v = String(value ?? '').replace(/[^\d.]/g, '');
    const dotIndex = v.indexOf('.');
    if (dotIndex === -1) return v;

    const intPart = v.slice(0, dotIndex).replace(/\./g, '');
    const decPart = v.slice(dotIndex + 1).replace(/\./g, '').slice(0, decimals);
    const safeIntPart = intPart ? intPart : '0';
    return safeIntPart + '.' + decPart;
}

// ===== 调试日志：记录商品金额字段每次变更 =====
function logProductFieldChange(row, field, oldValue, newValue, caller) {
    const itemType = row?.getAttribute('data-item-type') || '?';
    const itemId = row?.getAttribute('data-item-id') || '?';
    const name = (row?.querySelector('.col-name')?.textContent || '').replace(/\s+/g, ' ').trim();
    console.log(
        '%c[' + new Date().toLocaleTimeString() + ']%c ' + caller +
        ' %c|%c ' + itemType + ' %c|%c ' + name + ' (#' + itemId + ')' +
        ' %c|%c ' + field + ': ' + oldValue + ' → ' + newValue,
        'color:#999', 'color:#e67e22;font-weight:bold', 'color:#999', 'color:#3498db', 'color:#999', 'color:#2ecc71', 'color:#999', 'color:#e74c3c;font-weight:bold'
    );
}

function formatFinalPriceInput(input) {
    const sanitized = sanitizePriceString(input.value, 2);
    const v = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
    input.value = v.toFixed(2);
    const row = input.closest('tr');
    const itemType = row?.getAttribute('data-item-type') || '';
    if (itemType === 'course') {
        onCourseLineFieldChange(input);
        const discountInput = row?.querySelector('[data-field="discount"]');
        if (discountInput) onCourseLineFieldChange(discountInput);
        return;
    }
    if (itemType === 'amountCard') {
        updateAmountCardDiscountFromFinalPrice(input);
        syncAmountCardRowToState(row);
        updateOrderSummary();
        return;
    }
    updateDiscount(input);
}

let finalPriceBlurTimer = 0;
document.addEventListener('blur', function (e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.getAttribute('data-field') !== 'finalPrice') return;
    formatFinalPriceInput(el);
    if (finalPriceBlurTimer) window.clearTimeout(finalPriceBlurTimer);
    finalPriceBlurTimer = window.setTimeout(function () {
        finalPriceBlurTimer = 0;
        const row = el.closest('tr.item-row');
        if (!row) return;
        normalizeAndRenderMoneyCards();
        updateOrderSummary();
    }, 80);
}, true);

function updateFinalPrice(discountInput) {
    const row = discountInput.closest('tr');
    if (!row) return;

    const oldDiscount = discountInput.value;
    const intStr = sanitizeIntString(discountInput.value);
    const discount = clampNumber(intStr === '' ? 0 : parseInt(intStr, 10), 0, 100);

    if (row && !suppressMoneyCardConflict) {
        const apps = getRowMoneyCards(row);
        if (apps.length > 0) {
            const originStr = String(discountInput.dataset.editOrigin ?? '');
            const originIntStr = sanitizeIntString(originStr);
            const originDiscount = clampNumber(originIntStr === '' ? discount : parseInt(originIntStr, 10), 0, 100);
            if (originDiscount !== discount) {
                row.dataset.userDiscountOverride = '1';
            }
        }
    }

    discountInput.value = String(discount);
    discountInput.setAttribute('value', String(discount));
    logProductFieldChange(row, 'discount', oldDiscount, String(discount), 'updateFinalPrice');

    const originalPriceText = row.querySelector('.col-original').textContent;
    const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
    const qtyEl = row.querySelector('input[data-field="buyQty"]') || row.querySelector('input[data-field="buy"]');
    const buyQty = Math.max(0, parseInt(String(qtyEl?.value || '0'), 10) || 0);
    const baseTotal = originalPrice * buyQty;
    const finalPrice = baseTotal * (discount / 100);
    const finalPriceInput = row.querySelector('[data-field="finalPrice"]');

    const oldFinalPrice = finalPriceInput ? finalPriceInput.value : '?';
    finalPriceInput.value = finalPrice.toFixed(2);
    logProductFieldChange(row, 'finalPrice', oldFinalPrice, finalPrice.toFixed(2), 'updateFinalPrice');
    
    if (!suppressMoneyCardConflict && getRowMoneyCards(row).length > 0) {
        normalizeAndRenderMoneyCards();
    } else {
        const actionRow = findActionRowForItemRow(row);
        const valEl = ensureActionRowPayable(actionRow);
        if (valEl) {
            valEl.textContent = `¥${finalPrice.toFixed(2)}`;
        }
    }
    
    updateOrderSummary();
}

function updateDiscount(finalPriceInput) {
    const row = finalPriceInput.closest('tr');
    if (!row) return;

    const oldFinalPrice = finalPriceInput.value;
    const sanitized = sanitizePriceString(finalPriceInput.value, 2);
    finalPriceInput.value = sanitized;
    logProductFieldChange(row, 'finalPrice', oldFinalPrice, sanitized, 'updateDiscount');
    const finalPrice = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
    const originalPriceText = row.querySelector('.col-original').textContent;
    const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
    const qtyEl = row.querySelector('input[data-field="buyQty"]') || row.querySelector('input[data-field="buy"]');
    const buyQty = Math.max(0, parseInt(String(qtyEl?.value || '0'), 10) || 0);
    const baseTotal = originalPrice * buyQty;
    const discountInput = row.querySelector('[data-field="discount"]');
    if (discountInput instanceof HTMLInputElement) {
        const curDiscountIntStr = sanitizeIntString(discountInput.value);
        const curDiscount = clampNumber(curDiscountIntStr === '' ? 0 : parseInt(curDiscountIntStr, 10), 0, 100);

        if (row && !suppressMoneyCardConflict) {
            const apps = getRowMoneyCards(row);
            if (apps.length > 0) {
                const originStr = String(finalPriceInput.dataset.editOrigin ?? '');
                const originSan = sanitizePriceString(originStr, 2);
                const originFinal = roundMoney2(parseFloat(originSan || '0') || 0);
                const newFinal = roundMoney2(finalPrice);
                if (Math.abs(newFinal - originFinal) > 0.000001) {
                    row.dataset.userDiscountOverride = '1';
                }
            }
        }

        const discount = baseTotal > 0 ? (finalPrice / baseTotal) * 100 : 0;
        const discountValue = clampNumber(discount, 0, 100).toFixed(2);
        const oldDiscountVal = discountInput.value;
        discountInput.value = discountValue;
        discountInput.setAttribute('value', discountValue);
        logProductFieldChange(row, 'discount', oldDiscountVal, discountValue, 'updateDiscount');
    }
    
    if (!suppressMoneyCardConflict && getRowMoneyCards(row).length > 0) {
        normalizeAndRenderMoneyCards();
    } else {
        const actionRow = findActionRowForItemRow(row);
        const valEl = ensureActionRowPayable(actionRow);
        if (valEl) {
            valEl.textContent = `¥${finalPrice.toFixed(2)}`;
        }
    }
    
    updateOrderSummary();
}

function onSimpleLineFieldChange(el) {
    const row = el.closest('tr');
    if (!row) return;
    const field = el.getAttribute('data-field') || '';
    if (field !== 'buy') {
        updateOrderSummary();
        return;
    }
    const itemType = row.getAttribute('data-item-type') || '';
    const min = parseInt(String(el.min || '0'), 10) || 0;
    const max = parseInt(String(el.max || '999'), 10) || 999;
    const oldBuy = el.value;
    const v = clampNumber(parseInt(String(el.value || '0'), 10) || 0, min, max);
    el.value = String(v);
    logProductFieldChange(row, 'buy', oldBuy, String(v), 'onSimpleLineFieldChange');

    // 修改购买数量后移除整单优惠（PRD规则）
    if (wholeOrderChangeState?.enabled) {
        removeWholeOrderChange();
    }

    const giftFlag = row.querySelector('.gift-flag-checkbox');
    const hiddenGift = row.querySelector('input[data-field="gift"]');
    if (giftFlag instanceof HTMLInputElement && giftFlag.checked && hiddenGift instanceof HTMLInputElement) {
        hiddenGift.value = String(v);
    }

    syncConsumeToBuyForRow(row, v);
    if (!isGuestModeActive() && itemType === 'product') {
        const consumeInput = row.querySelector('input[data-field="consume"]');
        if (consumeInput instanceof HTMLInputElement) {
            consumeInput.value = String(sanitizeQty(v, 0, 999, 0));
            consumeInput.setAttribute('value', consumeInput.value);
            consumeInput.readOnly = false;
            consumeInput.disabled = false;
            consumeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    const discountInput = row.querySelector('input[data-field="discount"]');
    if (discountInput) {
        updateFinalPrice(discountInput);
        return;
    }
    updateOrderSummary();
}

function normalizeItemType(v) {
    if (v === null || v === undefined) return '';
    if (typeof v !== 'string') {
        try {
            v = String(v);
        } catch (e) {
            return '';
        }
    }
    return v.replace(/\s+/g, '').trim();
}

function isSingleCareType(v) {
    const t = normalizeItemType(v);
    if (!t) return false;
    return t === '单次护理' || t.includes('单次护理');
}

function inferBenefitTypeFromCardId(cardId) {
    const id = String(cardId || '').trim();
    if (!id) return '';
    const cards = (typeof mockBenefitData !== 'undefined' && mockBenefitData && Array.isArray(mockBenefitData.cards))
        ? mockBenefitData.cards
        : [];
    const card = cards.find(c => String(c?.id || '') === id);
    if (!card) return '';
    const cardType = normalizeItemType(card.type);
    if (cardType === '有限次卡') return '单次护理';
    return '';
}

function updateIngredientButtonVisibility() {
    const btn = document.getElementById('ingredientBtn');
    if (!btn) return;

    const serviceRows = document.querySelectorAll('#service-table-body tr.item-row');
    let hasSingleCareService = false;
    for (let i = 0; i < serviceRows.length; i++) {
        const tr = serviceRows[i];
        if (!tr) continue;
        const itemType = normalizeItemType(tr.getAttribute('data-item-type') || tr.dataset?.itemType || '');
        if (itemType && itemType !== 'service') continue;
        const serviceType = tr.getAttribute('data-service-type') || tr.dataset?.serviceType || '';
        if (!serviceType) {
            hasSingleCareService = true;
            break;
        }
        if (isSingleCareType(serviceType)) {
            hasSingleCareService = true;
            break;
        }
    }

    const benefitRows = document.querySelectorAll('#benefit-consume-table-body tr.item-row');
    let hasSingleCareBenefit = false;
    for (let i = 0; i < benefitRows.length; i++) {
        const tr = benefitRows[i];
        if (!tr) continue;
        const benefitType = tr.getAttribute('data-benefit-type') || tr.dataset?.benefitType || '';
        if (isSingleCareType(benefitType)) {
            hasSingleCareBenefit = true;
            break;
        }
        if (!benefitType) {
            const inferred = inferBenefitTypeFromCardId(tr.getAttribute('data-card-id') || tr.dataset?.cardId || '');
            if (isSingleCareType(inferred)) {
                hasSingleCareBenefit = true;
                break;
            }
        }
    }

    btn.style.display = (hasSingleCareService || hasSingleCareBenefit) ? '' : 'none';
}

let ingredientButtonObserver = null;
function initIngredientButtonVisibilityWatcher() {
    if (ingredientButtonObserver) return;
    const serviceBody = document.getElementById('service-table-body');
    const benefitBody = document.getElementById('benefit-consume-table-body');
    if (!serviceBody && !benefitBody) return;

    ingredientButtonObserver = new MutationObserver(function () {
        updateIngredientButtonVisibility();
    });

    if (serviceBody) ingredientButtonObserver.observe(serviceBody, { childList: true });
    if (benefitBody) ingredientButtonObserver.observe(benefitBody, { childList: true });

    updateIngredientButtonVisibility();
}

// ========== 表格操作功能 ==========
function updateSelectedItemsEmptyStates() {
    ensureSelectedItemsSectionOrder();
    const mainEmptyState = document.getElementById('main-empty-state');

    const serviceSection = document.getElementById('serviceCategorySection');
    const serviceBody = document.getElementById('service-table-body');
    const serviceEmpty = document.getElementById('service-empty');
    const hasServices = !!(serviceBody && serviceBody.children.length > 0);

    const productSection = document.getElementById('productCategorySection');
    const productBody = document.getElementById('product-table-body');
    const productEmpty = document.getElementById('product-empty');
    const hasProducts = !!(productBody && productBody.children.length > 0);

    const amountCardSection = document.getElementById('amountCardCategorySection');
    const amountCardBody = document.getElementById('amount-card-table-body');
    const amountCardEmpty = document.getElementById('amount-card-empty');
    const hasAmountCards = !!(amountCardBody && amountCardBody.children.length > 0);

    const courseSection = document.getElementById('courseCategorySection');
    const courseBody = document.getElementById('course-table-body');
    const courseEmpty = document.getElementById('course-empty');
    const hasCourses = !!(courseBody && courseBody.children.length > 0);

    const benefitConsumeSection = document.getElementById('benefitConsumeSection');
    const benefitConsumeBody = document.getElementById('benefit-consume-table-body');
    const hasBenefitConsumes = !!(benefitConsumeBody && benefitConsumeBody.children.length > 0);

    const hasUpgradeOrRechargeModules = document.querySelectorAll('.upgrade-card-module').length > 0;
    const hasAnySelected = hasServices || hasProducts || hasAmountCards || hasCourses || hasBenefitConsumes || hasUpgradeOrRechargeModules;

    if (serviceSection) serviceSection.style.display = hasServices ? 'block' : 'none';
    if (serviceEmpty) serviceEmpty.style.display = hasServices ? 'none' : 'flex';

    if (productSection) productSection.style.display = hasProducts ? 'block' : 'none';
    if (productEmpty) productEmpty.style.display = hasProducts ? 'none' : 'flex';

    if (amountCardSection) amountCardSection.style.display = hasAmountCards ? 'block' : 'none';
    if (amountCardEmpty) amountCardEmpty.style.display = hasAmountCards ? 'none' : 'flex';

    if (courseSection) courseSection.style.display = hasCourses ? 'block' : 'none';
    if (courseEmpty) courseEmpty.style.display = hasCourses ? 'none' : 'flex';

    if (benefitConsumeSection) benefitConsumeSection.style.display = hasBenefitConsumes ? 'block' : 'none';

    if (mainEmptyState) {
        mainEmptyState.style.display = hasAnySelected ? 'none' : 'flex';
    }

    updateCategoryBadge('product');
    updateIngredientButtonVisibility();
}

function deleteTableRow(btn) {
    try {
        const actionRow = btn.closest('tr');
        if (!actionRow) return;

        let itemRow = actionRow.previousElementSibling;
        while (itemRow && (!(itemRow instanceof Element) || !itemRow.classList.contains('item-row'))) {
            itemRow = itemRow.previousElementSibling;
        }

        let cursor = actionRow.previousElementSibling;
        while (cursor && cursor !== itemRow) {
            const prev = cursor.previousElementSibling;
            if (cursor instanceof Element && cursor.classList.contains('moneycard-detail-row')) {
                cursor.remove();
            }
            cursor = prev;
        }

        if (itemRow && itemRow.classList.contains('item-row')) {
            itemRow.remove();
        }
        actionRow.remove();

        updateSelectedItemsEmptyStates();
        updateOrderSummary();
        updateOrderAndPaymentVisibility();
        normalizeAndRenderMoneyCards();
    } catch (e) {
        console.error(e);
        showToast('删除失败，请重试');
    }
}

// 复制商品行
function copyTableRow(btn) {
    const actionRow = btn.closest('tr');
    if (!actionRow) return;
    let itemRow = actionRow.previousElementSibling;
    while (itemRow && (!(itemRow instanceof Element) || !itemRow.classList.contains('item-row'))) {
        itemRow = itemRow.previousElementSibling;
    }
    if (!itemRow || !itemRow.classList.contains('item-row')) return;

    const srcGiftFlag = itemRow.querySelector('.gift-flag-checkbox');
    const isGift = (srcGiftFlag instanceof HTMLInputElement) ? srcGiftFlag.checked : false;

    const clonedRow = itemRow.cloneNode(true);
    clonedRow.removeAttribute('data-moneycards');
    clonedRow.removeAttribute('data-money-card-id');
    clonedRow.removeAttribute('data-money-card-name');
    clonedRow.removeAttribute('data-money-card-discount');
    actionRow.after(clonedRow);

    const clonedActionRow = actionRow.cloneNode(true);
    clonedRow.after(clonedActionRow);

    const dstGiftFlag = clonedRow.querySelector('.gift-flag-checkbox');
    if (dstGiftFlag instanceof HTMLInputElement) dstGiftFlag.checked = isGift;

    const discountInput = clonedRow.querySelector('input[data-field="discount"]');
    if (!isGift && discountInput instanceof HTMLInputElement) {
        discountInput.value = '100';
        updateFinalPrice(discountInput);
    }

    const chooseBtn = clonedRow.querySelector('[data-action="open-moneycard-modal"]');
    if (!isGift && chooseBtn instanceof HTMLButtonElement) {
        chooseBtn.textContent = '选择金额卡';
        chooseBtn.disabled = false;
    }

    const payableEl = clonedActionRow.querySelector('.item-payable-val');
    if (payableEl instanceof Element) payableEl.textContent = '¥0.00';

    if (isGift && dstGiftFlag instanceof HTMLInputElement) {
        onGiftFlagToggle(dstGiftFlag);
    }

    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
    normalizeAndRenderMoneyCards();
}

function onGiftFlagToggle(checkbox) {
    if (!(checkbox instanceof HTMLInputElement)) return;
    const row = checkbox.closest('tr.item-row');
    if (!row) return;

    const isGift = checkbox.checked;
    logProductFieldChange(row, 'giftFlag', !isGift, isGift, 'onGiftFlagToggle');
    if (isGift) row.dataset.isGift = '1';
    else if (row.dataset.isGift) delete row.dataset.isGift;
    if (row.dataset.userDiscountOverride) delete row.dataset.userDiscountOverride;

    const buyQty = getRowBuyQty(row);
    const hiddenGift = row.querySelector('input[data-field="gift"]') || row.querySelector('input[data-field="giftQty"]');
    if (hiddenGift instanceof HTMLInputElement) {
        hiddenGift.value = isGift ? String(buyQty) : '0';
    }

    const itemType = row.getAttribute('data-item-type') || '';
    const chooseBtn = row.querySelector('[data-action="open-moneycard-modal"]');

    if (isGift) {
        if (itemType === 'service' || itemType === 'product' || itemType === 'course') {
            clearRowMoneyCards(row, { preserveDiscount: true });
        }
        if (chooseBtn instanceof HTMLButtonElement) {
            chooseBtn.textContent = '不可使用金额卡';
            chooseBtn.disabled = true;
        }
    } else {
        if (chooseBtn instanceof HTMLButtonElement) {
            chooseBtn.textContent = '选择金额卡';
            chooseBtn.disabled = false;
        }
    }

    const discountInput = row.querySelector('input[data-field="discount"]');
    const finalInput = row.querySelector('input[data-field="finalPrice"]');
    const discountWrap = row.querySelector('.discount-wrapper');
    if (discountInput instanceof HTMLInputElement) discountInput.classList.toggle('is-readonly', isGift);
    if (finalInput instanceof HTMLInputElement) finalInput.classList.toggle('is-readonly', isGift);
    if (discountWrap instanceof HTMLElement) discountWrap.classList.toggle('is-readonly', isGift);
    if (discountInput instanceof HTMLInputElement) discountInput.readOnly = isGift;
    if (finalInput instanceof HTMLInputElement) finalInput.readOnly = isGift;

    if (itemType === 'amountCard') {
        if (discountInput instanceof HTMLInputElement) discountInput.value = isGift ? '0.00' : '100.00';
        if (discountInput instanceof HTMLInputElement) onAmountCardDiscountInput(discountInput);
        syncAmountCardRowToState(row);
        updateOrderSummary();
        return;
    }

    if (discountInput instanceof HTMLInputElement) {
        discountInput.value = isGift ? '0' : '100';
        if (itemType === 'course') onCourseDiscountInput(discountInput);
        else updateFinalPrice(discountInput);
    } else if (finalInput instanceof HTMLInputElement && !isGift) {
        finalInput.value = '0.00';
        updateOrderSummary();
    }

    if (itemType === 'course') {
        const id = Number(row.getAttribute('data-item-id'));
        const idx = selectedCourseCards.findIndex(c => Number(c.id) === id);
        if (idx > -1) {
            selectedCourseCards[idx].isGift = isGift;
            selectedCourseCards[idx].giftQty = isGift ? buyQty : 0;
            if (isGift) {
                selectedCourseCards[idx].moneyCardId = '';
                selectedCourseCards[idx].moneyCards = [];
            }
        }
    }

    if (isGift) {
        const actionRow = findActionRowForItemRow(row);
        const payableEl = actionRow?.querySelector?.('.item-payable-val');
        if (payableEl instanceof Element) payableEl.textContent = '¥0.00';
    }

    normalizeAndRenderMoneyCards();
    updateOrderSummary();
}

function updateCategoryBadge(type) {
    if (type !== 'product') return;
    const badge = document.getElementById('productCategoryBadge');
    if (!badge) return;
    const rows = document.querySelectorAll('#product-table-body tr.item-row');
    let buyQtyTotal = 0;
    rows.forEach(row => {
        buyQtyTotal += parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0;
    });
    badge.textContent = String(buyQtyTotal);
    badge.style.display = buyQtyTotal > 0 ? 'inline-flex' : 'none';
}

// 更新订单汇总（待收款、共优惠）
let orderSummaryCache = {
    baseOriginal: 0,
    baseFinal: 0,
    baseDiscount: 0,
    displayFinal: 0,
    displayDiscount: 0,
    moneyCardTotal: 0,
    displayPayable: 0
};

let wholeOrderChangeState = {
    enabled: false,
    amount: 0,
    discountAmount: 0
};

let wholeOrderChangePopoverOpen = false;
let wholeOrderChangeRepositionRaf = 0;

function updateOrderSummary() {
    const highlightEl = document.querySelector('#paymentBar .payment-item-value.highlight');
    const discountEl = document.querySelector('#paymentBar .payment-item-value.discount');
    const moneyCardItem = document.getElementById('moneyCardPayItem');
    const moneyCardValEl = moneyCardItem?.querySelector?.('.payment-item-value');
    const payableInput = document.getElementById('orderPayableAmountInput');
    const discountAmountInput = document.getElementById('orderDiscountAmountInput');

    let totalOriginal = 0;
    let totalFinal = 0;

    const serviceRows = document.querySelectorAll('#service-table-body tr.item-row');
    serviceRows.forEach(row => {
        const originalPriceText = row.querySelector('.col-original')?.textContent || '';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const buyQty = parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0;
        const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
        totalOriginal += originalPrice * buyQty;
        totalFinal += finalPrice;
    });

    const productRows = document.querySelectorAll('#product-table-body tr.item-row');
    productRows.forEach(row => {
        const originalPriceText = row.querySelector('.col-original')?.textContent || '';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const buyQty = parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0;
        const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
        totalOriginal += originalPrice * buyQty;
        totalFinal += finalPrice;
    });

    const amountCardRows = document.querySelectorAll('#amount-card-table-body tr.item-row');
    amountCardRows.forEach(row => {
        const originalPriceText = row.querySelector('.col-original')?.textContent || '';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const buyQty = parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0;
        const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
        totalOriginal += originalPrice * buyQty;
        totalFinal += finalPrice;
    });

    const upgradeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="upgrade"]');
    upgradeModules.forEach(module => {
        const oldCardId = module.getAttribute('data-old-card-id') || '';
        const item = (typeof upgradeCardList !== 'undefined' && Array.isArray(upgradeCardList))
            ? upgradeCardList.find(x => String(x.cardId) === String(oldCardId))
            : null;
        if (!item || !item.newCard) return;
        const gap = Number(item.gapAmount || 0);
        const pay = Number(item.finalPrice || 0);
        totalOriginal += gap;
        totalFinal += pay;
    });

    const rechargeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="recharge"]');
    rechargeModules.forEach(module => {
        const cardId = (module.id || '').replace('recharge-module-', '');
        const item = (typeof rechargeCardList !== 'undefined' && Array.isArray(rechargeCardList))
            ? rechargeCardList.find(x => String(x.cardId) === String(cardId))
            : null;
        if (!item) return;
        const amt = Number(item.rechargeAmount || 0);
        if (!Number.isFinite(amt) || amt <= 0) return;
        totalOriginal += amt;
        totalFinal += amt;
    });

    const courseRows = document.querySelectorAll('#course-table-body tr.item-row');
    courseRows.forEach(row => {
        const originalPriceText = row.querySelector('.col-original')?.textContent || '';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const buyQty = parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0;
        const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
        totalOriginal += originalPrice * buyQty;
        totalFinal += finalPrice;
    });

    const baseOriginal = totalOriginal;
    const baseFinal = totalFinal;
    const baseDiscount = Math.max(0, baseOriginal - baseFinal);

    let displayFinal = baseFinal;
    if (wholeOrderChangeState?.enabled) {
        const discountAmt = roundMoney2(Number(wholeOrderChangeState.discountAmount || 0));
        displayFinal = roundMoney2(Math.max(0, baseFinal - discountAmt));
        wholeOrderChangeState.amount = displayFinal;
    }

    let moneyCardTotal = 0;
    const moneyCardRows = document.querySelectorAll('tr.item-row[data-moneycards]');
    moneyCardRows.forEach(row => {
        const apps = getRowMoneyCards(row);
        apps.forEach(app => {
            const amt = roundMoney2(Number(app?.amount || 0));
            if (amt > 0) moneyCardTotal += amt;
        });
    });
    moneyCardTotal = roundMoney2(moneyCardTotal);
    const displayPayable = roundMoney2(Math.max(0, displayFinal));

    const displayDiscount = Math.max(0, baseOriginal - displayFinal);

    orderSummaryCache = {
        baseOriginal,
        baseFinal,
        baseDiscount,
        displayFinal,
        displayDiscount,
        moneyCardTotal,
        displayPayable
    };

    console.log(
        '%c[' + new Date().toLocaleTimeString() + ']%c updateOrderSummary %c|%c baseOriginal=¥'+baseOriginal.toFixed(2)
        + ' baseFinal=¥'+baseFinal.toFixed(2) + ' displayFinal=¥'+displayFinal.toFixed(2)
        + ' displayPayable=¥'+displayPayable.toFixed(2) + ' moneyCardTotal=¥'+moneyCardTotal.toFixed(2),
        'color:#999', 'color:#9b59b6;font-weight:bold', 'color:#999', 'color:#1abc9c'
    );

    if (highlightEl) highlightEl.textContent = `¥${displayPayable.toFixed(2)}`;
    // 始终取优惠明细弹窗中的优惠总计金额（baseOriginal - baseFinal），不再单独运算
    if (discountEl) {
        discountEl.textContent = `¥${baseDiscount.toFixed(2)}`;
    }
    if (payableInput) payableInput.value = displayPayable.toFixed(2);
    if (discountAmountInput && wholeOrderChangeState?.enabled) discountAmountInput.value = displayDiscount.toFixed(2);
    if (moneyCardValEl) moneyCardValEl.textContent = `¥${moneyCardTotal.toFixed(2)}`;
    if (moneyCardItem) moneyCardItem.style.display = moneyCardTotal > 0.000001 ? 'flex' : 'none';

    updateCategoryBadge('product');
    refreshWholeOrderChangeTipIfOpen();

    // 整单优惠分摊到各行（修改数量/折扣等操作后触发重分摊）
    // 守卫标志防止 redistributeWholeOrderDiscount → normalizeAndRenderMoneyCards → updateOrderSummary 死循环
    if (!window.__redistributingWholeOrder && wholeOrderChangeState?.enabled && wholeOrderChangeState.discountAmount > 0.000001) {
        window.__redistributingWholeOrder = true;
        try {
            redistributeWholeOrderDiscount(wholeOrderChangeState.discountAmount);
        } finally {
            window.__redistributingWholeOrder = false;
        }
    }
}

function sanitizeWholeOrderChangeAmountStr(v) {
    const sanitized = sanitizePriceString(v, 2);
    const n = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
    return { sanitized, n };
}





function sumWholeOrderChangeMoneyCardUsed() {
    let sum = 0;
    const moneyCardRows = document.querySelectorAll('tr.item-row[data-moneycards]');
    moneyCardRows.forEach(row => {
        const apps = getRowMoneyCards(row);
        apps.forEach(app => {
            const amt = roundMoney2(Number(app?.amount || 0));
            if (amt > 0) sum += amt;
        });
    });
    return roundMoney2(sum);
}

function sumWholeOrderChangeSelectedItemFinalPrices() {
    let sum = 0;
    const addFromRows = (rows) => {
        rows.forEach(row => {
            const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
            if (finalPrice > 0) sum += finalPrice;
        });
    };
    addFromRows(document.querySelectorAll('#service-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#product-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#amount-card-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#course-table-body tr.item-row'));
    return roundMoney2(sum);
}



// 汇总所有商品行的 baseFinalWithMoneyCard（整单改价弹窗的最大可优惠金额基准）
// 所有商品 baseFinalWithMoneyCard 的累加，排除赠品（应付金额为0）
function sumBaseFinalWithMoneyCard() {
    let sum = 0;
    const addFromRows = (rows) => {
        rows.forEach(row => {
            // 赠品（应付金额为0）不参与
            const finalPriceInput = row.querySelector('[data-field="finalPrice"]');
            const finalPrice = parseFloat(finalPriceInput?.value || '0') || 0;
            if (!(finalPrice > 0.000001)) return;
            const v = parseFloat(row.dataset.baseFinalWithMoneyCard);
            if (!isNaN(v) && v > 0) sum += v;
        });
    };
    addFromRows(document.querySelectorAll('#service-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#product-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#amount-card-table-body tr.item-row'));
    addFromRows(document.querySelectorAll('#course-table-body tr.item-row'));
    return roundMoney2(sum);
}

function renderWholeOrderChangeTip(opts) {
    const tipEl = document.querySelector('#wholeOrderChangePopover .woc-tip');
    if (!tipEl) return;
    const error = !!(opts && opts.error);
    if (tipEl.classList) tipEl.classList.toggle('error', error);

    const minAmount = sumWholeOrderChangeMoneyCardUsed();
    // 最大可优惠金额 = (所有商品 baseFinalWithMoneyCard 的累加) - (金额卡划扣金额的累加)
    const totalBase = sumBaseFinalWithMoneyCard();
    const maxDiscountAmount = roundMoney2(Math.max(0, totalBase - minAmount));

    if (!(minAmount > 0.000001)) {
        tipEl.textContent = '最大可优惠 ¥' + maxDiscountAmount.toFixed(2);
        return;
    }
    const amtHtml = '<span class="woc-tip-amount' + (error ? ' error' : '') + '">¥' + maxDiscountAmount.toFixed(2) + '</span>';
    tipEl.innerHTML = '最大可优惠 ' + amtHtml + '（受金额卡已划扣¥' + minAmount.toFixed(2) + '限制）';
}

function refreshWholeOrderChangeTipIfOpen() {
    if (!wholeOrderChangePopoverOpen) return;
    renderWholeOrderChangeTip({ error: false });
}

function positionWholeOrderChangePopover() {
    if (!wholeOrderChangePopoverOpen) return;
    const pop = document.getElementById('wholeOrderChangePopover');
    if (!pop) return;
    const btn = document.getElementById('wholeOrderChangeBtn');
    const rect = btn?.getBoundingClientRect?.();
    const vw = Math.max(0, window.innerWidth || 0);
    const vh = Math.max(0, window.innerHeight || 0);
    const popRect = pop.getBoundingClientRect();

    let left = Math.max(12, Math.min(vw - popRect.width - 12, vw - popRect.width - 12));
    let top = 12;

    if (rect) {
        left = Math.min(Math.max(12, rect.right - popRect.width), vw - popRect.width - 12);
        const aboveTop = rect.top - 10 - popRect.height;
        const belowTop = rect.bottom + 10;
        if (aboveTop >= 12) {
            top = aboveTop;
        } else if (belowTop + popRect.height <= vh - 12) {
            top = belowTop;
        } else {
            top = Math.min(Math.max(12, aboveTop), Math.max(12, vh - popRect.height - 12));
        }
    } else {
        left = Math.max(12, vw - popRect.width - 12);
        top = 12;
    }

    pop.style.top = `${top}px`;
    pop.style.left = `${left}px`;
}

function scheduleWholeOrderChangePopoverReposition() {
    if (!wholeOrderChangePopoverOpen) return;
    if (wholeOrderChangeRepositionRaf) return;
    wholeOrderChangeRepositionRaf = window.requestAnimationFrame(function () {
        wholeOrderChangeRepositionRaf = 0;
        positionWholeOrderChangePopover();
    });
}

function closeWholeOrderChangePopover() {
    const pop = document.getElementById('wholeOrderChangePopover');
    if (pop) pop.style.display = 'none';
    wholeOrderChangePopoverOpen = false;
    window.removeEventListener('scroll', scheduleWholeOrderChangePopoverReposition, true);
    window.removeEventListener('resize', scheduleWholeOrderChangePopoverReposition, true);
}

function openWholeOrderChangePopover() {
    const pop = document.getElementById('wholeOrderChangePopover');
    const amountInput = document.getElementById('wocAmountInput');
    if (!pop || !amountInput) return;

    const baseFinal = roundMoney2(Math.max(0, sumBaseFinalWithMoneyCard() - sumWholeOrderChangeMoneyCardUsed()));
    // 初始优惠金额 = 已有优惠金额或0
    const initDiscountAmount = wholeOrderChangeState?.enabled
        ? Number(wholeOrderChangeState.discountAmount || 0)
        : 0;
    amountInput.value = roundMoney2(clampNumber(initDiscountAmount, 0, baseFinal)).toFixed(2);

    if (amountInput.dataset) amountInput.dataset.wocOrigin = String(amountInput.value || '');

    const removeRow = document.getElementById('wocRemoveRow');
    if (removeRow) {
        removeRow.style.display = wholeOrderChangeState?.enabled ? 'flex' : 'none';
    }

    // 检查是否存在商品改价标记（userDiscountOverride）
    const hasUserOverride = document.querySelectorAll('.item-row').length > 0 &&
        Array.from(document.querySelectorAll('.item-row')).some(r => r.dataset?.userDiscountOverride === '1');

    // 移除商品优惠按钮：仅当存在 userDiscountOverride 的商品行时显示
    const removeProductRow = document.getElementById('wocRemoveProductRow');
    if (removeProductRow) {
        removeProductRow.style.display = hasUserOverride ? 'flex' : 'none';
    }

    // 存在商品改价标记时，隐藏整单优惠金额输入区和最低改价金额提示
    const wocFields = document.getElementById('wocFields');
    const wocMinTip = document.getElementById('wocMinTip');
    if (wocFields) wocFields.style.display = hasUserOverride ? 'none' : '';
    if (wocMinTip) wocMinTip.style.display = hasUserOverride ? 'none' : '';

    // 整单改价与商品改价互斥：存在商品改价时禁用整单改价输入框和确定按钮
    const wocConfirmBtn = document.getElementById('wocConfirmBtn');
    if (hasUserOverride) {
        amountInput.disabled = true;
        amountInput.style.opacity = '0.5';
        if (wocConfirmBtn) wocConfirmBtn.disabled = true;
    } else {
        amountInput.disabled = false;
        amountInput.style.opacity = '';
        if (wocConfirmBtn) wocConfirmBtn.disabled = false;
    }

    pop.style.display = 'block';
    wholeOrderChangePopoverOpen = true;
    positionWholeOrderChangePopover();
    renderWholeOrderChangeTip({ error: false });

    window.addEventListener('scroll', scheduleWholeOrderChangePopoverReposition, true);
    window.addEventListener('resize', scheduleWholeOrderChangePopoverReposition, true);
}

function removeWholeOrderChange() {
    wholeOrderChangeState.enabled = false;
    wholeOrderChangeState.amount = 0;
    wholeOrderChangeState.discountAmount = 0;

    // 设置转换守卫，抑制中间态触发的弹窗闪现
    window.__wholeOrderTransitioning = true;

    const discountAmountInput = document.getElementById('orderDiscountAmountInput');
    const baseDiscount = Number(orderSummaryCache?.baseDiscount || 0);
    if (discountAmountInput) discountAmountInput.value = baseDiscount.toFixed(2);

    const allRows = Array.from(document.querySelectorAll('.item-row'));

    // 第一遍：清除标记、还原应付金额和折扣值（不修改控件可用性）
    allRows.forEach(row => {
        const prevShare = parseFloat(row.dataset.wholeOrderShareDiscount || '0') || 0;
        const discountInput = row.querySelector('input[data-field="discount"]');
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
        if (prevShare > 0.000001) {
            const actionRow = findActionRowForItemRow(row);
            const payableEl = actionRow ? actionRow.querySelector('.item-payable-val') : null;
            if (payableEl) {
                const currentPayable = parseFloat(payableEl.textContent.replace('¥', '') || '0') || 0;
                payableEl.textContent = '¥' + roundMoney2(currentPayable + prevShare).toFixed(2);
            }
            // 还原折后价和折扣值（整单改价分摊时 subtracts shareAmount，此处反向还原）
            if (discountInput && finalPriceInput) {
                const currentFinalPrice = parseFloat(finalPriceInput.value || '0') || 0;
                const restoredFinalPrice = roundMoney2(currentFinalPrice + prevShare);
                const oldFinalPriceVal = finalPriceInput.value;
                finalPriceInput.value = restoredFinalPrice.toFixed(2);
                logProductFieldChange(row, 'finalPrice', oldFinalPriceVal, restoredFinalPrice.toFixed(2), 'removeWholeOrderChange');
                const originalPriceText = row.querySelector('.col-original')?.textContent || '';
                const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
                const buyInput = row.querySelector('input[data-field="buyQty"]') || row.querySelector('input[data-field="buy"]');
                const buyQty = Math.max(0, parseInt(String(buyInput?.value || '0'), 10) || 0);
                const baseTotal = originalPrice * buyQty;
                if (baseTotal > 0) {
                    const oldDisc = discountInput.value;
                    discountInput.value = String(Math.min(100, Math.max(0, Math.round(restoredFinalPrice / baseTotal * 100))));
                    logProductFieldChange(row, 'discount', oldDisc, discountInput.value, 'removeWholeOrderChange');
                } else {
                    const oldDisc = discountInput.value;
                    discountInput.value = '100';
                    logProductFieldChange(row, 'discount', oldDisc, '100', 'removeWholeOrderChange');
                }
            }
        }
        row.removeAttribute('data-whole-order-modified');
        row.dataset.wholeOrderShareDiscount = '0';
        row.style.removeProperty('--share-discount-amount');
        const shareAmountSpan = row.querySelector('.share-discount-amount');
        if (shareAmountSpan) shareAmountSpan.textContent = '';
    });

    // 第二遍：统一恢复所有输入框可用状态（所有标记已清除，不会触发互斥弹窗）
    allRows.forEach(row => {
        const discountInput = row.querySelector('input[data-field="discount"]');
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
        if (discountInput) {
            discountInput.disabled = false;
            discountInput.readOnly = false;
            discountInput.style.opacity = '';
        }
        if (finalPriceInput) {
            finalPriceInput.disabled = false;
            finalPriceInput.readOnly = false;
            finalPriceInput.style.opacity = '';
        }
        const discountWrap = row.querySelector('.discount-wrapper');
        if (discountWrap) discountWrap.classList.remove('is-readonly');
    });

    updateOrderSummary();

    closeWholeOrderChangePopover();

    showToast('已移除整单改价优惠');

    // 延迟清除守卫，确保异步事件（如 focusin）不会在此期间触发弹窗
    setTimeout(() => { window.__wholeOrderTransitioning = false; }, 100);
}

function removeProductDiscounts() {
    // 清除所有商品行的 userDiscountOverride 标记
    // 将所有商品行的折扣和折后价恢复至"原始应用金额卡的折扣和折后价"
    // 对于无应用金额卡的商品，将其折扣恢复至100%
    // 重新计算所有金额卡划扣金额（使用PRD规则）
    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
        if (!(row instanceof Element)) return;
        if (row.dataset?.userDiscountOverride) delete row.dataset.userDiscountOverride;

        const discountInput = row.querySelector('input[data-field="discount"]');
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
        const originalCardPrice = parseFloat(row.dataset?.originalCardPrice || '0') || 0;
        const originalCardDiscount = row.dataset?.originalCardDiscount || '';

        if (originalCardPrice > 0.000001 && discountInput instanceof HTMLInputElement && finalPriceInput instanceof HTMLInputElement) {
            // 有原始应用金额卡的折后价：恢复至此
            suppressMoneyCardConflict = true;
            discountInput.value = originalCardDiscount;
            finalPriceInput.value = originalCardPrice.toFixed(2);
            suppressMoneyCardConflict = false;
        } else {
            // 无应用金额卡：恢复至100%
            const originalPriceText = row.querySelector('.col-original')?.textContent || '';
            const originalPrice = parseFloat(originalPriceText.replace(/[^0-9.]/g, '')) || 0;
            const buyInput = row.querySelector('input[data-field="buy"], input[data-field="buyQty"]');
            const quantity = Math.max(1, Math.round(Number(buyInput?.value || 1)));
            const preDiscountTotal = originalPrice * quantity;
            suppressMoneyCardConflict = true;
            if (discountInput instanceof HTMLInputElement) {
                discountInput.value = '100';
            }
            if (finalPriceInput instanceof HTMLInputElement) {
                finalPriceInput.value = preDiscountTotal.toFixed(2);
            }
            suppressMoneyCardConflict = false;
        }
    });

    // 重新计算所有金额卡划扣金额
    normalizeAndRenderMoneyCards();
    updateOrderSummary();
    closeWholeOrderChangePopover();
    showToast('已移除商品优惠，恢复至原始价格');
}

function redistributeWholeOrderDiscount(wholeOrderDiscountAmount) {
    if (!(wholeOrderDiscountAmount > 0.000001)) return;

    // 设置转换守卫，抑制重分摊中间态触发的弹窗闪现
    window.__wholeOrderTransitioning = true;

    const rows = document.querySelectorAll('.item-row');
    const allRows = Array.from(rows);

    // 先还原各行原始应付金额（抵消上一次分摊），再读取 remainingPayable 避免数据累积
    allRows.forEach(row => {
        const prevShare = parseFloat(row.dataset.wholeOrderShareDiscount || '0') || 0;
        if (prevShare > 0.000001) {
            const actionRow = findActionRowForItemRow(row);
            const payableEl = actionRow ? actionRow.querySelector('.item-payable-val') : null;
            if (payableEl) {
                const currentPayable = parseFloat(payableEl.textContent.replace('¥', '') || '0') || 0;
                payableEl.textContent = '¥' + roundMoney2(currentPayable + prevShare).toFixed(2);
            }
        }
        row.removeAttribute('data-whole-order-modified');
        row.dataset.wholeOrderShareDiscount = '0';
        row.style.removeProperty('--share-discount-amount');
        const shareAmountSpan = row.querySelector('.share-discount-amount');
        if (shareAmountSpan) shareAmountSpan.textContent = '';
    });

    let totalRemainingPayable = 0;
    const rowDataList = [];

    allRows.forEach(row => {
        // 赠品（应付金额为0）不参与整单优惠分摊
        const finalPriceInput = row.querySelector('[data-field="finalPrice"]');
        const finalPrice = parseFloat(finalPriceInput?.value || '0') || 0;
        if (!(finalPrice > 0.000001)) return;

        const actionRow = findActionRowForItemRow(row);

        const moneyCardsStr = row.dataset.moneycards || '[]';
        let moneyCards = [];
        try { moneyCards = JSON.parse(moneyCardsStr); } catch (e) { moneyCards = []; }

        const originalPriceText = row.querySelector('.col-original')?.textContent || '¥0';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const qtyEl = row.querySelector('input[data-field="buyQty"]') || row.querySelector('input[data-field="buy"]');
        const buyQty = Math.max(0, parseInt(String(qtyEl?.value || '0'), 10) || 0);
        const baseTotal = originalPrice * buyQty;

        const payableEl = actionRow ? actionRow.querySelector('.item-payable-val') : null;
        const remainingPayable = (moneyCards.length > 0)
            ? (payableEl ? parseFloat(payableEl.textContent.replace('¥', '') || '0') || 0 : 0)
            : baseTotal;

        rowDataList.push({
            row, remainingPayable, moneyCards, baseTotal, buyQty
        });

        if (remainingPayable > 0.000001) {
            totalRemainingPayable += remainingPayable;
        }
    });

    const distributable = rowDataList.filter(function(d) {
        return d.remainingPayable > 0.000001 && totalRemainingPayable > 0.000001;
    });

    if (distributable.length > 0) {
        var allocatedSum = 0;
        distributable.forEach(function(data, idx) {
            var shareRatio = data.remainingPayable / totalRemainingPayable;
            var shareAmount;
            if (idx === distributable.length - 1) {
                shareAmount = roundMoney2(wholeOrderDiscountAmount - allocatedSum);
            } else {
                shareAmount = Math.floor(wholeOrderDiscountAmount * shareRatio * 100) / 100;
                allocatedSum = roundMoney2(allocatedSum + shareAmount);
            }
            shareAmount = Math.max(0, shareAmount);
            data._shareAmount = shareAmount;
        });

        distributable.forEach(function(data) {
            var shareAmount = data._shareAmount || 0;

            data.row.removeAttribute('data-user-discount-override');
            data.row.dataset.wholeOrderModified = '1';
            data.row.dataset.wholeOrderShareDiscount = shareAmount.toFixed(2);
            data.row.style.setProperty('--share-discount-amount', shareAmount.toFixed(2));

            var newFinalPrice;
            var newDiscount;

            var totalCardDeduct = 0;
            data.moneyCards.forEach(function(card) {
                totalCardDeduct += parseFloat(card.amount || '0') || 0;
            });

            if (data.moneyCards.length > 0) {
                newFinalPrice = data.remainingPayable + totalCardDeduct - shareAmount;
                newDiscount = data.baseTotal > 0 ? (newFinalPrice / data.baseTotal) * 100 : 100;
            } else {
                newFinalPrice = data.baseTotal - shareAmount;
                newDiscount = data.baseTotal > 0 ? (newFinalPrice / data.baseTotal) * 100 : 100;
            }

            newFinalPrice = Math.max(0, newFinalPrice);
            newDiscount = Math.max(0, Math.min(100, newDiscount));

            const finalPriceInput = data.row.querySelector('[data-field="finalPrice"]');
            if (finalPriceInput) {
                const oldFinalPrice = finalPriceInput.value;
                finalPriceInput.value = newFinalPrice.toFixed(2);
                logProductFieldChange(data.row, 'finalPrice', oldFinalPrice, newFinalPrice.toFixed(2), 'redistributeWholeOrderDiscount');
                finalPriceInput.disabled = true;
                finalPriceInput.style.opacity = '0.6';
                finalPriceInput.readOnly = true;
            }

            const discountInput = data.row.querySelector('[data-field="discount"]');
            if (discountInput) {
                const oldDiscount = discountInput.value;
                discountInput.value = String(Math.round(newDiscount));
                discountInput.setAttribute('value', String(Math.round(newDiscount)));
                logProductFieldChange(data.row, 'discount', oldDiscount, String(Math.round(newDiscount)), 'redistributeWholeOrderDiscount');
                discountInput.disabled = true;
                discountInput.style.opacity = '0.6';
                discountInput.readOnly = true;
            }

            // 同步置灰折扣包裹层
            const discountWrap = data.row.querySelector('.discount-wrapper');
            if (discountWrap) discountWrap.classList.add('is-readonly');

            const actionRow = findActionRowForItemRow(data.row);
            const payableEl = actionRow ? actionRow.querySelector('.item-payable-val') : null;
            if (payableEl) {
                const rowPayable = data.moneyCards.length > 0 ? Math.max(0, newFinalPrice - totalCardDeduct) : newFinalPrice;
                payableEl.textContent = '¥' + rowPayable.toFixed(2);
            }

            const shareAmountSpan = data.row.querySelector('.share-discount-amount');
            if (shareAmountSpan) shareAmountSpan.textContent = '-¥' + shareAmount.toFixed(2);

            delete data._shareAmount;
        });
    }

    // 未分摊到整单优惠的行（remainingPayable=0）也要置灰，标记为整单改价不可编辑
    rowDataList.forEach(function(data) {
        if (data.remainingPayable > 0.000001) return; // 已在 distributable 中处理
        data.row.dataset.wholeOrderModified = '1';
        data.row.dataset.wholeOrderShareDiscount = '0';
        data.row.removeAttribute('data-user-discount-override');

        const finalPriceInput = data.row.querySelector('[data-field="finalPrice"]');
        if (finalPriceInput instanceof HTMLInputElement) {
            finalPriceInput.disabled = true;
            finalPriceInput.style.opacity = '0.6';
            finalPriceInput.readOnly = true;
        }
        const discountInput = data.row.querySelector('[data-field="discount"]');
        if (discountInput instanceof HTMLInputElement) {
            discountInput.disabled = true;
            discountInput.style.opacity = '0.6';
            discountInput.readOnly = true;
        }
        const discountWrap = data.row.querySelector('.discount-wrapper');
        if (discountWrap) discountWrap.classList.add('is-readonly');
    });

    normalizeAndRenderMoneyCards();
}

function applyWholeOrderChangeFromPopover() {
    const amountInput = document.getElementById('wocAmountInput');
    if (!amountInput) return;

    updateOrderSummary();
    const maxDiscountAmount = roundMoney2(Math.max(0, sumBaseFinalWithMoneyCard() - sumWholeOrderChangeMoneyCardUsed()));

    const sanitized = sanitizePriceString(amountInput.value, 2);
    let discountAmount = clampNumber(parseFloat(sanitized || '0') || 0, 0, maxDiscountAmount);

    // 优惠金额不能超过最大可优惠金额
    if (discountAmount - 0.000001 > maxDiscountAmount) {
        renderWholeOrderChangeTip({ error: true });
        const originAmt = amountInput.dataset ? String(amountInput.dataset.wocOrigin || '') : '';
        if (originAmt !== '') amountInput.value = originAmt;
        scheduleWholeOrderChangePopoverReposition();
        return;
    }

    discountAmount = roundMoney2(discountAmount);
    closeWholeOrderChangePopover();

    wholeOrderChangeState.enabled = true;
    wholeOrderChangeState.discountAmount = discountAmount;

    updateOrderSummary();

    // 整单应收 = 折后总价 - 优惠金额
    const baseFinal = Number(orderSummaryCache?.baseFinal || 0);
    const displayFinal = roundMoney2(Math.max(0, baseFinal - discountAmount));
    wholeOrderChangeState.amount = displayFinal;

    if (discountAmount > 0.000001) {
        redistributeWholeOrderDiscount(discountAmount);
    }

    const discountAmountInput = document.getElementById('orderDiscountAmountInput');
    if (discountAmountInput) discountAmountInput.value = discountAmount.toFixed(2);

    amountInput.value = discountAmount.toFixed(2);
}

document.addEventListener('input', function (e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.id === 'wocAmountInput') {
        el.value = sanitizePriceString(el.value, 2);
        scheduleWholeOrderChangePopoverReposition();
        renderWholeOrderChangeTip({ error: false });
        return;
    }
});

document.addEventListener('blur', function (e) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (el.id !== 'wocAmountInput') return;

    updateOrderSummary();
    const maxDiscountAmount = roundMoney2(Math.max(0, sumBaseFinalWithMoneyCard() - sumWholeOrderChangeMoneyCardUsed()));

    const sanitized = sanitizePriceString(el.value, 2);
    const discountAmount = clampNumber(parseFloat(sanitized || '0') || 0, 0, maxDiscountAmount);
    el.value = discountAmount.toFixed(2);
    scheduleWholeOrderChangePopoverReposition();
    renderWholeOrderChangeTip({ error: false });
}, true);

document.getElementById('wholeOrderChangeBtn')?.addEventListener('click', openWholeOrderChangePopover);
document.getElementById('wocCancelBtn')?.addEventListener('click', closeWholeOrderChangePopover);
document.getElementById('wocConfirmBtn')?.addEventListener('click', applyWholeOrderChangeFromPopover);
document.getElementById('wocRemoveBtn')?.addEventListener('click', removeWholeOrderChange);
document.getElementById('wocRemoveProductBtn')?.addEventListener('click', removeProductDiscounts);



// ========== 全部消耗功能（带防抖）==========
let consumeAllTimer = null;
const CONSUME_DEBOUNCE_DELAY = 1000; // 防抖延迟1秒

function consumeAllService(btn) {
    if (isGuestModeActive()) return;
    if (consumeAllTimer) return;
    consumeAllTimer = setTimeout(() => {
        consumeAllTimer = null;
    }, CONSUME_DEBOUNCE_DELAY);

    btn.disabled = true;
    const originText = btn.textContent;
    btn.textContent = '处理中...';

    const table = document.getElementById('service-table');
    const rows = table?.querySelectorAll('tbody tr.item-row') || [];

    if (rows.length === 0) {
        showToast('暂无疗程项目');
        btn.disabled = false;
        btn.textContent = originText;
        return;
    }

    let updatedCount = 0;
    rows.forEach((row, index) => {
        const buyQty = parseInt(row.querySelector('[data-field="buy"]')?.value || '0', 10) || 0;
        const giftQty = parseInt(row.querySelector('[data-field="gift"]')?.value || '0', 10) || 0;
        const giftFlag = row.querySelector('.gift-flag-checkbox');
        const total = (giftFlag instanceof HTMLInputElement && giftFlag.checked) ? buyQty : (buyQty + giftQty);
        const consumeInput = row.querySelector('[data-field="consume"]');
        if (!consumeInput) return;
        consumeInput.value = String(total);
        consumeInput.dispatchEvent(new Event('input', { bubbles: true }));

        const consumeCell = row.querySelector('.col-consume');
        consumeCell?.classList.add('consume-highlight');
        setTimeout(() => consumeCell?.classList.remove('consume-highlight'), 600 + (index * 100));

        updatedCount += 1;
    });

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originText;
    }, CONSUME_DEBOUNCE_DELAY);

    showToast('已更新 ' + updatedCount + ' 项疗程的消耗数量');
}

// ========== 全部拿走功能（带防抖）==========
let takeAllTimer = null;
const TAKE_DEBOUNCE_DELAY = 1000; // 防抖延迟1秒

function takeAllProduct(btn) {
    if (isGuestModeActive()) return;
    if (takeAllTimer) return;
    takeAllTimer = setTimeout(() => {
        takeAllTimer = null;
    }, TAKE_DEBOUNCE_DELAY);

    if (btn) btn.disabled = true;
    const originText = btn ? btn.textContent : '';
    if (btn) btn.textContent = '处理中...';

    const runForRow = (row) => {
        const buy = parseInt(row.querySelector('input[data-field="buy"]')?.value || '0', 10) || 0;
        const gift = parseInt(row.querySelector('input[data-field="gift"]')?.value || '0', 10) || 0;
        const giftFlag = row.querySelector('.gift-flag-checkbox');
        const rawTotal = (giftFlag instanceof HTMLInputElement && giftFlag.checked) ? buy : (buy + gift);
        const total = Math.max(0, rawTotal);
        const consumeInput = row.querySelector('input[data-field="consume"]');
        if (!consumeInput) return false;
        const min = parseInt(consumeInput.min || '0', 10);
        const max = parseInt(consumeInput.max || '999', 10);
        consumeInput.value = String(Math.max(min, Math.min(max, total)));
        consumeInput.dispatchEvent(new Event('input', { bubbles: true }));

        const consumeCell = row.querySelector('.col-consume');
        consumeCell?.classList.add('consume-highlight');
        setTimeout(() => consumeCell?.classList.remove('consume-highlight'), 600);
        return true;
    };

    let updatedCount = 0;
    const singleRow = btn?.closest?.('tr.item-row');
    if (singleRow && (singleRow.getAttribute('data-item-type') || '') === 'product') {
        if (runForRow(singleRow)) updatedCount += 1;
    } else {
        const rows = document.querySelectorAll('#product-table-body tr.item-row');
        rows.forEach(row => {
            if ((row.getAttribute('data-item-type') || '') !== 'product') return;
            if (runForRow(row)) updatedCount += 1;
        });
    }

    setTimeout(() => {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originText;
        }
    }, TAKE_DEBOUNCE_DELAY);

    showToast('已更新 ' + updatedCount + ' 项产品的拿走数量');
}

function openTableRemarkModal(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const itemName = itemRow?.querySelector('.col-name')?.textContent || '';
    currentRemarkBtn = btn;
    const remarkModalOverlay = document.getElementById('remarkModalOverlay');
    const remarkModalTextarea = document.getElementById('remarkModalTextarea');
    const remarkModalTitle = document.querySelector('.remark-modal-title');

    remarkModalTitle.textContent = itemName ? '备注 - ' + itemName : '备注';
    remarkModalTextarea.value = btn.dataset.remark || '';
    remarkModalOverlay.classList.add('show');
}



// ========== 备注弹窗功能 ==========
let currentRemarkBtn = null;


function closeRemarkModal() {
    const remarkModalOverlay = document.getElementById('remarkModalOverlay');
    remarkModalOverlay.classList.remove('show');
    currentRemarkBtn = null;
}

function saveRemark() {
    const remarkModalTextarea = document.getElementById('remarkModalTextarea');
    const remark = remarkModalTextarea.value.trim();

    if (currentRemarkBtn) {
        if (remark) {
            currentRemarkBtn.setAttribute('data-remark', remark);
            currentRemarkBtn.classList.add('has-content');
            showToast('备注已保存');
        } else {
            currentRemarkBtn.removeAttribute('data-remark');
            currentRemarkBtn.classList.remove('has-content');
        }

        const courseId = Number(currentRemarkBtn.getAttribute('data-course-id') || 0);
        if (courseId) {
            const course = selectedCourseCards.find(c => c.id === courseId);
            if (course) {
                course.remark = remark;
            }
        }

        const amountCardId = Number(currentRemarkBtn.getAttribute('data-amount-card-id') || 0);
        if (amountCardId) {
            const card = selectedAmountCards.find(c => c.id === amountCardId);
            if (card) {
                card.remark = remark;
            }
        }
    }

    closeRemarkModal();
}

// 备注弹窗事件绑定
document.getElementById('remarkModalClose')?.addEventListener('click', closeRemarkModal);
document.getElementById('remarkModalCancel')?.addEventListener('click', closeRemarkModal);
document.getElementById('remarkModalConfirm')?.addEventListener('click', saveRemark);
document.getElementById('remarkModalOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) closeRemarkModal();
});

function openAmountCardRuleModal(encId) {
    let id = '';
    try { id = decodeURIComponent(String(encId || '')); } catch (e) { id = String(encId || ''); }
    const card = selectedAmountCards.find(c => String(c.id) === String(id));
    if (!card || !String(card.name || '').trim()) {
        showToast('未找到有效金额卡');
        return;
    }

    const titleEl = document.getElementById('amountCardRuleModalTitle');
    const bodyEl = document.getElementById('amountCardRuleModalBody');
    if (titleEl) titleEl.textContent = card.name;
    if (bodyEl) {
        const scope = card.scope || '全店通用';
        const rules = card.rules || '具体使用规则以门店设置为准';
        const limit = card.limitations || '不可与部分活动叠加，详询门店';
        bodyEl.innerHTML = `
            <div style="margin-bottom:8px;"><span style="color:#666;">适用范围：</span>${scope}</div>
            <div style="margin-bottom:8px;"><span style="color:#666;">有效期：</span>${card.validity || '-'}</div>
            <div style="margin-bottom:8px;"><span style="color:#666;">使用规则：</span>${rules}</div>
            <div><span style="color:#666;">使用限制：</span>${limit}</div>
        `;
    }

    document.getElementById('amountCardRuleModalOverlay')?.classList.add('show');
}

function closeAmountCardRuleModal() {
    document.getElementById('amountCardRuleModalOverlay')?.classList.remove('show');
}

document.getElementById('amountCardRuleModalClose')?.addEventListener('click', closeAmountCardRuleModal);
document.getElementById('amountCardRuleModalOk')?.addEventListener('click', closeAmountCardRuleModal);
document.getElementById('amountCardRuleModalOverlay')?.addEventListener('click', function (e) {
    if (e.target === this) closeAmountCardRuleModal();
});

// 备注输入框支持Enter快捷保存
document.getElementById('remarkModalTextarea')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        saveRemark();
    }
});

// ========== 添加服务弹窗相关 ==========
// 模拟服务商品数据
const serviceProducts = [
    { id: 1, name: '单次皮肤护理', category: 'facial', spec: '面部护理', price: 198 },
    { id: 2, name: '深层清洁护理', category: 'facial', spec: '深层清洁', price: 268 },
    { id: 3, name: '补水导入护理', category: 'facial', spec: '补水保湿', price: 238 },
    { id: 4, name: '抗衰紧致护理', category: 'facial', spec: '抗衰修复', price: 358 },
    { id: 5, name: '美白淡斑护理', category: 'facial', spec: '美白嫩肤', price: 298 },
    { id: 6, name: '身体推油护理', category: 'body', spec: '身体放松', price: 188 },
    { id: 7, name: '背部舒缓护理', category: 'body', spec: '背部SPA', price: 218 },
    { id: 8, name: '肩颈放松护理', category: 'body', spec: '肩颈调理', price: 168 },
    { id: 9, name: '腿部放松护理', category: 'body', spec: '腿部护理', price: 158 },
    { id: 10, name: '全身SPA护理', category: 'spa', spec: '全身放松', price: 398 },
    { id: 11, name: '香薰SPA护理', category: 'spa', spec: '香薰疗法', price: 328 },
    { id: 12, name: '热石SPA护理', category: 'spa', spec: '热石疗法', price: 358 },
    { id: 13, name: '经络疏通护理', category: 'special', spec: '经络调理', price: 248 },
    { id: 14, name: '卵巢保养护理', category: 'special', spec: '私密护理', price: 288 },
    { id: 15, name: '胸部护理', category: 'special', spec: '胸部保养', price: 268 },
];

// 已选商品列表
let selectedServices = [];
// 最近搜索列表
let recentSearches = JSON.parse(localStorage.getItem('addServiceRecentSearches') || '[]');

// ========== 添加次卡弹窗相关 ==========
// 模拟次卡数据
const courseCards = [
    {
        id: 1,
        name: '水润焕肤套餐',
        category: 'beauty',
        cardType: 'limited', // limited有限次卡, unlimited通卡
        image: '',
        price: 2999,
        validity: '自首次消费起1年有效',
        products: [
            { type: 'care', name: '深层清洁护理', duration: '60分钟', price: 268, buyQty: 1, giftQty: 0 },
            { type: 'care', name: '水光针护理', duration: '45分钟', price: 398, buyQty: 1, giftQty: 0 },
            { type: 'care', name: '补水导入护理', duration: '30分钟', price: 238, buyQty: 1, giftQty: 1 },
        ],
        homeProducts: [
            { type: 'home', name: '补水精华液', spec: '30ml', price: 198, buyQty: 1, giftQty: 0 },
        ],
        cardItems: [
            { type: 'card', name: '面部护理次卡', cardType: '有限次卡', price: 1200, giftQty: 2 },
            { type: 'card', name: '通享卡', cardType: '通卡', price: 5000, giftQty: 0 },
        ]
    },
    {
        id: 2,
        name: '精致美甲套餐',
        category: 'nail',
        cardType: 'unlimited',
        image: '',
        price: 1999,
        validity: '自首次消费起1年有效',
        products: [
            { type: 'care', name: '基础美甲护理', duration: '30分钟', price: 88, buyQty: 1, giftQty: 1 },
            { type: 'care', name: '手足护理套餐', duration: '60分钟', price: 168, buyQty: 1, giftQty: 1 },
        ],
        homeProducts: [
            { type: 'home', name: '护手霜', spec: '50g', price: 68, buyQty: 2, giftQty: 1 },
        ],
        cardItems: [
            { type: 'card', name: '美甲无限次卡', cardType: '通卡', price: 3000, giftQty: 1 },
        ]
    },
    {
        id: 3,
        name: '全身SPA套餐',
        category: 'beauty',
        cardType: 'limited',
        image: '',
        price: 5999,
        validity: '自首次消费起2年有效',
        products: [
            { type: 'care', name: '全身推拿按摩', duration: '90分钟', price: 398, buyQty: 1, giftQty: 1 },
            { type: 'care', name: '背部舒缓护理', duration: '45分钟', price: 268, buyQty: 1, giftQty: 1 },
            { type: 'care', name: '头部放松护理', duration: '30分钟', price: 188, buyQty: 1, giftQty: 1 },
        ],
        homeProducts: [
            { type: 'home', name: '按摩精油', spec: '100ml', price: 128, buyQty: 1, giftQty: 1 },
        ],
        cardItems: [
            { type: 'card', name: '身体护理次卡', cardType: '有限次卡', price: 2500, giftQty: 3 },
        ]
    },
    {
        id: 4,
        name: '美睫套餐',
        category: 'nail',
        cardType: 'limited',
        image: '',
        price: 1299,
        validity: '自首次消费起1年有效',
        products: [
            { type: 'care', name: '日式美睫', duration: '45分钟', price: 168, buyQty: 1, giftQty: 2 },
            { type: 'care', name: '睫毛加密', duration: '30分钟', price: 128, buyQty: 1, giftQty: 1 },
        ],
        homeProducts: [],
        cardItems: []
    },
];

const amountCardCards = [
    {
        id: 301,
        name: '储值金卡',
        category: 'amountCard',
        cardType: 'amount',
        image: '',
        price: 3000,
        rechargeAmount: 3000,
        giftAmount: 100,
        validity: '自购买起1年有效',
        scope: '全店通用（项目/产品）',
        rules: '可用于全店项目/产品抵扣',
        limitations: '部分促销不可叠加，不可退款不可转赠',
        products: [
            { type: 'care', name: '基础面部护理', duration: '60分钟', price: 198, buyQty: 1, giftQty: 1 }
        ],
        homeProducts: [
            { type: 'home', name: '卸妆湿巾', spec: '20片装', price: 29, buyQty: 1, giftQty: 1 }
        ],
        cardItems: [
            { type: 'card', name: '肩颈护理次卡', cardType: '有限次卡', price: 399, giftQty: 1 }
        ]
    },
    {
        id: 302,
        name: '储值钻石卡',
        category: 'amountCard',
        cardType: 'amount',
        image: '',
        price: 5000,
        rechargeAmount: 5000,
        giftAmount: 300,
        validity: '自购买起2年有效',
        scope: '全店通用（项目/产品）',
        rules: '可用于全店项目/产品抵扣，可与会员折扣叠加',
        limitations: '不可退款不可转赠',
        products: [
            { type: 'care', name: '深层清洁护理', duration: '60分钟', price: 268, buyQty: 0, giftQty: 1 },
            { type: 'care', name: '肩颈放松护理', duration: '45分钟', price: 168, buyQty: 0, giftQty: 1 }
        ],
        homeProducts: [
            { type: 'home', name: '按摩精油', spec: '100ml', price: 128, buyQty: 0, giftQty: 1 }
        ],
        cardItems: []
    },
    {
        id: 303,
        name: '新客体验储值卡',
        category: 'amountCard',
        cardType: 'amount',
        image: '',
        price: 1000,
        rechargeAmount: 1000,
        giftAmount: 0,
        validity: '自购买起1年有效',
        scope: '仅限新客使用',
        rules: '仅限首次到店客户使用',
        limitations: '不可退款不可转赠',
        products: [
            { type: 'care', name: '补水导入护理', duration: '45分钟', price: 238, buyQty: 0, giftQty: 1 }
        ],
        homeProducts: [],
        cardItems: []
    },
];

// 次卡最近搜索列表
let courseRecentSearches = JSON.parse(localStorage.getItem('addCourseRecentSearches') || '[]');
let amountCardRecentSearches = JSON.parse(localStorage.getItem('addAmountCardRecentSearches') || '[]');
// 当前选中的次卡
let selectedCourseCard = null;
let selectedAmountCard = null;
// 已选择的次卡列表（用于页面展示）
let selectedCourseCards = [];
let selectedAmountCards = [];
let courseDetailMode = 'edit';
let customCourseImageObjectUrl = null;
let customCourseTableObservers = [];
let customCourseBenefitModalType = null;
let customCourseBenefitTargetMode = 'buy';
let editingCustomCourseId = null;
let editingCustomAmountCardId = null;
let addCourseModalKind = 'course';
let customCourseContextKind = 'course';

// DOM元素
const addCourseModalOverlay = document.getElementById('addCourseModalOverlay');
const addCourseModalClose = document.getElementById('addCourseModalClose');
const addCourseSearchInput = document.getElementById('addCourseSearchInput');
const addCourseRecentList = document.getElementById('addCourseRecentList');
const addCourseCardList = document.getElementById('addCourseCardList');
const addCourseRightPanel = document.getElementById('addCourseRightPanel');
const addCourseCustomBtn = document.querySelector('.add-course-custom-btn.primary');
const addCourseModalTitleEl = document.querySelector('#addCourseModalOverlay .add-course-modal-title');
const addCourseTabsEl = document.querySelector('#addCourseModalOverlay .add-course-tabs');
const defaultCourseTabsHtml = addCourseTabsEl ? addCourseTabsEl.innerHTML : '';

function bindAddCourseTabEvents() {
    document.querySelectorAll('.add-course-tab-item').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.add-course-tab-item').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            renderCourseCardList(category, addCourseSearchInput.value);
        });
    });
}

function setAddCourseModalKind(kind) {
    addCourseModalKind = kind || 'course';
    if (addCourseModalTitleEl) addCourseModalTitleEl.textContent = addCourseModalKind === 'amountCard' ? '添加金额卡' : '添加次卡';
    if (addCourseSearchInput) addCourseSearchInput.placeholder = addCourseModalKind === 'amountCard' ? '搜索金额卡名称' : '搜索次卡名称';
    if (addCourseCustomBtn) addCourseCustomBtn.textContent = addCourseModalKind === 'amountCard' ? '自定义金额卡' : '自定义次卡';

    if (addCourseTabsEl) {
        if (addCourseModalKind === 'amountCard') {
            addCourseTabsEl.innerHTML = '<div class="add-course-tab-item active" data-category="amountCard">金额卡</div>';
        } else {
            addCourseTabsEl.innerHTML = defaultCourseTabsHtml;
        }
        bindAddCourseTabEvents();
    }
}

// 打开添加次卡弹窗
function openAddCourseModal(kind = 'course') {
    if (!guardAddEntryForCardOpConflict()) return;
    setAddCourseModalKind(kind);
    addCourseModalOverlay.classList.add('show');
    renderCourseRecentSearches();
    renderCourseCardList(document.querySelector('.add-course-tab-item.active')?.dataset.category || 'all');

    selectedCourseCard = null;
    selectedAmountCard = null;
    courseDetailMode = 'edit';
    renderCourseDetail();
}

// 关闭添加次卡弹窗
function closeAddCourseModal() {
    addCourseModalOverlay.classList.remove('show');
    editingCustomCourseId = null;
    editingCustomAmountCardId = null;
    customCourseBenefitModalType = null;
    courseDetailMode = 'edit';
    setAddCourseModalKind('course');
}

// 渲染次卡最近搜索
function renderCourseRecentSearches() {
    const maxRecent = 8;
    const recentItems = (addCourseModalKind === 'amountCard' ? amountCardRecentSearches : courseRecentSearches).slice(0, maxRecent);

    if (recentItems.length === 0) {
        addCourseRecentList.innerHTML = '<span style="color: var(--neutral-400); font-size: 12px;">暂无搜索记录</span>';
        return;
    }

    addCourseRecentList.innerHTML = recentItems.map(keyword => {
        const safe = String(keyword || '');
        const enc = encodeURIComponent(safe);
        const fn = addCourseModalKind === 'amountCard' ? 'searchAmountCardByRecent' : 'searchCourseByRecent';
        return `<span class="recent-search-item" data-k="${enc}" onclick="${fn}(decodeURIComponent(this.getAttribute('data-k')))">${safe}</span>`;
    }).join('');
}

// 通过最近搜索词搜索
function searchCourseByRecent(keyword) {
    addCourseSearchInput.value = keyword;
    renderCourseCardList('all', keyword);
}

function searchAmountCardByRecent(keyword) {
    addCourseSearchInput.value = keyword;
    renderCourseCardList('amountCard', keyword);
}

// 渲染次卡列表
function renderCourseCardList(category = 'all', keyword = '') {
    if (addCourseModalKind === 'amountCard') {
        let filtered = amountCardCards;
        if (keyword) filtered = filtered.filter(c => c.name.includes(keyword));
        addCourseCardList.innerHTML = filtered.map(card => `
            <div class="course-card-item ${selectedAmountCard && selectedAmountCard.id === card.id ? 'selected' : ''}"
                 onclick="selectAmountCard(${card.id})">
                <div class="course-card-name">${card.name}</div>
                <span class="course-card-badge badge-unlimited">金额卡</span>
            </div>
        `).join('');
        if (filtered.length === 0) addCourseCardList.innerHTML = '<div class="course-empty-hint">暂无匹配的金额卡</div>';
        return;
    }

    let filtered = courseCards;

    // 筛选类别
    if (category === 'limited') {
        filtered = filtered.filter(c => c.cardType === 'limited');
    } else if (category === 'unlimited') {
        filtered = filtered.filter(c => c.cardType !== 'limited');
    }

    // 筛选关键词
    if (keyword) {
        filtered = filtered.filter(c => c.name.includes(keyword));
    }

    addCourseCardList.innerHTML = filtered.map(card => `
        <div class="course-card-item ${selectedCourseCard && selectedCourseCard.id === card.id ? 'selected' : ''}"
             onclick="selectCourseCard(${card.id})">
            <div class="course-card-name">${card.name}</div>
            <span class="course-card-badge ${card.cardType === 'limited' ? 'badge-limited' : 'badge-unlimited'}">
                ${card.cardType === 'limited' ? '有限次卡' : '通卡'}
            </span>
        </div>
    `).join('');

    if (filtered.length === 0) {
        addCourseCardList.innerHTML = '<div class="course-empty-hint">暂无匹配的次卡</div>';
    }
}

// 选择次卡
function selectCourseCard(cardId) {
    const card = courseCards.find(c => c.id === cardId);
    if (card) {
        selectedCourseCard = card;
        renderCourseCardList(document.querySelector('.add-course-tab-item.active')?.dataset.category || 'all');
        renderCourseDetail();
    }
}

function selectAmountCard(cardId) {
    const card = amountCardCards.find(c => c.id === cardId);
    if (card) {
        selectedAmountCard = card;
        renderCourseCardList('amountCard', addCourseSearchInput.value.trim());
        renderCourseDetail();
    }
}

function setCourseDetailMode(mode) {
    if (mode === 'view') {
        if (!selectedCourseCard) return;
        courseDetailMode = 'view';
        renderCourseDetail();
        return;
    }
    if (mode === 'custom') {
        courseDetailMode = 'custom';
        selectedCourseCard = null;
        selectedAmountCard = null;
        if (addCourseModalKind === 'amountCard') {
            renderCustomAmountCardDetail();
        } else {
            renderCustomCourseDetail();
        }
        return;
    }
    courseDetailMode = 'edit';
    renderCourseDetail();
}



// 渲染次卡明细
function renderCourseDetail() {
    if (addCourseModalKind === 'amountCard') {
        if (!selectedAmountCard) {
            addCourseRightPanel.innerHTML = '<div class="add-course-empty-hint">请选择左侧金额卡查看详情</div>';
            applyBenefitTableVisibilityForAddCourseModal();
            return;
        }
        const card = selectedAmountCard;
        const canCustomize = hasPositiveBenefitForCustomize(card, 'amountCard');
        addCourseRightPanel.innerHTML = `
            <div class="course-detail-header">
                <div class="course-detail-image">
                    <span>卡图片</span>
                </div>
                <div class="course-detail-info">
                    <div class="course-detail-name">${card.name}</div>
                    <div class="course-detail-validity">${card.validity}</div>
                    <div class="course-detail-price-row">
                        <span class="course-detail-validity">售卖价格</span>
                        <div class="course-detail-price-input-wrap">
                            <span class="course-detail-price-symbol">¥</span>
                            <span class="course-detail-price">${Number(card.price || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="course-detail-price-row">
                        <span class="course-detail-validity">充值金额</span>
                        <div class="course-detail-price-input-wrap">
                            <span class="course-detail-price-symbol">¥</span>
                            <span class="course-detail-price">${Number(card.rechargeAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="course-detail-price-row">
                        <span class="course-detail-validity">赠送金额</span>
                        <div class="course-detail-price-input-wrap">
                            <span class="course-detail-price-symbol">¥</span>
                            <span class="course-detail-price">${Number(card.giftAmount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="course-detail-action">
                    <button class="course-confirm-btn primary" onclick="confirmAmountCardSelection()">添加</button>
                    <button class="course-header-action-btn" onclick="goCustomizeFromCourseDetail()" ${canCustomize ? '' : 'disabled'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                        </svg>
                        <span>去定制</span>
                    </button>
                </div>
            </div>
            <div class="course-detail-tables">
                <div class="course-table-section">
                    <div class="benefit-module-title">赠送权益</div>
                    <div class="benefit-subtables">
                        <div class="benefit-subtable">
                            <div class="course-table-title-row">
                                <div class="course-table-title">单次护理</div>
                            </div>
                            <table class="course-detail-table">
                                <thead>
                                    <tr>
                                        <th>商品名称</th>
                                        <th>服务时长</th>
                                        <th>服务价格</th>
                                        <th>赠送数量</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(card.products || []).length ? (card.products || []).map(p => `
                                        <tr class="course-table-row" data-item-type="care">
                                            <td class="item-name">${p.name}</td>
                                            <td>${p.duration}</td>
                                            <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                            <td>${Number(p.giftQty || 0)}</td>
                                        </tr>
                                    `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                        <div class="benefit-subtable">
                            <div class="course-table-title-row">
                                <div class="course-table-title">居家产品</div>
                            </div>
                            <table class="course-detail-table">
                                <thead>
                                    <tr>
                                        <th>商品名称</th>
                                        <th>规格</th>
                                        <th>售卖价格</th>
                                        <th>赠送数量</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(card.homeProducts || []).length ? (card.homeProducts || []).map(p => `
                                        <tr class="course-table-row" data-item-type="home">
                                            <td class="item-name">${p.name}</td>
                                            <td>${p.spec}</td>
                                            <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                            <td>${Number(p.giftQty || 0)}</td>
                                        </tr>
                                    `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                        <div class="benefit-subtable">
                            <div class="course-table-title-row">
                                <div class="course-table-title">卡项</div>
                            </div>
                            <table class="course-detail-table">
                                <thead>
                                    <tr>
                                        <th>卡项名称</th>
                                        <th>卡项类型</th>
                                        <th>卡项价格</th>
                                        <th>赠送数量</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(card.cardItems || []).length ? (card.cardItems || []).map(p => `
                                        <tr class="course-table-row" data-item-type="card">
                                            <td class="item-name">${p.name}</td>
                                            <td>${p.cardType || '-'}</td>
                                            <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                            <td>${Number(p.giftQty || 0)}</td>
                                        </tr>
                                    `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        applyBenefitTableVisibilityForAddCourseModal();
        return;
    }

    if (!selectedCourseCard) {
        addCourseRightPanel.innerHTML = '<div class="add-course-empty-hint">请选择左侧次卡查看详情</div>';
        applyBenefitTableVisibilityForAddCourseModal();
        return;
    }

    const card = selectedCourseCard;
    const cardTypeText = card.cardType === 'limited' ? '有限次卡' : '通卡';
    const cardTypeBadgeClass = card.cardType === 'limited' ? 'badge-limited' : 'badge-unlimited';
    const canCustomize = hasPositiveBenefitForCustomize(card, 'course');

    addCourseRightPanel.innerHTML = `
        <div class="course-detail-header">
            <div class="course-detail-image">
                <span>卡图片</span>
            </div>
            <div class="course-detail-info">
                <div class="course-detail-name">${card.name}</div>
                <div class="course-detail-validity">${card.validity}</div>
                <div class="course-detail-price-row">
                    <span class="course-detail-validity">售卡价格</span>
                    <div class="course-detail-price-input-wrap">
                        <span class="course-detail-price-symbol">¥</span>
                        <span class="course-detail-price">${card.price}</span>
                    </div>
                </div>
                <div class="course-detail-type">
                    <span class="course-card-badge ${cardTypeBadgeClass}">${cardTypeText}</span>
                </div>
            </div>
            <div class="course-detail-action">
                <button class="course-confirm-btn primary" onclick="confirmCourseSelection()">添加</button>
                <button class="course-header-action-btn" onclick="goCustomizeFromCourseDetail()" ${canCustomize ? '' : 'disabled'}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                    </svg>
                    <span>去定制</span>
                </button>
            </div>
        </div>
        
        <div class="course-detail-tables">
            <div class="course-table-section">
                <div class="benefit-module-title">购买权益</div>
                <div class="benefit-subtables">
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">单次护理</div>
                        </div>
                        <table class="course-detail-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>服务时长</th>
                                    <th>服务价格</th>
                                    <th>购买数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(card.products || []).length ? (card.products || []).map(p => `
                                    <tr class="course-table-row" data-item-type="care">
                                        <td class="item-name">${p.name}</td>
                                        <td>${p.duration}</td>
                                        <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                        <td>${Number(p.buyQty || 0)}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">居家产品</div>
                        </div>
                        <table class="course-detail-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>规格</th>
                                    <th>售卖价格</th>
                                    <th>购买数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(card.homeProducts || []).length ? (card.homeProducts || []).map(p => `
                                    <tr class="course-table-row" data-item-type="home">
                                        <td class="item-name">${p.name}</td>
                                        <td>${p.spec}</td>
                                        <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                        <td>${Number(p.buyQty || 0)}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="course-table-section">
                <div class="benefit-module-title">赠送权益</div>
                <div class="benefit-subtables">
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">单次护理</div>
                        </div>
                        <table class="course-detail-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>服务时长</th>
                                    <th>服务价格</th>
                                    <th>赠送数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(card.products || []).length ? (card.products || []).map(p => `
                                    <tr class="course-table-row" data-item-type="care">
                                        <td class="item-name">${p.name}</td>
                                        <td>${p.duration}</td>
                                        <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                        <td>${Number(p.giftQty || 0)}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">居家产品</div>
                        </div>
                        <table class="course-detail-table">
                            <thead>
                                <tr>
                                    <th>商品名称</th>
                                    <th>规格</th>
                                    <th>售卖价格</th>
                                    <th>赠送数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(card.homeProducts || []).length ? (card.homeProducts || []).map(p => `
                                    <tr class="course-table-row" data-item-type="home">
                                        <td class="item-name">${p.name}</td>
                                        <td>${p.spec}</td>
                                        <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                        <td>${Number(p.giftQty || 0)}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">卡项</div>
                        </div>
                        <table class="course-detail-table">
                            <thead>
                                <tr>
                                    <th>卡项名称</th>
                                    <th>卡项类型</th>
                                    <th>卡项价格</th>
                                    <th>赠送数量</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(card.cardItems || []).length ? (card.cardItems || []).map(p => `
                                    <tr class="course-table-row" data-item-type="card">
                                        <td class="item-name">${p.name}</td>
                                        <td>${p.cardType || '-'}</td>
                                        <td>¥${Number(p.price || 0).toFixed(2)}</td>
                                        <td>${Number(p.giftQty || 0)}</td>
                                    </tr>
                                `).join('') : `<tr><td colspan="4" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    applyBenefitTableVisibilityForAddCourseModal();
}

function customCourseSanitizePriceInput(input) {
    const raw = String(input.value || '').replace(/[^\d.]/g, '');
    const parts = raw.split('.');
    const whole = parts[0] || '';
    const decimal = parts[1] ? parts[1].slice(0, 2) : '';
    input.value = decimal.length ? `${whole}.${decimal}` : whole;
}

function customCourseFormatPriceInput(input) {
    if (input.value === '') return;
    const num = Number(input.value);
    if (Number.isFinite(num)) {
        input.value = num.toFixed(2);
    } else {
        input.value = '';
    }
}

function ensureCustomCourseDefaultImage() {
    const img = document.getElementById('customCourseImagePreview');
    const hint = document.getElementById('customCourseImageHint');
    if (!(img instanceof HTMLImageElement)) return;
    if (img.getAttribute('src')) return;
    img.src = 'default_image.jpg';
    img.style.display = '';
    if (hint) hint.style.display = 'none';
}

function clearCustomCourseDraft() {
    const name = document.getElementById('customCourseName');
    const type = document.getElementById('customCourseType');
    const validity = document.getElementById('customCourseValidity');
    const price = document.getElementById('customCoursePrice');
    const rechargeAmount = document.getElementById('customAmountRechargeAmount');
    const giftAmount = document.getElementById('customAmountGiftAmount');

    if (name) name.value = '';
    if (type) type.value = 'limited';
    if (validity) validity.value = 'purchase';
    if (price) price.value = '';
    if (rechargeAmount) rechargeAmount.value = '';
    if (giftAmount) giftAmount.value = '';

    const careBody = document.getElementById('customCourseCareBody');
    const homeBody = document.getElementById('customCourseHomeBody');
    const cardBody = document.getElementById('customCourseCardBody');
    if (careBody) careBody.innerHTML = '';
    if (homeBody) homeBody.innerHTML = '';
    if (cardBody) cardBody.innerHTML = '';

    const input = document.getElementById('customCourseImageInput');
    const img = document.getElementById('customCourseImagePreview');
    const hint = document.getElementById('customCourseImageHint');
    if (input) input.value = '';
    if (img) {
        img.removeAttribute('src');
        img.style.display = 'none';
    }
    if (customCourseImageObjectUrl) {
        URL.revokeObjectURL(customCourseImageObjectUrl);
        customCourseImageObjectUrl = null;
    }
    ensureCustomCourseDefaultImage();

    updateCustomCourseTableHeaderVisibility();
}

function clearCustomCourseAndBackToList() {
    clearCustomCourseDraft();
    editingCustomCourseId = null;
    editingCustomAmountCardId = null;
    setCourseDetailMode('edit');
}

function updateCustomCourseTableHeaderVisibility() {
    const tables = document.querySelectorAll('.custom-course-table');
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        const hasRows = !!(tbody && tbody.querySelector('tr'));
        table.classList.toggle('is-empty', !hasRows);
    });
}

let customBenefitViewRenderRaf = 0;

function scheduleRenderCustomBenefitViews() {
    if (customBenefitViewRenderRaf) cancelAnimationFrame(customBenefitViewRenderRaf);
    customBenefitViewRenderRaf = requestAnimationFrame(() => {
        customBenefitViewRenderRaf = 0;
        renderCustomBenefitViews();
    });
}

function getCustomBenefitRowByKey(type, key) {
    const map = {
        care: document.getElementById('customCourseCareBody'),
        home: document.getElementById('customCourseHomeBody'),
        card: document.getElementById('customCourseCardBody')
    };
    const tbody = map[type];
    if (!tbody) return null;
    const k = String(key || '');
    return Array.from(tbody.querySelectorAll('tr')).find(tr => String(tr.dataset.key || '') === k) || null;
}

function customCourseDeleteRowByKey(type, key) {
    const tr = getCustomBenefitRowByKey(type, key);
    if (tr) tr.remove();
    updateCustomCourseTableHeaderVisibility();
    scheduleRenderCustomBenefitViews();
}

function setCustomBenefitQtyByKey(type, key, field, inputEl) {
    const tr = getCustomBenefitRowByKey(type, key);
    if (!tr) return;
    const raw = inputEl && 'value' in inputEl ? String(inputEl.value || '') : '';
    const n = Math.max(0, Math.min(999, parseInt(raw || '0', 10) || 0));
    const canonical = tr.querySelector(`input[data-field="${field}"]`);
    if (canonical instanceof HTMLInputElement) {
        canonical.value = String(n);
        canonical.dispatchEvent(new Event('input', { bubbles: true }));
        canonical.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function onCustomBenefitQtyInput(inputEl, type, key, field) {
    customCourseSanitizeQtyInput(inputEl);
    setCustomBenefitQtyByKey(type, key, field, inputEl);
}

function onCustomBenefitQtyBlur(inputEl, type, key, field) {
    customCourseClampQtyInput(inputEl);
    setCustomBenefitQtyByKey(type, key, field, inputEl);
    scheduleRenderCustomBenefitViews();
}



function applyBenefitTableVisibilityForAddCourseModal() {
    const root = addCourseRightPanel;
    if (!root) return;
    const tablesRoot = root.querySelector('.course-detail-tables');
    if (!tablesRoot) return;

    const sections = Array.from(tablesRoot.querySelectorAll('.course-table-section'));
    sections.forEach(section => {
        const subtables = Array.from(section.querySelectorAll('.benefit-subtable'));
        subtables.forEach(subtable => {
            const table = subtable.querySelector('table.course-detail-table');
            if (!table) return;
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            const rows = Array.from(tbody.querySelectorAll('tr'));

            let hasDataRow = false;
            let hasVisibleDataRow = false;
            let anyNonZero = false;

            rows.forEach(tr => {
                const colspanCell = tr.querySelector('td[colspan]');
                if (colspanCell) return;

                hasDataRow = true;

                let qty = 0;
                const input = tr.querySelector('input');
                if (input instanceof HTMLInputElement) {
                    qty = Number(input.value || 0);
                } else {
                    const tds = Array.from(tr.querySelectorAll('td'));
                    const lastText = (tds[tds.length - 1]?.textContent || '').trim();
                    qty = Number(lastText);
                }

                if (Number.isFinite(qty) && qty > 0) {
                    tr.style.display = '';
                    anyNonZero = true;
                    hasVisibleDataRow = true;
                } else {
                    tr.style.display = 'none';
                }
            });

            if (hasDataRow && !anyNonZero) {
                subtable.style.display = 'none';
                return;
            }

            subtable.style.display = '';
            if (hasVisibleDataRow) return;

            if (!hasDataRow) {
                subtable.style.display = '';
                return;
            }
        });

        const anyVisibleSubtable = Array.from(section.querySelectorAll('.benefit-subtable')).some(st => st instanceof HTMLElement && st.style.display !== 'none');
        section.style.display = anyVisibleSubtable ? '' : 'none';
    });
}

function hasPositiveBenefitForCustomize(card, kind) {
    if (!card) return false;
    const products = Array.isArray(card.products) ? card.products : [];
    const homeProducts = Array.isArray(card.homeProducts) ? card.homeProducts : [];
    const cardItems = Array.isArray(card.cardItems) ? card.cardItems : [];
    if (kind === 'amountCard') {
        return products.some(p => Number(p?.giftQty || 0) > 0)
            || homeProducts.some(p => Number(p?.giftQty || 0) > 0)
            || cardItems.some(p => Number(p?.giftQty || 0) > 0);
    }
    return products.some(p => Number(p?.buyQty || 0) > 0 || Number(p?.giftQty || 0) > 0)
        || homeProducts.some(p => Number(p?.buyQty || 0) > 0 || Number(p?.giftQty || 0) > 0)
        || cardItems.some(p => Number(p?.giftQty || 0) > 0);
}

function goCustomizeFromCourseDetail() {
    const kind = addCourseModalKind === 'amountCard' ? 'amountCard' : 'course';
    const source = kind === 'amountCard' ? selectedAmountCard : selectedCourseCard;
    if (!source) return;

    editingCustomCourseId = null;
    editingCustomAmountCardId = null;

    setCourseDetailMode('custom');

    let tries = 0;
    const run = () => {
        tries += 1;
        const nameInput = document.getElementById('customCourseName');
        if (!nameInput) {
            if (tries < 10) setTimeout(run, 0);
            return;
        }

        clearCustomCourseDraft();

        const products = (Array.isArray(source.products) ? source.products : []).filter(p => {
            const buy = Number(p?.buyQty || 0);
            const gift = Number(p?.giftQty || 0);
            return kind === 'amountCard' ? gift > 0 : (buy > 0 || gift > 0);
        });
        const homeProducts = (Array.isArray(source.homeProducts) ? source.homeProducts : []).filter(p => {
            const buy = Number(p?.buyQty || 0);
            const gift = Number(p?.giftQty || 0);
            return kind === 'amountCard' ? gift > 0 : (buy > 0 || gift > 0);
        });
        const cardItems = (Array.isArray(source.cardItems) ? source.cardItems : []).filter(p => Number(p?.giftQty || 0) > 0);

        const validitySelect = document.getElementById('customCourseValidity');
        const priceInput = document.getElementById('customCoursePrice');
        const typeSelect = document.getElementById('customCourseType');
        const rechargeInput = document.getElementById('customAmountRechargeAmount');
        const giftInput = document.getElementById('customAmountGiftAmount');

        nameInput.value = source.name || '';
        if (validitySelect) validitySelect.value = source.validityType || 'purchase';

        if (kind === 'amountCard') {
            if (priceInput) priceInput.value = Number(source.price || 0).toFixed(2);
            if (rechargeInput) rechargeInput.value = Number(source.rechargeAmount || 0).toFixed(2);
            if (giftInput) giftInput.value = Number(source.giftAmount || 0).toFixed(2);
        } else {
            if (typeSelect) typeSelect.value = source.cardType || 'limited';
            if (priceInput) priceInput.value = Number(source.price || 0).toFixed(2);
        }

        const img = document.getElementById('customCourseImagePreview');
        const hint = document.getElementById('customCourseImageHint');
        if (img && source.imageUrl) {
            img.src = source.imageUrl;
            img.style.display = '';
            if (hint) hint.style.display = 'none';
        }

        products.forEach(p => {
            customCourseAddRow('care', {
                name: p.name,
                spec: p.spec || '',
                duration: p.duration || '',
                price: p.price,
                buyQty: kind === 'amountCard' ? 0 : (Number(p.buyQty || 0) || 0),
                giftQty: Number(p.giftQty || 0) || 0
            });
        });

        homeProducts.forEach(p => {
            customCourseAddRow('home', {
                name: p.name,
                spec: p.spec || '',
                price: p.price,
                buyQty: kind === 'amountCard' ? 0 : (Number(p.buyQty || 0) || 0),
                giftQty: Number(p.giftQty || 0) || 0
            });
        });

        cardItems.forEach(p => {
            customCourseAddRow('card', {
                name: p.name,
                cardType: p.cardType || '有限次卡',
                price: p.price,
                giftQty: Number(p.giftQty || 0) || 0
            });
        });

        updateCustomCourseTableHeaderVisibility();
        scheduleRenderCustomBenefitViews();
    };
    setTimeout(run, 0);
}

function renderCustomBenefitViews() {
    const buyCare = document.getElementById('customBuyCareView');
    const buyHome = document.getElementById('customBuyHomeView');
    const giftCare = document.getElementById('customGiftCareView');
    const giftHome = document.getElementById('customGiftHomeView');
    const giftCard = document.getElementById('customGiftCardView');
    if (!buyCare && !buyHome && !giftCare && !giftHome && !giftCard) return;

    const careRows = Array.from(document.getElementById('customCourseCareBody')?.querySelectorAll('tr') || []);
    const homeRows = Array.from(document.getElementById('customCourseHomeBody')?.querySelectorAll('tr') || []);
    const cardRows = Array.from(document.getElementById('customCourseCardBody')?.querySelectorAll('tr') || []);

    const renderEmptyRow = (colspan) => `<tr><td colspan="${colspan}" style="color:var(--neutral-400);text-align:center;padding:12px;">暂无权益</td></tr>`;

    const renderCareTable = (field, qtyTitle) => {
        const rowsHtml = careRows.map(tr => {
            const key = String(tr.dataset.key || '');
            const name = String(tr.dataset.name || '');
            const spec = String(tr.dataset.spec || '');
            const duration = String(tr.dataset.duration || '');
            const price = Number(tr.dataset.price || 0);
            const qty = parseInt(tr.querySelector(`input[data-field="${field}"]`)?.value || '0', 10) || 0;
            return `
                <tr class="course-table-row" data-k="${encodeURIComponent(key)}">
                    <td class="col-name">
                        <span class="readonly-text">${name}</span>
                        ${spec ? `<span class="sub-text">${spec}</span>` : ''}
                    </td>
                    <td class="col-duration"><span class="readonly-text">${duration}</span></td>
                    <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
                    <td class="col-qty">
                        <div class="table-stepper">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                                <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                            </div>
                            <input type="number" class="table-stepper-value" value="${qty}" min="0" max="999" inputmode="numeric"
                                   oninput="onCustomBenefitQtyInput(this,'care',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')"
                                   onblur="onCustomBenefitQtyBlur(this,'care',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            </div>
                        </div>
                    </td>
                    <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRowByKey('care',decodeURIComponent(this.closest('tr').getAttribute('data-k')))">删除</button></td>
                </tr>
            `;
        }).join('');

        return `
            <table class="course-detail-table">
                <thead>
                    <tr>
                        <th class="col-name">商品名称</th>
                        <th class="col-duration">服务时长</th>
                        <th class="col-price">服务价格</th>
                        <th class="col-qty">${qtyTitle}</th>
                        <th class="col-action">操作</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml || renderEmptyRow(5)}</tbody>
            </table>
        `;
    };

    const renderHomeTable = (field, qtyTitle) => {
        const rowsHtml = homeRows.map(tr => {
            const key = String(tr.dataset.key || '');
            const name = String(tr.dataset.name || '');
            const spec = String(tr.dataset.spec || '');
            const price = Number(tr.dataset.price || 0);
            const qty = parseInt(tr.querySelector(`input[data-field="${field}"]`)?.value || '0', 10) || 0;
            return `
                <tr class="course-table-row" data-k="${encodeURIComponent(key)}">
                    <td class="col-name"><span class="readonly-text">${name}</span></td>
                    <td class="col-spec"><span class="readonly-text">${spec}</span></td>
                    <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
                    <td class="col-qty">
                        <div class="table-stepper">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                                <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                            </div>
                            <input type="number" class="table-stepper-value" value="${qty}" min="0" max="999" inputmode="numeric"
                                   oninput="onCustomBenefitQtyInput(this,'home',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')"
                                   onblur="onCustomBenefitQtyBlur(this,'home',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            </div>
                        </div>
                    </td>
                    <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRowByKey('home',decodeURIComponent(this.closest('tr').getAttribute('data-k')))">删除</button></td>
                </tr>
            `;
        }).join('');

        return `
            <table class="course-detail-table">
                <thead>
                    <tr>
                        <th class="col-name">商品名称</th>
                        <th class="col-spec">规格</th>
                        <th class="col-price">售卖价格</th>
                        <th class="col-qty">${qtyTitle}</th>
                        <th class="col-action">操作</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml || renderEmptyRow(5)}</tbody>
            </table>
        `;
    };

    const renderCardTable = (field, qtyTitle) => {
        const rowsHtml = cardRows.map(tr => {
            const key = String(tr.dataset.key || '');
            const name = String(tr.dataset.name || '');
            const cardType = String(tr.dataset.cardType || '');
            const price = Number(tr.dataset.price || 0);
            const qty = parseInt(tr.querySelector(`input[data-field="${field}"]`)?.value || '0', 10) || 0;
            return `
                <tr class="course-table-row" data-k="${encodeURIComponent(key)}">
                    <td class="col-name"><span class="readonly-text">${name}</span></td>
                    <td class="col-type"><span class="readonly-text">${cardType}</span></td>
                    <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
                    <td class="col-qty">
                        <div class="table-stepper">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                                <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                            </div>
                            <input type="number" class="table-stepper-value" value="${qty}" min="0" max="999" inputmode="numeric"
                                   oninput="onCustomBenefitQtyInput(this,'card',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')"
                                   onblur="onCustomBenefitQtyBlur(this,'card',decodeURIComponent(this.closest('tr').getAttribute('data-k')),'${field}')">
                            <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            </div>
                        </div>
                    </td>
                    <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRowByKey('card',decodeURIComponent(this.closest('tr').getAttribute('data-k')))">删除</button></td>
                </tr>
            `;
        }).join('');

        return `
            <table class="course-detail-table">
                <thead>
                    <tr>
                        <th class="col-name">卡项名称</th>
                        <th class="col-type">卡项类型</th>
                        <th class="col-price">卡项价格</th>
                        <th class="col-qty">${qtyTitle}</th>
                        <th class="col-action">操作</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml || renderEmptyRow(5)}</tbody>
            </table>
        `;
    };

    if (buyCare) buyCare.innerHTML = renderCareTable('buy', '购买数量');
    if (buyHome) buyHome.innerHTML = renderHomeTable('buy', '购买数量');
    if (giftCare) giftCare.innerHTML = renderCareTable('gift', '赠送数量');
    if (giftHome) giftHome.innerHTML = renderHomeTable('gift', '赠送数量');
    if (giftCard) giftCard.innerHTML = renderCardTable('gift', '赠送数量');
    applyBenefitTableVisibilityForAddCourseModal();
}


function setupCustomCourseTableObservers() {
    if (customCourseTableObservers.length) {
        customCourseTableObservers.forEach(o => o.disconnect());
        customCourseTableObservers = [];
    }

    const tables = document.querySelectorAll('.custom-course-table');
    tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const observer = new MutationObserver(() => {
            updateCustomCourseTableHeaderVisibility();
            scheduleRenderCustomBenefitViews();
        });
        observer.observe(tbody, { childList: true });
        customCourseTableObservers.push(observer);
    });
}

function renderCustomCourseDetail() {
    customCourseContextKind = 'course';
    addCourseRightPanel.innerHTML = `
        <div class="course-detail-header custom-course-header">
            <div class="custom-course-topbar">
                <button class="course-confirm-btn primary" onclick="confirmCustomCourseSelection()">确定</button>
                <button class="course-confirm-btn" onclick="clearCustomCourseAndBackToList()">取消</button>
            </div>
            <div class="custom-course-body">
                <div class="course-detail-image" id="customCourseImageBox" style="cursor:pointer;">
                    <img id="customCourseImagePreview" style="display:none;width:100%;height:100%;object-fit:cover;" alt="">
                    <span id="customCourseImageHint">上传卡封面</span>
                    <input id="customCourseImageInput" type="file" accept="image/*" style="display:none;">
                </div>
                <div class="course-detail-info">
                    <div class="course-card-info">
                        <div class="course-card-info-row">
                            <div class="course-card-field">
                                <label for="customCourseName">卡片名称</label>
                                <input id="customCourseName" class="course-card-input" type="text" placeholder="请输入卡项名称">
                            </div>
                            <div class="course-card-field">
                                <label for="customCourseType">卡片类型</label>
                                <select id="customCourseType" class="course-card-select">
                                    <option value="limited" selected>有限次卡</option>
                                    <option value="unlimited">通卡</option>
                                </select>
                            </div>
                        </div>
                        <div class="course-card-info-row">
                            <div class="course-card-field">
                                <label for="customCourseValidity">卡片有效期</label>
                                <select id="customCourseValidity" class="course-card-select">
                                    <option value="purchase" selected>自购买起生效</option>
                                    <option value="firstUse">自首次消费起生效</option>
                                    <option value="permanent">永久有效</option>
                                </select>
                            </div>
                            <div class="course-card-field">
                                <label for="customCoursePrice">售卖价格</label>
                                <div class="course-card-price-group">
                                    <span class="course-card-price-symbol">¥</span>
                                    <input id="customCoursePrice" class="course-card-price-input" type="text" inputmode="decimal" placeholder="0.00"
                                           oninput="customCourseSanitizePriceInput(this)" onblur="customCourseFormatPriceInput(this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="course-detail-tables">
            <div class="course-table-section">
                <div class="benefit-module-title">购买权益</div>
                <div class="benefit-subtables">
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">单次护理</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('care','buy')">+ 添加权益</button>
                        </div>
                        <div id="customBuyCareView"></div>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">居家产品</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('home','buy')">+ 添加权益</button>
                        </div>
                        <div id="customBuyHomeView"></div>
                    </div>
                </div>
            </div>
            <div class="course-table-section">
                <div class="benefit-module-title">赠送权益</div>
                <div class="benefit-subtables">
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">单次护理</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('care','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftCareView"></div>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">居家产品</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('home','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftHomeView"></div>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">卡项</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('card','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftCardView"></div>
                    </div>
                </div>
            </div>

            <div class="custom-benefit-hidden-store">
                <table class="course-detail-table custom-course-table" data-custom-table="care">
                    <thead>
                        <tr>
                            <th class="col-name">商品名称</th>
                            <th class="col-duration">服务时长</th>
                            <th class="col-price">服务价格</th>
                            <th class="col-qty">购买数量</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseCareBody"></tbody>
                </table>
                <table class="course-detail-table custom-course-table" data-custom-table="home">
                    <thead>
                        <tr>
                            <th class="col-name">商品名称</th>
                            <th class="col-spec">规格</th>
                            <th class="col-price">售卖价格</th>
                            <th class="col-qty">购买数量</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseHomeBody"></tbody>
                </table>
                <table class="course-detail-table custom-course-table" data-custom-table="card">
                    <thead>
                        <tr>
                            <th class="col-name">卡项名称</th>
                            <th class="col-type">卡项类型</th>
                            <th class="col-price">卡项价格</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseCardBody"></tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        const box = document.getElementById('customCourseImageBox');
        const input = document.getElementById('customCourseImageInput');
        const img = document.getElementById('customCourseImagePreview');
        const hint = document.getElementById('customCourseImageHint');

        if (box && input) {
            box.addEventListener('click', () => input.click());
        }
        if (input) {
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (!file) return;
                if (customCourseImageObjectUrl) {
                    URL.revokeObjectURL(customCourseImageObjectUrl);
                }
                const url = URL.createObjectURL(file);
                customCourseImageObjectUrl = url;
                if (img) {
                    img.src = url;
                    img.style.display = 'block';
                }
                if (hint) hint.style.display = 'none';
            });
        }

        ensureCustomCourseDefaultImage();
        updateCustomCourseTableHeaderVisibility();
        setupCustomCourseTableObservers();
        scheduleRenderCustomBenefitViews();
    }, 0);
}

function customCourseSanitizeQtyInput(input) {
    const raw = String(input.value || '').replace(/[^\d]/g, '');
    input.value = raw;
}

function customCourseClampQtyInput(input) {
    const num = parseInt(input.value, 10);
    const min = parseInt(input.min || '0', 10);
    const max = parseInt(input.max || '999', 10);
    if (!Number.isFinite(num)) {
        input.value = String(min);
        return;
    }
    input.value = String(Math.max(min, Math.min(max, num)));
}

function customCourseQtyStepUp(btn) {
    const input = btn.parentElement.querySelector('.table-stepper-value');
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const max = parseInt(input.max || '999', 10);
    input.value = String(Math.min(max, current + 1));
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function customCourseQtyStepDown(btn) {
    const input = btn.parentElement.querySelector('.table-stepper-value');
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    const min = parseInt(input.min || '0', 10);
    input.value = String(Math.max(min, current - 1));
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function customCourseAddRow(type, preset = {}) {
    const tbodyMap = {
        care: document.getElementById('customCourseCareBody'),
        home: document.getElementById('customCourseHomeBody'),
        card: document.getElementById('customCourseCardBody')
    };
    const tbody = tbodyMap[type];
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'course-table-row';
    tr.dataset.customType = type;
    const isAmountCardCustom = typeof customCourseContextKind !== 'undefined' && customCourseContextKind === 'amountCard';

    if (type === 'care') {
        const name = preset.name || '';
        const spec = preset.spec || '';
        const duration = preset.duration || '';
        const price = Number.isFinite(Number(preset.price)) ? Number(preset.price) : 0;
        const buyQty = Number.isFinite(Number(preset.buyQty)) ? Number(preset.buyQty) : (isAmountCardCustom ? 0 : 1);
        const giftQty = Number.isFinite(Number(preset.giftQty)) ? Number(preset.giftQty) : (isAmountCardCustom ? 1 : 0);
        tr.dataset.key = `${name}__${spec}`;
        tr.dataset.name = name;
        tr.dataset.spec = spec;
        tr.dataset.duration = duration;
        tr.dataset.price = String(price);
        tr.innerHTML = `
            <td class="col-name">
                <span class="readonly-text">${name}</span>
                ${spec ? `<span class="sub-text">${spec}</span>` : ''}
            </td>
            <td class="col-duration"><span class="readonly-text">${duration}</span></td>
            <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${buyQty}" min="0" max="999" inputmode="numeric"
                           oninput="customCourseSanitizeQtyInput(this)" onblur="customCourseClampQtyInput(this)" data-field="buy">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${giftQty}" min="0" max="999" inputmode="numeric"
                           oninput="customCourseSanitizeQtyInput(this)" onblur="customCourseClampQtyInput(this)" data-field="gift">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRow(this)">删除</button></td>
        `;
    } else if (type === 'home') {
        const name = preset.name || '';
        const spec = preset.spec || '';
        const price = Number.isFinite(Number(preset.price)) ? Number(preset.price) : 0;
        const buyQty = Number.isFinite(Number(preset.buyQty)) ? Number(preset.buyQty) : (isAmountCardCustom ? 0 : 1);
        const giftQty = Number.isFinite(Number(preset.giftQty)) ? Number(preset.giftQty) : (isAmountCardCustom ? 1 : 0);
        tr.dataset.key = `${name}__${spec}`;
        tr.dataset.name = name;
        tr.dataset.spec = spec;
        tr.dataset.price = String(price);
        tr.innerHTML = `
            <td class="col-name"><span class="readonly-text">${name}</span></td>
            <td class="col-spec"><span class="readonly-text">${spec}</span></td>
            <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${buyQty}" min="0" max="999" inputmode="numeric"
                           oninput="customCourseSanitizeQtyInput(this)" onblur="customCourseClampQtyInput(this)" data-field="buy">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${giftQty}" min="0" max="999" inputmode="numeric"
                           oninput="customCourseSanitizeQtyInput(this)" onblur="customCourseClampQtyInput(this)" data-field="gift">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRow(this)">删除</button></td>
        `;
    } else {
        const name = preset.name || '';
        const cardType = preset.cardType || '有限次卡';
        const price = Number.isFinite(Number(preset.price)) ? Number(preset.price) : 0;
        const giftQty = Number.isFinite(Number(preset.giftQty)) ? Number(preset.giftQty) : 0;
        tr.dataset.key = name;
        tr.dataset.name = name;
        tr.dataset.cardType = cardType;
        tr.dataset.price = String(price);
        tr.innerHTML = `
            <td class="col-name"><span class="readonly-text">${name}</span></td>
            <td class="col-type"><span class="readonly-text">${cardType}</span></td>
            <td class="col-price"><span class="readonly-text">¥${Number(price).toFixed(2)}</span></td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${giftQty}" min="0" max="999" inputmode="numeric"
                           oninput="customCourseSanitizeQtyInput(this)" onblur="customCourseClampQtyInput(this)" data-field="gift">
                    <div class="table-stepper-btn" onclick="customCourseQtyStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-action"><button class="table-action-btn delete" onclick="customCourseDeleteRow(this)">删除</button></td>
        `;
    }

    tbody.appendChild(tr);
    updateCustomCourseTableHeaderVisibility();
}

function customCourseDeleteRow(btn) {
    const tr = btn && btn.closest('tr');
    if (tr) tr.remove();
    updateCustomCourseTableHeaderVisibility();
}

function getCustomCourseExistingKeys(type) {
    const bodyMap = {
        care: document.getElementById('customCourseCareBody'),
        home: document.getElementById('customCourseHomeBody'),
        card: document.getElementById('customCourseCardBody')
    };
    const tbody = bodyMap[type];
    if (!tbody) return new Set();
    const set = new Set();
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
        if (tr.dataset.key) set.add(tr.dataset.key);
    });
    return set;
}

function guessServiceDuration(product) {
    const map = {
        facial: '60分钟',
        body: '60分钟',
        spa: '90分钟',
        special: '60分钟'
    };
    return map[product.category] || '60分钟';
}

function renderCustomAmountCardDetail() {
    customCourseContextKind = 'amountCard';
    customCourseBenefitTargetMode = 'gift';
    addCourseRightPanel.innerHTML = `
        <div class="course-detail-header custom-course-header">
            <div class="custom-course-topbar">
                <button class="course-confirm-btn primary" onclick="confirmCustomAmountCardSelection()">确定</button>
                <button class="course-confirm-btn" onclick="clearCustomCourseAndBackToList()">取消</button>
            </div>
            <div class="custom-course-body">
                <div class="course-detail-image" id="customCourseImageBox" style="cursor:pointer;">
                    <img id="customCourseImagePreview" style="display:none;width:100%;height:100%;object-fit:cover;" alt="">
                    <span id="customCourseImageHint">上传卡封面</span>
                    <input id="customCourseImageInput" type="file" accept="image/*" style="display:none;">
                </div>
                <div class="course-detail-info">
                    <div class="course-card-info">
                        <div class="course-card-info-row">
                            <div class="course-card-field">
                                <label for="customCourseName">金额卡名称</label>
                                <input id="customCourseName" class="course-card-input" type="text" placeholder="请输入金额卡名称">
                            </div>
                            <div class="course-card-field" style="display:none;">
                                <label for="customCourseType">卡片类型</label>
                                <select id="customCourseType" class="course-card-select">
                                    <option value="amount" selected>金额卡</option>
                                </select>
                            </div>
                        </div>
                        <div class="course-card-info-row">
                            <div class="course-card-field">
                                <label for="customCourseValidity">卡片有效期</label>
                                <select id="customCourseValidity" class="course-card-select">
                                    <option value="purchase" selected>自购买起生效</option>
                                    <option value="firstUse">自首次消费起生效</option>
                                    <option value="permanent">永久有效</option>
                                </select>
                            </div>
                            <div class="course-card-field">
                                <label for="customCoursePrice">售卖价格</label>
                                <div class="course-card-price-group">
                                    <span class="course-card-price-symbol">¥</span>
                                    <input id="customCoursePrice" class="course-card-price-input" type="text" inputmode="decimal" placeholder="0.00"
                                           oninput="customCourseSanitizePriceInput(this)" onblur="customCourseFormatPriceInput(this)">
                                </div>
                            </div>
                        </div>
                        <div class="course-card-info-row">
                            <div class="course-card-field">
                                <label for="customAmountRechargeAmount">充值金额</label>
                                <div class="course-card-price-group">
                                    <span class="course-card-price-symbol">¥</span>
                                    <input id="customAmountRechargeAmount" class="course-card-price-input" type="text" inputmode="decimal" placeholder="0.00"
                                           oninput="customCourseSanitizePriceInput(this)" onblur="customCourseFormatPriceInput(this)">
                                </div>
                            </div>
                            <div class="course-card-field">
                                <label for="customAmountGiftAmount">赠送金额</label>
                                <div class="course-card-price-group">
                                    <span class="course-card-price-symbol">¥</span>
                                    <input id="customAmountGiftAmount" class="course-card-price-input" type="text" inputmode="decimal" placeholder="0.00"
                                           oninput="customCourseSanitizePriceInput(this)" onblur="customCourseFormatPriceInput(this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="course-detail-tables">
            <div class="course-table-section">
                <div class="benefit-module-title">赠送权益</div>
                <div class="benefit-subtables">
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">单次护理</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('care','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftCareView"></div>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">居家产品</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('home','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftHomeView"></div>
                    </div>
                    <div class="benefit-subtable">
                        <div class="course-table-title-row">
                            <div class="course-table-title">卡项</div>
                            <button class="course-table-add-btn" onclick="openCustomCourseBenefitModal('card','gift')">+ 添加权益</button>
                        </div>
                        <div id="customGiftCardView"></div>
                    </div>
                </div>
            </div>

            <div class="custom-benefit-hidden-store">
                <table class="course-detail-table custom-course-table" data-custom-table="care">
                    <thead>
                        <tr>
                            <th class="col-name">商品名称</th>
                            <th class="col-duration">服务时长</th>
                            <th class="col-price">服务价格</th>
                            <th class="col-qty">购买数量</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseCareBody"></tbody>
                </table>
                <table class="course-detail-table custom-course-table" data-custom-table="home">
                    <thead>
                        <tr>
                            <th class="col-name">商品名称</th>
                            <th class="col-spec">规格</th>
                            <th class="col-price">售卖价格</th>
                            <th class="col-qty">购买数量</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseHomeBody"></tbody>
                </table>
                <table class="course-detail-table custom-course-table" data-custom-table="card">
                    <thead>
                        <tr>
                            <th class="col-name">卡项名称</th>
                            <th class="col-type">卡项类型</th>
                            <th class="col-price">卡项价格</th>
                            <th class="col-qty">赠送数量</th>
                            <th class="col-action">操作</th>
                        </tr>
                    </thead>
                    <tbody id="customCourseCardBody"></tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        const box = document.getElementById('customCourseImageBox');
        const input = document.getElementById('customCourseImageInput');
        const img = document.getElementById('customCourseImagePreview');
        const hint = document.getElementById('customCourseImageHint');

        if (box && input) {
            box.onclick = () => input.click();
        }

        if (input) {
            input.onchange = (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                if (customCourseImageObjectUrl) URL.revokeObjectURL(customCourseImageObjectUrl);
                customCourseImageObjectUrl = URL.createObjectURL(file);
                if (img) {
                    img.src = customCourseImageObjectUrl;
                    img.style.display = '';
                }
                if (hint) hint.style.display = 'none';
            };
        }

        ensureCustomCourseDefaultImage();
        setupCustomCourseTableObservers();
        updateCustomCourseTableHeaderVisibility();
        scheduleRenderCustomBenefitViews();
    }, 0);
}

function confirmCustomAmountCardSelection() {
    const name = document.getElementById('customCourseName')?.value.trim() || '';
    const validityType = document.getElementById('customCourseValidity')?.value || 'purchase';
    const priceStr = document.getElementById('customCoursePrice')?.value || '';
    const rechargeStr = document.getElementById('customAmountRechargeAmount')?.value || '';
    const giftStr = document.getElementById('customAmountGiftAmount')?.value || '';
    const price = Number(priceStr);
    const rechargeAmount = Number(rechargeStr);
    const giftAmount = Number(giftStr);

    const img = document.getElementById('customCourseImagePreview');
    const imageUrl = img?.src || '';

    if (!name) {
        showToast('请输入金额卡名称');
        return;
    }
    if (!Number.isFinite(price) || price < 0) {
        showToast('请输入正确的售卖价格');
        return;
    }
    if (!Number.isFinite(rechargeAmount) || rechargeAmount < 0) {
        showToast('请输入正确的充值金额');
        return;
    }
    if (!Number.isFinite(giftAmount) || giftAmount < 0) {
        showToast('请输入正确的赠送金额');
        return;
    }

    const products = [];
    const homeProducts = [];
    const cardItems = [];

    const careBody = document.getElementById('customCourseCareBody');
    const homeBody = document.getElementById('customCourseHomeBody');
    const cardBody = document.getElementById('customCourseCardBody');

    if (careBody) {
        Array.from(careBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const duration = tr.dataset.duration || '';
            const p = Number(tr.dataset.price || 0);
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && giftQty > 0) {
                products.push({ type: 'care', name: n, duration: duration, price: Number.isFinite(p) ? p : 0, buyQty: 0, giftQty });
            }
        });
    }

    if (homeBody) {
        Array.from(homeBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const spec = tr.dataset.spec || '';
            const p = Number(tr.dataset.price || 0);
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && giftQty > 0) {
                homeProducts.push({ type: 'home', name: n, spec: spec, price: Number.isFinite(p) ? p : 0, buyQty: 0, giftQty });
            }
        });
    }

    if (cardBody) {
        Array.from(cardBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const cardType = tr.dataset.cardType || '有限次卡';
            const p = Number(tr.dataset.price || 0);
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && giftQty > 0) {
                cardItems.push({ type: 'card', name: n, cardType: cardType, price: Number.isFinite(p) ? p : 0, giftQty });
            }
        });
    }

    const validityTextMap = {
        purchase: '自购买起生效',
        firstUse: '自首次消费起生效',
        permanent: '永久有效'
    };
    const validity = validityTextMap[validityType] || '自购买起生效';

    const now = Date.now();
    const existingIndex = editingCustomAmountCardId ? selectedAmountCards.findIndex(c => c.id === editingCustomAmountCardId) : -1;
    const existing = existingIndex > -1 ? selectedAmountCards[existingIndex] : null;

    const existingBuyQty = existing ? (Number.isFinite(Number(existing.buyQty)) ? Math.max(0, parseInt(existing.buyQty, 10) || 0) : 1) : 1;
    const existingGiftQty = existing ? (Number.isFinite(Number(existing.giftQty)) ? Math.max(0, parseInt(existing.giftQty, 10) || 0) : 0) : 0;
    const existingDiscount = existing ? (Number.isFinite(Number(existing.discount)) ? Number(existing.discount) : 100) : 100;
    const clampedExistingDiscount = clampNumber(existingDiscount, 0.01, 100);
    const existingFinalPrice = existing ? Number(existing.finalPrice) : NaN;
    const expectedExistingFinal = existing
        ? Number(((Number(existing.price || 0) * existingBuyQty) * (clampedExistingDiscount / 100)).toFixed(2))
        : NaN;
    const shouldFollowDiscount = !existing || !Number.isFinite(existingFinalPrice) || Math.abs(existingFinalPrice - expectedExistingFinal) < 0.01;
    const nextFinalPrice = shouldFollowDiscount
        ? Number(((price * existingBuyQty) * (clampedExistingDiscount / 100)).toFixed(2))
        : Number(existingFinalPrice.toFixed(2));

    const amountCardData = {
        id: existing ? existing.id : now,
        cardId: existing ? existing.cardId : ('custom-amount-' + now),
        name: name,
        validity: validity,
        price: Number(price.toFixed(2)),
        rechargeAmount: Number(rechargeAmount.toFixed(2)),
        giftAmount: Number(giftAmount.toFixed(2)),
        imageUrl: imageUrl || (existing ? (existing.imageUrl || '') : ''),
        scope: existing ? (existing.scope || '') : '全店通用（项目/产品）',
        rules: existing ? (existing.rules || '') : '可用于全店项目/产品抵扣',
        limitations: existing ? (existing.limitations || '') : '具体使用规则以门店设置为准',
        validityType: validityType,
        products: products,
        homeProducts: homeProducts,
        cardItems: cardItems,
        buyQty: existing ? existingBuyQty : 1,
        giftQty: existing ? existingGiftQty : 0,
        discount: existing ? clampedExistingDiscount : 100,
        finalPrice: existing ? nextFinalPrice : Number((price * 1).toFixed(2)),
        beauticianIds: existing ? (existing.beauticianIds || []) : [],
        beautician: existing ? (existing.beautician || '') : '',
        remark: existing ? (existing.remark || '') : ''
    };

    if (existingIndex > -1) {
        selectedAmountCards[existingIndex] = amountCardData;
        editingCustomAmountCardId = null;
        showToast('已更新金额卡：' + name);
    } else {
        selectedAmountCards.push(amountCardData);
        showToast('已添加金额卡：' + name);
    }

    clearCustomCourseDraft();
    closeAddCourseModal();
    renderSelectedAmountCardTable();
}

function confirmAmountCardSelection() {
    if (!selectedAmountCard) {
        showToast('请先选择金额卡');
        return;
    }

    const card = selectedAmountCard;
    const now = Date.now();
    const price = Number(Number(card.price || 0).toFixed(2));
    selectedAmountCards.push({
        id: now,
        cardId: 'amount-' + String(card.id),
        name: card.name,
        validity: card.validity,
        price: price,
        rechargeAmount: Number(Number(card.rechargeAmount || 0).toFixed(2)),
        giftAmount: Number(Number(card.giftAmount || 0).toFixed(2)),
        scope: card.scope || '',
        rules: card.rules || '',
        limitations: card.limitations || '',
        products: (card.products || []).map(p => ({ ...p })),
        homeProducts: (card.homeProducts || []).map(p => ({ ...p })),
        cardItems: (card.cardItems || []).map(p => ({ ...p })),
        buyQty: 1,
        giftQty: 0,
        discount: 100,
        finalPrice: Number((price * 1).toFixed(2)),
        beauticianIds: [],
        beautician: '',
        remark: ''
    });

    closeAddCourseModal();
    renderSelectedAmountCardTable();
    showToast('已添加金额卡：' + card.name);
}

function addSelectedItemsToCustomCourse(type, items, targetMode = 'buy') {
    const existing = getCustomCourseExistingKeys(type);
    let skipped = 0;
    let added = 0;
    const normalizedTargetMode = (customCourseContextKind === 'amountCard') ? 'gift' : (targetMode === 'gift' ? 'gift' : 'buy');
    const defaultBuyQty = normalizedTargetMode === 'buy' ? 1 : 0;
    const defaultGiftQty = normalizedTargetMode === 'gift' ? 1 : 0;

    items.forEach(item => {
        if (type === 'home') {
            const key = `${item.name}__${item.spec || ''}`;
            if (existing.has(key)) {
                skipped += 1;
                return;
            }
            existing.add(key);
            customCourseAddRow('home', {
                name: item.name,
                spec: item.spec || '',
                price: item.price,
                buyQty: defaultBuyQty,
                giftQty: defaultGiftQty
            });
            added += 1;
            return;
        }

        if (existing.has(item.name)) {
            skipped += 1;
            return;
        }
        existing.add(item.name);

        if (type === 'care') {
            customCourseAddRow('care', {
                name: item.name,
                spec: item.spec || '',
                duration: item.duration || guessServiceDuration(item),
                price: item.price,
                buyQty: defaultBuyQty,
                giftQty: defaultGiftQty
            });
            added += 1;
            return;
        }

        customCourseAddRow('card', {
            name: item.name,
            cardType: item.cardType || '有限次卡',
            price: item.price,
            giftQty: defaultGiftQty
        });
        added += 1;
    });

    if (skipped > 0) {
        showToast(`已跳过重复项 ${skipped} 个`);
    } else if (added > 0) {
        showToast(`已添加 ${added} 条权益`);
    }
    scheduleRenderCustomBenefitViews();
}

async function openCustomCourseBenefitModal(type, targetMode = 'buy') {
    try {
        customCourseBenefitModalType = type;
        customCourseBenefitTargetMode = (customCourseContextKind === 'amountCard') ? 'gift' : (targetMode === 'gift' ? 'gift' : 'buy');
        if (type === 'care') {
            const title = addServiceModalOverlay?.querySelector('.add-service-modal-title');
            if (title) title.textContent = '添加单次护理';
            openAddServiceModal();
            return;
        }
        if (type === 'home') {
            const title = addProductModalOverlay?.querySelector('.add-service-modal-title');
            if (title) title.textContent = '添加居家产品';
            openAddProductModal();
            return;
        }
        if (type === 'card') {
            const title = document.getElementById('upgradeNewCardModalTitle');
            if (title) title.textContent = '选择卡项';
            openUpgradeNewCardModalForBenefit();
            return;
        }
        openAddCardItemModal();
    } catch (e) {
        console.error(e);
        showToast('加载失败，请稍后重试');
        customCourseBenefitModalType = null;
        customCourseBenefitTargetMode = (customCourseContextKind === 'amountCard') ? 'gift' : 'buy';
    }
}

function isCustomCourseCard(courseCard) {
    return String(courseCard?.cardId || '').startsWith('custom-');
}

function onCourseLineFieldChange(el) {
    const row = el.closest('tr');
    if (!row) return;
    const courseId = Number(row.getAttribute('data-item-id'));
    const course = selectedCourseCards.find(c => c.id === courseId);
    if (!course) return;

    const field = el.getAttribute('data-field');
    if (!field) return;

    if (field === 'buyQty') {
        const oldBuyQty = el.value;
        const v = Math.max(0, parseInt(el.value || '0', 10) || 0);
        el.value = String(v);
        logProductFieldChange(row, 'buyQty', oldBuyQty, String(v), 'onCourseLineFieldChange');
        course.buyQty = v;
        const giftFlag = row.querySelector('.gift-flag-checkbox');
        if (giftFlag instanceof HTMLInputElement && giftFlag.checked) {
            course.isGift = true;
            course.giftQty = v;
            const hiddenGift = row.querySelector('input[data-field="giftQty"]');
            if (hiddenGift instanceof HTMLInputElement) hiddenGift.value = String(v);
        }
        const discountInput = row.querySelector('[data-field="discount"]');
        if (discountInput) {
            if (giftFlag instanceof HTMLInputElement && giftFlag.checked && discountInput instanceof HTMLInputElement) {
                discountInput.value = '0';
            }
            suppressMoneyCardConflict = true;
            updateFinalPrice(discountInput);
            suppressMoneyCardConflict = false;
            const finalInput = row.querySelector('[data-field="finalPrice"]');
            if (finalInput instanceof HTMLInputElement) {
                const sanitized = sanitizePriceString(finalInput.value, 2);
                const n = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
                finalInput.value = n.toFixed(2);
                course.finalPrice = n;
            }
            return;
        }
        updateOrderSummary();
        return;
    }

    if (field === 'giftQty') {
        const oldGiftQty = el.value;
        const v = Math.max(0, parseInt(el.value || '0', 10) || 0);
        el.value = String(v);
        logProductFieldChange(row, 'giftQty', oldGiftQty, String(v), 'onCourseLineFieldChange');
        course.giftQty = v;
        updateOrderSummary();
        return;
    }

    if (field === 'discount') {
        const oldDiscount = el.value;
        const intStr = sanitizeIntString(el.value);
        const v = clampNumber(intStr === '' ? 0 : parseInt(intStr, 10), 0, 100);
        el.value = String(v);
        logProductFieldChange(row, 'discount', oldDiscount, String(v), 'onCourseLineFieldChange');
        course.discount = v;
        updateOrderSummary();
        return;
    }

    if (field === 'finalPrice') {
        const oldFinalPrice = el.value;
        const sanitized = sanitizePriceString(el.value, 2);
        el.value = sanitized;
        logProductFieldChange(row, 'finalPrice', oldFinalPrice, sanitized, 'onCourseLineFieldChange');
        const v = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
        course.finalPrice = v;
        updateOrderSummary();
        return;
    }

    course[field] = el.value;
}

function onCourseDiscountInput(input) {
    updateFinalPrice(input);
    onCourseLineFieldChange(input);
    const row = input.closest('tr');
    const finalInput = row?.querySelector('[data-field="finalPrice"]');
    if (finalInput) onCourseLineFieldChange(finalInput);
}

function onCourseFinalPriceInput(input) {
    updateDiscount(input);
    onCourseLineFieldChange(input);
    const row = input.closest('tr');
    const discountInput = row?.querySelector('[data-field="discount"]');
    if (discountInput) onCourseLineFieldChange(discountInput);
}

function renderSelectedCourseTable() {
    const tbody = document.getElementById('course-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    selectedCourseCards.forEach(course => {
        const isCustom = isCustomCourseCard(course);
        const buyQty = Number.isFinite(Number(course.buyQty)) ? Number(course.buyQty) : 1;
        const giftQty = Number.isFinite(Number(course.giftQty)) ? Number(course.giftQty) : 0;
        const discount = Number.isFinite(Number(course.discount)) ? Number(course.discount) : 100;
        const finalPrice = Number.isFinite(Number(course.finalPrice)) ? Number(course.finalPrice) : Number(course.price || 0);
        const legacyId = String(course.moneyCardId || '').trim();
        const moneyCards = Array.isArray(course.moneyCards) && course.moneyCards.length > 0
            ? course.moneyCards.map(x => ({ cardId: String(x?.cardId || ''), amount: Number(x?.amount || 0) })).filter(x => !!x.cardId)
            : (legacyId ? [{ cardId: legacyId, amount: 0 }] : []);
        course.moneyCards = moneyCards;

        const itemRow = document.createElement('tr');
        itemRow.className = 'item-row';
        itemRow.setAttribute('data-item-type', 'course');
        itemRow.setAttribute('data-item-id', String(course.id));
        if (moneyCards.length > 0) itemRow.setAttribute('data-moneycards', JSON.stringify(moneyCards));

        itemRow.innerHTML = `
            <td class="col-gift-flag">
                <input type="checkbox" class="gift-flag-checkbox" ${course.isGift ? 'checked' : ''} onchange="onGiftFlagToggle(this)">
                <input type="hidden" data-field="giftQty" value="${giftQty}">
            </td>
            <td class="col-name">
                ${isCustom ? '<span class="course-custom-badge">定制</span>' : ''}
                ${course.name || ''}
            </td>
            <td class="col-original">¥${Number(course.price || 0).toFixed(2)}</td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${buyQty}" min="0" max="999" data-field="buyQty" oninput="onCourseLineFieldChange(this)">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-card">
                <button type="button" class="use-card-btn" data-action="open-moneycard-modal">${moneyCards.length > 0 ? `已选${moneyCards.length}张金额卡` : '选择金额卡'}</button>
            </td>
            <td class="col-discount">
                <div class="discount-wrapper">
                    <input type="number" class="table-input discount-input" value="${discount}" step="1" min="0" max="100" inputmode="decimal"
                           data-field="discount" oninput="onCourseDiscountInput(this)">
                    <span class="discount-suffix">%</span>
                </div>
            </td>
            <td class="col-final">
                <input type="number" class="table-input final-price" value="${Number(finalPrice).toFixed(2)}" step="0.01" min="0" inputmode="decimal"
                       data-field="finalPrice" oninput="onCourseFinalPriceInput(this)">
            </td>
            <td class="col-beautician">
                <button type="button" class="row-beautician-btn" data-field="beautician" data-value="${course.beautician || ''}" onclick="openRowBeauticianModal(this)">${course.beautician ? course.beautician : '选择美容师'}</button>
            </td>
        `;

        const actionRow = document.createElement('tr');
        actionRow.className = 'item-action-row';
        actionRow.innerHTML = `
            <td colspan="8" class="item-action-cell">
                <div class="item-action-btns">
                    <div class="item-payable">应付：<span class="item-payable-val">¥0.00</span></div>
                    <button class="table-action-btn remark ${course.remark ? 'has-content' : ''}" data-remark="${course.remark || ''}" data-course-id="${course.id}" onclick="openTableRemarkModal(this)">备注</button>
                    ${isCustom ? `<button class="table-action-btn" onclick="editCustomCourseRow(this)">修改</button>` : ''}
                    <button class="table-action-btn copy" onclick="copyCourseRow(this)">复制</button>
                    <button class="table-action-btn delete" onclick="deleteCourseRow(this)">删除</button>
                </div>
            </td>
        `;

        tbody.appendChild(itemRow);
        tbody.appendChild(actionRow);
    });

    tbody.querySelectorAll('tr.item-row .gift-flag-checkbox:checked').forEach(cb => onGiftFlagToggle(cb));

    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
    normalizeAndRenderMoneyCards();
}

function renderSelectedAmountCardTable() {
    const tbody = document.getElementById('amount-card-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    selectedAmountCards.forEach(card => {
        const discount = Number.isFinite(Number(card.discount)) ? Number(card.discount) : 100;
        const clampedDiscount = clampNumber(discount, card && card.isGift ? 0 : 0.01, 100);
        const buyQty = Number.isFinite(Number(card.buyQty)) ? Math.max(0, parseInt(card.buyQty, 10) || 0) : 1;
        const giftQty = Number.isFinite(Number(card.giftQty)) ? Math.max(0, parseInt(card.giftQty, 10) || 0) : 0;
        const baseTotal = Number(card.price || 0) * buyQty;
        const computedFinalTotal = Number((baseTotal * (clampedDiscount / 100)).toFixed(2));
        const finalPrice = Number.isFinite(Number(card.finalPrice)) ? Number(card.finalPrice) : computedFinalTotal;
        const beauticianText = card.beautician || '';
        const beauticianIds = Array.isArray(card.beauticianIds) ? card.beauticianIds : [];

        const itemRow = document.createElement('tr');
        itemRow.className = 'item-row';
        itemRow.setAttribute('data-item-type', 'amountCard');
        itemRow.setAttribute('data-item-id', String(card.id));

        const nameText = String(card.name || '').trim();
        const encId = encodeURIComponent(String(card.id));
        itemRow.innerHTML = `
            <td class="col-gift-flag">
                <input type="checkbox" class="gift-flag-checkbox" ${card.isGift ? 'checked' : ''} onchange="onGiftFlagToggle(this)">
                <input type="hidden" data-field="giftQty" value="${giftQty}">
            </td>
            <td class="col-name">
                ${String(card.cardId || '').startsWith('custom-') ? '<span class="course-custom-badge">定制</span>' : ''}
                <span class="amount-card-name-link" title="${nameText.replace(/"/g, '&quot;')}" style="cursor:pointer;" onclick="openAmountCardRuleModal('${encId}')">${nameText}</span>
            </td>
            <td class="col-original">¥${Number(card.price || 0).toFixed(2)}</td>
            <td>¥${Number(card.rechargeAmount || 0).toFixed(2)}</td>
            <td>¥${Number(card.giftAmount || 0).toFixed(2)}</td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="${buyQty}" min="0" max="999" step="1" inputmode="numeric"
                           data-field="buyQty" oninput="onAmountCardQtyInput(this)">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-discount">
                <div class="discount-wrapper">
                    <input type="number" class="table-input discount-input" value="${Number(discount).toFixed(2)}" step="0.01" min="0.01" max="100" inputmode="decimal"
                           data-field="discount" oninput="onAmountCardDiscountInput(this)">
                    <span class="discount-suffix">%</span>
                </div>
            </td>
            <td class="col-final">
                <input type="number" class="table-input final-price" value="${Number(finalPrice).toFixed(2)}" step="0.01" min="0" inputmode="decimal"
                       data-field="finalPrice" oninput="onAmountCardFinalPriceInput(this)">
            </td>
            <td class="col-beautician">
                <button type="button" class="row-beautician-btn" data-ids="${beauticianIds.join(',')}" onclick="openRowBeauticianModal(this)">${beauticianText ? beauticianText : '选择美容师'}</button>
            </td>
        `;

        const actionRow = document.createElement('tr');
        actionRow.className = 'item-action-row';
        const isCustomAmount = String(card.cardId || '').startsWith('custom-amount-');
        actionRow.innerHTML = `
            <td colspan="9" class="item-action-cell">
                <div class="item-action-btns">
                    <button class="table-action-btn remark ${card.remark ? 'has-content' : ''}" data-remark="${card.remark || ''}" data-amount-card-id="${card.id}" onclick="openTableRemarkModal(this)">备注</button>
                    ${isCustomAmount ? `<button class="table-action-btn" onclick="editCustomAmountCardRow(this)">修改</button>` : ''}
                    <button class="table-action-btn copy" onclick="copyAmountCardRow(this)">复制</button>
                    <button class="table-action-btn delete" onclick="deleteAmountCardRow(this)">删除</button>
                </div>
            </td>
        `;

        tbody.appendChild(itemRow);
        tbody.appendChild(actionRow);
    });

    tbody.querySelectorAll('tr.item-row .gift-flag-checkbox:checked').forEach(cb => onGiftFlagToggle(cb));

    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
}

let amountCardDiscountTimer = null;

function onAmountCardQtyInput(qtyInput) {
    const row = qtyInput.closest('tr');
    if (!row) return;
    const field = qtyInput.getAttribute('data-field') || '';
    if (field !== 'buyQty' && field !== 'giftQty') return;
    const oldBuyQty = qtyInput.value;
    const v = Math.max(0, parseInt(qtyInput.value || '0', 10) || 0);
    qtyInput.value = String(v);
    logProductFieldChange(row, field, oldBuyQty, String(v), 'onAmountCardQtyInput');

    const giftFlag = row.querySelector('.gift-flag-checkbox');
    const isGift = (giftFlag instanceof HTMLInputElement) ? giftFlag.checked : false;
    if (isGift && field === 'buyQty') {
        const hiddenGift = row.querySelector('input[data-field="giftQty"]');
        if (hiddenGift instanceof HTMLInputElement) hiddenGift.value = String(v);
    }

    const buyQty = Math.max(0, parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0);
    const discountInput = row.querySelector('input[data-field="discount"]');
    const discount = clampNumber(parseFloat(discountInput?.value || (isGift ? '0' : '100')) || (isGift ? 0 : 100), isGift ? 0 : 0.01, 100);
    if (discountInput) { const oldDiscount = discountInput.value; discountInput.value = discount.toFixed(2); logProductFieldChange(row, 'discount', oldDiscount, discount.toFixed(2), 'onAmountCardQtyInput'); }

    const originalPriceText = row.querySelector('.col-original')?.textContent || '¥0';
    const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
    const baseTotal = originalPrice * buyQty;
    const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
    if (finalPriceInput) { const oldFinalPrice = finalPriceInput.value; finalPriceInput.value = Number((baseTotal * (discount / 100)).toFixed(2)).toFixed(2); logProductFieldChange(row, 'finalPrice', oldFinalPrice, finalPriceInput.value, 'onAmountCardQtyInput'); }

    syncAmountCardRowToState(row);
    updateOrderSummary();
}

function onAmountCardDiscountInput(discountInput) {
    const row = discountInput.closest('tr');
    if (!row) return;
    const oldDiscountVal = discountInput.value;
    const sanitized = sanitizePriceString(discountInput.value, 2);
    discountInput.value = sanitized;
    logProductFieldChange(row, 'discount', oldDiscountVal, sanitized, 'onAmountCardDiscountInput');
    if (amountCardDiscountTimer) clearTimeout(amountCardDiscountTimer);
    amountCardDiscountTimer = setTimeout(() => {
        const v = parseFloat(discountInput.value || '0');
        const giftFlag = row.querySelector('.gift-flag-checkbox');
        const isGift = (giftFlag instanceof HTMLInputElement) ? giftFlag.checked : false;
        if (!Number.isFinite(v) || v < (isGift ? 0 : 0.01) || v > 100) {
            discountInput.value = '100.00';
            showToast('折扣需在' + (isGift ? '0-100' : '0.01-100') + '之间');
        }
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
        const originalPriceText = row.querySelector('.col-original')?.textContent || '¥0';
        const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
        const discount = parseFloat(discountInput.value || '100') || 100;
        const buyQty = Math.max(0, parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0);
        const baseTotal = originalPrice * buyQty;
        if (finalPriceInput) { const oldFP = finalPriceInput.value; finalPriceInput.value = (baseTotal * (discount / 100)).toFixed(2); logProductFieldChange(row, 'finalPrice', oldFP, finalPriceInput.value, 'onAmountCardDiscountInput'); }
        syncAmountCardRowToState(row);
        updateOrderSummary();
    }, 100);
}

function onAmountCardFinalPriceInput(finalPriceInput) {
    const row = finalPriceInput.closest('tr');
    if (!row) return;
    const oldFinalVal = finalPriceInput.value;
    const sanitized = sanitizePriceString(finalPriceInput.value, 2);
    finalPriceInput.value = sanitized;
    logProductFieldChange(row, 'finalPrice', oldFinalVal, sanitized, 'onAmountCardFinalPriceInput');
    if (amountCardDiscountTimer) clearTimeout(amountCardDiscountTimer);
    amountCardDiscountTimer = setTimeout(() => {
        updateAmountCardDiscountFromFinalPrice(finalPriceInput);
        syncAmountCardRowToState(row);
        updateOrderSummary();
    }, 100);
}

function updateAmountCardDiscountFromFinalPrice(finalPriceInput) {
    const row = finalPriceInput.closest('tr');
    if (!row) return;
    const sanitized = sanitizePriceString(finalPriceInput.value, 2);
    const finalPrice = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
    const originalPriceText = row.querySelector('.col-original')?.textContent || '¥0';
    const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
    const buyQty = Math.max(0, parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0);
    const baseTotal = originalPrice * buyQty;
    const discountInput = row.querySelector('input[data-field="discount"]');
    if (!discountInput) return;
    if (baseTotal > 0) {
        const giftFlag = row.querySelector('.gift-flag-checkbox');
        const isGift = (giftFlag instanceof HTMLInputElement) ? giftFlag.checked : false;
        const discount = clampNumber((finalPrice / baseTotal) * 100, isGift ? 0 : 0.01, 100);
        discountInput.value = discount.toFixed(2);
    } else {
        discountInput.value = '100.00';
    }
}

function syncAmountCardRowToState(row) {
    const id = Number(row.getAttribute('data-item-id'));
    const idx = selectedAmountCards.findIndex(c => c.id === id);
    if (idx < 0) return;
    const buyQty = Math.max(0, parseInt(row.querySelector('input[data-field="buyQty"]')?.value || '0', 10) || 0);
    const giftQty = Math.max(0, parseInt(row.querySelector('input[data-field="giftQty"]')?.value || '0', 10) || 0);
    const discount = parseFloat(row.querySelector('input[data-field="discount"]')?.value || '100') || 100;
    const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
    const beauticianIds = getRowBeauticianIds(row);
    selectedAmountCards[idx].buyQty = buyQty;
    selectedAmountCards[idx].giftQty = giftQty;
    selectedAmountCards[idx].discount = discount;
    selectedAmountCards[idx].finalPrice = Number(finalPrice.toFixed(2));
    selectedAmountCards[idx].beauticianIds = beauticianIds.slice();
    selectedAmountCards[idx].beautician = formatBeauticianText(beauticianIds);
    const giftFlag = row.querySelector('.gift-flag-checkbox');
    selectedAmountCards[idx].isGift = (giftFlag instanceof HTMLInputElement) ? giftFlag.checked : false;
}

function copyAmountCardRow(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const index = selectedAmountCards.findIndex(c => c.id === id);
    if (index < 0) return;
    const cloned = JSON.parse(JSON.stringify(selectedAmountCards[index]));
    cloned.id = Date.now();
    cloned.remark = '';
    cloned.isGift = !!cloned.isGift;
    if (cloned.isGift) {
        const buyQty = Number.isFinite(Number(cloned.buyQty)) ? Math.max(0, parseInt(cloned.buyQty, 10) || 0) : 0;
        cloned.giftQty = buyQty;
        cloned.discount = 0;
        cloned.finalPrice = 0;
    }
    selectedAmountCards.splice(index + 1, 0, cloned);
    renderSelectedAmountCardTable();
    showToast('已复制金额卡');
}

function deleteAmountCardRow(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const idx = selectedAmountCards.findIndex(c => c.id === id);
    if (idx > -1) {
        selectedAmountCards.splice(idx, 1);
        renderSelectedAmountCardTable();
        showToast('已删除金额卡');
    }
}

function editCustomAmountCardRow(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const card = selectedAmountCards.find(c => c.id === id);
    if (!card) return;
    if (!String(card.cardId || '').startsWith('custom-amount-')) return;

    editingCustomAmountCardId = id;
    openAddCourseModal('amountCard');
    setCourseDetailMode('custom');

    setTimeout(() => {
        clearCustomCourseDraft();

        const nameInput = document.getElementById('customCourseName');
        const validitySelect = document.getElementById('customCourseValidity');
        const priceInput = document.getElementById('customCoursePrice');
        const rechargeInput = document.getElementById('customAmountRechargeAmount');
        const giftInput = document.getElementById('customAmountGiftAmount');

        if (nameInput) nameInput.value = card.name || '';
        if (validitySelect) validitySelect.value = card.validityType || 'purchase';
        if (priceInput) priceInput.value = Number(card.price || 0).toFixed(2);
        if (rechargeInput) rechargeInput.value = Number(card.rechargeAmount || 0).toFixed(2);
        if (giftInput) giftInput.value = Number(card.giftAmount || 0).toFixed(2);

        const img = document.getElementById('customCourseImagePreview');
        const hint = document.getElementById('customCourseImageHint');
        if (img && card.imageUrl) {
            img.src = card.imageUrl;
            img.style.display = '';
            if (hint) hint.style.display = 'none';
        }

        (card.products || []).forEach(p => {
            customCourseAddRow('care', {
                name: p.name,
                spec: p.spec || '',
                duration: p.duration || '',
                price: p.price,
                buyQty: p.buyQty,
                giftQty: p.giftQty
            });
        });

        (card.homeProducts || []).forEach(p => {
            customCourseAddRow('home', {
                name: p.name,
                spec: p.spec || '',
                price: p.price,
                buyQty: p.buyQty,
                giftQty: p.giftQty
            });
        });

        (card.cardItems || []).forEach(p => {
            customCourseAddRow('card', {
                name: p.name,
                cardType: p.cardType || '有限次卡',
                price: p.price,
                giftQty: p.giftQty
            });
        });
    }, 0);
}

function copyCourseRow(btn) {
    const actionRow = btn.closest('tr');
    let itemRow = actionRow?.previousElementSibling || null;
    while (itemRow && (!(itemRow instanceof Element) || !itemRow.classList.contains('item-row'))) {
        itemRow = itemRow.previousElementSibling;
    }
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const index = selectedCourseCards.findIndex(c => c.id === id);
    if (index < 0) return;

    const cloned = JSON.parse(JSON.stringify(selectedCourseCards[index]));
    cloned.id = Date.now();
    cloned.remark = '';
    cloned.isGift = !!cloned.isGift;
    cloned.moneyCardId = '';
    cloned.moneyCards = [];
    const buyQty = Number.isFinite(Number(cloned.buyQty)) ? Math.max(0, parseInt(cloned.buyQty, 10) || 0) : 0;
    const price = Number(cloned.price || 0);
    if (cloned.isGift) {
        cloned.giftQty = buyQty;
        cloned.discount = 0;
        cloned.finalPrice = 0;
    } else {
        cloned.discount = 100;
        cloned.finalPrice = Number((price * buyQty).toFixed(2));
    }
    selectedCourseCards.splice(index + 1, 0, cloned);
    renderSelectedCourseTable();
    showToast('已复制疗程');
}

function deleteCourseRow(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const idx = selectedCourseCards.findIndex(c => c.id === id);
    if (idx > -1) {
        selectedCourseCards.splice(idx, 1);
        renderSelectedCourseTable();
        showToast('已删除疗程');
    }
}

function editCustomCourseRow(btn) {
    const actionRow = btn.closest('tr');
    const itemRow = actionRow?.previousElementSibling;
    const id = Number(itemRow?.getAttribute('data-item-id'));
    const course = selectedCourseCards.find(c => c.id === id);
    if (!course) return;
    if (!isCustomCourseCard(course)) return;

    editingCustomCourseId = id;
    openAddCourseModal();
    setCourseDetailMode('custom');

    setTimeout(() => {
        clearCustomCourseDraft();
        const nameInput = document.getElementById('customCourseName');
        const typeSelect = document.getElementById('customCourseType');
        const validitySelect = document.getElementById('customCourseValidity');
        const priceInput = document.getElementById('customCoursePrice');

        if (nameInput) nameInput.value = course.name || '';
        if (typeSelect) typeSelect.value = course.cardType || 'limited';
        if (validitySelect) validitySelect.value = course.validityType || 'purchase';
        if (priceInput) priceInput.value = Number(course.price || 0).toFixed(2);

        (course.products || []).forEach(p => {
            customCourseAddRow('care', {
                name: p.name,
                spec: p.spec || '',
                duration: p.duration,
                price: p.price,
                buyQty: p.buyQty,
                giftQty: p.giftQty
            });
        });
        (course.homeProducts || []).forEach(p => {
            customCourseAddRow('home', {
                name: p.name,
                spec: p.spec,
                price: p.price,
                buyQty: p.buyQty,
                giftQty: p.giftQty
            });
        });
        (course.cardItems || []).forEach(p => {
            customCourseAddRow('card', {
                name: p.name,
                cardType: p.cardType,
                price: p.price,
                giftQty: p.giftQty
            });
        });
    }, 0);
}

function confirmCustomCourseSelection() {
    const name = document.getElementById('customCourseName')?.value.trim() || '';
    const type = document.getElementById('customCourseType')?.value || 'limited';
    const validityType = document.getElementById('customCourseValidity')?.value || 'purchase';
    const priceStr = document.getElementById('customCoursePrice')?.value || '';
    const price = Number(priceStr);

    if (!name) {
        showToast('请输入卡片名称');
        return;
    }
    if (!Number.isFinite(price) || price < 0) {
        showToast('请输入正确的售卖价格');
        return;
    }

    const products = [];
    const homeProducts = [];
    const cardItems = [];

    const careBody = document.getElementById('customCourseCareBody');
    const homeBody = document.getElementById('customCourseHomeBody');
    const cardBody = document.getElementById('customCourseCardBody');

    if (careBody) {
        Array.from(careBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const duration = tr.dataset.duration || '';
            const p = Number(tr.dataset.price || 0);
            const buyQty = parseInt(tr.querySelector('input[data-field="buy"]')?.value || 0, 10) || 0;
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && (buyQty > 0 || giftQty > 0)) {
                products.push({ type: 'care', name: n, duration: duration, price: Number.isFinite(p) ? p : 0, buyQty, giftQty });
            }
        });
    }

    if (homeBody) {
        Array.from(homeBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const spec = tr.dataset.spec || '';
            const p = Number(tr.dataset.price || 0);
            const buyQty = parseInt(tr.querySelector('input[data-field="buy"]')?.value || 0, 10) || 0;
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && (buyQty > 0 || giftQty > 0)) {
                homeProducts.push({ type: 'home', name: n, spec: spec, price: Number.isFinite(p) ? p : 0, buyQty, giftQty });
            }
        });
    }

    if (cardBody) {
        Array.from(cardBody.querySelectorAll('tr')).forEach(tr => {
            const n = tr.dataset.name || '';
            const cardType = tr.dataset.cardType || '有限次卡';
            const p = Number(tr.dataset.price || 0);
            const giftQty = parseInt(tr.querySelector('input[data-field="gift"]')?.value || 0, 10) || 0;
            if (n && giftQty > 0) {
                cardItems.push({ type: 'card', name: n, cardType: cardType, price: Number.isFinite(p) ? p : 0, giftQty });
            }
        });
    }

    if (products.length === 0 && homeProducts.length === 0 && cardItems.length === 0) {
        showToast('请至少添加一条权益');
        return;
    }

    const validityTextMap = {
        purchase: '自购买起生效',
        firstUse: '自首次消费起生效',
        permanent: '永久有效'
    };
    const validity = validityTextMap[validityType] || '自购买起生效';

    const now = Date.now();
    const existingIndex = editingCustomCourseId ? selectedCourseCards.findIndex(c => c.id === editingCustomCourseId) : -1;
    const existing = existingIndex > -1 ? selectedCourseCards[existingIndex] : null;

    const courseCardData = {
        id: existing ? existing.id : now,
        cardId: existing ? existing.cardId : ('custom-' + now),
        name: name,
        cardType: type,
        validity: validity,
        price: Number(price.toFixed(2)),
        validityType: validityType,
        validityValue: 1,
        validityUnit: '年',
        products: products,
        homeProducts: homeProducts,
        cardItems: cardItems,
        buyQty: existing ? existing.buyQty : 1,
        giftQty: existing ? existing.giftQty : 0,
        card: existing ? (existing.card || '') : '',
        beautician: existing ? (existing.beautician || '') : '',
        discount: existing ? (existing.discount ?? 100) : 100,
        finalPrice: existing ? (existing.finalPrice ?? Number(price.toFixed(2))) : Number(price.toFixed(2)),
        remark: existing ? (existing.remark || '') : ''
    };

    if (existingIndex > -1) {
        selectedCourseCards[existingIndex] = courseCardData;
        editingCustomCourseId = null;
        showToast('已更新次卡：' + name);
    } else {
        selectedCourseCards.push(courseCardData);
        showToast('已添加次卡：' + name);
    }
    clearCustomCourseDraft();
    closeAddCourseModal();
    renderSelectedCourseTable();
}

// 确认疗程选择
function confirmCourseSelection() {
    if (!selectedCourseCard) {
        showToast('请先选择次卡');
        return;
    }

    const selectedCareItems = (selectedCourseCard.products || [])
        .filter(p => (Number(p.buyQty) || 0) > 0 || (Number(p.giftQty) || 0) > 0)
        .map(p => ({
            name: p.name,
            duration: p.duration,
            price: p.price,
            buyQty: p.buyQty,
            giftQty: p.giftQty
        }));

    const selectedHomeItems = (selectedCourseCard.homeProducts || [])
        .filter(p => (Number(p.buyQty) || 0) > 0 || (Number(p.giftQty) || 0) > 0)
        .map(p => ({
            name: p.name,
            spec: p.spec,
            price: p.price,
            buyQty: p.buyQty,
            giftQty: p.giftQty
        }));

    const selectedCardItems = (selectedCourseCard.cardItems || [])
        .filter(p => (Number(p.giftQty) || 0) > 0)
        .map(p => ({
            name: p.name,
            cardType: p.cardType,
            price: p.price,
            giftQty: p.giftQty
        }));

    // 检查是否有选中任何项目
    if (selectedCareItems.length === 0 && selectedHomeItems.length === 0 && selectedCardItems.length === 0) {
        showToast('请至少选择一个商品');
        return;
    }

    // 创建次卡数据对象
    const courseCardData = {
        id: Date.now(),
        cardId: selectedCourseCard.id,
        name: selectedCourseCard.name,
        cardType: selectedCourseCard.cardType,
        validity: selectedCourseCard.validity,
        price: selectedCourseCard.price,
        validityType: 'purchase',
        validityValue: 1,
        validityUnit: '年',
        products: selectedCareItems,
        homeProducts: selectedHomeItems,
        cardItems: selectedCardItems,
        buyQty: 1,
        giftQty: 0,
        card: '',
        beautician: '',
        discount: 100,
        finalPrice: Number(selectedCourseCard.price || 0),
        remark: ''
    };

    selectedCourseCards.push(courseCardData);
    showToast('已添加次卡：' + selectedCourseCard.name);

    // 关闭弹窗
    closeAddCourseModal();

    // 渲染已选疗程
    renderSelectedCourseTable();
}

// 渲染已选次卡到页面
function renderSelectedCourseCards() {
    const selectedItemsArea = document.querySelector('.selected-items-area');
    const emptyState = document.getElementById('main-empty-state');

    if (selectedCourseCards.length === 0) {
        // 移除所有次卡元素
        selectedItemsArea.querySelectorAll('.course-card-section').forEach(el => el.remove());
        if (emptyState) {
            emptyState.style.display = hasAnySelectedItemsContent() ? 'none' : 'flex';
        }
        // 更新订单信息和支付汇总的显示状态
        updateOrderAndPaymentVisibility();
        return;
    }

    // 隐藏空状态
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // 移除现有的次卡区域
    selectedItemsArea.querySelectorAll('.course-card-section').forEach(el => el.remove());

    // 渲染每个次卡
    selectedCourseCards.forEach((card, index) => {
        const cardSection = document.createElement('div');
        cardSection.className = 'course-card-section';
        cardSection.dataset.cardId = card.id;

        // 构建商品表格HTML
        let tablesHtml = '';

        // 护理商品表格
        if (card.products.length > 0) {
            tablesHtml += `
                <div class="course-card-table-section">
                    <div class="course-card-table-title">护理商品</div>
                    <table class="course-card-table">
                        <thead>
                            <tr>
                                <th>商品名称</th>
                                <th>服务时长</th>
                                <th>服务价格</th>
                                <th>购买数量</th>
                                <th>赠送数量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${card.products.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.duration}</td>
                                    <td>¥${p.price}</td>
                                    <td>${p.buyQty}</td>
                                    <td>${p.giftQty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 居家产品表格
        if (card.homeProducts.length > 0) {
            tablesHtml += `
                <div class="course-card-table-section">
                    <div class="course-card-table-title">居家产品</div>
                    <table class="course-card-table">
                        <thead>
                            <tr>
                                <th>商品名称</th>
                                <th>规格</th>
                                <th>售卖价格</th>
                                <th>购买数量</th>
                                <th>赠送数量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${card.homeProducts.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.spec}</td>
                                    <td>¥${p.price}</td>
                                    <td>${p.buyQty}</td>
                                    <td>${p.giftQty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 卡项表格
        if (card.cardItems.length > 0) {
            tablesHtml += `
                <div class="course-card-table-section">
                    <div class="course-card-table-title">卡项</div>
                    <table class="course-card-table">
                        <thead>
                            <tr>
                                <th>卡项名称</th>
                                <th>卡项类型</th>
                                <th>卡项价格</th>
                                <th>赠送数量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${card.cardItems.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td><span class="course-card-badge ${p.cardType === '有限次卡' ? 'badge-limited' : 'badge-unlimited'}">${p.cardType}</span></td>
                                    <td>¥${p.price}</td>
                                    <td>${p.giftQty}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // 获取有效期显示文本
        const validityTypeMap = {
            'purchase': '购买时生效',
            'firstUse': '首次消费时生效',
            'fixed': '固定有效期',
            'permanent': '永久有效'
        };
        const validityText = validityTypeMap[card.validityType] || card.validity;
        const validityDisplay = (card.validityType === 'purchase' || card.validityType === 'firstUse')
            ? `${card.validityValue}${card.validityUnit}`
            : validityText;
        const cardTypeText = card.cardType === 'limited' ? '有限次卡' : '通卡';
        const cardTypeBadgeClass = card.cardType === 'limited' ? 'badge-limited' : 'badge-unlimited';

        cardSection.innerHTML = `
            <div class="course-card-header">
                <div class="course-detail-image">
                    <span>卡图片</span>
                </div>
                <div class="course-detail-info">
                    <div class="course-detail-name">${card.name}</div>
                    <div class="course-detail-validity">${card.validity}</div>
                    <div class="course-card-price-display">
                        <span class="course-card-price-label">售卡价格</span>
                        <span class="course-card-price-value">¥${card.price}</span>
                    </div>
                    <div class="course-detail-type">
                        <span class="course-card-badge ${cardTypeBadgeClass}">${cardTypeText}</span>
                    </div>
                </div>
            </div>
            <div class="course-card-tables">
                ${tablesHtml}
            </div>
        `;

        selectedItemsArea.appendChild(cardSection);
    });

    // 更新订单信息和支付汇总的显示状态
    updateOrderAndPaymentVisibility();
}



// 弹窗关闭事件
addCourseModalClose?.addEventListener('click', closeAddCourseModal);
addCourseModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeAddCourseModal();
});

bindAddCourseTabEvents();

if (addCourseCustomBtn) {
    addCourseCustomBtn.addEventListener('click', function () {
        setCourseDetailMode('custom');
    });
}

// 搜索输入
addCourseSearchInput?.addEventListener('input', function () {
    const keyword = this.value.trim();
    const category = document.querySelector('.add-course-tab-item.active')?.dataset.category || 'all';
    renderCourseCardList(category, keyword);
});

// DOM元素
const addServiceModalOverlay = document.getElementById('addServiceModalOverlay');
const addServiceModalClose = document.getElementById('addServiceModalClose');
const addServiceSearchInput = document.getElementById('addServiceSearchInput');
const addServiceRecentList = document.getElementById('addServiceRecentList');
const addServiceSelectedList = document.getElementById('addServiceSelectedList');
const addServiceClearBtn = document.getElementById('addServiceClearBtn');
const addServiceConfirmBtn = document.getElementById('addServiceConfirmBtn');
const addServiceProductsGrid = document.getElementById('addServiceProductsGrid');

// 打开添加服务弹窗
function openAddServiceModal() {
    if (!guardAddEntryForCardOpConflict()) return;
    if (customerResetInProgress || !customerResetOk) {
        showToast('正在重置已选商品，请稍后再试');
        return;
    }
    addServiceModalOverlay.classList.add('show');
    renderRecentSearches();
    renderProducts('all');
    // 清空已选
    selectedServices = [];
    renderSelectedList();
}

// 关闭添加服务弹窗
function closeAddServiceModal() {
    addServiceModalOverlay.classList.remove('show');
    if (customCourseBenefitModalType === 'care') {
        customCourseBenefitModalType = null;
    }
    if (rechargeGiftBenefitModalType === 'care') {
        resetRechargeGiftContext();
    }
}

// 渲染最近搜索
function renderRecentSearches() {
    const maxRecent = 8;
    const recentItems = recentSearches.slice(0, maxRecent);

    if (recentItems.length === 0) {
        addServiceRecentList.innerHTML = '<span style="color: var(--neutral-400); font-size: 12px;">暂无搜索记录</span>';
        return;
    }

    addServiceRecentList.innerHTML = recentItems.map(keyword =>
        `<span class="add-service-recent-item" onclick="searchFromRecent('${keyword}')">${keyword}</span>`
    ).join('');
}

// 从最近搜索点击
function searchFromRecent(keyword) {
    addServiceSearchInput.value = keyword;
    renderProducts('all', keyword);
}

// 搜索商品
addServiceSearchInput?.addEventListener('input', function () {
    const keyword = this.value.trim();
    if (keyword) {
        // 添加到最近搜索
        addToRecentSearch(keyword);
    }
    renderProducts('all', keyword);
});

// 添加到最近搜索
function addToRecentSearch(keyword) {
    // 去除重复
    recentSearches = recentSearches.filter(k => k !== keyword);
    // 添加到开头
    recentSearches.unshift(keyword);
    // 只保留8个
    recentSearches = recentSearches.slice(0, 8);
    // 保存到localStorage
    localStorage.setItem('addServiceRecentSearches', JSON.stringify(recentSearches));
    renderRecentSearches();
}

// 渲染商品列表
function renderProducts(category = 'all', keyword = '') {
    let filtered = serviceProducts;

    // 筛选类别
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    // 筛选关键词
    if (keyword) {
        filtered = filtered.filter(p => p.name.includes(keyword));
    }

    addServiceProductsGrid.innerHTML = filtered.map(product => {
        const isSelected = selectedServices.some(s => s.id === product.id);
        return `
            <div class="add-service-product-card ${isSelected ? 'selected' : ''}" 
                 onclick="toggleServiceSelection(${product.id})">
                <div class="add-service-product-image">
                    <span>商品图片</span>
                </div>
                <div class="add-service-product-info">
                    <div class="add-service-product-name">${product.name}</div>
                    <div class="add-service-product-spec">${product.spec || ''}</div>
                    <div class="add-service-product-price">¥${product.price}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 切换商品选择
function toggleServiceSelection(productId) {
    const product = serviceProducts.find(p => p.id === productId);
    if (!product) return;

    const index = selectedServices.findIndex(s => s.id === productId);
    if (index > -1) {
        // 取消选择
        selectedServices.splice(index, 1);
    } else {
        // 添加选择
        selectedServices.push({ ...product });
    }

    renderSelectedList();
    // 更新卡片选中状态
    const card = document.querySelector(`.add-service-product-card[onclick="toggleServiceSelection(${productId})"]`);
    if (card) {
        card.classList.toggle('selected');
    }
}

// 渲染已选列表
function renderSelectedList() {
    if (selectedServices.length === 0) {
        addServiceSelectedList.innerHTML = '<div class="add-service-empty-hint">点击商品名称添加商品</div>';
        return;
    }

    addServiceSelectedList.innerHTML = selectedServices.map(service =>
        `<div class="add-service-selected-item">
            <span>${service.name}</span>
            <span class="remove-btn" onclick="removeSelectedService(${service.id})">×</span>
        </div>`
    ).join('');
}

// 移除已选商品
function removeSelectedService(serviceId) {
    selectedServices = selectedServices.filter(s => s.id !== serviceId);
    renderSelectedList();
    // 更新卡片选中状态
    const cards = document.querySelectorAll('.add-service-product-card');
    cards.forEach((card, index) => {
        const product = serviceProducts[index];
        if (product && product.id === serviceId) {
            card.classList.remove('selected');
        }
    });
}

// 清空已选
addServiceClearBtn?.addEventListener('click', function () {
    selectedServices = [];
    renderSelectedList();
    // 移除所有卡片选中状态
    document.querySelectorAll('.add-service-product-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
});

// 确定按钮
addServiceConfirmBtn?.addEventListener('click', function () {
    if (selectedServices.length === 0) {
        showToast('请至少选择一个疗程');
        return;
    }

    if (rechargeGiftBenefitModalType === 'care') {
        const count = selectedServices.length;
        addSelectedItemsToRechargeGift('care', selectedServices);
        selectedServices = [];
        renderSelectedList();
        closeAddServiceModal();
        resetRechargeGiftContext();
        showToast(`已选择 ${count} 个护理项目`);
        return;
    }

    if (courseDetailMode === 'custom' && customCourseBenefitModalType === 'care') {
        const count = selectedServices.length;
        addSelectedItemsToCustomCourse('care', selectedServices, customCourseBenefitTargetMode);
        selectedServices = [];
        renderSelectedList();
        closeAddServiceModal();
        customCourseBenefitModalType = null;
        customCourseBenefitTargetMode = 'buy';
        showToast(`已选择 ${count} 个护理项目`);
        return;
    }

    const count = selectedServices.length;
    addServicesToTable(selectedServices);
    selectedServices = [];
    renderSelectedList();
    closeAddServiceModal();
    showToast(`已添加 ${count} 个疗程`);
});

// 添加次卡到表格
function addServicesToTable(services) {
    const tableBody = document.getElementById('service-table-body');
    if (!tableBody) return;

    services.forEach(service => {
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.setAttribute('data-item-type', 'service');
        newRow.setAttribute('data-item-id', service.id);
        newRow.setAttribute('data-service-type', '单次护理');
        newRow.innerHTML = `
            <td class="col-gift-flag">
                <input type="checkbox" class="gift-flag-checkbox" onchange="onGiftFlagToggle(this)">
                <input type="hidden" data-field="gift" value="0">
            </td>
            <td class="col-name">${service.name}</td>
            <td class="col-original">¥${service.price}</td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="1" min="1" max="999" data-field="buy" oninput="onSimpleLineFieldChange(this)">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-consume">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="1" min="0" max="999" data-field="consume" oninput="updateOrderSummary()">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-card">
                <button type="button" class="use-card-btn" data-action="open-moneycard-modal">选择金额卡</button>
            </td>
            <td class="col-discount">
                <div class="discount-wrapper">
                    <input type="number" class="table-input discount-input" value="100" step="1" min="0" max="100" inputmode="decimal" data-field="discount" oninput="updateFinalPrice(this)">
                    <span class="discount-suffix">%</span>
                </div>
            </td>
            <td class="col-final">
                <input type="number" class="table-input final-price" value="${service.price}" step="0.01" min="0" inputmode="decimal" data-field="finalPrice" oninput="updateDiscount(this)">
            </td>
            <td class="col-beautician">
                <button type="button" class="row-beautician-btn" data-field="beautician" data-value="" onclick="openRowBeauticianModal(this)">选择美容师</button>
            </td>
        `;

        const actionRow = document.createElement('tr');
        actionRow.className = 'item-action-row';
        actionRow.innerHTML = `
            <td colspan="9" class="item-action-cell">
                <div class="item-action-btns">
                    <div class="item-payable">应付：<span class="item-payable-val">¥0.00</span></div>
                    <button class="table-action-btn remark" onclick="openTableRemarkModal(this)">备注</button>
                    <button class="table-action-btn copy" onclick="copyTableRow(this)">复制</button>
                    <button class="table-action-btn delete" onclick="deleteTableRow(this)">删除</button>
                </div>
            </td>
        `;

        tableBody.appendChild(newRow);
        tableBody.appendChild(actionRow);
    });

    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    updateOrderAndPaymentVisibility();
    applyGuestModeQuantityRules();
}

// 关闭弹窗事件
addServiceModalClose?.addEventListener('click', closeAddServiceModal);
addServiceModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeAddServiceModal();
});

// 类别选择
document.querySelectorAll('.add-service-category-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.add-service-category-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const category = this.getAttribute('data-category');
        const keyword = addServiceSearchInput?.value || '';
        renderProducts(category, keyword);
    });
});

// ========== 添加产品弹窗相关 ==========
// 模拟产品数据
const productItems = [
    { id: 101, name: '皙之密焕活润肤乳', category: 'skincare', spec: '50ml', stock: 25, price: 200, unit: '瓶' },
    { id: 102, name: '皙之密清透洁面乳', category: 'skincare', spec: '100ml', stock: 18, price: 168, unit: '支' },
    { id: 103, name: '皙之密水润焕肤精华', category: 'skincare', spec: '30ml', stock: 12, price: 458, unit: '瓶' },
    { id: 104, name: '皙之密紧致修护眼霜', category: 'skincare', spec: '15ml', stock: 8, price: 388, unit: '支' },
    { id: 105, name: '皙之密深层补水面膜', category: 'skincare', spec: '5片装', stock: 45, price: 198, unit: '盒' },
    { id: 106, name: '皙之密控油洁面泡沫', category: 'skincare', spec: '150ml', stock: 0, price: 148, unit: '瓶' },
    { id: 107, name: '皙之密亮肤精华液', category: 'skincare', spec: '20ml', stock: 3, price: 528, unit: '瓶' },
    { id: 108, name: '皙之密柔润身体乳', category: 'skincare', spec: '200ml', stock: 32, price: 238, unit: '瓶' },
    { id: 109, name: '皙之密温和卸妆油', category: 'makeup', spec: '120ml', stock: 15, price: 188, unit: '瓶' },
    { id: 110, name: '皙之密防晒隔离霜', category: 'makeup', spec: '30g', stock: 22, price: 258, unit: '支' },
    { id: 111, name: '皙之密营养修护霜', category: 'skincare', spec: '50g', stock: 10, price: 368, unit: '罐' },
    { id: 112, name: '皙之密清爽凝胶', category: 'skincare', spec: '80ml', stock: 5, price: 198, unit: '瓶' },
    { id: 113, name: '皙之密化妆套刷', category: 'tools', spec: '7件套', stock: 12, price: 168, unit: '套' },
    { id: 114, name: '皙之密美妆蛋', category: 'tools', spec: '3个装', stock: 28, price: 68, unit: '盒' },
    { id: 115, name: '皙之密护肤套装', category: '套装', spec: '5件套', stock: 8, price: 1288, unit: '套' },
];

// 已选产品列表
let selectedProducts = [];
// 最近搜索列表
let productRecentSearches = JSON.parse(localStorage.getItem('addProductRecentSearches') || '[]');
// 当前排序
let productSortField = '';
let productSortOrder = '';
let addProductModalSource = null;

// DOM元素
const addProductModalOverlay = document.getElementById('addProductModalOverlay');
const addProductModalClose = document.getElementById('addProductModalClose');
const addProductSearchInput = document.getElementById('addProductSearchInput');
const addProductRecentList = document.getElementById('addProductRecentList');
const addProductSelectedList = document.getElementById('addProductSelectedList');
const addProductClearBtn = document.getElementById('addProductClearBtn');
const addProductConfirmBtn = document.getElementById('addProductConfirmBtn');
const addProductTableBody = document.getElementById('addProductTableBody');

// 打开添加产品弹窗
function openAddProductModal() {
    if (!guardAddEntryForCardOpConflict()) return;
    if (customerResetInProgress || !customerResetOk) {
        showToast('正在重置已选商品，请稍后再试');
        return;
    }
    const isAddCourseOpen = !!(addCourseModalOverlay && addCourseModalOverlay.classList.contains('show'));
    const isCustomCourseHome = isAddCourseOpen && courseDetailMode === 'custom' && customCourseBenefitModalType === 'home';
    addProductModalSource = isCustomCourseHome ? 'customCourseHome' : 'page';
    if (!isCustomCourseHome && customCourseBenefitModalType === 'home') {
        customCourseBenefitModalType = null;
    }
    const title = addProductModalOverlay?.querySelector('.add-service-modal-title');
    if (title) title.textContent = isCustomCourseHome ? '添加居家产品' : '添加产品';
    addProductModalOverlay.classList.add('show');
    renderProductRecentSearches();
    renderProductTable();
    // 清空已选
    selectedProducts = [];
    renderProductSelectedList();
}

// 关闭添加产品弹窗
function closeAddProductModal() {
    addProductModalOverlay.classList.remove('show');
    if (addProductModalSource === 'customCourseHome' && customCourseBenefitModalType === 'home') {
        customCourseBenefitModalType = null;
    }
    addProductModalSource = null;
    if (rechargeGiftBenefitModalType === 'home') {
        resetRechargeGiftContext();
    }
}

// 渲染最近搜索
function renderProductRecentSearches() {
    const maxRecent = 8;
    const recentItems = productRecentSearches.slice(0, maxRecent);

    if (recentItems.length === 0) {
        addProductRecentList.innerHTML = '<span style="color: var(--neutral-400); font-size: 12px;">暂无搜索记录</span>';
        return;
    }

    addProductRecentList.innerHTML = recentItems.map(keyword =>
        `<span class="add-service-recent-item" onclick="searchProductFromRecent('${keyword}')">${keyword}</span>`
    ).join('');
}

// 从最近搜索点击
function searchProductFromRecent(keyword) {
    addProductSearchInput.value = keyword;
    renderProductTable();
}

// 搜索商品
addProductSearchInput?.addEventListener('input', function () {
    const keyword = this.value.trim();
    if (keyword) {
        addProductToRecentSearch(keyword);
    }
    renderProductTable();
});

// 添加到最近搜索
function addProductToRecentSearch(keyword) {
    productRecentSearches = productRecentSearches.filter(k => k !== keyword);
    productRecentSearches.unshift(keyword);
    productRecentSearches = productRecentSearches.slice(0, 8);
    localStorage.setItem('addProductRecentSearches', JSON.stringify(productRecentSearches));
    renderProductRecentSearches();
}

// 渲染产品表格
function renderProductTable() {
    let filtered = [...productItems];

    // 筛选关键词
    const keyword = addProductSearchInput?.value.trim() || '';
    if (keyword) {
        filtered = filtered.filter(p => p.name.includes(keyword));
    }

    // 排序
    if (productSortField) {
        filtered.sort((a, b) => {
            let valA = a[productSortField];
            let valB = b[productSortField];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (productSortOrder === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
    }

    addProductTableBody.innerHTML = filtered.map(product => {
        const isSelected = selectedProducts.some(s => s.id === product.id);

        return `
            <tr class="${isSelected ? 'selected' : ''}" data-id="${product.id}">
                <td class="col-name">${product.name}</td>
                <td>${product.spec}</td>
                <td class="col-stock">${product.stock}</td>
                <td class="col-price">¥${product.price}</td>
                <td>${product.unit}</td>
                <td>
                    <button class="select-btn" onclick="toggleProductSelection(${product.id}, event)">选择</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 排序点击
document.querySelectorAll('.add-product-table th.sortable').forEach(th => {
    th.addEventListener('click', function () {
        const field = this.getAttribute('data-sort');

        // 清除其他排序状态
        document.querySelectorAll('.add-product-table th.sortable').forEach(t => {
            t.classList.remove('sort-asc', 'sort-desc');
        });

        // 切换排序顺序
        if (productSortField === field) {
            if (productSortOrder === 'asc') {
                productSortOrder = 'desc';
                this.classList.add('sort-desc');
            } else {
                productSortField = '';
                productSortOrder = '';
            }
        } else {
            productSortField = field;
            productSortOrder = 'asc';
            this.classList.add('sort-asc');
        }

        renderProductTable();
    });
});

// 切换商品选择
function toggleProductSelection(productId, event) {
    if (event) event.stopPropagation();

    const product = productItems.find(p => p.id === productId);
    if (!product) return;

    const index = selectedProducts.findIndex(s => s.id === productId);
    if (index > -1) {
        // 取消选择
        selectedProducts.splice(index, 1);
    } else {
        // 添加选择
        selectedProducts.push({ ...product });
    }

    renderProductSelectedList();
    // 更新行选中状态
    const row = document.querySelector(`#addProductTableBody tr[data-id="${productId}"]`);
    if (row) {
        row.classList.toggle('selected');
    }
}

// 行点击选中
addProductTableBody?.addEventListener('click', function (e) {
    const row = e.target.closest('tr');
    if (row && e.target.tagName !== 'BUTTON') {
        const id = parseInt(row.getAttribute('data-id'));
        toggleProductSelection(id);
    }
});

// 渲染已选列表
function renderProductSelectedList() {
    if (selectedProducts.length === 0) {
        addProductSelectedList.innerHTML = '<div class="add-service-empty-hint">点击商品名称添加商品</div>';
        return;
    }

    addProductSelectedList.innerHTML = selectedProducts.map(product =>
        `<div class="add-service-selected-item">
            <span>${product.name}</span>
            <span class="remove-btn" onclick="removeSelectedProduct(${product.id})">×</span>
        </div>`
    ).join('');
}

// 移除已选商品
function removeSelectedProduct(productId) {
    selectedProducts = selectedProducts.filter(s => s.id !== productId);
    renderProductSelectedList();
    // 更新行选中状态
    const row = document.querySelector(`#addProductTableBody tr[data-id="${productId}"]`);
    if (row) {
        row.classList.remove('selected');
    }
}

// 清空已选
addProductClearBtn?.addEventListener('click', function () {
    selectedProducts = [];
    renderProductSelectedList();
    // 移除所有行选中状态
    document.querySelectorAll('#addProductTableBody tr.selected').forEach(row => {
        row.classList.remove('selected');
    });
});

// 确定按钮
if (addProductConfirmBtn) {
    addProductConfirmBtn.addEventListener('click', function () {
        if (selectedProducts.length === 0) {
            showToast('请至少选择一个产品');
            return;
        }

        const count = selectedProducts.length;

        if (rechargeGiftBenefitModalType === 'home') {
            addSelectedItemsToRechargeGift('home', selectedProducts);
            selectedProducts = [];
            renderProductSelectedList();
            closeAddProductModal();
            resetRechargeGiftContext();
            showToast(`已选择 ${count} 个产品`);
            return;
        }

        if (addProductModalSource === 'customCourseHome') {
            addSelectedItemsToCustomCourse('home', selectedProducts, customCourseBenefitTargetMode);
            selectedProducts = [];
            renderProductSelectedList();
            closeAddProductModal();
            customCourseBenefitTargetMode = 'buy';
            showToast(`已选择 ${count} 个产品`);
            return;
        }

        addProductsToProductTable(selectedProducts);

        // 清空已选列表
        selectedProducts = [];
        renderProductSelectedList();

        // 确保弹窗关闭
        closeAddProductModal();

        showToast(`已选择 ${count} 个产品`);
    });
} else {
    console.error('未找到添加产品确定按钮');
}

// 添加产品到表格
function addProductsToProductTable(products) {
    const tableBody = document.getElementById('product-table-body');

    if (!tableBody) return;

    products.forEach(product => {
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.setAttribute('data-item-type', 'product');
        newRow.setAttribute('data-item-id', product.id);

        newRow.innerHTML = `
            <td class="col-gift-flag">
                <input type="checkbox" class="gift-flag-checkbox" onchange="onGiftFlagToggle(this)">
                <input type="hidden" data-field="gift" value="0">
            </td>
            <td class="col-name">${product.name}</td>
            <td class="col-original">¥${product.price}</td>
            <td class="col-qty">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="1" min="1" max="999" data-field="buy" oninput="onSimpleLineFieldChange(this)">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-consume">
                <div class="table-stepper">
                    <div class="table-stepper-btn" onclick="tableStepDown(this)">
                        <svg viewBox="0 0 24 24"><path d="M20 12H4v-2h16v2z"/></svg>
                    </div>
                    <input type="number" class="table-stepper-value" value="1" min="0" max="999" data-field="consume" oninput="updateOrderSummary()">
                    <div class="table-stepper-btn" onclick="tableStepUp(this)">
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </div>
                </div>
            </td>
            <td class="col-card">
                <button type="button" class="use-card-btn" data-action="open-moneycard-modal">选择金额卡</button>
            </td>
            <td class="col-discount">
                <div class="discount-wrapper">
                    <input type="number" class="table-input discount-input" value="100" step="1" min="0" max="100" inputmode="decimal" data-field="discount" oninput="updateFinalPrice(this)">
                    <span class="discount-suffix">%</span>
                </div>
            </td>
            <td class="col-final">
                <input type="number" class="table-input final-price" value="${product.price}" step="0.01" min="0" inputmode="decimal" data-field="finalPrice" oninput="updateDiscount(this)">
            </td>
            <td class="col-beautician">
                <button type="button" class="row-beautician-btn" data-field="beautician" data-value="" onclick="openRowBeauticianModal(this)">选择美容师</button>
            </td>
        `;

        // 创建操作行
        const actionRow = document.createElement('tr');
        actionRow.className = 'item-action-row';
        actionRow.innerHTML = `
            <td colspan="9" class="item-action-cell">
                <div class="item-action-btns">
                    <div class="item-payable">应付：<span class="item-payable-val">¥0.00</span></div>
                    <button class="table-action-btn remark" onclick="openTableRemarkModal(this)">备注</button>
                    <button class="table-action-btn copy" onclick="copyTableRow(this)">复制</button>
                    <button class="table-action-btn delete" onclick="deleteTableRow(this)">删除</button>
                </div>
            </td>
        `;

        tableBody.appendChild(newRow);
        tableBody.appendChild(actionRow);
    });

    // 更新统计
    updateSelectedItemsEmptyStates();
    updateOrderSummary();
    // 更新订单信息和支付汇总的显示状态
    updateOrderAndPaymentVisibility();
    normalizeAndRenderMoneyCards();
    applyGuestModeQuantityRules();
    applyMemberModeProductConsumeSync();
}

// 关闭弹窗事件
addProductModalClose?.addEventListener('click', closeAddProductModal);
addProductModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeAddProductModal();
});

// 产品分类切换
let productCurrentCategory = 'all';
document.querySelectorAll('.add-product-category-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.add-product-category-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        productCurrentCategory = this.getAttribute('data-category');
        renderProductTable();
    });
});

// 修改renderProductTable函数支持分类筛选
const originalRenderProductTable = renderProductTable;
renderProductTable = function () {
    let filtered = [...productItems];

    // 筛选分类
    if (productCurrentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === productCurrentCategory);
    }

    // 筛选关键词
    const keyword = addProductSearchInput?.value.trim() || '';
    if (keyword) {
        filtered = filtered.filter(p => p.name.includes(keyword));
    }

    // 排序
    if (productSortField) {
        filtered.sort((a, b) => {
            let valA = a[productSortField];
            let valB = b[productSortField];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (productSortOrder === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });
    }

    addProductTableBody.innerHTML = filtered.map(product => {
        const isSelected = selectedProducts.some(s => s.id === product.id);

        return `
            <tr class="${isSelected ? 'selected' : ''}" data-id="${product.id}">
                <td class="col-name">${product.name}</td>
                <td>${product.spec}</td>
                <td class="col-stock">${product.stock}</td>
                <td class="col-price">¥${product.price}</td>
                <td>${product.unit}</td>
                <td>
                    <button class="select-btn" onclick="toggleProductSelection(${product.id}, event)">选择</button>
                </td>
            </tr>
        `;
    }).join('');
};

// ========== 添加卡项弹窗相关 ==========
const cardItemProducts = [
    { id: 201, name: '面部护理次卡', cardType: '有限次卡', price: 1200 },
    { id: 202, name: '身体护理次卡', cardType: '有限次卡', price: 2500 },
    { id: 203, name: '美甲无限次卡', cardType: '通卡', price: 3000 },
    { id: 204, name: '通享卡', cardType: '通卡', price: 5000 },
    { id: 205, name: '肩颈调理次卡', cardType: '有限次卡', price: 980 },
    { id: 206, name: '全店通用畅享卡', cardType: '通卡', price: 6999 },
    { id: 301, name: '储值金卡', cardType: '金额卡', price: 3000, faceValue: 3000, validity: '2026-06-01 至 2027-06-01', rules: '可用于全店项目/产品抵扣，部分促销不可叠加' },
    { id: 302, name: '储值钻石卡', cardType: '金额卡', price: 5000, faceValue: 5000, validity: '2026-06-01 至 2028-06-01', rules: '可用于全店项目/产品抵扣，可与会员折扣叠加' },
    { id: 303, name: '新客体验储值卡', cardType: '金额卡', price: 1000, faceValue: 1000, validity: '自购买起1年有效', rules: '限首次到店客户使用，不可退款不可转赠' },
];

let selectedCardItemProducts = [];
const addCardItemModalOverlay = document.getElementById('addCardItemModalOverlay');
const addCardItemModalClose = document.getElementById('addCardItemModalClose');
const addCardItemSearchInput = document.getElementById('addCardItemSearchInput');
const addCardItemRecentSearch = document.getElementById('addCardItemRecentSearch');
const addCardItemRecentList = document.getElementById('addCardItemRecentList');
const addCardItemRecentClearBtn = document.getElementById('addCardItemRecentClearBtn');
const addCardItemSelectedList = document.getElementById('addCardItemSelectedList');
const addCardItemClearBtn = document.getElementById('addCardItemClearBtn');
const addCardItemConfirmBtn = document.getElementById('addCardItemConfirmBtn');
const addCardItemGrid = document.getElementById('addCardItemGrid');
let cardItemRecentSearches = JSON.parse(localStorage.getItem('addCardItemRecentSearches') || '[]');

function renderCardItemRecentSearches() {
    if (!addCardItemRecentSearch || !addCardItemRecentList) return;
    const items = (cardItemRecentSearches || []).slice(0, 5);
    if (items.length === 0) {
        addCardItemRecentSearch.style.display = 'flex';
        addCardItemRecentList.innerHTML = '<span style="color: var(--neutral-400); font-size: 12px;">暂无搜索记录</span>';
        if (addCardItemRecentClearBtn) addCardItemRecentClearBtn.disabled = true;
        return;
    }
    addCardItemRecentSearch.style.display = 'flex';
    if (addCardItemRecentClearBtn) addCardItemRecentClearBtn.disabled = false;
    addCardItemRecentList.innerHTML = items.map(keyword => {
        const safe = String(keyword);
        const enc = encodeURIComponent(safe);
        return `
            <span class="add-service-recent-item" data-keyword-enc="${enc}">
                <span>${safe}</span>
                <button type="button" class="add-service-recent-item-remove" data-action="remove" aria-label="删除">×</button>
            </span>
        `;
    }).join('');
}

function addCardItemToRecentSearch(keyword) {
    const trimmed = String(keyword || '').trim();
    if (!trimmed) return;
    cardItemRecentSearches = (cardItemRecentSearches || []).filter(k => k !== trimmed);
    cardItemRecentSearches.unshift(trimmed);
    cardItemRecentSearches = cardItemRecentSearches.slice(0, 10);
    localStorage.setItem('addCardItemRecentSearches', JSON.stringify(cardItemRecentSearches));
    renderCardItemRecentSearches();
}

function submitCardItemSearch(keyword) {
    const trimmed = String(keyword || '').trim();
    if (!trimmed) return;
    if (addCardItemSearchInput) addCardItemSearchInput.value = trimmed;
    addCardItemToRecentSearch(trimmed);
    const active = document.querySelector('.add-card-item-category-item.active')?.getAttribute('data-category') || 'all';
    renderCardItemGrid(active, trimmed);
}

function closeAddCardItemModal() {
    addCardItemModalOverlay?.classList.remove('show');
    if (customCourseBenefitModalType === 'card') {
        customCourseBenefitModalType = null;
    }
    if (rechargeGiftBenefitModalType === 'card') {
        resetRechargeGiftContext();
    }
}

function renderCardItemSelectedList() {
    if (!addCardItemSelectedList) return;
    if (selectedCardItemProducts.length === 0) {
        addCardItemSelectedList.innerHTML = '<div class="add-service-empty-hint">点击卡项名称添加卡项</div>';
        return;
    }
    addCardItemSelectedList.innerHTML = selectedCardItemProducts.map(item =>
        `<div class="add-service-selected-item">
            <span>${item.name}</span>
            <span class="remove-btn" onclick="removeSelectedCardItem(${item.id})">×</span>
        </div>`
    ).join('');
}

function removeSelectedCardItem(id) {
    selectedCardItemProducts = selectedCardItemProducts.filter(i => i.id !== id);
    renderCardItemSelectedList();
    const card = document.querySelector(`.add-service-product-card[onclick="toggleCardItemSelection(${id})"]`);
    if (card) card.classList.remove('selected');
}

function toggleCardItemSelection(id) {
    const item = cardItemProducts.find(p => p.id === id);
    if (!item) return;
    const index = selectedCardItemProducts.findIndex(i => i.id === id);
    if (index > -1) {
        selectedCardItemProducts.splice(index, 1);
    } else {
        selectedCardItemProducts.push({ ...item });
    }
    renderCardItemSelectedList();
    const cardEl = document.querySelector(`.add-service-product-card[onclick="toggleCardItemSelection(${id})"]`);
    if (cardEl) cardEl.classList.toggle('selected');
}

function renderCardItemGrid(category = 'all', keyword = '') {
    if (!addCardItemGrid) return;
    let filtered = [...cardItemProducts];
    if (category !== 'all') {
        filtered = filtered.filter(p => p.cardType === category);
    }
    if (keyword) {
        filtered = filtered.filter(p => p.name.includes(keyword));
    }
    addCardItemGrid.innerHTML = filtered.map(item => {
        const isSelected = selectedCardItemProducts.some(s => s.id === item.id);
        const amount = Number.isFinite(Number(item.faceValue)) ? Number(item.faceValue) : (Number.isFinite(Number(item.price)) ? Number(item.price) : 0);
        return `
            <div class="add-service-product-card ${isSelected ? 'selected' : ''}" onclick="toggleCardItemSelection(${item.id})">
                <div class="add-service-product-info">
                    <div class="add-service-product-name">${item.name}</div>
                    <div class="add-service-product-price">¥${amount}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function openAddCardItemModal() {
    try {
        if (!addCardItemModalOverlay) throw new Error('modal missing');
        addCardItemModalOverlay.classList.add('show');
        selectedCardItemProducts = [];
        renderCardItemSelectedList();
        renderCardItemRecentSearches();
        const keyword = addCardItemSearchInput?.value.trim() || '';
        const active = document.querySelector('.add-card-item-category-item.active')?.getAttribute('data-category') || 'all';
        renderCardItemGrid(active, keyword);
    } catch (e) {
        console.error(e);
        showToast('加载失败，请稍后重试');
        customCourseBenefitModalType = null;
    }
}

addCardItemModalClose?.addEventListener('click', closeAddCardItemModal);
addCardItemModalOverlay?.addEventListener('click', function (e) {
    if (e.target === this) closeAddCardItemModal();
});

addCardItemSearchInput?.addEventListener('input', function () {
    const keyword = this.value.trim();
    const active = document.querySelector('.add-card-item-category-item.active')?.getAttribute('data-category') || 'all';
    renderCardItemGrid(active, keyword);
});

addCardItemSearchInput?.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const keyword = this.value.trim();
    if (!keyword) return;
    submitCardItemSearch(keyword);
});

addCardItemRecentList?.addEventListener('click', function (e) {
    const removeBtn = e.target.closest('button[data-action="remove"]');
    const itemEl = e.target.closest('.add-service-recent-item');
    const enc = itemEl?.getAttribute('data-keyword-enc') || '';
    let keyword = '';
    try {
        keyword = decodeURIComponent(enc);
    } catch {
        keyword = enc;
    }
    if (!keyword) return;

    if (removeBtn) {
        cardItemRecentSearches = (cardItemRecentSearches || []).filter(k => k !== keyword);
        localStorage.setItem('addCardItemRecentSearches', JSON.stringify(cardItemRecentSearches));
        renderCardItemRecentSearches();
        return;
    }

    submitCardItemSearch(keyword);
});

addCardItemRecentClearBtn?.addEventListener('click', function () {
    cardItemRecentSearches = [];
    localStorage.setItem('addCardItemRecentSearches', JSON.stringify(cardItemRecentSearches));
    renderCardItemRecentSearches();
});

document.querySelectorAll('.add-card-item-category-item').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.add-card-item-category-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        const category = this.getAttribute('data-category');
        const keyword = addCardItemSearchInput?.value.trim() || '';
        renderCardItemGrid(category, keyword);
    });
});

addCardItemClearBtn?.addEventListener('click', function () {
    selectedCardItemProducts = [];
    renderCardItemSelectedList();
    document.querySelectorAll('#addCardItemGrid .add-service-product-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
});

addCardItemConfirmBtn?.addEventListener('click', function () {
    if (selectedCardItemProducts.length === 0) {
        showToast('请至少选择一个卡项');
        return;
    }

    if (rechargeGiftBenefitModalType === 'card') {
        const count = selectedCardItemProducts.length;
        addSelectedItemsToRechargeGift('card', selectedCardItemProducts);
        selectedCardItemProducts = [];
        renderCardItemSelectedList();
        closeAddCardItemModal();
        resetRechargeGiftContext();
        showToast(`已选择 ${count} 个卡项`);
        return;
    }

    if (courseDetailMode === 'custom' && customCourseBenefitModalType === 'card') {
        const count = selectedCardItemProducts.length;
        addSelectedItemsToCustomCourse('card', selectedCardItemProducts, customCourseBenefitTargetMode);
        selectedCardItemProducts = [];
        renderCardItemSelectedList();
        closeAddCardItemModal();
        customCourseBenefitModalType = null;
        customCourseBenefitTargetMode = 'buy';
        showToast(`已选择 ${count} 个卡项`);
        return;
    }

    closeAddCardItemModal();
});

const MONEY_CARD_OPTIONS = [
    { id: 'mc_001', baseId: 'mc_001', balanceType: 'cash', name: '樱粉金额卡', balance: 1280.00, discounts: { care: 8, home: 9, item: 8.5 } },
    { id: 'mc_001__gift', baseId: 'mc_001', balanceType: 'gift', name: '樱粉金额卡', balance: 50.00, discounts: { care: 8, home: 9, item: 8.5 } },
    { id: 'mc_002', baseId: 'mc_002', balanceType: 'cash', name: '玫瑰臻享卡', balance: 3560.50, discounts: { care: 7.5, home: 8.8, item: 8 } },
    { id: 'mc_002__gift', baseId: 'mc_002', balanceType: 'gift', name: '玫瑰臻享卡', balance: 520.00, discounts: { care: 7.5, home: 8.8, item: 8 } },
    { id: 'mc_003', baseId: 'mc_003', balanceType: 'cash', name: '铂金尊享卡', balance: 8920.00, discounts: { care: 6.8, home: 8, item: 7 } },
    { id: 'mc_003__gift', baseId: 'mc_003', balanceType: 'gift', name: '铂金尊享卡', balance: 980.00, discounts: { care: 6.8, home: 8, item: 7 } }
];

const moneyCardModalOverlay = document.getElementById('moneyCardModalOverlay');
const moneyCardModalTitle = document.getElementById('moneyCardModalTitle');
const moneyCardList = document.getElementById('moneyCardList');
const moneyCardCancelBtn = document.getElementById('moneyCardCancelBtn');
const moneyCardConfirmBtn = document.getElementById('moneyCardConfirmBtn');

const moneyCardModalState = {
    row: null,
    originalId: '',
    pendingId: '',
    itemId: '',
    itemType: '',
    mode: 'add',
    editIndex: -1
};

const moneyCardById = new Map(MONEY_CARD_OPTIONS.map(c => [String(c.id), c]));

function roundMoney2(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.round(x * 100) / 100;
}

function toFen(yuan) {
    return Math.round(Number(yuan) * 100);
}

function toYuan(fen) {
    return Math.round(Number(fen)) / 100;
}

function getRowMoneyCards(row) {
    if (!(row instanceof Element)) return [];
    const raw = row.getAttribute('data-moneycards') || '';
    if (!raw) {
        const legacyId = String(row.getAttribute('data-money-card-id') || '').trim();
        return legacyId ? [{ cardId: legacyId, amount: 0 }] : [];
    }
    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr
            .map(x => ({
                cardId: String(x?.cardId || ''),
                amount: roundMoney2(Number(x?.amount || 0))
            }))
            .filter(x => !!x.cardId);
    } catch {
        return [];
    }
}

function setRowMoneyCards(row, apps) {
    if (!(row instanceof Element)) return;
    const safe = Array.isArray(apps)
        ? apps
            .map(x => ({ cardId: String(x?.cardId || ''), amount: roundMoney2(Number(x?.amount || 0)) }))
            .filter(x => !!x.cardId)
        : [];
    if (safe.length === 0) {
        row.removeAttribute('data-moneycards');
    } else {
        row.setAttribute('data-moneycards', JSON.stringify(safe));
    }
    const first = safe[0] ? moneyCardById.get(String(safe[0].cardId)) : null;
    if (first) {
        row.setAttribute('data-money-card-id', first.id);
        row.setAttribute('data-money-card-name', first.name);
        row.setAttribute('data-money-card-discount', buildMoneyCardDiscountText(first));
    } else {
        row.removeAttribute('data-money-card-id');
        row.removeAttribute('data-money-card-name');
        row.removeAttribute('data-money-card-discount');
    }
}

function syncMoneyCardsToCourseData(row) {
    const itemType = row?.getAttribute?.('data-item-type') || '';
    if (itemType !== 'course') return;
    const itemId = row?.getAttribute?.('data-item-id') || '';
    const course = (typeof selectedCourseCards !== 'undefined' && Array.isArray(selectedCourseCards))
        ? selectedCourseCards.find(x => String(x.id) === String(itemId))
        : null;
    if (!course) return;
    course.moneyCards = getRowMoneyCards(row);
}

function getRowBuyQty(row) {
    if (!(row instanceof Element)) return 0;
    const courseQty = row.querySelector('input[data-field="buyQty"]');
    const qtyEl = courseQty || row.querySelector('input[data-field="buy"]');
    const n = parseInt(String(qtyEl?.value || '0'), 10) || 0;
    return Math.max(0, n);
}

function getRowFinalUnitPrice(row) {
    if (!(row instanceof Element)) return 0;
    const v = row.querySelector('input[data-field="finalPrice"]')?.value || '0';
    const n = parseFloat(String(v)) || 0;
    return Math.max(0, n);
}

function getRowLineFinalTotal(row) {
    const total = getRowFinalUnitPrice(row);
    return roundMoney2(total);
}

function getRowDiscountKey(row) {
    const t = row?.getAttribute?.('data-item-type') || '';
    if (t === 'product') return 'home';
    if (t === 'course' || t === 'service') return 'care';
    return 'item';
}

function getDiscountRateForRow(card, row) {
    const key = getRowDiscountKey(row);
    const d = Number(card?.discounts?.[key]);
    if (!Number.isFinite(d) || d <= 0) return 1;
    return Math.max(0, Math.min(1, d / 10));
}

// 计算 baseFinalWithMoneyCard：商品原始总价值 - Σ(划扣金额还原折扣后原价值累加) + Σ(划扣金额累加)
function computeBaseFinalWithMoneyCard(row) {
    if (!(row instanceof Element)) return 0;

    const originalPriceText = row.querySelector('.col-original')?.textContent || '';
    const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
    const buyInput = row.querySelector('input[data-field="buy"]') || row.querySelector('input[data-field="buyQty"]');
    const buyQty = Math.max(0, parseInt(String(buyInput?.value || '0'), 10) || 0);
    const baseTotal = originalPrice * buyQty;

    const apps = getRowMoneyCards(row);

    let reversedOriginalSum = 0;
    let deductedSum = 0;

    apps.forEach(app => {
        const card = moneyCardById.get(String(app.cardId));
        if (!card) return;
        const deductedAmount = roundMoney2(Number(app.amount || 0));
        if (!(deductedAmount > 0.000001)) return;

        const discountKey = getRowDiscountKey(row);
        const discountVal = Number(card?.discounts?.[discountKey]);
        if (Number.isFinite(discountVal) && discountVal > 0) {
            // 划扣金额 / (折扣/10) = 划扣金额还原至折扣前的原价值
            reversedOriginalSum += roundMoney2(deductedAmount * 10 / discountVal);
        } else {
            reversedOriginalSum += deductedAmount;
        }
        deductedSum += deductedAmount;
    });

    const result = roundMoney2(baseTotal - reversedOriginalSum + deductedSum);
    row.dataset.baseFinalWithMoneyCard = result.toFixed(2);
    console.log('[computeBaseFinalWithMoneyCard]', {
        rowId: row.dataset.rowId || row.dataset.productId || '(unknown)',
        baseTotal: baseTotal.toFixed(2),
        reversedOriginalSum: reversedOriginalSum.toFixed(2),
        deductedSum: deductedSum.toFixed(2),
        result: result.toFixed(2)
    });
    return result;
}

function syncRowDiscountFromMoneyCards(row, apps, options = {}) {
    if (!(row instanceof Element)) return;
    const discountInput = row.querySelector('input[data-field="discount"]');
    if (!(discountInput instanceof HTMLInputElement)) return;
    if (apps.length === 0) {
        const resetWhenEmpty = options?.resetWhenEmpty === true;
        if (resetWhenEmpty) {
            suppressMoneyCardConflict = true;
            discountInput.value = '100';
            updateFinalPrice(discountInput);
            suppressMoneyCardConflict = false;
            if (row.dataset?.userDiscountOverride) delete row.dataset.userDiscountOverride;
            if (row.dataset?.originalCardDiscount) delete row.dataset.originalCardDiscount;
            if (row.dataset?.originalCardPrice) delete row.dataset.originalCardPrice;
        }
        return;
    }
}

function clearRowMoneyCards(row, options = {}) {
    if (!(row instanceof Element)) return;
    const preserveDiscount = options?.preserveDiscount === true;
    if (row.dataset?.moneycardTouched) delete row.dataset.moneycardTouched;

    // 删除金额卡后移除整单优惠（PRD规则，须在恢复折扣前执行，否则折扣输入框可能被禁用）
    if (wholeOrderChangeState?.enabled) {
        removeWholeOrderChange();
    }

    setRowMoneyCards(row, []);
    syncMoneyCardsToCourseData(row);
    removeMoneyCardDetailRow(row);

    if (!preserveDiscount) {
        if (row.dataset?.userDiscountOverride) delete row.dataset.userDiscountOverride;
        if (row.dataset?.originalCardDiscount) delete row.dataset.originalCardDiscount;
        if (row.dataset?.originalCardPrice) delete row.dataset.originalCardPrice;
        const discountInput = row.querySelector('input[data-field="discount"]');
        if (discountInput instanceof HTMLInputElement) {
            suppressMoneyCardConflict = true;
            discountInput.value = '100';
            updateFinalPrice(discountInput);
            suppressMoneyCardConflict = false;
        }
    }

    const lineTotal = getRowLineFinalTotal(row);
    const actionRow = findActionRowForItemRow(row);
    const valEl = ensureActionRowPayable(actionRow);
    if (valEl) valEl.textContent = `¥${roundMoney2(lineTotal).toFixed(2)}`;
    setChooseBtnState(row, lineTotal);
    updateMoneyCardStackReminderForRow(row, valEl ? parseYuanText(valEl.textContent) : lineTotal);
    computeBaseFinalWithMoneyCard(row);
}

function findActionRowForItemRow(itemRow) {
    let cur = itemRow?.nextElementSibling || null;
    while (cur) {
        if (cur instanceof Element && cur.classList.contains('item-action-row')) return cur;
        cur = cur.nextElementSibling;
    }
    return null;
}

function ensureActionRowPayable(actionRow) {
    if (!(actionRow instanceof Element)) return null;
    const wrap = actionRow.querySelector('.item-action-btns');
    if (!wrap) return null;
    let block = wrap.querySelector('.item-payable');
    if (!block) {
        block = document.createElement('div');
        block.className = 'item-payable';
        block.innerHTML = `应付：<span class="item-payable-val">¥0.00</span>`;
        wrap.appendChild(block);
    }
    return block.querySelector('.item-payable-val');
}

function parseYuanText(text) {
    const raw = String(text || '').replace(/[^0-9.\-]/g, '');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
}

function updateMoneyCardStackReminderForRow(row, payableAmount) {
    if (!(row instanceof Element)) return;
    const itemType = row.getAttribute('data-item-type') || '';
    if (itemType !== 'service' && itemType !== 'product' && itemType !== 'course') return;
    if (row.dataset?.isGift === '1') return;

    const apps = getRowMoneyCards(row);
    const hasCards = apps.length > 0;
    const payable = roundMoney2(Number(payableAmount || 0));
    const shouldShow = hasCards && payable > 0.000001;

    const actionRow = findActionRowForItemRow(row);
    if (!(actionRow instanceof Element)) return;
    const wrap = actionRow.querySelector('.item-action-btns');
    if (!(wrap instanceof Element)) return;

    const existing = wrap.querySelector('.moneycard-stack-reminder');
    if (!shouldShow) {
        if (existing) existing.remove();
        return;
    }

    const target = wrap.querySelector('.item-payable');
    const node = existing || document.createElement('span');
    node.className = 'moneycard-stack-reminder';
    node.textContent = '已选金额卡余额不足，可继续添加金额卡叠加抵扣';
    if (!existing) {
        if (target) wrap.insertBefore(node, target);
        else wrap.insertBefore(node, wrap.firstChild);
    }
}

function setChooseBtnState(itemRow, remaining) {
    const btn = itemRow?.querySelector?.('[data-action="open-moneycard-modal"]');
    if (!(btn instanceof HTMLButtonElement)) return;
    if (itemRow?.dataset?.isGift === '1') {
        btn.textContent = '不可使用金额卡';
        btn.disabled = true;
        return;
    }
    const apps = getRowMoneyCards(itemRow);
    btn.textContent = apps.length > 0 ? `已选${apps.length}张金额卡` : '选择金额卡';
    btn.disabled = !(remaining > 0.000001);
}

function ensureMoneyCardDetailRow(itemRow) {
    if (!(itemRow instanceof Element)) return null;
    const itemType = itemRow.getAttribute('data-item-type') || '';
    const itemId = itemRow.getAttribute('data-item-id') || '';
    let next = itemRow.nextElementSibling;
    if (next instanceof Element && next.classList.contains('moneycard-detail-row')) {
        return next;
    }
    const actionRow = findActionRowForItemRow(itemRow);
    if (!actionRow) return null;
    const tr = document.createElement('tr');
    tr.className = 'moneycard-detail-row';
    tr.setAttribute('data-for-item-type', itemType);
    tr.setAttribute('data-for-item-id', itemId);
    const actionCell = actionRow.querySelector('td');
    const colspan = actionCell?.getAttribute('colspan') || '9';
    tr.innerHTML = `<td colspan="${colspan}" class="moneycard-detail-cell"><div class="moneycard-detail-list"></div></td>`;
    actionRow.parentNode?.insertBefore(tr, actionRow);
    return tr;
}

function removeMoneyCardDetailRow(itemRow) {
    const next = itemRow?.nextElementSibling;
    if (next instanceof Element && next.classList.contains('moneycard-detail-row')) next.remove();
}

function getMoneyCardApplicableRowsInOrder() {
    return Array.from(document.querySelectorAll('#service-table-body tr.item-row, #product-table-body tr.item-row, #course-table-body tr.item-row'))
        .filter(row => row instanceof Element && row.dataset?.isGift !== '1');
}

function normalizeAndRenderMoneyCards() {
    const rows = getMoneyCardApplicableRowsInOrder();
    const running = new Map(MONEY_CARD_OPTIONS.map(c => [String(c.id), toFen(c.balance || 0)]));

    rows.forEach(row => {
        if (!(row instanceof Element)) return;
        const rawApps = getRowMoneyCards(row);
        const hasUserOverride = row.dataset?.userDiscountOverride === '1';
        const hasCards = rawApps.length > 0;
        const isWholeOrderModified = row.dataset?.wholeOrderModified === '1';
        const apps = hasUserOverride ? rawApps : rawApps.filter(x => toFen(x.amount || 0) > 0);
        if (apps.length !== rawApps.length && !hasUserOverride) {
            setRowMoneyCards(row, apps);
            syncMoneyCardsToCourseData(row);
        }

        // 整单改价分摊行：跳过归一化，仅更新运行中余额（PRD规则6.8）
        if (isWholeOrderModified) {
            apps.forEach(app => {
                const cid = String(app.cardId || '');
                if (running.has(cid)) {
                    const beforeFen = running.get(cid);
                    running.set(cid, Math.max(0, beforeFen - toFen(Number(app.amount || 0))));
                }
            });
            computeBaseFinalWithMoneyCard(row);
            return;
        }

        const originalPriceText = row.querySelector('.col-original')?.textContent || '';
        const originalPriceFen = toFen(Number(originalPriceText.replace(/[^0-9.]/g, '')) || 0);

        const buyInput = row.querySelector('input[data-field="buy"], input[data-field="buyQty"]');
        const quantity = Math.max(1, Math.round(Number(buyInput?.value || 1)));

        const preDiscountTotalFen = originalPriceFen * quantity;
        const discountInput = row.querySelector('input[data-field="discount"]');
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');

        const currentFinalPrice = parseFloat(finalPriceInput?.value || '0') || 0;
        const currentFinalPriceFen = toFen(currentFinalPrice);

        if (hasUserOverride && hasCards) {
            let remainingPayableFen = currentFinalPriceFen;
            const normalized = [];
            const detailBalances = [];

            apps.forEach(app => {
                const cardId = String(app.cardId || '');
                const card = moneyCardById.get(cardId);
                if (!card) return;

                const beforeFen = running.has(cardId) ? running.get(cardId) : toFen(Number(card.balance || 0));
                const amtFen = Math.min(remainingPayableFen, beforeFen);
                const afterFen = beforeFen - amtFen;

                running.set(cardId, afterFen);
                normalized.push({ cardId, amount: toYuan(amtFen) });
                detailBalances.push(afterFen);
                remainingPayableFen = Math.max(0, remainingPayableFen - amtFen);
            });

            setRowMoneyCards(row, normalized);
            syncMoneyCardsToCourseData(row);

            const totalDeductFen = normalized.reduce((s, x) => s + toFen(x.amount || 0), 0);
            const actualPayableFen = Math.max(0, currentFinalPriceFen - totalDeductFen);

            const actionRow = findActionRowForItemRow(row);
            const valEl = ensureActionRowPayable(actionRow);
            if (valEl) {
                valEl.textContent = `¥${toYuan(actualPayableFen).toFixed(2)}`;
            }
            setChooseBtnState(row, toYuan(actualPayableFen));
            updateMoneyCardStackReminderForRow(row, valEl ? parseYuanText(valEl.textContent) : toYuan(actualPayableFen));
            computeBaseFinalWithMoneyCard(row);

            if (normalized.length === 0) {
                removeMoneyCardDetailRow(row);
                updateMoneyCardStackReminderForRow(row, 0);
                return;
            }

            const detailRow = ensureMoneyCardDetailRow(row);
            const list = detailRow?.querySelector?.('.moneycard-detail-list');
            if (!(list instanceof Element)) return;
            list.innerHTML = normalized.map((app, idx) => {
                const card = moneyCardById.get(String(app.cardId));
                const bal = toYuan(detailBalances[idx] || 0);
                const discountText = card ? buildMoneyCardDiscountText(card) : '';
                const balanceLabel = card && String(card.balanceType || '') === 'gift' ? '【赠金】余额' : '【本金】余额';
                return `
                    <div class="moneycard-detail-item" data-card-id="${String(app.cardId)}" data-app-index="${idx}">
                        <div class="moneycard-detail-main">
                            <div class="moneycard-detail-title" title="${card ? card.name : ''}">${card ? card.name : ''}</div>
                            <div class="moneycard-detail-meta moneycard-discount" title="${discountText}">${discountText}</div>
                            <div class="moneycard-detail-meta moneycard-balance">${balanceLabel}：¥${bal.toFixed(2)}</div>
                        </div>
                        <div class="moneycard-detail-amount">
                            <input type="text" class="table-input moneycard-deduct-input" disabled inputmode="none" readonly data-card-id="${String(app.cardId)}" data-app-index="${idx}" value="${roundMoney2(app.amount).toFixed(2)}" placeholder="划扣金额">
                        </div>
                        <div class="moneycard-detail-actions">
                            <button type="button" class="moneycard-mini-btn" data-action="edit-moneycard" data-app-index="${idx}">
                                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path fill="currentColor" d="M16 7h3l-4-4v3H8a6 6 0 0 0-6 6v2h2v-2a4 4 0 0 1 4-4h8zM8 17H5l4 4v-3h7a6 6 0 0 0 6-6v-2h-2v2a4 4 0 0 1-4 4H8z"/>
                                </svg>
                                <span>更换</span>
                            </button>
                            <button type="button" class="moneycard-mini-btn danger" data-action="delete-moneycard" data-app-index="${idx}">
                                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    <path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/>
                                </svg>
                                <span>删除</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            return;
        }

        let remainingPreDiscountFen = preDiscountTotalFen;
        const normalized = [];
        const detailBalances = [];

        apps.forEach(app => {
            const cardId = String(app.cardId || '');
            const card = moneyCardById.get(cardId);
            if (!card) return;

            const beforeFen = running.has(cardId) ? running.get(cardId) : toFen(Number(card.balance || 0));
            if (beforeFen <= 0) return;

            const discountVal = getDiscountRateForRow(card, row);
            if (discountVal <= 0) return;

            const discountRatePerHundred = Math.round(discountVal * 100);
            if (discountRatePerHundred <= 0) return;

            const maxDeductByRemainingFen = Math.round(remainingPreDiscountFen * discountRatePerHundred / 100);
            const amtFen = Math.min(maxDeductByRemainingFen, beforeFen);

            if (amtFen <= 0) return;

            const originalValueFen = Math.round(amtFen * 100 / discountRatePerHundred);
            remainingPreDiscountFen = remainingPreDiscountFen - originalValueFen;

            const afterFen = beforeFen - amtFen;
            running.set(cardId, afterFen);
            normalized.push({ cardId, amount: toYuan(amtFen) });
            detailBalances.push(afterFen);
        });

        setRowMoneyCards(row, normalized);
        syncMoneyCardsToCourseData(row);

        const totalDeductFen = normalized.reduce((s, x) => s + toFen(x.amount || 0), 0);
        const remainingPayableFen = Math.max(0, remainingPreDiscountFen);
        const actualPayAmountFen = totalDeductFen + remainingPayableFen;
        const discountRatio = preDiscountTotalFen > 0
            ? Math.round(actualPayAmountFen / preDiscountTotalFen * 100)
            : 100;

        if (discountInput instanceof HTMLInputElement && normalized.length > 0) {
            suppressMoneyCardConflict = true;
            const discountInt = Math.round(clampNumber(discountRatio, 0, 100));
            discountInput.value = String(discountInt);
            if (finalPriceInput instanceof HTMLInputElement) {
                finalPriceInput.value = toYuan(actualPayAmountFen).toFixed(2);
            }
            // 更新"原始应用金额卡的折扣和折后价"（仅PRD规则计算时更新，非userDiscountOverride）
            if (!hasUserOverride) {
                row.dataset.originalCardPrice = toYuan(actualPayAmountFen).toFixed(2);
                row.dataset.originalCardDiscount = String(discountInt);
            }
            updateOrderSummary();
            suppressMoneyCardConflict = false;
        } else if (normalized.length === 0 && !(row.dataset?.userDiscountOverride === '1')) {
            suppressMoneyCardConflict = true;
            discountInput.value = '100';
            if (finalPriceInput instanceof HTMLInputElement) {
                finalPriceInput.value = toYuan(preDiscountTotalFen).toFixed(2);
            }
            // 无金额卡剩余时清除原始应用金额卡标记
            if (row.dataset?.originalCardDiscount) delete row.dataset.originalCardDiscount;
            if (row.dataset?.originalCardPrice) delete row.dataset.originalCardPrice;
            updateOrderSummary();
            suppressMoneyCardConflict = false;
            if (row.dataset?.userDiscountOverride) delete row.dataset.userDiscountOverride;
        }

        const actionRow = findActionRowForItemRow(row);
        const valEl = ensureActionRowPayable(actionRow);
        if (valEl) {
            // 如果有用户折扣覆盖，使用折后价作为应付金额
            if (row.dataset?.userDiscountOverride === '1') {
                const finalPrice = parseFloat(finalPriceInput?.value || '0') || 0;
                valEl.textContent = `¥${finalPrice.toFixed(2)}`;
            } else {
                valEl.textContent = `¥${toYuan(remainingPayableFen).toFixed(2)}`;
            }
        }

        const payableAmount = row.dataset?.userDiscountOverride === '1' 
            ? (parseFloat(finalPriceInput?.value || '0') || 0)
            : toYuan(remainingPayableFen);
        setChooseBtnState(row, payableAmount);
        updateMoneyCardStackReminderForRow(row, valEl ? parseYuanText(valEl.textContent) : payableAmount);
        computeBaseFinalWithMoneyCard(row);

        if (normalized.length === 0) {
            removeMoneyCardDetailRow(row);
            updateMoneyCardStackReminderForRow(row, 0);
            return;
        }

        const detailRow = ensureMoneyCardDetailRow(row);
        const list = detailRow?.querySelector?.('.moneycard-detail-list');
        if (!(list instanceof Element)) return;
        list.innerHTML = normalized.map((app, idx) => {
            const card = moneyCardById.get(String(app.cardId));
            const bal = toYuan(detailBalances[idx] || 0);
            const discountText = card ? buildMoneyCardDiscountText(card) : '';
            const balanceLabel = card && String(card.balanceType || '') === 'gift' ? '【赠金】余额' : '【本金】余额';
            return `
                <div class="moneycard-detail-item" data-card-id="${String(app.cardId)}" data-app-index="${idx}">
                    <div class="moneycard-detail-main">
                        <div class="moneycard-detail-title" title="${card ? card.name : ''}">${card ? card.name : ''}</div>
                        <div class="moneycard-detail-meta moneycard-discount" title="${discountText}">${discountText}</div>
                        <div class="moneycard-detail-meta moneycard-balance">${balanceLabel}：¥${bal.toFixed(2)}</div>
                    </div>
                    <div class="moneycard-detail-amount">
                        <input type="text" class="table-input moneycard-deduct-input" disabled inputmode="none" readonly data-card-id="${String(app.cardId)}" data-app-index="${idx}" value="${roundMoney2(app.amount).toFixed(2)}" placeholder="划扣金额">
                    </div>
                    <div class="moneycard-detail-actions">
                        <button type="button" class="moneycard-mini-btn" data-action="edit-moneycard" data-app-index="${idx}">
                            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M16 7h3l-4-4v3H8a6 6 0 0 0-6 6v2h2v-2a4 4 0 0 1 4-4h8zM8 17H5l4 4v-3h7a6 6 0 0 0 6-6v-2h-2v2a4 4 0 0 1-4 4H8z"/>
                            </svg>
                            <span>更换</span>
                        </button>
                        <button type="button" class="moneycard-mini-btn danger" data-action="delete-moneycard" data-app-index="${idx}">
                            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM7 9h2v10H7V9z"/>
                            </svg>
                            <span>删除</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    });
}

let moneyCardNormalizeRaf = 0;
let moneyCardNormalizeTimer = 0;
function scheduleNormalizeMoneyCards() {
    if (moneyCardNormalizeRaf) return;
    moneyCardNormalizeRaf = window.requestAnimationFrame(function () {
        moneyCardNormalizeRaf = 0;
        normalizeAndRenderMoneyCards();
        updateOrderSummary();  // 折后价/discount 变更后同步更新底部共优惠金额
    });
}

function scheduleNormalizeMoneyCardsDebounced() {
    if (moneyCardNormalizeTimer) window.clearTimeout(moneyCardNormalizeTimer);
    moneyCardNormalizeTimer = window.setTimeout(function () {
        moneyCardNormalizeTimer = 0;
        normalizeAndRenderMoneyCards();
        updateOrderSummary();
    }, 300);
}

document.addEventListener('input', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!el.closest('tr.item-row')) return;
    if (el.matches('input[data-field="buy"], input[data-field="buyQty"]')) {
        scheduleNormalizeMoneyCardsDebounced();
        // 立即更新 baseFinalWithMoneyCard（数量变化即时反映）
        const row = el.closest('tr.item-row');
        if (row) computeBaseFinalWithMoneyCard(row);
        return;
    }
    if (el.matches('input[data-field="finalPrice"], input[data-field="discount"]')) {
        scheduleNormalizeMoneyCards();
    }
});

document.addEventListener('change', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!el.closest('tr.item-row')) return;
    if (el.matches('input[data-field="buy"], input[data-field="buyQty"]')) {
        scheduleNormalizeMoneyCardsDebounced();
    }
});

function getMoneyCardTargetName(row) {
    if (!(row instanceof Element)) return '';
    const raw = (row.querySelector('.col-name')?.textContent || '').replace(/\s+/g, ' ').trim();
    return raw.replace(/^自定义\s*/g, '').trim();
}

function renderMoneyCardModalTitle() {
    if (!moneyCardModalTitle) return;
    const row = moneyCardModalState.row;
    const name = getMoneyCardTargetName(row);
    moneyCardModalTitle.textContent = name ? `为【${name}】设置金额卡` : '选择金额卡';
}

function formatDiscountValue(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '';
    const s = n.toFixed(1).replace(/\.0$/, '');
    return s;
}

function buildMoneyCardDiscountText(card) {
    return `单次护理${formatDiscountValue(card.discounts?.care)}折 | 居家产品${formatDiscountValue(card.discounts?.home)}折 | 卡项${formatDiscountValue(card.discounts?.item)}折`;
}

function renderMoneyCardList() {
    if (!moneyCardList) return;
    const row = moneyCardModalState.row;
    const apps = getRowMoneyCards(row);
    const usedIds = new Set(apps.map(x => String(x.cardId)));
    const allowUsedId = moneyCardModalState.mode === 'edit' && moneyCardModalState.editIndex > -1 && apps[moneyCardModalState.editIndex]
        ? String(apps[moneyCardModalState.editIndex].cardId)
        : '';
    if (allowUsedId) usedIds.delete(allowUsedId);
    const pendingId = moneyCardModalState.pendingId || '';
    const noneSelected = pendingId === '';
    const parts = [];
    parts.push(`
        <div class="moneycard-item ${noneSelected ? 'selected' : ''}" data-moneycard-id="">
            <div class="moneycard-name">不使用金额卡</div>
        </div>
    `);

    const deductedAmounts = new Map();
    document.querySelectorAll('tr.item-row').forEach(r => {
        const rowApps = getRowMoneyCards(r);
        rowApps.forEach(app => {
            const cardId = String(app.cardId || '');
            const amt = roundMoney2(Number(app.amount || 0));
            deductedAmounts.set(cardId, roundMoney2((deductedAmounts.get(cardId) || 0) + amt));
        });
    });

    const groups = new Map();
    const groupOrder = [];
    MONEY_CARD_OPTIONS.forEach(opt => {
        const baseId = String(opt?.baseId || opt?.id || '');
        if (!baseId) return;
        let g = groups.get(baseId);
        if (!g) {
            g = { baseId, name: String(opt?.name || ''), cash: null, gift: null };
            groups.set(baseId, g);
            groupOrder.push(baseId);
        }
        if (!g.name && opt?.name) g.name = String(opt.name);
        if (String(opt?.balanceType || '') === 'gift') g.gift = opt;
        else g.cash = opt;
    });

    const renderOption = (opt, label) => {
        if (!opt) return '';
        const selected = pendingId === opt.id ? 'selected' : '';
        const cardId = String(opt.id || '');
        const originalBalance = roundMoney2(Number(opt.balance || 0));
        const deducted = roundMoney2(deductedAmounts.get(cardId) || 0);
        const remainingBalance = Math.max(0, originalBalance - deducted);
        const isUsed = usedIds.has(String(opt.id));
        const isZeroBalance = remainingBalance <= 0.000001;
        const disabled = (isUsed || isZeroBalance) ? 'disabled' : '';
        const usedTag = isUsed ? `<div class="moneycard-tag">已选择</div>` : '';
        // 优先级：已选择 > 余额不足，二者共存时仅展示"已选择"
        const zeroTag = (!isUsed && isZeroBalance) ? `<div class="moneycard-tag">余额不足</div>` : '';
        return `
            <div class="moneycard-split-option ${selected} ${disabled}" data-moneycard-id="${opt.id}">
                <div class="moneycard-split-left">
                    <div class="moneycard-split-label">${label}</div>
                    <div class="moneycard-split-discount">${buildMoneyCardDiscountText(opt)}</div>
                </div>
                <div class="moneycard-split-balance">¥${remainingBalance.toFixed(2)}</div>
                ${usedTag}${zeroTag}
            </div>
        `;
    };

    groupOrder.forEach(baseId => {
        const g = groups.get(baseId);
        if (!g) return;
        const cash = g.cash;
        const gift = g.gift;
        if (!cash && !gift) return;
        parts.push(`
            <div class="moneycard-item">
                <div class="moneycard-name">${g.name}</div>
                <div class="moneycard-split">
                    ${renderOption(cash, '本金')}
                    ${renderOption(gift, '赠金')}
                </div>
            </div>
        `);
    });
    moneyCardList.innerHTML = parts.join('');
}

function openMoneyCardModalForRow(row, options = {}) {
    if (!moneyCardModalOverlay || !row) return;
    moneyCardModalState.row = row;
    moneyCardModalState.itemId = row.getAttribute('data-item-id') || '';
    moneyCardModalState.itemType = row.getAttribute('data-item-type') || '';
    moneyCardModalState.mode = options?.mode === 'edit' ? 'edit' : 'add';
    moneyCardModalState.editIndex = Number.isFinite(Number(options?.editIndex)) ? Number(options.editIndex) : -1;
    const apps = getRowMoneyCards(row);
    const editApp = moneyCardModalState.mode === 'edit' && moneyCardModalState.editIndex > -1 ? apps[moneyCardModalState.editIndex] : null;
    const current = editApp ? String(editApp.cardId || '') : '';
    moneyCardModalState.originalId = current;
    moneyCardModalState.pendingId = current;
    renderMoneyCardModalTitle();
    renderMoneyCardList();
    moneyCardModalOverlay.classList.add('show');
}

function closeMoneyCardModal() {
    if (!moneyCardModalOverlay) return;
    moneyCardModalOverlay.classList.remove('show');
    moneyCardModalState.row = null;
    moneyCardModalState.originalId = '';
    moneyCardModalState.pendingId = '';
    moneyCardModalState.itemId = '';
    moneyCardModalState.itemType = '';
    moneyCardModalState.mode = 'add';
    moneyCardModalState.editIndex = -1;
    if (moneyCardModalTitle) moneyCardModalTitle.textContent = '选择金额卡';
}

function applyMoneyCardSelection() {
    const row = moneyCardModalState.row;
    if (!row) return;
    const selectedId = moneyCardModalState.pendingId || '';
    const apps = getRowMoneyCards(row);

    if (moneyCardModalState.mode === 'edit') {
        const idx = moneyCardModalState.editIndex;
        if (!(idx >= 0 && idx < apps.length)) {
            closeMoneyCardModal();
            return;
        }
        if (!selectedId) {
            // 编辑删除金额卡：先移除整单优惠，再同步折扣（否则折扣输入框可能被禁用）
            if (wholeOrderChangeState?.enabled) removeWholeOrderChange();
            apps.splice(idx, 1);
            setRowMoneyCards(row, apps);
            if (row.dataset?.moneycardTouched) delete row.dataset.moneycardTouched;
            syncRowDiscountFromMoneyCards(row, apps, { resetWhenEmpty: true });
            normalizeAndRenderMoneyCards();
            updateOrderSummary();
            closeMoneyCardModal();
            return;
        }
        const dup = apps.some((x, i) => i !== idx && String(x.cardId) === String(selectedId));
        if (dup) return;
        // 更换金额卡：先移除整单优惠，再同步折扣
        if (wholeOrderChangeState?.enabled) removeWholeOrderChange();
        apps[idx].cardId = String(selectedId);
        setRowMoneyCards(row, apps);
        if (row.dataset?.moneycardTouched) delete row.dataset.moneycardTouched;
        syncRowDiscountFromMoneyCards(row, apps, { resetWhenEmpty: true });
        normalizeAndRenderMoneyCards();
        updateOrderSummary();
        closeMoneyCardModal();
        return;
    }

    if (!selectedId) {
        closeMoneyCardModal();
        return;
    }
    const exists = apps.some(x => String(x.cardId) === String(selectedId));
    if (exists) return;

    const card = moneyCardById.get(String(selectedId));
    if (!card) {
        closeMoneyCardModal();
        return;
    }

    const originalPriceText = row.querySelector('.col-original')?.textContent || '';
    const originalPriceFen = toFen(Number(originalPriceText.replace(/[^0-9.]/g, '')) || 0);
    const buyInput = row.querySelector('input[data-field="buy"], input[data-field="buyQty"]');
    const quantity = Math.max(1, Math.round(Number(buyInput?.value || 1)));

    const preDiscountTotalFen = originalPriceFen * quantity;

    // 新增金额卡：先移除整单优惠，再恢复折扣和添加卡（否则折扣输入框可能被禁用）
    if (wholeOrderChangeState?.enabled) removeWholeOrderChange();

    if (apps.length === 0) {
        suppressMoneyCardConflict = true;
        if (row.dataset?.userDiscountOverride) delete row.dataset.userDiscountOverride;
        const discountInput = row.querySelector('input[data-field="discount"]');
        const finalPriceInput = row.querySelector('input[data-field="finalPrice"]');
        if (discountInput instanceof HTMLInputElement) {
            discountInput.value = '100';
        }
        if (finalPriceInput instanceof HTMLInputElement) {
            finalPriceInput.value = toYuan(preDiscountTotalFen).toFixed(2);
        }
        suppressMoneyCardConflict = false;
    }

    let totalOriginalValueFen = 0;
    apps.forEach(app => {
        const appCard = moneyCardById.get(String(app.cardId || ''));
        if (!appCard) return;
        const discountVal = getDiscountRateForRow(appCard, row);
        if (discountVal > 0) {
            const discountRatePerHundred = Math.round(discountVal * 100);
            if (discountRatePerHundred > 0) {
                const originalValueFen = Math.round(toFen(app.amount || 0) * 100 / discountRatePerHundred);
                totalOriginalValueFen = totalOriginalValueFen + originalValueFen;
            }
        }
    });

    const remainingPreDiscountFen = Math.max(0, preDiscountTotalFen - totalOriginalValueFen);
    const discountVal = getDiscountRateForRow(card, row);

    if (discountVal <= 0) {
        closeMoneyCardModal();
        return;
    }

    const discountRatePerHundred = Math.round(discountVal * 100);
    if (discountRatePerHundred <= 0) {
        closeMoneyCardModal();
        return;
    }

    const maxDeductByRemainingFen = Math.round(remainingPreDiscountFen * discountRatePerHundred / 100);
    const cardBalanceFen = toFen(Number(card.balance || 0));
    const defaultAmtFen = Math.min(maxDeductByRemainingFen, cardBalanceFen);

    if (defaultAmtFen <= 0) {
        closeMoneyCardModal();
        return;
    }

    const defaultAmt = toYuan(defaultAmtFen);
    const nextApps = apps.concat([{ cardId: String(selectedId), amount: defaultAmt }]);
    setRowMoneyCards(row, nextApps);
    if (row.dataset?.moneycardTouched) delete row.dataset.moneycardTouched;
    normalizeAndRenderMoneyCards();
    updateOrderSummary();
    closeMoneyCardModal();
}

document.addEventListener('click', function (e) {
    const el = e.target;
    if (!(el instanceof Element)) return;

    const trigger = el.closest('[data-action="open-moneycard-modal"]');
    if (trigger) {
        const row = trigger.closest('tr.item-row');
        if (row) openMoneyCardModalForRow(row);
        return;
    }

    const editBtn = el.closest('[data-action="edit-moneycard"]');
    if (editBtn) {
        const itemRow = editBtn.closest('tr.moneycard-detail-row')?.previousElementSibling;
        const idx = parseInt(String(editBtn.getAttribute('data-app-index') || '-1'), 10);
        if (itemRow instanceof Element) openMoneyCardModalForRow(itemRow, { mode: 'edit', editIndex: idx });
        return;
    }

    const delBtn = el.closest('[data-action="delete-moneycard"]');
    if (delBtn) {
        const itemRow = delBtn.closest('tr.moneycard-detail-row')?.previousElementSibling;
        const idx = parseInt(String(delBtn.getAttribute('data-app-index') || '-1'), 10);
        if (!(itemRow instanceof Element)) return;
        const apps = getRowMoneyCards(itemRow);
        if (!(idx >= 0 && idx < apps.length)) return;
        // 直接删除金额卡：先移除整单优惠，再同步折扣
        if (wholeOrderChangeState?.enabled) removeWholeOrderChange();
        apps.splice(idx, 1);
        setRowMoneyCards(itemRow, apps);
        if (itemRow.dataset?.moneycardTouched) delete itemRow.dataset.moneycardTouched;
        syncRowDiscountFromMoneyCards(itemRow, apps, { resetWhenEmpty: true });
        normalizeAndRenderMoneyCards();
        updateOrderSummary();
        return;
    }

    const option = el.closest('[data-moneycard-id]');
    if (option && moneyCardModalOverlay?.classList.contains('show')) {
        if (option.classList.contains('disabled')) return;
        const id = option.getAttribute('data-moneycard-id') || '';
        moneyCardModalState.pendingId = id;
        renderMoneyCardList();
        return;
    }
});

moneyCardCancelBtn?.addEventListener('click', () => {
    closeMoneyCardModal();
});

moneyCardConfirmBtn?.addEventListener('click', () => {
    applyMoneyCardSelection();
});

moneyCardModalOverlay?.addEventListener('click', (e) => {
    if (e.target === moneyCardModalOverlay) closeMoneyCardModal();
});

document.addEventListener('input', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!el.classList.contains('moneycard-deduct-input')) return;
    el.value = sanitizePriceString(el.value, 2);
});

document.addEventListener('blur', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!el.classList.contains('moneycard-deduct-input')) return;
    if (typeof numKeypadState !== 'undefined' && numKeypadState?.target === el) return;
    const itemRow = el.closest('tr.moneycard-detail-row')?.previousElementSibling;
    if (!(itemRow instanceof Element)) return;
    const idx = parseInt(String(el.getAttribute('data-app-index') || '-1'), 10);
    const apps = getRowMoneyCards(itemRow);
    if (!(idx >= 0 && idx < apps.length)) return;
    const sanitized = sanitizePriceString(el.value, 2);
    const n = roundMoney2(parseFloat(sanitized || '0') || 0);
    // 修改/删除金额卡划扣金额：先移除整单优惠，再同步折扣
    if (wholeOrderChangeState?.enabled) removeWholeOrderChange();
    if (n > 0.000001) {
        apps[idx].amount = n;
    } else {
        apps.splice(idx, 1);
    }
    setRowMoneyCards(itemRow, apps);
    itemRow.dataset.moneycardTouched = '1';
    syncRowDiscountFromMoneyCards(itemRow, apps, { resetWhenEmpty: true });
    normalizeAndRenderMoneyCards();
    updateOrderSummary();
}, true);

const discountDetailOverlay = document.getElementById('discountDetailOverlay');
const discountDetailBody = document.getElementById('discountDetailBody');
const discountDetailBtn = document.getElementById('discountDetailBtn');
const discountDetailCloseBtn = document.getElementById('discountDetailCloseBtn');

function openDiscountDetailModal() {
    if (!discountDetailOverlay || !discountDetailBody) return;
    renderDiscountDetail();
    discountDetailOverlay.classList.add('show');
}

function closeDiscountDetailModal() {
    if (!discountDetailOverlay) return;
    discountDetailOverlay.classList.remove('show');
}

function renderDiscountDetail() {
    if (!discountDetailBody) return;

    let baseOriginal = 0;
    let baseFinal = 0;
    let discountItems = [];

    const tables = ['#service-table-body', '#product-table-body', '#amount-card-table-body', '#course-table-body'];
    
    tables.forEach(selector => {
        const rows = document.querySelectorAll(`${selector} tr.item-row`);
        rows.forEach(row => {
            const name = row.querySelector('.col-name')?.textContent || '';
            const originalPriceText = row.querySelector('.col-original')?.textContent || '';
            const originalPrice = parseFloat(originalPriceText.replace('¥', '')) || 0;
            const buyQty = parseInt(row.querySelector('input[data-field="buy"], input[data-field="buyQty"]')?.value || '0', 10) || 0;
            const finalPrice = parseFloat(row.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
            const discount = parseFloat(row.querySelector('input[data-field="discount"]')?.value || '100') || 100;
            
            const rowOriginal = originalPrice * buyQty;
            const rowDiscount = Math.max(0, rowOriginal - finalPrice);
            
            baseOriginal += rowOriginal;
            baseFinal += finalPrice;
            
            if (rowDiscount > 0.000001) {
                discountItems.push({
                    name: name.trim(),
                    qty: buyQty,
                    original: rowOriginal,
                    final: finalPrice,
                    discount: discount,
                    discountAmount: rowDiscount
                });
            }
        });
    });

    const upgradeModules = document.querySelectorAll('.upgrade-card-module[data-module-type="upgrade"]');
    upgradeModules.forEach(module => {
        const oldCardId = module.getAttribute('data-old-card-id') || '';
        const item = (typeof upgradeCardList !== 'undefined' && Array.isArray(upgradeCardList))
            ? upgradeCardList.find(x => String(x.cardId) === String(oldCardId))
            : null;
        if (!item || !item.newCard) return;
        const gap = Number(item.gapAmount || 0);
        const pay = Number(item.finalPrice || 0);
        baseOriginal += gap;
        baseFinal += pay;
        
        const rowDiscount = Math.max(0, gap - pay);
        if (rowDiscount > 0.000001) {
            discountItems.push({
                name: `升卡差额(${item.newCard?.name || ''})`,
                original: gap,
                final: pay,
                discount: gap > 0 ? (pay / gap * 100) : 100,
                discountAmount: rowDiscount
            });
        }
    });

    const baseDiscount = Math.max(0, baseOriginal - baseFinal);
    const totalDiscount = baseDiscount;

    let html = '';

    if (discountItems.length > 0) {
        html += `
            <div class="discount-item">
                <div class="discount-type">折扣优惠</div>
                <div class="discount-list">
        `;
        
        discountItems.forEach(item => {
            html += `
                <div class="discount-product-item">
                    <span class="discount-product-name">${escapeHtml(item.name)} ×${item.qty}</span>
                    <span class="discount-product-discount">${item.discount.toFixed(1)}折</span>
                    <span class="discount-product-amount">-¥${item.discountAmount.toFixed(2)}</span>
                </div>
            `;
        });
        
        html += `
                </div>
                
            </div>
        `;
    }

    if (html === '') {
        html = `
            <div style="text-align: center; padding: 40px 20px; color: var(--neutral-400);">
                当前订单暂无优惠
            </div>
        `;
    } else {
        html += `
            <div class="discount-summary">
                <span class="discount-summary-label">优惠总计</span>
                <span class="discount-summary-value">-¥${totalDiscount.toFixed(2)}</span>
            </div>
        `;
    }

    discountDetailBody.innerHTML = html;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

discountDetailBtn?.addEventListener('click', () => {
    openDiscountDetailModal();
});

discountDetailCloseBtn?.addEventListener('click', () => {
    closeDiscountDetailModal();
});

discountDetailOverlay?.addEventListener('click', (e) => {
    if (e.target === discountDetailOverlay) closeDiscountDetailModal();
});

const numKeypadOverlay = document.getElementById('numKeypadOverlay');
const numKeypadPanel = document.getElementById('numKeypadPanel');
const numKeypadGrid = document.getElementById('numKeypadGrid');
const numKeypadTitle = document.getElementById('numKeypadTitle');
const numKeypadDisplay = document.getElementById('numKeypadDisplay');
const numKeypadTopClose = document.getElementById('numKeypadTopClose');

const numKeypadState = {
    target: null,
    origin: '',
    buffer: '',
    ignoreCloseUntil: 0
};

function renderNumKeypadDisplay() {
    if (!numKeypadDisplay) return;
    const v = String(numKeypadState.buffer || '');
    if (!v) {
        numKeypadDisplay.textContent = '0';
        numKeypadDisplay.classList.add('empty');
        return;
    }
    numKeypadDisplay.textContent = v;
    numKeypadDisplay.classList.remove('empty');
}

function buildNumKeypadTitle(el) {
    if (!(el instanceof HTMLInputElement)) return '设置数值';
    const direct = String(el.getAttribute('data-numkeypad-title') || '').trim();
    if (direct) return `当前输入：${direct}`;

    let fieldLabel = '数值';
    if (el.matches('.table-input.discount-input')) fieldLabel = '折扣';
    else if (el.matches('.table-input.final-price')) fieldLabel = '折后价金额';
    else if (el.matches('.moneycard-deduct-input')) fieldLabel = '划扣金额';
    else if (el.matches('.upgrade-fee-input')) {
        const td = el.closest('td');
        const tr = td?.parentElement;
        const table = el.closest('table');
        const ths = table ? Array.from(table.querySelectorAll('thead th')) : [];
        const tds = tr ? Array.from(tr.children) : [];
        const idx = (td && tds.length) ? tds.indexOf(td) : -1;
        const t = (idx >= 0 && idx < ths.length) ? String(ths[idx]?.textContent || '').trim() : '';
        fieldLabel = t || '金额';
    } else if (el.matches('.course-card-price-input')) {
        const wrap = el.closest('.course-card-field');
        const t = (wrap?.querySelector('label')?.textContent || '').trim();
        fieldLabel = t || '金额';
    } else if (el.matches('.woc-input')) {
        const wrap = el.closest('.woc-field');
        const t = (wrap?.querySelector('.woc-label')?.textContent || '').trim();
        fieldLabel = t || '整单改价';
    } else if (el.id === 'orderDiscountAmountInput') fieldLabel = '优惠金额';
    else if (el.id === 'orderPayableAmountInput') fieldLabel = '应付金额';

    let itemName = '';
    if (el.matches('.woc-input')) itemName = '整单';
    else if (el.id === 'orderDiscountAmountInput' || el.id === 'orderPayableAmountInput') itemName = '订单';
    else {
        const row = el.closest('tr.item-row');
        const nameText = (row?.querySelector('.col-name')?.textContent || '').replace(/\s+/g, ' ').trim();
        itemName = nameText || '';
        if (!itemName) {
            if (el.matches('.course-card-price-input')) itemName = '自定义卡项';
            else if (el.matches('.upgrade-fee-input')) itemName = '当前卡项';
            else itemName = '当前项目';
        }
    }

    return itemName ? `为【${itemName}】设置${fieldLabel}` : `设置${fieldLabel}`;
}

function renderNumKeypadTitle() {
    if (!numKeypadTitle) return;
    const el = numKeypadState.target;
    if (el instanceof HTMLInputElement) {
        numKeypadTitle.textContent = buildNumKeypadTitle(el);
        return;
    }
    numKeypadTitle.textContent = '设置数值';
}

function isNumKeypadTarget(el) {
    if (!(el instanceof HTMLInputElement)) return false;
    if (el.disabled) return false;
    if (el.matches('.table-input.discount-input, .table-input.final-price')) return true;
    if (el.matches('.moneycard-deduct-input')) return true;
    if (el.matches('.upgrade-fee-input, .course-card-price-input, .woc-input')) return true;
    if (el.id === 'orderDiscountAmountInput' || el.id === 'orderPayableAmountInput') return true;
    return false;
}

function markNumKeypadTargets(root) {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll('input').forEach(el => {
        if (!(el instanceof HTMLInputElement)) return;
        if (!isNumKeypadTarget(el)) return;
        // 跳过当前正在数字键盘编辑的输入框
        if (numKeypadState && numKeypadState.target === el) {
            console.log('[markNumKeypadTargets] 跳过当前编辑的输入框');
            return;
        }
        el.dataset.numkeypad = 'decimal';
        el.readOnly = true;
        el.setAttribute('inputmode', 'none');
    });
}

function setNumKeypadScale() {
    if (!numKeypadPanel) return;
    const vw = Math.max(0, window.innerWidth || 0);
    const base = 512;
    const pad = 24;
    const scale = Math.max(0.6, Math.min(1, (vw - pad) / base));
    numKeypadPanel.style.transform = `scale(${scale})`;
}

function openNumKeypadFor(el) {
    if (!numKeypadOverlay || !numKeypadGrid) return;
    if (!isNumKeypadTarget(el)) return;

    // 整单改价与商品改价互斥：存在整单改价标记时禁止修改折扣/折后价
    // 转换守卫：状态转换期间（removeWholeOrderChange/redistributeWholeOrderDiscount）抑制弹窗
    if (el.matches('.table-input.discount-input, .table-input.final-price')) {
        if (!window.__wholeOrderTransitioning) {
            const hasWholeOrderModified = document.querySelectorAll('.item-row').length > 0 &&
                Array.from(document.querySelectorAll('.item-row')).some(r => r.dataset?.wholeOrderModified === '1');
            if (hasWholeOrderModified) {
                showAlertModal('当前状态不可改价<br>您已整单改价，请先清空整单优惠后再进行改价。');
                return;
            }
        }
    }

    numKeypadState.target = el;
    numKeypadState.origin = String(el.value || '');
    numKeypadState.buffer = String(el.value || '');
    if (el.matches('.table-input.discount-input, .table-input.final-price')) {
        el.dataset.editOrigin = String(el.value || '');
    }
    el.readOnly = true;
    el.setAttribute('inputmode', 'none');
    el.blur();
    setNumKeypadScale();
    renderNumKeypadTitle();
    numKeypadOverlay.classList.add('show');
    numKeypadState.ignoreCloseUntil = Date.now() + 350;
    renderNumKeypadDisplay();
}

function closeNumKeypad() {
    if (!numKeypadOverlay) return;
    numKeypadOverlay.classList.remove('show');
    if (numKeypadState.target instanceof HTMLInputElement) {
        numKeypadState.target.readOnly = false;
        numKeypadState.target.setAttribute('inputmode', 'decimal');
    }
    numKeypadState.target = null;
    numKeypadState.origin = '';
    numKeypadState.buffer = '';
    numKeypadState.ignoreCloseUntil = 0;
    renderNumKeypadTitle();
    renderNumKeypadDisplay();
}

function computeMoneyCardAvailableBefore(row, appIndex, cardId, overrideAmount) {
    const rows = document.querySelectorAll('tr.item-row');
    const balances = new Map();
    MONEY_CARD_OPTIONS.forEach(c => {
        balances.set(String(c.id), roundMoney2(Number(c.balance || 0)));
    });
    const safeCardId = String(cardId || '');
    let foundBefore = 0;
    rows.forEach(r => {
        const apps = getRowMoneyCards(r);
        apps.forEach((app, idx) => {
            const id = String(app?.cardId || '');
            const before = roundMoney2(Number(balances.get(id) || 0));
            const amt = (r === row && idx === appIndex && id === safeCardId)
                ? roundMoney2(Number(overrideAmount || 0))
                : roundMoney2(Number(app?.amount || 0));
            if (r === row && idx === appIndex && id === safeCardId) foundBefore = before;
            balances.set(id, roundMoney2(Math.max(0, before - amt)));
        });
    });
    return roundMoney2(foundBefore);
}

function commitNumKeypad() {
    const el = numKeypadState.target;
    if (!(el instanceof HTMLInputElement)) {
        closeNumKeypad();
        return;
    }
    if (el.matches('.moneycard-deduct-input')) {
        const itemRow = el.closest('tr.moneycard-detail-row')?.previousElementSibling;
        if (!(itemRow instanceof Element)) return;
        const idx = parseInt(String(el.getAttribute('data-app-index') || '-1'), 10);
        const apps = getRowMoneyCards(itemRow);
        if (!(idx >= 0 && idx < apps.length)) return;

        const sanitized = sanitizePriceString(numKeypadState.buffer || '', 2);
        const newAmt = roundMoney2(clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER));
        const lineTotal = roundMoney2(getRowLineFinalTotal(itemRow));
        const otherUsed = roundMoney2(apps.reduce((s, x, i) => {
            if (i === idx) return s;
            return s + roundMoney2(Number(x?.amount || 0));
        }, 0));

        if (newAmt - 0.000001 > lineTotal) {
            showAlertModal(`划扣金额不可超过该商品折后价(¥${lineTotal.toFixed(2)})`);
            return;
        }

        const maxRemain = roundMoney2(Math.max(0, lineTotal - otherUsed));
        if (newAmt - 0.000001 > maxRemain) {
            showAlertModal(`划扣金额不可超过该商品剩余可划扣金额(¥${maxRemain.toFixed(2)})`);
            return;
        }

        const cardId = String(apps[idx]?.cardId || '');
        const beforeBalance = computeMoneyCardAvailableBefore(itemRow, idx, cardId, newAmt);
        if (newAmt - 0.000001 > beforeBalance) {
            showAlertModal(`划扣金额不可超过该金额卡剩余余额(¥${beforeBalance.toFixed(2)})`);
            return;
        }

        if (newAmt > 0.000001) {
            apps[idx].amount = newAmt;
        } else {
            apps.splice(idx, 1);
        }
        // 修改/删除金额卡划扣金额：先移除整单优惠，再同步折扣
        if (wholeOrderChangeState?.enabled) removeWholeOrderChange();
        setRowMoneyCards(itemRow, apps);
        itemRow.dataset.moneycardTouched = '1';
        syncRowDiscountFromMoneyCards(itemRow, apps, { resetWhenEmpty: true });
        normalizeAndRenderMoneyCards();
        updateOrderSummary();
        closeNumKeypad();
        return;
    }

    const row = el.closest('tr.item-row');
    suppressMoneyCardConflict = false;

    el.readOnly = false;
    el.setAttribute('inputmode', 'decimal');
    
    const discountWrap = row?.querySelector('.discount-wrapper');
    el.classList.remove('is-readonly');
    if (discountWrap) discountWrap.classList.remove('is-readonly');

    if (el.matches('.table-input.discount-input')) {
        const intStr = sanitizeIntString(numKeypadState.buffer || '');
        const discount = clampNumber(intStr === '' ? 0 : parseInt(intStr, 10), 0, 100);
        if (!(discount >= 0 && discount <= 100)) {
            showAlertModal('折扣需在 0-100 范围内');
            return;
        }
        const originDiscount = parseInt(String(el.dataset.editOrigin || ''), 10) || 0;
        if (originDiscount !== discount) {
            const originalPriceText = row?.querySelector?.('.col-original')?.textContent || '';
            const originalPrice = parseFloat(String(originalPriceText).replace('¥', '')) || 0;
            const buyQty = row instanceof Element ? getRowBuyQty(row) : 0;
            const baseTotal = originalPrice * buyQty;
            const newFinalPrice = baseTotal * (discount / 100);
            // 使用原始应用金额卡的折后价作为校验基准（PRD规则4.4.1）
            const originalCardPrice = parseFloat(row?.dataset?.originalCardPrice || '0') || 0;
            const currentFinalPrice = parseFloat(row?.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
            const limitPrice = originalCardPrice > 0.000001 ? originalCardPrice : currentFinalPrice;
            if (newFinalPrice - 0.000001 > limitPrice) {
                showAlertModal(`修改折后价必须小于等于原折扣价格(¥${limitPrice.toFixed(2)})，如需赠送请勾选【设为赠送权益】`);
                return;
            }
        }
        el.value = el.type === 'number' ? discount : String(discount);
        el.setAttribute('value', String(discount));
        el.dataset.editOrigin = String(discount);
        if (row) row.dataset.userDiscountOverride = '1';
    } else if (el.matches('.table-input.final-price')) {
        const sanitized = sanitizePriceString(numKeypadState.buffer || '', 2);
        let finalPrice = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
        if (finalPrice <= 0.000001) {
            showAlertModal(`修改折后价必须小于等于原折扣价格(¥${(parseFloat(row?.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0).toFixed(2)})，如需赠送请勾选【设为赠送权益】`);
            return;
        }
        // 使用原始应用金额卡的折后价作为校验基准（PRD规则4.4.2）
        const originalCardPrice = parseFloat(row?.dataset?.originalCardPrice || '0') || 0;
        const currentFinalPrice = parseFloat(row?.querySelector('input[data-field="finalPrice"]')?.value || '0') || 0;
        const limitPrice = originalCardPrice > 0.000001 ? originalCardPrice : currentFinalPrice;
        if (finalPrice - 0.000001 > limitPrice) {
            showAlertModal(`修改折后价必须小于等于原折扣价格(¥${limitPrice.toFixed(2)})，如需赠送请勾选【设为赠送权益】`);
            return;
        }
        const originalPriceText = row?.querySelector?.('.col-original')?.textContent || '';
        const originalPrice = parseFloat(String(originalPriceText).replace('¥', '')) || 0;
        const buyQty = row instanceof Element ? getRowBuyQty(row) : 0;
        const maxFinal = roundMoney2(originalPrice * buyQty);
        if (finalPrice - 0.000001 > maxFinal) {
            finalPrice = maxFinal;
        }
        el.value = el.type === 'number' ? finalPrice : finalPrice.toFixed(2);
        el.setAttribute('value', finalPrice.toFixed(2));
    } else {
        const sanitized = sanitizePriceString(numKeypadState.buffer || '', 2);
        const n = clampNumber(parseFloat(sanitized || '0') || 0, 0, Number.MAX_SAFE_INTEGER);
        el.value = n.toFixed(2);
    }

    closeNumKeypad();
    
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur'));
}

function appendNumKeypadChar(ch) {
    const v = String(numKeypadState.buffer || '');
    if (ch === '.') {
        if (v.includes('.')) return;
        if (!v) {
            numKeypadState.buffer = '0.';
            return;
        }
        numKeypadState.buffer = v + '.';
        return;
    }
    const digits = v.replace(/[^0-9]/g, '').length;
    if (digits >= 12) return;
    numKeypadState.buffer = v + ch;
}

numKeypadGrid?.addEventListener('click', function (e) {
    const keyItem = e.target.closest('.key-item');
    if (!keyItem) return;
    const key = keyItem.dataset.key;
    if (!key) return;
    if (key === 'backspace') {
        numKeypadState.buffer = String(numKeypadState.buffer || '').slice(0, -1);
        renderNumKeypadDisplay();
        return;
    }
    if (key === 'close') {
        const cur = String(numKeypadState.buffer || '');
        if (!cur) return;
        numKeypadState.buffer = '';
        renderNumKeypadDisplay();
        return;
    }
    if (key === 'confirm') {
        commitNumKeypad();
        return;
    }
    if (key === '.' || /^[0-9]$/.test(key)) {
        appendNumKeypadChar(key);
        renderNumKeypadDisplay();
    }
});

numKeypadTopClose?.addEventListener('click', () => {
    closeNumKeypad();
});

numKeypadOverlay?.addEventListener('click', (e) => {
    if (e.target !== numKeypadOverlay) return;
    if (Date.now() < (numKeypadState.ignoreCloseUntil || 0)) return;
    closeNumKeypad();
});

window.addEventListener('resize', () => {
    if (numKeypadOverlay?.classList.contains('show')) setNumKeypadScale();
});

markNumKeypadTargets(document);
new MutationObserver((mutations) => {
    mutations.forEach(m => {
        (m.addedNodes || []).forEach(n => {
            if (!(n instanceof Element)) return;
            markNumKeypadTargets(n);
        });
    });
}).observe(document.body, { childList: true, subtree: true });

document.addEventListener('pointerdown', (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;

    // 整单改价中点击置灰的折扣/折后价 → 弹出提示弹窗
    // 转换守卫：状态转换期间抑制弹窗闪现
    if (wholeOrderChangeState?.enabled && !window.__wholeOrderTransitioning) {
        const grayedWrap = el.closest('.discount-wrapper.is-readonly');
        if (grayedWrap) {
            e.preventDefault();
            e.stopPropagation();
            showAlertModal('当前状态不可改价<br>您已整单改价，请先清空整单优惠后再进行改价。');
            return;
        }
    }

    if (!(el instanceof HTMLInputElement)) return;
    if (!isNumKeypadTarget(el)) return;
    if (numKeypadOverlay?.classList.contains('show')) return;
    e.preventDefault();
    openNumKeypadFor(el);
}, true);

document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;
    if (!isNumKeypadTarget(el)) return;
    if (numKeypadOverlay?.classList.contains('show')) return;
    if (confirmModalOverlay?.classList.contains('show')) return;
    el.blur();
    openNumKeypadFor(el);
}, true);

// 页面加载完成后自动弹出会员选择弹窗
document.addEventListener('DOMContentLoaded', function () {
    // 初始状态下不显示会员信息区域，等待用户关闭弹窗后再显示散客收银
    initIngredientButtonVisibilityWatcher();
    const memberInfoPanel = document.getElementById('memberInfoPanel');
    const guestCashierStatus = document.getElementById('guestCashierStatus');
    const memberDetails = document.getElementById('memberDetails');

    if (memberInfoPanel) {
        memberInfoPanel.style.display = 'none';
    }
    if (guestCashierStatus) {
        guestCashierStatus.style.display = 'none';
    }
    if (memberDetails) {
        memberDetails.style.display = 'none';
    }

    // 初始状态：不加载默认会员，保持会员信息区域空白
    selectedMember = null;

    // 初始状态设置为散客模式，隐藏"使用卡项"列
    const orderMain = document.getElementById('orderMain');
    if (orderMain) {
        orderMain.classList.add('guest-mode');
    }

    // 检查是否有从客户详情页跳转过来的数据
    try {
        const storageData = localStorage.getItem('createOrderFromDetail');
        if (storageData) {
            const data = JSON.parse(storageData);
            // 数据超过30分钟过期
            if (data && data.timestamp && (Date.now() - data.timestamp < 1800000)) {
                // 预填充会员信息
                if (data.member) {
                    const member = {
                        name: data.member.name || '',
                        phone: data.member.phone || '',
                        level: data.member.level || '会员',
                        memberNo: data.member.memberNo || '',
                        points: data.member.points || '0',
                        walletBalance: data.member.walletBalance || '0',
                        cardBalance: data.member.cardBalance || '0',
                        debt: data.member.debt || '0',
                        balance: data.member.walletBalance || '0'
                    };
                    selectedMember = member;
                    updateMemberInfo(member);
                }

                // 添加卡片到已选商品区域
                if (data.card) {
                    if (data.card.action === 'upgrade') {
                        renderUpgradeCardModule(data.card);
                    } else if (data.card.action === 'recharge') {
                        renderRechargeCardModule(data.card);
                    }
                }

                // 清除localStorage
                localStorage.removeItem('createOrderFromDetail');
                try {
                    localStorage.removeItem('createOrderEntry');
                } catch (e) {}
                return;
            } else {
                // 数据过期，删除
                localStorage.removeItem('createOrderFromDetail');
            }
        }
    } catch (err) {
        console.warn('Failed to load from localStorage:', err);
        try {
            localStorage.removeItem('createOrderFromDetail');
        } catch (e) {}
    }

    // 检查是否从首页进入（散客/会员收银）
    try {
        const entryRaw = localStorage.getItem('createOrderEntry');
        if (entryRaw) {
            const entry = JSON.parse(entryRaw);
            const isFresh = entry && entry.timestamp && (Date.now() - entry.timestamp < 1800000);
            if (isFresh && entry.mode === 'guest') {
                localStorage.removeItem('createOrderEntry');
                switchToGuestCashier();
                return;
            }
            if (isFresh && entry.mode === 'member') {
                localStorage.removeItem('createOrderEntry');
                openMemberModal();
                return;
            }
            localStorage.removeItem('createOrderEntry');
        }
    } catch (e) {
        try {
            localStorage.removeItem('createOrderEntry');
        } catch (e2) {}
    }

    openMemberModal();
});
