define([], function () {
    return {
        'SlickGrid': {
            editable: true,
            headerRowHeight: 46,
            rowHeight: 40,
            autoEdit: false,
            enableCellNavigation: true,
            asyncEditorLoading: false,
            forceFitColumns: false
        },
        'Table': {
            table_class:'ui single line sortable table',
            header_class:'',
            body_class:'',
            header_cell_class:'',
            cell_class:'',
            display_header: true,
            row_color: true
        }
    }
});