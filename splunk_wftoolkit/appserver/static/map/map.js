define([
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
        return {
            render: function() {
                new SearchManager({
                    id: 'geosearch',
                    search: '| inputlookup earthquakes.csv | rename Lat as lat Lon as lon | geostats count'
                });
                
                new SplunkMapView({
                    id: 'example-map',
                    managerid: 'geosearch',
                    tileSource: 'openStreetMap',
                    el: $('#example-map')
                }).render();
            }
        }
    }
);