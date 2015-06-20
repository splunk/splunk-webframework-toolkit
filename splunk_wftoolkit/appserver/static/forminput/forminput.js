require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/timelineview',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/radiogroupview',
    'splunkjs/mvc/dropdownview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TimelineView,
        ChartView,
        TableView,
        RadioGroupView,
        DropdownView
    ) {

        new SearchManager({
            id: 'simplesearch1',
            search: mvc.tokenSafe('index=_internal host=$host$ | head $count$ | stats count by sourcetype'),
            preview: true,
            cache: 60,
            status_buckets: 300
        });

        new SearchManager({
            id: 'simplesearch2',
            search: mvc.tokenSafe('index=_internal host=$host$ | head $count$ | stats count by source'),
            preview: true,
            cache: 60,
            status_buckets: 300
        });

        new SearchManager({
            id: 'hostsearch',
            search: '| metadata index=* type=hosts',
            preview: true,
            cache: 60
        });

        var countDropdown = new DropdownView({
            id: 'count-dropdown',
            default: '10',
            choices: [
                {value: '10', label: '10'},
                {value: '500', label: '500'},
                {value: '1000', label: '10000'}
            ],
            value: mvc.tokenSafe('$count$'),
            el: $('#count-dropdown')
        }).render();

        var radio = new RadioGroupView({
            id: 'host-radio',
            managerid: 'hostsearch',
            valueField: 'host',
            default: '*',
            value: mvc.tokenSafe('$host$'),
            el: $('#host-radio')
        }).render();

        new ChartView({
            id: 'chart1',
            managerid: 'simplesearch1',
            type: 'pie',
            el: $('#chart1')
        }).render();

        new ChartView({
            id: 'chart2',
            managerid: 'simplesearch1',
            type: 'bar',
            el: $('#chart2')
        }).render();

        new TimelineView({
            id: 'timeline1',
            managerid: 'simplesearch1',
            el: $('#timeline1')
        }).render();
        
        new TableView({
            id: 'table1',
            managerid: 'simplesearch2',
            el: $('#table1')
        }).render();
        
        radio.settings.set("choices", [
            {value: "*", label: "(all)"}
        ]);
    }
);