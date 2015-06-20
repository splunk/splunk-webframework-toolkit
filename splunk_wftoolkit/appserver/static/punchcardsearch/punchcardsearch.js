require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/searchbarview',
    'splunk_wftoolkit/components/punchcard/punchcard'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        SearchbarView,
        Punchcard
    ) {

        var search1 = new SearchManager({
            id: 'search1',
            search: mvc.tokenSafe('$search$'),
        });

        new SearchbarView({
            id: 'searchbar1',
            managerid: 'search1',
            value: mvc.tokenSafe('$search$'),
            default: 'index=_internal | head 300000 | stats count by date_hour sourcetype',
            el: $('#searchbar1')
        }).render();

        
        var formatHours = function(x) {
            var parsed = parseInt(x, 10);
            if (x < 12) { 
                return (x === 0 ? 12 : x) + "AM";
            }
            else {
                return (x === 12 ? 12 : x-12) + "PM";
            }
        };

        var search1 = mvc.Components.getInstance('search1');

        var pc = new Punchcard({
            id: 'pc1',
            managerid: 'search1',
            formatXAxisLabel: formatHours,
            height: 300,
            el: $('#hook')
        }).render();
    }
);