/**
 * customer-detail-pad.js
 * 客户详情页 (Pad版) — 全部事件绑定与业务逻辑
 * 重构自 customer-detail-pad.html 内联脚本
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ========== 第一部分：绑定原HTML内联事件（替代 onclick 属性） ==========

    // 1. 左侧边栏 — "更多信息"按钮
    (function () {
        var btn = document.querySelector('.sidebar-more-info-btn');
        if (btn) btn.addEventListener('click', function () { window.openMemberMoreInfo(); });
    })();

    (function () {
        var btn = document.getElementById('privacyEyeBtn');
        if (!(btn instanceof HTMLButtonElement)) return;

        var closedSvg = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10.733 5.08A10.744 10.744 0 0 1 12 5c7 0 10 7 10 7a18.058 18.058 0 0 1-2.017 3.07\"/><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499A10.75 10.75 0 0 1 12 19c-7 0-10-7-10-7a18.096 18.096 0 0 1 4.211-5.446\"/><path d=\"M2 2l20 20\"/></svg>";
        var openSvg = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>";

        var accountSection = document.querySelector('.sidebar-balance-section');
        var portraitSection = document.querySelector('.sidebar-portrait-section');

        function setSectionsHidden(hidden) {
            [accountSection, portraitSection].forEach(function (section) {
                if (!section) return;
                if (!section.dataset) return;
                if (typeof section.dataset.originalDisplay === 'undefined') {
                    section.dataset.originalDisplay = section.style.display || '';
                }
                section.style.display = hidden ? 'none' : section.dataset.originalDisplay;
            });
        }

        var isOpen = false;
        btn.innerHTML = closedSvg;
        btn.setAttribute('aria-pressed', 'false');
        setSectionsHidden(true);

        btn.addEventListener('click', function () {
            isOpen = !isOpen;
            btn.innerHTML = isOpen ? openSvg : closedSvg;
            btn.setAttribute('aria-pressed', String(isOpen));
            setSectionsHidden(!isOpen);
        });
    })();

    // 2. 账户概览 — 钱包余额点击跳转
    (function () {
        var items = document.querySelectorAll('.sidebar-balance-clickable');
        if (items[0]) items[0].addEventListener('click', function () { location.href = 'customer-detail-wallet.html'; });
        if (items[1]) items[1].addEventListener('click', function () { location.href = 'customer-detail-debt.html'; });
    })();

    // 3. 快捷操作按钮 — 开单 & 测肤
    (function () {
        var btns = document.querySelectorAll('.sidebar-actions .sidebar-btn-primary');
        btns.forEach(function (btn) {
            var t = (btn.textContent || '').replace(/\s/g, '');
            if (t.indexOf('开单') !== -1 || t.indexOf('单') !== -1) {
                btn.addEventListener('click', function () { window.location.href = 'create-order-pad.html'; });
            } else if (t.indexOf('测肤') !== -1 || (t.indexOf('测') !== -1 && t.indexOf('肤') !== -1)) {
                btn.addEventListener('click', function () { if (typeof window.openSkinTest === 'function') window.openSkinTest(); });
            }
        });
    })();

    // 4. 卡项 — "查看详情"链接
    (function () {
        document.querySelectorAll('.item-detail-link').forEach(function (link) {
            link.addEventListener('click', function () { var d=link.closest('.item-detail'); if(d){ var c=d.querySelector('.item-detail-content'); if(c)c.classList.toggle('open'); } });
        });
    })();

    // 5. 补单弹窗
    (function () {
        // 触发按钮
        var triggerBtn = document.getElementById('btn-supplement-time-bottom');
        if (triggerBtn) triggerBtn.addEventListener('click', function () { window.openSupplementModal(); });

        // 关闭按钮 (modal-close)
        var closeBtn = document.querySelector('#supplement-modal .modal-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { window.closeSupplementModal(); });

        // 取消按钮
        var cancelBtns = document.querySelectorAll('#supplement-modal .modal-btn-cancel');
        cancelBtns.forEach(function (b) { b.addEventListener('click', function () { window.closeSupplementModal(); }); });

        // 确认按钮
        var confirmBtn = document.querySelector('#supplement-modal .modal-btn-confirm');
        if (confirmBtn) confirmBtn.addEventListener('click', function () { window.confirmSupplement(); });
    })();

    // 6. 权益选择弹窗 (Benefit Select Modal)
    (function () {
        var modal = document.getElementById('benefit-select-modal');
        if (!modal) return;

        // 点击遮罩关闭
        modal.addEventListener('click', function (e) { if (e.target === modal) window.closeBenefitSelectModal(); });

        // 阻止面板点击冒泡
        var panel = modal.querySelector('.benefit-select-panel');
        if (panel) panel.addEventListener('click', function (e) { e.stopPropagation(); });

        // 关闭按钮
        var closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { window.closeBenefitSelectModal(); });

        // 取消按钮
        var cancelBtns = modal.querySelectorAll('.modal-btn-cancel');
        cancelBtns.forEach(function (b) { b.addEventListener('click', function () { window.closeBenefitSelectModal(); }); });

        // 确认按钮
        var confirmBtn = document.getElementById('benefit-select-confirm');
        if (confirmBtn) confirmBtn.addEventListener('click', function () { window.confirmBenefitSelection(); });
    })();

    // 7. 置换权益侧边抽屉 (Exchange Drawer)
    (function () {
        var overlay = document.getElementById('exchangeOverlay');
        if (!overlay) return;

        // 点击遮罩关闭
        overlay.addEventListener('click', function (e) { if (e.target === overlay) window.closeExchangeDrawer(); });

        // 关闭按钮
        var closeBtn = overlay.querySelector('.exchange-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { window.closeExchangeDrawer(); });

        // 取消按钮
        var cancelBtns = overlay.querySelectorAll('.exchange-footer-btn-cancel');
        cancelBtns.forEach(function (b) { b.addEventListener('click', function () { window.closeExchangeDrawer(); }); });

        // 确认按钮
        var confirmBtn = overlay.querySelector('.exchange-footer-btn-confirm');
        if (confirmBtn) confirmBtn.addEventListener('click', function () { window.confirmExchange(); });

        // 获取 drawer 引用（用于步进器事件委托）
        var drawer = overlay.querySelector('.exchange-drawer');

        // 阻止抽屉点击冒泡到 overlay 遮罩（防止误关闭）
        if (drawer) drawer.addEventListener('click', function (e) { e.stopPropagation(); });

        // 进步器 (Stepper) 事件委托 — 增减更换次数（绑在 drawer 上，因 drawer 阻止了冒泡）
        if (drawer) {
            drawer.addEventListener('click', function (e) {
                var btn = e.target.closest('.exchange-stepper-btn');
                if (!btn || btn.disabled) return;

                var stepper = btn.closest('.exchange-stepper');
                if (!stepper) return;

                var valueEl = stepper.querySelector('.exchange-stepper-value');
                var minusBtn = stepper.querySelector('.exchange-stepper-minus');
                var plusBtn = stepper.querySelector('.exchange-stepper-plus');
                if (!valueEl || !minusBtn || !plusBtn) return;

                var min = parseInt(stepper.getAttribute('data-min')) || 1;
                var max = parseInt(stepper.getAttribute('data-max')) || 99;
                var current = parseInt(valueEl.textContent) || min;

                var isIncrement = btn.classList.contains('exchange-stepper-plus');
                var newVal = isIncrement ? current + 1 : current - 1;

                // 边界校验
                if (newVal < min) newVal = min;
                if (newVal > max) newVal = max;

                // 更新数值显示
                valueEl.textContent = newVal;
                stepper.setAttribute('data-value', newVal);

                // 更新按钮禁用状态
                minusBtn.disabled = (newVal <= min);
                plusBtn.disabled = (newVal >= max);

                // 数值变更反馈 — 短时高亮
                valueEl.style.color = '#E87C9A';
                valueEl.style.transform = 'scale(1.15)';
                clearTimeout(stepper._feedbackTimer);
                stepper._feedbackTimer = setTimeout(function () {
                    valueEl.style.color = '#333';
                    valueEl.style.transform = 'scale(1)';
                }, 200);

                // 触发合计刷新
                if (typeof window.updateExchangeSummary === 'function') {
                    window.updateExchangeSummary();
                }
            });
        }
    })();

    // 8. 会员更多信息弹窗
    (function () {
        var overlay = document.getElementById('memberInfoOverlay');
        if (!overlay) return;

        // 关闭按钮
        var closeBtn = overlay.querySelector('.member-info-close');
        if (closeBtn) closeBtn.addEventListener('click', function () { window.closeMemberMoreInfo(); });

        // 客户标签编辑
        var tagsEditBtn = document.getElementById('tagsEditBtn');
        if (tagsEditBtn) tagsEditBtn.addEventListener('click', function () { window.toggleEditMode('tags'); });

        // 添加标签按钮
        var tagAddBtn = overlay.querySelector('.tag-add-btn');
        if (tagAddBtn) tagAddBtn.addEventListener('click', function () { window.addNewTag(); });

        // 预设标签
        overlay.querySelectorAll('.preset-tag').forEach(function (tag) {
            tag.addEventListener('click', function () { window.selectPresetTag(tag); });
        });

        // 基础信息编辑
        var basicEditBtn = document.getElementById('basicEditBtn');
        if (basicEditBtn) basicEditBtn.addEventListener('click', function () { window.toggleEditMode('basic'); });

        // 补充信息编辑
        var extraEditBtn = document.getElementById('extraEditBtn');
        if (extraEditBtn) extraEditBtn.addEventListener('click', function () { window.toggleEditMode('extra'); });

        // 取消按钮
        var cancelBtn = overlay.querySelector('.member-footer-btn.cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function () { window.cancelMemberEdit(); });

        // 保存按钮
        var saveBtn = document.getElementById('memberSaveBtn');
        if (saveBtn) saveBtn.addEventListener('click', function () { window.saveMemberInfo(); });
    })();

    // ========== 第二部分：初始化数据驱动样式 ==========

    // 初始化进度条宽度（静态HTML中的data值由JS驱动显示）
    (function () {
        document.querySelectorAll('.btn-use').forEach(function (btn) {
            var itemId = btn.dataset.itemId;
            var total = parseInt(btn.dataset.max) || 1;
            var remain = parseInt(btn.dataset.remain) || 0;
            var pct = total > 0 ? ((remain / total) * 100).toFixed(2) : 0;
            var card = btn.closest('.service-item') || btn.closest('.product-item');
            if (!card) return;
            var progressFill = card.querySelector('.progress-fill');
            var progressText = card.querySelector('.progress-text');
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.textContent = '剩余 ' + remain + ' / 共 ' + total;
        });
    })();

    // ========== 第三部分：核心业务逻辑 ==========
    // （以下为原 customer-detail-pad.html 中 <script> 块的完整内容）

(function() {
    // ========== 数据模型 ==========
    var selectedItems = [];          // 已选项目数组
    var itemIdCounter = 0;           // 行ID自增计数器

    // 权益剩余次数追踪（用于删除时还原）
    var remainTracker = {};

    // 初始化追踪数据
    function initRemainTracker() {
        document.querySelectorAll('.btn-use').forEach(function(btn) {
            var id = btn.dataset.itemId;
            remainTracker[id] = parseInt(btn.dataset.remain) || 0;
        });
    }
    initRemainTracker();

    // ========== DOM 元素引用 ==========
    var selectedTbody       = document.getElementById('selected-tbody');
    var selectedTableWrap   = document.getElementById('selected-table-wrap');
    var selectedEmptyTip    = document.getElementById('selected-empty-tip');
    var selectedCountBadge  = document.getElementById('selected-count');
    var totalQtyEl          = document.getElementById('bottom-total-qty');
    var bottomReceivableEl  = document.getElementById('bottom-receivable-amt');
    var priceGuardModal     = document.getElementById('price-guard-modal');
    var priceGuardMessage   = document.getElementById('price-guard-message');
    var priceGuardOkBtn     = document.getElementById('price-guard-ok');
    var priceGuardOnClose   = null;

    // ========== 工具函数 ==========
    function showToast(msg) {
        var t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function() { t.classList.remove('show'); }, 2200);
    }

    function openPriceGuardModal(msg, onClose) {
        if (!priceGuardModal || !priceGuardMessage) return;
        priceGuardMessage.textContent = String(msg == null ? '' : msg);
        priceGuardOnClose = typeof onClose === 'function' ? onClose : null;
        priceGuardModal.classList.add('show');
    }

    function openPriceGuardModalHtml(html, onClose) {
        if (!priceGuardModal || !priceGuardMessage) return;
        priceGuardMessage.innerHTML = String(html == null ? '' : html);
        priceGuardOnClose = typeof onClose === 'function' ? onClose : null;
        priceGuardModal.classList.add('show');
    }

    function closePriceGuardModal() {
        if (!priceGuardModal) return;
        priceGuardModal.classList.remove('show');
        var cb = priceGuardOnClose;
        priceGuardOnClose = null;
        if (cb) cb();
    }

    if (priceGuardOkBtn) {
        priceGuardOkBtn.addEventListener('click', function() {
            closePriceGuardModal();
        });
    }

    function clampNumber(v, min, max) {
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }

    function sanitizeIntString(value) {
        var v = String(value == null ? '' : value).replace(/[^\d]/g, '');
        if (!v) return '';
        return String(parseInt(v, 10));
    }

    function parseQtyValue(v) {
        var s = sanitizeIntString(v);
        var n = parseInt(s || '0', 10);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }

    function getRowBuyGiftTotal(row) {
        if (!row || !row.querySelector) return null;
        var buyAttr = row.getAttribute ? row.getAttribute('data-buy-qty') : null;
        var giftAttr = row.getAttribute ? row.getAttribute('data-gift-qty') : null;
        if (buyAttr != null || giftAttr != null) {
            var buyN = parseQtyValue(buyAttr || '0');
            var giftN = parseQtyValue(giftAttr || '0');
            return Math.max(0, buyN + giftN);
        }
        var buyEl = row.querySelector(
            'input[data-field="buyQty"], input[data-field="buy"], input[data-field="buyCount"], [data-field="buyQty"], [data-field="buy"], [data-buy-qty], .col-buy, .buy-qty, [class*="buy"][class*="qty"], [class*="buyQty"]'
        );
        var giftEl = row.querySelector(
            'input[data-field="giftQty"], input[data-field="gift"], input[data-field="giftCount"], [data-field="giftQty"], [data-field="gift"], [data-gift-qty], .col-gift, .gift-qty, [class*="gift"][class*="qty"], [class*="giftQty"]'
        );
        if (!buyEl && !giftEl) return null;
        var buy = buyEl
            ? parseQtyValue(('value' in buyEl ? buyEl.value : buyEl.textContent) || '')
            : 0;
        var gift = giftEl
            ? parseQtyValue(('value' in giftEl ? giftEl.value : giftEl.textContent) || '')
            : 0;
        return Math.max(0, buy + gift);
    }

    function getTakeConsumeKind(el) {
        if (!(el instanceof HTMLInputElement)) return '';
        var field = String(el.getAttribute('data-field') || '').trim();
        if (field === 'take' || field === 'takeQty') return 'take';
        if (field === 'consume' || field === 'consumeQty') return 'consume';
        if (field.indexOf('take') > -1) return 'take';
        if (field.indexOf('consume') > -1) return 'consume';

        var id = String(el.id || '').toLowerCase();
        var name = String(el.name || '').toLowerCase();
        var cls = String(el.className || '').toLowerCase();
        var ph = String(el.placeholder || '').trim();
        if (id.indexOf('take') > -1 || name.indexOf('take') > -1 || cls.indexOf('take') > -1) return 'take';
        if (id.indexOf('consume') > -1 || name.indexOf('consume') > -1 || cls.indexOf('consume') > -1) return 'consume';
        if (ph.indexOf('拿走') > -1) return 'take';
        if (ph.indexOf('消耗') > -1) return 'consume';

        if (el.closest && el.closest('.col-consume')) return 'consume';
        if (el.closest && (el.closest('.col-take') || el.closest('.col-takeout') || el.closest('.col-take-qty'))) return 'take';

        var wrap = el.closest('td, .field, .form-row, .table-stepper, .stepper');
        var txt = wrap ? String(wrap.textContent || '') : '';
        if (txt.indexOf('拿走') > -1) return 'take';
        if (txt.indexOf('消耗') > -1) return 'consume';
        return '';
    }

    function getMaxForTakeConsumeInput(inputEl) {
        if (!(inputEl instanceof HTMLInputElement)) return null;
        var row = inputEl.closest ? inputEl.closest('tr') : null;
        var max = getRowBuyGiftTotal(row);
        if (max !== null) return max;
        var maxAttr = parseQtyValue(inputEl.max || '');
        if (maxAttr > 0) return maxAttr;
        return null;
    }

    function setInteractiveDisabled(el, disabled) {
        if (!el) return;
        if ('disabled' in el) {
            el.disabled = !!disabled;
        } else {
            el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
            el.style.pointerEvents = disabled ? 'none' : '';
            el.style.opacity = disabled ? '0.45' : '';
        }
    }

    function syncTableStepperForInput(inputEl) {
        if (!(inputEl instanceof HTMLInputElement)) return;
        var wrap = inputEl.closest ? inputEl.closest('.table-stepper') : null;
        if (!wrap) return;
        var kind = getTakeConsumeKind(inputEl);
        if (!kind) return;

        var max = getMaxForTakeConsumeInput(inputEl);
        if (max === null) return;
        var v = parseQtyValue(inputEl.value);

        var btns = Array.from(wrap.querySelectorAll('button, .table-stepper-btn, .stepper-btn, [role="button"]'));
        var plusBtn = null;
        var minusBtn = null;
        btns.forEach(function (b) {
            if (plusBtn && minusBtn) return;
            var cls = String(b.className || '').toLowerCase();
            var t = String(b.textContent || '').trim();
            if (!plusBtn && (cls.indexOf('plus') > -1 || cls.indexOf('add') > -1 || t === '+' || t === '＋')) plusBtn = b;
            if (!minusBtn && (cls.indexOf('minus') > -1 || cls.indexOf('sub') > -1 || t === '-' || t === '−' || t === '－')) minusBtn = b;
        });

        setInteractiveDisabled(minusBtn, !(v > 0));
        setInteractiveDisabled(plusBtn, !(v < max));
    }

    function parseMoneyText(text) {
        var s = String(text == null ? '' : text).replace(/[^\d.]/g, '');
        var n = parseFloat(s);
        return Number.isFinite(n) ? n : 0;
    }

    function roundMoney2(n) {
        var x = Number(n);
        if (!Number.isFinite(x)) return 0;
        return Number(x.toFixed(2));
    }

    function clampTakeConsumeQty(inputEl, opts) {
        if (!inputEl) return;
        var kind = getTakeConsumeKind(inputEl);
        if (!kind) return;
        var max = getMaxForTakeConsumeInput(inputEl);
        if (max === null) return;
        var raw = String(inputEl.value == null ? '' : inputEl.value);
        var v = parseQtyValue(raw);
        if (v > max) {
            inputEl.value = String(max);
            if (!opts || opts.silent !== true) {
                var label = kind === 'consume' ? '消耗数量' : '拿走数量';
                showToast(label + '不可超过购买数量+赠送数量(' + max + ')');
            }
            syncTableStepperForInput(inputEl);
            return;
        }
        if (raw !== String(v)) inputEl.value = String(v);
        syncTableStepperForInput(inputEl);
    }

    document.addEventListener('beforeinput', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        var kind = getTakeConsumeKind(el);
        if (!kind) return;
        var max = getMaxForTakeConsumeInput(el);
        if (max === null) return;

        if (e.inputType === 'insertFromPaste' || e.inputType === 'insertText') {
            var data = String(e.data == null ? '' : e.data);
            var start = Number.isFinite(el.selectionStart) ? el.selectionStart : el.value.length;
            var end = Number.isFinite(el.selectionEnd) ? el.selectionEnd : el.value.length;
            var next = String(el.value || '').slice(0, start) + data + String(el.value || '').slice(end);
            var nextVal = parseQtyValue(next);
            if (nextVal > max) {
                e.preventDefault();
                el.value = String(max);
                var label = kind === 'consume' ? '消耗数量' : '拿走数量';
                showToast(label + '不可超过购买数量+赠送数量(' + max + ')');
            }
        }
    }, true);

    document.addEventListener('input', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        clampTakeConsumeQty(el);
    }, true);

    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        clampTakeConsumeQty(el);
    }, true);

    document.addEventListener('click', function (e) {
        var el = e.target;
        if (!(el instanceof Element)) return;
        var wrap = el.closest('.table-stepper, .stepper');
        if (!wrap) return;
        var input = wrap.querySelector('input');
        if (!(input instanceof HTMLInputElement)) return;
        window.setTimeout(function () {
            clampTakeConsumeQty(input, { silent: true });
        }, 0);
    }, true);

    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.type === 'checkbox' && el.closest && el.closest('tr.item-row')) {
            scheduleBottomReceivableUpdate();
        }
    }, true);

    document.addEventListener('input', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.matches && el.matches('input[data-field="finalPrice"]')) {
            scheduleBottomReceivableUpdate();
        }
    }, true);

    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.matches && el.matches('input[data-field="finalPrice"]')) {
            scheduleBottomReceivableUpdate();
        }
    }, true);

    document.addEventListener('input', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.matches && el.matches('input[data-field="discount"], .discount-input, input[data-field="buyQty"], input[data-field="buy"]')) {
            scheduleBottomReceivableUpdate();
        }
    }, true);

    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.matches && el.matches('input[data-field="discount"], .discount-input, input[data-field="buyQty"], input[data-field="buy"]')) {
            scheduleBottomReceivableUpdate();
        }
    }, true);

    try {
        var receivableObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type !== 'childList') continue;
                if ((m.addedNodes && m.addedNodes.length) || (m.removedNodes && m.removedNodes.length)) {
                    scheduleBottomReceivableUpdate();
                    break;
                }
            }
        });
        receivableObserver.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}

    try {
        var wocOpenObserver = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type !== 'attributes') continue;
                if (m.attributeName !== 'class') continue;
                var target = m.target;
                if (!(target instanceof Element)) continue;
                if (!target.classList.contains('show')) continue;
                var hit = findWholeOrderChangeInputs();
                if ((hit.amount && target.contains(hit.amount)) || (hit.discount && target.contains(hit.discount))) {
                    refreshWholeOrderChangeMinRules();
                    break;
                }
            }
        });
        wocOpenObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    } catch (e) {}

    function sumCheckedItemFinalPrices() {
        var rows = Array.from(document.querySelectorAll('tr.item-row'));
        if (!rows.length) {
            rows = Array.from(document.querySelectorAll('tr')).filter(function (tr) {
                if (!(tr instanceof HTMLTableRowElement)) return false;
                if (tr.closest && tr.closest('#selected-table-wrap')) return false;
                if (tr.closest && tr.closest('.selected-table-wrapper')) return false;
                return !!(tr.querySelector && tr.querySelector('input[data-field="finalPrice"], .col-final, [data-field="finalPrice"], [data-field="final"], input[data-field="discount"], .discount-input, [data-moneycards]'));
            });
        }

        var sum = 0;
        rows.forEach(function (row) {
            if (!row || !row.querySelector) return;
            if (row.dataset && (row.dataset.deleted === '1' || row.dataset.invalid === '1')) return;
            if (row.classList && (row.classList.contains('deleted') || row.classList.contains('invalid') || row.classList.contains('disabled'))) return;

            var cb = row.querySelector('input[type="checkbox"]');
            if (cb && !cb.checked) return;

            var v = 0;
            var finalInput = row.querySelector('input[data-field="finalPrice"]');
            if (finalInput && 'value' in finalInput) v = parseMoneyText(finalInput.value);

            if (!(v > 0.000001)) {
                var finalCell = row.querySelector('.col-final, [data-field="finalPrice"], [data-field="final"]');
                v = parseMoneyText(finalCell ? finalCell.textContent : '');
            }

            if (!(v > 0.000001)) {
                var originalPrice = getRowOriginalPrice(row);
                var buyQty = getRowBuyQty(row);
                var discountPct = getRowDiscountPct(row);
                v = roundMoney2(originalPrice * buyQty * (discountPct / 100));
            }

            sum += roundMoney2(v);
        });
        return roundMoney2(sum);
    }

    function updateBottomReceivableAmount() {
        if (!bottomReceivableEl) return;
        var total = sumCheckedItemFinalPrices();
        bottomReceivableEl.textContent = '¥' + total.toFixed(2);
    }

    var receivableRaf = 0;
    function scheduleBottomReceivableUpdate() {
        if (receivableRaf) cancelAnimationFrame(receivableRaf);
        receivableRaf = requestAnimationFrame(function () {
            receivableRaf = 0;
            updateBottomReceivableAmount();
            refreshWholeOrderChangeMinRules();
        });
    }

    function findWholeOrderChangeInputs() {
        var inputs = Array.from(document.querySelectorAll('input'));
        var amount = null;
        var discount = null;
        inputs.forEach(function (el) {
            if (!(el instanceof HTMLInputElement)) return;
            var id = String(el.id || '').toLowerCase();
            var name = String(el.name || '').toLowerCase();
            var cls = String(el.className || '').toLowerCase();
            var ph = String(el.placeholder || '');
            var dataField = String(el.getAttribute('data-field') || '').toLowerCase();

            var wrap = el.closest('.woc-field, .woc-input-wrap, .order-field, .form-row, .modal-body');
            var labelText = wrap ? String(wrap.textContent || '') : '';

            var isAmount =
                id.indexOf('wocamount') > -1 ||
                dataField.indexOf('wocamount') > -1 ||
                dataField.indexOf('wholeorderamount') > -1 ||
                dataField.indexOf('orderpayable') > -1 ||
                name.indexOf('amount') > -1 && labelText.indexOf('整单') > -1 ||
                cls.indexOf('woc') > -1 && labelText.indexOf('应收') > -1 ||
                ph.indexOf('整单') > -1 && (ph.indexOf('应收') > -1 || ph.indexOf('应付') > -1) ||
                labelText.indexOf('整单应收') > -1 ||
                labelText.indexOf('整单应付') > -1;

            var isDiscount =
                id.indexOf('wocdiscount') > -1 ||
                dataField.indexOf('wocdiscount') > -1 ||
                dataField.indexOf('wholeorderdiscount') > -1 ||
                name.indexOf('discount') > -1 && labelText.indexOf('整单') > -1 ||
                cls.indexOf('woc') > -1 && labelText.indexOf('折扣') > -1 ||
                ph.indexOf('整单') > -1 && ph.indexOf('折扣') > -1 ||
                labelText.indexOf('整单折扣') > -1;

            if (isAmount) amount = amount || el;
            if (isDiscount) discount = discount || el;
        });
        return { amount: amount, discount: discount };
    }

    function getWholeOrderChangeAmountInput() {
        var hit = findWholeOrderChangeInputs();
        return hit.amount;
    }

    function isWholeOrderChangeInput(el) {
        if (!(el instanceof HTMLInputElement)) return false;
        var hit = findWholeOrderChangeInputs();
        return el === hit.amount || el === hit.discount;
    }

    function getWholeOrderChangeDiscountInput() {
        var hit = findWholeOrderChangeInputs();
        return hit.discount;
    }

    function sumCheckedMoneyCardUsed() {
        var rows = Array.from(document.querySelectorAll('tr.item-row'));
        if (!rows.length) {
            rows = Array.from(document.querySelectorAll('tr')).filter(function (tr) {
                if (!(tr instanceof HTMLTableRowElement)) return false;
                if (tr.closest && tr.closest('#selected-table-wrap')) return false;
                if (tr.closest && tr.closest('.selected-table-wrapper')) return false;
                return !!(tr.querySelector && tr.querySelector('[data-moneycards], [data-money-card-id], [data-money-card-name]'));
            });
        }

        var sum = 0;
        rows.forEach(function (row) {
            if (!row || !row.querySelector) return;
            if (row.dataset && (row.dataset.deleted === '1' || row.dataset.invalid === '1')) return;
            if (row.classList && (row.classList.contains('deleted') || row.classList.contains('invalid') || row.classList.contains('disabled'))) return;
            var cb = row.querySelector('input[type="checkbox"]');
            if (cb && !cb.checked) return;
            if (!hasRowMoneyCards(row)) return;
            sum += getRowMoneyCardUsed(row);
        });
        return roundMoney2(sum);
    }

    function computeWholeOrderChangeMinRules() {
        var minAmount = sumCheckedMoneyCardUsed();
        if (!(minAmount > 0.000001)) {
            return { minAmount: 0, minDiscountZhe: 0, totalFinal: sumCheckedItemFinalPrices() };
        }
        var totalFinal = sumCheckedItemFinalPrices();
        var ratio = totalFinal > 0.000001 ? (minAmount / totalFinal) : 0;
        var minDiscountZhe = ratio * 10;
        return { minAmount: roundMoney2(minAmount), minDiscountZhe: Number(minDiscountZhe.toFixed(2)), totalFinal: roundMoney2(totalFinal) };
    }

    var lastWocOverlay = null;
    var lastWocOverlayVisible = false;
    function refreshWholeOrderChangeMinRules() {
        var amountInput = getWholeOrderChangeAmountInput();
        var discountInput = getWholeOrderChangeDiscountInput();
        if (!amountInput && !discountInput) return;
        var anchor = amountInput || discountInput;
        if (!(anchor instanceof HTMLInputElement)) return;

        var panel = anchor.closest ? anchor.closest('.modal-panel, .modal, .dialog, .sheet, .popup') : null;
        var overlay = panel && panel.closest ? panel.closest('.modal-overlay, .overlay, .dialog-overlay, .popup-overlay') : null;
        var visible = false;
        if (overlay && overlay.classList) visible = overlay.classList.contains('show');
        if (!visible) {
            try { visible = !!(anchor.getClientRects && anchor.getClientRects().length); } catch (e) { visible = false; }
        }

        if (visible && overlay && (!lastWocOverlayVisible || overlay !== lastWocOverlay)) {
            var hit = findWholeOrderChangeInputs();
            if (hit.amount && hit.amount.dataset) hit.amount.dataset.wocOrigin = String(hit.amount.value || '');
            if (hit.discount && hit.discount.dataset) hit.discount.dataset.wocOrigin = String(hit.discount.value || '');
        }
        lastWocOverlay = overlay || null;
        lastWocOverlayVisible = !!visible;

        var rules = computeWholeOrderChangeMinRules();

        if (panel) {
            var body = panel.querySelector('.modal-body') || panel;
            var minBox = body.querySelector('#wocMinInfo');
            if (!minBox) {
                minBox = document.createElement('div');
                minBox.className = 'woc-min-info';
                minBox.id = 'wocMinInfo';
                minBox.innerHTML =
                    '<div class="woc-min-row"><span class="woc-min-label">最低改价金额</span><span class="woc-min-value" id="wocMinAmountVal">¥0.00</span></div>' +
                    '<div class="woc-min-row"><span class="woc-min-label">最低折扣</span><span class="woc-min-value" id="wocMinDiscountVal">0折</span></div>';
                body.appendChild(minBox);
            }
            var minAmtEl = minBox.querySelector('#wocMinAmountVal');
            var minDisEl = minBox.querySelector('#wocMinDiscountVal');
            if (minAmtEl) minAmtEl.textContent = '¥' + rules.minAmount.toFixed(2);
            if (minDisEl) minDisEl.textContent = (rules.minDiscountZhe || 0).toFixed(2) + '折';
        }

        if (overlay) {
            var confirmBtn = Array.from(overlay.querySelectorAll('button, .modal-btn-confirm')).find(function (b) {
                if (!(b instanceof Element)) return false;
                var t = String(b.textContent || '').trim();
                if (t !== '确定') return false;
                return !!(panel && b.closest && b.closest('.modal-panel, .modal, .dialog, .sheet, .popup') === panel);
            });
            if (confirmBtn && !confirmBtn.dataset.wocBound) {
                confirmBtn.dataset.wocBound = '1';
                var old = confirmBtn.onclick;
                confirmBtn.onclick = function (ev) {
                    var amtInput = getWholeOrderChangeAmountInput();
                    var disInput = getWholeOrderChangeDiscountInput();
                    var originAmt = amtInput && amtInput.dataset ? String(amtInput.dataset.wocOrigin || amtInput.value || '') : '';
                    var originDis = disInput && disInput.dataset ? String(disInput.dataset.wocOrigin || disInput.value || '') : '';

                    var r = computeWholeOrderChangeMinRules();
                    var amt = roundMoney2(parseMoneyText(amtInput ? amtInput.value : '0'));
                    if (amtInput && r.minAmount > 0.000001 && (amt + 0.000001 < r.minAmount)) {
                        if (ev && ev.preventDefault) ev.preventDefault();
                        if (ev && ev.stopPropagation) ev.stopPropagation();
                        var html = '整单应收不允许低于最低改价金额（<span class="guard-highlight">¥' + r.minAmount.toFixed(2) + '</span>）';
                        openPriceGuardModalHtml(html);
                        if (amtInput) {
                            amtInput.value = originAmt;
                            amtInput.dispatchEvent(new Event('input', { bubbles: true }));
                            amtInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        if (disInput) {
                            disInput.value = originDis;
                            disInput.dispatchEvent(new Event('input', { bubbles: true }));
                            disInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        return false;
                    }
                    if (typeof old === 'function') return old.call(this, ev);
                    return true;
                };
            }
        }
    }

    var wholeOrderChangeValidateTimer = 0;
    function scheduleWholeOrderChangeValidation() {
        if (wholeOrderChangeValidateTimer) window.clearTimeout(wholeOrderChangeValidateTimer);
        wholeOrderChangeValidateTimer = window.setTimeout(function () {
            wholeOrderChangeValidateTimer = 0;
            var amtInput = getWholeOrderChangeAmountInput();
            if (!amtInput) return;
            var max = sumCheckedItemFinalPrices();
            if (!(max > 0.000001)) return;
            var amt = roundMoney2(parseMoneyText(amtInput.value));
            if (amt - 0.000001 > max) {
                amtInput.value = max.toFixed(2);
                openPriceGuardModal('整单应收不允许超过商品总金额（' + max.toFixed(2) + '）');
            }
        }, 50);
    }

    document.addEventListener('change', function (e) {
        var el = e.target;
        if (!isWholeOrderChangeInput(el)) return;
        scheduleWholeOrderChangeValidation();
    }, true);

    document.addEventListener('blur', function (e) {
        var el = e.target;
        if (!isWholeOrderChangeInput(el)) return;
        scheduleWholeOrderChangeValidation();
    }, true);

    document.addEventListener('click', function (e) {
        var el = e.target;
        if (!(el instanceof Element)) return;
        var btn = el.closest('[data-key="confirm"], .key-item[data-key="confirm"], button[data-key="confirm"]');
        if (!btn) return;
        scheduleWholeOrderChangeValidation();
        refreshWholeOrderChangeMinRules();
    }, true);

    function getRowDiscountPct(row) {
        if (!row || !row.querySelector) return 100;
        var input = row.querySelector('input[data-field="discount"], .discount-input');
        if (!input) return 100;
        var intStr = sanitizeIntString(input.value);
        var v = intStr === '' ? 0 : parseInt(intStr, 10);
        return clampNumber(v, 0, 100);
    }

    function setRowDiscountPct(row, discountPct) {
        if (!row || !row.querySelector) return;
        var input = row.querySelector('input[data-field="discount"], .discount-input');
        if (!input) return;
        input.value = String(clampNumber(parseInt(discountPct, 10) || 0, 0, 100));
    }

    function hasRowMoneyCards(row) {
        if (!row || !row.getAttribute) return false;
        var raw = String(row.getAttribute('data-moneycards') || '').trim();
        if (raw && raw !== '[]') return true;
        var legacy = String(row.getAttribute('data-money-card-id') || '').trim();
        return !!legacy;
    }

    function getRowMoneyCardUsed(row) {
        if (!row || !row.getAttribute) return 0;
        var raw = String(row.getAttribute('data-moneycards') || '').trim();
        if (!raw) return 0;
        try {
            var arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return 0;
            var sum = 0;
            arr.forEach(function(x) {
                var n = roundMoney2(Number(x && x.amount ? x.amount : 0));
                if (n > 0) sum += n;
            });
            return roundMoney2(sum);
        } catch (e) {
            return 0;
        }
    }

    function updateRowPayable(row) {
        if (!row) return;
        var finalPrice = parseMoneyText((row.querySelector && row.querySelector('input[data-field="finalPrice"]')) ? row.querySelector('input[data-field="finalPrice"]').value : '');
        if (!Number.isFinite(finalPrice)) finalPrice = 0;
        var used = hasRowMoneyCards(row) ? getRowMoneyCardUsed(row) : 0;
        var payable = roundMoney2(Math.max(0, finalPrice - used));
        var el = row.querySelector && row.querySelector('.item-payable-val');
        if (el) el.textContent = '¥' + payable.toFixed(2);
    }

    function getRowBuyQty(row) {
        if (!row || !row.querySelector) return 0;
        var el = row.querySelector('input[data-field="buyQty"], input[data-field="buy"]');
        var n = parseInt(String(el && el.value ? el.value : '0'), 10);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }

    function getRowOriginalPrice(row) {
        if (!row || !row.querySelector) return 0;
        var originalCell = row.querySelector('.col-original');
        if (originalCell) return parseMoneyText(originalCell.textContent);
        var originalInput = row.querySelector('input[data-field="originalPrice"], input[data-field="price"]');
        if (originalInput) return parseMoneyText(originalInput.value);
        return 0;
    }

    function setRowFinalPrice(row, finalPrice) {
        if (!row || !row.querySelector) return;
        var v = Number.isFinite(finalPrice) ? finalPrice : 0;
        var input = row.querySelector('input[data-field="finalPrice"]');
        if (input) input.value = v.toFixed(2);
        var cell = row.querySelector('.col-final');
        if (cell) cell.textContent = '¥' + v.toFixed(2);
    }

    function clearRowMoneyCards(row) {
        if (!row || !row.getAttribute) return;
        row.removeAttribute('data-moneycards');
        row.removeAttribute('data-money-card-id');
        row.removeAttribute('data-money-card-name');
        row.removeAttribute('data-money-card-discount');
        var next = row.nextElementSibling;
        if (next && next.classList && next.classList.contains('moneycard-detail-row')) next.remove();
        var btn = row.querySelector && row.querySelector('[data-action="open-moneycard-modal"], .use-card-btn');
        if (btn && 'disabled' in btn) btn.disabled = false;
        if (btn && 'textContent' in btn) btn.textContent = '选择金额卡';
    }

    function handleDiscountInputConflict(input) {
        if (!input) return;
        var row = input.closest && input.closest('tr');
        if (!row) return;
        if (row.dataset && row.dataset.clearingMoneycards === '1') return;
        var rawApps = row.getAttribute && row.getAttribute('data-moneycards');
        var hasApps = !!rawApps && rawApps !== '[]';
        var intStr = sanitizeIntString(input.value);
        var discount = clampNumber(intStr === '' ? 0 : parseInt(intStr, 10), 0, 100);
        input.value = String(discount);

        if (hasApps) {
            if (row.dataset) row.dataset.clearingMoneycards = '1';
            clearRowMoneyCards(row);
            if (row.dataset) row.dataset.clearingMoneycards = '';
        }

        var originalPrice = getRowOriginalPrice(row);
        var buyQty = getRowBuyQty(row);
        var finalPrice = originalPrice * buyQty * (discount / 100);
        setRowFinalPrice(row, finalPrice);
        updateRowPayable(row);
    }

    function handleFinalPriceInputConflict(input) {
        if (!input) return;
        var row = input.closest && input.closest('tr');
        if (!row) return;
        if (!hasRowMoneyCards(row)) return;
        if (row.dataset && row.dataset.clearingMoneycards === '1') return;

        var originalPrice = getRowOriginalPrice(row);
        var buyQty = getRowBuyQty(row);
        var discountPct = getRowDiscountPct(row);
        var baseAmount = roundMoney2(originalPrice * buyQty * (discountPct / 100));
        var newFinal = roundMoney2(parseMoneyText(input.value));
        var lastValid = roundMoney2(parseMoneyText(input.dataset && input.dataset.lastValid ? input.dataset.lastValid : baseAmount));

        if (newFinal > baseAmount + 0.000001) {
            if (row.dataset) row.dataset.clearingMoneycards = '1';
            setRowFinalPrice(row, lastValid);
            if (input.dataset) input.dataset.lastValid = lastValid.toFixed(2);
            updateRowPayable(row);
            openPriceGuardModal('修改折后价必须小于等于原折扣价格(' + baseAmount.toFixed(2) + '元)', function() {
                if (row.dataset) row.dataset.clearingMoneycards = '';
            });
            return;
        }

        if (newFinal + 0.000001 < baseAmount) {
            if (row.dataset) row.dataset.clearingMoneycards = '1';
            clearRowMoneyCards(row);
            if (row.dataset) row.dataset.clearingMoneycards = '';
            setRowFinalPrice(row, newFinal);
            var baseTotalNoDiscount = roundMoney2(originalPrice * buyQty);
            var newDiscountPct = baseTotalNoDiscount > 0 ? (newFinal / baseTotalNoDiscount) * 100 : 0;
            setRowDiscountPct(row, Math.round(clampNumber(newDiscountPct, 0, 100)));
            if (input.dataset) input.dataset.lastValid = newFinal.toFixed(2);
            updateRowPayable(row);
            return;
        }

        setRowFinalPrice(row, newFinal);
        if (input.dataset) input.dataset.lastValid = newFinal.toFixed(2);
        updateRowPayable(row);
    }

    function updateSummary() {
        var count = selectedItems.length;
        var totalQty = selectedItems.reduce(function(s, item) { return s + item.qty; }, 0);

        selectedCountBadge.textContent = count;
        totalQtyEl.textContent = totalQty;

        if (count === 0) {
            selectedEmptyTip.style.display = '';
            selectedTableWrap.style.display = 'none';
        } else {
            selectedEmptyTip.style.display = 'none';
            selectedTableWrap.style.display = '';
        }

        scheduleBottomReceivableUpdate();
    }

    function renderSelectedTable() {
        selectedTbody.innerHTML = '';

        selectedItems.forEach(function(item, idx) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' +
                    '<div class="selected-item-name">' + escapeHtml(item.name) + '</div>' +
                '</td>' +
                '<td>' + (item.source === '会员权益' ? '-' : escapeHtml(item.source)) + '</td>' +
                '<td>' + buildStepperHtml(idx, item.qty, item.maxQty) + '</td>' +
                '<td>' + buildBeauticianSelectHtml(idx, item.beautician) + '</td>' +
                '<td class="action-cell">' +
                    '<button class="row-action-btn row-delete-btn" data-idx="' + idx + '">删除</button>' +
                '</td>';
            selectedTbody.appendChild(tr);
        });

        bindStepperEvents();
        bindBeauticianEvents();
        bindRowActionEvents();
        updateSummary();

        // 调用统一的状态管理函数控制模块显示/隐藏
        if (window.updateBenefitModules) {
            window.updateBenefitModules();
        }
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function buildStepperHtml(idx, qty, max) {
        return '' +
            '<div class="stepper" data-idx="' + idx + '">' +
                '<button class="stepper-btn stepper-minus">−</button>' +
                '<input type="number" class="stepper-input stepper-val" value="' + qty + '" min="1" max="' + max + '">' +
                '<button class="stepper-btn stepper-plus">+</button>' +
            '</div>';
    }

    function buildBeauticianSelectHtml(idx, val) {
        var options = ['请选择','周炜','李婷','王芳','陈静','张敏'];
        var html = '<select class="beautician-select beautician-sel" data-idx="' + idx + '">';
        options.forEach(function(opt) {
            var selected = opt === val ? ' selected' : '';
            html += '<option value="' + opt + '"' + selected + '>' + opt + '</option>';
        });
        html += '</select>';
        return html;
    }

    // ========== 步进器事件绑定 ==========
    function bindStepperEvents() {
        document.querySelectorAll('.stepper').forEach(function(container) {
            var minusBtn  = container.querySelector('.stepper-minus');
            var plusBtn   = container.querySelector('.stepper-plus');
            var input     = container.querySelector('.stepper-val');
            var idx       = parseInt(container.dataset.idx);
            var item      = selectedItems[idx];
            if (!item) return;

            var maxAttr = parseInt(String(input && input.max ? input.max : ''), 10);
            var max = Number.isFinite(maxAttr) && maxAttr > 0 ? maxAttr : (parseInt(item.maxQty, 10) || 1);

            function syncStepperState(v) {
                if (minusBtn && 'disabled' in minusBtn) minusBtn.disabled = !(v > 1);
                if (plusBtn && 'disabled' in plusBtn) plusBtn.disabled = !(v < max);
            }

            function setValue(next, showTip) {
                var v = parseInt(String(next || ''), 10);
                if (!Number.isFinite(v)) v = 1;
                if (v < 1) v = 1;
                if (v > max) {
                    v = max;
                    if (showTip) showToast('已达最大可用数量 (' + max + ')');
                }
                input.value = String(v);
                item.qty = v;
                updateSummary();
                syncStepperState(v);
            }

            setValue(input.value, false);

            if (minusBtn) {
                minusBtn.onclick = function() {
                    setValue((parseInt(input.value, 10) || 1) - 1, false);
                };
            }

            if (plusBtn) {
                plusBtn.onclick = function() {
                    var cur = parseInt(input.value, 10) || 1;
                    if (cur >= max) {
                        setValue(max, true);
                        return;
                    }
                    setValue(cur + 1, false);
                };
            }

            input.oninput = function() {
                var v = sanitizeIntString(input.value);
                input.value = v;
                setValue(parseInt(v || '0', 10) || 0, false);
            };

            input.onchange = function() {
                setValue(input.value, true);
            };
        });
    }

    // ========== 美容师选择事件 ==========
    function bindBeauticianEvents() {
        document.querySelectorAll('.beautician-sel').forEach(function(sel) {
            sel.addEventListener('change', function() {
                var idx = parseInt(this.dataset.idx);
                selectedItems[idx].beautician = this.value;
            });
        });
    }

    // ========== 行操作事件（复制/删除）==========
    function bindRowActionEvents() {
        document.querySelectorAll('.row-copy-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.dataset.idx);
                copyItem(idx);
            });
        });

        document.querySelectorAll('.row-delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.dataset.idx);
                deleteItem(idx);
            });
        });
    }

    // ========== 使用按钮：将权益项添加到已选项目 ==========
    document.querySelectorAll('.btn-use').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var itemId    = this.dataset.itemId;
            var name      = this.dataset.name;
            var source    = this.dataset.source;
            var maxQty    = parseInt(this.dataset.max) || 99;
            var remain    = remainTracker[itemId];

            if (!remain || remain <= 0) {
                showToast('该项目的剩余次数已用完');
                return;
            }

            // 新增到已选项目
            var newItem = {
                _id: ++itemIdCounter,
                sourceId: itemId,
                name: name,
                source: source,
                qty: Math.min(1, remain),     // 默认取1，不超过剩余
                maxQty: maxQty,
                beautician: '',
                originalMaxRemain: remain      // 用于还原判断
            };
            selectedItems.push(newItem);
            renderSelectedTable();
            showToast('已添加：「' + name + '」');

            // 更新进度条和文字（视觉上减少1）
            decreaseProgressByOne(itemId, remain - 1);
            remainTracker[itemId] = remain - 1;
        });
    });

    document.addEventListener('click', function(e) {
        var el = e.target;
        if (!(el instanceof Element)) return;

        var headerActionBtn = el.closest('.card-header-action-btn');
        if (headerActionBtn) {
            var action = headerActionBtn.dataset.action;
            var cardItem = headerActionBtn.closest('.card-item');
            var label = String(headerActionBtn.textContent || '').trim();

            if (action === 'upgrade') {
                handleCardAction(cardItem, 'upgrade');
            } else if (action === 'recharge') {
                handleCardAction(cardItem, 'recharge');
            } else if (action === 'exchange') {
                openExchangeDrawer(cardItem, 'card');
            } else {
                if (label) showToast(label + '功能开发中');
            }
            return;
        }

        var exchangeBtn = el.closest('.btn-exchange');
        if (exchangeBtn) {
            openExchangeDrawer(null, 'benefit');
        }
    });

    function handleCardAction(cardItem, action) {
        if (!cardItem) return;

        var cardName = cardItem.dataset.cardName || '';
        var cardTypeEl = cardItem.querySelector('.card-type');
        var cardType = cardTypeEl ? cardTypeEl.textContent.trim() : '';
        var cardNameEl = cardItem.querySelector('.card-name');
        var cardNameText = cardNameEl ? cardNameEl.textContent.trim() : cardName;

        var cardData = {
            id: 'CARD_' + Date.now(),
            type: cardType,
            name: cardNameText || cardName,
            action: action
        };

        if (cardType === '金额卡') {
            var balanceEl = cardItem.querySelector('.card-detail-value');
            if (balanceEl) {
                var balanceText = balanceEl.textContent.replace(/[^0-9.]/g, '');
                cardData.balance = balanceText || '0';
            }
            var giftEl = cardItem.querySelectorAll('.card-detail-value')[1];
            if (giftEl) {
                var giftText = giftEl.textContent.replace(/[^0-9.]/g, '');
                cardData.giftBalance = giftText || '0';
            }
        }

        var memberInfo = {
            name: '付小姐',
            phone: '131****7967',
            level: '会员',
            memberNo: 'M001',
            points: '888',
            walletBalance: '888.00',
            cardBalance: '5,500.00',
            debt: '2,228.00'
        };

        var storageData = {
            member: memberInfo,
            card: cardData,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('createOrderFromDetail', JSON.stringify(storageData));
        } catch (err) {
            console.warn('Failed to save to localStorage:', err);
        }

        window.location.href = 'create-order-pad.html';
    }

    // 减少进度条显示
    function decreaseProgressByOne(itemId, newRemain) {
        var useBtn = document.querySelector('.btn-use[data-item-id="' + itemId + '"]');
        if (!useBtn) return;

        var card = useBtn.closest('.service-item') || useBtn.closest('.product-item');
        if (!card) return;

        var progressFill = card.querySelector('.progress-fill');
        var progressText = card.querySelector('.progress-text');

        // 从按钮上获取总次数
        var total = parseInt(useBtn.dataset.max) || 1;
        var pct = total > 0 ? ((newRemain / total) * 100).toFixed(2) : 0;

        if (progressFill) progressFill.style.width = pct + '%';
        if (progressText) progressText.textContent = '剩余 ' + newRemain + ' / 共 ' + total;

        // 同步更新 dataset
        useBtn.dataset.remain = String(newRemain);
    }

    document.addEventListener('input', function(e) {
        var el = e.target;
        if (!el || !(el instanceof HTMLInputElement)) return;
        if (!(el.matches && (el.matches('input[data-field="discount"], .discount-input')))) return;
        handleDiscountInputConflict(el);
    });

    document.addEventListener('focusin', function(e) {
        var el = e.target;
        if (!el || !(el instanceof HTMLInputElement)) return;
        if (!(el.matches && (el.matches('input[data-field="finalPrice"], .final-price')))) return;
        el.dataset.lastValid = roundMoney2(parseMoneyText(el.value)).toFixed(2);
    }, true);

    document.addEventListener('blur', function(e) {
        var el = e.target;
        if (!el || !(el instanceof HTMLInputElement)) return;
        if (!(el.matches && (el.matches('input[data-field="finalPrice"], .final-price')))) return;
        handleFinalPriceInputConflict(el);
    }, true);

    // 还原进度条显示
    function increaseProgressByOne(itemId, newRemain) {
        var useBtn = document.querySelector('.btn-use[data-item-id="' + itemId + '"]');
        if (!useBtn) return;

        var card = useBtn.closest('.service-item') || useBtn.closest('.product-item');
        if (!card) return;

        var progressFill = card.querySelector('.progress-fill');
        var progressText = card.querySelector('.progress-text');

        var total = parseInt(useBtn.dataset.max) || 1;
        var pct = total > 0 ? ((newRemain / total) * 100).toFixed(2) : 0;

        if (progressFill) progressFill.style.width = pct + '%';
        if (progressText) progressText.textContent = '剩余 ' + newRemain + ' / 共 ' + total;
        useBtn.dataset.remain = String(newRemain);
    }

    // ========== 复制行 ==========
    function copyItem(idx) {
        var orig = selectedItems[idx];
        if (!orig) return;

        // 检查源权益是否还有足够剩余
        var currentRemain = remainTracker[orig.sourceId] || 0;
        if (currentRemain < 1) {
            showToast('该来源的剩余次数不足，无法继续复制');
            return;
        }

        var copied = {
            _id: ++itemIdCounter,
            sourceId: orig.sourceId,
            name: orig.name,
            source: orig.source,
            qty: Math.min(orig.qty, currentRemain),
            maxQty: orig.maxQty,
            beautician: orig.beautician
        };

        selectedItems.push(copied);

        // 扣减对应数量的剩余次数
        var usedQty = copied.qty;
        remainTracker[orig.sourceId] = currentRemain - usedQty;
        for (var i = 0; i < usedQty; i++) {
            decreaseProgressByOne(orig.sourceId, remainTracker[orig.sourceId] + usedQty - i - 1);
        }

        renderSelectedTable();
        showToast('已复制：「' + orig.name + '」');
    }

    // ========== 删除行（还原权益次数）==========
    function deleteItem(idx) {
        var item = selectedItems[idx];
        if (!item) return;

        var restoreQty = item.qty;

        // 还原剩余次数
        var currentRemain = remainTracker[item.sourceId] || 0;
        remainTracker[item.sourceId] = currentRemain + restoreQty;

        // 更新进度条显示
        increaseProgressByOne(item.sourceId, remainTracker[item.sourceId]);

        // 移除该项
        selectedItems.splice(idx, 1);
        renderSelectedTable();
        showToast('已删除，已还原 ' + restoreQty + ' 次权益');
    }

    // ========== 清空全部 ==========
    document.getElementById('clear-all-selected').addEventListener('click', function() {
        if (selectedItems.length === 0) {
            showToast('当前没有已选项目');
            return;
        }

        // 逐项还原
        for (var i = selectedItems.length - 1; i >= 0; i--) {
            var item = selectedItems[i];
            var currentRemain = remainTracker[item.sourceId] || 0;
            remainTracker[item.sourceId] = currentRemain + item.qty;
            increaseProgressByOne(item.sourceId, remainTracker[item.sourceId]);
        }

        selectedItems = [];
        renderSelectedTable();
        showToast('已清空所有已选项目');
    });

    // ========== 批量设置美容师 ==========
    document.getElementById('apply-beautician').addEventListener('click', function() {
        var batchSel = document.getElementById('batch-beautician');
        var val = batchSel.value;
        if (!val) {
            showToast('请先选择一位美容师');
            return;
        }
        if (selectedItems.length === 0) {
            showToast('暂无已选项目可应用');
            return;
        }
        selectedItems.forEach(function(item) { item.beautician = val; });
        renderSelectedTable();
        showToast('已为全部项目设置美容师：' + val);
    });

    // ========== 补单弹窗逻辑 ==========
    var supplementModal = document.getElementById('supplement-modal');

    document.getElementById('btn-supplement-time-bottom').addEventListener('click', function() {
        supplementModal.classList.add('show');
        // 默认值设为当前日期时间
        var now = new Date();
        document.getElementById('supplement-date').value = now.toISOString().slice(0,10);
        document.getElementById('supplement-time').value = now.toTimeString().slice(0,5);
    });

    window.closeSupplementModal = function() {
        supplementModal.classList.remove('show');
    };

    window.confirmSupplement = function() {
        var dateVal = document.getElementById('supplement-date').value;
        var timeVal = document.getElementById('supplement-time').value;

        if (!dateVal) {
            showToast('请选择日期');
            return;
        }

        supplementModal.classList.remove('show');

        // 格式化时间显示 yyyy-mm-dd hh:mm
        var displayTime = dateVal + ' ' + (timeVal ? timeVal : '00:00');

        // 在底部栏显示补单时间
        var timeDisplay = document.getElementById('supplement-time-display-bottom');
        timeDisplay.textContent = displayTime;
        timeDisplay.style.display = 'inline';

        showToast('补单时间已设置为 ' + displayTime);
    };

    window.openSupplementModal = function() {
        supplementModal.classList.add('show');
    };

    // 点击遮罩关闭
    supplementModal.addEventListener('click', function(e) {
        if (e.target === supplementModal) closeSupplementModal();
    });

    // ========== 确认服务按钮 ==========
    document.getElementById('btn-confirm-service').addEventListener('click', function() {
        if (selectedItems.length === 0) {
            showToast('请至少选择一个项目');
            return;
        }

        // 简易校验：检查每项的美容师
        var noBeautyList = [];
        selectedItems.forEach(function(item) {
            if (!item.beautician) noBeautyList.push(item.name);
        });

        if (noBeautyList.length > 0) {
            showToast('以下项目尚未选择美容师：' + noBeautyList.join('、'));
            return;
        }

        var remark = document.getElementById('order-remark').value.trim();

        showToast('服务确认成功！');
    });

    // ========== 权益搜索功能 ==========
    var padSearchInput = document.getElementById('pad-benefit-search');
    var padSearchClear = document.getElementById('pad-search-clear');

    padSearchInput.addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase().trim();
        padSearchClear.style.display = term ? 'block' : 'none';

        document.querySelectorAll('.benefit-card').forEach(function(card) {
            var cardName = (card.dataset.cardName || '').toLowerCase();
            var names = [];
            card.querySelectorAll('.item-name').forEach(function(el) { names.push(el.textContent.toLowerCase()); });

            var match = cardName.includes(term);
            if (!match) {
                for (var i = 0; i < names.length; i++) {
                    if (names[i].includes(term)) { match = true; break; }
                }
            }
            card.style.display = match ? '' : 'none';
        });
    });

    padSearchClear.addEventListener('click', function() {
        padSearchInput.value = '';
        padSearchClear.style.display = 'none';
        document.querySelectorAll('.benefit-card').forEach(function(card) {
            card.style.display = '';
        });
    });

    // ========== TAB切换功能（带状态保持） ==========
    (function() {
        var tabNavItems = document.querySelectorAll('.tab-nav-item');
        var tabContents = document.querySelectorAll('.tab-content');
        var benefitsContent = document.getElementById('tab-benefits');
        var selectedSection = document.getElementById('selected-section');
        var orderSection = document.getElementById('order-section');
        var bottomBar = document.querySelector('.bottom-bar');

        // 保存当前活动标签
        var currentTab = 'benefits';

        // 控制权益相关模块的显示/隐藏
        function updateBenefitModules() {
            var isBenefitsTab = (currentTab === 'benefits');
            var hasSelectedItems = (typeof selectedItems !== 'undefined' && selectedItems.length > 0);

            if (isBenefitsTab && hasSelectedItems) {
                // 在客户权益TAB且有选中项时，显示已选项目和底部汇总
                if (selectedSection) selectedSection.classList.add('show');
                if (bottomBar) bottomBar.classList.add('show');
                // 有选中项时才显示订单信息
                if (orderSection) orderSection.classList.add('show');
            } else {
                // 非客户权益TAB 或 无选中项时，隐藏所有权益相关模块
                if (selectedSection) selectedSection.classList.remove('show');
                if (orderSection) orderSection.classList.remove('show');
                if (bottomBar) bottomBar.classList.remove('show');
            }
        }

        // 切换标签
        function switchTab(tabId) {
            // 移除所有active
            tabNavItems.forEach(function(item) { item.classList.remove('active'); });
            tabContents.forEach(function(content) { content.classList.remove('active'); });

            // 激活目标标签
            var targetNav = document.querySelector('[data-tab="' + tabId + '"]');
            var targetContent = document.getElementById('tab-' + tabId);
            if (targetNav) targetNav.classList.add('active');
            if (targetContent) targetContent.classList.add('active');

            currentTab = tabId;
            updateBenefitModules();
        }

        // 绑定点击事件
        tabNavItems.forEach(function(item) {
            item.addEventListener('click', function() {
                var tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // 暴露update函数供其他模块调用（如选择/取消选择项目时）
        window.updateBenefitModules = updateBenefitModules;
    })();

    // ========== 返回顶部按钮 ==========
    var backToTopBtn = document.getElementById('back-to-top');
    var mainContent = document.querySelector('.main-content-area');

    // 点击返回顶部
    backToTopBtn.addEventListener('click', function() {
        mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ========== 会员更多信息功能 ==========
        // 数据模型
        var memberData = {
            tags: ['老顾客', '敏感肌', 'VIP顾客'],
            basic: {
                name: '付小姐',
                phone: '131****7967',
                channel: '自然到店',
                beautician: '周炜',
                marriage: '已婚',
                birthday: '1990-10-20',
                occupation: '企业职员',
                address: '北京市朝阳区建国路88号SOHO现代城1号楼1001室'
            },
            skin: ['敏感肌', '干性皮肤'],
            habit: ['每天洁面', '使用爽肤水', '使用乳液/面霜'],
            demand: ['补水保湿', '抗衰紧致'],
            past: ['李婷'],
            note: '顾客皮肤比较敏感，推荐使用温和的产品。\n曾多次补水护理，效果较好。'
        };

        // 备份数据（用于取消编辑）
        var backupData = null;

        // 当前编辑的模块
        var activeEditModules = {
            tags: false,
            basic: false,
            extra: false
        };

        // DOM元素
        var memberOverlay = document.getElementById('memberInfoOverlay');
        var tagsContainer = document.getElementById('memberTagsContainer');
        var tagAddContainer = document.getElementById('tagAddContainer');
        var presetTagsContainer = document.getElementById('presetTagsContainer');
        var basicInfoContainer = document.getElementById('basicInfoContainer');
        var tagsEditBtn = document.getElementById('tagsEditBtn');
        var basicEditBtn = document.getElementById('basicEditBtn');
        var extraEditBtn = document.getElementById('extraEditBtn');

        // 初始化 - 尝试从本地存储加载数据
        function initMemberData() {
            var savedData = localStorage.getItem('memberMoreInfo');
            if (savedData) {
                try {
                    memberData = JSON.parse(savedData);
                } catch(e) {
                    console.warn('Failed to load saved member data');
                }
            }
        }
        initMemberData();

        // 渲染标签
        function renderTags() {
            tagsContainer.innerHTML = memberData.tags.map(function(tag, index) {
                return '<div class="tag-item">' +
                    '<span>' + tag + '</span>' +
                    (activeEditModules.tags ? 
                    '<span class="tag-remove" onclick="removeMemberTag(' + index + ')">' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E87C9A" stroke-width="2">' +
                    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
                    '</svg></span>' : '') +
                    '</div>';
            }).join('');
        }

        // 渲染基础信息
        function renderBasicInfo() {
            var container = basicInfoContainer;
            var fields = ['name', 'phone', 'channel', 'beautician', 'marriage', 'birthday', 'occupation', 'address'];
            var labels = ['顾客姓名', '手机号码', '进店渠道', '责任美容师', '婚姻状况', '会员生日', '职业', '家庭地址'];
            
            var html = '';
            fields.forEach(function(field, index) {
                var isFullWidth = (field === 'address');
                var value = memberData.basic[field];
                var label = labels[index];
                
                if (activeEditModules.basic) {
                    if (field === 'phone') {
                        html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                            '<label class="info-label">' + label + '</label>' +
                            '<input type="tel" class="info-input" data-field="' + field + '" value="' + value + '" placeholder="请输入手机号码" pattern="[0-9]{11}">' +
                            '</div>';
                    } else if (field === 'birthday') {
                        html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                            '<label class="info-label">' + label + '</label>' +
                            '<input type="date" class="info-input" data-field="' + field + '" value="' + value + '">' +
                            '</div>';
                    } else if (field === 'marriage') {
                        html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                            '<label class="info-label">' + label + '</label>' +
                            '<select class="info-select" data-field="' + field + '">' +
                            '<option value="未婚"' + (value === '未婚' ? ' selected' : '') + '>未婚</option>' +
                            '<option value="已婚"' + (value === '已婚' ? ' selected' : '') + '>已婚</option>' +
                            '<option value="保密"' + (value === '保密' ? ' selected' : '') + '>保密</option>' +
                            '</select>' +
                            '</div>';
                    } else if (field === 'address') {
                        html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                            '<label class="info-label">' + label + '</label>' +
                            '<textarea class="info-textarea" data-field="' + field + '" placeholder="请输入家庭地址">' + value + '</textarea>' +
                            '</div>';
                    } else {
                        html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                            '<label class="info-label">' + label + '</label>' +
                            '<input type="text" class="info-input" data-field="' + field + '" value="' + value + '" placeholder="请输入' + label + '">' +
                            '</div>';
                    }
                } else {
                    html += '<div class="info-item' + (isFullWidth ? ' full-width' : '') + '">' +
                        '<label class="info-label">' + label + '</label>' +
                        '<div class="info-value" data-field="' + field + '"' + (isFullWidth ? ' style="white-space: pre-wrap;"' : '') + '>' + value + '</div>' +
                        '</div>';
                }
            });
            container.innerHTML = html;
        }

        // 渲染复选框组
        function renderCheckboxes() {
            var groups = ['skin', 'habit', 'demand', 'past'];
            var groupIds = ['skinCheckboxes', 'habitCheckboxes', 'demandCheckboxes', 'pastBeauticians'];
            
            groups.forEach(function(group, gIndex) {
                var container = document.getElementById(groupIds[gIndex]);
                var checkboxes = container.querySelectorAll('.checkbox-item');
                
                checkboxes.forEach(function(item) {
                    var input = item.querySelector('input');
                    var isChecked = memberData[group].indexOf(input.value) > -1;
                    input.checked = isChecked;
                    item.classList.toggle('checked', isChecked);
                    
                    if (activeEditModules.extra) {
                        item.style.cursor = 'pointer';
                    }
                });
            });
        }

        // 渲染补充说明
        function renderNote() {
            var noteContainer = document.querySelector('[data-field="note"]');
            if (activeEditModules.extra) {
                noteContainer.outerHTML = '<textarea class="info-textarea" data-field="note" placeholder="请输入补充说明">' + memberData.note + '</textarea>';
            } else {
                noteContainer.outerHTML = '<div class="info-value" data-field="note" style="white-space: pre-wrap;">' + memberData.note + '</div>';
            }
        }

        // 打开会员更多信息弹窗
        window.openMemberMoreInfo = function() {
            backupData = JSON.parse(JSON.stringify(memberData)); // 深拷贝备份
            
            // 重置编辑状态
            activeEditModules = { tags: false, basic: false, extra: false };
            tagsEditBtn.classList.remove('active');
            basicEditBtn.classList.remove('active');
            extraEditBtn.classList.remove('active');
            
            renderTags();
            renderBasicInfo();
            renderCheckboxes();
            
            tagAddContainer.style.display = 'none';
            presetTagsContainer.style.display = 'none';
            
            memberOverlay.classList.add('show');
        };

        // 关闭会员更多信息弹窗
        window.closeMemberMoreInfo = function() {
            memberOverlay.classList.remove('show');
        };
        

        // ===== 置换权益侧边抽屉相关函数 =====
        var exchangeOverlay = document.getElementById('exchangeOverlay');
        var exchangeDrawer = document.querySelector('.exchange-drawer');
        var exchangeSource = ''; // 置换来源：'card' 卡项置换, 'benefit' 权益列表置换
        var currentExchangeCardItem = null; // 当前置换操作对应的卡项DOM
        
        // 打开置换权益抽屉
        // source: 'card' 从卡项置换按钮打开, 'benefit' 从权益列表置换按钮打开
        window.openExchangeDrawer = function(cardItem, source) {
            exchangeSource = source || 'card';
            currentExchangeCardItem = cardItem || null;
            
            // 动态修改"卡内权益"标题
            var cardBenefitTitle = document.querySelector('.exchange-card-benefit-title');
            if (cardBenefitTitle) {
                if (exchangeSource === 'card') {
                    cardBenefitTitle.textContent = '卡内剩余权益';
                } else {
                    cardBenefitTitle.textContent = '剩余权益';
                }
            }
            
            // 重置卡内权益表格为空状态
            resetCardBenefitTable();

            if (exchangeOverlay) {
                exchangeOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        };
        
        // 重置卡内权益表格到空状态
        function resetCardBenefitTable() {
            var tbody = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-table tbody');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="6" class="exchange-empty">暂无权益数据</td></tr>';
            updateExchangeSummary();
        }

        // 获取置换来源
        window.getExchangeSource = function() {
            return exchangeSource;
        };
        
        // 关闭置换权益抽屉
        window.closeExchangeDrawer = function() {
            if (exchangeOverlay) {
                exchangeOverlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        };
        
        // ===== 权益选择弹窗 =====
        
        // 选择卡内权益 — 打开权益选择弹窗
        window.selectCardBenefit = function() {
            if (exchangeSource === 'card' && currentExchangeCardItem) {
                openBenefitSelectModal(currentExchangeCardItem);
            } else if (exchangeSource === 'benefit') {
                // 从无卡片权益列表打开
                var benefitList = document.querySelector('.benefits-list-section');
                if (benefitList) {
                    openBenefitSelectModal(benefitList);
                } else {
                    showToast('暂无权益数据');
                }
            } else {
                showToast('暂无权益数据');
            }
        };

        // 打开权益选择弹窗
        window.openBenefitSelectModal = function(container) {
            var btnUses = container.querySelectorAll('.btn-use');
            var tbody = document.getElementById('benefit-select-tbody');
            var title = document.getElementById('benefit-select-title');
            if (!tbody) return;

            // 设置标题
            var cardName = '';
            if (exchangeSource === 'card' && currentExchangeCardItem) {
                cardName = currentExchangeCardItem.getAttribute('data-card-name') || '';
            }
            if (title) {
                title.textContent = cardName ? '选择卡内权益 — ' + cardName : '选择权益';
            }

            // 生成表格行
            var rows = '';
            if (btnUses.length === 0) {
                rows = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#999;">该卡项暂无权益数据</td></tr>';
            } else {
                btnUses.forEach(function(btn, idx) {
                    var name = btn.getAttribute('data-name') || '';
                    var spec = btn.getAttribute('data-spec') || '-';
                    var remain = btn.getAttribute('data-remain') || '0';
                    var price = btn.getAttribute('data-price') || '0.00';
                    var itemId = btn.getAttribute('data-item-id') || '';

                    rows += '<tr data-benefit-index="' + idx + '" onclick="toggleBenefitRow(this)" data-item-id="' + itemId + '">';
                    rows += '<td><input type="checkbox" class="benefit-select-checkbox" onclick="event.stopPropagation();toggleBenefitRow(this.closest(\'tr\'))" data-item-id="' + itemId + '"></td>';
                    rows += '<td>' + escapeHtml(name) + '</td>';
                    rows += '<td>' + escapeHtml(spec) + '</td>';
                    rows += '<td>' + escapeHtml(remain) + '</td>';
                    rows += '<td>¥' + Number(price).toFixed(2) + '</td>';
                    rows += '</tr>';
                });
            }
            tbody.innerHTML = rows;

            // 显示弹窗
            var modal = document.getElementById('benefit-select-modal');
            if (modal) {
                modal.classList.add('show');
            }
            updateBenefitSelectSummary();
        };

        // HTML 转义
        function escapeHtml(str) {
            var div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // 切换行选中状态
        window.toggleBenefitRow = function(tr) {
            var checkbox = tr.querySelector('.benefit-select-checkbox');
            // 点击行时手动切换checkbox；点击checkbox时浏览器已切换，无需再反转
            if (checkbox && !event.target.closest('.benefit-select-checkbox')) {
                checkbox.checked = !checkbox.checked;
            }
            if (checkbox && checkbox.checked) {
                tr.classList.add('selected');
            } else {
                tr.classList.remove('selected');
            }
            updateBenefitSelectSummary();
        };

        // 更新已选计数
        function updateBenefitSelectSummary() {
            var checked = document.querySelectorAll('#benefit-select-tbody .benefit-select-checkbox:checked');
            var countEl = document.getElementById('benefit-select-count');
            var confirmBtn = document.getElementById('benefit-select-confirm');
            if (countEl) countEl.textContent = checked.length;
            if (confirmBtn) confirmBtn.disabled = checked.length === 0;
        }

        // 关闭权益选择弹窗
        window.closeBenefitSelectModal = function() {
            var modal = document.getElementById('benefit-select-modal');
            if (modal) {
                modal.classList.remove('show');
            }
        };

        // 确认选择 — 回填到置换权益抽屉的"卡内剩余权益"表格
        window.confirmBenefitSelection = function() {
            var checkedRows = document.querySelectorAll('#benefit-select-tbody tr.selected');
            var tbody = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-table tbody');
            if (!tbody) return;

            if (checkedRows.length === 0) {
                closeBenefitSelectModal();
                return;
            }

            var rows = '';
            checkedRows.forEach(function(tr, idx) {
                var checkbox = tr.querySelector('.benefit-select-checkbox');
                var itemId = checkbox ? checkbox.getAttribute('data-item-id') : '';
                var cells = tr.querySelectorAll('td');
                var name = cells[1] ? cells[1].textContent : '';
                var spec = cells[2] ? cells[2].textContent : '-';
                var remain = cells[3] ? cells[3].textContent : '0';
                var price = cells[4] ? cells[4].textContent.replace('¥', '') : '0.00';

                rows += '<tr class="item-row" data-item-id="' + escapeHtml(itemId) + '">';
                rows += '<td>' + escapeHtml(name) + '</td>';
                rows += '<td>' + escapeHtml(spec) + '</td>';
                rows += '<td>' + escapeHtml(remain) + '</td>';
                var remainNum = parseInt(remain) || 0;
                var maxCount = remainNum > 0 ? remainNum : 1;
                rows += '<td>'
                    + '<div class="exchange-stepper" data-min="1" data-max="' + maxCount + '" data-value="1">'
                    + '<button class="exchange-stepper-btn exchange-stepper-minus" aria-label="减少" disabled>−</button>'
                    + '<span class="exchange-stepper-value">1</span>'
                    + '<button class="exchange-stepper-btn exchange-stepper-plus" aria-label="增加"' + (maxCount <= 1 ? ' disabled' : '') + '>+</button>'
                    + '</div>'
                    + '</td>';
                rows += '<td>' + price + '</td>';
                rows += '<td><button class="exchange-btn exchange-btn-secondary" onclick="removeCardBenefitRow(this)" style="padding:4px 8px;font-size:12px;">删除</button></td>';
                rows += '</tr>';
            });
            tbody.innerHTML = rows;

            closeBenefitSelectModal();
            updateExchangeSummary();
        };

        // 删除卡内权益表格行
        window.removeCardBenefitRow = function(btn) {
            var tr = btn.closest('tr');
            if (tr) tr.remove();
            var tbody = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-table tbody');
            if (tbody && tbody.querySelectorAll('tr').length === 0) {
                resetCardBenefitTable();
            }
            updateExchangeSummary();
        };

        // 更新卡内权益合计
        window.updateExchangeSummary = function() {
            var tbody = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-table tbody');
            var summaryValue = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-summary-value');
            if (!summaryValue) return;
            var total = 0;
            if (tbody) {
                tbody.querySelectorAll('tr.item-row').forEach(function(tr) {
                    var priceCell = tr.querySelectorAll('td')[4];
                    var stepperValue = tr.querySelector('.exchange-stepper-value');
                    if (priceCell && stepperValue) {
                        var price = parseFloat(priceCell.textContent.replace('¥', '')) || 0;
                        var count = parseInt(stepperValue.textContent) || 0;
                        total += price * count;
                    }
                });
            }
            summaryValue.textContent = '¥' + total.toFixed(2);
            _updatePendingAmount();
        };

        // 更新待收款金额（置换合计 - 卡内合计，最小为0）
        function _updatePendingAmount() {
            var pendingEl = document.getElementById('exchangePendingAmount');
            if (!pendingEl) return;
            var exchangeSummary = document.getElementById('exchangeSummaryValue');
            var cardSummary = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-summary-value');
            var exchangeTotal = exchangeSummary ? (parseFloat(exchangeSummary.textContent.replace('¥', '')) || 0) : 0;
            var cardTotal = cardSummary ? (parseFloat(cardSummary.textContent.replace('¥', '')) || 0) : 0;
            var pending = exchangeTotal - cardTotal;
            if (pending < 0) pending = 0;
            pendingEl.textContent = '¥' + pending.toFixed(2);
            _updateExchangeConfirmButton();
        }

        // 更新置换权益确定按钮状态：卡内剩余权益 + 置换权益 均存在数据时启用
        function _updateExchangeConfirmButton() {
            var confirmBtn = document.querySelector('#exchangeOverlay .exchange-footer-btn-confirm');
            if (!confirmBtn) return;

            // 检查卡内权益是否有数据行
            var cardTbody = document.querySelector('#exchangeOverlay .exchange-section:first-of-type .exchange-table tbody');
            var hasCardData = false;
            if (cardTbody) {
                hasCardData = cardTbody.querySelectorAll('tr.item-row').length > 0;
            }

            // 检查置换权益是否有数据
            var hasExchangeData = _exchangeBenefits && _exchangeBenefits.length > 0;

            confirmBtn.disabled = !(hasCardData && hasExchangeData);
        }
        
        // ===== 置换权益数据 =====
        // type: 'care' = 单次护理, 'product' = 居家产品
        var _exchangeBenefits = [];
        var _exchangeBenefitSeq = 0;

        function _renderExchangeTable() {
            var tbody = document.getElementById('exchangeBenefitTableBody');
            var emptyRow = document.getElementById('exchangeBenefitEmpty');
            var summaryVal = document.getElementById('exchangeSummaryValue');
            if (!tbody) return;

            if (_exchangeBenefits.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="exchange-empty" id="exchangeBenefitEmpty">暂无权益数据</td></tr>';
                if (summaryVal) summaryVal.textContent = '¥0.00';
                _updatePendingAmount();
                return;
            }

            var total = 0;
            tbody.innerHTML = _exchangeBenefits.map(function(item, idx) {
                var subtotal = item.manualSubtotal != null ? item.manualSubtotal : item.price * item.qty;
                if (!item.isGift) total += subtotal;
                var giftBadge = item.isGift ? '<span class="benefit-item-gift">赠</span>' : '';
                return '<tr data-exchange-index="' + idx + '">'
                    + '<td class="col-benefit-name">' + giftBadge + '<span class="benefit-name-text">' + item.name + '</span></td>'
                    + '<td>' + (item.spec || '-') + '</td>'
                    + '<td class="col-price">¥' + item.price.toFixed(2) + '</td>'
                    + '<td><div class="exchange-stepper">'
                    + '<button type="button" class="exchange-stepper-btn exchange-stepper-minus" data-idx="' + idx + '">−</button>'
                    + '<span class="exchange-stepper-value">' + item.qty + '</span>'
                    + '<button type="button" class="exchange-stepper-btn exchange-stepper-plus" data-idx="' + idx + '">+</button>'
                    + '</div></td>'
                    + '<td class="col-subtotal"><input type="text" class="exchange-subtotal-input" data-idx="' + idx + '" value="' + subtotal.toFixed(2) + '" data-numkeypad-title="小计金额" readonly inputmode="none"></td>'
                    + '<td class="col-actions">'
                    + '<button class="exchange-action-btn gift-set' + (item.isGift ? ' is-gift' : '') + '" data-idx="' + idx + '">'
                    + (item.isGift ? '取消赠送' : '设为赠送')
                    + '</button>'
                    + '<button class="exchange-action-btn delete-btn" data-idx="' + idx + '">删除</button>'
                    + '</td></tr>';
            }).join('');

            if (summaryVal) summaryVal.textContent = '¥' + total.toFixed(2);
            _updatePendingAmount();

            // 绑定步进器事件
            tbody.querySelectorAll('.exchange-stepper-minus').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-idx'));
                    var item = _exchangeBenefits[idx];
                    if (item.qty > 1) { item.qty--; item.manualSubtotal = null; }
                    _renderExchangeTable();
                });
            });
            tbody.querySelectorAll('.exchange-stepper-plus').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-idx'));
                    var item = _exchangeBenefits[idx];
                    if (item.qty < 999) { item.qty++; item.manualSubtotal = null; }
                    _renderExchangeTable();
                });
            });
            // 绑定小计输入框 — 点击打开数字键盘
            tbody.querySelectorAll('.exchange-subtotal-input').forEach(function(inp) {
                inp.addEventListener('click', function() {
                    _openExchangeNumpad(this);
                });
            });
            // 绑定操作按钮事件
            tbody.querySelectorAll('.exchange-action-btn.gift-set').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-idx'));
                    _exchangeBenefits[idx].isGift = !_exchangeBenefits[idx].isGift;
                    _renderExchangeTable();
                });
            });
            tbody.querySelectorAll('.exchange-action-btn.delete-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-idx'));
                    _exchangeBenefits.splice(idx, 1);
                    _renderExchangeTable();
                });
            });
        }

        function _addToExchangeBenefits(items, type) {
            items.forEach(function(item) {
                _exchangeBenefits.push({
                    seq: ++_exchangeBenefitSeq,
                    name: item.name,
                    spec: item.spec || '-',
                    price: item.price,
                    qty: 1,
                    type: type,
                    isGift: false
                });
            });
            _renderExchangeTable();
        }

        // ===== 添加单次护理弹窗 =====
        var _serviceProducts = [
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
            { id: 15, name: '胸部护理', category: 'special', spec: '胸部保养', price: 268 }
        ];
        var _selectedServices = [];
        var _serviceRecentSearches = JSON.parse(localStorage.getItem('addServiceRecentSearches') || '[]');

        var _addServiceOverlay = document.getElementById('addServiceModalOverlay');
        var _addServiceSearchInput = document.getElementById('addServiceSearchInput');
        var _addServiceRecentList = document.getElementById('addServiceRecentList');
        var _addServiceSelectedList = document.getElementById('addServiceSelectedList');
        var _addServiceProductsGrid = document.getElementById('addServiceProductsGrid');

        function _renderRecentSearches() {
            var maxRecent = 8;
            var recentItems = _serviceRecentSearches.slice(0, maxRecent);
            if (!_addServiceRecentList) return;
            if (recentItems.length === 0) {
                _addServiceRecentList.innerHTML = '<span style="color:#94A3B8;font-size:12px;">暂无搜索记录</span>';
                return;
            }
            _addServiceRecentList.innerHTML = recentItems.map(function(k) {
                return '<span class="add-service-recent-item" data-keyword="' + k + '">' + k + '</span>';
            }).join('');
        }

        function _renderServiceProducts(category, keyword) {
            if (!_addServiceProductsGrid) return;
            category = category || 'all';
            keyword = keyword || '';
            var filtered = _serviceProducts.filter(function(p) {
                if (category !== 'all' && p.category !== category) return false;
                if (keyword && p.name.indexOf(keyword) === -1) return false;
                return true;
            });
            _addServiceProductsGrid.innerHTML = filtered.map(function(product) {
                var isSelected = _selectedServices.some(function(s) { return s.id === product.id; });
                return '<div class="add-service-product-card' + (isSelected ? ' selected' : '') + '" data-id="' + product.id + '">'
                    + '<div class="add-service-product-image"><span>护理项目</span></div>'
                    + '<div class="add-service-product-info">'
                    + '<div class="add-service-product-name">' + product.name + '</div>'
                    + '<div class="add-service-product-spec">' + (product.spec || '') + '</div>'
                    + '<div class="add-service-product-price">¥' + product.price + '</div>'
                    + '</div></div>';
            }).join('');
        }

        function _renderServiceSelectedList() {
            if (!_addServiceSelectedList) return;
            if (_selectedServices.length === 0) {
                _addServiceSelectedList.innerHTML = '<div class="add-service-empty-hint">点击商品名称添加商品</div>';
                return;
            }
            _addServiceSelectedList.innerHTML = _selectedServices.map(function(s) {
                return '<div class="add-service-selected-item"><span>' + s.name + '</span><span class="remove-btn" data-remove-id="' + s.id + '">×</span></div>';
            }).join('');
        }

        function _toggleServiceSelection(productId) {
            var product = _serviceProducts.find(function(p) { return p.id === productId; });
            if (!product) return;
            var idx = _selectedServices.findIndex(function(s) { return s.id === productId; });
            if (idx > -1) {
                _selectedServices.splice(idx, 1);
            } else {
                _selectedServices.push({ id: product.id, name: product.name, spec: product.spec, price: product.price });
            }
            _renderServiceSelectedList();
            var card = _addServiceProductsGrid && _addServiceProductsGrid.querySelector('.add-service-product-card[data-id="' + productId + '"]');
            if (card) card.classList.toggle('selected');
        }

        window.selectSingleCare = function() {
            if (!_addServiceOverlay) return;
            _addServiceOverlay.classList.add('show');
            _renderRecentSearches();
            _renderServiceProducts('all');
            _selectedServices = [];
            _renderServiceSelectedList();
        };

        // 单次护理弹窗事件绑定
        (function() {
            var closeBtn = document.getElementById('addServiceModalClose');
            var clearBtn = document.getElementById('addServiceClearBtn');
            var confirmBtn = document.getElementById('addServiceConfirmBtn');
            if (closeBtn) closeBtn.addEventListener('click', function() { _addServiceOverlay.classList.remove('show'); });
            if (_addServiceOverlay) _addServiceOverlay.addEventListener('click', function(e) { if (e.target === _addServiceOverlay) _addServiceOverlay.classList.remove('show'); });
            if (_addServiceSearchInput) {
                _addServiceSearchInput.addEventListener('input', function() {
                    var kw = this.value.trim();
                    if (kw) {
                        _serviceRecentSearches = _serviceRecentSearches.filter(function(k) { return k !== kw; });
                        _serviceRecentSearches.unshift(kw);
                        _serviceRecentSearches = _serviceRecentSearches.slice(0, 8);
                        localStorage.setItem('addServiceRecentSearches', JSON.stringify(_serviceRecentSearches));
                        _renderRecentSearches();
                    }
                    _renderServiceProducts('all', kw);
                });
            }
            if (_addServiceRecentList) {
                _addServiceRecentList.addEventListener('click', function(e) {
                    var item = e.target.closest('.add-service-recent-item');
                    if (item && _addServiceSearchInput) {
                        var kw = item.getAttribute('data-keyword') || '';
                        _addServiceSearchInput.value = kw;
                        _renderServiceProducts('all', kw);
                    }
                });
            }
            document.querySelectorAll('#addServiceModalOverlay .add-service-category-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    document.querySelectorAll('#addServiceModalOverlay .add-service-category-item').forEach(function(i) { i.classList.remove('active'); });
                    this.classList.add('active');
                    _renderServiceProducts(this.getAttribute('data-category'), _addServiceSearchInput ? _addServiceSearchInput.value : '');
                });
            });
            if (_addServiceProductsGrid) {
                _addServiceProductsGrid.addEventListener('click', function(e) {
                    var card = e.target.closest('.add-service-product-card');
                    if (card) {
                        var id = parseInt(card.getAttribute('data-id'));
                        if (id) _toggleServiceSelection(id);
                    }
                });
            }
            if (_addServiceSelectedList) {
                _addServiceSelectedList.addEventListener('click', function(e) {
                    var btn = e.target.closest('.remove-btn');
                    if (btn) {
                        var id = parseInt(btn.getAttribute('data-remove-id'));
                        if (id) _toggleServiceSelection(id);
                    }
                });
            }
            if (clearBtn) clearBtn.addEventListener('click', function() {
                _selectedServices = [];
                _renderServiceSelectedList();
                document.querySelectorAll('#addServiceModalOverlay .add-service-product-card.selected').forEach(function(c) { c.classList.remove('selected'); });
            });
            if (confirmBtn) confirmBtn.addEventListener('click', function() {
                if (_selectedServices.length === 0) { showToast('请至少选择一个护理项目'); return; }
                _addToExchangeBenefits(_selectedServices, 'care');
                showToast('已添加 ' + _selectedServices.length + ' 个护理项目到置换权益');
                _selectedServices = [];
                _renderServiceSelectedList();
                _addServiceOverlay.classList.remove('show');
            });
        })();

        // ===== 添加居家产品弹窗 =====
        var _productItems = [
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
            { id: 115, name: '皙之密护肤套装', category: '套装', spec: '5件套', stock: 8, price: 1288, unit: '套' }
        ];
        var _selectedProducts = [];
        var _productRecentSearches = JSON.parse(localStorage.getItem('addProductRecentSearches') || '[]');
        var _productSortField = '';
        var _productSortOrder = '';
        var _productCurrentCategory = 'all';

        var _addProductOverlay = document.getElementById('addProductModalOverlay');
        var _addProductSearchInput = document.getElementById('addProductSearchInput');
        var _addProductRecentList = document.getElementById('addProductRecentList');
        var _addProductSelectedList = document.getElementById('addProductSelectedList');
        var _addProductTableBody = document.getElementById('addProductTableBody');

        function _renderProductRecentSearches() {
            var recentItems = _productRecentSearches.slice(0, 8);
            if (!_addProductRecentList) return;
            if (recentItems.length === 0) {
                _addProductRecentList.innerHTML = '<span style="color:#94A3B8;font-size:12px;">暂无搜索记录</span>';
                return;
            }
            _addProductRecentList.innerHTML = recentItems.map(function(k) {
                return '<span class="add-service-recent-item" data-keyword="' + k + '">' + k + '</span>';
            }).join('');
        }

        function _renderProductTable() {
            if (!_addProductTableBody) return;
            var filtered = _productItems.slice();
            if (_productCurrentCategory !== 'all') {
                filtered = filtered.filter(function(p) { return p.category === _productCurrentCategory; });
            }
            var keyword = _addProductSearchInput ? _addProductSearchInput.value.trim() : '';
            if (keyword) {
                filtered = filtered.filter(function(p) { return p.name.indexOf(keyword) !== -1; });
            }
            if (_productSortField) {
                filtered.sort(function(a, b) {
                    var va = a[_productSortField], vb = b[_productSortField];
                    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
                    return _productSortOrder === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
                });
            }
            _addProductTableBody.innerHTML = filtered.map(function(product) {
                var isSelected = _selectedProducts.some(function(s) { return s.id === product.id; });
                return '<tr class="' + (isSelected ? 'selected' : '') + '" data-id="' + product.id + '">'
                    + '<td class="col-name">' + product.name + '</td>'
                    + '<td>' + product.spec + '</td>'
                    + '<td class="col-stock">' + product.stock + '</td>'
                    + '<td class="col-price">¥' + product.price + '</td>'
                    + '<td>' + product.unit + '</td>'
                    + '<td><button class="select-btn">选择</button></td></tr>';
            }).join('');
        }

        function _renderProductSelectedList() {
            if (!_addProductSelectedList) return;
            if (_selectedProducts.length === 0) {
                _addProductSelectedList.innerHTML = '<div class="add-service-empty-hint">点击商品名称添加商品</div>';
                return;
            }
            _addProductSelectedList.innerHTML = _selectedProducts.map(function(p) {
                return '<div class="add-service-selected-item"><span>' + p.name + '</span><span class="remove-btn" data-remove-id="' + p.id + '">×</span></div>';
            }).join('');
        }

        function _toggleProductSelection(productId) {
            var product = _productItems.find(function(p) { return p.id === productId; });
            if (!product) return;
            var idx = _selectedProducts.findIndex(function(s) { return s.id === productId; });
            if (idx > -1) {
                _selectedProducts.splice(idx, 1);
            } else {
                _selectedProducts.push({ id: product.id, name: product.name, spec: product.spec, price: product.price, unit: product.unit });
            }
            _renderProductSelectedList();
            var row = _addProductTableBody && _addProductTableBody.querySelector('tr[data-id="' + productId + '"]');
            if (row) row.classList.toggle('selected');
        }

        window.selectHomeProduct = function() {
            if (!_addProductOverlay) return;
            _addProductOverlay.classList.add('show');
            _renderProductRecentSearches();
            _selectedProducts = [];
            _productCurrentCategory = 'all';
            _renderProductSelectedList();
            _renderProductTable();
        };

        // 居家产品弹窗事件绑定
        (function() {
            var closeBtn = document.getElementById('addProductModalClose');
            var clearBtn = document.getElementById('addProductClearBtn');
            var confirmBtn = document.getElementById('addProductConfirmBtn');
            if (closeBtn) closeBtn.addEventListener('click', function() { _addProductOverlay.classList.remove('show'); });
            if (_addProductOverlay) _addProductOverlay.addEventListener('click', function(e) { if (e.target === _addProductOverlay) _addProductOverlay.classList.remove('show'); });
            if (_addProductSearchInput) {
                _addProductSearchInput.addEventListener('input', function() {
                    var kw = this.value.trim();
                    if (kw) {
                        _productRecentSearches = _productRecentSearches.filter(function(k) { return k !== kw; });
                        _productRecentSearches.unshift(kw);
                        _productRecentSearches = _productRecentSearches.slice(0, 8);
                        localStorage.setItem('addProductRecentSearches', JSON.stringify(_productRecentSearches));
                        _renderProductRecentSearches();
                    }
                    _renderProductTable();
                });
            }
            if (_addProductRecentList) {
                _addProductRecentList.addEventListener('click', function(e) {
                    var item = e.target.closest('.add-service-recent-item');
                    if (item && _addProductSearchInput) {
                        _addProductSearchInput.value = item.getAttribute('data-keyword') || '';
                        _renderProductTable();
                    }
                });
            }
            document.querySelectorAll('#addProductModalOverlay .add-product-category-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    document.querySelectorAll('#addProductModalOverlay .add-product-category-item').forEach(function(i) { i.classList.remove('active'); });
                    this.classList.add('active');
                    _productCurrentCategory = this.getAttribute('data-category');
                    _renderProductTable();
                });
            });
            document.querySelectorAll('#addProductModalOverlay .add-product-table th.sortable').forEach(function(th) {
                th.addEventListener('click', function() {
                    var field = this.getAttribute('data-sort');
                    document.querySelectorAll('#addProductModalOverlay .add-product-table th.sortable').forEach(function(t) { t.classList.remove('sort-asc', 'sort-desc'); });
                    if (_productSortField === field) {
                        if (_productSortOrder === 'asc') { _productSortOrder = 'desc'; this.classList.add('sort-desc'); }
                        else { _productSortField = ''; _productSortOrder = ''; }
                    } else {
                        _productSortField = field; _productSortOrder = 'asc'; this.classList.add('sort-asc');
                    }
                    _renderProductTable();
                });
            });
            if (_addProductTableBody) {
                _addProductTableBody.addEventListener('click', function(e) {
                    var row = e.target.closest('tr');
                    if (row) {
                        var id = parseInt(row.getAttribute('data-id'));
                        if (id && e.target.tagName !== 'BUTTON') _toggleProductSelection(id);
                    }
                    var btn = e.target.closest('.select-btn');
                    if (btn) {
                        var row2 = btn.closest('tr');
                        if (row2) {
                            var id2 = parseInt(row2.getAttribute('data-id'));
                            if (id2) _toggleProductSelection(id2);
                        }
                    }
                });
            }
            if (_addProductSelectedList) {
                _addProductSelectedList.addEventListener('click', function(e) {
                    var btn = e.target.closest('.remove-btn');
                    if (btn) {
                        var id = parseInt(btn.getAttribute('data-remove-id'));
                        if (id) _toggleProductSelection(id);
                    }
                });
            }
            if (clearBtn) clearBtn.addEventListener('click', function() {
                _selectedProducts = [];
                _renderProductSelectedList();
                document.querySelectorAll('#addProductModalOverlay .add-product-table tbody tr.selected').forEach(function(r) { r.classList.remove('selected'); });
            });
            if (confirmBtn) confirmBtn.addEventListener('click', function() {
                if (_selectedProducts.length === 0) { showToast('请至少选择一个产品'); return; }
                _addToExchangeBenefits(_selectedProducts, 'product');
                showToast('已添加 ' + _selectedProducts.length + ' 个产品到置换权益');
                _selectedProducts = [];
                _renderProductSelectedList();
                _addProductOverlay.classList.remove('show');
            });
        })();
        
        // 切换区域展开/收起
        window.toggleExchangeSections = function() {
            showToast('切换区域功能开发中');
        };
        
        // 确认置换 — 携带待收款金额跳转至支付页
        window.confirmExchange = function() {
            var pendingEl = document.getElementById('exchangePendingAmount');
            var pendingAmount = 0;
            if (pendingEl) {
                pendingAmount = parseFloat(pendingEl.textContent.replace('¥', '')) || 0;
            }
            if (pendingAmount <= 0) {
                showToast('待收款金额无效');
                return;
            }
            // 跳转至支付页，通过 URL 参数传递待收款金额
            window.location.href = './payment.html?payable=' + pendingAmount.toFixed(2);
        };

        // 切换编辑模式
        window.toggleEditMode = function(module) {
            activeEditModules[module] = !activeEditModules[module];
            
            var btnMap = {
                tags: tagsEditBtn,
                basic: basicEditBtn,
                extra: extraEditBtn
            };
            var btn = btnMap[module];
            btn.classList.toggle('active', activeEditModules[module]);
            btn.textContent = activeEditModules[module] ? '完成' : '编辑';
            
            if (module === 'tags') {
                tagAddContainer.style.display = activeEditModules.tags ? 'flex' : 'none';
                presetTagsContainer.style.display = activeEditModules.tags ? 'flex' : 'none';
                renderTags();
            } else if (module === 'basic') {
                renderBasicInfo();
            } else if (module === 'extra') {
                renderCheckboxes();
                renderNote();
            }
        };

        // 移除标签
        window.removeMemberTag = function(index) {
            memberData.tags.splice(index, 1);
            renderTags();
        };

        // 添加新标签
        window.addNewTag = function() {
            var input = document.getElementById('newTagInput');
            var tag = input.value.trim();
            
            if (!tag) {
                showToast('请输入标签内容');
                return;
            }
            
            if (memberData.tags.length >= 10) {
                showToast('最多添加10个标签');
                return;
            }
            
            if (memberData.tags.indexOf(tag) > -1) {
                showToast('该标签已存在');
                return;
            }
            
            memberData.tags.push(tag);
            input.value = '';
            renderTags();
        };

        // 选择预设标签
        window.selectPresetTag = function(el) {
            var tag = el.textContent.trim();
            
            if (memberData.tags.length >= 10) {
                showToast('最多添加10个标签');
                return;
            }
            
            if (memberData.tags.indexOf(tag) > -1) {
                showToast('该标签已存在');
                return;
            }
            
            memberData.tags.push(tag);
            renderTags();
        };

        // 复选框点击事件
        document.addEventListener('click', function(e) {
            var checkboxItem = e.target.closest('.checkbox-item');
            if (checkboxItem && activeEditModules.extra) {
                var input = checkboxItem.querySelector('input');
                if (e.target !== input) {
                    input.checked = !input.checked;
                }
                
                var group = checkboxItem.closest('[data-group]').dataset.group;
                var value = input.value;
                
                var index = memberData[group].indexOf(value);
                if (input.checked && index === -1) {
                    memberData[group].push(value);
                } else if (!input.checked && index > -1) {
                    memberData[group].splice(index, 1);
                }
                
                checkboxItem.classList.toggle('checked', input.checked);
            }
        });

        // 取消编辑
        window.cancelMemberEdit = function() {
            if (backupData) {
                memberData = JSON.parse(JSON.stringify(backupData));
            }
            
            activeEditModules = { tags: false, basic: false, extra: false };
            tagsEditBtn.classList.remove('active');
            basicEditBtn.classList.remove('active');
            extraEditBtn.classList.remove('active');
            tagsEditBtn.textContent = '编辑';
            basicEditBtn.textContent = '编辑';
            extraEditBtn.textContent = '编辑';
            
            tagAddContainer.style.display = 'none';
            presetTagsContainer.style.display = 'none';
            
            renderTags();
            renderBasicInfo();
            renderCheckboxes();
            
            // 恢复备注显示
            var noteEl = document.querySelector('[data-field="note"]');
            if (noteEl.tagName === 'TEXTAREA') {
                renderNote();
            }
            
            closeMemberMoreInfo();
        };

        // 验证手机号码
        function validatePhone(phone) {
            var phoneNum = phone.replace(/\D/g, '');
            if (phoneNum.length !== 11) {
                return false;
            }
            if (!/^1[3-9]\d{9}$/.test(phoneNum)) {
                return false;
            }
            return true;
        }

        // 保存会员信息
        window.saveMemberInfo = function() {
            var saveBtn = document.getElementById('memberSaveBtn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="loading-spinner"></span>保存中...';
            
            // 收集基础信息编辑数据
            if (activeEditModules.basic) {
                var inputs = basicInfoContainer.querySelectorAll('.info-input, .info-select, .info-textarea');
                inputs.forEach(function(input) {
                    var field = input.dataset.field;
                    if (field) {
                        memberData.basic[field] = input.value;
                    }
                });
            }
            
            // 收集补充说明
            var noteInput = document.querySelector('[data-field="note"]');
            if (noteInput.tagName === 'TEXTAREA') {
                memberData.note = noteInput.value;
            }
            
            // 验证手机号码
            var phone = memberData.basic.phone.replace(/\D/g, '');
            if (phone && phone.length >= 11 && !validatePhone(phone)) {
                showToast('请输入正确的手机号码');
                saveBtn.disabled = false;
                saveBtn.textContent = '保存';
                return;
            }
            
            // 模拟API调用
            setTimeout(function() {
                try {
                    localStorage.setItem('memberMoreInfo', JSON.stringify(memberData));
                    
                    // 重置编辑状态
                    activeEditModules = { tags: false, basic: false, extra: false };
                    tagsEditBtn.classList.remove('active');
                    basicEditBtn.classList.remove('active');
                    extraEditBtn.classList.remove('active');
                    tagsEditBtn.textContent = '编辑';
                    basicEditBtn.textContent = '编辑';
                    extraEditBtn.textContent = '编辑';
                    
                    tagAddContainer.style.display = 'none';
                    presetTagsContainer.style.display = 'none';
                    
                    // 重新渲染只读模式
                    renderTags();
                    renderBasicInfo();
                    renderCheckboxes();
                    renderNote();
                    
                    showToast('保存成功');
                    closeMemberMoreInfo();
                } catch (err) {
                    showToast('保存失败，请重试');
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = '保存';
                }
            }, 600);
        };

        // 回车键添加标签
        document.getElementById('newTagInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewTag();
            }
        });

        // ========== 置换权益数字键盘 ==========
        var _exchangeNumpadState = { target: null, buffer: '' };
        var _exchangeNumpadOverlay = document.getElementById('numKeypadOverlay');
        var _exchangeNumpadDisplay = document.getElementById('numKeypadDisplay');
        var _exchangeNumpadGrid = document.getElementById('numKeypadGrid');
        var _exchangeNumpadTopClose = document.getElementById('numKeypadTopClose');

        function _renderExchangeNumpadDisplay() {
            if (!_exchangeNumpadDisplay) return;
            var v = String(_exchangeNumpadState.buffer || '');
            if (!v) {
                _exchangeNumpadDisplay.textContent = '0';
                _exchangeNumpadDisplay.classList.add('empty');
                return;
            }
            _exchangeNumpadDisplay.textContent = v;
            _exchangeNumpadDisplay.classList.remove('empty');
        }

        function _openExchangeNumpad(input) {
            if (!_exchangeNumpadOverlay) return;
            _exchangeNumpadState.target = input;
            _exchangeNumpadState.buffer = String(input.value || '');
            _exchangeNumpadOverlay.classList.add('show');
            _renderExchangeNumpadDisplay();
        }

        function _closeExchangeNumpad() {
            if (!_exchangeNumpadOverlay) return;
            _exchangeNumpadOverlay.classList.remove('show');
            _exchangeNumpadState.target = null;
            _exchangeNumpadState.buffer = '';
            _renderExchangeNumpadDisplay();
        }

        function _commitExchangeNumpad() {
            var input = _exchangeNumpadState.target;
            if (!input) { _closeExchangeNumpad(); return; }
            var raw = String(_exchangeNumpadState.buffer || '').replace(/[^0-9.]/g, '');
            var parts = raw.split('.');
            if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
            var val = parseFloat(raw) || 0;
            val = clampNumber(Math.round(val * 100) / 100, 0, 999999);

            var idx = parseInt(input.getAttribute('data-idx'));
            _exchangeBenefits[idx].manualSubtotal = val;
            _closeExchangeNumpad();
            _renderExchangeTable();
        }

        function _appendExchangeNumpadChar(ch) {
            var v = String(_exchangeNumpadState.buffer || '');
            if (ch === '.') {
                if (v.includes('.')) return;
                if (!v) { _exchangeNumpadState.buffer = '0.'; return; }
                _exchangeNumpadState.buffer = v + '.';
                return;
            }
            var digits = v.replace(/[^0-9]/g, '').length;
            if (digits >= 10) return;
            _exchangeNumpadState.buffer = v + ch;
        }

        if (_exchangeNumpadGrid) {
            _exchangeNumpadGrid.addEventListener('click', function(e) {
                var keyItem = e.target.closest('.key-item');
                if (!keyItem) return;
                var key = keyItem.dataset.key;
                if (!key) return;
                if (key === 'backspace') {
                    _exchangeNumpadState.buffer = String(_exchangeNumpadState.buffer || '').slice(0, -1);
                    _renderExchangeNumpadDisplay();
                    return;
                }
                if (key === 'close') {
                    _exchangeNumpadState.buffer = '';
                    _renderExchangeNumpadDisplay();
                    return;
                }
                if (key === 'confirm') {
                    _commitExchangeNumpad();
                    return;
                }
                if (key === '.' || /^[0-9]$/.test(key)) {
                    _appendExchangeNumpadChar(key);
                    _renderExchangeNumpadDisplay();
                }
            });
        }

        if (_exchangeNumpadTopClose) {
            _exchangeNumpadTopClose.addEventListener('click', function() { _closeExchangeNumpad(); });
        }

        if (_exchangeNumpadOverlay) {
            _exchangeNumpadOverlay.addEventListener('click', function(e) {
                if (e.target !== _exchangeNumpadOverlay) return;
                _closeExchangeNumpad();
            });
        }
    })();

    // ============================================================
    // 交易记录 Tab — 完整逻辑
    // ============================================================

    // ---- Mock 数据 ----
    var mockOrders = [
        {
            id: 'ORDER_001',
            orderTime: '2026-06-02 22:57:00',
            status: 'completed',
            hasRefund: false,
            items: [
                { id: 'item_001', productName: '闻香精油', productImage: '', attribute: '耗卡', unitPrice: 598.00, quantity: 1, beautician: null, itemAmount: 598.00 },
                { id: 'item_002', productName: '保湿面膜', productImage: '', attribute: '耗卡', unitPrice: 398.00, quantity: 2, beautician: 'roger', itemAmount: 796.00 },
                { id: 'item_003', productName: '洁面乳', productImage: '', attribute: null, unitPrice: 168.00, quantity: 1, beautician: null, itemAmount: 168.00 }
            ],
            totalAmount: 1562.00
        },
        {
            id: 'ORDER_002',
            orderTime: '2026-06-01 15:20:00',
            status: 'pending_sign',
            hasRefund: false,
            items: [
                { id: 'item_004', productName: '100元护理', productImage: '', attribute: '耗卡', unitPrice: 200.00, quantity: 1, beautician: null, itemAmount: 200.00 }
            ],
            totalAmount: 200.00
        },
        {
            id: 'ORDER_003',
            orderTime: '2026-06-02 22:57:00',
            status: 'refunded',
            hasRefund: true,
            items: [
                { id: 'item_005', productName: '100元护理', productImage: '', attribute: '耗卡', unitPrice: 200.00, quantity: 1, beautician: 'roger', itemAmount: 398.00 }
            ],
            totalAmount: 398.00,
            refundAmount: 398.00
        }
    ];

    // ---- 产品默认缩略图 ----
    function productImgSrc(src) {
        return src || 'default_image.jpg';
    }

    // ---- 状态映射 ----
    var statusMap = {
        'pending_sign':    { label: '待签字',   cls: 'order-status--pending',        dot: '#F59E0B' },
        'completed':       { label: '已完成',   cls: 'order-status--completed',       dot: '#10B981' },
        'refunded':        { label: '已退款',   cls: 'order-status--refunded',        dot: '#EF4444' },
        'partial_refund':  { label: '部分退款', cls: 'order-status--partial-refund',  dot: '#EF4444' },
        'cancelled':       { label: '已取消',   cls: 'order-status--cancelled',       dot: '#9CA3AF' }
    };

    var attrLabelMap = {
        '耗卡': 'order-table__product-attr--consume',
        '购买': 'order-table__product-attr--buy',
        '赠送': 'order-table__product-attr--gift'
    };

    // ---- 筛选状态 ----
    var txnFilter = { name: '', dateStart: '', dateEnd: '' };

    function getFilteredOrders() {
        return mockOrders.filter(function(o) {
            if (txnFilter.name) {
                var matchName = false;
                o.items.forEach(function(item) {
                    if (item.productName.indexOf(txnFilter.name) !== -1) matchName = true;
                });
                if (!matchName) return false;
            }
            if (txnFilter.dateStart) {
                if (o.orderTime.slice(0,10) < txnFilter.dateStart) return false;
            }
            if (txnFilter.dateEnd) {
                if (o.orderTime.slice(0,10) > txnFilter.dateEnd) return false;
            }
            return true;
        });
    }

    function getPendingOrders() {
        return mockOrders.filter(function(o) { return o.status === 'pending_sign'; });
    }

    // ---- 渲染订单列表 ----
    function renderTransactions() {
        var container = document.getElementById('transactions-list');
        var emptyEl   = document.getElementById('txn-empty-placeholder');
        var orders    = getFilteredOrders();

        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '';
            if (emptyEl) emptyEl.style.display = '';
            updateBatchSignButton();
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        var html = '';
        orders.forEach(function(order) {
            var actionText = order.hasRefund ? '退单详情' : '订单详情';
            var totalCls  = order.hasRefund ? ' order-block__total--refund' : '';
            var totalLabel = (order.status === 'refunded' || order.status === 'partial_refund') ? '退款金额：' : '订单总额：';
            var totalAmt   = order.refundAmount || order.totalAmount;

            // 状态信息
            var st = statusMap[order.status] || { label: order.status, cls: '', dot: '#9CA3AF' };

            html += '<div class="order-block">';

            // 订单头部
            html += '<div class="order-block__header">';
            html += '<span class="order-block__header-time">下单时间：' + order.orderTime + '</span>';
            html += '<a class="order-block__header-action" href="javascript:void(0)">' + actionText + '</a>';
            html += '</div>';

            // 商品表格
            html += '<table class="order-table"><thead><tr>';
            html += '<th style="width:200px;">商品</th>';
            html += '<th class="col-price" style="width:100px;">单价</th>';
            html += '<th class="col-qty" style="width:60px;">数量</th>';
            html += '<th class="col-beautician" style="width:100px;">美容师</th>';
            html += '<th class="col-amount" style="width:120px;">金额</th>';
            html += '<th class="col-status" style="width:100px;">状态</th>';
            html += '</tr></thead><tbody>';

            var itemsLen = order.items.length;
            order.items.forEach(function(item, idx) {
                var amountCls = (order.hasRefund && idx === itemsLen - 1) ? ' col-amount--refund' : '';
                var amountText = (idx === itemsLen - 1 && order.refundAmount)
                    ? '实退¥' + order.refundAmount.toFixed(0)
                    : '¥' + item.itemAmount.toFixed(0);
                var attrHtml = item.attribute
                    ? '<span class="order-table__product-attr ' + (attrLabelMap[item.attribute] || '') + '">' + item.attribute + '</span>'
                    : '';
                var beautician = item.beautician || '-';

                html += '<tr class="order-table__row">';
                // 商品列
                html += '<td><div class="col-product">';
                html += '<div class="order-table__product-img"><img src="' + productImgSrc(item.productImage) + '" alt="' + item.productName + '" onerror="this.src=\'default_image.jpg\'"></div>';
                html += '<div class="order-table__product-info">';
                html += '<span class="order-table__product-name">' + item.productName + '</span>';
                html += attrHtml;
                html += '</div></div></td>';
                // 单价
                html += '<td class="col-price">¥' + item.unitPrice.toFixed(0) + '</td>';
                // 数量
                html += '<td class="col-qty">x' + item.quantity + '</td>';
                // 美容师
                html += '<td class="col-beautician">' + beautician + '</td>';
                // 金额
                html += '<td class="col-amount' + amountCls + '">' + amountText + '</td>';
                // 状态 — 只第一行显示（跨行）
                if (idx === 0) {
                    html += '<td class="col-status" rowspan="' + itemsLen + '">';
                    html += '<span class="order-status ' + st.cls + '">';
                    html += '<span class="order-status__dot"></span>';
                    html += st.label;
                    html += '</span></td>';
                }
                html += '</tr>';
            });

            html += '</tbody></table>';

            // 汇总行
            html += '<div class="order-block__total' + totalCls + '">';
            html += totalLabel + '¥' + totalAmt.toFixed(0);
            html += '</div>';

            html += '</div>';
        });

        container.innerHTML = html;
        updateBatchSignButton();
    }

    // ---- 更新批量签字按钮可见性 ----
    function updateBatchSignButton() {
        var area = document.getElementById('txn-batch-sign-area');
        var countEl = document.getElementById('batch-sign-count');
        var pendingOrders = getPendingOrders();

        if (!area) return;

        if (pendingOrders.length > 0) {
            area.style.display = '';
            if (countEl) countEl.textContent = '待签字订单：' + pendingOrders.length + ' 笔';
        } else {
            area.style.display = 'none';
        }
    }

    // ---- Canvas 签名逻辑 ----
    var batchSignCanvas = null;
    var batchSignCtx = null;
    var batchSignDrawn = false;
    var batchSignDrawing = false;

    function initBatchSignCanvas() {
        batchSignCanvas = document.getElementById('batchSignCanvas');
        if (!batchSignCanvas) return;
        batchSignCtx = batchSignCanvas.getContext('2d');

        function getPos(e) {
            var rect = batchSignCanvas.getBoundingClientRect();
            var scaleX = batchSignCanvas.width / rect.width;
            var scaleY = batchSignCanvas.height / rect.height;
            var clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function startDraw(e) {
            e.preventDefault();
            batchSignDrawing = true;
            var pos = getPos(e);
            batchSignCtx.beginPath();
            batchSignCtx.moveTo(pos.x, pos.y);
        }

        function draw(e) {
            if (!batchSignDrawing) return;
            e.preventDefault();
            var pos = getPos(e);
            batchSignCtx.lineWidth = 2.5;
            batchSignCtx.lineCap = 'round';
            batchSignCtx.lineJoin = 'round';
            batchSignCtx.strokeStyle = '#333';
            batchSignCtx.lineTo(pos.x, pos.y);
            batchSignCtx.stroke();
            batchSignCtx.beginPath();
            batchSignCtx.moveTo(pos.x, pos.y);
            markDrawn();
        }

        function endDraw(e) {
            if (!batchSignDrawing) return;
            batchSignDrawing = false;
            batchSignCtx.beginPath();
        }

        function markDrawn() {
            if (!batchSignDrawn) {
                batchSignDrawn = true;
                var placeholder = document.getElementById('batchSignCanvasPlaceholder');
                if (placeholder) placeholder.classList.add('hidden');
                updateConfirmButton();
            }
        }

        batchSignCanvas.addEventListener('mousedown', startDraw);
        batchSignCanvas.addEventListener('mousemove', draw);
        batchSignCanvas.addEventListener('mouseup', endDraw);
        batchSignCanvas.addEventListener('mouseleave', endDraw);
        batchSignCanvas.addEventListener('touchstart', startDraw, { passive: false });
        batchSignCanvas.addEventListener('touchmove', draw, { passive: false });
        batchSignCanvas.addEventListener('touchend', endDraw);
    }

    function clearBatchSignCanvas() {
        if (!batchSignCtx) return;
        batchSignCtx.clearRect(0, 0, batchSignCanvas.width, batchSignCanvas.height);
        batchSignDrawn = false;
        var placeholder = document.getElementById('batchSignCanvasPlaceholder');
        if (placeholder) placeholder.classList.remove('hidden');
        updateConfirmButton();
    }

    function updateConfirmButton() {
        var checkbox = document.getElementById('batchSignCheckbox');
        var confirmBtn = document.getElementById('batchSignConfirm');
        if (!confirmBtn) return;
        var isChecked = checkbox && checkbox.checked;
        confirmBtn.disabled = !(isChecked && batchSignDrawn);
    }

    // ---- 批量签字弹窗 ----
    function openBatchSignModal() {
        var overlay = document.getElementById('batchSignOverlay');
        var pendingOrders = getPendingOrders();
        if (!overlay || pendingOrders.length === 0) return;

        // 渲染订单清单
        var tbody = document.getElementById('batchSignOrderTbody');
        var countEl = document.getElementById('batchSignCount');
        var hintEl = document.getElementById('batchSignHint');

        if (countEl) countEl.textContent = pendingOrders.length;
        if (hintEl) hintEl.innerHTML = '以下 <span>' + pendingOrders.length + '</span> 笔订单需要客户签字确认：';

        if (tbody) {
            tbody.innerHTML = pendingOrders.map(function(o) {
                var productNames = o.items.map(function(item) { return item.productName; }).join('、');
                return '<tr><td>' + o.orderTime + '</td><td>' + productNames + '</td></tr>';
            }).join('');
        }

        // 重置
        var checkbox = document.getElementById('batchSignCheckbox');
        if (checkbox) checkbox.checked = false;
        clearBatchSignCanvas();

        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeBatchSignModal() {
        var overlay = document.getElementById('batchSignOverlay');
        if (overlay) overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    function confirmBatchSign() {
        var pendingOrders = getPendingOrders();
        if (pendingOrders.length === 0) return;

        // 批量更新状态
        pendingOrders.forEach(function(o) {
            o.status = 'completed';
            o.hasRefund = false;
        });

        closeBatchSignModal();
        renderTransactions();
        showToast(pendingOrders.length + ' 笔订单签字完成');
    }

    // ---- 筛选事件 ----
    document.getElementById('txn-btn-search').addEventListener('click', function() {
        txnFilter.name     = document.getElementById('txn-search-name').value.trim();
        txnFilter.dateStart = document.getElementById('txn-date-start').value;
        txnFilter.dateEnd   = document.getElementById('txn-date-end').value;
        renderTransactions();
    });

    document.getElementById('txn-btn-reset').addEventListener('click', function() {
        document.getElementById('txn-search-name').value = '';
        document.getElementById('txn-date-start').value = '';
        document.getElementById('txn-date-end').value = '';
        txnFilter = { name: '', dateStart: '', dateEnd: '' };
        renderTransactions();
    });

    // ---- 批量签字按钮 ----
    document.getElementById('btn-batch-sign').addEventListener('click', function() {
        openBatchSignModal();
    });

    // ---- 弹窗关闭 ----
    document.getElementById('batchSignClose').addEventListener('click', function() {
        closeBatchSignModal();
    });

    document.getElementById('batchSignOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeBatchSignModal();
    });

    // ---- 复选框 & Canvas 联动 ----
    document.getElementById('batchSignCheckbox').addEventListener('change', function() {
        updateConfirmButton();
    });

    document.getElementById('batchSignClear').addEventListener('click', function() {
        clearBatchSignCanvas();
    });

    document.getElementById('batchSignConfirm').addEventListener('click', function() {
        confirmBatchSign();
    });

    // ---- 初始化 ----
    initBatchSignCanvas();
    renderTransactions();

});
