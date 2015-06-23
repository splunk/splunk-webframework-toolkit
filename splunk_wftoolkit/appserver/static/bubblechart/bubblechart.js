require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/bubblechart/sample.txt',
    'text!splunk_wftoolkit/bubblechart/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/bubblechart/bubblechart',
    'css!splunk_wftoolkit/bubblechart/bubblechart.css'
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
        BubbleChart
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Bubble Chart', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup faa.demo.csv | stats count by OriginCityName OriginState cancellation | sort - count'
        });

        var bubbles = new BubbleChart({
            id: 'bubble1',
            managerid: 'search1',
            valueField: 'count',
            labelField: 'OriginCityName',
            categoryField: 'OriginState',
            el: $('#example')
        }).render();

        var valuedd = new DropdownView({
            id: 'value-dropdown',
            default: 'count',
            el: $('#value-dropdown')
        }).render();

        var namedd = new DropdownView({
            id: 'name-dropdown',
            default: 'OriginCityName',
            el: $('#name-dropdown')
        }).render();

        var categorydd = new DropdownView({
            id: 'category-dropdown',
            default: 'OriginState',
            el: $('#category-dropdown')
        }).render();

        var formatLabelDropdown = new DropdownView({
            id: 'formatLabelDropdown',
            default: 'default',
            el: $('#formatLabelDropdown')
        }).render();

        var formatTooltipDropdown = new DropdownView({
            id: 'formatTooltipDropdown',
            default: 'default',
            el: $('#formatTooltipDropdown')
        }).render();

        var valueChoices = [
                            {label: "Count", value: "count"},
                            {label: "Bogus Value", value: "bogus"},
                        ];
        valuedd.settings.set("choices", valueChoices);
        valuedd.on("change", function(){
            bubbles.settings.set("valueField", valuedd.val());
        });

        var categoryChoices = [
                            {label: "Origin City", value: "OriginCityName"},
                            {label: "Origin State", value: "OriginState"},
                            {label: "Cancellation Cause", value: "cancellation"}
                        ];

        categorydd.settings.set("choices", categoryChoices);
        categorydd.on("change", function(){
            bubbles.settings.set("categoryField", categorydd.val());
        });

        var nameChoices = categoryChoices;
        namedd.settings.set("choices", nameChoices);
        namedd.on("change", function(){
            bubbles.settings.set("labelField", namedd.val());
        });

        bubbles.on("click", function(e){
            console.log("Click Event");
            console.log(e);
        });

        // Format label logic
        var LABEL_FORMATTERS = {
            "default": function(d) { 
                var format = d3.format(",d");
                return d.className + " " + format(d.value); 
            },
            "state": function(d) { 
                return d.className.split(", ")[1];
            },
            "caps": function(d) {
                return d.className.toUpperCase();
            }
        };
        bubbles.settings.set({
            'formatLabel': LABEL_FORMATTERS['default']
        });
        
        formatLabelDropdown.settings.set({
            "choices": [
                {label: "Default", value: "default" },  
                {label: "States", value: "state" },  
                {label: "All Caps", value: "caps" }
            ]
        });
        formatLabelDropdown.on("change", function(val) {
            bubbles.settings.set("formatLabel", LABEL_FORMATTERS[val]); 
        });

        // Tooltip formatter logic
        var TOOLTIP_FORMATTERS = {
            "default": function(d) {
                var text;
                if(d.className === undefined || d.className === ""){
                    text = "Event: " + d.value;
                } else {
                    text = d.className+": " + d.value;
                }
                return text;
            },
            "custom": function(d) { 
                return _.template("<%= className %> has a value of <%= value %>", d);
            }
        };
        formatTooltipDropdown.settings.set({
        "choices": [
            {label: "Default", value: "default" },  
            {label: "Custom", value: "custom" }
        ]
        });
        formatTooltipDropdown.on("change", function(val) {
            bubbles.settings.set("formatTooltip", TOOLTIP_FORMATTERS[val]); 
        }); 
});