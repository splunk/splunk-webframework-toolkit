define([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/singleview',
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView,
        SingleView
    ) {
        return {
            render: function() {

                var tokens = mvc.Components.getInstance("default");

                new SearchManager({
                    id: 'simplesearch1',
                    search: '| eventcount summarize=false index=* OR index=_* | table index count',
                    cache: true,
                    preview: true,
                    autostart: true
                });

                var simpleSearch2 = new SearchManager({
                    id: 'simplesearch2',
                    search: mvc.tokenSafe('| eventcount summarize=false index=$index$ | table count'),
                    cache: true,
                    preview: true,
                    autostart: false
                });

                var table1 = new TableView({
                    id: 'table1',
                    managerid: 'simplesearch1',
                    el: $('#table1')
                }).render();

                var single1 = new SingleView({
                    id: 'single1',
                    managerid: 'simplesearch2',
                    beforeLabel: 'Event Count: ',
                    el: $('#single1')
                }).render();

                // Set the index whenever the table is click
                table1.on("click:row", function(e) {
                    e.preventDefault();
                    
                    var index = e.model.get("index");
                    
                    tokens.set("index", index);
                    simpleSearch2.startSearch();
                });  
            }
        }
    }
);