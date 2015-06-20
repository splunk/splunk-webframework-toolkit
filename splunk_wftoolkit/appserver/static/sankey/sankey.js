require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/sankey/code_example.txt',
    'text!splunk_wftoolkit/sankey/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/sankey/sankey'
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
        SankeyChart
    ) {
                var pageContent = _.template(
                    VizTemplate, 
                    {
                        heading: 'Sankey Chart', 
                        usage: Usage, 
                        codesample: CodeSample
                    }
                );
                $('#wide-content').append(pageContent);

                new SearchManager({
                    id: 'sankey-search',
                    search: '| inputlookup faa.demo.csv | search DestCityName=* OriginCityName=* AND DestCityName!="" AND OriginCityName!="" | head 100 | stats count by OriginCityName DestCityName'
                });

                var sankey = new SankeyChart({
                    id: 'sankey-chart',
                    managerid: 'sankey-search',
                    el: $('#example')
                }).render();

                var formatLabelDropdown = new DropdownView({
                    id: 'format-name',
                    default: 'default',
                    el: $('#format-name')
                }).render();

                var formatTooltipDropdown = new DropdownView({
                    id: 'format-tooltip',
                    default: 'default',
                    el: $('#format-tooltip')
                }).render();
                
                var NAME_FORMATTERS = {
                    "default": _.identity,
                    "state": function(name) { 
                        return name.split(", ")[1];
                    },
                    "caps": function(name) {
                        return name.toUpperCase();
                    }
                };
                
                var TOOLTIP_FORMATTERS = {
                    "default": function(d) {
                        return (d.source.name + ' -> ' + d.target.name +
                                ': ' + d.value); 
                    },
                    "custom": function(d) { 
                        return _.template("From <%= source.name %> to <%= target.name %>: <%= value %>", d);
                    }
                };
                
                sankey.settings.set({
                    'formatLabel': NAME_FORMATTERS['default']
                });
                
                formatLabelDropdown.settings.set({
                    "choices": [
                        {label: "Default", value: "default" },  
                        {label: "States", value: "state" },  
                        {label: "All Caps", value: "caps" }
                    ]
                });
                formatLabelDropdown.on("change", function(val) {
                    sankey.settings.set("formatLabel", NAME_FORMATTERS[val]); 
                });
                
                formatTooltipDropdown.settings.set({
                    "choices": [
                        {label: "Default", value: "default" },  
                        {label: "Custom", value: "custom" }
                    ]
                });
                formatTooltipDropdown.on("change", function(val) {
                    sankey.settings.set("formatTooltip", TOOLTIP_FORMATTERS[val]); 
                });

                sankey.on("click:link", function(e){
                    console.log("Link click");
                    console.log(e);
                });
                sankey.on("click:node", function(e){
                    console.log("Node click");
                    console.log(e);
                });
    }
);