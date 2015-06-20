require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/sunburst/sample.txt',
    'text!splunk_wftoolkit/sunburst/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunkjs/mvc/multidropdownview',
    'splunk_wftoolkit/components/sunburst/sunburst'
    ], 
    function(
        $, 
        _, 
        mvc,
        VizTemplate,
        CodeSample,
        Usage,
        SearchManager,
        DropdownView,
        MultiDropdownView,
        Sunburst
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Sunburst', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup faa.demo.csv | stats count by OriginCityName OriginState | sort - count limit=15'
        });

        var sunburst = new Sunburst({
            id: 'example-sunburst',
            managerid: 'search1',
            valueField: 'count',
            categoryFields: 'OriginState OriginCityName',
            el: $('#example')
        }).render();

        var groupdd = new MultiDropdownView({
            id: 'group-dropdown',
            el: $('#group-dropdown')
        }).render();

        var sizedd = new DropdownView({
            id: 'size-dropdown',
            default: 'count',
            el: $('#size-dropdown')
        }).render();

        var labeldd = new DropdownView({
            id: 'label-dropdown',
            default: 'default',
            el: $('#label-dropdown')
        }).render();

        var tooltipdd = new DropdownView({
            id: 'tooltip-dropdown',
            default: 'default',
            el: $('#tooltip-dropdown')
        }).render();

        // Title logic
        // JIRA: Bring this back when title rotation is fixed (DVPL-1721)
        // var titleBox = mvc.Components.getInstance("chartTitle");
        // titleBox.on('change', function(){
        //     sunburst.settings.set('chartTitle', titleBox.val())
        // });

        // Groups
        var groupChoices = [
                            {label: "Origin State", value: "OriginState"},
                            {label: "Origin City Name", value: 'OriginCityName'},
                        ];

        groupdd.settings.set("choices", groupChoices);
        groupdd.val(['OriginState', 'OriginCityName']);
        groupdd.on("change", function(){
            sunburst.settings.set("categoryFields", groupdd.val().join(" "));
        });

        // Value
        var sizeChoices = [
            {label: "count", value: "count"},
            {label: "None", value: 'None'}
        ];
        sizedd.settings.set("choices", sizeChoices);
        sizedd.on("change", function(){
            if(sizedd.val()==='None'){
               sunburst.settings.set("valueField", null);
            }
            else{
               sunburst.settings.set("valueField", sizedd.val());
            }
        });

        // Format label dropdown logic
        var LABEL_FORMATTERS = {
            "default": _.identity,
            "truncate": function(name){
                if (name.length > 4 ) {
                    name = name.substring(0, 4) + "...";
                }
                return name;
            },
            "caps": function(name) {
                return name.toUpperCase();
            },
            "none": function(name) {
                return '';
            },
        };
        labeldd.settings.set({
        "choices": [
            {label: "Default", value: "default" },  
            {label: "Truncate", value: "truncate" },  
            {label: "All Caps", value: "caps" },
            {label: "None", value: "none" }
        ]
        });
        labeldd.on("change", function(val) {
            sunburst.settings.set("formatLabel", LABEL_FORMATTERS[val]); 
        });

        // Format tooltip dropdown logic
        var TOOLTIP_FORMATTERS = {
            "default": function(d) {
                return (d.name || "Total") + ": " + d.value;
            },
            "custom": function(d) { 
                return _.template("<%= name %> has value <%= value %>", d);
            }
        };
        tooltipdd.settings.set({
        "choices": [
            {label: "Default", value: "default" },  
            {label: "Custom", value: "custom" }
        ]
        });
        tooltipdd.on("change", function(val) {
            sunburst.settings.set("formatTooltip", TOOLTIP_FORMATTERS[val]); 
        });
    }
);