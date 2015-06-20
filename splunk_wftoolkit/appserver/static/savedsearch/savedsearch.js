require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/savedsearchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SavedSearchManager,
        TableView,
        ChartView
    ) {
        new SavedSearchManager({
            id: 'savedsearch1',
            searchname: 'Top five sourcetypes',
            app: 'search'
        });

        new TableView({
            id: 'table1',
            managerid: 'savedsearch1',
            el: $('#table1')
        }).render();

        new ChartView({
            id: 'chart1',
            managerid: 'savedsearch1',
            type: 'pie',
            el: $('#chart1')
        }).render();
    }
);