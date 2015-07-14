require([
    'jquery',
    'underscore',
    'splunkjs/ready!',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/searchcontrolsview',
    'splunkjs/mvc/timerangeview',
    'splunkjs/mvc/timelineview',
    'splunkjs/mvc/singleview',
    'css!splunk_wftoolkit/searchcontrols/searchcontrols.css'
    ],
    function(
        $,
        _,
        mvc,
        SearchManager,
        SearchBarView,
        TableView,
        SearchControlsView,
        TimerangeView,
        TimelineView,
        SingleView
    ) {

        new SearchManager({
            id: 'example-bar-search',
            search: 'index=_internal | head 100'
        });

        new SearchManager({
            id: 'example-searchcontrols-search',
            search: 'index=_internal | head 100'
        });

        new SearchManager({
            id: 'timerange-search',
            search: 'index=_internal | stats count'
        });

        new SearchManager({
            id: 'example-timeline-search',
            search: 'index=_internal | head 1000',
            preview: true,
            status_buckets: 300
        });

        // Search bar sample
        new SearchBarView({
            id: 'example-search-bar',
            managerid: 'example-bar-search',
            el: $('#example-search-bar')
        }).render();

        new TableView({
            id: 'bar-table',
            managerid: 'example-bar-search',
            el: $('#bar-table')
        }).render();

        // Search controls sample
        new SearchBarView({
            id: 'searchcontrols-searchbar',
            managerid: 'example-searchcontrols-search',
            el: $('#searchcontrols-searchbar')
        }).render();

        new SearchControlsView({
            id: 'example-searchcontrols',
            managerid: 'example-searchcontrols-search',
            pageSize: 5,
            el: $('#example-searchcontrols')
        }).render();

        new TableView({
            id: 'searchcontrols-table',
            managerid: 'example-searchcontrols-search',
            pageSize: 5,
            el: $('#searchcontrols-table')
        }).render();

        // Timeline sample
        new TimerangeView({
            id: 'timeline-timerange',
            managerid: 'example-timeline-search',
            el: $('#timeline-timerange')
        }).render();

        new TimelineView({
            id: 'example-timeline',
            managerid: 'example-timeline-search',
            el: $('#example-timeline')
        }).render();

        new TableView({
            id: 'timeline-table',
            managerid: 'example-timeline-search',
            pageSize: 5,
            el: $('#timeline-table')
        }).render();

        // Timerange sample
        new TimerangeView({
            id: 'example-timerange',
            managerid: 'timerange-search',
            preset: 'Last 24 hours',
            el: $('#example-timerange')
        }).render();

        new SingleView({
            id: 'timerange-single',
            managerid: 'timerange-search',
            afterLabel: 'events',
            el: $('#timerange-single')
        }).render();

        // Timeline, TimeRange and Table sample
        (function() {
            var manager = splunkjs.mvc.Components.getInstance("example-timeline-search");
            var timerange = splunkjs.mvc.Components.getInstance("timeline-timerange");
            var timeline = splunkjs.mvc.Components.getInstance("example-timeline");

            timerange.on("change", function() {
                manager.search.set(timerange.val());
            });

            timeline.on("change", function() {
                manager.search.set(timeline.val());
            });
        })();

        // Search controls sample
        (function() {
            var manager = splunkjs.mvc.Components.getInstance("example-searchcontrols-search");
            var searchbar = splunkjs.mvc.Components.getInstance("searchcontrols-searchbar");
            var searchcontrols = splunkjs.mvc.Components.getInstance("example-searchcontrols");

            searchbar.on("change", function() {
                manager.set("search", searchbar.val());
            });
        })();


        // Search bar sample
        (function() {
            var manager = splunkjs.mvc.Components.getInstance("example-bar-search");
            var searchbar = splunkjs.mvc.Components.getInstance("example-search-bar");
            var timerange = searchbar.timerange;

            searchbar.on("change", function() {
                manager.set("search", searchbar.val());
            });

            timerange.on("change", function() {
                manager.search.set(timerange.val());
            });
        })();

        // Time range input sample
        (function() {
            var manager = splunkjs.mvc.Components.getInstance("timerange-search");
            var timerange = splunkjs.mvc.Components.getInstance("example-timerange")

            timerange.on("change", function() {
                manager.search.set(timerange.val());
            });
        })();
    }
);
