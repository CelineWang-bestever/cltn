(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
        return;
    }
    root.SelectedItemsReset = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function shouldResetCustomerChange(prevKey, nextKey) {
        if (!prevKey || !nextKey) return false;
        return String(prevKey) !== String(nextKey);
    }

    function resetSelectedItemsArea(ctx) {
        const doc = ctx && ctx.document;
        if (!doc) return false;

        const bodyIds = [
            'service-table-body',
            'product-table-body',
            'amount-card-table-body',
            'course-table-body',
            'benefit-consume-table-body'
        ];

        for (let i = 0; i < bodyIds.length; i++) {
            const el = doc.getElementById(bodyIds[i]);
            if (el) el.innerHTML = '';
        }

        const selectedArea = doc.querySelector && doc.querySelector('.selected-items-area');
        if (selectedArea && selectedArea.querySelectorAll) {
            const nodes = selectedArea.querySelectorAll('.upgrade-card-module, .course-card-section, .selected-item-card, .promotion-card-section');
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                if (n && n.remove) n.remove();
            }
        }

        if (typeof ctx.setUpgradeCardList === 'function') ctx.setUpgradeCardList([]);
        if (typeof ctx.setRechargeCardList === 'function') ctx.setRechargeCardList([]);
        if (typeof ctx.setSelectedCourseCards === 'function') ctx.setSelectedCourseCards([]);
        if (typeof ctx.setSelectedAmountCards === 'function') ctx.setSelectedAmountCards([]);
        if (typeof ctx.setSelectedServices === 'function') ctx.setSelectedServices([]);
        if (typeof ctx.setSelectedProducts === 'function') ctx.setSelectedProducts([]);

        if (typeof ctx.clearWholeOrderChange === 'function') ctx.clearWholeOrderChange();

        if (typeof ctx.afterUpdate === 'function') ctx.afterUpdate();

        let bodiesEmpty = true;
        for (let i = 0; i < bodyIds.length; i++) {
            const el = doc.getElementById(bodyIds[i]);
            if (el && String(el.innerHTML || '').trim() !== '') {
                bodiesEmpty = false;
                break;
            }
        }

        let modulesEmpty = true;
        if (selectedArea && selectedArea.querySelectorAll) {
            const left = selectedArea.querySelectorAll('.upgrade-card-module, .course-card-section, .selected-item-card, .promotion-card-section');
            modulesEmpty = left.length === 0;
        }

        return bodiesEmpty && modulesEmpty;
    }

    function getCustomerKeyFromMember(member) {
        if (!member) return '';
        const id = member.id || member.memberNo || member.phone || member.name || '';
        const key = String(id).trim();
        if (!key) return '';
        return 'member:' + key;
    }

    return {
        shouldResetCustomerChange,
        resetSelectedItemsArea,
        getCustomerKeyFromMember
    };
});
