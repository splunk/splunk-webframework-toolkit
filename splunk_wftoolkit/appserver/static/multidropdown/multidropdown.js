require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/multidropdownview',
    'splunkjs/mvc/eventsviewerview'
    ], 
    function(
        $, 
        _, 
        mvc,
        SearchManager,
        TableView,
        MultiDropdownView,
        EventsViewerView
    ) {

        var defaultNamespace = mvc.Components.getInstance("default"); 

        new SearchManager({
            id: 'sourceTypeSearch',
            search: 'index=_internal | head 5000 | stats count by sourcetype'
        });

        new SearchManager({
            id: 'fieldsSearch',
            search: 'index=_internal | head 5000 | fieldsummary | where count>3000',
            rf: '*'
        });

        new SearchManager({
            id: 'rt-search',
            search: 'index=_internal | head 5000',
            rf: '*'
        });

        new SearchManager({
            id: 'et-search',
            search: mvc.tokenSafe('index=_internal | head 5000 | search $sourceTypes$'),
            rf: '*'
        });

        var multidropdown1 = new MultiDropdownView({
            id: 'multidropdown1',
            managerid: 'sourceTypeSearch',
            valueField: 'sourcetype',
            el: $('#multidropdown1')
        }).render();

        var rt1 = new TableView({
            id: 'rt1',
            managerid: 'rt-search',
            fields: '_time sourcetype',
            el: $('#rt1')
        }).render();

        var multidropdown2 = new MultiDropdownView({
            id: 'multidropdown2',
            managerid: 'fieldsSearch',
            valueField: 'field',
            el: $('#multidropdown2')
        }).render();

        var multidropdown3 = new MultiDropdownView({
            id: 'multidropdown3',
            managerid: 'sourceTypeSearch',
            valueField: 'sourcetype',
            el: $('#multidropdown3')
        }).render();

        var et1 = new EventsViewerView({
            id: 'et1',
            managerid: 'et-search',
            count: '4',
            el: $('#et1')
        }).render();

        var selectionText = $("#dropdown1-text");
        multidropdown1.on("change", function() {
            selectionText.text(multidropdown1.val().join(", "));
        });
        
        multidropdown2.on("change", function() {    
            var newFields = _.union(["_time", "sourcetype"], multidropdown2.val());
            rt1.settings.set("fields", newFields);
        });

        multidropdown3.on("change", function() {
            var sourceTypeString = multidropdown3.val().join(' OR ');
            defaultNamespace.set("sourceTypes", sourceTypeString);
        }); 
    }
);