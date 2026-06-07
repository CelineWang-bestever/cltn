const assert = require('assert');
const api = require('../selected-items-reset.js');

function makeDoc() {
    const els = new Map();
    function makeEl(id, html) {
        const el = { id, innerHTML: html || '' };
        els.set(id, el);
        return el;
    }

    const selectedNodes = [];
    function makeNode(cls) {
        const node = {
            className: cls,
            removed: false,
            remove() { this.removed = true; }
        };
        selectedNodes.push(node);
        return node;
    }

    const selectedArea = {
        querySelectorAll(sel) {
            if (sel !== '.upgrade-card-module, .course-card-section, .selected-item-card, .promotion-card-section') return [];
            return selectedNodes.filter(n => !n.removed);
        }
    };

    const doc = {
        getElementById(id) {
            return els.get(id) || null;
        },
        querySelector(sel) {
            if (sel === '.selected-items-area') return selectedArea;
            return null;
        }
    };

    return { doc, makeEl, makeNode, selectedArea, selectedNodes };
}

function run() {
    assert.strictEqual(api.shouldResetCustomerChange('member:1', 'member:2'), true);
    assert.strictEqual(api.shouldResetCustomerChange('guest', 'member:2'), true);
    assert.strictEqual(api.shouldResetCustomerChange('member:2', 'guest'), true);
    assert.strictEqual(api.shouldResetCustomerChange('member:2', 'member:2'), false);

    const { doc, makeEl, makeNode } = makeDoc();
    makeEl('service-table-body', '<tr>1</tr>');
    makeEl('product-table-body', '<tr>2</tr>');
    makeEl('amount-card-table-body', '<tr>3</tr>');
    makeEl('course-table-body', '<tr>4</tr>');
    makeEl('benefit-consume-table-body', '<tr>5</tr>');

    makeNode('upgrade-card-module');
    makeNode('course-card-section');
    makeNode('selected-item-card');
    makeNode('promotion-card-section');

    let upgradeCardList = [1];
    let rechargeCardList = [2];
    let selectedCourseCards = [3];
    let selectedAmountCards = [4];
    let selectedServices = [5];
    let selectedProducts = [6];
    let clearedWholeOrder = false;
    let afterUpdated = false;

    const ok = api.resetSelectedItemsArea({
        document: doc,
        setUpgradeCardList(v) { upgradeCardList = v; },
        setRechargeCardList(v) { rechargeCardList = v; },
        setSelectedCourseCards(v) { selectedCourseCards = v; },
        setSelectedAmountCards(v) { selectedAmountCards = v; },
        setSelectedServices(v) { selectedServices = v; },
        setSelectedProducts(v) { selectedProducts = v; },
        clearWholeOrderChange() { clearedWholeOrder = true; },
        afterUpdate() { afterUpdated = true; }
    });

    assert.strictEqual(ok, true);
    assert.strictEqual(doc.getElementById('service-table-body').innerHTML, '');
    assert.strictEqual(doc.getElementById('product-table-body').innerHTML, '');
    assert.strictEqual(doc.getElementById('amount-card-table-body').innerHTML, '');
    assert.strictEqual(doc.getElementById('course-table-body').innerHTML, '');
    assert.strictEqual(doc.getElementById('benefit-consume-table-body').innerHTML, '');
    assert.deepStrictEqual(upgradeCardList, []);
    assert.deepStrictEqual(rechargeCardList, []);
    assert.deepStrictEqual(selectedCourseCards, []);
    assert.deepStrictEqual(selectedAmountCards, []);
    assert.deepStrictEqual(selectedServices, []);
    assert.deepStrictEqual(selectedProducts, []);
    assert.strictEqual(clearedWholeOrder, true);
    assert.strictEqual(afterUpdated, true);
}

run();
