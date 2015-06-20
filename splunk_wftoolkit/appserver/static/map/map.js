require([
    'jquery', 
    'underscore', 
    'prettify', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/splunkmapview'
    ], 
    function(
        $, 
        _, 
        prettyPrint,
        mvc,
        SearchManager,
        SplunkMapView
    ) {

        new SearchManager({
            id: 'geosearch',
            search: '| inputlookup earthquakes.csv | rename Lat as lat Lon as lon | geostats count'
        });
        
        new SplunkMapView({
            id: 'example-map',
            managerid: 'geosearch',
            tileSource: 'openStreetMap',
            el: $('#example-map'),
            'mapping.map.center': '(17.3,-39.9)',
            'mapping.map.zoom': 2
        }).render();
    }
);