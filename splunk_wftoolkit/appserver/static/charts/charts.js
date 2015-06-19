require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/searchmanager',
    'css!splunk_wftoolkit/charts/charts.css'
    ], function(
        $, 
        _, 
        mvc,
        ChartView,
        SearchManager
    ) {

    new SearchManager({
        id: 'chart-search',
        search: '| inputlookup splunkdj.demo.dataset.csv | chart count by artist_name | head 20'
    });

    new SearchManager({
        id: 'gauge-search',
        search: '| stats count | eval count =42 | table count'
    });

    new SearchManager({
        id: 'scatter-search',
        search: '| inputlookup splunkdj.demo.dataset.csv | rename device_ip_city as city eventcount as downloads | stats avg(duration) by city downloads'
    });

    new ChartView({
        id: 'example-chart-area',
        managerid: 'chart-search',
        type: 'area',
        el: $('#example-chart-area')
    }).render();

    new ChartView({
        id: 'example-chart-bar',
        managerid: 'chart-search',
        type: 'bar',
        el: $('#example-chart-bar')
    }).render();

    new ChartView({
        id: 'example-chart-column',
        managerid: 'chart-search',
        type: 'column',
        el: $('#example-chart-column')
    }).render();

    new ChartView({
        id: 'example-chart-fillerGauge',
        managerid: 'gauge-search',
        type: 'fillerGauge',
        el: $('#example-chart-fillerGauge')
    }).render();
    
    new ChartView({
        id: 'example-chart-line',
        managerid: 'chart-search',
        type: 'line',
        el: $('#example-chart-line')
    }).render();

    new ChartView({
        id: 'example-chart-markerGauge',
        managerid: 'gauge-search',
        type: 'markerGauge',
        el: $('#example-chart-markerGauge')
    }).render();

    new ChartView({
        id: 'example-chart-pie',
        managerid: 'chart-search',
        type: 'pie',
        el: $('#example-chart-pie')
    }).render();

    new ChartView({
        id: 'example-chart-radialGauge',
        managerid: 'gauge-search',
        type: 'radialGauge',
        el: $('#example-chart-radialGauge')
    }).render();

    new ChartView({
        id: 'example-chart-scatter',
        managerid: 'scatter-search',
        type: 'scatter',
        el: $('#example-chart-scatter')
    }).render();
});