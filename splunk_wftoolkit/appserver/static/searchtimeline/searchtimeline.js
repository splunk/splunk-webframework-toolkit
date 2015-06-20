require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchcontrolsview',
    'splunkjs/mvc/timelineview',
    'splunkjs/mvc/eventsviewerview',
    'splunkjs/mvc/searchbarview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        SearchControlsView,
        TimelineView,
        EventsViewerView,
        SearchbarView
    ) {

        var defaultNamespace = mvc.Components.getInstance('default'); 

        new SearchManager({
            id: 'main-search',
            search: mvc.tokenSafe('$search$'),
            app: 'search',
            preview: true,
            required_field_list: '*',
            status_buckets: 300,
            earliest_time: mvc.tokenSafe('$timeRange.earliest_time$'),
            latest_time: mvc.tokenSafe('$timeRange.latest_time$')
        });

        new SearchbarView({
            id: 'main-searchbar',
            managerid: 'main-search',
            value: mvc.tokenSafe('$search$'),
            timerange_value: mvc.tokenSafe('$timeRange$'),
            el: $('#main-searchbar')
        }).render();

        new SearchControlsView({
            id: 'main-searchcontrols',
            managerid: 'main-search',
            el: $('#main-searchcontrols')
        }).render();

        new TimelineView({
            id: 'main-timeline',
            managerid: 'main-search',
            value: mvc.tokenSafe('$timeRange$'),
            el: $('#main-timeline')
        }).render();

        new EventsViewerView({
            id: 'main-events',
            managerid: 'main-search',
            drilldownRedirect: true,
            el: $('#main-events')
        }).render();
    }
);