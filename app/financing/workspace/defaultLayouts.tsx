export const SYSTEM_LAYOUT = {
    sizes: [0.25, 0.75],
    detail: { "main": { type: "tab-area", widgets: ["PERSPECTIVE_GENERATED_ID_7"], "currentIndex": 0 } }, mode: "globalFilters",
    master: { widgets: ["PERSPECTIVE_GENERATED_ID_5", "PERSPECTIVE_GENERATED_ID_6"], sizes: [0.5, 0.5] }, 
    viewers: { "PERSPECTIVE_GENERATED_ID_5": 
        { version: "2.10.1", "plugin": "Datagrid", "plugin_config": { "columns": {}, "editable": false, "scroll_lock": false }, "columns_config": {}, "settings": false, "theme": "Pro Light", "title": null, "group_by": [], "split_by": [], "columns": ["t.id", "trade_id", "counterparty", "t.book", "trade_date", "effective_date", "t.maturity_date", "underlying_asset", "notional_amount", "t.currency", "payment_frequency", "total_return_receiver", "total_return_payer", "financing_rate", "financing_spread", "initial_price", "is_cleared", "clearing_house", "collateral_type", "termination_date", "termination_price", "status", "created_at", "t.updated_at", "h.id", "balance_sheet", "trader", "desk", "portfolio", "h.book", "h.region", "bookGuid", "updatedAt", "c.id", "c.name", "c.region", "c.country", "c.sector", "c.industry", "c.rating", "c.updated_at", "i.id", "isin", "cusip", "sedol", "i.name", "issuer", "i.region", "i.country", "i.sector", "i.industry", "i.currency", "issue_date", "i.maturity_date", "coupon", "coupon_frequency", "yield_to_maturity", "price", "face_value", "i.rating", "is_callable", "is_puttable", "is_convertible", "i.updated_at", "latestUpdate"], "filter": [], "sort": [], "expressions": {}, "aggregates": {}, "master": true, "table": "data", "linked": false, "selectable": "" }, "PERSPECTIVE_GENERATED_ID_6": { version: "2.10.1", "plugin": "Datagrid", "plugin_config": { "columns": {}, "editable": false, "scroll_lock": false }, "columns_config": {}, "settings": false, "theme": "Pro Light", "title": null, "group_by": [], "split_by": [], "columns": ["t.id", "trade_id", "counterparty", "t.book", "trade_date", "effective_date", "t.maturity_date", "underlying_asset", "notional_amount", "t.currency", "payment_frequency", "total_return_receiver", "total_return_payer", "financing_rate", "financing_spread", "initial_price", "is_cleared", "clearing_house", "collateral_type", "termination_date", "termination_price", "status", "created_at", "t.updated_at", "h.id", "balance_sheet", "trader", "desk", "portfolio", "h.book", "h.region", "bookGuid", "updatedAt", "c.id", "c.name", "c.region", "c.country", "c.sector", "c.industry", "c.rating", "c.updated_at", "i.id", "isin", "cusip", "sedol", "i.name", "issuer", "i.region", "i.country", "i.sector", "i.industry", "i.currency", "issue_date", "i.maturity_date", "coupon", "coupon_frequency", "yield_to_maturity", "price", "face_value", "i.rating", "is_callable", "is_puttable", "is_convertible", "i.updated_at", "latestUpdate"], "filter": [], "sort": [], "expressions": {}, "aggregates": {}, "master": true, "table": "data", "linked": false, "selectable": "" }, "PERSPECTIVE_GENERATED_ID_7": { version: "2.10.1", "plugin": "Datagrid", "plugin_config": { "columns": {}, "editable": false, "scroll_lock": false }, "columns_config": {}, "settings": false, "theme": "Pro Light", "title": null, "group_by": [], "split_by": [], "columns": ["t.id", "trade_id", "counterparty", "t.book", "trade_date", "effective_date", "t.maturity_date", "underlying_asset", "notional_amount", "t.currency", "payment_frequency", "total_return_receiver", "total_return_payer", "financing_rate", "financing_spread", "initial_price", "is_cleared", "clearing_house", "collateral_type", "termination_date", "termination_price", "status", "created_at", "t.updated_at", "h.id", "balance_sheet", "trader", "desk", "portfolio", "h.book", "h.region", "bookGuid", "updatedAt", "c.id", "c.name", "c.region", "c.country", "c.sector", "c.industry", "c.rating", "c.updated_at", "i.id", "isin", "cusip", "sedol", "i.name", "issuer", "i.region", "i.country", "i.sector", "i.industry", "i.currency", "issue_date", "i.maturity_date", "coupon", "coupon_frequency", "yield_to_maturity", "price", "face_value", "i.rating", "is_callable", "is_puttable", "is_convertible", "i.updated_at", "latestUpdate"], "filter": [], "sort": [], "expressions": {}, "aggregates": {}, "master": false, "table": "data", "linked": false } }
}



export function loadDefaultLayout(selectedLayout?: string) {
    const workspaceLayouts = localStorage.getItem('workspaceLayouts');
    selectedLayout = selectedLayout || localStorage.getItem('workspaceSelectedLayout') || undefined;
    if (!selectedLayout) return SYSTEM_LAYOUT;
    if (workspaceLayouts) {
        const layouts = JSON.parse(workspaceLayouts);
        if (layouts[selectedLayout]) {
            console.log('Loading layout', selectedLayout, layouts[selectedLayout]);
            return JSON.parse(layouts[selectedLayout]);
        }
    }

    return SYSTEM_LAYOUT
}

