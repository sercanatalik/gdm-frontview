export const SYSTEM_LAYOUT = {
    sizes: [0.25, 0.75],
    detail: {
        main: {
            type: "tab-area",
            widgets: ["PERSPECTIVE_GENERATED_ID_1"],
            currentIndex: 0
        }
    },
    mode: "globalFilters",
    master: {
        widgets: ["PERSPECTIVE_GENERATED_ID_0"],
        sizes: [1]
    },
    viewers: {
        PERSPECTIVE_GENERATED_ID_0: {
            version: "2.10.1",
            plugin: "Datagrid",
            plugin_config: {
                columns: {},
                editable: false,
                scroll_lock: false
            },
            columns_config: {},
            settings: false,
            theme: "Pro Light",
            title: "DeskFilter",
            group_by: ["hmsDesk"],
            split_by: [],
            columns: ["cashOut", "ead"],
            filter: [],
            sort: [],
            expressions: {},
            aggregates: {},
            master: true,
            table: "risk_view",
            linked: false,
            selectable: ""
        },
        PERSPECTIVE_GENERATED_ID_1: {
            version: "2.10.1",
            plugin: "Datagrid",
            plugin_config: {
                columns: {},
                editable: false,
                scroll_lock: false
            },
            columns_config: {},
            settings: false,
            theme: "Pro Light",
            title: "ByTrader",
            group_by: ["hmsTrader", "instrumentSector"],
            split_by: [],
            columns: ["accrualDaily", "accrualProjected", "accrualPast", "cashOut", "marginFixed"],
            filter: [["hmsDesk", "==", "Commodities"]],
            sort: [],
            expressions: {},
            aggregates: {
                marginFixed: "avg"
            },
            master: false,
            table: "risk_view",
            linked: false
        }
    }
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

