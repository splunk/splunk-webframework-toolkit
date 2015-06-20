require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView
    ) {

        var tokens = mvc.Components.getInstance("default");

        new SearchManager({
            id: 'simplesearch1',
            search: 'index=_internal | head 10000 | stats count by sourcetype,source,host | rangemap field=count low=0-100 elevated=101-1000 default=severe',
            cache: true,
            preview: true,
            autostart: true
        });

        var tableView1 = new TableView({
            id: 'table1',
            managerid: 'simplesearch1',
            el: $('#table1')
        }).render();

        var table2 = new TableView({
            id: 'table2',
            managerid: 'simplesearch1',
            el: $('#table2')
        }).render();

        var ICONS = {
            severe: 'alert-circle',
            elevated: 'alert',
            low: 'check-circle'
        };

        var CustomIconCellRenderer = TableView.BaseCellRenderer.extend({
            canRender: function(cell) {
                return cell.field === 'range';
            },
            
            render: function($td, cell) {
                var icon = 'question';
                if(ICONS.hasOwnProperty(cell.value)) {
                    icon = ICONS[cell.value];
                }
                $td.addClass('icon').html(_.template('<i class="icon-<%-icon%> <%- range %>" title="<%- range %>"></i>', {
                    icon: icon,
                    range: cell.value
                }));
            }
        });

        tableView1.table.addCellRenderer(new CustomIconCellRenderer());
        tableView1.table.render();   
    }
);