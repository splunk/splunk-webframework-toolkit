require([
    'jquery',
    'underscore',
    'prettify',
    'splunkjs/ready!',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/datatemplateview'
], function($, _, prettyPrint, mvc, SearchManager, DataTemplateView) {

    new SearchManager({
        id: 'example-single-search',
        search: 'index=_internal | stats count | rangemap field=count low=0-3 elevated=3-6 severe=6-10 default=severe',
        earliest_time: '-15m',
        latest_time: 'now'
    });

    new DataTemplateView({
        id: 'single-search-example',
        managerid: 'example-single-search',
        template: '<div class="example-1">Event Count: <%= results[0].count %>. Status: <%= results[0].range %></div>',
        el: $('#single-search-example')
    }).render();

});
