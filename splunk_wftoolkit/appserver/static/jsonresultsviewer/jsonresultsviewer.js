require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunk_wftoolkit/components/resultsview/resultsview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        SearchbarView,
        ResultsView
    ) {

        var search1 = new SearchManager({
            id: 'search1',
            search: 'index=_internal | head 10',
        });

        var searchbar1 = new SearchbarView({
            id: 'searchbar1',
            managerid: 'search1',
            el: $('#searchbar1')
        }).render();

        var resultsView = new ResultsView({
            id: 'resultsview',
            managerid: 'search1',
            number: 10,
            el: $('#resultsview')
        }).render();

        searchbar1.on('change', function() { 
          search1.set('search', searchbar1.val());
        });
        $('#console-spill').on('click', function(){
            console.log(resultsView.getData());
        });   
    }
);