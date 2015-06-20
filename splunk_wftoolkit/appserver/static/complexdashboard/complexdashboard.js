require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!',
    'splunkjs/mvc/utils', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/timelineview',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/radiogroupview',
    'splunkjs/mvc/dropdownview',
    'splunkjs/mvc/singleview',
    'splunk_wftoolkit/components/bubblechart/bubblechart',
    'splunkjs/mvc/splunkmapview'
    ], 
    function(
        $, 
        _, 
        mvc,
        utils,
        SearchManager,
        TimelineView,
        ChartView,
        TableView,
        RadioGroupView,
        DropdownView,
        SingleView,
        BubbleChart,
        MapView
    ) {

        var tokens = mvc.Components.getInstance("default");
        tokens.set("carrier", "Delta Air Lines Inc.: DL");

        new SearchManager({
            id: 'city-select-search',
            search: '| inputlookup faa.demo.csv | head 5000 | stats count by DestCityName',
        });

        new SearchManager({
            id: 'mapsearch',
            search: mvc.tokenSafe('| inputlookup faa.demo.csv | search DestCityName="$cityName$" | rename OriginLatitude as lat, OriginLongitude as lon | geostats count')
        });

        new SearchManager({
            id: 'carrier-city-search',
            search: mvc.tokenSafe('| inputlookup faa.demo.csv | head 10000 | search AirlineDescription="$carrier$" | chart count by DestCityName | sort count')
        });

        new SearchManager({
            'id': 'arrival-count-search',
            'search': mvc.tokenSafe('| inputlookup faa.demo.csv | head 100000 | search DestCityName="$cityName$" | stats count '),
            'app': utils.getCurrentApp(),
            'auto_cancel': 90,
            'status_buckets': 0,
            'preview': true,
        });
        new SearchManager({
            'id': 'bubble-search',
            'search': mvc.tokenSafe('| inputlookup faa.demo.csv | search (DestCityName="$cityName$") | stats count by OriginCityName OriginState | sort - count limit=30'),
            'app': utils.getCurrentApp(),
            'auto_cancel': 90,
            'status_buckets': 0,
            'preview': true,
            'wait': 0
        });
        new SearchManager({
            'id': 'carrier-search1',
            'search': mvc.tokenSafe('| inputlookup faa.demo.csv | head 100000 | search DestCityName="$cityName$" | chart count by AirlineDescription'),
            'app': utils.getCurrentApp(),
            'auto_cancel': 90,
            'status_buckets': 0,
            'preview': true,
            'wait': 0
        });

        new SearchManager({
            'id': 'single-search1',
            'search': mvc.tokenSafe('| inputlookup faa.demo.csv | head 100000 | search DestCityName="$cityName$" | stats count '),
            'app': utils.getCurrentApp(),
            'auto_cancel': 90,
            'status_buckets': 0,
            'preview': true,
        });

        var map = new MapView({
            'id' : 'map1',
            'managerid' : 'mapsearch',
            'mapping.map.fitBounds' : '(7.885147283424331,-148.7109375,61.3546135846894,-49.74609374999999)',
            'mapping.tileLayer.minZoom' : 3,
            'el' : $('#map-div')
        });

        var citySelectDropdown = new DropdownView({
            id: 'city-select-dropdown',
            default: 'Seattle, WA',
            valueField: 'DestCityName',
            managerid: 'city-select-search',
            value: mvc.tokenSafe('$cityName$'),
            el: $('#city-select-dropdown')
        }).render();

        var single1 = new SingleView({
            id: 'single1',
            managerid: 'single-search1',
            beforeLabel: 'Total arrivals',
            el: $('#single1')
        }).render();

        var bubble1 = new BubbleChart({
            id: 'bubble1',
            managerid: 'bubble-search',
            valueField: 'count',
            labelField: 'OriginCityName',
            categoryField: 'OriginState',
            height: 400,
            el: $('#bubble1')
        }).render();

        var carrierChart = new ChartView({
            id: 'carrier-chart1',
            managerid: 'carrier-search1',
            type: 'pie',
            el: $('#carrier-chart1')
        }).render();

        var carrierCitiesChart = new ChartView({
            id: 'carrier-cities',
            managerid: 'carrier-city-search',
            type: 'pie',
            el: $('#carrier-cities')
        }).render();

        var carrierCitiesTable = new TableView({
            id: 'carrier-cities-table',
            managerid: 'carrier-city-search',
            pageSize: 6,
            el: $('#carrier-cities-table')
        }).render();

        tokens.on('change:cityName', function(model, value, options) {
            $('.city-heading').text(value.split(',')[0]);
        });
        tokens.on('change:carrier', function(model, value, options) {
            $('.carrier-heading').text(value);
        });

        carrierChart.on('clicked:chart', function(e){
            e.preventDefault();
            tokens.set('carrier', (e.value));
        });

        carrierCitiesChart.on('clicked:chart', function(e){
            e.preventDefault();
            tokens.set('cityName', (e.value));
        });

        bubble1.on('click', function(e){
            tokens.set('cityName', e.name);
        });
    }
);