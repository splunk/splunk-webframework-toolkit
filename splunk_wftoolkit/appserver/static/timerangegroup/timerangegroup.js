require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/timerangeview',
    'splunkjs/mvc/singleview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TimerangeView,
        SingleView
    ) {

        var search1 = new SearchManager({
            id: 'search1',
            search: 'index=_internal | stats count',
            preview: true,
            cache: true,
            status_buckets: 0,
            auto_finalize_ec: 100000
        });

        var search2 = new SearchManager({
            id: 'search2',
            search: 'index=_audit | stats count',
            preview: true,
            cache: true,
            status_buckets: 0,
            auto_finalize_ec: 100000
        });

        var timerange = new TimerangeView({
            id: 'timerange',
            managerid: 'search1',
            preset: 'Last 15 minutes',
            el: $('#timerange')
        }).render();

        var single1 = new SingleView({
            id: 'single1',
            managerid: 'search1',
            underLabel: 'Internal Events',
            el: $('#single1')
        }).render();

         var single2 = new SingleView({
            id: 'single2',
            managerid: 'search2',
            underLabel: 'Audit Events',
            el: $('#single2')
        }).render();
        
        timerange.on("change", function() {
            search1.search.set(timerange.val());
            search2.search.set(timerange.val());
        });
    }
);