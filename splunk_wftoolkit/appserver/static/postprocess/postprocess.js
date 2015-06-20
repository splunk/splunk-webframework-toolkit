require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/postprocessmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/chartview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        PostProcessManager,
        TableView,
        ChartView
    ) {

        new SearchManager({
            id: 'main-search',
            search: 'index=_internal sourcetype=splunkd_access OR sourcetype=splunkd OR sourcetype=splunk_web_access OR sourcetype=splunk_web_service | head 10000 | stats count by sourcetype',
            preview: true,
            cache: true
        });

        new PostProcessManager({
            id: "post1",
            managerid: "main-search",
            postProcess: "search sourcetype=splunkd_access OR sourcetype=splunkd" 
        });

        new PostProcessManager({
            id: "post2",
            managerid: "main-search",
            postProcess: "search sourcetype=splunk_web_access OR sourcetype=splunk_web_service" 
        });

        new PostProcessManager({
            id: "post3",
            managerid: "main-search",
            postProcess: "search sourcetype=splunk_web_access OR sourcetype=splunkd" 
        });

        new ChartView({
            id: 'chart1',
            managerid: 'post1',
            type: 'pie',
            el: $('#chart1')
        }).render();

        new ChartView({
            id: 'chart2',
            managerid: 'post2',
            type: 'bar',
            el: $('#chart2')
        }).render();

        new TableView({
            id: 'table1',
            managerid: 'post3',
            el: $('#table1')
        }).render();

        new TableView({
            id: 'table2',
            managerid: 'main-search',
            el: $('#table2')
        }).render();
    }
);