require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/eventsviewerview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView,
        EventsViewerView
    ) {
      
        new SearchManager({
            id: 'example-search',
            search: 'index=_internal | head 100 | timechart count by sourcetype span=100s'
        });

        new SearchManager({
            id: 'example-event-search',
            search: 'index=_internal | head 3'
        });

        new TableView({
            id: 'example-table',
            managerid: 'example-search',
            pageSize: 5,
            el: $('#example-table')
        }).render();

        new EventsViewerView({
            id: 'example-eventsviewer',
            managerid: 'example-event-search',
            pageSize: 5,
            el: $('#example-eventsviewer')
        }).render();
        
    }
);