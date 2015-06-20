require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/postprocessmanager',
    'splunkjs/mvc/tableview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        PostProcessManager,
        TableView
    ) {

        new SearchManager({
            id: 'nocache',
            search: 'index=_internal | head 1000 | stats count by sourcetype',
            cache: false,
        });

        new SearchManager({
            id: 'cache',
            search: 'index=_internal | head 1000 | stats count by sourcetype',
            cache: true,
        });

        new SearchManager({
            id: 'cache60',
            search: 'index=_internal | head 1000 | stats count by sourcetype',
            cache: 60,
        });
        
        new TableView({
            id: 'table1',
            managerid: 'nocache',
            el: $('#table1')
        }).render();
        
        new TableView({
            id: 'table2',
            managerid: 'cache',
            el: $('#table2')
        }).render();

        new TableView({
            id: 'table3',
            managerid: 'cache60',
            el: $('#table3')
        }).render();
    }
);