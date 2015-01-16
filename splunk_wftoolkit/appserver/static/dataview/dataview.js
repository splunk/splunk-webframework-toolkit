define([
    'jquery', 
    'underscore', 
    'prettify', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/datatemplateview'
    ], 
    function(
        $, 
        _, 
        prettyPrint,
        mvc,
        SearchManager,
        DataTemplateView
    ) {
        return {
            render: function() {
                new SearchManager({
                    id: 'example-single-search',
                    search: 'index=_internal | stats count | rangemap field=count low=0-3 elevated=3-6 severe=6-10 default=severe',
                    earliest_time: '-15m',
                    latest_time: 'now'
                });

                new SearchManager({
                    id: 'search-top-song-downloads',
                    search: '| inputlookup musicdata.csv | search bc_uri=/sync/addtolibrary/* | stats count by track_name | sort count desc | table track_name count',
                    cache: true
                });

                new DataTemplateView({
                    id: 'single-search-example',
                    managerid: 'example-single-search',
                    template: '<div class="example-1">Event Count: <%= results[0].count %>. Status: <%= results[0].range %></div>',
                    el: $('#single-search-example')
                }).render();

                new DataTemplateView({
                    id: 'table-top-song-downloads',
                    managerid: 'search-top-song-downloads',
                    template: $('#search-top-song-template').html(),
                    el: $('#search-top-song-table')
                }).render();
            }
        }
    }
);