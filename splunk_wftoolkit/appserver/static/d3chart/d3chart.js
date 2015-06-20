require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/d3chart/d3chartview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        D3ChartView
    ) {
        new SearchManager({
            'id': "search2",
            'preview': true,
            'search': "|inputlookup faa.demo.csv | search DestCityName=* | stats count by DestCityName | sort - count | head 10",
        });

        new SearchManager({
            'id': "search3",
            'preview': true,
            'search': '|inputlookup faa.demo.csv | head 100000 | search DestCityName="Atlanta, GA" AND DayOfWeek=1 | timechart span=1h count',
        });

        var bar_chart = new D3ChartView({
            "id": "bar",
            "managerid": "search2",
            "type": "discreteBarChart",
            "el": $('#hook')
        }).render();

        bar_chart.settings.set("setup", function(chart){
            chart.color(d3.scale.category10().range());
            chart.staggerLabels(true);
            chart.showValues(true);
        });

        var donut_chart = new D3ChartView({
            "id": "donut",
            "managerid": "search2",
            "type": "pieChart",
            "el": $('#hook1')
        }).render();

        donut_chart.settings.set("setup", function(chart){
            chart.color(d3.scale.category10().range());
            chart.donut(true);
        });
    }
);