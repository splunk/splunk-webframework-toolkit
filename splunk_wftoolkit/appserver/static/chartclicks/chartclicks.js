require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/singleview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        ChartView,
        SingleView
    ) {

        var tokens = mvc.Components.getInstance("default");

        new SearchManager({
            id: 'simplesearch1',
            search: '| metadata type=sourcetypes index=_internal | rename totalCount as count | table sourcetype count',
            cache: true,
            preview: true,
            autostart: true
        });

        var detailSearch = new SearchManager({
            id: 'detailsearch',
            search: mvc.tokenSafe('| metadata type=sourcetypes index=_internal | search sourcetype=$sourcetype$'),
            cache: true,
            preview: true,
            autostart: false
        });

        var sourcetypeChart = new ChartView({
            id: 'sourcetype-chart',
            managerid: 'simplesearch1',
            type: 'pie',
            el: $('#sourcetype-chart')
        }).render();

        var detailSingle = new SingleView({
            id: 'detail-single',
            managerid: 'detailsearch',
            field: 'totalCount',
            afterLabel: 'events',
            el: $('#detail-single')
        }).render();

        sourcetypeChart.on("click:chart", function(e) {
            e.preventDefault();
            detailSingle.settings.set("beforeLabel", e.value + ":");
            tokens.set("sourcetype", e.value);
            detailSearch.startSearch();
        }); 
    }
);