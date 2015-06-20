require([
    'jquery', 
    'underscore', 
    'splunkjs/ready!', 
    'text!splunk_wftoolkit/vizpagetemplate.tmpl',
    'text!splunk_wftoolkit/punchcard/sample.txt',
    'text!splunk_wftoolkit/punchcard/usage.html',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'splunk_wftoolkit/components/punchcard/punchcard'
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
        Punchcard
    ) {
        var pageContent = _.template(
            VizTemplate, 
            {
                heading: 'Punchcard', 
                usage: Usage, 
                codesample: CodeSample
            }
        );
        $('#wide-content').append(pageContent);

        new SearchManager({
            id: 'search1',
            search: '| inputlookup month.csv | fields date_wday sourcetype count'
        });

        var punchcard = new Punchcard({
            id: 'punchcard1',
            managerid: 'search1',
            height: 500,
            el: $('#example')
        }).render();

        var formatXDropdown = new DropdownView({
            id: 'format-x-axis',
            default: 'default',
            el: $('#format-x-axis')
        }).render();

        var formatYDropdown = new DropdownView({
            id: 'format-y-axis',
            default: 'default',
            el: $('#format-y-axis')
        }).render();

        var formatCountDropdown = new DropdownView({
            id: 'format-counts',
            default: 'default',
            el: $('#format-counts')
        }).render();

        // X-Axis formatter logic
        var X_FORMATTERS = {
            'default': _.identity,
            'caps': function(d) {
                return d.toUpperCase();
            }
        };
        formatXDropdown.settings.set({
            "choices": [
                {label: "Default", value: "default" },  
                {label: "Caps", value: "caps" },  
            ]
        });
        formatXDropdown.on("change", function(val) {
            punchcard.settings.set("formatXAxisLabel", X_FORMATTERS[val]); 
        });
        
        // Y-Axis formatter logic
        var Y_FORMATTERS = {
            'default': function(str) {
                maxLength = 25;
                suffix = '...';
                if (str.length > maxLength) {
                    str = str.substring(0, maxLength + 1); 
                    str = str + suffix;
                }
                return str;
            },
            'short': function(str) {
                maxLength = 5;
                suffix = '...';
                if (str.length > maxLength) {
                    str = str.substring(0, maxLength + 1); 
                    str = str + suffix;
                }
                return str;
            }
        };
        formatYDropdown.settings.set({
            "choices": [
                {label: "Default", value: "default" },  
                {label: "Short", value: "short" },  
            ]
        });
        formatYDropdown.on("change", function(val) {
            punchcard.settings.set("formatYAxisLabel", Y_FORMATTERS[val]); 
        });

        // Count formatter logic
        var COUNT_FORMATTERS = {
            'default': function(str) {
                var value = d[1]; 
                if (value > 1000) {
                    value = Math.round((value / 1000)) + 'K';
                }
                return value;
            },
            'money': function(d) {
                var value = d[1]; 
                if (value > 1000) {
                    value = Math.round((value / 1000)) + 'K';
                }
                return '$' + value;
            }
        };
        formatCountDropdown.settings.set({
            "choices": [
                {label: "Default", value: "default" },  
                {label: "Money", value: "money" },  
            ]
        });
        formatCountDropdown.on("change", function(val) {
            punchcard.settings.set("formatCount", COUNT_FORMATTERS[val]); 
        });
    }
);