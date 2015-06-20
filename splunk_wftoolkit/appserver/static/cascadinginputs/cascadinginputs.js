require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/singleview',
    'splunkjs/mvc/dropdownview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        SingleView,
        DropdownView
    ) {

        var tokens = mvc.Components.getInstance("default");

        var simpleSearch1 = new SearchManager({
            id: 'simplesearch1',
            search: mvc.tokenSafe('index=$index$ sourcetype=$sourcetype$ earliest=-5m | stats count'),
            preview: true,
            cache: 60,
            status_buckets: 300,
            autostart: false
        });

        new SearchManager({
            id: 'indexsearch',
            search: '| eventcount summarize=false index=* OR index=_*',
            preview: false,
            cache: true,
        });

        var sourcetypeSearch = new SearchManager({
            id: 'sourcetypesearch',
            search: mvc.tokenSafe('| metadata index=$index$ OR index=_$index$ type=sourcetypes'),
            preview: true,
            cache: true,
            autostart: false
        });

        var indexes = new DropdownView({
            id: 'indexes',
            managerid: 'indexsearch',
            default: '*',
            valueField: 'index',
            el: $('#indexes')
        }).render();

        var sourcetypes = new DropdownView({
            id: 'sourcetypes',
            managerid: 'sourcetypesearch',
            valueField: 'sourcetype',
            el: $('#sourcetypes')
        }).render();

        var single = new SingleView({
            id: 'singlevalue',
            managerid: 'simplesearch1',
            beforeLabel: 'Event Count: ',
            el: $('#singlevalue')
        }).render();

        // Add "all" choices to
        indexes.settings.set("choices", [
            {value: "*", label: "(all)"}    
        ]);
        sourcetypes.settings.set("choices", [
            {value: "*", label: "(all)"}    
        ]);
        
        // Set up a handler for when the selection changes
        indexes.on("change", function() {
            if (!indexes.val()) {
                return;   
            }
            
            // Set the tokens for both managers
            tokens.set("index", indexes.val());
            
            // Start the searches
            sourcetypeSearch.startSearch();
        });
        
        $("#searchbutton").on("click", function() {
            tokens.set({
                index: indexes.val(),
                sourcetype: sourcetypes.val()
            });
            
            simpleSearch1.startSearch();
        });
    }
);