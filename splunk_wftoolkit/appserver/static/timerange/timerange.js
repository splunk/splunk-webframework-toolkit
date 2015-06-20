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

        var timerange1 = new TimerangeView({
            id: 'timerange1',
            managerid: 'search1',
            el: $('#timerange1')
        }).render();

        var single1 = new SingleView({
            id: 'single1',
            managerid: 'search1',
            beforeLabel: '_internal event Count: ',
            el: $('#single1')
        }).render();

        var timerange2 = new TimerangeView({
            id: 'timerange2',
            managerid: 'search2',
            el: $('#timerange2')
        }).render();

        var single2 = new SingleView({
            id: 'single2',
            managerid: 'search2',
            beforeLabel: '_audit event Count: ',
            el: $('#single2')
        }).render();

        timerange1.on("change", function() {
            search1.search.set(timerange1.val());
        });
        
        timerange2.on("change", function() {
            search2.search.set(timerange2.val());
        });
    }
);