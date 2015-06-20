require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/splunkmapview',
    'splunkjs/mvc/resultslinkview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView,
        MapView,
        ResultsLinkView
    ) {

        var tokens = mvc.Components.getInstance('default');

        new SearchManager({
            id: 'map-search',
            search: '| inputlookup earthquakes.csv | rename Lat as lat Lon as lon | geostats count',
            cache: true,
            preview: true,  
        });

        var map1 = new MapView({
            id: 'map1',
            managerid: 'map-search',
            el: $('#map1')
        }).render();

        var map2 = new MapView({
            id: 'map2',
            managerid: 'map-search',
            tileSource: 'openStreetMap',
            el: $('#map2')
        }).render();

        var table1 = new TableView({
            id: 'table1',
            managerid: 'map-search',
            pageSize: 6,
            fields: ['latitude', 'longitude', 'count'],
            el: $('#table1')
        }).render();

        var rlv1 = new ResultsLinkView({
            id: 'rlv1',
            managerid: 'map-search',
            el: $('#rlv1')
        }).render();
    }
);