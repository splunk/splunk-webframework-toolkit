require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/timelineview',
    'splunkjs/mvc/radiogroupview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TimelineView,
        RadioGroupView
    ) {

        var mainSearch = new SearchManager({
            id: 'main-search',
            search: 'index=_internal earliest=-10m',
            preview: true,
            cache: 60,
            status_buckets: 300
        });

        var radio = new RadioGroupView({
            id: 'timeline-radio',
            default: 'yes',
            el: $('#timeline-radio')
        }).render();
        
        new TimelineView({
            id: 'timeline1',
            managerid: 'main-search',
            el: $('#timeline1')
        }).render();

        // Add our static choices
        radio.settings.set("choices", [
            {value: "yes", label: "Yes"},    
            {value: "no", label: "No"},
        ]);
        
        // Set up a handler for when the selection changes
        radio.on("change", function() {            
            // Set status buckets for the search
            mainSearch.search.set("status_buckets", radio.val() === "yes" ? 300 : 0);
        });   
    }
);