require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/singleview'
    ], 
    function(
        $, 
        _, 
        mvc
    ) {
        var ChartView = require("splunkjs/mvc/chartview");
        var TableView = require("splunkjs/mvc/tableview");
        var SearchManager = require("splunkjs/mvc/searchmanager");
        var SingleView = require("splunkjs/mvc/singleview");

        // Here we are creating the three views we are going to be using:

        // Table
        new TableView({
            id: "table1",
            managerid: "search1",
            el: $("#table1")
        }).render();

        // Single Value
        // We also give it the 'beforeLabel' option
        new SingleView({
            id: "single1",
            managerid: "search2",
            beforeLabel: "Count of Events",
            el: $("#single1")
        }).render();

        // Chart
        new ChartView({
            id: "chart1",
            managerid: "search3",
            "charting.chart": "line",
            el: $("#chart1")
        }).render();


        // Create the three search managers that we need
        new SearchManager({
            id: "search1",
            earliest_time: "-24h@h",
            latest_time: "now",
            search: "index=_internal | stats count by sourcetype"
        });
        new SearchManager({
            id: "search2",
            earliest_time: "-15m",
            latest_time: "now",
            search: "index=_internal | stats count"
        });
        new SearchManager({
            id: "search3",
            earliest_time: "-24h@h",
            latest_time: "now",
            search: "index=_internal | timechart count by sourcetype"
        });
    }
);